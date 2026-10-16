<script lang="ts">
  import FilterButton from '../atoms/FilterButton.svelte'

  type Props = {
    label?: string
    panelId?: string
  }

  let {
    label = 'Mais próximos',
    panelId = 'filter-options-panel',
  }: Props = $props()

  let isOpen = $state(false)
  let draftFilters = $state<string[]>([])
  let appliedFilters = $state<string[]>([])
  let root: HTMLDivElement
  const demoFilters = ['Aberto agora', 'Com desconto', 'Vale-refeição', 'Entrega']

  function toggleFilter(filter: string) {
    draftFilters = draftFilters.includes(filter)
      ? draftFilters.filter((selected) => selected !== filter)
      : [...draftFilters, filter]
  }

  function applyFilters() {
    appliedFilters = [...draftFilters]
    isOpen = false
  }

  function removeFilters() {
    draftFilters = []
    appliedFilters = []
  }

  function closeOnOutsideClick(event: MouseEvent) {
    if (root && !root.contains(event.target as Node)) isOpen = false
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isOpen) {
      isOpen = false
      root?.querySelector('button')?.focus()
    }
  }
</script>

<svelte:window onclick={closeOnOutsideClick} onkeydown={handleKeydown} />

<div class="filter-dropdown" bind:this={root}>
  <FilterButton
    {label}
    expanded={isOpen}
    controls={panelId}
    onclick={() => (isOpen = !isOpen)}
  />

  <section
    class="filter-panel"
    class:visible={isOpen}
    id={panelId}
    aria-labelledby={`${panelId}-title`}
    aria-hidden={!isOpen}
    inert={!isOpen}
  >
    <h2 id={`${panelId}-title`}>Filtros</h2>
    <p class="hint">Opções temporárias para teste</p>
    <div class="filter-options" aria-label="Opções de filtros de demonstração">
      {#each demoFilters as filter}
        <button
          class:selected={draftFilters.includes(filter)}
          type="button"
          aria-pressed={draftFilters.includes(filter)}
          onclick={() => toggleFilter(filter)}
        >
          {filter}
        </button>
      {/each}
    </div>
    <div class="filter-actions">
      <button
        class="clear-button"
        type="button"
        disabled={draftFilters.length === 0 && appliedFilters.length === 0}
        onclick={removeFilters}
      >
        Remover filtros
      </button>
      <button class="apply-button" type="button" onclick={applyFilters}>
        Aplicar filtros
      </button>
    </div>
  </section>
</div>

<style>
  .filter-dropdown {
    position: relative;
    width: 100%;
  }

  .filter-panel {
    position: absolute;
    z-index: 10;
    top: calc(100% + 8px);
    left: 0;
    width: 100%;
    box-sizing: border-box;
    padding: 16px;
    border: 1px solid #d8e2ec;
    border-radius: 18px;
    background: #fff;
    box-shadow: 0 8px 24px rgb(17 32 51 / 12%);
    visibility: hidden;
    opacity: 0;
    pointer-events: none;
    transform: translateY(-4px) scaleY(0.98);
    transform-origin: top center;
    transition:
      opacity 180ms ease,
      transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1),
      visibility 0s linear 220ms;
  }

  .filter-panel.visible {
    visibility: visible;
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0) scaleY(1);
    transition-delay: 0s;
  }

  h2 {
    margin: 0 0 6px;
    color: #112033;
    font: inherit;
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
  }

  p {
    margin: 0;
    color: #66768a;
    font-size: 13px;
    line-height: 18px;
  }

  .filter-options {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    margin-top: 14px;
  }

  .filter-options button {
    min-height: 42px;
    padding: 8px 12px;
    border: 1px solid #d8e2ec;
    border-radius: 12px;
    background: #fff;
    color: #112033;
    font: inherit;
    font-size: 13px;
    line-height: 18px;
    text-align: left;
    cursor: pointer;
    transition:
      background-color 160ms ease,
      border-color 160ms ease,
      color 160ms ease;
  }

  .filter-options button:hover {
    border-color: #aebfce;
  }

  .filter-options button.selected {
    border-color: #00579d;
    background: #eaf4fc;
    color: #00579d;
  }

  .filter-options button:focus-visible {
    outline: 3px solid rgb(0 87 157 / 28%);
    outline-offset: 2px;
  }

  .filter-actions {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 8px;
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px solid #e6edf3;
  }

  .filter-actions button {
    min-height: 42px;
    padding: 8px 10px;
    border-radius: 12px;
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    line-height: 18px;
    cursor: pointer;
    transition:
      background-color 160ms ease,
      border-color 160ms ease,
      color 160ms ease;
  }

  .clear-button {
    border: 1px solid #c7d2de;
    background: #f1f5f9;
    color: #33475b;
  }

  .clear-button:hover:not(:disabled) {
    border-color: #aebfce;
    background: #f8fafc;
  }

  .clear-button:disabled {
    border-color: #d3dde6;
    background: #f1f5f9;
    color: #6b7d8e;
    cursor: not-allowed;
  }

  .apply-button {
    border: 1px solid #00579d;
    background: #00579d;
    color: #fff;
  }

  .apply-button:hover {
    border-color: #00477f;
    background: #00477f;
  }

  .filter-actions button:focus-visible {
    outline: 3px solid rgb(0 87 157 / 28%);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .filter-panel {
      transition: none;
    }

    .filter-options button {
      transition: none;
    }

    .filter-actions button {
      transition: none;
    }
  }
</style>
