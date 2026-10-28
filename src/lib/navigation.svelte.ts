import { categoryPath, establishmentPath, isInternalPath, routes, type TabId } from './routes'
import type { FavoritesFilterState } from '../pages/favorites'
import type { MapPlace, MapViewport } from './mapTypes'

export type MapContext = {
  title: string
  benefits: MapPlace[]
  center?: { latitude: number; longitude: number }
  userLocation?: { latitude: number; longitude: number } | null
  selectedBenefitId?: string | null
  initialZoom?: number
  searchValue?: string
  onviewportchange?: (viewport: MapViewport) => void
  onselect?: (id: string) => void
  onclose?: () => void
}
export type DirectoryViewState = {
  searchValue: string
  filterSelection: FavoritesFilterState
  appliedFilters: FavoritesFilterState
  selectedPlaceId: string | null
  listExpanded: boolean
  scrollTop: number
  expandedCard: string | null
  mapViewport: MapViewport | null
}

export const navigation = $state({
  url: typeof window === 'undefined' ? '/' : window.location.pathname + window.location.search,
  map: null as MapContext | null,
})
const views = $state<Record<string, DirectoryViewState>>({})
const mapEntries = new Map<string, MapContext>()

export function directoryView(key: string) {
  views[key] ??= { searchValue: '', filterSelection: [], appliedFilters: [], selectedPlaceId: null, listExpanded: false, scrollTop: 0, expandedCard: null, mapViewport: null }
  return views[key]
}

function dismissMap() {
  navigation.map?.onclose?.()
  navigation.map = null
}

export function syncLocation() {
  dismissMap()
  navigation.url = window.location.pathname + window.location.search
  const entry = window.history.state?.wegMap
  if (typeof entry === 'string') navigation.map = mapEntries.get(entry) ?? null
}

export function navigate(path: string, options: { replace?: boolean } = {}) {
  if (!isInternalPath(path)) return
  const from = navigation.url
  const mapWasOpen = navigation.map !== null
  if (from === path) {
    if (mapWasOpen) closeMap()
    return
  }
  dismissMap()
  const state = { wegNavigation: true, from }
  if (options.replace || mapWasOpen) window.history.replaceState(state, '', path)
  else window.history.pushState(state, '', path)
  navigation.url = window.location.pathname + window.location.search
}

export function goBack(fallback: string = routes.home) {
  if (window.history.state?.wegNavigation && isInternalPath(window.history.state.from)) window.history.back()
  else navigate(fallback, { replace: true })
}

export function openMap(context: MapContext) {
  if (navigation.map) return
  const key = crypto.randomUUID()
  window.history.pushState({ wegMap: key, wegNavigation: true, from: navigation.url }, '', navigation.url)
  navigation.map = context
  mapEntries.set(key, navigation.map)
}

export function closeMap() {
  if (window.history.state?.wegMap) window.history.back()
  else dismissMap()
}

export function navigateTab(tab: TabId, map?: MapContext) {
  if (tab === 'map') {
    if (map) openMap(map)
    return
  }
  navigate(tab === 'home' ? routes.home : tab === 'favorites' ? routes.favorites : routes.visited)
}

export function openCategory(slug: string) { navigate(categoryPath(slug)) }
export function openEstablishment(id: string) { navigate(establishmentPath(id)) }

/** Remove account-specific selections, map callbacks and history-restored directory state. */
export function resetNavigation() {
  dismissMap()
  mapEntries.clear()
  for (const key of Object.keys(views)) delete views[key]
}
