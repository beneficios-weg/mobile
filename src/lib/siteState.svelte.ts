import { favoriteExamples } from '../pages/catalog'

/** Preview state shared across routes; no credentials or visit detection are stored. */
export const siteState = $state({ favoriteIds: favoriteExamples.map(place => place.id) })

export function setFavorite(id: string, liked: boolean) {
  siteState.favoriteIds = liked
    ? [...new Set([...siteState.favoriteIds, id])]
    : siteState.favoriteIds.filter(favoriteId => favoriteId !== id)
}
