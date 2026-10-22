<script lang="ts">
  import { onMount } from 'svelte'
  import BackButton from '../components/atoms/BackButton.svelte'
  import FavoriteButton from '../components/atoms/FavoriteButton.svelte'
  import FloatingTabBar from '../components/atoms/FloatingTabBar.svelte'
  import ResultsCount from '../components/atoms/ResultsCount.svelte'
  import ScrollShadow from '../components/atoms/ScrollShadow.svelte'
  import Search from '../components/atoms/Search.svelte'
  import healthIcon from '../assets/categories/health-wellbeing.svg'

  type SortOrder = 'nearest' | 'name' | 'discount'
  type CategoryPlace = {
    id: string
    name: string
    neighborhood: string
    distanceKm: number
    discount: number
    pinX: number
    pinY: number
  }
  type Props = {
    onback?: () => void
  }

  let { onback }: Props = $props()

  const places: CategoryPlace[] = [
    { id: 'move', name: 'Academia Move', neighborhood: 'Centro', distanceKm: 0.8, discount: 20, pinX: 18, pinY: 13 },
    { id: 'visao', name: 'Ótica Visão', neighborhood: 'Centro', distanceKm: 0.8, discount: 12, pinX: 33, pinY: 32 },
    { id: 'bem-viver', name: 'Clínica Bem Viver', neighborhood: 'Centro', distanceKm: 0.8, discount: 15, pinX: 40, pinY: 61 },
    { id: 'move-vila', name: 'Academia Move', neighborhood: 'Vila Nova', distanceKm: 1.4, discount: 20, pinX: 75, pinY: 25 },
    { id: 'saude-farmacia', name: 'Farmácia Saúde', neighborhood: 'América', distanceKm: 2.1, discount: 10, pinX: 17, pinY: 69 },
    { id: 'studio-ativa', name: 'Studio Ativa', neighborhood: 'Vila Nova', distanceKm: 2.6, discount: 15, pinX: 63, pinY: 76 },
    { id: 'vitalis', name: 'Centro Vitalis', neighborhood: 'Centro', distanceKm: 3.4, discount: 18, pinX: 83, pinY: 52 },
    { id: 'medilife', name: 'MediLife Clínica', neighborhood: 'América', distanceKm: 4.1, discount: 12, pinX: 43, pinY: 16 },
  ]

  let searchValue = $state('')
  let sortOrder = $state<SortOrder>('nearest')
  let selectedPlaceId = $state<string | null>(null)
  let favoriteIds = $state<string[]>([])
  let selectedTab = $state<'home' | 'map' | 'favorites' | 'history'>('home')
  let listExpanded = $state(false)
  let showTopShadow = $state(false)
  let showBottomShadow = $state(false)
  let listElement: HTMLDivElement

  const visiblePlaces = $derived.by(() => {
    const query = searchValue.trim().toLocaleLowerCase('pt-BR')
    const filtered = places.filter((place) =>
      `${place.name} ${place.neighborhood} saúde bem-estar`.toLocaleLowerCase('pt-BR').includes(query),
    )

    if (sortOrder === 'name') return [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    if (sortOrder === 'discount') return [...filtered].sort((a, b) => b.discount - a.discount)
    return [...filtered].sort((a, b) => a.distanceKm - b.distanceKm)
  })

  function updateScrollShadows(list: HTMLDivElement) {
    showTopShadow = list.scrollTop > 0
    showBottomShadow = list.scrollTop + list.clientHeight < list.scrollHeight - 1
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
    return () => resizeObserver.disconnect()
  })

  $effect(() => {
    visiblePlaces
    if (!listElement) return
    const frame = requestAnimationFrame(() => updateScrollShadows(listElement))
    return () => cancelAnimationFrame(frame)
  })
</script>

<main class="category-page" class:list-expanded={listExpanded}>
  <section class="category-map-column" aria-label="Mapa da categoria">
    <header class="category-map-header">
      <BackButton onclick={onback} />
      <h1 class="category-page__title">Saúde e Bem-Estar</h1>
    </header>

    <div class="category-map" role="region" aria-label="Mapa demonstrativo dos estabelecimentos da categoria">
      <span class="category-map__user" aria-label="Sua localização" role="img">
        <span></span>
      </span>
      {#each visiblePlaces as place (place.id)}
        <button
          class="category-map__pin"
          class:selected={selectedPlaceId === place.id}
          style={`--pin-x:${place.pinX}%;--pin-y:${place.pinY}%`}
          type="button"
          aria-label={`Selecionar ${place.name}, ${place.neighborhood}`}
          aria-pressed={selectedPlaceId === place.id}
          onclick={() => (selectedPlaceId = place.id)}
        ><span></span></button>
      {/each}
    </div>

    <FloatingTabBar bind:selected={selectedTab} />
  </section>

  <section class="category-results" aria-labelledby="category-results-title">
    <div class="category-results__controls">
      <div class="category-results__expanded-header">
        <BackButton label="Voltar para o mapa" onclick={() => (listExpanded = false)} />
        <h1 class="category-page__title">Saúde e Bem-Estar</h1>
      </div>
      <h2 id="category-results-title" class="category-results__title">Estabelecimentos da categoria</h2>

      <Search
        bind:value={searchValue}
        label="Buscar locais ou benefícios"
        placeholder="Buscar locais ou benefícios"
      />

      <label class="category-sort">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 7h10M18 7h2M4 17h2m4 0h10M14 5v4M8 15v4" />
          <circle cx="16" cy="7" r="2" />
          <circle cx="8" cy="17" r="2" />
        </svg>
        <select bind:value={sortOrder} aria-label="Ordenar estabelecimentos">
          <option value="nearest">Mais próximos</option>
          <option value="name">Nome (A–Z)</option>
          <option value="discount">Maior desconto</option>
        </select>
        <svg class="category-sort__chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="m7 10 5 5 5-5" />
        </svg>
      </label>

      <div class="category-results__count-row">
        <ResultsCount count={visiblePlaces.length} />
        <button
          class="category-results__expand"
          type="button"
          aria-label={listExpanded ? 'Voltar para o mapa' : 'Expandir lista de estabelecimentos'}
          aria-pressed={listExpanded}
          onclick={() => (listExpanded = !listExpanded)}
        >
          {#if listExpanded}
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M8 3v5H3m18 0h-5V3M3 16h5v5m13-5h-5v5" />
            </svg>
          {:else}
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M14 4h6v6m0-6-7 7M10 20H4v-6m0 6 7-7" />
            </svg>
          {/if}
        </button>
      </div>
    </div>

    <div class="category-results__list-frame">
      <ScrollShadow edge="top" visible={showTopShadow} />
      <div
        bind:this={listElement}
        class="category-results__list"
        aria-label="Estabelecimentos encontrados"
        onscroll={handleListScroll}
      >
        {#if visiblePlaces.length}
          {#each visiblePlaces as place (place.id)}
            <article class="category-establishment-card" class:selected={selectedPlaceId === place.id}>
              <button
                class="category-establishment-card__main"
                type="button"
                aria-pressed={selectedPlaceId === place.id}
                onclick={() => (selectedPlaceId = place.id)}
              >
                <span class="category-establishment-card__avatar" aria-hidden="true">{place.name.charAt(0)}</span>
                <span class="category-establishment-card__content">
                  <strong>{place.name}</strong>
                  <span>{place.neighborhood} · {place.distanceKm.toFixed(1).replace('.', ',')} km</span>
                  <span class="category-establishment-card__offer">{place.discount}% OFF</span>
                </span>
              </button>
              <FavoriteButton
                liked={favoriteIds.includes(place.id)}
                onlikedchange={(liked) => toggleFavorite(place.id, liked)}
              />
            </article>
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
