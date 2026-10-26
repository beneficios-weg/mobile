<script lang="ts">
  import { benefitDescriptionMotion } from '../../lib/benefitDescriptionMotion'

  type Discount = {
    value: string
    description: string
  }

  type Props = {
    discounts: readonly Discount[]
    audience: string
    title?: string
    audienceLabel?: string
  }

  let {
    discounts,
    audience,
    title = 'Seu benefício',
    audienceLabel = 'Público',
  }: Props = $props()

  const id = $props.id()
  let expanded = $state<Set<number>>(new Set())
  let overflowing = $state<Set<number>>(new Set())
  let descriptions = $state<Record<number, string>>({})

  function toggle(index: number) {
    const next = new Set(expanded)
    if (next.has(index)) next.delete(index)
    else next.add(index)
    expanded = next
  }

  function setOverflow(index: number, value: boolean) {
    if (overflowing.has(index) === value) return
    const next = new Set(overflowing)
    if (value) next.add(index)
    else next.delete(index)
    overflowing = next
  function fitDescription(text: string, width: number, measureWidth: (value: string) => number) {
    if (measureWidth(text) <= width) return text

    const words = text.split(' ')
    let start = 0
    let end = words.length - 1

    while (start < end) {
      const count = Math.ceil((start + end) / 2)
      const candidate = `${words.slice(0, count).join(' ')}...`
      if (measureWidth(candidate) <= width) start = count
      else end = count - 1
    }

    return `${words.slice(0, start).join(' ')}...`
  }

  function trackOverflow(node: HTMLSpanElement, description: string) {
    const index = Number(node.dataset.index)

    function measure() {
      const text = description.trim().replace(/\s+/g, ' ')
      const ruler = document.createElement('span')
      ruler.style.cssText = 'position:fixed;visibility:hidden;width:max-content;white-space:pre;pointer-events:none'
      ruler.setAttribute('aria-hidden', 'true')
      node.append(ruler)

      let preview: string
      try {
        preview = fitDescription(text, Math.max(0, node.getBoundingClientRect().width - 1), (value) => {
          ruler.textContent = value
          return ruler.getBoundingClientRect().width
        })
      } finally {
        ruler.remove()
      }

      if (descriptions[index] !== preview) descriptions = { ...descriptions, [index]: preview }
      const hasOverflow = preview !== text
      if (overflowing.has(index) === hasOverflow) return
      const next = new Set(overflowing)
      if (hasOverflow) next.add(index)
      else next.delete(index)
      overflowing = next
    }

    const observer = new ResizeObserver(measure)
    observer.observe(node)
    measure()

    return {
      update(value: string) {
        description = value
        measure()
      },
      destroy: () => observer.disconnect(),
    }
  }
</script>

{#snippet discountContent(discount: Discount, index: number)}
  <span
    class="benefit-details-card__summary"
    use:benefitDescriptionMotion={{
      description: discount.description,
      expanded: expanded.has(index),
      onoverflow: (value) => setOverflow(index, value),
    }}
  >
    <strong class="benefit-details-card__value">{discount.value}</strong>
    <span
      class="benefit-details-card__description"
      id={`${id}-discount-${index}`}
    ><span class="benefit-details-card__description-text"></span></span>
  </span>
  <span class="benefit-details-card__summary">
    <strong class="benefit-details-card__value">{discount.value}</strong>
    <span
      class="benefit-details-card__description"
      class:concealed={expanded.has(index)}
      aria-hidden={expanded.has(index) ? 'true' : undefined}
      data-index={index}
      use:trackOverflow={discount.description}
    >{descriptions[index] ?? discount.description}</span>
  </span>
  {#if expanded.has(index)}
    <span class="benefit-details-card__full-description" id={`${id}-discount-${index}`}>
      {discount.description}
    </span>
  {/if}
{/snippet}

<section class="benefit-details-card" aria-labelledby={`${id}-title`}>
  <h2 class="benefit-details-card__title" id={`${id}-title`}>{title}</h2>
  <ul class="benefit-details-card__discounts">
    {#each discounts as discount, index}
      <li class="benefit-details-card__row">
        {#if overflowing.has(index) || expanded.has(index)}
          <button
            class="benefit-details-card__discount"
            type="button"
            aria-expanded={expanded.has(index)}
            aria-controls={`${id}-discount-${index}`}
            aria-describedby={`${id}-discount-${index}`}
            aria-controls={expanded.has(index) ? `${id}-discount-${index}` : undefined}
            aria-label={`${expanded.has(index) ? 'Recolher' : 'Expandir'} detalhes de ${discount.value}`}
            onclick={() => toggle(index)}
          >
            {@render discountContent(discount, index)}
          </button>
        {:else}
          <div class="benefit-details-card__discount">
            {@render discountContent(discount, index)}
          </div>
        {/if}
      </li>
    {/each}
  </ul>
  <div class="benefit-details-card__audience">
    <h3 class="benefit-details-card__audience-label">{audienceLabel}</h3>
    <p class="benefit-details-card__audience-text">{audience}</p>
  </div>
</section>
