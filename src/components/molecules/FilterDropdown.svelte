<script lang="ts">
  import FilterButton from '../atoms/FilterButton.svelte'

  type Props = {
    id?: string
    options?: string[]
    value?: string[]
    onapply?: (selected: string[]) => void
  }

  const defaultOptions = [
    'Esportes e Atividade Física',
    'Saúde e Bem-Estar',
    'Educação',
    'Lazer',
    'Idiomas',
    'Beleza e Vestuário',
  ]
  const defaultValue: string[] = []

  let {
    id = 'category-filter',
    options = defaultOptions,
    value = $bindable([...defaultValue]),
    onapply,
  }: Props = $props()

  let isOpen = $state(false)
  let draftFilters = $state([...value])
  let root: HTMLDivElement

  const panelId = $derived(`${id}-panel`)
  const titleId = $derived(`${id}-title`)

  function toggleOpen() {
    if (isOpen) {
      applyFilters()
      return
    }

    draftFilters = [...value]
    isOpen = true
  }

  function toggleFilter(filter: string) {
    const nextFilters = draftFilters.includes(filter)
      ? draftFilters.filter((selected) => selected !== filter)
      : [...draftFilters, filter]
    draftFilters = nextFilters
    value = [...nextFilters]
  }

  function clearFilters() {
    draftFilters = []
    value = []
  }

  function applyFilters() {
    isOpen = false
    onapply?.([...value])
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

  const visibleFilters = $derived(isOpen ? draftFilters : value)
  const noFilters = $derived(visibleFilters.length === 0)
  const selectedLabel = $derived(noFilters ? 'Mais próximos' : visibleFilters.join('; '))
</script>

<svelte:window onclick={closeOnOutsideClick} onkeydown={handleKeydown} />

<div class="filter-dropdown" bind:this={root}>
  <FilterButton
    label={selectedLabel}
    expanded={isOpen}
    controls={panelId}
    {noFilters}
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
      <h2 id={titleId}>Categorias</h2>
      <button
        class="filter-dropdown__clear"
        type="button"
        disabled={draftFilters.length === 0}
        onclick={clearFilters}
      >
        Limpar
      </button>
    </header>

    <div class="filter-dropdown__options">
      {#each options as option (option)}
        <label class="filter-dropdown__option" class:selected={draftFilters.includes(option)}>
          <input
            type="checkbox"
            checked={draftFilters.includes(option)}
            onchange={() => toggleFilter(option)}
          />
          <span>{option}</span>
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
