<script lang="ts">
  import FilterButton from '../atoms/FilterButton.svelte'

  export type EstablishmentFilterOption =
    | 'name-asc'
    | 'name-desc'
    | 'discount'
    | 'nearest'
    | 'open-now'

  export type EstablishmentFilterState = EstablishmentFilterOption[]

  type Props = {
    id?: string
    value?: EstablishmentFilterState
    available?: EstablishmentFilterOption[]
    onapply?: (selected: EstablishmentFilterState) => void
  }

  const options: { value: EstablishmentFilterOption; label: string }[] = [
    { value: 'name-asc', label: 'Ordem Alfabética Crescente' },
    { value: 'name-desc', label: 'Ordem Alfabética Decrescente' },
    { value: 'discount', label: 'Maior Desconto' },
    { value: 'nearest', label: 'Mais Próximo' },
    { value: 'open-now', label: 'Em Horário de Funcionamento' },
  ]

  let {
    id = 'establishment-filter',
    value = $bindable<EstablishmentFilterState>([]),
    onapply,
    available = ['name-asc', 'name-desc', 'discount', 'nearest', 'open-now'],
  }: Props = $props()

  let isOpen = $state(false)
  let draftValue = $state<EstablishmentFilterState>([...value])
  let root: HTMLDivElement

  const panelId = $derived(`${id}-panel`)
  const titleId = $derived(`${id}-title`)
  const visibleValue = $derived(isOpen ? draftValue : value)
  const selectedLabel = $derived(
    visibleValue.length
      ? visibleValue.map((value) => options.find((option) => option.value === value)!.label).join('; ')
      : available.includes('nearest') ? 'Mais Próximo' : 'Ordenar',
  )
  const canClear = $derived(draftValue.length > 0)

  function isSelected(option: EstablishmentFilterOption) {
    return draftValue.includes(option)
  }

  function isDisabled(option: EstablishmentFilterOption) {
    if (option === 'name-asc') return draftValue.includes('name-desc')
    if (option === 'name-desc') return draftValue.includes('name-asc')
    return false
  }

  function toggleOption(option: EstablishmentFilterOption) {
    if (isDisabled(option)) return
    draftValue = draftValue.includes(option)
      ? draftValue.filter((selected) => selected !== option)
      : [...draftValue, option]
    value = [...draftValue]
  }

  function clearFilters() {
    draftValue = []
    value = []
  }

  function applyFilters() {
    isOpen = false
    onapply?.([...value])
  }

  function toggleOpen() {
    if (isOpen) {
      applyFilters()
      return
    }

    draftValue = [...value]
    isOpen = true
  }

  function closeOnOutsideClick(event: MouseEvent) {
    if (isOpen && root && !root.contains(event.target as Node)) applyFilters()
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isOpen) {
      applyFilters()
      root?.querySelector('button')?.focus()
    }
  }
</script>

<svelte:window onclick={closeOnOutsideClick} onkeydown={handleKeydown} />

<div class="filter-dropdown" bind:this={root}>
  <FilterButton
    label={selectedLabel}
    expanded={isOpen}
    controls={panelId}
    noFilters={false}
    onclick={toggleOpen}
  />

  <div
    class="filter-dropdown__panel"
    class:visible={isOpen}
    id={panelId}
    role="dialog"
    aria-labelledby={titleId}
    aria-hidden={!isOpen}
    inert={!isOpen}
  >
    <header class="filter-dropdown__header">
      <h2 id={titleId}>Filtros</h2>
      <button
        class="filter-dropdown__clear"
        type="button"
        disabled={!canClear}
        onclick={clearFilters}
      >
        Limpar
      </button>
    </header>

    <div class="filter-dropdown__options">
      {#each options.filter(option => available.includes(option.value)) as option (option.value)}
        <label
          class="filter-dropdown__option"
          class:selected={isSelected(option.value)}
          class:disabled={isDisabled(option.value)}
        >
          <input
            type="checkbox"
            checked={isSelected(option.value)}
            disabled={isDisabled(option.value)}
            onchange={() => toggleOption(option.value)}
          />
          <span>{option.label}</span>
        </label>
      {/each}
    </div>

    <footer class="filter-dropdown__actions">
      <button class="filter-dropdown__apply" type="button" onclick={applyFilters}>
        Concluir
      </button>
    </footer>
  </div>
</div>
