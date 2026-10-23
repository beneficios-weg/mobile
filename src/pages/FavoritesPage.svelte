<script lang="ts">
  import { onMount, tick } from 'svelte'
  import BackButton from '../components/atoms/BackButton.svelte'
  import FavoriteButton from '../components/atoms/FavoriteButton.svelte'
  import FloatingTabBar from '../components/atoms/FloatingTabBar.svelte'
  import ResultsCount from '../components/atoms/ResultsCount.svelte'
  import ScrollShadow from '../components/atoms/ScrollShadow.svelte'
  import Search from '../components/atoms/Search.svelte'
  import Map from '../components/Map.svelte'
  import { filterFavorites, type FavoritePlace, type FavoritesSortOrder } from './favorites'
  import './styles/FavoritesPage.css'

  type Props = {
    places?: FavoritePlace[]
    userLocation?: { latitude: number; longitude: number } | null
    onback?: () => void
    onremovefavorite?: (id: string) => void
    onnavigate?: (tab: 'home' | 'map' | 'favorites' | 'history') => void
  }

  let { places = [], userLocation = null, onback, onremovefavorite, onnavigate }: Props = $props()

  let searchValue = $state('')
  let sortOrder = $state<FavoritesSortOrder>('nearest')
  let selectedPlaceId = $state<string | null>(null)
  let selectedTab = $state<'home' | 'map' | 'favorites' | 'history'>('favorites')
  let listExpanded = $state(false)
  let showTopShadow = $state(false)
  let showBottomShadow = $state(false)
  let listElement = $state<HTMLDivElement>()
  let expandButton: HTMLButtonElement
  let expandedHeader: HTMLDivElement

  const visiblePlaces = $derived(filterFavorites(places, searchValue, sortOrder))
  const mapBenefits = $derived(visiblePlaces.map((place) => ({
    id: place.id,
    name: place.name,
    category: place.neighborhood,
    latitude: place.latitude,
    longitude: place.longitude,
  })))
  const mapCenter = $derived(userLocation ?? (places[0] && {
    latitude: places[0].latitude,
    longitude: places[0].longitude,
  }))

  function updateScrollShadows() {
    if (!listElement) return
    showTopShadow = listElement.scrollTop > 0
    showBottomShadow = listElement.scrollTop + listElement.clientHeight < listElement.scrollHeight - 1
  }

  async function toggleExpanded() {
    listExpanded = !listExpanded
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

  onMount(() => {
    if (!listElement) return
    const observer = new ResizeObserver(updateScrollShadows)
    observer.observe(listElement)
    updateScrollShadows()
    return () => observer.disconnect()
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

<main class="favorites-page" class:list-expanded={listExpanded}>
  <section class="favorites-map-column" aria-label="Mapa de favoritos">
    <header class="favorites-map-header" inert={listExpanded}>
      <BackButton onclick={onback} />
      <h1>Favoritos</h1>
    </header>

    <div class="favorites-map" role="region" aria-label="Mapa dos estabelecimentos favoritos" inert={listExpanded}>
      <Map
        benefits={mapBenefits}
        variant="category"
        center={mapCenter}
        initialZoom={13}
        selectedBenefitId={selectedPlaceId}
        {userLocation}
        onBenefitSelect={(benefit) => void selectPlace(benefit.id, true)}
      />
    </div>

    <FloatingTabBar bind:selected={selectedTab} ontabchange={(tab) => {
      selectedTab = 'favorites'
      onnavigate?.(tab)
    }} />
  </section>

  <section class="favorites-results" aria-labelledby="favorites-results-title">
    <div class="favorites-results__controls">
      <div bind:this={expandedHeader} class="favorites-results__expanded-header">
        <BackButton label="Voltar para o mapa" onclick={toggleExpanded} />
        <h2>Favoritos</h2>
      </div>
      <h2 id="favorites-results-title" class="favorites-results__title">Estabelecimentos favoritos</h2>

      <Search bind:value={searchValue} label="Buscar locais ou benefícios" placeholder="Buscar locais ou benefícios" />

      <label class="favorites-sort">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 7h10m4 0h2M4 17h2m4 0h10m-6-13 4 3-4 3M10 14l-4 3 4 3" />
        </svg>
        <select bind:value={sortOrder} aria-label="Ordenar estabelecimentos favoritos">
          <option value="nearest">Mais próximos</option>
          <option value="name">Nome (A–Z)</option>
          <option value="discount">Maior desconto</option>
        </select>
      </label>

      <div class="favorites-results__count-row">
        <ResultsCount count={visiblePlaces.length} />
        <button
          bind:this={expandButton}
          class="favorites-results__expand"
          type="button"
          aria-label={listExpanded ? 'Voltar para o mapa' : 'Expandir lista de favoritos'}
          aria-expanded={listExpanded}
          aria-controls="favorites-list"
          onclick={toggleExpanded}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M14 4h6v6m0-6-7 7M10 20H4v-6m0 6 7-7" />
          </svg>
        </button>
      </div>
    </div>

    <div class="favorites-results__list-frame">
      <ScrollShadow edge="top" visible={showTopShadow} />
      <div
        bind:this={listElement}
        id="favorites-list"
        class="favorites-results__list"
        role="region"
        aria-label="Estabelecimentos favoritos encontrados"
        onscroll={updateScrollShadows}
      >
        {#each visiblePlaces as place (place.id)}
          <article class="favorites-card" class:selected={selectedPlaceId === place.id} data-selected={selectedPlaceId === place.id} aria-label={place.name}>
            <button class="favorites-card__main" type="button" aria-pressed={selectedPlaceId === place.id} onclick={() => selectPlace(place.id)}>
              <span class="favorites-card__avatar" aria-hidden="true">{place.name.charAt(0).normalize('NFD').replace(/\p{Diacritic}/gu, '')}</span>
              <span class="favorites-card__content">
                <strong>{place.name}</strong>
                <span>{place.neighborhood} · {place.distanceKm.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km</span>
                <span class="favorites-card__offer">{place.discount}% OFF</span>
              </span>
            </button>
            <FavoriteButton liked disabled={!onremovefavorite} onlikedchange={() => onremovefavorite?.(place.id)} />
          </article>
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
