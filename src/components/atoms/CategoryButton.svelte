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

  const tones: Record<CategoryButtonTone, { background: string; foreground: string }> = {
    sky: { background: '#DBF4FF', foreground: '#5DB7E5' },
    lavender: { background: '#F0EEFC', foreground: '#8277E8' },
    mint: { background: '#E9F7F2', foreground: '#3FAF84' },
    amber: { background: '#FFF3DF', foreground: '#E7A94B' },
    coral: { background: '#FFEBEB', foreground: '#F06D5D' },
    rose: { background: '#F6E8F2', foreground: '#9B5C82' },
    slate: { background: '#E8EDF7', foreground: '#5B6F9E' },
  }

  let {
    label,
    icon,
    tone = 'sky',
    selected = false,
    disabled = false,
    onclick,
  }: Props = $props()

  let colors = $derived(tones[tone])
</script>

<button
  type="button"
  class="category-button"
  class:selected
  {disabled}
  aria-pressed={selected}
  style={`--category-background: ${colors.background}; --category-foreground: ${colors.foreground}`}
  {onclick}
>
  {#if icon}
    <img class="icon" src={icon} alt="" aria-hidden="true" />
  {/if}
  <span>{label}</span>
</button>

<style>
  .category-button {
    width: 100%;
    min-width: 0;
    min-height: 58px;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    box-sizing: border-box;
    padding: 6px 10px;
    border: 1px solid transparent;
    border-radius: 18px;
    background: var(--category-background);
    color: var(--category-foreground);
    font: inherit;
    font-size: 11px;
    font-weight: 700;
    line-height: 12px;
    text-align: center;
    white-space: nowrap;
    cursor: pointer;
    box-shadow: 0 4px 12px rgb(17 32 51 / 8%);
    transition:
      box-shadow 160ms ease,
      transform 160ms ease,
      opacity 160ms ease;
  }

  .category-button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 14px rgb(17 32 51 / 12%);
  }

  .category-button:active:not(:disabled) {
    transform: translateY(0);
  }

  .category-button:focus-visible {
    outline: 3px solid rgb(0 87 157 / 30%);
    outline-offset: 3px;
  }

  .category-button.selected {
    border-color: var(--category-foreground);
    box-shadow:
      0 0 0 2px color-mix(in srgb, var(--category-foreground) 20%, transparent),
      0 4px 12px rgb(17 32 51 / 8%);
  }

  .category-button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    box-shadow: none;
  }

  .icon {
    width: 20px;
    height: 20px;
    flex: 0 0 20px;
    object-fit: contain;
  }
</style>
