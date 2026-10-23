/** Fills the available width first, then reveals the text vertically. */
export function aboutUnitExpansion(slot: HTMLElement, initial: boolean) {
  const card = slot.querySelector<HTMLElement>('.expandable-about-unit-card')!
  const viewport = card.querySelector<HTMLElement>('.expandable-about-unit-card__viewport')!
  const text = card.querySelector<HTMLElement>('.expandable-about-unit-card__description')!
  const title = card.querySelector<HTMLElement>('.expandable-about-unit-card__title')!
  const area = slot.closest<HTMLElement>('[data-about-unit-area]')
  const lateralArea = slot.closest<HTMLElement>('.about-unit-card-grid') ?? area ?? slot
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
  let expanded = initial
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
    clone.style.cssText = `position:fixed;visibility:hidden;pointer-events:none;left:0;top:0;width:${width}px;height:auto;min-height:${open ? 140 : 124}px`
    const cloneViewport = clone.querySelector<HTMLElement>('.expandable-about-unit-card__viewport')!
    const cloneText = clone.querySelector<HTMLElement>('.expandable-about-unit-card__description')!
    cloneViewport.style.height = 'auto'
    cloneText.style.display = ''
    cloneText.style.width = 'auto'
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
    const collapsed = measure(false, bounds.width)
    const full = measure(true, lateralBounds.width)
    const targetWidth = expanded ? lateralBounds.width : bounds.width
    const targetLeft = expanded ? lateralBounds.left - bounds.left : 0
    const availableHeight = area ? area.getBoundingClientRect().bottom - bounds.top : full.height
    const height = expanded ? Math.min(full.height, Math.max(collapsed.height, availableHeight)) : collapsed.height
    const textHeight = expanded ? Math.min(full.textHeight, Math.max(0, height - full.overhead)) : collapsed.textHeight
    const scrollable = expanded && full.textHeight > textHeight + 1
    const current = ++generation
    animations.forEach((animation) => animation.cancel())
    animations = []
    moving = animate && !preference.matches

    // The slot always occupies the collapsed height, even while the card opens.
    slot.style.height = `${collapsed.height}px`
    Object.assign(card.style, {
      position: 'absolute', top: '0', minHeight: '0', zIndex: expanded ? '2' : '1',
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
    text.style.width = `${moving ? previousTextWidth : expanded ? full.textWidth : collapsed.textWidth}px`
    if (!expanded) viewport.scrollTop = 0

    const finish = () => {
      if (generation !== current) return
      if (!expanded) text.style.display = ''
      text.style.width = `${expanded ? full.textWidth : collapsed.textWidth}px`
      animations = []
      moving = false
      rememberSizes()
    }

    function changeHeight(next: () => void) {
      if (generation !== current) return
      const fromHeight = card.getBoundingClientRect().height
      const fromTextHeight = viewport.getBoundingClientRect().height
      card.style.height = `${height}px`
      viewport.style.height = `${textHeight}px`
      if (Math.abs(fromHeight - height) < 1 && Math.abs(fromTextHeight - textHeight) < 1) {
        next()
        return
      }
      const timing = { duration: 320, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
      const cardAnimation = card.animate([{ height: `${fromHeight}px` }, { height: `${height}px` }], timing)
      const textAnimation = viewport.animate([{ height: `${fromTextHeight}px` }, { height: `${textHeight}px` }], timing)
      animations.push(cardAnimation, textAnimation)
      cardAnimation.onfinish = () => { if (generation === current) next() }
    }

    function changeWidth(next: () => void) {
      if (generation !== current) return
      const from = card.getBoundingClientRect()
      card.style.width = `${targetWidth}px`
      card.style.left = `${targetLeft}px`
      if (Math.abs(from.width - targetWidth) < 1 && Math.abs(from.left - bounds.left - targetLeft) < 1) {
        next()
        return
      }
      const animation = card.animate([
        { left: `${from.left - bounds.left}px`, width: `${from.width}px` },
        { left: `${targetLeft}px`, width: `${targetWidth}px` },
      ], { duration: 260, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' })
      animations.push(animation)
      animation.onfinish = () => { if (generation === current) next() }
    }

    if (!moving) finish()
    else if (expanded) {
      changeWidth(() => {
        text.style.width = `${full.textWidth}px`
        changeHeight(finish)
      })
    } else changeHeight(() => changeWidth(finish))
    rememberSizes()
  }

  const observer = new ResizeObserver(() => {
    const resized = slot.getBoundingClientRect().width !== lastWidth || lateralArea.getBoundingClientRect().width !== lastAvailableWidth ||
      (area?.getBoundingClientRect().height ?? 0) !== lastAreaHeight
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
    update(value: boolean) {
      if (expanded === value) return
      expanded = value
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
