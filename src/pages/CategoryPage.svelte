<script lang="ts">
  import { onMount } from 'svelte'
  import BackButton from '../components/atoms/BackButton.svelte'
  import ExpandButton from '../components/atoms/ExpandButton.svelte'
  import FloatingTabBar from '../components/atoms/FloatingTabBar.svelte'
  import ResultsCount from '../components/atoms/ResultsCount.svelte'
  import ScrollShadow from '../components/atoms/ScrollShadow.svelte'
  import Search from '../components/atoms/Search.svelte'
  import FilterDropdown, { type EstablishmentFilterState } from '../components/molecules/FilterDropdown.svelte'
  import Map from '../components/Map.svelte'
  import EstablishmentCard from '../components/molecules/EstablishmentCard.svelte'
  import healthIcon from '../assets/categories/health-wellbeing.svg'

  type CategoryPlace = {
    id: string
    name: string
    neighborhood: string
    distanceKm: number
    discount: number
    latitude: number
    longitude: number
  }
  type OpeningHours = {
    days: number[]
    opensAt: string
    closesAt: string
  }
  type Props = {
    onback?: () => void
  }

  let { onback }: Props = $props()

  const places: CategoryPlace[] = [
    { id: 'move', name: 'Academia Move', neighborhood: 'Centro', distanceKm: 0.8, discount: 20, latitude: -26.3043, longitude: -48.8464 },
    { id: 'visao', name: 'Ótica Visão', neighborhood: 'Centro', distanceKm: 0.8, discount: 12, latitude: -26.3051, longitude: -48.8448 },
    { id: 'bem-viver', name: 'Clínica Bem Viver', neighborhood: 'Centro', distanceKm: 0.8, discount: 15, latitude: -26.3029, longitude: -48.8491 },
    { id: 'move-vila', name: 'Academia Move', neighborhood: 'Vila Nova', distanceKm: 1.4, discount: 20, latitude: -26.2948, longitude: -48.9127 },
    { id: 'saude-farmacia', name: 'Farmácia Saúde', neighborhood: 'América', distanceKm: 2.1, discount: 10, latitude: -26.2816, longitude: -48.8505 },
    { id: 'studio-ativa', name: 'Studio Ativa', neighborhood: 'Vila Nova', distanceKm: 2.6, discount: 15, latitude: -26.2972, longitude: -48.9098 },
    { id: 'vitalis', name: 'Centro Vitalis', neighborhood: 'Centro', distanceKm: 3.4, discount: 18, latitude: -26.3071, longitude: -48.8428 },
    { id: 'medilife', name: 'MediLife Clínica', neighborhood: 'América', distanceKm: 4.1, discount: 12, latitude: -26.2798, longitude: -48.8474 },
  ]
  const mapCenter = { latitude: -26.3045, longitude: -48.8487 }
  const openingHoursByPlace: Record<string, OpeningHours> = {
    move: { days: [1, 2, 3, 4, 5, 6], opensAt: '06:00', closesAt: '22:00' },
    visao: { days: [1, 2, 3, 4, 5, 6], opensAt: '09:00', closesAt: '19:00' },
    'bem-viver': { days: [1, 2, 3, 4, 5], opensAt: '08:00', closesAt: '18:00' },
    'move-vila': { days: [0, 1, 2, 3, 4, 5, 6], opensAt: '06:00', closesAt: '22:00' },
    'saude-farmacia': { days: [0, 1, 2, 3, 4, 5, 6], opensAt: '08:00', closesAt: '22:00' },
    'studio-ativa': { days: [1, 2, 3, 4, 5, 6], opensAt: '07:00', closesAt: '21:00' },
    vitalis: { days: [1, 2, 3, 4, 5], opensAt: '08:00', closesAt: '18:00' },
    medilife: { days: [1, 2, 3, 4, 5], opensAt: '08:00', closesAt: '20:00' },
  }

  let searchValue = $state('')
  let filterSelection = $state<EstablishmentFilterState>([])
  let appliedFilters = $state<EstablishmentFilterState>([])
  let currentTime = $state(new Date())
  let selectedPlaceId = $state<string | null>(null)
  let favoriteIds = $state<string[]>([])
  let selectedTab = $state<'home' | 'map' | 'favorites' | 'history'>('home')
  let listExpanded = $state(false)
  let showTopShadow = $state(false)
  let showBottomShadow = $state(false)
  let listElement: HTMLDivElement

  const visiblePlaces = $derived.by(() => {
    const query = searchValue.trim().toLocaleLowerCase('pt-BR')
    const filtered = places.filter((place) => {
      const matchesSearch = `${place.name} ${place.neighborhood} saúde bem-estar`
        .toLocaleLowerCase('pt-BR')
        .includes(query)
      return matchesSearch && (!appliedFilters.includes('open-now') || isPlaceOpen(place.id, currentTime))
    })

    const sortCriteria = appliedFilters.filter((option) => option !== 'open-now')
    if (!sortCriteria.length) return filtered

    return [...filtered].sort((a, b) => {
      for (const criterion of sortCriteria) {
        let comparison = 0
        if (criterion === 'name-asc') comparison = a.name.localeCompare(b.name, 'pt-BR')
        if (criterion === 'name-desc') comparison = b.name.localeCompare(a.name, 'pt-BR')
        if (criterion === 'discount') comparison = b.discount - a.discount
        if (criterion === 'nearest') comparison = a.distanceKm - b.distanceKm
        if (comparison !== 0) return comparison
      }
      return 0
    })
  })
  const mapBenefits = $derived(visiblePlaces.map((place) => ({
    id: place.id,
    name: place.name,
    category: place.neighborhood,
    latitude: place.latitude,
    longitude: place.longitude,
  })))

  function updateScrollShadows(list: HTMLDivElement) {
    showTopShadow = list.scrollTop > 0
    showBottomShadow = list.scrollTop + list.clientHeight < list.scrollHeight - 1
  }

  function isPlaceOpen(placeId: string, at: Date) {
    const hours = openingHoursByPlace[placeId]
    if (!hours || !hours.days.includes(at.getDay())) return false
    const time = at.getHours() * 60 + at.getMinutes()
    const [openHour, openMinute] = hours.opensAt.split(':').map(Number)
    const [closeHour, closeMinute] = hours.closesAt.split(':').map(Number)
    return time >= openHour * 60 + openMinute && time < closeHour * 60 + closeMinute
  }

  function applyFilters(filters: EstablishmentFilterState) {
    appliedFilters = [...filters]
  }

  function handleListScroll(event: Event) {
    updateScrollShadows(event.currentTarget as HTMLDivElement)
  }

  function toggleFavorite(placeId: string, liked: boolean) {
    favoriteIds = liked
      ? [...favoriteIds, placeId]
      : favoriteIds.filter((favoriteId) => favoriteId !== placeId)
  }

  onMount(() => {
    const resizeObserver = new ResizeObserver(() => updateScrollShadows(listElement))
    resizeObserver.observe(listElement)
    updateScrollShadows(listElement)
    const clock = window.setInterval(() => (currentTime = new Date()), 60_000)
    return () => {
      resizeObserver.disconnect()
      window.clearInterval(clock)
    }
  })

  $effect(() => {
    visiblePlaces
    if (!listElement) return
    const frame = requestAnimationFrame(() => updateScrollShadows(listElement))
    return () => cancelAnimationFrame(frame)
  })
</script>

<main class="directory-page category-page" class:list-expanded={listExpanded}>
  <section class="directory-map-column category-map-column" aria-label="Mapa da categoria">
    <header class="directory-map-header category-map-header">
      <BackButton onclick={onback} />
      <h1 class="directory-page__title category-page__title">Saúde e Bem-Estar</h1>
    </header>

    <div class="directory-map category-map" role="region" aria-label="Mapa dos estabelecimentos da categoria">
      <Map
        variant="default"
        benefits={mapBenefits}
        center={mapCenter}
        initialZoom={13}
        selectedBenefitId={selectedPlaceId}
        onBenefitSelect={(benefit) => (selectedPlaceId = benefit.id)}
      />
    </div>

    <FloatingTabBar bind:selected={selectedTab} />
  </section>

  <section class="directory-results category-results" aria-labelledby="category-results-title">
    <div class="directory-results__controls category-results__controls">
      <div class="directory-results__expanded-header category-results__expanded-header">
        <BackButton label="Voltar para o mapa" onclick={() => (listExpanded = false)} />
        <h1 class="directory-page__title category-page__title">Saúde e Bem-Estar</h1>
      </div>
      <h2 id="category-results-title" class="directory-results__title category-results__title">Estabelecimentos da categoria</h2>

      <Search
        bind:value={searchValue}
        label="Buscar locais ou benefícios"
        placeholder="Buscar locais ou benefícios"
      />

      <FilterDropdown bind:value={filterSelection} onapply={applyFilters} />

      <div class="directory-results__count-row category-results__count-row">
        <ResultsCount count={visiblePlaces.length} />
        <ExpandButton
          variant="category-list"
          bind:expanded={listExpanded}
          label={listExpanded ? 'Voltar para o mapa' : 'Expandir lista de estabelecimentos'}
        />
      </div>
    </div>

    <div class="directory-results__list-frame category-results__list-frame">
      <ScrollShadow edge="top" visible={showTopShadow} />
      <div
        bind:this={listElement}
        class="directory-results__list category-results__list"
        aria-label="Estabelecimentos encontrados"
        onscroll={handleListScroll}
      >
        {#if visiblePlaces.length}
          {#each visiblePlaces as place (place.id)}
            <EstablishmentCard
              name={place.name}
              neighborhood={place.neighborhood}
              distanceKm={place.distanceKm}
              discount={place.discount}
              selected={selectedPlaceId === place.id}
              liked={favoriteIds.includes(place.id)}
              onselect={() => (selectedPlaceId = place.id)}
              onlikedchange={(liked) => toggleFavorite(place.id, liked)}
            />
          {/each}
        {:else}
          <div class="category-results__empty" role="status">
            <img src={healthIcon} alt="" aria-hidden="true" />
            <strong>Nenhum estabelecimento encontrado</strong>
            <span>Tente buscar por outro nome ou região.</span>
          </div>
        {/if}
      </div>
      <ScrollShadow edge="bottom" visible={showBottomShadow} />
    </div>
  </section>
</main>
