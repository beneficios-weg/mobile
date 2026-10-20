import type { Coordinates } from './geolocationService'
import type { Benefit } from './benefitsService'

export type RouteResult = {
  coordinates: [number, number][]
  distanceMeters: number
  durationSeconds: number
}

type OsrmResponse = {
  code: string
  message?: string
  routes?: {
    distance: number
    duration: number
    geometry: { coordinates: [number, number][] }
  }[]
}

const OSRM_BASE_URL = (import.meta.env.VITE_OSRM_URL || 'https://router.project-osrm.org').replace(
  /\/$/,
  '',
)

/** Consulta o serviço de rotas OSRM. OSRM recebe coordenadas na ordem longitude,latitude. */
export async function getDrivingRoute(
  origin: Coordinates,
  destination: Pick<Benefit, 'latitude' | 'longitude'>,
  signal?: AbortSignal,
): Promise<RouteResult> {
  const coordinates = [
    `${origin.longitude},${origin.latitude}`,
    `${destination.longitude},${destination.latitude}`,
  ].join(';')
  const url = `${OSRM_BASE_URL}/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=false`

  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new Error(`O serviço de rotas respondeu com erro (${response.status}).`)
  }

  const data = (await response.json()) as OsrmResponse
  const route = data.routes?.[0]
  if (data.code !== 'Ok' || !route?.geometry.coordinates?.length) {
    throw new Error(data.message || 'Não foi encontrada uma rota de carro para este benefício.')
  }

  // Leaflet espera [latitude, longitude]; GeoJSON/OSRM fornece [longitude, latitude].
  return {
    coordinates: route.geometry.coordinates.map(([longitude, latitude]) => [latitude, longitude]),
    distanceMeters: route.distance,
    durationSeconds: route.duration,
  }
}
