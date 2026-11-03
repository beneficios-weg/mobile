import type { Category } from '../api/types'
import { cache } from '../storage/cache'

export const categoryIcons = $state<Record<string, string>>({})
const pending = new Set<string>()
export const iconCacheKey = (category: Category) => `${category.iconKey}:${category.colorHex}`

/** Download only selected icons. SVG is displayed as an image, never injected as HTML. */
export async function loadCategoryIcons(categories: Category[]) {
  await Promise.all(categories.map(async category => {
    const key = iconCacheKey(category)
    if (categoryIcons[key] || pending.has(key) || !/^[a-z0-9-]+:[a-z0-9-]+$/.test(category.iconKey) || !/^#[0-9a-f]{6}$/i.test(category.colorHex)) return
    pending.add(key)
    try {
      let blob = await cache.icon(key).catch(() => undefined)
      if (!blob) {
        const [prefix, name] = category.iconKey.split(':')
        const response = await fetch(`https://api.iconify.design/${prefix}/${name}.svg?color=${encodeURIComponent(category.colorHex)}`, {
          credentials: 'omit', signal: AbortSignal.timeout(15_000),
        })
        if (!response.ok || !response.headers.get('content-type')?.includes('image/svg+xml')) return
        const content = await response.text()
        if (content.length > 100_000 || !content.includes('<svg')) return
        blob = new Blob([content], { type: 'image/svg+xml' })
        await cache.saveIcon(key, blob).catch(() => {})
      }
      categoryIcons[key] = URL.createObjectURL(blob)
    } catch { /* Category labels and bundled fallback icons remain available. */ }
    finally { pending.delete(key) }
  }))
}
