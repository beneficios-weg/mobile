import type { Page } from './types'

export type Transport = (method: string, path: string, body?: unknown) => Promise<{ status: number; data: unknown }>
export class ApiError extends Error {
  readonly status: number
  constructor(status: number, publicMessage?: string) {
    super(publicMessage ?? (status === 401 ? 'Sessão ou conta indisponível. Entre novamente para continuar.'
      : status === 403 ? 'Sua conta não tem acesso a esta operação.'
      : status === 404 ? 'Este registro não está mais disponível.'
      : status === 0 ? 'Não foi possível conectar. Verifique a conexão e tente novamente.'
      : 'Não foi possível concluir a operação. Tente novamente.'))
    this.status = status
  }
}
export function createClient(transport: Transport) {
  async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
    let response
    try { response = await transport(method, path, body) }
    catch { throw new ApiError(0) }
    if (response.status < 200 || response.status >= 300) throw new ApiError(response.status)
    return response.data as T
  }
  async function all<T>(path: string, size = 100): Promise<T[]> {
    const result: T[] = []
    let page = 0
    let totalPages = 1
    do {
      const data = await request<Page<T>>('GET', `${path}${path.includes('?') ? '&' : '?'}page=${page}&size=${size}`)
      if (!data || !Array.isArray(data.content) || !Number.isInteger(data.totalPages) || data.totalPages < 0) throw new ApiError(502)
      result.push(...data.content)
      totalPages = data.totalPages
      page++
    } while (page < totalPages)
    return result
  }
  return { request, all }
}

/** Acknowledgements never remove a newer toggle queued while a request was in flight. */
export function acknowledge<T extends { key: string }>(queue: T[], sentKey: string): T[] {
  return queue.filter(operation => operation.key !== sentKey)
}
