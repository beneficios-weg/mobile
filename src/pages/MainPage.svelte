<script lang="ts">
  import CategoryButton from '../components/atoms/CategoryButton.svelte'
  import FloatingTabBar from '../components/atoms/FloatingTabBar.svelte'
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
    tone: 'sky' | 'lavender' | 'mint' | 'amber' | 'coral' | 'rose' | 'slate'
  }

  const categories: Category[] = [
    { label: 'Clientes WEG', icon: clientsIcon, tone: 'sky' },
    { label: 'Educação', icon: educationIcon, tone: 'lavender' },
    { label: 'Idiomas', icon: languagesIcon, tone: 'mint' },
    { label: 'Cursos e Treinamentos', icon: trainingIcon, tone: 'amber' },
    { label: 'Saúde e Bem-Estar', icon: healthIcon, tone: 'coral' },
    { label: 'Lazer', icon: leisureIcon, tone: 'rose' },
    { label: 'Estética e Vestuário', icon: apparelIcon, tone: 'slate' },
  ]

  // Dados temporários para a prévia. A página receberá os mesmos campos da API.
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
  const userLocation = { latitude: -26.3, longitude: -48.846 }
</script>

<svelte:head>
  <title>Início — WEG Benefits</title>
  <meta name="description" content="Encontre benefícios perto de você." />
</svelte:head>

<main class="main-page">
  <header class="main-page__header">
    <img class="main-page__logo" src={logo} alt="WEG Benefits" />
  </header>

  <section class="main-page__map" aria-label="Benefícios próximos">
    <Map
      benefits={demoBenefits}
      variant="category"
      showTiles={false}
      center={userLocation}
      {userLocation}
    />
  </section>

  <section class="main-page__categories" aria-labelledby="main-page-categories-title">
    <h1 id="main-page-categories-title">Categorias</h1>
    <div class="main-page__category-grid">
      {#each categories as category (category.label)}
        <CategoryButton
          label={category.label}
          icon={category.icon}
          tone={category.tone}
          selected={selectedCategory === category.label}
          onclick={() => (selectedCategory = selectedCategory === category.label ? null : category.label)}
        />
      {/each}
    </div>
  </section>

  <FloatingTabBar bind:selected={activeTab} />
</main>
