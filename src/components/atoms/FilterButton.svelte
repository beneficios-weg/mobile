<script lang="ts">
  import filterIcon from '../../assets/icons/filter.svg'

  type Props = {
    label?: string
    disabled?: boolean
    expanded?: boolean
    controls?: string
    onclick?: (event: MouseEvent) => void
  }

  let {
    label = 'Mais próximos',
    disabled = false,
    expanded,
    controls,
    onclick,
  }: Props = $props()
</script>

<button
  class="filter-button"
  type="button"
  {disabled}
  {onclick}
  aria-expanded={expanded}
  aria-controls={controls}
>
  <span>{label}</span>
  <img src={filterIcon} alt="" aria-hidden="true" />
</button>

<style>
  .filter-button {
    width: 100%;
    min-width: 0;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 0 16px;
    border: 1px solid #d8e2ec;
    border-radius: 18px;
    background: #fff;
    color: #112033;
    font: inherit;
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    text-align: left;
    cursor: pointer;
    box-shadow: 0 4px 14px rgb(0 110 250 / 10%);
    transition:
      border-color 160ms ease,
      box-shadow 160ms ease;
  }

  .filter-button:hover:not(:disabled) {
    border-color: #aebfce;
    box-shadow: 0 4px 14px rgb(0 110 250 / 16%);
  }

  .filter-button:focus-visible {
    outline: 3px solid rgb(0 87 157 / 28%);
    outline-offset: 3px;
  }

  .filter-button:disabled {
    color: #66768a;
    cursor: not-allowed;
    box-shadow: none;
  }

  img {
    width: 18px;
    height: 18px;
    flex: 0 0 18px;
  }
</style>
