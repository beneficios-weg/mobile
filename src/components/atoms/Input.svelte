<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements'

  type Props = {
    id?: string
    label: string
    type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url'
    name?: string
    placeholder?: string
    value?: string
    autocomplete?: HTMLInputAttributes['autocomplete']
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
