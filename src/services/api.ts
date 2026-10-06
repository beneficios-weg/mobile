import { createClient } from '@supabase/supabase-js'
import { sessionStorageAdapter } from './native'
import { Capacitor } from '@capacitor/core'

const url = import.meta.env.VITE_SUPABASE_URL
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
export const api = url && publishableKey ? createClient(url, publishableKey, {
  auth: { storageKey: 'weg-benefits-auth', storage: sessionStorageAdapter, flowType: 'pkce', detectSessionInUrl: false, persistSession: true },
}) : null

export async function authCallback(url: string) {
  if (!api) return false
  const parsed = new URL(url)
  const code = parsed.searchParams.get('code')
  if (!code) return false
  const { error } = await api.auth.exchangeCodeForSession(code)
  if (error) throw error
  return true
}
export function redirectUrl() {
  return Capacitor.isNativePlatform()
    ? 'benefits://auth/callback' : `${location.origin}/`
}
