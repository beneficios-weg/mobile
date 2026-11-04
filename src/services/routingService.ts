import type { MapPosition } from '../lib/mapTypes'
import { isPosition, parseRouteOptions, type DrivingRoute, type TravelMode } from '../lib/directions'

export type RouteResult = DrivingRoute
const OSRM_BASE_URL = (import.meta.env?.VITE_OSRM_URL || 'https://router.project-osrm.org').replace(/\/$/, '')
const MODE_URLS: Record<TravelMode, string> = {
  driving: OSRM_BASE_URL,
  walking: (import.meta.env?.VITE_OSRM_WALKING_URL || 'https://routing.openstreetmap.de/routed-foot').replace(/\/$/, ''),
  cycling: (import.meta.env?.VITE_OSRM_CYCLING_URL || 'https://routing.openstreetmap.de/routed-bike').replace(/\/$/, ''),
}
let nextPublicRequest = 0

async function respectPublicLimit(base: string, signal: AbortSignal) {
  if (!base.startsWith('https://routing.openstreetmap.de/')) return
  const now = Date.now()
  const start = Math.max(now, nextPublicRequest)
  nextPublicRequest = start + 1100
  if (start === now) return
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve() }, start - now)
    const abort = () => { clearTimeout(timer); reject(signal.reason) }
    signal.addEventListener('abort', abort, { once: true })
    if (signal.aborted) abort()
  })
}

/** OSRM receives longitude,latitude; the UI receives Leaflet's latitude,longitude. */
export async function getDrivingRoute(origin: MapPosition, destination: MapPosition, signal?: AbortSignal): Promise<RouteResult> {
  return (await getRouteOptions(origin, destination, 'driving', signal))[0]
}

export async function getRouteOptions(origin: MapPosition, destination: MapPosition, mode: TravelMode, signal?: AbortSignal): Promise<RouteResult[]> {
  if (!isPosition(origin) || !isPosition(destination)) throw new Error('A origem ou o destino não possui coordenadas válidas.')
  signal?.throwIfAborted()
  const controller = new AbortController()
  const abort = () => controller.abort(signal?.reason)
  signal?.addEventListener('abort', abort, { once: true })
  const timer = setTimeout(() => controller.abort(new DOMException('Tempo limite ao calcular a rota.', 'TimeoutError')), 20_000)
  try {
    const base = MODE_URLS[mode]
    if (!base) throw new Error('Modo de transporte não disponível.')
    await respectPublicLimit(base, controller.signal)
    controller.signal.throwIfAborted()
    const points = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`
    const response = await fetch(`${base}/route/v1/${mode}/${points}?overview=full&geometries=geojson&steps=true&alternatives=3`, { signal: controller.signal })
    if (!response.ok) throw new Error('O serviço de rotas está indisponível. Tente novamente em instantes.')
    return parseRouteOptions(await response.json())
  } catch (error) {
    if (controller.signal.aborted) throw controller.signal.reason
    if (error instanceof SyntaxError) throw new Error('O serviço retornou uma resposta inválida. Tente novamente.')
    if (error instanceof TypeError) throw new Error('Não foi possível conectar ao serviço de rotas. Verifique sua conexão e tente novamente.')
    throw error
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', abort)
  }
}
