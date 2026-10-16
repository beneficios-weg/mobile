<script lang="ts">
  type Props = {
    id?: string
    label?: string
    name?: string
    placeholder?: string
    value?: string
    disabled?: boolean
    oninput?: (event: Event) => void
  }

  let {
    id,
    label = 'Buscar benefícios',
    name,
    placeholder = 'Buscar benefícios',
    value = $bindable(''),
    disabled = false,
    oninput,
  }: Props = $props()
</script>

<div class="search-field" class:disabled>
  <svg
    class="search-icon"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M15 9.16659C15 12.3882 12.3884 14.9999 9.16671 14.9999C5.94505 14.9999 3.33337 12.3882 3.33337 9.16659C3.33337 5.94492 5.94505 3.33325 9.16671 3.33325C12.3884 3.33325 15 5.94492 15 9.16659Z"
      stroke="currentColor"
      stroke-width="1.5"
    />
    <path
      d="M16.6667 16.6666L13.3334 13.3333"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
  </svg>
  <input
    {id}
    type="search"
    {name}
    {placeholder}
    {disabled}
    bind:value
    {oninput}
    aria-label={label}
  />
</div>

<style>
  .search-field {
    width: 100%;
    min-height: 56px;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    gap: 12px;
    padding: 0 22px;
    border: 1px solid #d8e2ec;
    border-radius: 18px;
    background: #fff;
    box-shadow: 0 4px 14px rgb(0 110 250 / 10%);
    color: #66768a;
    transition:
      border-color 160ms ease,
      box-shadow 160ms ease;
  }

  .search-field:focus-within {
    border-color: #0878e8;
    box-shadow: 0 0 0 3px rgb(8 120 232 / 14%);
  }

  .search-field.disabled {
    background: #f4f6f8;
    box-shadow: none;
  }

  .search-icon {
    flex: 0 0 20px;
  }

  input {
    width: 100%;
    min-width: 0;
    padding: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: #1b2938;
    font: inherit;
    font-size: 14px;
    line-height: 20px;
  }

  input::placeholder {
    color: #66768a;
    opacity: 1;
  }

  input:disabled {
    color: #66768a;
    cursor: not-allowed;
  }

  input::-webkit-search-cancel-button {
    cursor: pointer;
  }
</style>
