<script lang="ts">
  type Props = {
    expanded?: boolean
    disabled?: boolean
    label?: string
    variant?: 'map' | 'category-list' | 'favorites-list'
    controls?: string
    element?: HTMLButtonElement
    onclick?: (event: MouseEvent) => void
  }

  let {
    expanded = $bindable(false),
    disabled = false,
    label,
    variant = 'map',
    controls,
    element = $bindable(),
    onclick,
  }: Props = $props()

  const accessibleLabel = $derived(
    label ?? (expanded ? 'Recolher mapa' : 'Expandir mapa'),
  )
  const buttonClass = $derived(
    variant === 'category-list' ? 'directory-results__expand category-results__expand'
      : variant === 'favorites-list' ? 'directory-results__expand favorites-results__expand'
        : 'expand-button',
  )

  function toggle(event: MouseEvent) {
    expanded = !expanded
    onclick?.(event)
  }
</script>

<button
  bind:this={element}
  class={buttonClass}
  type="button"
  {disabled}
  aria-label={accessibleLabel}
  aria-pressed={variant !== 'favorites-list' ? expanded : undefined}
  aria-expanded={variant === 'favorites-list' ? expanded : undefined}
  aria-controls={controls}
  title={variant === 'map' ? accessibleLabel : undefined}
  onclick={toggle}
>
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    {#if variant === 'map'}
      <path d="M14 5h5v5M19 5l-8 8M10 19H5v-5M5 19l8-8" />
    {:else if variant === 'category-list' && expanded}
      <path d="M8 3v5H3m18 0h-5V3M3 16h5v5m13-5h-5v5" />
    {:else}
      <path d="M14 4h6v6m0-6-7 7M10 20H4v-6m0 6 7-7" />
    {/if}
  </svg>
</button>
