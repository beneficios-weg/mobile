<script lang="ts">
  type Props = {
    label?: string
    disabled?: boolean
    onclick?: (event: MouseEvent) => void
  }

  let { label = 'Voltar', disabled = false, onclick }: Props = $props()
</script>

<button type="button" {disabled} {onclick} aria-label={label}>
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
</button>

<style>
  button {
    width: 44px;
    height: 44px;
    flex: 0 0 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    padding: 0;
    border: 1px solid #d8e2ec;
    border-radius: 50%;
    background: #fff;
    color: #1b2938;
    box-shadow: 0 8px 24px rgb(17 32 51 / 12%);
    cursor: pointer;
    transition:
      box-shadow 160ms ease,
      transform 160ms ease;
  }

  button:hover:not(:disabled) {
    box-shadow: 0 10px 28px rgb(17 32 51 / 16%);
  }

  button:active:not(:disabled) {
    transform: scale(0.96);
  }

  button:focus-visible {
    outline: 3px solid rgb(0 87 157 / 28%);
    outline-offset: 3px;
  }

  button:disabled {
    color: #9aafc1;
    cursor: not-allowed;
    box-shadow: none;
  }

  svg {
    width: 20px;
    height: 20px;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
</style>
