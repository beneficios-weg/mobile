import type { Snapshot } from '../api/types'

// IndexedDB is available in the browser and Capacitor WebView; no password or session cookie is stored here.
const database = 'weg-benefits-v1'
function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(database, 1)
    request.onupgradeneeded = () => request.result.createObjectStore('cache')
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error('Local storage unavailable'))
  })
}
async function transaction<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open()
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction('cache', mode)
      const request = operation(tx.objectStore('cache'))
      tx.oncomplete = () => resolve(request.result)
      tx.onerror = tx.onabort = () => reject(new Error('Local storage unavailable'))
    })
  } finally { db.close() }
}
export const cache = {
  active: () => transaction<number | undefined>('readonly', store => store.get('active')),
  account: async (id: number) => {
    const value = await transaction<Snapshot | undefined>('readonly', store => store.get(`account:${id}`))
    return value?.version === 1 && value.user.id === id ? value : undefined
  },
  save: (snapshot: Snapshot) => transaction('readwrite', store => store.put(snapshot, `account:${snapshot.user.id}`)),
  activate: (id: number) => transaction('readwrite', store => store.put(id, 'active')),
  deactivate: () => transaction('readwrite', store => store.delete('active')),
  icon: (key: string) => transaction<Blob | undefined>('readonly', store => store.get(`icon:${key}`)),
  saveIcon: (key: string, blob: Blob) => transaction('readwrite', store => store.put(blob, `icon:${key}`)),
}
