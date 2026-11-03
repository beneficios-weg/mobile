import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'
import { compileModule } from 'svelte/compiler'

const compiled = new Map()
async function moduleURL(relative) {
  const url = new URL(relative, import.meta.url)
  if (compiled.has(url.href)) return compiled.get(url.href)
  let source = ts.transpileModule(await readFile(url, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.ESNext } }).outputText
  for (const [, specifier] of [...source.matchAll(/from ['"]([^'"]+)['"]/g)]) {
    assert(specifier.startsWith('.'))
    const dependency = await moduleURL(new URL(`${specifier}.ts`, url).href)
    source = source.replaceAll(`'${specifier}'`, `'${dependency}'`).replaceAll(`"${specifier}"`, `"${dependency}"`)
  }
  const result = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
  compiled.set(url.href, result)
  return result
}
const clientURL = await moduleURL('../src/api/client.ts')
const adaptersURL = await moduleURL('../src/lib/apiAdapters.ts')
const { createClient, ApiError, acknowledge } = await import(clientURL)
const { mapPlaces, placeView, detailView, visitedIds } = await import(adaptersURL)
const user = { id: 1, username: 'fixture', email: 'fixture@gmail.com', active: true, role: 'COLLABORATOR' }
const category = { id: 'category-a', name: 'Categoria', iconKey: 'mdi:food', colorHex: '#E65100', active: true }
const benefit = { id: 'benefit-a', active: true, audience: 'Texto ORIGINAL', participationInstructions: 'Use o código como está\nSEM correção.', contact: 'Site: https://example.com/cupom2026', discounts: [{ id: 'discount-a', value: 'Frete gratis', description: 'Texto com eror de digitação, mantido.' }] }
const online = { id: 'online-a', name: 'Loja online', description: 'Descrição original', channel: 'ONLINE', mappable: false, category, benefitId: benefit.id, services: [], latitude: null, longitude: null, city: null, state: null, street: null, district: null, streetNumber: null, postalCode: null, facadeImageUrl: null, active: true }
const physical = { ...online, id: 'physical-a', name: 'Loja física', channel: 'PHYSICAL', mappable: true, latitude: -26.48, longitude: -49.07, city: 'Jaraguá do Sul', state: 'SC', district: 'Centro', street: 'Rua A', streetNumber: '5', postalCode: '89200000' }
function snapshot(id = 1) {
  return { version: 1, user: { ...user, id }, categories: [category], establishments: [online, physical], benefits: { [benefit.id]: benefit }, favoriteIds: [online.id], visits: [], queue: [], syncedAt: '2026-10-28T12:00:00Z' }
}
const page = (content) => ({ content, page: 0, size: 100, totalPages: 1, totalElements: content.length })
function server(method, path) {
  if (path === '/v1/me' || path === '/v1/auth/login') return { status: 200, data: user }
  if (path.startsWith('/v1/categories?')) return { status: 200, data: page([category]) }
  if (path.startsWith('/v1/establishments?')) return { status: 200, data: page([online, physical]) }
  if (path.includes('/benefits?')) return { status: 200, data: page([benefit]) }
  if (path.startsWith('/v1/me/favorites?')) return { status: 200, data: page([]) }
  if (path.startsWith('/v1/me/visits?')) return { status: 200, data: page([]) }
  if (['PUT', 'DELETE', 'POST'].includes(method)) return { status: 204, data: null }
  throw new Error(`Unconfigured fixture route ${method} ${path}`)
}
let serial = 0
async function harness(options = {}) {
  const store = new Map()
  const calls = []
  let active = options.previous?.user.id
  if (options.previous) store.set(active, structuredClone(options.previous))
  const h = {
    api: createClient(async (method, path, body) => {
      calls.push({ method, path, body })
      return (h.transport ?? server)(method, path, body)
    }),
    cache: {
      active: async () => active,
      account: async id => structuredClone(store.get(id)),
      save: async value => { if (h.failStorage) throw new Error('disk'); store.set(value.user.id, structuredClone(value)) },
      activate: async id => { active = id },
      deactivate: async () => { active = undefined },
    },
    resetNavigation() {}, calls, store, transport: options.transport,
  }
  const key = `__wegTest${serial++}`
  globalThis[key] = h
  let source = ts.transpileModule(await readFile(new URL('../src/lib/siteState.svelte.ts', import.meta.url), 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.ESNext } }).outputText
  // Compile the real orchestration module with Svelte's server target for deterministic plain state.
  // Native cookies, browser reactivity and IndexedDB are separate integration checks.
  source = compileModule(source, { generate: 'server', filename: `state-${serial}.svelte.js` }).js.code
  const replacements = {
    "import { api } from '../api/transport';": `const {api} = globalThis.${key};`,
    "import { cache } from '../storage/cache';": `const {cache} = globalThis.${key};`,
    "import { resetNavigation } from './navigation.svelte';": `const {resetNavigation} = globalThis.${key};`,
    "import { loadCategoryIcons } from './icons.svelte';": 'const loadCategoryIcons = async () => {};',
    "'../api/client'": `'${clientURL}'`, "'./apiAdapters'": `'${adaptersURL}'`,
    "'svelte/internal/server'": `'${import.meta.resolve('svelte/internal/server')}'`,
  }
  for (const [from, to] of Object.entries(replacements)) { assert(source.includes(from), from); source = source.replace(from, to) }
  const state = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
  delete globalThis[key]
  return { ...state, h }
}

test('catalog pagination loads 70 entries in two public pages of 50', async () => {
  const paths = []
  const records = Array.from({ length: 70 }, (_, id) => ({ id }))
  const api = createClient(async (_method, path) => {
    paths.push(path)
    const index = Number(new URL(path, 'https://example.com').searchParams.get('page'))
    return { status: 200, data: { ...page(records.slice(index * 50, (index + 1) * 50)), totalPages: 2 } }
  })
  assert.deepEqual(await api.all('/v1/establishments?forMap=true', 50), records)
  assert.deepEqual(paths, ['/v1/establishments?forMap=true&page=0&size=50', '/v1/establishments?forMap=true&page=1&size=50'])
  await assert.rejects(createClient(async () => ({ status: 200, data: null })).all('/v1/categories'), error => error.status === 502)
})

test('HTTP errors are generic and non-idempotent requests are never retried', async () => {
  let calls = 0
  const api = createClient(async () => { calls++; return { status: 401, data: { detail: 'secret, precise location and stack trace' } } })
  await assert.rejects(api.request('POST', '/v1/auth/login', { login: 'fixture', password: 'only-in-request' }), error => error.status === 401 && !error.message.includes('secret'))
  assert.equal(calls, 1)
  await assert.rejects(createClient(async () => { throw new Error('sensitive infrastructure') }).request('GET', '/v1/me'), error => error.status === 0 && !error.message.includes('infrastructure'))
})

test('ONLINE remains in lists but never creates a map pin, route or fake coordinates', () => {
  const places = [online, physical].map(place => placeView(place, benefit))
  assert.equal(places.length, 2)
  assert.equal(places[0].neighborhood, 'Online')
  assert.equal(places[0].latitude, null)
  assert.equal(places[0].discount, undefined)
  assert.equal(places[0].distanceKm, undefined)
  assert.deepEqual(mapPlaces(places).map(place => place.id), [physical.id])
  assert.deepEqual(mapPlaces([{ ...places[1], latitude: NaN }, { ...places[1], longitude: 181 }]), [])
  assert.equal(detailView(online, benefit).mappable, false)
})

test('shared benefits keep all discount, instruction and contact text verbatim without conditions or hours', () => {
  for (const establishment of [online, physical]) {
    const details = detailView(establishment, benefit)
    assert.deepEqual(details.discounts, benefit.discounts)
    assert.equal(details.participation.join('\n'), benefit.participationInstructions)
    assert.equal(details.contact, benefit.contact)
    assert.equal(details.openingHours, '')
    assert.equal(placeView(establishment, benefit).offerLabel, 'Frete gratis')
    assert.equal('conditions' in details, false)
  }
})

test('visited view keeps latest visit ordering and does not derive visits from favorites', () => {
  const visits = [{ establishmentId: 'a', occurredAt: '2026-10-28T10:00:00Z' }, { establishmentId: 'b', occurredAt: '2026-10-28T11:00:00Z' }, { establishmentId: 'a', occurredAt: '2026-10-28T12:00:00Z' }]
  assert.deepEqual(visitedIds(visits), ['a', 'b'])
  assert.equal(visits.length, 3)
})

test('offline cache survives restart and favorites synchronize only after /me validates the same account', async () => {
  const module = await harness({ previous: snapshot(), transport: () => { throw new Error('offline') } })
  await module.initialize()
  assert.equal(module.siteState.phase, 'ready')
  assert.equal(module.siteState.offline, true)
  await module.setFavorite(physical.id, true)
  assert.equal(module.siteState.queue.length, 1)
  assert(module.h.store.get(1).favoriteIds.includes(physical.id))
  module.h.calls.length = 0
  module.h.transport = server
  await module.refresh()
  assert.equal(module.h.calls[0].path, '/v1/me')
  assert(module.h.calls.some(call => call.method === 'PUT' && call.path.endsWith(physical.id)))
  assert.equal(module.siteState.queue.length, 0)
  assert.equal(module.siteState.offline, false)
  assert.equal(module.h.calls.filter(call => call.path.includes('/benefits?')).length, 1, 'shared benefit fetched only once')
})

test('401 blocks replay, removes personal UI and offers deleting the saved pending queue', async () => {
  const previous = snapshot()
  previous.queue = [{ key: 'pending', userId: 1, establishmentId: physical.id, liked: true }]
  const module = await harness({ previous, transport: () => ({ status: 401, data: {} }) })
  await module.initialize()
  assert.equal(module.siteState.phase, 'signed-out')
  assert.equal(module.siteState.user, null)
  assert.equal(module.siteState.blockedAccount, 1)
  assert.equal(module.h.calls.filter(call => call.method === 'PUT').length, 0)
  assert.equal(module.h.store.get(1).queue.length, 1)
  await module.discardBlockedQueue()
  assert.equal(module.h.store.get(1).queue.length, 0)
})

test('a changed server identity cannot replay a previous account queue', async () => {
  const previous = snapshot()
  previous.queue = [{ key: 'pending-a', userId: 1, establishmentId: physical.id, liked: true }]
  const module = await harness({ previous, transport: () => { throw new Error('offline') } })
  await module.initialize()
  module.h.transport = (method, path) => path === '/v1/me' ? { status: 200, data: { ...user, id: 2 } } : server(method, path)
  await module.refresh()
  assert.equal(module.siteState.user, null)
  assert.equal(module.siteState.phase, 'signed-out')
  assert.equal(module.h.calls.filter(call => call.method === 'PUT').length, 0)
  assert.equal(module.h.store.get(1).queue.length, 1)
})

test('login as another account retains but never sends the old account queue or password', async () => {
  const previous = snapshot()
  previous.queue = [{ key: 'pending-a', userId: 1, establishmentId: physical.id, liked: true }]
  const module = await harness({ previous, transport: (method, path) => ['/v1/me', '/v1/auth/login'].includes(path) ? { status: 200, data: { ...user, id: 2 } } : server(method, path) })
  await module.initialize()
  await module.login('fixture-b', 'only-in-request')
  await module.refresh()
  assert.equal(module.siteState.user.id, 2)
  assert.equal(module.siteState.queue.length, 0)
  assert.equal(module.h.store.get(1).queue.length, 1)
  assert.equal(module.h.calls.filter(call => call.method === 'PUT').length, 0)
  assert.equal(JSON.stringify([...module.h.store.values()]).includes('only-in-request'), false)
  assert.equal(JSON.stringify(module.siteState).includes('only-in-request'), false)
})

test('partial refresh failure preserves the last complete catalog and sync timestamp', async () => {
  const previous = snapshot()
  const module = await harness({ previous, transport: (method, path) => path.includes('/benefits?') ? { status: 503, data: {} } : server(method, path) })
  await module.initialize()
  assert.deepEqual(module.siteState.establishments, previous.establishments)
  assert.equal(module.siteState.syncedAt, previous.syncedAt)
  assert.equal(module.siteState.offline, true)
})

test('storage failure rolls back favorite toggles instead of falsely promising offline delivery', async () => {
  const module = await harness({ previous: snapshot(), transport: () => { throw new Error('offline') } })
  await module.initialize()
  module.h.failStorage = true
  await module.setFavorite(physical.id, true)
  assert.equal(module.siteState.favoriteIds.includes(physical.id), false)
  assert.equal(module.siteState.queue.length, 0)
})

test('logout clears visible personal state only after server success', async () => {
  const module = await harness({ previous: snapshot(), transport: () => { throw new Error('offline') } })
  await module.initialize()
  await module.logout()
  assert.equal(module.siteState.user.id, 1)
  module.h.transport = server
  await module.logout()
  assert.equal(module.siteState.user, null)
  assert.equal(module.siteState.favoriteIds.length, 0)
  assert.equal(await module.h.cache.active(), undefined)
})

test('acknowledging an in-flight toggle preserves newer intent', () => {
  assert.deepEqual(acknowledge([{ key: 'old', liked: true }, { key: 'new', liked: false }], 'old'), [{ key: 'new', liked: false }])
})

test('server unavailability on restart permits cached reading but never pretends to validate a session', async () => {
  const module = await harness({ previous: snapshot(), transport: () => ({ status: 503, data: {} }) })
  await module.initialize()
  assert.equal(module.siteState.phase, 'ready')
  assert.equal(module.siteState.offline, true)
  assert.equal(module.siteState.syncedAt, snapshot().syncedAt)
  await module.setFavorite(physical.id, true)
  assert.equal(module.h.calls.filter(call => call.method === 'PUT').length, 0)
})

test('malformed authentication replies fail safely without creating a local account', async () => {
  const module = await harness({ transport: () => ({ status: 200, data: null }) })
  await assert.rejects(module.login('fixture', 'only-in-request'), error => error instanceof ApiError && error.status === 502)
  assert.equal(module.siteState.user, null)
  assert.equal(module.h.store.size, 0)
})

test('401 while replaying a queued favorite stops further mutations and preserves unsent intent', async () => {
  const previous = snapshot()
  previous.queue = [
    { key: 'one', userId: 1, establishmentId: physical.id, liked: true },
    { key: 'two', userId: 1, establishmentId: online.id, liked: false },
  ]
  const module = await harness({ previous, transport: () => { throw new Error('offline') } })
  await module.initialize()
  module.h.calls.length = 0
  module.h.transport = (method, path) => method === 'PUT' ? { status: 401, data: {} } : server(method, path)
  await module.refresh()
  assert.equal(module.siteState.phase, 'signed-out')
  assert.deepEqual(module.h.calls.map(call => call.method), ['GET', 'PUT'])
  assert.equal(module.h.store.get(1).queue.length, 2)
})

test('a toggle persisted during a manual refresh is replayed after that refresh completes', async () => {
  const module = await harness({ previous: snapshot(), transport: server })
  await module.initialize()
  let release
  const waiting = new Promise(resolve => { release = resolve })
  let reached
  const reachedFavorites = new Promise(resolve => { reached = resolve })
  let block = true
  module.h.transport = async (method, path) => {
    if (block && path.startsWith('/v1/me/favorites?')) { reached(); await waiting }
    return server(method, path)
  }
  const refresh = module.refresh()
  await reachedFavorites
  const mutation = module.setFavorite(physical.id, true)
  // Let the serialized IndexedDB-double persistence finish before the GET is released.
  await new Promise(resolve => setImmediate(resolve))
  block = false
  release()
  await refresh
  await mutation
  assert(module.h.calls.some(call => call.method === 'PUT' && call.path.endsWith(physical.id)))
  assert.equal(module.siteState.queue.length, 0)
})

test('switching accounts starts an independent refresh and ignores the previous account response', async () => {
  const module = await harness({ previous: snapshot(), transport: () => { throw new Error('offline') } })
  await module.initialize()
  let release
  let reached
  const waiting = new Promise(resolve => { release = resolve })
  const reachedMe = new Promise(resolve => { reached = resolve })
  let old = true
  module.h.transport = async (method, path) => {
    if (old && path === '/v1/me') { old = false; reached(); await waiting; return { status: 200, data: user } }
    if (path === '/v1/me' || path === '/v1/auth/login') return { status: 200, data: { ...user, id: 2 } }
    return server(method, path)
  }
  const previousRefresh = module.refresh()
  await reachedMe
  await module.login('fixture-b', 'only-in-request')
  await module.refresh()
  assert.equal(module.siteState.user.id, 2)
  assert.equal(module.siteState.establishments.length, 2)
  release()
  await previousRefresh
  assert.equal(module.siteState.user.id, 2)
  assert.equal(module.siteState.phase, 'ready')
})
