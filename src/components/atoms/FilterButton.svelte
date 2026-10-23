<script lang="ts">
  type Props = {
    label: string
    expanded: boolean
    controls: string
    noFilters?: boolean
    onclick: (event: MouseEvent) => void
  }

  let { label, expanded, controls, noFilters = false, onclick }: Props = $props()
</script>

<button
  class="filter-button"
  class:filter-button--empty={noFilters}
  type="button"
  aria-haspopup="dialog"
  aria-expanded={expanded}
  aria-controls={controls}
  {onclick}
>
  <svg class="filter-button__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M3 5h5m4 0h5M3 15h9m4 0h1" />
    <circle cx="10" cy="5" r="1.5" />
    <circle cx="14" cy="15" r="1.5" />
  </svg>
  <span class="filter-button__label" title={label}>{label}</span>
  {#if !noFilters}
    <svg class="filter-button__chevron" class:expanded viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="m5.8 7.5 4.2 4.2 4.2-4.2" />
    </svg>
  {/if}
</button>
