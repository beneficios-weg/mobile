import type { MapPosition } from './mapTypes'

export type TravelMode = 'driving' | 'walking' | 'cycling'
export const travelModes: { id: TravelMode; label: string; description: string }[] = [
  { id: 'driving', label: 'Carro', description: 'De carro' },
  { id: 'walking', label: 'A pé', description: 'A pé' },
  { id: 'cycling', label: 'Bicicleta', description: 'De bicicleta' },
]

export type RouteStep = {
  instruction: string
  distanceMeters: number
  location: MapPosition
}
export type DrivingRoute = {
  coordinates: [number, number][]
  distanceMeters: number
  durationSeconds: number
  steps: RouteStep[]
  via: string
}
export type DirectionsPlan = {
  origin: MapPosition
  options: DrivingRoute[]
  selected: number
  mode: TravelMode
}

export function isPosition(value: unknown): value is MapPosition {
  if (!value || typeof value !== 'object') return false
  const p = value as MapPosition
  return Number.isFinite(p.latitude) && Math.abs(p.latitude) <= 90 &&
    Number.isFinite(p.longitude) && Math.abs(p.longitude) <= 180
}

function geoPosition(value: unknown): MapPosition {
  if (!Array.isArray(value) || value.length < 2 || !isPosition({ latitude: value[1], longitude: value[0] })) {
    throw new Error('O serviço de rotas retornou coordenadas inválidas.')
  }
  return { latitude: value[1], longitude: value[0] }
}

function nonnegative(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

/** Converts the OSRM response into presentation data, without HTML or remote messages. */
export function parseDrivingRoute(value: unknown): DrivingRoute {
  const data = value as { code?: string; routes?: unknown[] } | null
  if (data?.code === 'NoRoute' || data?.code === 'NoSegment') {
    throw new Error('Não foi encontrada uma rota para este modo de transporte entre a partida e o estabelecimento.')
  }
  if (data?.code !== 'Ok' || !Array.isArray(data.routes)) throw new Error('Não foi possível calcular o trajeto. Tente novamente.')
  const route = data.routes[0] as { distance?: number; duration?: number; geometry?: { coordinates?: unknown[] }; legs?: { summary?: string; steps?: unknown[] }[] } | undefined
  if (!route || !nonnegative(route.distance) || !nonnegative(route.duration) ||
    !Array.isArray(route.geometry?.coordinates) || route.geometry.coordinates.length < 2) {
    throw new Error('O serviço retornou uma rota incompleta. Tente novamente.')
  }
  const coordinates = route.geometry.coordinates.map((point): [number, number] => {
    const p = geoPosition(point)
    return [p.latitude, p.longitude]
  })
  const steps: RouteStep[] = []
  if (Array.isArray(route.legs)) for (const leg of route.legs) {
    if (!Array.isArray(leg?.steps)) continue
    for (const raw of leg.steps) {
      const step = raw as { name?: string; distance?: number; maneuver?: { type?: string; modifier?: string; exit?: number; location?: unknown } } | null
      if (!step?.maneuver || !nonnegative(step.distance)) continue
      steps.push({
        instruction: maneuverInstruction(
          typeof step.maneuver.type === 'string' ? step.maneuver.type : '',
          typeof step.maneuver.modifier === 'string' ? step.maneuver.modifier : undefined,
          typeof step.name === 'string' ? step.name : undefined,
          step.maneuver.exit,
        ),
        distanceMeters: step.distance,
        location: geoPosition(step.maneuver.location),
      })
    }
  }
  const via = Array.isArray(route.legs) ? route.legs.map(leg => typeof leg?.summary === 'string' ? leg.summary : '').filter(Boolean).join(' · ') : ''
  return { coordinates, distanceMeters: route.distance, durationSeconds: route.duration, steps, via }
}

export function parseRouteOptions(value: unknown): DrivingRoute[] {
  const first = parseDrivingRoute(value)
  const data = value as { routes: unknown[] }
  const routes = [first]
  const seen = new Set([JSON.stringify(first.coordinates)])
  for (const alternative of data.routes.slice(1, 4)) {
    try {
      const route = parseDrivingRoute({ code: 'Ok', routes: [alternative] })
      const key = JSON.stringify(route.coordinates)
      if (!seen.has(key)) { routes.push(route); seen.add(key) }
    } catch { /* An invalid alternative must not replace the usable recommended route. */ }
  }
  return routes
}

export function maneuverInstruction(type: string, modifier?: string, street?: string, exit?: number) {
  const road = street?.trim() ? ` em ${street.trim()}` : ''
  const direction = modifier?.includes('left') ? 'à esquerda' : modifier?.includes('right') ? 'à direita' : ''
  if (type === 'arrive') return 'Chegue ao destino'
  if (type === 'depart') return `Siga${road}`
  if (modifier === 'uturn') return `Faça o retorno${road}`
  if (type === 'roundabout' || type === 'rotary') return `Na rotatória, ${Number.isInteger(exit) && exit! > 0 ? `pegue a ${exit}ª saída` : 'siga a saída indicada'}${road}`
  if (type === 'exit roundabout' || type === 'exit rotary') return `Saia da rotatória${road}`
  if (type === 'merge') return `Entre na via${direction ? ` ${direction}` : ''}${road}`
  if (type === 'on ramp') return `Pegue o acesso${direction ? ` ${direction}` : ''}${road}`
  if (type === 'off ramp') return `Pegue a saída${direction ? ` ${direction}` : ''}${road}`
  if (type === 'fork' || type === 'keep') return `Mantenha-se${direction ? ` ${direction}` : ' na via'}${road}`
  if (type === 'end of road') return `No fim da via, ${direction ? `vire ${direction}` : 'continue'}${road}`
  if (direction) return `${modifier?.startsWith('slight') ? 'Vire levemente' : 'Vire'} ${direction}${road}`
  return `Continue em frente${road}`
}

export function formatRouteDistance(meters: number) {
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km`
}

export function formatRouteDuration(seconds: number) {
  const minutes = Math.max(1, Math.ceil(seconds / 60))
  if (minutes < 60) return `${minutes} min`
  return `${Math.floor(minutes / 60)} h${minutes % 60 ? ` ${minutes % 60} min` : ''}`
}
