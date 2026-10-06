import { Capacitor, registerPlugin } from '@capacitor/core'

export interface Region { id: string; latitude: number; longitude: number; geofenceRadius: number; visitRadius: number }
export interface MonitoringConfiguration {
  owner: string; regions: Region[]; dwellMs: number; maxAccuracy: number; maxSpeed: number
  maxGapMs: number; minimumSamples: number; cooldownMs: number
}
export interface PendingVisit { id: string; establishmentId: string; detectedAt: number; dwellMs: number }
interface BenefitsNative {
  read(options: { key: string }): Promise<{ value: string | null }>
  write(options: { key: string; value: string }): Promise<void>
  remove(options: { key: string }): Promise<void>
  secureRead(options: { key: string }): Promise<{ value: string | null }>
  secureWrite(options: { key: string; value: string | null }): Promise<void>
  requestLocation(): Promise<void>
  openSettings(): Promise<void>
  status(): Promise<{ enabled: boolean; backgroundAllowed: boolean; error: string | null }>
  position(): Promise<{ latitude: number; longitude: number }>
  startMonitoring(options: { configuration: MonitoringConfiguration }): Promise<void>
  stopMonitoring(): Promise<void>
  pendingVisits(options: { owner: string }): Promise<{ visits: PendingVisit[] }>
  acknowledgeVisit(options: { owner: string; id: string }): Promise<void>
  clearOwner(options: { owner: string }): Promise<void>
}
export const native = registerPlugin<BenefitsNative>('BenefitsNative')
export const isAndroid = Capacitor.getPlatform() === 'android'

export async function position() {
  if (isAndroid) { await native.requestLocation(); return native.position() }
  return new Promise<{ latitude: number; longitude: number }>((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(({ coords }) => resolve(coords), reject,
      { enableHighAccuracy: true, timeout: 20_000, maximumAge: 10_000 }))
}

// Browser preview persists data in IndexedDB; Android always uses native SQLite.
async function browserDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('weg-benefits', 1)
    request.onupgradeneeded = () => request.result.createObjectStore('cache')
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
async function browserOperation(key: string, value?: string, remove = false): Promise<string | null> {
  const db = await browserDatabase()
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction('cache', value === undefined && !remove ? 'readonly' : 'readwrite')
      const store = transaction.objectStore('cache')
      const request = remove ? store.delete(key) : value === undefined ? store.get(key) : store.put(value, key)
      transaction.oncomplete = () => resolve(typeof request.result === 'string' ? request.result : null)
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    })
  } finally { db.close() }
}
export const storage = {
  async getItem(key: string) { return isAndroid ? (await native.read({ key })).value : browserOperation(key) },
  async setItem(key: string, value: string) { if (isAndroid) await native.write({ key, value }); else await browserOperation(key, value) },
  async removeItem(key: string) { if (isAndroid) await native.remove({ key }); else await browserOperation(key, undefined, true) },
}
export const sessionStorageAdapter = {
  async getItem(key: string) { return isAndroid ? (await native.secureRead({ key })).value : sessionStorage.getItem(key) },
  async setItem(key: string, value: string) { if (isAndroid) await native.secureWrite({ key, value }); else sessionStorage.setItem(key, value) },
  async removeItem(key: string) { if (isAndroid) await native.secureWrite({ key, value: null }); else sessionStorage.removeItem(key) },
}
