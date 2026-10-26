<script lang="ts">
  import { onMount, tick } from 'svelte'
  import BackButton from '../components/atoms/BackButton.svelte'
  import ExpandButton from '../components/atoms/ExpandButton.svelte'
  import FloatingTabBar from '../components/atoms/FloatingTabBar.svelte'
  import Map from '../components/Map.svelte'
  import ResultsCount from '../components/atoms/ResultsCount.svelte'
  import ScrollShadow from '../components/atoms/ScrollShadow.svelte'
  import Search from '../components/atoms/Search.svelte'
  import FilterDropdown, { type EstablishmentFilterState } from '../components/molecules/FilterDropdown.svelte'
  import EstablishmentCard from '../components/molecules/EstablishmentCard.svelte'
  import { filterFavorites, type FavoritePlace } from './favorites'
  import './styles/FavoritesPage.css'

  type Props = {
    places?: FavoritePlace[]
    onback?: () => void
    onremovefavorite?: (id: string) => void
    onnavigate?: (tab: 'home' | 'map' | 'favorites' | 'history') => void
  }

  let { places = [], onback, onremovefavorite, onnavigate }: Props = $props()

  let searchValue = $state('')
  let filterSelection = $state<EstablishmentFilterState>([])
  let appliedFilters = $state<EstablishmentFilterState>([])
  let currentTime = $state(new Date())
  let selectedPlaceId = $state<string | null>(null)
  let selectedTab = $state<'home' | 'map' | 'favorites' | 'history'>('favorites')
  let listExpanded = $state(false)
  let showTopShadow = $state(false)
  let showBottomShadow = $state(false)
  let listElement = $state<HTMLDivElement>()
  let expandButton = $state<HTMLButtonElement>()
  let expandedHeader: HTMLDivElement

  const visiblePlaces = $derived(filterFavorites(places, searchValue, appliedFilters, currentTime))
  const mapBenefits = $derived(visiblePlaces.map((place) => ({
    id: place.id,
    name: place.name,
    category: 'Favorito',
    latitude: place.latitude,
    longitude: place.longitude,
  })))

  function updateScrollShadows() {
    if (!listElement) return
    showTopShadow = listElement.scrollTop > 0
    showBottomShadow = listElement.scrollTop + listElement.clientHeight < listElement.scrollHeight - 1
  }

  async function toggleExpanded() {
    listExpanded = !listExpanded
    await updateExpandedFocus()
  }

  async function updateExpandedFocus() {
    await tick()
    if (listExpanded) expandedHeader?.querySelector('button')?.focus()
    else expandButton?.focus()
    updateScrollShadows()
  }

  async function selectPlace(id: string, scrollToCard = false) {
    selectedPlaceId = id
    if (scrollToCard) {
      await tick()
      listElement?.querySelector('[data-selected="true"]')?.scrollIntoView({ block: 'nearest' })
    }
  }

  function applyFilters(filters: EstablishmentFilterState) {
    appliedFilters = [...filters]
  }

  onMount(() => {
    if (!listElement) return
    const observer = new ResizeObserver(updateScrollShadows)
    observer.observe(listElement)
    updateScrollShadows()
    const clock = window.setInterval(() => (currentTime = new Date()), 60_000)
    return () => {
      observer.disconnect()
      window.clearInterval(clock)
    }
  })

  $effect(() => {
    visiblePlaces
    listExpanded
    if (!listElement) return
    const frame = requestAnimationFrame(updateScrollShadows)
    return () => cancelAnimationFrame(frame)
  })

  $effect(() => {
    if (selectedPlaceId && !visiblePlaces.some((place) => place.id === selectedPlaceId)) {
      selectedPlaceId = null
    }
  })
</script>

<svelte:head>
  <title>Favoritos — WEG Benefits</title>
</svelte:head>

<svelte:window onkeydown={(event) => {
  if (event.key === 'Escape' && listExpanded) void toggleExpanded()
}} />

<main class="directory-page favorites-page" class:list-expanded={listExpanded}>
  <section class="directory-map-column favorites-map-column" aria-label="Mapa de favoritos">
    <header class="directory-map-header favorites-map-header" inert={listExpanded}>
      <BackButton onclick={onback} />
      <h1 class="directory-page__title">Favoritos</h1>
    </header>

    <div class="directory-map favorites-map" role="region" aria-label="Mapa dos estabelecimentos favoritos" inert={listExpanded}>
      <Map
        variant="default"
        benefits={mapBenefits}
        selectedBenefitId={selectedPlaceId}
        onBenefitSelect={(benefit) => selectPlace(benefit.id, true)}
      />
    </div>

    <FloatingTabBar bind:selected={selectedTab} ontabchange={onnavigate} />
  </section>

  <section class="directory-results favorites-results" aria-labelledby="favorites-results-title">
    <div class="directory-results__controls favorites-results__controls">
      <div bind:this={expandedHeader} class="directory-results__expanded-header favorites-results__expanded-header">
        <BackButton label="Voltar para o mapa" onclick={toggleExpanded} />
        <h2 class="directory-page__title">Favoritos</h2>
      </div>
      <h2 id="favorites-results-title" class="directory-results__title favorites-results__title">Estabelecimentos favoritos</h2>

      <Search bind:value={searchValue} label="Buscar locais ou benefícios" placeholder="Buscar locais ou benefícios" />

      <FilterDropdown bind:value={filterSelection} onapply={applyFilters} />

      <div class="directory-results__count-row favorites-results__count-row">
        <ResultsCount count={visiblePlaces.length} />
        <ExpandButton
          variant="favorites-list"
          bind:element={expandButton}
          bind:expanded={listExpanded}
          label={listExpanded ? 'Voltar para o mapa' : 'Expandir lista de favoritos'}
          controls="favorites-list"
          onclick={updateExpandedFocus}
        />
      </div>
    </div>

    <div class="directory-results__list-frame favorites-results__list-frame">
      <ScrollShadow edge="top" visible={showTopShadow} />
      <div
        bind:this={listElement}
        id="favorites-list"
        class="directory-results__list favorites-results__list"
        role="region"
        aria-label="Estabelecimentos favoritos encontrados"
        onscroll={updateScrollShadows}
      >
        {#each visiblePlaces as place (place.id)}
          <EstablishmentCard
            variant="favorites"
            name={place.name}
            neighborhood={place.neighborhood}
            distanceKm={place.distanceKm}
            discount={place.discount}
            selected={selectedPlaceId === place.id}
            liked
            favoriteDisabled={!onremovefavorite}
            onselect={() => selectPlace(place.id)}
            onlikedchange={() => onremovefavorite?.(place.id)}
          />
        {:else}
          <div class="favorites-results__empty" role="status">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.8 8.8c0 4.3-8.8 10.1-8.8 10.1S3.2 13.1 3.2 8.8a4.6 4.6 0 0 1 8.8-1.7 4.6 4.6 0 0 1 8.8 1.7Z" /></svg>
            <strong>{places.length ? 'Nenhum estabelecimento encontrado' : 'Você ainda não tem favoritos'}</strong>
            <p>{places.length ? 'Tente buscar por outro nome ou benefício.' : 'Toque no coração de um estabelecimento para encontrá-lo aqui.'}</p>
          </div>
        {/each}
      </div>
      <ScrollShadow edge="bottom" visible={showBottomShadow} />
    </div>
  </section>
</main>
