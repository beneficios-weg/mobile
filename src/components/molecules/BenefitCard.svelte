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
