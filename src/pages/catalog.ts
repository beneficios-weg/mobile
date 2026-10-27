import { previewFavorites, type FavoritePlace } from './favorites'
import { previewEstablishment, type EstablishmentDetails } from './establishment'
import { demoBenefits } from '../services/benefitsService'

/** Local presentation fixtures only; these records are not an API contract. */
export type DirectoryPlace = FavoritePlace & { categorySlug: string }
export const categories = [
  { slug: 'clientes-weg', label: 'Clientes WEG', icon: 'clients', tone: 'sky' },
  { slug: 'educacao', label: 'Educação', icon: 'education', tone: 'lavender' },
  { slug: 'idiomas', label: 'Idiomas', icon: 'languages', tone: 'mint' },
  { slug: 'cursos-e-treinamentos', label: 'Cursos e Treinamentos', icon: 'training', tone: 'amber' },
  { slug: 'saude-e-bem-estar', label: 'Saúde e Bem-Estar', icon: 'health', tone: 'coral' },
  { slug: 'lazer', label: 'Lazer', icon: 'leisure', tone: 'rose' },
  { slug: 'estetica-e-vestuario', label: 'Estética e Vestuário', icon: 'apparel', tone: 'slate' },
] as const

const health: FavoritePlace[] = [
  { id: 'move', name: 'Academia Move', neighborhood: 'Centro', distanceKm: 0.8, discount: 20, latitude: -26.3043, longitude: -48.8464 },
  { id: 'visao', name: 'Ótica Visão', neighborhood: 'Centro', distanceKm: 0.8, discount: 12, latitude: -26.3051, longitude: -48.8448 },
  { id: 'bem-viver', name: 'Clínica Bem Viver', neighborhood: 'Centro', distanceKm: 0.8, discount: 15, latitude: -26.3029, longitude: -48.8491 },
  { id: 'move-vila', name: 'Academia Move', neighborhood: 'Vila Nova', distanceKm: 1.4, discount: 20, latitude: -26.2948, longitude: -48.9127 },
  { id: 'saude-farmacia', name: 'Farmácia Saúde', neighborhood: 'América', distanceKm: 2.1, discount: 10, latitude: -26.2816, longitude: -48.8505 },
  { id: 'studio-ativa', name: 'Studio Ativa', neighborhood: 'Vila Nova', distanceKm: 2.6, discount: 15, latitude: -26.2972, longitude: -48.9098 },
  { id: 'vitalis', name: 'Centro Vitalis', neighborhood: 'Centro', distanceKm: 3.4, discount: 18, latitude: -26.3071, longitude: -48.8428 },
  { id: 'medilife', name: 'MediLife Clínica', neighborhood: 'América', distanceKm: 4.1, discount: 12, latitude: -26.2798, longitude: -48.8474 },
]
const hours: Record<string, NonNullable<FavoritePlace['openingHours']>> = {
  move: { days: [1, 2, 3, 4, 5, 6], opensAt: '06:00', closesAt: '22:00' },
  visao: { days: [1, 2, 3, 4, 5, 6], opensAt: '09:00', closesAt: '19:00' },
  'bem-viver': { days: [1, 2, 3, 4, 5], opensAt: '08:00', closesAt: '18:00' },
  'move-vila': { days: [0, 1, 2, 3, 4, 5, 6], opensAt: '06:00', closesAt: '22:00' },
  'saude-farmacia': { days: [0, 1, 2, 3, 4, 5, 6], opensAt: '08:00', closesAt: '22:00' },
  'studio-ativa': { days: [1, 2, 3, 4, 5, 6], opensAt: '07:00', closesAt: '21:00' },
  vitalis: { days: [1, 2, 3, 4, 5], opensAt: '08:00', closesAt: '18:00' },
  medilife: { days: [1, 2, 3, 4, 5], opensAt: '08:00', closesAt: '20:00' },
}
export const categoryPlaces: DirectoryPlace[] = [
  ...health.map(place => ({ ...place, categorySlug: 'saude-e-bem-estar', openingHours: hours[place.id] })),
  { id: 'centro-educacional', name: 'Centro Educacional', categorySlug: 'educacao', neighborhood: 'Centro', distanceKm: 1.2, discount: 15, latitude: -26.306, longitude: -48.84 },
  { id: 'clube-de-idiomas', name: 'Clube de Idiomas', categorySlug: 'idiomas', neighborhood: 'Centro', distanceKm: 1.6, discount: 10, latitude: -26.289, longitude: -48.824 },
  { id: 'cursos-weg', name: 'Cursos WEG', categorySlug: 'cursos-e-treinamentos', neighborhood: 'Centro', distanceKm: 2.0, discount: 15, latitude: -26.28, longitude: -48.852 },
  { id: 'loja-parceira', name: 'Loja Parceira', categorySlug: 'clientes-weg', neighborhood: 'Centro', distanceKm: 1.4, discount: 10, latitude: -26.303, longitude: -48.813 },
]

// The pre-existing favorites examples describe separate units in another map region.
// Namespace their IDs so they cannot overwrite the category units with the same old ID.
export const favoriteExamples: DirectoryPlace[] = previewFavorites.map(place => ({ ...place, id: `favorito-${place.id}`, categorySlug: 'saude-e-bem-estar' }))
const galleryPlaces: DirectoryPlace[] = demoBenefits.map((place, index) => ({
  id: place.id, name: place.name, neighborhood: place.locationLabel ?? 'Centro',
  latitude: place.latitude, longitude: place.longitude, distanceKm: index ? 1.2 : 0.8,
  discount: index ? 20 : 15, categorySlug: index ? 'saude-e-bem-estar' : 'alimentacao',
}))
export const previewCatalog = [...categoryPlaces, ...favoriteExamples, ...galleryPlaces]
export const previewVisitedPlaces = categoryPlaces.filter(place => place.categorySlug === 'saude-e-bem-estar')
export const homePlaces = ['move', 'centro-educacional', 'clube-de-idiomas', 'studio-ativa', 'cursos-weg', 'loja-parceira']
  .map(id => categoryPlaces.find(place => place.id === id)!)

export function findCategory(slug: string) {
  if (slug === 'alimentacao') return { slug, label: 'Alimentação', icon: 'clients', tone: 'amber' } as const
  return categories.find(category => category.slug === slug)
}
export function placesForCategory(slug: string) {
  return [...categoryPlaces, ...galleryPlaces.filter(place => place.categorySlug === 'alimentacao')].filter(place => place.categorySlug === slug)
}
export function findPlace(id: string) { return previewCatalog.find(place => place.id === (id === 'academia-move' ? 'move' : id)) }

export function establishmentDetails(place: DirectoryPlace): EstablishmentDetails {
  if (place.id === 'move') return { ...previewEstablishment, id: place.id, latitude: place.latitude, longitude: place.longitude }
  return {
    id: place.id,
    name: place.name,
    neighborhood: place.neighborhood,
    address: 'Endereço não informado',
    openingStatus: place.openingHours ? 'Horário de atendimento' : 'Horário não informado',
    openingHours: place.openingHours ? `${place.openingHours.opensAt}–${place.openingHours.closesAt}` : 'Consulte o estabelecimento',
    contact: '',
    latitude: place.latitude,
    longitude: place.longitude,
    discounts: [{ value: `${place.discount}%`, description: 'de desconto no benefício de demonstração' }],
    audience: previewEstablishment.audience,
    participation: ['Consulte o estabelecimento para confirmar as condições de participação no benefício.'],
    description: `${place.name}, no bairro ${place.neighborhood}. Este cadastro é um exemplo local para navegar entre a lista e os detalhes. Informações adicionais da unidade ainda não foram disponibilizadas.`,
    services: ['Serviços não informados'],
  }
}
