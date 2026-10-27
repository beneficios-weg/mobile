<script lang="ts">
  import { onMount, tick, untrack } from 'svelte'
  import BackButton from './atoms/BackButton.svelte'
  import Search from './atoms/Search.svelte'
  import FloatingTabBar from './atoms/FloatingTabBar.svelte'
  import Map from './Map.svelte'
  import type { MapPlace } from '../lib/mapTypes'
  import { closeMap, navigateTab, openEstablishment, type MapContext } from '../lib/navigation.svelte'
  import './styles/map-dialog.css'

  let { context }: { context: MapContext } = $props()
  let dialog: HTMLDialogElement
  let mapComponent = $state<ReturnType<typeof Map>>()
  let opened = $state(false)
  let searchElement: HTMLDivElement
  let resultsOpen = $state(false)
  let activeResult = $state(-1)
  const initialCenter = untrack(() => context.center ?? { latitude: -26.483, longitude: -49.078 })
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim()
  const visibleBenefits = $derived(context.benefits.filter(place =>
    normalize(`${place.name} ${place.category}`).includes(normalize(context.searchValue ?? ''))))
  const showResults = $derived(resultsOpen && !!context.searchValue?.trim())

  async function selectResult(place: MapPlace) {
    context.selectedBenefitId = place.id
    context.onselect?.(place.id)
    resultsOpen = false
    activeResult = -1
    await tick()
    mapComponent?.focusBenefit(place.id)
  }

  function handleSearchKey(event: KeyboardEvent) {
    if (event.key === 'Escape' && showResults) {
      event.preventDefault()
      event.stopPropagation()
      resultsOpen = false
      activeResult = -1
    } else if (['ArrowDown', 'ArrowUp'].includes(event.key) && context.searchValue?.trim() && visibleBenefits.length) {
      event.preventDefault()
      resultsOpen = true
      activeResult = activeResult < 0
        ? (event.key === 'ArrowDown' ? 0 : visibleBenefits.length - 1)
        : (activeResult + (event.key === 'ArrowDown' ? 1 : -1) + visibleBenefits.length) % visibleBenefits.length
      void tick().then(() => document.getElementById(`map-search-result-${activeResult}`)?.scrollIntoView({ block: 'nearest' }))
    } else if (event.key === 'Enter' && showResults && visibleBenefits.length) {
      event.preventDefault()
      void selectResult(visibleBenefits[Math.max(activeResult, 0)])
    }
  }

  async function showAllBenefits() {
    context.searchValue = ''
    resultsOpen = false
    activeResult = -1
    await tick()
    mapComponent?.fitBenefits()
  }
  onMount(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    dialog.showModal()
    opened = true
    return () => {
      dialog.close()
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
    }
  })
</script>

<dialog class="map-dialog" bind:this={dialog} aria-labelledby="map-dialog-title"
  oncancel={(event) => { event.preventDefault(); closeMap() }}>
  <h1 id="map-dialog-title" class="map-dialog__title">{context.title}</h1>
  <div class="map-dialog__map">
    {#if opened}
    <Map
      bind:this={mapComponent}
      benefits={visibleBenefits}
      center={context.center}
      userLocation={context.userLocation}
      selectedBenefitId={context.selectedBenefitId}
      initialZoom={context.initialZoom ?? 13}
      onViewportChange={(viewport) => {
        context.center = viewport.center
        context.initialZoom = viewport.zoom
        context.onviewportchange?.(viewport)
      }}
      onBenefitSelect={(place) => {
        context.selectedBenefitId = place.id
        context.onselect?.(place.id)
      }}
      onBenefitOpen={(place) => openEstablishment(place.id)}
    />
    {/if}
  </div>
  <div class="map-dialog__back">
    <BackButton label="Voltar para a página anterior" onclick={closeMap} />
  </div>
  <div class="map-dialog__search" class:has-results={showResults} bind:this={searchElement}>
    <Search
      label="Buscar benefício ou local no mapa"
      placeholder="Buscar benefício ou local"
      value={context.searchValue ?? ''}
      suggestionsId="map-search-results"
      suggestionsExpanded={showResults}
      activeSuggestionId={showResults && activeResult >= 0 ? `map-search-result-${activeResult}` : undefined}
      oninput={(event) => {
        context.searchValue = (event.currentTarget as HTMLInputElement).value
        resultsOpen = true
        activeResult = -1
      }}
      onfocus={() => { resultsOpen = true }}
      onblur={(event) => { if (!searchElement.contains(event.relatedTarget as Node | null)) resultsOpen = false }}
      onkeydown={handleSearchKey}
    />
    {#if showResults}
      <div class="map-dialog__results">
        <p class="map-dialog__results-count" role="status">{visibleBenefits.length} {visibleBenefits.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}</p>
          <ul id="map-search-results" role="listbox" aria-label="Benefícios encontrados">
            {#each visibleBenefits as place, index (place.id)}
              <li role="presentation">
                <button id={`map-search-result-${index}`} class="map-dialog__result" class:highlighted={activeResult === index}
                  type="button" role="option" tabindex="-1" aria-selected={activeResult === index}
                  onclick={() => selectResult(place)}>
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>
                  <span><strong>{place.name}</strong><span>{place.category}</span></span>
                </button>
              </li>
            {/each}
          </ul>
        {#if !visibleBenefits.length}
          <p class="map-dialog__empty">Nenhum benefício encontrado nesta visualização.</p>
        {/if}
      </div>
    {/if}
  </div>
  <div class="map-dialog__controls" role="group" aria-label="Controles do mapa">
    <button class="back-button" type="button" aria-label="Aumentar zoom" onclick={() => mapComponent?.changeZoom(1)} disabled={(context.initialZoom ?? 13) >= 18}>
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
    </button>
    <button class="back-button" type="button" aria-label="Diminuir zoom" onclick={() => mapComponent?.changeZoom(-1)} disabled={(context.initialZoom ?? 13) <= 4}>
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14" /></svg>
    </button>
    <button class="back-button" type="button" aria-label="Centralizar mapa" onclick={() => mapComponent?.recenter(context.userLocation ?? initialCenter)}>
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m12 3 7 18-7-4-7 4 7-18Z" /></svg>
    </button>
  </div>
  <button class="map-dialog__all" type="button" onclick={showAllBenefits} disabled={!context.benefits.length}>Todos os benefícios</button>
  <FloatingTabBar selected="map" ontabchange={(tab) => { if (tab !== 'map') navigateTab(tab) }} />
</dialog>
