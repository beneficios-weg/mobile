import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

// Exercise dependency-free TypeScript modules using the existing compiler.
// This keeps the tests compatible with the Node versions supported by Vite.
async function loadTypeScript(relativePath) {
  const source = await readFile(new URL(relativePath, import.meta.url), 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.ESNext },
  })
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
}

const { filterFavorites, previewFavorites, previewFavoritesLocation } = await loadTypeScript('../src/pages/favorites.ts')
const { demoBenefits } = await loadTypeScript('../src/services/benefitsService.ts')
const { fitDescription } = await loadTypeScript('../src/lib/benefitDescriptionMotion.ts')

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
