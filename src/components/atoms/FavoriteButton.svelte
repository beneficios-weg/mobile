<script lang="ts">
  type Props = {
    liked?: boolean
    disabled?: boolean
  }

  let { liked = $bindable(false), disabled = false }: Props = $props()

  const label = $derived(liked ? 'Remover dos favoritos' : 'Adicionar aos favoritos')
</script>

<button
  type="button"
  class="favorite-button"
  class:liked
  {disabled}
  aria-label={label}
  aria-pressed={liked}
  onclick={() => (liked = !liked)}
>
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="M17.3333 3.83336C16.9074 3.40503 16.401 3.06511 15.8432 2.83317C15.2855 2.60122 14.6874 2.48181 14.0833 2.48181C13.4792 2.48181 12.8811 2.60122 12.3234 2.83317C11.7656 3.06511 11.2592 3.40503 10.8333 3.83336L9.99996 4.66669L9.16663 3.83336C8.30467 2.9714 7.13561 2.48716 5.91663 2.48716C4.69764 2.48716 3.52858 2.9714 2.66663 3.83336C1.80468 4.69531 1.32043 5.86437 1.32043 7.08336C1.32043 8.30234 1.80468 9.4714 2.66663 10.3334L9.99996 17.5L17.3333 10.3334C17.7616 9.90743 18.1015 9.40102 18.3335 8.84327C18.5654 8.28552 18.6848 7.68742 18.6848 7.08336C18.6848 6.4793 18.5654 5.8812 18.3335 5.32344C18.1015 4.76569 17.7616 4.25929 17.3333 3.83336Z"
      stroke-width="1.66667"
      stroke-linejoin="round"
    />
  </svg>
</button>

<style>
  .favorite-button {
    width: 44px;
    height: 44px;
    display: inline-grid;
    place-items: center;
    flex: 0 0 44px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: #00579d;
    cursor: pointer;
    transition:
      background-color 160ms ease,
      transform 160ms ease;
  }

  .favorite-button:hover:not(:disabled) {
    background: rgb(0 87 157 / 8%);
  }

  .favorite-button:active:not(:disabled) {
    transform: scale(0.94);
  }

  .favorite-button:focus-visible {
    outline: 3px solid rgb(0 87 157 / 30%);
    outline-offset: 2px;
  }

  .favorite-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 20px;
    height: 20px;
    overflow: visible;
  }

  path {
    fill: transparent;
    stroke: currentColor;
    transition:
      fill 160ms ease,
      stroke 160ms ease;
  }

  .liked path {
    fill: currentColor;
    stroke: currentColor;
  }
</style>
