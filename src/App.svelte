<script lang="ts">
  import CategoryButton, { type CategoryButtonTone } from './components/atoms/CategoryButton.svelte'
  import FloatingTabBar from './components/atoms/FloatingTabBar.svelte'
  import Map from './components/Map.svelte'
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
  <title>Teste responsivo dos botões de categoria</title>
</svelte:head>

<main class="button-showcase" aria-label="Teste responsivo dos botões de categoria">
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

<FloatingTabBar />



<style>
  :global(body) {
    background: #f3f7fa;
  }

  :global(#app) {
    width: 100%;
    max-width: none;
    min-height: 100svh;
    border: 0;
    text-align: initial;
  }

  .button-showcase {
    display: grid;
    min-height: 100svh;
    box-sizing: border-box;
    place-items: start center;
    padding: 24px 16px;
  }

  .category-grid {
    width: min(100%, 760px);
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-content: start;
    gap: 16px;
  }

  @media (max-width: 340px) {
    .category-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (min-width: 720px) {
    .category-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
</style>
