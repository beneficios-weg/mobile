import { writable, get } from 'svelte/store'
import { api } from './api'
import { isAndroid, native, storage } from './native'
import { emptyState, mergeFavorites, type Benefit, type Category, type Establishment, type Favorite, type FavoriteOperation, type LocalState, type Visit } from '../domain/models'

export const data = writable<LocalState>(emptyState())
export const syncing = writable(false)
let owner: string | null = null
let generation = 0
let mutations: Promise<void> = Promise.resolve()
let syncFlight: Promise<void> | null = null
async function mutate(change: (state: LocalState) => void) {
  const currentOwner = owner, currentGeneration = generation
  const task = mutations.then(async () => {
    if (!currentOwner || currentGeneration !== generation) return
    const state = structuredClone(get(data))
    change(state)
    await storage.setItem(`user:${currentOwner}`, JSON.stringify(state))
    if (currentGeneration === generation) data.set(state)
  })
  mutations = task.catch(() => {})
  return task
}
export async function openRepository(userId: string) {
  generation++; owner = userId
  await mutations
  const cached = await storage.getItem(`user:${userId}`)
  data.set(cached ? JSON.parse(cached) : emptyState())
  await importNativeVisits()
}
export async function closeRepository() {
  const previous = owner
  generation++; owner = null
  await mutations
  data.set(emptyState())
  if (previous) {
    await storage.removeItem(`user:${previous}`)
    if (isAndroid) await native.clearOwner({ owner: previous })
  }
}
export async function toggleFavorite(id: string) {
  await mutate(state => {
    const isFavorite = !state.favorites[id]?.isFavorite
    const changedAt = new Date().toISOString()
    state.favorites[id] = { isFavorite, changedAt }
    // Coalesce unsent intentions for the same shop, preserving final desired state.
    state.queue = state.queue.filter(item => item.establishmentId !== id)
    state.queue.push({ id: crypto.randomUUID(), establishmentId: id, isFavorite, changedAt, retryCount: 0, nextAttempt: 0 })
  })
}
export async function importNativeVisits() {
  if (!isAndroid || !owner) return
  const activeOwner = owner, currentGeneration = generation
  const { visits } = await native.pendingVisits({ owner: activeOwner })
  if (currentGeneration !== generation || !visits.length) return
  await mutate(state => {
    for (const visit of visits) if (!state.visits.some(item => item.id === visit.id)) state.visits.push(visit)
  })
}
const recoverable = (error: { code?: string; status?: number }) => !error.code || error.code.startsWith('08') || error.code === 'PGRST000' || (error.status ?? 0) >= 500
const retryAt = (retryCount: number) => Date.now() + Math.min(300_000, 2000 * 2 ** Math.min(retryCount, 8))

async function fetchAll<T>(table: string): Promise<T[]> {
  if (!api) throw new Error('Serviço indisponível')
  const rows: T[] = []
  for (let page = 0; page < 20; page++) {
    const { data: batch, error } = await api.from(table).select('*').order(table === 'favorites' ? 'establishment_id' : table === 'visits' ? 'detected_at' : 'id').range(page * 500, page * 500 + 499)
    if (error) throw error
    rows.push(...(batch as T[]))
    if (batch.length < 500) return rows
  }
  throw new Error('O catálogo excedeu o limite deste MVP; é necessário sincronizar por região.')
}
export function synchronize(force = false): Promise<void> {
  if (syncFlight) return syncFlight
  syncFlight = runSync(force).finally(() => { syncFlight = null })
  return syncFlight
}
async function runSync(force: boolean) {
  if (!owner || !api) return
  if (!navigator.onLine) throw new Error('Sem conexão. Seus dados e alterações permanecem salvos neste aparelho.')
  const activeOwner = owner, currentGeneration = generation
  syncing.set(true)
  try {
    await importNativeVisits()
    const { data: sessionData, error: sessionError } = await api.auth.getSession()
    if (sessionError) throw sessionError
    if (sessionData.session?.user.id !== activeOwner) throw new Error('Entre novamente para sincronizar.')
    for (const operation of get(data).queue) {
      if (currentGeneration !== generation) return
      if ((!force && operation.nextAttempt > Date.now()) || operation.blocked && !force) continue
      const { error } = await api.rpc('set_favorite', { p_establishment_id: operation.establishmentId, p_is_favorite: operation.isFavorite, p_changed_at: operation.changedAt })
      if (currentGeneration !== generation) return
      await mutate(state => {
        if (!error) state.queue = state.queue.filter(item => item.id !== operation.id)
        else {
          const item = state.queue.find(item => item.id === operation.id)
          if (item) { item.retryCount++; item.nextAttempt = retryAt(item.retryCount); item.blocked = !recoverable(error); item.error = error.message }
        }
      })
    }
    for (const visit of get(data).visits.filter(item => !item.synced)) {
      if (currentGeneration !== generation) return
      if ((!force && (visit.nextAttempt ?? 0) > Date.now()) || visit.blocked && !force) continue
      const { error } = await api.rpc('record_visit', { p_id: visit.id, p_establishment_id: visit.establishmentId, p_detected_at: new Date(visit.detectedAt).toISOString(), p_dwell_ms: visit.dwellMs })
      if (currentGeneration !== generation) return
      await mutate(state => {
        const item = state.visits.find(item => item.id === visit.id)
        if (!item) return
        if (!error) { item.synced = true; item.error = undefined; item.blocked = false }
        else { item.retryCount = (item.retryCount ?? 0) + 1; item.nextAttempt = retryAt(item.retryCount); item.error = error.message; item.blocked = !recoverable(error) }
      })
      if (!error && isAndroid) await native.acknowledgeVisit({ owner: activeOwner, id: visit.id })
    }
    const [categories, establishments, benefits, favorites, visits] = await Promise.all([
      fetchAll<Category>('categories'), fetchAll<Establishment>('establishments'), fetchAll<Benefit>('benefits'),
      fetchAll<{ establishment_id: string; is_favorite: boolean; changed_at: string }>('favorites'),
      fetchAll<{ id: string; establishment_id: string; detected_at: string; dwell_ms: number }>('visits'),
    ])
    if (currentGeneration !== generation) return
    const remoteFavorites: Record<string, Favorite> = {}
    for (const favorite of favorites) remoteFavorites[favorite.establishment_id] = { isFavorite: favorite.is_favorite, changedAt: favorite.changed_at }
    await mutate(state => {
      state.categories = categories; state.establishments = establishments; state.benefits = benefits
      state.favorites = mergeFavorites(remoteFavorites, state.favorites, state.queue)
      const pending = state.visits.filter(item => !item.synced)
      state.visits = [...visits.map((visit): Visit => ({ id: visit.id, establishmentId: visit.establishment_id, detectedAt: Date.parse(visit.detected_at), dwellMs: visit.dwell_ms, synced: true })), ...pending.filter(item => !visits.some(remote => remote.id === item.id))]
      state.lastSyncAt = new Date().toISOString()
    })
  } finally { syncing.set(false) }
}
