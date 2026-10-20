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

<style>
  .benefit-card {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border: 1px solid #d8e2ec;
    border-radius: 18px;
    background: #fff;
    box-shadow: 0 4px 14px rgb(0 110 250 / 10%);
    transition:
      border-color 160ms ease,
      box-shadow 160ms ease;
  }

  .benefit-card.selected {
    border-color: #0878e8;
    box-shadow: 0 0 0 2px rgb(8 120 232 / 12%), 0 4px 14px rgb(0 110 250 / 14%);
  }

  .benefit-card__main {
    min-width: 0;
    flex: 1;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }

  .benefit-card__avatar {
    width: 46px;
    height: 46px;
    flex: 0 0 46px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: #e8f3fb;
    color: #00579d;
    font: 700 16px/1 system-ui, sans-serif;
  }

  .benefit-card__content {
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .benefit-card__name {
    overflow: hidden;
    max-width: 100%;
    color: #14243a;
    font: 650 13px/1.25 system-ui, sans-serif;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .benefit-card__meta {
    color: #75859b;
    font: 400 12px/1.25 system-ui, sans-serif;
  }

  .benefit-card__offer {
    padding: 3px 8px;
    border-radius: 999px;
    background: #e6f6ee;
    color: #178553;
    font: 700 11px/1.2 system-ui, sans-serif;
  }

  .favorite-button {
    width: 40px;
    height: 40px;
    flex: 0 0 40px;
    display: grid;
    place-items: center;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: #00579d;
    cursor: pointer;
  }

  .favorite-button:hover {
    background: #f1f7fb;
  }

  .favorite-button svg {
    width: 22px;
    height: 22px;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .favorite-button:focus-visible,
  .benefit-card__main:focus-visible {
    outline: 3px solid rgb(0 87 157 / 24%);
    outline-offset: 2px;
  }
</style>
