<script lang="ts">
  type Props = {
    id?: string
    label?: string
    name?: string
    placeholder?: string
    value?: string
    disabled?: boolean
    suggestionsId?: string
    suggestionsExpanded?: boolean
    activeSuggestionId?: string
    oninput?: (event: Event) => void
    onkeydown?: (event: KeyboardEvent) => void
    onfocus?: (event: FocusEvent) => void
    onblur?: (event: FocusEvent) => void
  }

  let {
    id,
    label = 'Buscar benefícios',
    name,
    placeholder = 'Buscar benefícios',
    value = $bindable(''),
    disabled = false,
    suggestionsId,
    suggestionsExpanded = false,
    activeSuggestionId,
    oninput,
    onkeydown,
    onfocus,
    onblur,
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
    {onkeydown}
    {onfocus}
    {onblur}
    role={suggestionsId ? 'combobox' : undefined}
    aria-autocomplete={suggestionsId ? 'list' : undefined}
    aria-controls={suggestionsId}
    aria-expanded={suggestionsId ? suggestionsExpanded : undefined}
    aria-activedescendant={activeSuggestionId}
    aria-label={label}
  />
</div>
