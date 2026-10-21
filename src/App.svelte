<script lang="ts">
  import CategoryButton, { type CategoryButtonTone } from './components/atoms/CategoryButton.svelte'
  import Map from './components/Map.svelte'
  import Title from './components/atoms/Title.svelte'
  import clientsIcon from './assets/categories/clients-weg.svg'
  import educationIcon from './assets/categories/education.svg'
  import languageIcon from './assets/categories/languages.svg'
  import coursesIcon from './assets/categories/courses-training.svg'
  import healthIcon from './assets/categories/health-wellbeing.svg'
  import leisureIcon from './assets/categories/leisure.svg'
  import styleIcon from './assets/categories/style-clothing.svg'

  const categories: { label: string; tone: CategoryButtonTone; icon: string }[] = [
    { label: 'Clientes WEG', tone: 'sky', icon: clientsIcon },
    { label: 'Educação', tone: 'lavender', icon: educationIcon },
    { label: 'Idiomas', tone: 'mint', icon: languageIcon },
    { label: 'Cursos e Treinamentos', tone: 'amber', icon: coursesIcon },
    { label: 'Saúde e Bem-Estar', tone: 'coral', icon: healthIcon },
    { label: 'Lazer', tone: 'rose', icon: leisureIcon },
    { label: 'Estética e Vestuário', tone: 'slate', icon: styleIcon },
  ]

  let selectedCategory = $state<string | null>(null)
</script>

<svelte:head>
  <title>WEG Benefits</title>
</svelte:head>

<main class="button-showcase" aria-label="Teste responsivo dos botões de categoria">
  <div class="home-title">
    <Title text="Saúde e Bem-Estar" />
  </div>
  <section class="category-grid" aria-label="Categorias de benefícios">
    {#each categories as category (category.label)}
      <CategoryButton
        label={category.label}
        icon={category.icon}
        tone={category.tone}
        selected={selectedCategory === category.label}
        onclick={() => (selectedCategory = category.label)}
      />
    {/each}
  </section>
</main>

<Map/>

<style>
  :global(body) {
    background: #fff;
  }

  :global(#app) {
    width: 100%;
    max-width: none;
    min-height: 100svh;
    border: 0;
    text-align: initial;
  }

  .home-title {
    box-sizing: border-box;
    padding: 24px 20px;
  }
</style>
