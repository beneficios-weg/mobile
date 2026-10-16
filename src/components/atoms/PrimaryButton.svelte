<script lang="ts">
  type Props = {
    label: string
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    onclick?: (event: MouseEvent) => void
  }

  let {
    label,
    type = 'button',
    disabled = false,
    onclick,
  }: Props = $props()
</script>

<button {type} {disabled} {onclick}>
  {label}
</button>

<style>
  button {
    width: 100%;
    min-height: 54px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    padding: 0 20px;
    border: 0;
    border-radius: 18px;
    background: #00579d;
    color: #fff;
    font: inherit;
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
    cursor: pointer;
    transition:
      background-color 160ms ease,
      box-shadow 160ms ease;
  }

  button:hover:not(:disabled) {
    background: #00477f;
  }

  button:active:not(:disabled) {
    background: #003b69;
  }

  button:focus-visible {
    outline: 3px solid rgb(0 87 157 / 28%);
    outline-offset: 3px;
  }

  button:disabled {
    background: #9aafc1;
    cursor: not-allowed;
  }
</style>
