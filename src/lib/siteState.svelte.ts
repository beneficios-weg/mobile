import { api } from '../api/transport'
import { ApiError, acknowledge } from '../api/client'
import type { Benefit, Category, Establishment, Favorite, Snapshot, User, Visit } from '../api/types'
import { cache } from '../storage/cache'
import { categoryView, detailView, placeView, visitedIds } from './apiAdapters'
import { resetNavigation } from './navigation.svelte'
import { loadCategoryIcons } from './icons.svelte'

export const siteState = $state({
  phase: 'checking' as 'checking' | 'signed-out' | 'ready', user: null as User | null,
  categories: [] as Category[], establishments: [] as Establishment[], benefits: {} as Record<string, Benefit>,
  favoriteIds: [] as string[], visits: [] as Visit[], queue: [] as Snapshot['queue'],
  syncing: false, offline: false, message: '', syncedAt: null as string | null,
  blockedAccount: null as number | null, pendingLogout: false,
})
let generation = 0
let write = Promise.resolve()
let refreshTask: Promise<void> | undefined
let refreshGeneration = -1
let mutations = Promise.resolve()

function snapshot(): Snapshot | undefined {
  if (!siteState.user) return
  return $state.snapshot({ version: 1 as const, user: siteState.user, categories: siteState.categories,
    establishments: siteState.establishments, benefits: siteState.benefits,
    favoriteIds: siteState.favoriteIds, visits: siteState.visits, queue: siteState.queue, syncedAt: siteState.syncedAt })
}
async function persist() {
  const value = snapshot()
  if (!value) return
  write = write.catch(() => {}).then(() => cache.save(value).then(() => {}))
  return write
}
function storageWarning() { siteState.message = 'Não foi possível salvar os dados neste aparelho. Não feche o app com alterações pendentes.' }
function requireUser(user: User): User {
  if (!user || !Number.isInteger(user.id) || user.id <= 0 || typeof user.username !== 'string' || !user.active) throw new ApiError(502)
  return user
}
function clearAccount() {
  generation++
  siteState.user = null
  siteState.categories = []; siteState.establishments = []; siteState.benefits = {}
  siteState.favoriteIds = []; siteState.visits = []; siteState.queue = []; siteState.syncedAt = null
  siteState.syncing = false
  mutations = Promise.resolve()
  resetNavigation()
}
async function loadAccount(user: User) {
  clearAccount()
  let previous: Snapshot | undefined
  try { previous = await cache.account(user.id) } catch { storageWarning() }
  siteState.user = user
  if (previous) {
    siteState.categories = previous.categories; siteState.establishments = previous.establishments
    siteState.benefits = previous.benefits; siteState.favoriteIds = previous.favoriteIds
    siteState.visits = previous.visits; siteState.queue = previous.queue.filter(operation => operation.userId === user.id)
    siteState.syncedAt = previous.syncedAt
    void loadCategoryIcons(previous.categories)
  }
  siteState.phase = 'ready'
  siteState.blockedAccount = null
  try { await cache.activate(user.id) } catch { storageWarning() }
}
async function revoke() {
  const id = siteState.user?.id
  const ticket = generation
  await persist().catch(storageWarning)
  if (ticket !== generation) return
  clearAccount()
  siteState.blockedAccount = id ?? siteState.blockedAccount
  siteState.phase = 'signed-out'
  siteState.message = 'Sessão ou conta indisponível. Entre novamente. Você pode apagar os favoritos pendentes deste aparelho.'
  await cache.deactivate().catch(storageWarning)
}

export const categories = () => siteState.categories.map(categoryView)
export const homePlaces = () => siteState.establishments.map(place => placeView(place, siteState.benefits[place.benefitId]))
export const findCategory = (id: string) => categories().find(category => category.slug === id)
export const findPlace = (id: string) => homePlaces().find(place => place.id === id)
export const placesForCategory = (id: string) => homePlaces().filter(place => place.categorySlug === id)
export const visitedPlaces = () => visitedIds(siteState.visits).map(findPlace).filter(place => place !== undefined)
export function establishmentDetails(id: string) {
  const place = siteState.establishments.find(place => place.id === id)
  return place ? detailView(place, siteState.benefits[place.benefitId]) : undefined
}

export async function login(login: string, password: string) {
  if (siteState.pendingLogout) throw new ApiError(0)
  siteState.message = ''
  let user: User
  try { user = requireUser(await api.request<User>('POST', '/v1/auth/login', { login, password })) }
  catch (error) {
    if (error instanceof ApiError && error.status === 401) throw new ApiError(401, 'Usuário/e-mail ou senha inválidos.')
    throw error
  }
  await loadAccount(user)
  siteState.offline = false
  void refresh()
}
export async function logout() {
  if (siteState.pendingLogout) return
  siteState.pendingLogout = true
  try {
    await api.request<void>('POST', '/v1/auth/logout')
    await persist().catch(storageWarning)
    await cache.deactivate().catch(storageWarning)
    clearAccount()
    siteState.phase = 'signed-out'; siteState.message = ''; siteState.offline = false
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) await revoke()
    else siteState.message = 'Não foi possível encerrar a sessão. Reconecte e tente sair novamente.'
  } finally { siteState.pendingLogout = false }
}

/** Called only after /me validated the same account; no automatic retry of login or visits. */
async function flush(userId: number, ticket: number) {
  for (const operation of [...siteState.queue]) {
    if (ticket !== generation || siteState.user?.id !== userId) return
    if (operation.userId !== userId) continue
    try {
      await api.request<void>(operation.liked ? 'PUT' : 'DELETE', `/v1/me/favorites/${encodeURIComponent(operation.establishmentId)}`)
    } catch (error) {
      if (!(error instanceof ApiError) || ![400, 404, 409].includes(error.status)) throw error
      siteState.message = 'Um estabelecimento não está mais disponível. O favorito pendente foi descartado.'
    }
    if (ticket !== generation || siteState.user?.id !== userId) return
    siteState.queue = acknowledge(siteState.queue, operation.key)
    await persist()
  }
}
export function refresh(): Promise<void> {
  if (refreshTask && refreshGeneration === generation) return refreshTask
  refreshGeneration = generation
  const task = synchronize().finally(() => { if (refreshTask === task) refreshTask = undefined })
  refreshTask = task
  return task
}
async function synchronize() {
  if (!siteState.user) return
  const userId = siteState.user.id
  const ticket = generation
  siteState.syncing = true
  try {
    const user = requireUser(await api.request<User>('GET', '/v1/me'))
    if (ticket !== generation) return
    if (user.id !== userId || !user.active) { await revoke(); return }
    await flush(userId, ticket)
    if (ticket !== generation) return
    const [categories, establishments, favorites, visits] = await Promise.all([
      api.all<Category>('/v1/categories'), api.all<Establishment>('/v1/establishments', 50),
      api.all<Favorite>('/v1/me/favorites'), api.all<Visit>('/v1/me/visits'),
    ])
    // Shared benefits are downloaded once per benefitId through their public establishment route.
    const representatives = [...new Map(establishments.map(place => [place.benefitId, place])).values()]
    const benefits: Record<string, Benefit> = {}
    let next = 0
    await Promise.all(Array.from({ length: Math.min(4, representatives.length) }, async () => {
      while (next < representatives.length) {
        const place = representatives[next++]
        const result = await api.all<Benefit>(`/v1/establishments/${encodeURIComponent(place.id)}/benefits`)
        const benefit = result.find(benefit => benefit.id === place.benefitId)
        if (benefit) benefits[benefit.id] = benefit
      }
    }))
    if (ticket !== generation || siteState.user?.id !== userId) return
    siteState.categories = categories; siteState.establishments = establishments; siteState.benefits = benefits
    void loadCategoryIcons(categories)
    let ids = new Set(favorites.map(favorite => favorite.establishmentId))
    for (const operation of siteState.queue) {
      if (operation.userId === userId) operation.liked ? ids.add(operation.establishmentId) : ids.delete(operation.establishmentId)
    }
    siteState.favoriteIds = [...ids]; siteState.visits = visits
    siteState.offline = false; siteState.syncedAt = new Date().toISOString()
    await persist().catch(storageWarning)
  } catch (error) {
    if (ticket !== generation) return
    if (error instanceof ApiError && error.status === 401) await revoke()
    else {
      siteState.offline = true
      siteState.message = siteState.syncedAt ? 'Exibindo a última cópia salva. Reconecte para atualizar.' : 'Não foi possível carregar os benefícios. Tente atualizar.'
    }
  } finally { if (ticket === generation) siteState.syncing = false }
}
export async function initialize() {
  let previous: Snapshot | undefined
  try {
    const id = await cache.active()
    if (id !== undefined) previous = await cache.account(id)
  } catch { storageWarning() }
  try {
    const user = requireUser(await api.request<User>('GET', '/v1/me'))
    await loadAccount(user)
    await refresh()
  } catch (error) {
    if (error instanceof ApiError && (error.status === 0 || error.status >= 500) && previous) {
      await loadAccount(previous.user)
      siteState.offline = true
      siteState.message = 'Sem conexão. Exibindo os dados salvos desta conta.'
    } else {
      siteState.phase = 'signed-out'
      if (error instanceof ApiError && error.status === 401 && previous) {
        siteState.blockedAccount = previous.user.id
        siteState.message = error.message
        await cache.deactivate().catch(storageWarning)
      }
    }
  }
}
export function setFavorite(establishmentId: string, liked: boolean) {
  const userId = siteState.user?.id
  const ticket = generation
  mutations = mutations.catch(() => {}).then(async () => {
    if (userId === undefined || siteState.user?.id !== userId || ticket !== generation || siteState.pendingLogout) return
    const oldIds = [...siteState.favoriteIds]; const oldQueue = [...siteState.queue]
    siteState.favoriteIds = liked ? [...new Set([...siteState.favoriteIds, establishmentId])] : siteState.favoriteIds.filter(id => id !== establishmentId)
    siteState.queue = [...siteState.queue, { key: crypto.randomUUID(), userId, establishmentId, liked }]
    try { await persist() }
    catch {
      if (ticket === generation) { siteState.favoriteIds = oldIds; siteState.queue = oldQueue; storageWarning() }
      return
    }
    if (ticket !== generation || siteState.user?.id !== userId) return
    if (!siteState.offline) {
      await refresh()
      // A manual refresh may have started before this toggle was persisted.
      if (ticket === generation && siteState.queue.length && !siteState.offline) await refresh()
    }
  })
  return mutations
}
export async function discardBlockedQueue() {
  const id = siteState.blockedAccount
  if (id === null) return
  try {
    const value = await cache.account(id)
    if (value) await cache.save({ ...value, queue: [], favoriteIds: [] })
    siteState.blockedAccount = null; siteState.message = 'Favoritos pendentes apagados deste aparelho.'
  } catch { storageWarning() }
}
