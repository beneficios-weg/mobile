import type { Benefit } from './benefitsService'

const STORAGE_KEY = 'weg-benefits-manual-points'

export function getManualBenefits(): Benefit[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const value: unknown = JSON.parse(stored)
    if (!Array.isArray(value)) return []

    return value.filter(
      (item): item is Benefit =>
        typeof item?.id === 'string' &&
        typeof item?.name === 'string' &&
        typeof item?.category === 'string' &&
        typeof item?.description === 'string' &&
        Number.isFinite(item?.latitude) &&
        Number.isFinite(item?.longitude),
    )
  } catch {
    return []
  }
}

export function saveManualBenefits(benefits: Benefit[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(benefits))
  } catch {
    // O mapa continua funcional se o navegador bloquear o armazenamento local.
  }
}
