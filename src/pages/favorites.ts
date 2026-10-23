export type FavoritePlace = {
  id: string
  name: string
  neighborhood: string
  distanceKm: number
  discount: number
  latitude: number
  longitude: number
}

export type FavoritesSortOrder = 'nearest' | 'name' | 'discount'

function normalizeSearch(value: string) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR')
}

export function filterFavorites(places: FavoritePlace[], search: string, order: FavoritesSortOrder) {
  const query = normalizeSearch(search.trim())
  const filtered = places.filter((place) =>
    normalizeSearch(`${place.name} ${place.neighborhood} ${place.discount}% OFF`).includes(query),
  )

  return filtered.sort((a, b) => {
    if (order === 'name') return a.name.localeCompare(b.name, 'pt-BR')
    if (order === 'discount') return b.discount - a.discount
    return a.distanceKm - b.distanceKm
  })
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
]

export const previewFavoritesLocation = { latitude: -26.3045, longitude: -48.8487 }
