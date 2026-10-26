<script lang="ts">
  import { onMount } from 'svelte'
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

  type Props = {
    establishment?: EstablishmentDetails
    liked?: boolean
    onlikedchange?: (liked: boolean) => void
  }

  let { establishment = previewEstablishment, liked = $bindable(false), onlikedchange }: Props = $props()
  let selectedTab = $state<'home' | 'map' | 'favorites' | 'history'>('home')
  let expandedCard = $state<string | null>(null)
  let scrollElement: HTMLDivElement
  let contentElement: HTMLDivElement
  let mapElement: HTMLDivElement
  let showTopShadow = $state(false)
  let showBottomShadow = $state(false)
  let navigationMessage = $state('')

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
    showTopShadow = scrollElement.scrollTop > 1
    showBottomShadow = scrollElement.scrollTop + scrollElement.clientHeight < scrollElement.scrollHeight - 1
  }

  function goBack() {
    const referrer = document.referrer ? new URL(document.referrer) : null
    if (window.history.length > 1 && referrer?.origin === window.location.origin) window.history.back()
    else window.location.assign('/categoria/saude-e-bem-estar')
  }

  function navigate(tab: 'home' | 'map' | 'favorites' | 'history') {
    navigationMessage = ''
    if (tab === 'home') window.location.assign('/')
    else if (tab === 'favorites') window.location.assign('/favoritos')
    else if (tab === 'map') mapElement.querySelector<HTMLElement>('.leaflet-container')?.focus()
    else {
      selectedTab = 'home'
      navigationMessage = 'O histórico de visitas ainda não está disponível.'
    }
  }

  function openDirections() {
    const destination = encodeURIComponent(`${establishment.latitude},${establishment.longitude}`)
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank', 'noopener,noreferrer')
  }

  onMount(() => {
    const observer = new ResizeObserver(updateScrollShadows)
    observer.observe(scrollElement)
    observer.observe(contentElement)
    updateScrollShadows()
    return () => observer.disconnect()
  })
</script>

<svelte:head>
  <title>{establishment.name} — WEG Benefits</title>
  <meta name="description" content={`Informações, benefícios e serviços de ${establishment.name}.`} />
</svelte:head>

<svelte:window onkeydown={(event) => {
  if (event.key === 'Escape') expandedCard = null
}} />

<main class="establishment-page">
  <header class="establishment-page__header">
    <BackButton onclick={goBack} />
    <h1>{establishment.name}</h1>
  </header>

  <div class="establishment-page__favorite">
    <FavoriteButton bind:liked {onlikedchange} />
  </div>

  <div class="establishment-page__map" bind:this={mapElement}>
    <Map benefits={mapBenefits} variant="category" center={position} initialZoom={15} selectedBenefitId={establishment.id} />
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
          <PrimaryButton label="Como chegar" onclick={openDirections} />
          <BenefitCard discounts={establishment.discounts} audience={establishment.audience} />
          <div class="establishment-page__participation">
            <AboutUnitCard title="Como participar" description={establishment.participation.map((step, index) => `${index + 1}. ${step}`).join('\n')} />
          </div>
          <section class="establishment-page__supplementary" aria-label="Sobre a unidade e serviços" data-about-unit-area>
            <div class="about-unit-card-grid">
              {#each supplementaryCards as card (card.id)}
                {@const hidden = expandedCard !== null && expandedCard !== card.id}
                <div class="about-unit-card-grid__item about-unit-card-visibility" class:is-hidden={hidden} inert={hidden} aria-hidden={hidden}>
                  <ExpandableAboutUnitCard title={card.title} description={card.description}
                    expansionMode={card.id === 'about' ? 'content' : 'area'}
                    expanded={expandedCard === card.id}
                    onclick={() => expandedCard = expandedCard === card.id ? null : card.id} />
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
    <FloatingTabBar bind:selected={selectedTab} ontabchange={navigate} />
  </div>
  <p class="establishment-page__status" role="status">{navigationMessage}</p>
</main>
