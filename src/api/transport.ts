import { Capacitor, CapacitorHttp } from '@capacitor/core'
import { createClient, type Transport } from './client'

const nativeUrl = (import.meta.env.VITE_API_URL || 'https://weg-benefits-api.onrender.com').replace(/\/$/, '')
// Browser builds need a same-origin reverse proxy to preserve HttpOnly/SameSite cookies.
const webUrl = (import.meta.env.VITE_API_PROXY_PATH || '/backend').replace(/\/$/, '')
export const transport: Transport = async (method, path, body) => {
  const headers = { Accept: 'application/json', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) }
  if (Capacitor.isNativePlatform()) {
    if (!nativeUrl.startsWith('https://')) throw new Error('HTTPS required')
    const response = await CapacitorHttp.request({
      url: `${nativeUrl}${path}`, method, headers, data: body,
      connectTimeout: 300_000, readTimeout: 300_000, responseType: 'json',
    })
    return { status: response.status, data: response.data }
  }
  const response = await fetch(`${webUrl}${path}`, {
    method, headers, credentials: 'include', signal: AbortSignal.timeout(300_000),
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
  const text = await response.text()
  let data: unknown = null
  try { data = text ? JSON.parse(text) : null } catch { /* Do not expose HTML, infrastructure details or raw errors. */ }
  return { status: response.status, data }
}
export const api = createClient(transport)
