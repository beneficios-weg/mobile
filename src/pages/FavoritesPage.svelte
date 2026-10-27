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
  import { directoryView, openMap, navigateTab, openEstablishment } from '../lib/navigation.svelte'
  import type { TabId } from '../lib/routes'

  const view = directoryView('favorites')

  type Props = {
    places?: FavoritePlace[]
    userLocation?: { latitude: number; longitude: number } | null
    onback?: () => void
    onremovefavorite?: (id: string) => void
    onnavigate?: (tab: 'home' | 'map' | 'favorites' | 'history') => void
  }

  let { places = [], userLocation = null, onback, onremovefavorite, onnavigate }: Props = $props()

  let currentTime = $state(new Date())
  let selectedTab = $state<'home' | 'map' | 'favorites' | 'history'>('favorites')
  let showTopShadow = $state(false)
  let showBottomShadow = $state(false)
  let listElement = $state<HTMLDivElement>()
  let expandButton = $state<HTMLButtonElement>()
  let expandedHeader: HTMLDivElement

  const mapCenter = $derived(userLocation ?? (places[0] && {
    latitude: places[0].latitude,
    longitude: places[0].longitude,
  }))
  const visiblePlaces = $derived(filterFavorites(places, view.searchValue, view.appliedFilters, currentTime))
  const mapBenefits = $derived(visiblePlaces.map((place) => ({
    id: place.id,
    name: place.name,
    category: place.neighborhood,
    latitude: place.latitude,
    longitude: place.longitude,
  })))

  function updateScrollShadows() {
    if (!listElement) return
    view.scrollTop = listElement.scrollTop
    showTopShadow = listElement.scrollTop > 0
    showBottomShadow = listElement.scrollTop + listElement.clientHeight < listElement.scrollHeight - 1
  }

  async function toggleExpanded() {
    view.listExpanded = !view.listExpanded
    await updateExpandedFocus()
  }

  async function updateExpandedFocus() {
    await tick()
    if (view.listExpanded) expandedHeader?.querySelector('button')?.focus()
    else expandButton?.focus()
    updateScrollShadows()
  }

  async function selectPlace(id: string, scrollToCard = false) {
    view.selectedPlaceId = id
    if (scrollToCard) {
      await tick()
      listElement?.querySelector('[data-selected="true"]')?.scrollIntoView({ block: 'nearest' })
    }
  }

  function handleNavigation(tab: TabId) {
    if (tab === 'map') openMap({ title: 'Mapa de favoritos', benefits: mapBenefits, center: view.mapViewport?.center ?? mapCenter, userLocation,
      initialZoom: view.mapViewport?.zoom ?? 13, onviewportchange: (viewport) => { view.mapViewport = viewport },
      selectedBenefitId: view.selectedPlaceId, onselect: (id) => { void selectPlace(id, true) },
      onclose: () => { selectedTab = 'favorites' },
    })
    else if (onnavigate) onnavigate(tab)
    else navigateTab(tab)
  }

  function applyFilters(filters: EstablishmentFilterState) {
    view.appliedFilters = [...filters]
  }

  onMount(() => {
    view.filterSelection = [...view.appliedFilters]
    if (!listElement) return
    listElement.scrollTop = view.scrollTop
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
    view.listExpanded
    if (!listElement) return
    const frame = requestAnimationFrame(updateScrollShadows)
    return () => cancelAnimationFrame(frame)
  })

  $effect(() => {
    if (view.selectedPlaceId && !visiblePlaces.some((place) => place.id === view.selectedPlaceId)) {
      view.selectedPlaceId = null
    }
  })
</script>

<svelte:head>
  <title>Favoritos — WEG Benefits</title>
</svelte:head>

<svelte:window onkeydown={(event) => {
  if (event.key === 'Escape' && view.listExpanded) void toggleExpanded()
}} />

<main class="directory-page favorites-page" class:list-expanded={view.listExpanded}>
  <section class="directory-map-column favorites-map-column" aria-label="Mapa de favoritos">
    <header class="directory-map-header favorites-map-header" inert={view.listExpanded}>
      <BackButton onclick={onback} />
      <h1 class="directory-page__title">Favoritos</h1>
    </header>

    <div class="directory-map favorites-map" role="region" aria-label="Mapa dos estabelecimentos favoritos" inert={view.listExpanded}>
      <Map
        variant="default"
        benefits={mapBenefits}
        center={view.mapViewport?.center ?? mapCenter}
        initialZoom={view.mapViewport?.zoom ?? 13}
        onViewportChange={(viewport) => view.mapViewport = viewport}
        {userLocation}
        selectedBenefitId={view.selectedPlaceId}
        onBenefitOpen={(place) => openEstablishment(place.id)}
        onBenefitSelect={(benefit) => void selectPlace(benefit.id, true)}
      />
    </div>

    <FloatingTabBar bind:selected={selectedTab} ontabchange={handleNavigation} />
  </section>

  <section class="directory-results favorites-results" aria-labelledby="favorites-results-title">
    <div class="directory-results__controls favorites-results__controls">
      <div bind:this={expandedHeader} class="directory-results__expanded-header favorites-results__expanded-header">
        <BackButton label="Voltar para o mapa" onclick={toggleExpanded} />
        <h2 class="directory-page__title">Favoritos</h2>
      </div>
      <h2 id="favorites-results-title" class="directory-results__title favorites-results__title">Estabelecimentos favoritos</h2>

      <Search bind:value={view.searchValue} label="Buscar locais ou benefícios" placeholder="Buscar locais ou benefícios" />

      <FilterDropdown bind:value={view.filterSelection} onapply={applyFilters} />

      <div class="directory-results__count-row favorites-results__count-row">
        <ResultsCount count={visiblePlaces.length} />
        <ExpandButton
          variant="favorites-list"
          bind:element={expandButton}
          bind:expanded={view.listExpanded}
          label={view.listExpanded ? 'Voltar para o mapa' : 'Expandir lista de favoritos'}
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
            selected={view.selectedPlaceId === place.id}
            liked
            favoriteDisabled={!onremovefavorite}
            onselect={() => { view.selectedPlaceId = place.id; openEstablishment(place.id) }}
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
