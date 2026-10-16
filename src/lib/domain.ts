/**
 * Frontend domain types based on docs/modelo-dados.md.
 * These describe the logical model and do not define API payloads.
 */

export type EntityId = number

export interface User {
  id: EntityId
  name: string
  email: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: EntityId
  name: string
  iconId: string
  colorHex: string
  active: boolean
}

export interface Brand {
  id: EntityId
  name: string
  active: boolean
}

export interface Service {
  id: EntityId
  name: string
  active: boolean
}

export interface Benefit {
  id: EntityId
  establishmentId: EntityId
  audience: string
  participationInstructions: string
  contact: string | null
  discount: string
  conditions: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Establishment {
  id: EntityId
  brandId: EntityId
  categoryId: EntityId
  name: string
  description: string
  postalCode: string
  streetNumber: number
  street: string
  neighborhood: string
  city: string
  state: string
  latitude: number
  longitude: number
  altitude: number | null
  facadeImageUrl: string | null
  active: boolean
}

export interface EstablishmentService {
  establishmentId: EntityId
  serviceId: EntityId
}

export interface OperatingHours {
  id: EntityId
  establishmentId: EntityId
  dayOfWeek: number
  opensAt: string | null
  closesAt: string | null
  closed: boolean
}

export interface Favorite {
  userId: EntityId
  establishmentId: EntityId
  favoritedAt: string
}

export interface Visit {
  id: EntityId
  userId: EntityId
  establishmentId: EntityId
  visitedAt: string
}

export interface Review {
  id: EntityId
  userId: EntityId
  establishmentId: EntityId
  rating: number
  comment: string | null
  createdAt: string
  updatedAt: string
}

/** UI values calculated from source data; they are not persisted fields. */
export interface EstablishmentComputedFields {
  distance: number | null
  isFavorite: boolean
  isOpen: boolean | null
  averageRating: number | null
}
