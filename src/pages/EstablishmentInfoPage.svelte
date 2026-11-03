<script lang="ts">
  import { onMount, untrack } from 'svelte'
  import BackButton from '../components/atoms/BackButton.svelte'
  import FavoriteButton from '../components/atoms/FavoriteButton.svelte'
  import FloatingTabBar from '../components/atoms/FloatingTabBar.svelte'
  import ScrollShadow from '../components/atoms/ScrollShadow.svelte'
  import EstablishmentFacadeCard from '../components/atoms/EstablishmentFacadeCard.svelte'
  import PrimaryButton from '../components/atoms/PrimaryButton.svelte'
  import AboutUnitCard from '../components/atoms/AboutUnitCard.svelte'
  import ExpandableAboutUnitCard from '../components/atoms/ExpandableAboutUnitCard.svelte'
  import BenefitCard from '../components/molecules/BenefitCard.svelte'
  import Map from '../components/Map.svelte'
  import { previewEstablishment, type EstablishmentDetails } from './establishment'
  import './styles/EstablishmentInfoPage.css'
  import { directoryView, goBack, navigateTab, openMap, openEstablishment } from '../lib/navigation.svelte'
  import { categoryPath, type TabId } from '../lib/routes'
  import { findPlace } from './catalog'
  import { getCurrentLocation } from '../services/geolocationService'
  import { getRouteOptions } from '../services/routingService'
  import { isPosition, type DirectionsPlan } from '../lib/directions'
  import { useDemoDirectionsLocation, demoDirectionsLocation } from '../lib/directionsLocation'

  type Props = {
    establishment?: EstablishmentDetails
    liked?: boolean
    onlikedchange?: (liked: boolean) => void
  }

  let { establishment = previewEstablishment, liked = $bindable(false), onlikedchange }: Props = $props()
  let selectedTab = $state<'home' | 'map' | 'favorites' | 'history'>('home')
  const view = untrack(() => directoryView(`detail:${establishment.id}`))
  let scrollElement: HTMLDivElement
  let contentElement: HTMLDivElement
  let showTopShadow = $state(false)
  let showBottomShadow = $state(false)
  let routePlan = $state.raw<DirectionsPlan | null>(null)
  let routeLoading = $state(false)
  let routeError = $state('')
  let routeRequest: AbortController | undefined
  const routeAlternatives = $derived(routePlan?.options.map((route, index) => ({ route, index })).filter(item => item.index !== routePlan?.selected) ?? [])

  const position = $derived({ latitude: establishment.latitude, longitude: establishment.longitude })
  const mapBenefits = $derived([{
    id: establishment.id,
    name: establishment.name,
    category: establishment.neighborhood,
    ...position,
  }])
  const supplementaryCards = $derived([
    { id: 'about', title: 'Sobre a unidade', description: establishment.description },
    { id: 'services', title: 'Serviços', description: establishment.services.map((service) => `• ${service}`).join('\n') },
  ])

  function updateScrollShadows() {
    view.scrollTop = scrollElement.scrollTop
    showTopShadow = scrollElement.scrollTop > 1
    showBottomShadow = scrollElement.scrollTop + scrollElement.clientHeight < scrollElement.scrollHeight - 1
  }

  function returnToOrigin() {
    goBack(categoryPath(findPlace(establishment.id)?.categorySlug ?? 'saude-e-bem-estar'))
  }

  function handleNavigation(tab: TabId) {
    if (tab === 'map' && routePlan) { openRouteMap(); return }
    if (tab === 'map') openMap({ title: establishment.name, benefits: mapBenefits, center: view.mapViewport?.center ?? position,
      initialZoom: view.mapViewport?.zoom ?? 15, onviewportchange: (viewport) => { view.mapViewport = viewport },
      selectedBenefitId: establishment.id, onclose: () => { selectedTab = 'home' },
    })
    else navigateTab(tab)
  }

  function openRouteMap() {
    if (!routePlan) return
    openMap({ title: `Como chegar — ${establishment.name}`, benefits: mapBenefits,
      center: position, initialZoom: 15, selectedBenefitId: establishment.id,
      directionsTo: { ...mapBenefits[0], address: establishment.address },
      directionsPlan: routePlan,
      onplanchange: (plan) => { routePlan = plan },
      onclose: () => { selectedTab = 'home' },
    })
  }

  async function openDirections() {
    routeRequest?.abort()
    const request = new AbortController()
    routeRequest = request
    routeLoading = true
    routeError = ''
    try {
      const origin = useDemoDirectionsLocation ? { ...demoDirectionsLocation } : await getCurrentLocation()
      if (request.signal.aborted) return
      if (!isPosition(origin)) throw new Error('A localização recebida não é válida. Tente novamente.')
      const options = await getRouteOptions(origin, position, 'driving', request.signal)
      if (!request.signal.aborted) routePlan = { origin, options, selected: 0, mode: 'driving' }
    } catch (error) {
      if (!request.signal.aborted) routeError = error instanceof Error && error.name === 'TimeoutError'
        ? 'O cálculo demorou para responder. Tente novamente.'
        : error instanceof Error ? error.message : 'Não foi possível calcular a rota. Tente novamente.'
    } finally {
      if (routeRequest === request) routeLoading = false
    }
  }

  onMount(() => {
    scrollElement.scrollTop = view.scrollTop
    const observer = new ResizeObserver(updateScrollShadows)
    observer.observe(scrollElement)
    observer.observe(contentElement)
    updateScrollShadows()
    return () => { observer.disconnect(); routeRequest?.abort() }
  })
</script>

<svelte:head>
  <title>{establishment.name} — WEG Benefits</title>
  <meta name="description" content={`Informações, benefícios e serviços de ${establishment.name}.`} />
</svelte:head>

<svelte:window onkeydown={(event) => {
  if (event.key === 'Escape') view.expandedCard = null
}} />

<main class="establishment-page">
  <header class="establishment-page__header">
    <BackButton onclick={returnToOrigin} />
    <h1>{establishment.name}</h1>
  </header>

  <div class="establishment-page__favorite">
    <FavoriteButton bind:liked {onlikedchange} />
  </div>

  <div class="establishment-page__map">
    <Map benefits={mapBenefits} variant="category" center={view.mapViewport?.center ?? position} initialZoom={view.mapViewport?.zoom ?? 15}
      userLocation={routePlan?.origin} userLocationLabel="Partida em Joinville"
      routeCoordinates={routePlan?.options[routePlan.selected]?.coordinates}
      alternativeRoutes={routeAlternatives.map(item => item.route.coordinates)}
      onAlternativeSelect={(index) => { if (routePlan) routePlan = { ...routePlan, selected: routeAlternatives[index].index } }}
      onViewportChange={(viewport) => view.mapViewport = viewport} selectedBenefitId={establishment.id}
      onMapClick={routePlan ? openRouteMap : undefined}
      onBenefitSelect={routePlan ? () => openRouteMap() : undefined}
      onBenefitOpen={routePlan ? undefined : (place) => openEstablishment(place.id)} />
  </div>

  <section class="establishment-page__details" aria-labelledby="establishment-info-title">
    <h2 id="establishment-info-title">Informações do estabelecimento</h2>
    <div class="establishment-page__scroll-frame">
      <ScrollShadow edge="top" visible={showTopShadow} />
      <!-- A região rolável recebe foco para permitir rolagem pelo teclado. -->
      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <div class="establishment-page__scroll" bind:this={scrollElement} onscroll={updateScrollShadows}
        role="region" aria-label="Detalhes e benefícios do estabelecimento" tabindex="0">
        <div class="establishment-page__content" bind:this={contentElement}>
          <EstablishmentFacadeCard
            name={establishment.name}
            neighborhood={establishment.neighborhood}
            address={establishment.address}
            openingStatus={establishment.openingStatus}
            openingHours={establishment.openingHours}
            contact={establishment.contact}
            facadeImageUrl={establishment.facadeImageUrl}
          />
          <PrimaryButton label={routeLoading ? 'Calculando rota…' : 'Como chegar'} disabled={routeLoading} onclick={(event) => {
            if (event.detail > 0) (event.currentTarget as HTMLButtonElement).blur()
            void openDirections()
          }} />
          {#if routeError}<p class="establishment-page__route-status" role="alert">{routeError}</p>{/if}
          <BenefitCard discounts={establishment.discounts} audience={establishment.audience} />
          <div class="establishment-page__participation">
            <AboutUnitCard title="Como participar" description={establishment.participation.map((step, index) => `${index + 1}. ${step}`).join('\n')} />
          </div>
          <section class="establishment-page__supplementary" aria-label="Sobre a unidade e serviços" data-about-unit-area>
            <div class="about-unit-card-grid">
              {#each supplementaryCards as card (card.id)}
                {@const hidden = view.expandedCard !== null && view.expandedCard !== card.id}
                <div class="about-unit-card-grid__item about-unit-card-visibility" class:is-hidden={hidden} inert={hidden} aria-hidden={hidden}>
                  <ExpandableAboutUnitCard title={card.title} description={card.description}
                    expansionMode={card.id === 'about' ? 'content' : 'area'}
                    expanded={view.expandedCard === card.id}
                    onclick={() => view.expandedCard = view.expandedCard === card.id ? null : card.id} />
                </div>
              {/each}
            </div>
          </section>
        </div>
      </div>
      <ScrollShadow edge="bottom" visible={showBottomShadow} />
    </div>
  </section>

  <div class="establishment-page__navigation">
    <FloatingTabBar bind:selected={selectedTab} ontabchange={handleNavigation} />
  </div>
</main>
