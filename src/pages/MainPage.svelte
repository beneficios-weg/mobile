<script lang="ts">
  import { onMount } from 'svelte'
  import CategoryButton from '../components/atoms/CategoryButton.svelte'
  import FloatingTabBar from '../components/atoms/FloatingTabBar.svelte'
  import ScrollShadow from '../components/atoms/ScrollShadow.svelte'
  import Map from '../components/Map.svelte'
  import logo from '../assets/logo-wegbenefits-azul.svg'
  import clientsIcon from '../assets/clients-weg.svg'
  import educationIcon from '../assets/education.svg'
  import languagesIcon from '../assets/languages.svg'
  import trainingIcon from '../assets/training.svg'
  import healthIcon from '../assets/health-wellbeing.svg'
  import leisureIcon from '../assets/leisure.svg'
  import apparelIcon from '../assets/aesthetics-apparel.svg'
  import './MainPage.css'
  import { categories, homePlaces, logout, siteState } from '../lib/siteState.svelte'
  import { mapPlaces } from '../lib/apiAdapters'
  import { directoryView, navigateTab, openMap, openCategory, openEstablishment } from '../lib/navigation.svelte'
  import type { TabId } from '../lib/routes'
  import { categoryIcons } from '../lib/icons.svelte'

  const icons = { clients: clientsIcon, education: educationIcon, languages: languagesIcon, training: trainingIcon,
    health: healthIcon, leisure: leisureIcon, apparel: apparelIcon }
  function categoryIcon(label: string) {
    const name = label.toLocaleLowerCase('pt-BR')
    if (name.includes('saúde') || name.includes('saude')) return icons.health
    if (name.includes('educa')) return icons.education
    if (name.includes('idioma')) return icons.languages
    if (name.includes('treina')) return icons.training
    if (name.includes('lazer')) return icons.leisure
    if (name.includes('estética') || name.includes('vestu')) return icons.apparel
    return icons.clients
  }
  const view = directoryView('home')
  const mapBenefits = $derived(mapPlaces(homePlaces()))

  let activeTab = $state<'home' | 'map' | 'favorites' | 'history'>('home')
  let showTopShadow = $state(false)
  let showBottomShadow = $state(false)
  let categoryList: HTMLDivElement
  let categoryGrid: HTMLDivElement
  const userLocation = null
  const initialCenter = { latitude: -26.483, longitude: -49.078 }
  function handleNavigation(tab: TabId) {
    if (tab === 'map') openMap({ title: 'Mapa de benefícios', benefits: mapBenefits, center: view.mapViewport?.center ?? initialCenter, userLocation,
      initialZoom: view.mapViewport?.zoom ?? 13, onviewportchange: (viewport) => { view.mapViewport = viewport },
      selectedBenefitId: view.selectedPlaceId, onselect: (id) => { view.selectedPlaceId = id },
      onclose: () => { activeTab = 'home' },
    })
    else navigateTab(tab)
  }

  function updateScrollShadows() {
    view.scrollTop = categoryList.scrollTop
    showTopShadow = categoryList.scrollTop > 1
    showBottomShadow = categoryList.scrollTop + categoryList.clientHeight < categoryList.scrollHeight - 1
  }

  onMount(() => {
    categoryList.scrollTop = view.scrollTop
    const observer = new ResizeObserver(updateScrollShadows)
    observer.observe(categoryList)
    observer.observe(categoryGrid)
    updateScrollShadows()
    return () => observer.disconnect()
  })
</script>

<svelte:head>
  <title>Início — WEG Benefits</title>
  <meta name="description" content="Encontre benefícios perto de você." />
</svelte:head>

<main class="directory-page main-page">
  <section class="directory-map-column main-page__map-column" aria-label="Benefícios próximos">
    <header class="directory-map-header main-page__header">
      <img class="main-page__logo" src={logo} alt="WEG Benefits" />
      <button type="button" class="main-page__login" style="border:0; background:transparent; cursor:pointer" disabled={siteState.pendingLogout} onclick={() => { void logout() }}>{siteState.pendingLogout ? 'Saindo…' : 'Sair'}</button>
    </header>

    <div class="directory-map main-page__map">
      <Map
        benefits={mapBenefits}
        variant="default"
        center={view.mapViewport?.center ?? initialCenter}
        initialZoom={view.mapViewport?.zoom ?? 13}
        onViewportChange={(viewport) => { view.mapViewport = viewport }}
        {userLocation}
        selectedBenefitId={view.selectedPlaceId}
        onBenefitSelect={(benefit) => view.selectedPlaceId = benefit.id}
        onBenefitOpen={(benefit) => openEstablishment(benefit.id)}
      />
    </div>

    <FloatingTabBar bind:selected={activeTab} ontabchange={handleNavigation} />
  </section>

  <section class="directory-results main-page__categories" aria-labelledby="main-page-categories-title">
    <h1 class="directory-results__title" id="main-page-categories-title">Categorias</h1>
    <div class="main-page__category-frame">
      <ScrollShadow edge="top" visible={showTopShadow} />
      <!-- A região recebe foco para permitir rolagem pelo teclado. -->
      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <div class="main-page__category-list" bind:this={categoryList} onscroll={updateScrollShadows}
        role="region" aria-label="Categorias de benefícios" tabindex="0">
        <div class="main-page__category-grid" bind:this={categoryGrid}>
          {#each categories() as category (category.slug)}
            <CategoryButton
              label={category.label}
              icon={categoryIcons[`${category.iconKey}:${category.colorHex}`] ?? categoryIcon(category.label)}
              colorHex={category.colorHex}
              tone={category.tone}
              onclick={() => openCategory(category.slug)}
            />
          {/each}
        </div>
      </div>
      <ScrollShadow edge="bottom" visible={showBottomShadow} />
    </div>
  </section>

</main>
