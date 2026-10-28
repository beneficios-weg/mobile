import type { Benefit, Category, Establishment, Visit } from '../api/types'
import type { DirectoryPlace } from '../pages/catalog'
import type { EstablishmentDetails } from '../pages/establishment'

type MapSource = { id: string; name: string; neighborhood: string; latitude: number | null; longitude: number | null; mappable?: boolean; offerLabel?: string }
export function isMappable<T extends MapSource>(place: T): place is T & { latitude: number; longitude: number } {
  return place.mappable !== false && typeof place.latitude === 'number' && Number.isFinite(place.latitude)
    && typeof place.longitude === 'number' && Number.isFinite(place.longitude)
    && Math.abs(place.latitude) <= 90 && Math.abs(place.longitude) <= 180
}
export function mapPlaces(places: MapSource[]) {
  return places.filter(isMappable).map(place => ({ id: place.id, name: place.name, category: place.neighborhood,
    latitude: place.latitude, longitude: place.longitude, offerLabel: place.offerLabel }))
}
export function categoryView(category: Category) {
  return { slug: category.id, label: category.name, iconKey: category.iconKey, colorHex: category.colorHex, tone: 'sky' as const }
}
export function placeView(place: Establishment, benefit?: Benefit): DirectoryPlace {
  return { id: place.id, name: place.name, categorySlug: place.category.id,
    neighborhood: place.channel === 'ONLINE' ? 'Online' : [place.district, place.city, place.state].filter(Boolean).join(' · '),
    latitude: place.latitude, longitude: place.longitude, mappable: place.mappable && place.channel !== 'ONLINE',
    offerLabel: benefit?.discounts.map(discount => discount.value).join(' · ') }
}
export function detailView(place: Establishment, benefit?: Benefit): EstablishmentDetails {
  return { id: place.id, name: place.name, neighborhood: place.channel === 'ONLINE' ? 'Online' : place.district ?? '',
    address: place.channel === 'ONLINE' ? 'Atendimento online' : [place.street, place.streetNumber, place.city, place.state, place.postalCode].filter(Boolean).join(', '),
    openingStatus: '', openingHours: '', contact: benefit?.contact ?? '', facadeImageUrl: place.facadeImageUrl ?? undefined,
    latitude: place.latitude, longitude: place.longitude, mappable: place.mappable && place.channel !== 'ONLINE',
    discounts: benefit?.discounts ?? [], audience: benefit?.audience ?? '',
    participation: benefit ? [benefit.participationInstructions] : [], description: place.description,
    services: place.services.map(service => service.name) }
}
export function visitedIds(visits: Visit[]) {
  return [...new Set([...visits].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)).map(visit => visit.establishmentId))]
}
