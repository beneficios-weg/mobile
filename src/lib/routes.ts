export type TabId = 'home' | 'map' | 'favorites' | 'history'

export type SiteRoute = {
  kind: 'home' | 'login' | 'favorites' | 'visited' | 'preview' | 'category' | 'establishment' | 'not-found'
  key: string
  parameter?: string
}

export const routes = {
  home: '/', login: '/login', favorites: '/favoritos', visited: '/visitados', preview: '/componentes-preview',
} as const

export function categoryPath(slug: string) {
  return `/categoria/${encodeURIComponent(slug)}`
}

export function establishmentPath(id: string) {
  return `/estabelecimento/${encodeURIComponent(id)}`
}

/** Only application-relative URLs may be used for internal navigation. */
export function isInternalPath(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !/[\\\u0000-\u001f]/.test(value)
}

export function resolveRoute(input: string): SiteRoute {
  const pathname = input.split(/[?#]/, 1)[0].replace(/\/+$/, '') || '/'
  const fixed = Object.entries(routes).find(([, path]) => path === pathname)
  if (fixed) return { kind: fixed[0] === 'visited' ? 'visited' : fixed[0] as SiteRoute['kind'], key: pathname }
  const match = pathname.match(/^\/(categoria|estabelecimento)\/([^/]+)$/)
  if (match) {
    try {
      return { kind: match[1] === 'categoria' ? 'category' : 'establishment', parameter: decodeURIComponent(match[2]), key: pathname }
    } catch { /* Invalid escaped paths receive the same not-found view. */ }
  }
  return { kind: 'not-found', key: pathname }
}
