<script lang="ts">
  export type CategoryButtonTone =
    | 'sky'
    | 'lavender'
    | 'mint'
    | 'amber'
    | 'coral'
    | 'rose'
    | 'slate'

  type Props = {
    label: string
    icon?: string
    tone?: CategoryButtonTone
    selected?: boolean
    disabled?: boolean
    onclick?: (event: MouseEvent) => void
  }

  let {
    label,
    icon,
    tone = 'sky',
    selected = false,
    disabled = false,
    onclick,
  }: Props = $props()
</script>

<button
  type="button"
  class="category-button"
  class:selected
  data-tone={tone}
  {disabled}
  aria-pressed={selected}
  {onclick}
>
  {#if icon}
    <img class="icon" src={icon} alt="" aria-hidden="true" />
  {/if}
  <span>{label}</span>
</button>
