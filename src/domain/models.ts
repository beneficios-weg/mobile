export interface Category { id: string; name: string }
export interface Establishment { id: string; category_id: string; name: string; description: string; address: string; latitude: number; longitude: number }
export interface Benefit { id: string; establishment_id: string; title: string; description: string; terms: string; valid_until: string | null }
export interface Favorite { isFavorite: boolean; changedAt: string }
export interface FavoriteOperation { id: string; establishmentId: string; isFavorite: boolean; changedAt: string; retryCount: number; nextAttempt: number; error?: string; blocked?: boolean }
export interface Visit { id: string; establishmentId: string; detectedAt: number; dwellMs: number; synced?: boolean; error?: string; blocked?: boolean; retryCount?: number; nextAttempt?: number }
export interface LocalState {
  categories: Category[]; establishments: Establishment[]; benefits: Benefit[]
  favorites: Record<string, Favorite>; visits: Visit[]; queue: FavoriteOperation[]; lastSyncAt: string | null
}
export const emptyState = (): LocalState => ({ categories: [], establishments: [], benefits: [], favorites: {}, visits: [], queue: [], lastSyncAt: null })

export function distanceMeters(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const rad = Math.PI / 180
  const dLat = (b.latitude - a.latitude) * rad, dLon = (b.longitude - a.longitude) * rad
  const angle = Math.sin(dLat / 2) ** 2 + Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(dLon / 2) ** 2
  return 6371000 * 2 * Math.atan2(Math.sqrt(angle), Math.sqrt(Math.max(0, 1 - angle)))
}
export function mergeFavorites(remote: Record<string, Favorite>, local: Record<string, Favorite>, queue: FavoriteOperation[]) {
  const merged = { ...remote }
  for (const operation of queue) {
    const item = local[operation.establishmentId]
    if (item && (!merged[operation.establishmentId] || Date.parse(merged[operation.establishmentId].changedAt) < Date.parse(item.changedAt))) merged[operation.establishmentId] = item
  }
  return merged
}
