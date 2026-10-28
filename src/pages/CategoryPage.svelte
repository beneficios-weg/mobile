<script lang="ts">
  import { onMount, untrack } from 'svelte'
  import BackButton from '../components/atoms/BackButton.svelte'
  import ExpandButton from '../components/atoms/ExpandButton.svelte'
  import FloatingTabBar from '../components/atoms/FloatingTabBar.svelte'
  import ResultsCount from '../components/atoms/ResultsCount.svelte'
  import ScrollShadow from '../components/atoms/ScrollShadow.svelte'
  import Search from '../components/atoms/Search.svelte'
  import FilterDropdown, { type EstablishmentFilterState } from '../components/molecules/FilterDropdown.svelte'
  import Map from '../components/Map.svelte'
  import EstablishmentCard from '../components/molecules/EstablishmentCard.svelte'
  import { findCategory, placesForCategory, visitedPlaces } from '../lib/siteState.svelte'
  import { mapPlaces } from '../lib/apiAdapters'
  import { directoryView, navigateTab, openMap, openEstablishment, goBack } from '../lib/navigation.svelte'
  import { siteState, setFavorite } from '../lib/siteState.svelte'
  import type { TabId } from '../lib/routes'
  import healthIcon from '../assets/health-wellbeing.svg'

  type Props = {
    onback?: () => void
    variant?: 'category' | 'visited'
    categorySlug?: string
    onnavigate?: (tab: 'home' | 'map' | 'favorites' | 'history') => void
  }

  let { onback, variant = 'category', categorySlug = 'saude-e-bem-estar', onnavigate }: Props = $props()
  const category = $derived(findCategory(categorySlug))
  const view = untrack(() => directoryView(variant === 'visited' ? 'visited' : `category:${categorySlug}`))
  const text = $derived(variant === 'visited' ? {
    title: 'Visitados',
    resultsTitle: 'Estabelecimentos visitados',
    mapColumnLabel: 'Mapa de estabelecimentos visitados',
    mapLabel: 'Mapa dos estabelecimentos visitados',
    listLabel: 'Estabelecimentos visitados encontrados',
    expandLabel: 'Expandir lista de estabelecimentos visitados',
    emptyTitle: 'Nenhum estabelecimento visitado encontrado',
    resultsTitleId: 'visited-results-title',
    searchContext: '',
  } : {
    title: category?.label ?? 'Categoria',
    resultsTitle: 'Estabelecimentos da categoria',
    mapColumnLabel: 'Mapa da categoria',
    mapLabel: 'Mapa dos estabelecimentos da categoria',
    listLabel: 'Estabelecimentos encontrados',
    expandLabel: 'Expandir lista de estabelecimentos',
    emptyTitle: 'Nenhum estabelecimento encontrado',
    resultsTitleId: 'category-results-title',
    searchContext: categorySlug === 'saude-e-bem-estar' ? 'saúde bem-estar' : category?.label ?? '',
  })

  const places = $derived(variant === 'visited' ? visitedPlaces() : placesForCategory(categorySlug))
  const mapCenter = $derived(mapPlaces(places)[0] ?? { latitude: -26.483, longitude: -49.078 })

  let currentTime = $state(new Date())
  let selectedTab = $state<'home' | 'map' | 'favorites' | 'history'>(untrack(() => variant === 'visited' ? 'history' : 'home'))
  let showTopShadow = $state(false)
  let showBottomShadow = $state(false)
  let listElement: HTMLDivElement

  const visiblePlaces = $derived.by(() => {
    const query = view.searchValue.trim().toLocaleLowerCase('pt-BR')
    const filtered = places.filter((place) => {
      const matchesSearch = `${place.name} ${place.neighborhood} ${place.offerLabel ?? ""} ${text.searchContext}`
        .toLocaleLowerCase('pt-BR')
        .includes(query)
      return matchesSearch && (!view.appliedFilters.includes('open-now') || isPlaceOpen(place.id, currentTime))
    })

    const sortCriteria = view.appliedFilters.filter((option) => option !== 'open-now')
    if (!sortCriteria.length) return filtered

    return [...filtered].sort((a, b) => {
      for (const criterion of sortCriteria) {
        let comparison = 0
        if (criterion === 'name-asc') comparison = a.name.localeCompare(b.name, 'pt-BR')
        if (criterion === 'name-desc') comparison = b.name.localeCompare(a.name, 'pt-BR')
        if (criterion === 'discount') comparison = (b.discount ?? -Infinity) - (a.discount ?? -Infinity)
        if (criterion === 'nearest') comparison = (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)
        if (comparison !== 0) return comparison
      }
      return 0
    })
  })
  const mapBenefits = $derived(mapPlaces(visiblePlaces))

  function updateScrollShadows(list: HTMLDivElement) {
    view.scrollTop = list.scrollTop
    showTopShadow = list.scrollTop > 0
    showBottomShadow = list.scrollTop + list.clientHeight < list.scrollHeight - 1
  }

  function isPlaceOpen(placeId: string, at: Date) {
    const hours = places.find(place => place.id === placeId)?.openingHours
    if (!hours || !hours.days.includes(at.getDay())) return false
    const time = at.getHours() * 60 + at.getMinutes()
    const [openHour, openMinute] = hours.opensAt.split(':').map(Number)
    const [closeHour, closeMinute] = hours.closesAt.split(':').map(Number)
    return time >= openHour * 60 + openMinute && time < closeHour * 60 + closeMinute
  }

  function applyFilters(filters: EstablishmentFilterState) {
    view.appliedFilters = [...filters]
  }

  function handleListScroll(event: Event) {
    updateScrollShadows(event.currentTarget as HTMLDivElement)
  }

  function handleNavigation(tab: TabId) {
    if (tab === 'map') {
      openMap({ title: `Mapa — ${text.title}`, benefits: mapBenefits, center: view.mapViewport?.center ?? mapCenter,
        initialZoom: view.mapViewport?.zoom ?? 13, onviewportchange: (viewport) => { view.mapViewport = viewport },
        selectedBenefitId: view.selectedPlaceId,
        onselect: (id) => { view.selectedPlaceId = id },
        onclose: () => { selectedTab = variant === 'visited' ? 'history' : 'home' },
      })
    } else if (onnavigate) onnavigate(tab)
    else navigateTab(tab)
  }

  onMount(() => {
    view.filterSelection = [...view.appliedFilters]
    listElement.scrollTop = view.scrollTop
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

<svelte:head>
  <title>{text.title} — WEG Benefits</title>
</svelte:head>

<main class="directory-page category-page" class:visited-page={variant === 'visited'} class:list-expanded={view.listExpanded}>
  <section class="directory-map-column category-map-column" aria-label={text.mapColumnLabel}>
    <header class="directory-map-header category-map-header">
      <BackButton onclick={onback ?? (() => goBack('/'))} />
      <h1 class="directory-page__title category-page__title">{text.title}</h1>
    </header>

    <div class="directory-map category-map" role="region" aria-label={text.mapLabel}>
      <Map
        variant="default"
        benefits={mapBenefits}
        center={view.mapViewport?.center ?? mapCenter}
        initialZoom={view.mapViewport?.zoom ?? 13}
        onViewportChange={(viewport) => view.mapViewport = viewport}
        selectedBenefitId={view.selectedPlaceId}
        onBenefitOpen={(place) => openEstablishment(place.id)}
        onBenefitSelect={(benefit) => (view.selectedPlaceId = benefit.id)}
      />
    </div>

    <FloatingTabBar bind:selected={selectedTab} ontabchange={handleNavigation} />
  </section>

  <section class="directory-results category-results" aria-labelledby={text.resultsTitleId}>
    <div class="directory-results__controls category-results__controls">
      <div class="directory-results__expanded-header category-results__expanded-header">
        <BackButton label="Voltar para o mapa" onclick={() => (view.listExpanded = false)} />
        <h1 class="directory-page__title category-page__title">{text.title}</h1>
      </div>
      <h2 id={text.resultsTitleId} class="directory-results__title category-results__title">{text.resultsTitle}</h2>

      <Search
        bind:value={view.searchValue}
        label="Buscar locais ou benefícios"
        placeholder="Buscar locais ou benefícios"
      />

      <FilterDropdown available={['name-asc', 'name-desc']} bind:value={view.filterSelection} onapply={applyFilters} />

      <div class="directory-results__count-row category-results__count-row">
        <ResultsCount count={visiblePlaces.length} />
        <ExpandButton
          variant="category-list"
          bind:expanded={view.listExpanded}
          label={view.listExpanded ? 'Voltar para o mapa' : text.expandLabel}
        />
      </div>
    </div>

    <div class="directory-results__list-frame category-results__list-frame">
      <ScrollShadow edge="top" visible={showTopShadow} />
      <div
        bind:this={listElement}
        class="directory-results__list category-results__list"
        aria-label={text.listLabel}
        onscroll={handleListScroll}
      >
        {#if visiblePlaces.length}
          {#each visiblePlaces as place (place.id)}
            <EstablishmentCard
              name={place.name}
              neighborhood={place.neighborhood}
              distanceKm={place.distanceKm}
              discount={place.discount}
              offerLabel={place.offerLabel}
              selected={view.selectedPlaceId === place.id}
              liked={siteState.favoriteIds.includes(place.id)}
              controlledFavorite
              onselect={() => { view.selectedPlaceId = place.id; openEstablishment(place.id) }}
              onlikedchange={(liked) => setFavorite(place.id, liked)}
            />
          {/each}
        {:else}
          <div class="category-results__empty" role="status">
            <img src={healthIcon} alt="" aria-hidden="true" />
            <strong>{text.emptyTitle}</strong>
            <span>Tente buscar por outro nome ou região.</span>
          </div>
        {/if}
      </div>
      <ScrollShadow edge="bottom" visible={showBottomShadow} />
    </div>
  </section>
</main>
