<script lang="ts">
  type Props = {
    id?: string
    label: string
    type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url'
    name?: string
    placeholder?: string
    value?: string
    autocomplete?: string
    required?: boolean
    disabled?: boolean
    invalid?: boolean
    describedBy?: string
  }

  let {
    id,
    label,
    type = 'text',
    name,
    placeholder = label,
    value = $bindable(''),
    autocomplete,
    required = false,
    disabled = false,
    invalid = false,
    describedBy,
  }: Props = $props()
</script>

<div class="input-field" class:invalid class:disabled>
  <label class="visually-hidden" for={id}>{label}</label>
  <input
    {id}
    {type}
    {name}
    {placeholder}
    {autocomplete}
    {required}
    {disabled}
    bind:value
    aria-label={id ? undefined : label}
    aria-invalid={invalid ? 'true' : undefined}
    aria-describedby={describedBy}
  />
</div>

<style>
  .input-field {
    width: 100%;
    min-height: 56px;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    padding: 0 22px;
    border: 1px solid #d8e2ec;
    border-radius: 18px;
    background: #fff;
    box-shadow: 0 4px 14px rgb(0 110 250 / 10%);
    transition:
      border-color 160ms ease,
      box-shadow 160ms ease;
  }

  .input-field:focus-within {
    border-color: #0878e8;
    box-shadow: 0 0 0 3px rgb(8 120 232 / 14%);
  }

  .input-field.invalid {
    border-color: #c73535;
  }

  .input-field.invalid:focus-within {
    box-shadow: 0 0 0 3px rgb(199 53 53 / 14%);
  }

  .input-field.disabled {
    background: #f4f6f8;
    box-shadow: none;
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

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
