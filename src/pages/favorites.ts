export type FavoritePlace = {
  id: string
  name: string
  neighborhood: string
  distanceKm: number
  discount: number
  latitude: number
  longitude: number
  openingHours?: {
    days: number[]
    opensAt: string
    closesAt: string
  }
}

export type FavoritesFilterOption = 'name-asc' | 'name-desc' | 'discount' | 'nearest' | 'open-now'
export type FavoritesFilterState = FavoritesFilterOption[]

function normalizeSearch(value: string) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR')
}

export function filterFavorites(
  places: FavoritePlace[],
  search: string,
  filters: FavoritesFilterState,
  currentTime = new Date(),
) {
  const query = normalizeSearch(search.trim())
  const filtered = places.filter((place) => {
    const matchesSearch = normalizeSearch(`${place.name} ${place.neighborhood} ${place.discount}% OFF`).includes(query)
    return matchesSearch && (!filters.includes('open-now') || isPlaceOpen(place, currentTime))
  })

  const sortCriteria = filters.filter((option) => option !== 'open-now')
  const criteria = sortCriteria.length ? sortCriteria : ['nearest']

  return [...filtered].sort((a, b) => {
    for (const criterion of criteria) {
      let comparison = 0
      if (criterion === 'name-asc') comparison = a.name.localeCompare(b.name, 'pt-BR')
      if (criterion === 'name-desc') comparison = b.name.localeCompare(a.name, 'pt-BR')
      if (criterion === 'discount') comparison = b.discount - a.discount
      if (criterion === 'nearest') comparison = a.distanceKm - b.distanceKm
      if (comparison !== 0) return comparison
    }
    return 0
  })
}

function isPlaceOpen(place: FavoritePlace, at: Date) {
  const hours = place.openingHours
  if (!hours || !hours.days.includes(at.getDay())) return false
  const time = at.getHours() * 60 + at.getMinutes()
  const [openHour, openMinute] = hours.opensAt.split(':').map(Number)
  const [closeHour, closeMinute] = hours.closesAt.split(':').map(Number)
  return time >= openHour * 60 + openMinute && time < closeHour * 60 + closeMinute
}

// Dados locais de demonstração do protótipo; não representam um contrato de API.
export const previewFavorites: FavoritePlace[] = [
  { id: 'pao-centro', name: 'Pão & Cia', neighborhood: 'Centro', distanceKm: 0.8, discount: 15, latitude: -26.3043, longitude: -48.8464 },
  { id: 'move-vila', name: 'Academia Move', neighborhood: 'Vila Nova', distanceKm: 1.2, discount: 20, latitude: -26.2948, longitude: -48.8587 },
  { id: 'otica-centro', name: 'Ótica Visão', neighborhood: 'Centro', distanceKm: 1.6, discount: 12, latitude: -26.3051, longitude: -48.8448 },
  { id: 'pao-vila', name: 'Pão & Cia', neighborhood: 'Centro', distanceKm: 1.8, discount: 15, latitude: -26.3071, longitude: -48.8496 },
  { id: 'move-centro', name: 'Academia Move', neighborhood: 'Vila Nova', distanceKm: 2.1, discount: 20, latitude: -26.3088, longitude: -48.8428 },
  { id: 'otica-vila', name: 'Ótica Visão', neighborhood: 'Centro', distanceKm: 2.4, discount: 12, latitude: -26.3103, longitude: -48.8549 },
  { id: 'clinica-america', name: 'Clínica Bem Viver', neighborhood: 'América', distanceKm: 2.8, discount: 15, latitude: -26.2965, longitude: -48.8505 },
  { id: 'farmacia-centro', name: 'Farmácia Saúde', neighborhood: 'Centro', distanceKm: 3.2, discount: 10, latitude: -26.3009, longitude: -48.8526 },
  { id: 'pao-centro', name: 'Pão & Cia', neighborhood: 'Centro', distanceKm: 0.8, discount: 15, latitude: -26.478, longitude: -49.071, openingHours: { days: [1, 2, 3, 4, 5, 6], opensAt: '06:00', closesAt: '22:00' } },
  { id: 'move-vila', name: 'Academia Move', neighborhood: 'Vila Nova', distanceKm: 1.2, discount: 20, latitude: -26.482, longitude: -49.091, openingHours: { days: [1, 2, 3, 4, 5, 6], opensAt: '06:00', closesAt: '22:00' } },
  { id: 'otica-centro', name: 'Ótica Visão', neighborhood: 'Centro', distanceKm: 1.6, discount: 12, latitude: -26.487, longitude: -49.073, openingHours: { days: [1, 2, 3, 4, 5, 6], opensAt: '09:00', closesAt: '19:00' } },
  { id: 'pao-vila', name: 'Pão & Cia', neighborhood: 'Centro', distanceKm: 1.8, discount: 15, latitude: -26.478, longitude: -49.089, openingHours: { days: [1, 2, 3, 4, 5, 6], opensAt: '06:00', closesAt: '22:00' } },
  { id: 'move-centro', name: 'Academia Move', neighborhood: 'Vila Nova', distanceKm: 2.1, discount: 20, latitude: -26.489, longitude: -49.078, openingHours: { days: [1, 2, 3, 4, 5, 6], opensAt: '06:00', closesAt: '22:00' } },
  { id: 'otica-vila', name: 'Ótica Visão', neighborhood: 'Centro', distanceKm: 2.4, discount: 12, latitude: -26.481, longitude: -49.066, openingHours: { days: [1, 2, 3, 4, 5, 6], opensAt: '09:00', closesAt: '19:00' } },
  { id: 'clinica-america', name: 'Clínica Bem Viver', neighborhood: 'América', distanceKm: 2.8, discount: 15, latitude: -26.470, longitude: -49.084, openingHours: { days: [1, 2, 3, 4, 5], opensAt: '08:00', closesAt: '18:00' } },
  { id: 'farmacia-centro', name: 'Farmácia Saúde', neighborhood: 'Centro', distanceKm: 3.2, discount: 10, latitude: -26.493, longitude: -49.085, openingHours: { days: [0, 1, 2, 3, 4, 5, 6], opensAt: '08:00', closesAt: '22:00' } },
]

export const previewFavoritesLocation = { latitude: -26.3045, longitude: -48.8487 }
