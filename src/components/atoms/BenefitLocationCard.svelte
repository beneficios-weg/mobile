<script lang="ts">
  import type { Benefit } from '../../services/benefitsService'

  type Props = {
    benefit: Benefit
    distance?: string
    selected?: boolean
    onclick?: (event: MouseEvent) => void
  }

  let { benefit, distance = '', selected = false, onclick }: Props = $props()
</script>

<article class="benefit-card" class:selected>
  <button
    type="button"
    class="benefit-card__main"
    aria-pressed={selected}
    {onclick}
  >
    <span class="benefit-card__avatar" aria-hidden="true">
      {benefit.name.trim().charAt(0).toUpperCase()}
    </span>
    <span class="benefit-card__content">
      <strong class="benefit-card__name">{benefit.name}</strong>
      <span class="benefit-card__meta">
        {benefit.locationLabel || benefit.category}{#if distance} · {distance}{/if}
      </span>
      {#if benefit.offerLabel}
        <span class="benefit-card__offer">{benefit.offerLabel}</span>
      {/if}
    </span>
  </button>
  <button
    class="favorite-button"
    type="button"
    aria-label={`Favoritar ${benefit.name}`}
    title="Favoritar local"
  >
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20.8 8.8c0 4.3-8.8 10.1-8.8 10.1S3.2 13.1 3.2 8.8a4.6 4.6 0 0 1 8.8-1.7 4.6 4.6 0 0 1 8.8 1.7Z" />
    </svg>
  </button>
</article>
