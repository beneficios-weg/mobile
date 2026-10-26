<script lang="ts">
  import { onMount } from 'svelte'
  import CategoryButton, { type CategoryButtonTone } from '../components/atoms/CategoryButton.svelte'
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

  type Category = {
    label: string
    icon: string
    tone: CategoryButtonTone
    href?: string
  }

  const categories: Category[] = [
    { label: 'Clientes WEG', icon: clientsIcon, tone: 'sky' },
    { label: 'Educação', icon: educationIcon, tone: 'lavender' },
    { label: 'Idiomas', icon: languagesIcon, tone: 'mint' },
    { label: 'Cursos e Treinamentos', icon: trainingIcon, tone: 'amber' },
    { label: 'Saúde e Bem-Estar', icon: healthIcon, tone: 'coral', href: '/categoria/saude-e-bem-estar' },
    { label: 'Lazer', icon: leisureIcon, tone: 'rose' },
    { label: 'Estética e Vestuário', icon: apparelIcon, tone: 'slate' },
  ]

  // Dados de apresentação locais; não representam o contrato da API.
  const demoBenefits = [
    { id: 'home-1', name: 'Academia Move', category: 'Saúde e Bem-Estar', latitude: -26.294, longitude: -48.87 },
    { id: 'home-2', name: 'Centro Educacional', category: 'Educação', latitude: -26.306, longitude: -48.84 },
    { id: 'home-3', name: 'Clube de Idiomas', category: 'Idiomas', latitude: -26.289, longitude: -48.824 },
    { id: 'home-4', name: 'Espaço Bem-Estar', category: 'Saúde e Bem-Estar', latitude: -26.312, longitude: -48.855 },
    { id: 'home-5', name: 'Cursos WEG', category: 'Cursos e Treinamentos', latitude: -26.28, longitude: -48.852 },
    { id: 'home-6', name: 'Loja Parceira', category: 'Clientes WEG', latitude: -26.303, longitude: -48.813 },
  ]

  let selectedCategory = $state<string | null>(null)
  let activeTab = $state<'home' | 'map' | 'favorites' | 'history'>('home')
  let selectedBenefitId = $state<string | null>(null)
  let showTopShadow = $state(false)
  let showBottomShadow = $state(false)
  let navigationMessage = $state('')
  let categoryList: HTMLDivElement
  let categoryGrid: HTMLDivElement
  let mapElement: HTMLDivElement
  const userLocation = { latitude: -26.3, longitude: -48.846 }
  const visibleBenefits = $derived(selectedCategory
    ? demoBenefits.filter((benefit) => benefit.category === selectedCategory)
    : demoBenefits)

  function selectCategory(category: Category) {
    if (category.href) {
      window.location.assign(category.href)
      return
    }
    selectedCategory = selectedCategory === category.label ? null : category.label
    selectedBenefitId = null
    navigationMessage = selectedCategory && !visibleBenefits.length
      ? 'Nenhum estabelecimento encontrado nesta categoria.'
      : ''
  }

  function navigate(tab: 'home' | 'map' | 'favorites' | 'history') {
    navigationMessage = ''
    if (tab === 'favorites') window.location.assign('/favoritos')
    else if (tab === 'map') mapElement.querySelector<HTMLElement>('.leaflet-container')?.focus()
    else if (tab === 'home') {
      selectedCategory = null
      selectedBenefitId = null
    } else {
      window.location.assign('/visitados')
    }
  }

  function updateScrollShadows() {
    showTopShadow = categoryList.scrollTop > 1
    showBottomShadow = categoryList.scrollTop + categoryList.clientHeight < categoryList.scrollHeight - 1
  }

  onMount(() => {
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
    </header>

    <div class="directory-map main-page__map" bind:this={mapElement}>
      <Map
        benefits={visibleBenefits}
        variant="default"
        center={userLocation}
        {userLocation}
        {selectedBenefitId}
        onBenefitSelect={(benefit) => selectedBenefitId = benefit.id}
      />
    </div>

    <FloatingTabBar bind:selected={activeTab} ontabchange={navigate} />
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
          {#each categories as category (category.label)}
            <CategoryButton
              label={category.label}
              icon={category.icon}
              tone={category.tone}
              selected={selectedCategory === category.label}
              onclick={() => selectCategory(category)}
            />
          {/each}
        </div>
      </div>
      <ScrollShadow edge="bottom" visible={showBottomShadow} />
    </div>
  </section>

  <p class="main-page__status" role="status">{navigationMessage}</p>
</main>
