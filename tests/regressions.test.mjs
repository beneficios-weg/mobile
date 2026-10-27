import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

// Use the existing compiler for pure TS modules and their local dependencies.
// No test framework or additional runtime TypeScript loader is required.
const compiledModules = new Map()
async function moduleURL(url) {
  if (compiledModules.has(url.href)) return compiledModules.get(url.href)
  const source = await readFile(url, 'utf8')
  let { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.ESNext },
  })
  for (const [, specifier] of [...outputText.matchAll(/from ['"]([^'"]+)['"]/g)]) {
    if (!specifier.startsWith('.')) throw new Error(`Unexpected external dependency in pure module: ${specifier}`)
    const dependency = await moduleURL(new URL(specifier.endsWith('.ts') ? specifier : `${specifier}.ts`, url))
    outputText = outputText.replaceAll(`from '${specifier}'`, `from '${dependency}'`).replaceAll(`from "${specifier}"`, `from "${dependency}"`)
  }
  const result = `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
  compiledModules.set(url.href, result)
  return result
}
async function loadTypeScript(relativePath) {
  return import(await moduleURL(new URL(relativePath, import.meta.url)))
}

const { filterFavorites, previewFavorites, previewFavoritesLocation } = await loadTypeScript('../src/pages/favorites.ts')
const { demoBenefits } = await loadTypeScript('../src/services/benefitsService.ts')
const { fitDescription } = await loadTypeScript('../src/lib/benefitDescriptionMotion.ts')
const { resolveRoute, categoryPath, establishmentPath, isInternalPath, routes } = await loadTypeScript('../src/lib/routes.ts')
const { categories, previewCatalog, homePlaces, previewVisitedPlaces, favoriteExamples, findCategory, findPlace, establishmentDetails } = await loadTypeScript('../src/pages/catalog.ts')

test('preview map datasets have unique IDs and coordinates inside the map bounds', () => {
  for (const places of [previewFavorites, demoBenefits]) {
    assert.equal(new Set(places.map(place => place.id)).size, places.length)
    for (const place of places) {
      assert(place.latitude >= -45 && place.latitude <= 10)
      assert(place.longitude >= -78 && place.longitude <= -34)
    }
  }
})

test('favorites preview location belongs to the same map region as its pins', () => {
  for (const place of previewFavorites) {
    assert(Math.abs(place.latitude - previewFavoritesLocation.latitude) < 0.1)
    assert(Math.abs(place.longitude - previewFavoritesLocation.longitude) < 0.1)
  }
})

test('favorite search normalizes accents, capitalization and outer whitespace', () => {
  assert.equal(filterFavorites(previewFavorites, '  OTICA  ', []).length, 2)
  assert.equal(filterFavorites(previewFavorites, 'VILA NOVA', []).length, 2)
  assert.equal(filterFavorites(previewFavorites, '20% off', []).length, 2)
  assert.deepEqual(filterFavorites(previewFavorites, 'inexistente', []), [])
})

test('sorting honors criteria and does not mutate the original dataset', () => {
  const original = structuredClone(previewFavorites)
  const byDiscount = filterFavorites(previewFavorites, '', ['discount', 'nearest'])
  assert.equal(byDiscount[0].discount, 20)
  assert(byDiscount[0].distanceKm < byDiscount[1].distanceKm)
  const ascending = filterFavorites(previewFavorites, '', ['name-asc'])
  const descending = filterFavorites(previewFavorites, '', ['name-desc'])
  assert.equal(ascending[0].name, descending.at(-1).name)
  assert.deepEqual(previewFavorites, original)
})

test('default order is nearest and missing operating hours do not imply open', () => {
  const nearest = filterFavorites([...previewFavorites].reverse(), '', [])
  assert(nearest.every((place, index) => !index || place.distanceKm >= nearest[index - 1].distanceKm))
  const withoutHours = [{ ...previewFavorites[0], openingHours: undefined }]
  assert.deepEqual(filterFavorites(withoutHours, '', ['open-now'], new Date(2026, 9, 26, 12)), [])
})

test('open-now includes opening time and excludes closing time and closed weekdays', () => {
  const places = [{ ...previewFavorites[0], openingHours: { days: [1], opensAt: '06:00', closesAt: '22:00' } }]
  assert.equal(filterFavorites(places, '', ['open-now'], new Date(2026, 9, 26, 6)).length, 1)
  assert.equal(filterFavorites(places, '', ['open-now'], new Date(2026, 9, 26, 22)).length, 0)
  assert.equal(filterFavorites(places, '', ['open-now'], new Date(2026, 9, 27, 12)).length, 0)
})

test('benefit summaries preserve whole words and leave fitting text unchanged', () => {
  const measureWidth = value => value.length
  assert.equal(fitDescription('texto curto', 50, measureWidth), 'texto curto')
  assert.equal(fitDescription('um texto completo', 12, measureWidth), 'um texto...')
  assert.equal(fitDescription('palavra', 0, measureWidth), '...')
})

test('fixed routes and category links resolve to their intended destinations', () => {
  for (const [kind, path] of Object.entries(routes)) assert.equal(resolveRoute(path).kind, kind)
  for (const category of categories) {
    const route = resolveRoute(categoryPath(category.slug))
    assert.equal(route.kind, 'category')
    assert.equal(findCategory(route.parameter).label, category.label)
  }
})

test('route parsing handles trailing slashes and queries without falling back to home', () => {
  assert.equal(resolveRoute('/visitados/?teste=1#topo').kind, 'visited')
  assert.equal(resolveRoute('/categoria/saude-e-bem-estar/').parameter, 'saude-e-bem-estar')
  assert.equal(resolveRoute('/estabelecimento/clube%20de%20idiomas').parameter, 'clube de idiomas')
  assert.equal(resolveRoute('/estabelecimento/%ZZ').kind, 'not-found')
  assert.equal(resolveRoute('/nao-existe').kind, 'not-found')
  assert.equal(findCategory('nao-existe'), undefined)
  assert.equal(findPlace('nao-existe'), undefined)
})

test('internal navigation rejects external and ambiguous targets', () => {
  for (const value of ['https://example.com', '//example.com', '/\\example.com', 'javascript:alert(1)', '/\nexterno', '', null]) {
    assert.equal(isInternalPath(value), false)
  }
  for (const value of ['/', '/favoritos', '/categoria/educacao', '/visitados?filtro=teste']) assert.equal(isInternalPath(value), true)
})

test('each navigable fixture has a unique identity and its own correct details', () => {
  assert.equal(new Set(previewCatalog.map(place => place.id)).size, previewCatalog.length)
  for (const place of previewCatalog) {
    const route = resolveRoute(establishmentPath(place.id))
    const found = findPlace(route.parameter)
    assert.equal(found.id, place.id)
    const details = establishmentDetails(found)
    assert.equal(details.name, place.name)
    assert.equal(details.latitude, place.latitude)
    assert.equal(details.longitude, place.longitude)
    if (place.id !== 'move') assert.equal(details.contact, '')
  }
  assert.equal(findPlace('academia-move').id, 'move', 'Existing direct detail URL remains supported')
})

test('home and visited cards reference the catalog and favorites do not define visits', () => {
  for (const place of [...homePlaces, ...previewVisitedPlaces]) assert.equal(findPlace(place.id).name, place.name)
  assert.equal(previewVisitedPlaces.length, 8)
  assert(favoriteExamples.every(place => !previewVisitedPlaces.some(visited => visited.id === place.id)))
})
