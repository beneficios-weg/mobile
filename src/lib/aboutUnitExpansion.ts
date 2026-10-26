type Options = {
  expanded: boolean
  expansionMode?: 'area' | 'content'
  onsettled?: (expanded: boolean) => void
}

/** Waits for neighboring cards to fade before expanding into their space. */
export function aboutUnitExpansion(slot: HTMLElement, initial: Options) {
  const card = slot.querySelector<HTMLElement>('.expandable-about-unit-card')!
  const viewport = card.querySelector<HTMLElement>('.expandable-about-unit-card__viewport')!
  const text = card.querySelector<HTMLElement>('.expandable-about-unit-card__description')!
  const title = card.querySelector<HTMLElement>('.expandable-about-unit-card__title')!
  const area = slot.closest<HTMLElement>('[data-about-unit-area]')
  const lateralArea = slot.closest<HTMLElement>('.about-unit-card-grid') ?? area ?? slot
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
  let options = initial
  let expanded = initial.expanded
  let animations: Animation[] = []
  let generation = 0
  let lastWidth = -1
  let lastAreaHeight = -1
  let lastTextHeight = -1
  let lastTitleHeight = -1
  let lastAvailableWidth = -1
  let moving = false
  function measure(open: boolean, width: number) {
    const clone = card.cloneNode(true) as HTMLElement
    clone.classList.toggle('expanded', open)
    clone.removeAttribute('id')
    clone.querySelectorAll('[id]').forEach((element) => element.removeAttribute('id'))
    clone.setAttribute('aria-hidden', 'true')
    clone.inert = true
    clone.style.cssText = `position:fixed;visibility:hidden;pointer-events:none;left:0;top:0;width:${width}px;height:auto;min-height:124px`
    const cloneViewport = clone.querySelector<HTMLElement>('.expandable-about-unit-card__viewport')!
    const cloneText = clone.querySelector<HTMLElement>('.expandable-about-unit-card__description')!
    cloneViewport.style.height = 'auto'
    cloneText.style.display = ''
    cloneText.style.width = 'auto'
    cloneText.style.webkitLineClamp = ''
    cloneText.style.overflow = ''
    slot.append(clone)
    try {
      const bounds = clone.getBoundingClientRect()
      const content = cloneViewport.getBoundingClientRect()
      const style = getComputedStyle(clone)
      return {
        height: bounds.height,
        textHeight: content.height,
        textWidth: cloneText.getBoundingClientRect().width,
        overhead: content.top - bounds.top + Number.parseFloat(style.paddingBottom) + Number.parseFloat(style.borderBottomWidth),
      }
    } finally {
      clone.remove()
    }
  }

  function rememberSizes() {
    lastWidth = slot.getBoundingClientRect().width
    lastAreaHeight = area?.getBoundingClientRect().height ?? 0
    lastTextHeight = text.getBoundingClientRect().height
    lastTitleHeight = title.getBoundingClientRect().height
    lastAvailableWidth = lateralArea.getBoundingClientRect().width
  }

  function layout(animate = false) {
    const bounds = slot.getBoundingClientRect()
    if (bounds.width <= 0) return
    const previous = card.getBoundingClientRect()
    const previousTextHeight = viewport.getBoundingClientRect().height
    const previousTextWidth = text.getBoundingClientRect().width
    const lateralBounds = lateralArea.getBoundingClientRect()
    const growsWithContent = options.expansionMode === 'content'
    viewport.style.scrollbarGutter = growsWithContent ? 'auto' : ''
    const collapsed = measure(false, bounds.width)
    const full = measure(true, lateralBounds.width)
    const targetWidth = expanded ? lateralBounds.width : bounds.width
    const targetLeft = expanded ? lateralBounds.left - bounds.left : 0
    const availableHeight = area ? area.getBoundingClientRect().bottom - bounds.top : full.height
    const fullHeight = Math.max(collapsed.height, full.height)
    const expandedHeight = growsWithContent ? fullHeight : Math.min(fullHeight, Math.max(collapsed.height, availableHeight))
    const height = expanded ? expandedHeight : collapsed.height
    const textHeight = expanded ? Math.min(full.textHeight, Math.max(0, height - full.overhead)) : collapsed.textHeight
    const scrollable = expanded && full.textHeight > textHeight + 1
    const current = ++generation
    animations.forEach((animation) => animation.cancel())
    animations = []
    moving = animate && !preference.matches

    // Content expansion reserves its full height in the page instead of scrolling inside the card.
    slot.style.height = `${growsWithContent ? moving ? bounds.height : height : collapsed.height}px`
    Object.assign(card.style, {
      position: 'absolute', top: '0', minHeight: '0', zIndex: expanded || moving ? '2' : '1',
      left: `${moving ? previous.left - bounds.left : targetLeft}px`,
      width: `${moving ? previous.width : targetWidth}px`,
      height: `${moving ? previous.height : height}px`,
    })
    viewport.style.height = `${moving ? previousTextHeight : textHeight}px`
    viewport.classList.toggle('is-scrollable', scrollable)
    viewport.tabIndex = scrollable ? 0 : -1
    viewport.setAttribute('role', 'region')
    viewport.setAttribute('aria-label', `Descrição de ${title.textContent ?? 'unidade'}`)
    text.style.display = expanded || moving ? 'block' : ''
    text.style.webkitLineClamp = expanded || moving ? 'unset' : ''
    text.style.overflow = expanded || moving ? 'visible' : ''
    text.style.width = `${moving ? previousTextWidth : expanded ? full.textWidth : collapsed.textWidth}px`
    text.style.opacity = '1'
    if (!expanded) viewport.scrollTop = 0

    const finish = () => {
      if (generation !== current) return
      if (!expanded) {
        text.style.display = ''
        text.style.webkitLineClamp = ''
        text.style.overflow = ''
      }
      card.style.zIndex = expanded ? '2' : '1'
      animations = []
      moving = false
      rememberSizes()
      options.onsettled?.(expanded)
    }

    function moveCardAndText() {
      if (generation !== current) return
      const from = card.getBoundingClientRect()
      const fromTextHeight = viewport.getBoundingClientRect().height
      const targetTextWidth = expanded ? full.textWidth : collapsed.textWidth
      const timing = { duration: expanded ? 420 : 320, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
      const startTime = document.timeline.currentTime
      const motion: Animation[] = []
      const track = (animation: Animation) => {
        if (startTime !== null) animation.startTime = startTime
        animations.push(animation)
        motion.push(animation)
      }

      card.style.width = `${targetWidth}px`
      card.style.left = `${targetLeft}px`
      card.style.height = `${height}px`
      if (growsWithContent) slot.style.height = `${height}px`
      viewport.style.height = `${textHeight}px`
      // Fix the destination line breaks once; the viewport reveals the text.
      text.style.width = `${targetTextWidth}px`

      const cardFrames: Keyframe[] = []
      const viewportFrames: Keyframe[] = []
      for (let step = 0; step <= 10; step++) {
        const progress = step / 10
        const vertical = expanded ? progress ** 1.6 : progress
        cardFrames.push({
          offset: progress,
          left: `${from.left - bounds.left + (targetLeft - from.left + bounds.left) * progress}px`,
          width: `${from.width + (targetWidth - from.width) * progress}px`,
          height: `${from.height + (height - from.height) * vertical}px`,
        })
        viewportFrames.push({ offset: progress, height: `${fromTextHeight + (textHeight - fromTextHeight) * vertical}px` })
      }

      if (Math.abs(from.width - targetWidth) > 0.5 || Math.abs(from.height - height) > 0.5 || Math.abs(from.left - bounds.left - targetLeft) > 0.5) track(card.animate(cardFrames, timing))
      if (Math.abs(fromTextHeight - textHeight) > 0.5) track(viewport.animate(viewportFrames, timing))
      if (growsWithContent && Math.abs(bounds.height - height) > 0.5) {
        track(slot.animate(cardFrames.map((frame) => ({ offset: frame.offset, height: frame.height })), timing))
      }

      if (motion.length) void Promise.all(motion.map((animation) => animation.finished)).then(finish, () => {})
      else finish()
    }

    if (!moving) finish()
    else if (expanded) {
      // Preserve the siblings' exit timing while keeping this card's text visible.
      const waitForNeighbors = card.animate([], { duration: 180 })
      animations.push(waitForNeighbors)
      waitForNeighbors.onfinish = () => {
        if (generation === current) moveCardAndText()
      }
    } else {
      moveCardAndText()
    }
    rememberSizes()
  }

  const observer = new ResizeObserver(() => {
    const resized = slot.getBoundingClientRect().width !== lastWidth || lateralArea.getBoundingClientRect().width !== lastAvailableWidth ||
      (options.expansionMode !== 'content' && (area?.getBoundingClientRect().height ?? 0) !== lastAreaHeight)
    const contentChanged = text.getBoundingClientRect().height !== lastTextHeight || title.getBoundingClientRect().height !== lastTitleHeight
    if (resized || (!moving && contentChanged)) layout()
  })
  observer.observe(slot)
  observer.observe(text)
  observer.observe(title)
  if (area) observer.observe(area)
  if (lateralArea !== area && lateralArea !== slot) observer.observe(lateralArea)
  const updatePreference = () => layout()
  preference.addEventListener('change', updatePreference)
  layout()

  return {
    update(value: Options) {
      const modeChanged = options.expansionMode !== value.expansionMode
      options = value
      if (expanded === value.expanded && !modeChanged) return
      expanded = value.expanded
      layout(true)
    },
    destroy() {
      generation++
      observer.disconnect()
      preference.removeEventListener('change', updatePreference)
      animations.forEach((animation) => animation.cancel())
    },
  }
}
