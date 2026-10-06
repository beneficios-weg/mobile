import { distanceMeters, type Establishment } from '../domain/models'
import { isAndroid, native, position, storage, type MonitoringConfiguration } from './native'

export interface VisitParameters {
  dwellMs: number; maxAccuracy: number; maxSpeed: number; maxGapMs: number
  minimumSamples: number; cooldownMs: number; geofenceRadius: number; visitRadius: number
}
export async function enableMonitoring(owner: string, establishments: Establishment[], parameters: VisitParameters) {
  if (!isAndroid) throw new Error('O monitoramento em segundo plano está disponível no Android.')
  if (!establishments.length) throw new Error('Sincronize estabelecimentos antes de ativar o monitoramento.')
  await native.requestLocation()
  const permission = await native.status()
  if (!permission.backgroundAllowed) throw new Error('Nas configurações do aplicativo, selecione localização precisa e Permitir o tempo todo. Depois volte e tente novamente.')
  const current = await position()
  const regions = [...establishments].sort((a, b) => distanceMeters(current, a) - distanceMeters(current, b)).slice(0, 100)
    .map(item => ({ id: item.id, latitude: item.latitude, longitude: item.longitude, geofenceRadius: parameters.geofenceRadius, visitRadius: parameters.visitRadius }))
  const configuration: MonitoringConfiguration = { owner, regions, ...parameters }
  await native.startMonitoring({ configuration })
  await storage.setItem(`monitoring:${owner}`, JSON.stringify(parameters))
}
export async function disableMonitoring(owner: string) {
  if (isAndroid) await native.stopMonitoring()
  await storage.removeItem(`monitoring:${owner}`)
}
