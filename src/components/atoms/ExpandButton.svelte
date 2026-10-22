<script lang="ts">
  type Props = {
    expanded?: boolean
    disabled?: boolean
    label?: string
    onclick?: (event: MouseEvent) => void
  }

  let {
    expanded = $bindable(false),
    disabled = false,
    label,
    onclick,
  }: Props = $props()

  const accessibleLabel = $derived(
    label ?? (expanded ? 'Recolher mapa' : 'Expandir mapa'),
  )

  function toggle(event: MouseEvent) {
    expanded = !expanded
    onclick?.(event)
  }
</script>

<button
  class="expand-button"
  type="button"
  {disabled}
  aria-label={accessibleLabel}
  aria-pressed={expanded}
  title={accessibleLabel}
  onclick={toggle}
>
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M14 5h5v5M19 5l-8 8M10 19H5v-5M5 19l8-8" />
  </svg>
</button>