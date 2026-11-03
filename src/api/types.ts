export type User = { id: number; username: string; email: string; role: 'ADMIN' | 'COLLABORATOR'; active: boolean }
export type Page<T> = { content: T[]; page: number; size: number; totalPages: number; totalElements: number }
export type Category = { id: string; name: string; iconKey: string; colorHex: string; active: boolean }
export type Benefit = { id: string; audience: string; participationInstructions: string; contact: string; discounts: { id: string; value: string; description: string }[]; active: boolean }
export type Establishment = {
  id: string; name: string; description: string; channel: 'PHYSICAL' | 'ONLINE' | 'HYBRID'; mappable: boolean
  postalCode: string | null; streetNumber: string | null; street: string | null; district: string | null
  city: string | null; state: string | null; latitude: number | null; longitude: number | null
  facadeImageUrl: string | null; category: Category; benefitId: string; services: { id: string; name: string }[]; active: boolean
}
export type Favorite = { establishmentId: string; name: string; city: string | null; state: string | null; favoritedAt: string }
export type Visit = { id: string; establishmentId: string; occurredAt: string; receivedAt: string }
export type FavoriteOperation = { key: string; userId: number; establishmentId: string; liked: boolean }
export type Snapshot = {
  version: 1; user: User; categories: Category[]; establishments: Establishment[]; benefits: Record<string, Benefit>
  favoriteIds: string[]; visits: Visit[]; queue: FavoriteOperation[]; syncedAt: string | null
}
