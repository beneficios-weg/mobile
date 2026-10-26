type Options = {
  description: string
  expanded: boolean
  onoverflow: (overflowing: boolean) => void
}

export function fitDescription(text: string, width: number, measureWidth: (value: string) => number) {
  if (measureWidth(text) <= width) return text
  const words = text.split(' ')
  let start = 0
  let end = words.length - 1
  while (start < end) {
    const count = Math.ceil((start + end) / 2)
    if (measureWidth(`${words.slice(0, count).join(' ')}...`) <= width) start = count
    else end = count - 1
  }
  return `${words.slice(0, start).join(' ')}...`
}

/** Moves the same description from beside the value to below it. */
export function benefitDescriptionMotion(node: HTMLElement, initial: Options) {
  const title = node.querySelector<HTMLElement>('.benefit-details-card__value')
  const description = node.querySelector<HTMLElement>('.benefit-details-card__description')
  const textElement = node.querySelector<HTMLElement>('.benefit-details-card__description-text')
  if (!title || !description || !textElement) return

  let options = initial
  let animations: Animation[] = []
  let generation = 0
  let lastWidth = -1
  let lastTitleWidth = -1
  let lastTitleHeight = -1
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)')

  function layout(animate = false) {
    if (!title || !description || !textElement) return
    const row = node.getBoundingClientRect()
    const titleBounds = title.getBoundingClientRect()
    const previous = description.getBoundingClientRect()
    const lineHeight = Number.parseFloat(getComputedStyle(description).lineHeight) || 20
    const inlineLeft = Math.min(row.width, titleBounds.width + 16)
    const inlineWidth = Math.max(0, row.width - inlineLeft)
    const inlineTop = Math.max(0, titleBounds.height - lineHeight)
    const text = options.description.trim()
    const normalized = text.replace(/\s+/g, ' ')
    lastWidth = row.width
    lastTitleWidth = titleBounds.width
    lastTitleHeight = titleBounds.height

    const ruler = description.cloneNode(false) as HTMLElement
    ruler.removeAttribute('id')
    ruler.setAttribute('aria-hidden', 'true')
    ruler.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;left:0;top:0;width:max-content;height:auto;white-space:pre;overflow:visible'
    node.append(ruler)
    let preview: string
    let fullHeight: number
    try {
      preview = fitDescription(normalized, Math.max(0, inlineWidth - 1), (candidate) => {
        ruler.textContent = candidate
        return ruler.getBoundingClientRect().width
      })
      ruler.style.width = `${row.width}px`
      ruler.style.whiteSpace = 'pre-line'
      ruler.textContent = text
      fullHeight = ruler.getBoundingClientRect().height
    } finally {
      ruler.remove()
    }

    const target = options.expanded
      ? { left: 0, top: titleBounds.height + 4, width: row.width, height: fullHeight }
      : { left: inlineLeft, top: inlineTop, width: inlineWidth, height: lineHeight }
    const targetRowHeight = Math.max(titleBounds.height, target.top + target.height)
    const to = {
      left: `${target.left}px`,
      top: `${target.top}px`,
      width: `${target.width}px`,
      height: `${target.height}px`,
    }

    const currentGeneration = ++generation
    animations.forEach((animation) => animation.cancel())
    animations = []
    const shouldAnimate = animate && !preference.matches && row.width > 0
    textElement.textContent = options.expanded || shouldAnimate ? text : preview
    // Keep line wrapping stable while the surrounding viewport moves and opens.
    textElement.style.width = `${row.width}px`
    Object.assign(description.style, to)
    node.style.height = `${targetRowHeight}px`

    if (shouldAnimate) {
      const timing = { duration: 420, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
      const textFrames: Keyframe[] = []
      const rowFrames: Keyframe[] = []
      const startLeft = previous.left - row.left
      const startTop = previous.top - row.top
      const extraHeight = row.height - Math.max(titleBounds.height, startTop + previous.height)
      for (let step = 0; step <= 20; step++) {
        const progress = step / 20
        // A curved path clears the title, without stopping between directions.
        const horizontal = options.expanded ? progress ** 3 : 1 - (1 - progress) ** 3
        const vertical = options.expanded ? 1 - (1 - progress) ** 4 : progress ** 4
        const top = startTop + (target.top - startTop) * vertical
        const height = previous.height + (target.height - previous.height) * horizontal
        textFrames.push({
          offset: progress,
          left: `${startLeft + (target.left - startLeft) * horizontal}px`,
          top: `${top}px`,
          width: `${previous.width + (target.width - previous.width) * horizontal}px`,
          height: `${height}px`,
        })
        rowFrames.push({
          offset: progress,
          height: `${Math.max(titleBounds.height, top + height) + extraHeight * (1 - progress)}px`,
        })
      }
      const textAnimation = description.animate(textFrames, timing)
      const heightAnimation = node.animate(rowFrames, timing)
      animations = [textAnimation, heightAnimation]
      textAnimation.onfinish = () => {
        if (generation !== currentGeneration) return
        if (!options.expanded) textElement.textContent = preview
        animations = []
      }
    }

    options.onoverflow(preview !== normalized)
  }

  // Ignore height notifications produced by the animation itself.
  const observer = new ResizeObserver(() => {
    const bounds = node.getBoundingClientRect()
    const titleBounds = title.getBoundingClientRect()
    if (bounds.width !== lastWidth || titleBounds.width !== lastTitleWidth || titleBounds.height !== lastTitleHeight) {
      layout()
    }
  })
  observer.observe(node)
  observer.observe(title)
  const updatePreference = () => layout()
  preference.addEventListener('change', updatePreference)
  layout()

  return {
    update(next: Options) {
      const changed = next.expanded !== options.expanded
      const descriptionChanged = next.description !== options.description
      options = next
      if (changed || descriptionChanged) layout(changed)
    },
    destroy() {
      generation++
      observer.disconnect()
      preference.removeEventListener('change', updatePreference)
      animations.forEach((animation) => animation.cancel())
    },
  }
}
