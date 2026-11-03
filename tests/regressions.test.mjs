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
const { parseDrivingRoute, parseRouteOptions, maneuverInstruction, formatRouteDistance, formatRouteDuration } = await loadTypeScript('../src/lib/directions.ts')
const { getDrivingRoute, getRouteOptions } = await loadTypeScript('../src/services/routingService.ts')

const routingResponse = () => ({ code: 'Ok', routes: [{ distance: 1250, duration: 300,
  geometry: { coordinates: [[-48.85, -26.30], [-48.8464, -26.3043]] },
  legs: [{ steps: [
    { name: 'Rua de teste', distance: 1250, maneuver: { type: 'depart', location: [-48.85, -26.30] } },
    { name: '', distance: 0, maneuver: { type: 'arrive', location: [-48.8464, -26.3043] } },
  ] }],
}] })

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

test('driving routes convert GeoJSON order, preserve metrics and generate Portuguese steps', () => {
  const result = parseDrivingRoute(routingResponse())
  assert.deepEqual(result.coordinates, [[-26.30, -48.85], [-26.3043, -48.8464]])
  assert.equal(result.distanceMeters, 1250)
  assert.equal(result.durationSeconds, 300)
  assert.equal(result.steps[0].instruction, 'Siga em Rua de teste')
  assert.deepEqual(result.steps[0].location, { latitude: -26.30, longitude: -48.85 })
  assert.equal(result.steps[1].instruction, 'Chegue ao destino')
})

test('invalid, missing and unavailable routes are rejected instead of drawing a straight line', () => {
  for (const code of ['NoRoute', 'NoSegment', 'InvalidQuery']) assert.throws(() => parseDrivingRoute({ code }))
  for (const update of [r => r.routes = [], r => r.routes[0].distance = -1,
    r => r.routes[0].duration = null, r => r.routes[0].geometry.coordinates = [],
    r => r.routes[0].geometry.coordinates[0] = [999, 0], r => r.routes[0].geometry.coordinates[0] = ['0', '0']]) {
    const response = routingResponse();update(response)
    assert.throws(() => parseDrivingRoute(response))
  }
  assert.throws(() => parseDrivingRoute(null))
})

test('driving instructions handle turns, returns, roundabouts, ramps and unknown maneuvers', () => {
  assert.match(maneuverInstruction('turn', 'left', 'Rua A'), /esquerda em Rua A/)
  assert.match(maneuverInstruction('turn', 'slight right'), /levemente à direita/)
  assert.match(maneuverInstruction('continue', 'uturn'), /retorno/)
  assert.match(maneuverInstruction('roundabout', 'right', 'Rua B', 3), /3ª saída em Rua B/)
  assert.match(maneuverInstruction('off ramp', 'right'), /saída à direita/)
  assert.equal(maneuverInstruction('unknown'), 'Continue em frente')
})

test('route summaries format meters, kilometers, minutes and hours in Portuguese', () => {
  assert.equal(formatRouteDistance(450), '450 m')
  assert.equal(formatRouteDistance(1250), '1,3 km')
  assert.equal(formatRouteDuration(0), '1 min')
  assert.equal(formatRouteDuration(300), '5 min')
  assert.equal(formatRouteDuration(3600), '1 h')
  assert.equal(formatRouteDuration(3660), '1 h 1 min')
})

test('routing service requests driving geometry and steps for the actual origin and destination', async t => {
  let url
  t.mock.method(globalThis, 'fetch', async input => { url = input;return new Response(JSON.stringify(routingResponse())) })
  const route = await getDrivingRoute({ latitude: -26.3, longitude: -48.85 }, { latitude: -26.3043, longitude: -48.8464 })
  assert.match(url, /\/route\/v1\/driving\/-48.85,-26.3;-48.8464,-26.3043\?/)
  assert.equal(new URL(url).searchParams.get('steps'), 'true')
  assert.equal(new URL(url).searchParams.get('geometries'), 'geojson')
  assert.equal(route.distanceMeters, 1250)
})

test('routing service handles HTTP failures, invalid origins and cancellation', async t => {
  const fetch = t.mock.method(globalThis, 'fetch', async () => new Response('', { status: 503 }))
  const position = { latitude: -26.3, longitude: -48.85 }
  await assert.rejects(getDrivingRoute(position, position), /indisponível/)
  fetch.mock.mockImplementation(async () => new Response('{invalid'))
  await assert.rejects(getDrivingRoute(position, position), /resposta inválida/)
  await assert.rejects(getDrivingRoute({ latitude: NaN, longitude: 0 }, position), /coordenadas/)
  const controller = new AbortController();controller.abort()
  await assert.rejects(getDrivingRoute(position, position, controller.signal), { name: 'AbortError' })
  assert.equal(fetch.mock.callCount(), 2)
  t.mock.restoreAll()
  let aborted = false
  t.mock.method(globalThis, 'fetch', (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => { aborted = true;reject(signal.reason) }, { once: true })
  }))
  const ongoing = new AbortController()
  const pending = getDrivingRoute(position, position, ongoing.signal)
  await Promise.resolve()
  ongoing.abort()
  await assert.rejects(pending, { name: 'AbortError' })
  assert.equal(aborted, true)
})

test('routing service stops an unresponsive request after the time limit', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  t.mock.method(globalThis, 'fetch', (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(signal.reason), { once: true })
  }))
  const position = { latitude: -26.3, longitude: -48.85 }
  const pending = getDrivingRoute(position, position)
  t.mock.timers.tick(20_000)
  await assert.rejects(pending, { name: 'TimeoutError' })
})

test('route options preserve distinct alternatives and reject duplicate or invalid alternatives', () => {
  const response = routingResponse()
  const alternate = structuredClone(response.routes[0])
  alternate.geometry.coordinates.splice(1, 0, [-48.849, -26.302])
  alternate.legs[0].summary = 'Rua alternativa'
  response.routes.push(alternate, structuredClone(response.routes[0]), { geometry: {} })
  const options = parseRouteOptions(response)
  assert.equal(options.length, 2)
  assert.equal(options[1].via, 'Rua alternativa')
  assert.notDeepEqual(options[0].coordinates, options[1].coordinates)
  assert.equal(parseRouteOptions(routingResponse()).length, 1, 'A single real route is not duplicated')
})

test('walking and cycling use their own routing servers and request alternatives', async t => {
  const urls = []
  t.mock.method(globalThis, 'fetch', async input => { urls.push(input);return new Response(JSON.stringify(routingResponse())) })
  const position = { latitude: -26.292, longitude: -48.864 }
  await getRouteOptions(position, position, 'walking')
  await getRouteOptions(position, position, 'cycling')
  assert.match(urls[0], /routed-foot\/route\/v1\/walking\//)
  assert.match(urls[1], /routed-bike\/route\/v1\/cycling\//)
  assert(urls.every(url => new URL(url).searchParams.get('alternatives') === '3'))
})
