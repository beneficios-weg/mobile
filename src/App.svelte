<script lang="ts">
  import { fade } from 'svelte/transition';
  import BackButton from "./components/atoms/BackButton.svelte";
  import AboutUnitCard from "./components/atoms/AboutUnitCard.svelte";
  import ExpandableAboutUnitCard from "./components/atoms/ExpandableAboutUnitCard.svelte";
  import BenefitLocationCard from "./components/atoms/BenefitLocationCard.svelte";
  import CategoryButton from "./components/atoms/CategoryButton.svelte";
  import FavoriteButton from "./components/atoms/FavoriteButton.svelte";
  import ExpandButton from "./components/atoms/ExpandButton.svelte";
  import EstablishmentFacadeCard from "./components/atoms/EstablishmentFacadeCard.svelte";
  import FloatingTabBar from "./components/atoms/FloatingTabBar.svelte";
  import Input from "./components/atoms/Input.svelte";
  import Map from "./components/Map.svelte";
  import PrimaryButton from "./components/atoms/PrimaryButton.svelte";
  import ResultsCount from "./components/atoms/ResultsCount.svelte";
  import Search from "./components/atoms/Search.svelte";
  import { demoBenefits } from "./services/benefitsService";
  import './components/styles/style.css'
  import CategoryPage from "./pages/CategoryPage.svelte";
  import FavoritesPage from "./pages/FavoritesPage.svelte";
  import { previewFavorites } from "./pages/favorites";
  import './components/styles/style.css'
  let selectedCategory = $state("Alimentação");
  let activeTab = $state<"home" | "map" | "favorites" | "history">("home");
  let favorite = $state(false);
  let previewExpanded = $state(false);
  let query = $state("");
  let searchText = $state("");
  let expandedAboutUnitId = $state<string | null>(null);

  const aboutUnitSamples = [
    {
      id: 'about-unit-1',
      title: 'Sobre a unidade',
      description:
        'Academia completa para saúde e condicionamento, com musculação, funcional, aulas coletivas e acompanhamento profissional especializado.',
    },
    {
      id: 'about-unit-2',
      title: 'Sobre a unidade',
      description:
        'Espaço moderno com equipamentos completos, avaliação física e programas personalizados para diferentes objetivos.',
    },
    {
      id: 'about-unit-3',
      title: 'Sobre a unidade',
      description:
        'Treinos de musculação, funcional e aulas coletivas com acompanhamento profissional em todos os horários.',
    },
  ];

  function toggleAboutUnit(id: string) {
    expandedAboutUnitId = expandedAboutUnitId === id ? null : id;
  }

  const categoryRoute = "/categoria/saude-e-bem-estar";
  const isCategoryRoute = window.location.pathname === categoryRoute;
  const isFavoritesRoute = window.location.pathname.replace(/\/$/, "") === "/favoritos";
  let favoritePlaces = $state([...previewFavorites]);

  function returnToHome() {
    window.location.assign("/");
  }
</script>

<svelte:head>
  <title>{isFavoritesRoute ? "Favoritos — WEG Benefits" : isCategoryRoute ? "Saúde e Bem-Estar — WEG Benefits" : "WEG Benefits — revisão dos componentes"}</title>
</svelte:head>

{#if isFavoritesRoute}
  <FavoritesPage
    places={favoritePlaces}
    onback={returnToHome}
    onremovefavorite={(id) => (favoritePlaces = favoritePlaces.filter((place) => place.id !== id))}
    onnavigate={(tab) => {
      if (tab === "home") returnToHome();
    }}
  />
{:else if isCategoryRoute}
  <CategoryPage onback={returnToHome} />
{:else}
<main class="component-preview">
  <header class="preview-header">
    <div>
      <p class="preview-eyebrow">WEG Benefits · interface</p>
      <h1>Componentes reutilizáveis</h1>
      <p class="preview-description">
        Prévia temporária para revisar a organização dos estilos.
      </p>
    </div>
    <BackButton label="Voltar" onclick={() => (activeTab = "home")} />
  </header>

  <section class="preview-map">
    <Map benefits={demoBenefits} />
  </section>

  <section class="preview-section" aria-labelledby="actions-title">
    <h2 id="actions-title">Ações e campos</h2>
    <div class="preview-field">
      <Input
        id="preview-input"
        label="E-mail corporativo"
        placeholder="nome@weg.net"
      />
    </div>
    <div class="preview-field"><Search bind:value={query} /></div>
    <PrimaryButton
      label="Encontrar benefícios"
      onclick={() => (searchText = query || "Exemplo de busca")}
    />
    {#if searchText}<p class="preview-feedback" aria-live="polite">
        Busca de demonstração: {searchText}
      </p>{/if}
    <FavoriteButton bind:liked={favorite} />
  </section>


  <section class="preview-section" aria-labelledby="expand-title">
    <h2 id="expand-title">Visualização do mapa</h2>
    <div class="preview-expand-demo" class:expanded={previewExpanded}>
      <div>
        <strong>Mapa de benefícios</strong>
        <p aria-live="polite">{previewExpanded ? 'Visualização expandida' : 'Visualização compacta'}</p>
      </div>
      <ExpandButton bind:expanded={previewExpanded} />
    </div>
  </section>
  <section class="preview-section" aria-labelledby="categories-title">
    <h2 id="categories-title">Categorias</h2>
    <div class="preview-categories">
      {#each ["Alimentação", "Saúde", "Compras", "Educação"] as category, index}
        <CategoryButton
          label={category}
          tone={(["sky", "mint", "amber", "lavender"] as const)[index]}
          selected={selectedCategory === category}
          onclick={() => (selectedCategory = category)}
        />
      {/each}
    </div>
  </section>

  <section class="preview-section" aria-labelledby="benefits-title">
    <div class="preview-title-row">
      <h2 class="page-title">Perto de você</h2>
    </div>
    <BenefitLocationCard benefit={demoBenefits[0]} distance="800 m" selected />
    <BenefitLocationCard benefit={demoBenefits[1]} distance="1,2 km" />
  </section>

  <section class="preview-section" aria-labelledby="facade-card-title">
    <h2 id="facade-card-title">Detalhes do estabelecimento</h2>
    <EstablishmentFacadeCard
      name="Academia Move"
      neighborhood="Centro"
      address="Rua das Palmeiras, 120"
      openingStatus="Aberto hoje"
      openingHours="06:00–22:00"
      contact="47 99914-1233"
      facadeImageUrl="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 500'%3E%3Crect width='800' height='500' fill='%23e9f3fb'/%3E%3Crect x='120' y='140' width='560' height='280' rx='12' fill='%2300579d'/%3E%3Crect x='175' y='195' width='150' height='225' fill='%23fff'/%3E%3Crect x='360' y='195' width='250' height='110' fill='%23b9d9ef'/%3E%3Crect x='360' y='325' width='250' height='95' fill='%23fff'/%3E%3Ctext x='400' y='105' text-anchor='middle' font-family='Arial' font-size='36' fill='%2314243a'%3EAcademia Move%3C/text%3E%3C/svg%3E"
    />
  </section>

  <section class="preview-section" aria-labelledby="about-unit-title">
    {#if expandedAboutUnitId === null}
      <div transition:fade={{ duration: 500 }}>
        <h2 id="about-unit-title">Sobre a unidade · componente largo</h2>
        <AboutUnitCard
          title="Sobre a unidade"
          description={aboutUnitSamples[0].description}
        />
      </div>
    {/if}
    <h2>Sobre a unidade · cards expansíveis</h2>
    <div class="about-unit-card-grid" class:expanded={expandedAboutUnitId !== null}>
      {#each aboutUnitSamples as unit (unit.id)}
        {#if expandedAboutUnitId === null || expandedAboutUnitId === unit.id}
          <div
            class="about-unit-card-grid__item"
            in:fade={{ duration: 500 }}
            out:fade={{ duration: 500 }}
          >
            <ExpandableAboutUnitCard
              title={unit.title}
              description={unit.description}
              expanded={expandedAboutUnitId === unit.id}
              onclick={() => toggleAboutUnit(unit.id)}
            />
          </div>
        {/if}
      {/each}
    </div>
  </section>

  <FloatingTabBar bind:selected={activeTab} />
</main>
{/if}

<style>
  :global(body) {
    margin: 0;
    background: #f3f7fa;
    color: #1b2938;
    font-family:
      Inter,
      system-ui,
      -apple-system,
      "Segoe UI",
      sans-serif;
  }
  :global(#app) {
    width: 100%;
    max-width: none;
    min-height: 100svh;
    border: 0;
    text-align: initial;
  }
  .component-preview {
    width: min(100% - 32px, 560px);
    margin: 0 auto;
    padding: 28px 0 112px;
    display: grid;
    gap: 24px;
  }
  .preview-header,
  .preview-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .preview-eyebrow {
    margin: 0 0 8px;
    color: #00579d;
    font-size: 12px;
    font-weight: 700;
  }
  .preview-header h1 {
    margin: 0;
    color: #112033;
    font-size: 24px;
    line-height: 1.2;
  }
  .preview-description {
    margin: 8px 0 0;
    color: #66768a;
    font-size: 14px;
  }
  .preview-section {
    display: grid;
    gap: 12px;
  }
  .preview-section h2 {
    margin: 0;
    color: #112033;
    font-size: 16px;
  }
  .preview-field {
    min-width: 0;
  }
  .preview-categories {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
  }
  .preview-feedback {
    margin: 0;
    color: #00579d;
    font-size: 13px;
  }
  .preview-expand-demo {
    min-height: 72px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    box-sizing: border-box;
    padding: 12px 14px;
    border: 1px solid #d8e2ec;
    border-radius: 18px;
    background: #fff;
    box-shadow: 0 4px 14px rgb(0 110 250 / 10%);
    transition:
      min-height 180ms ease,
      border-color 180ms ease,
      background-color 180ms ease;
  }
  .preview-expand-demo.expanded {
    min-height: 128px;
    border-color: #00579d;
    background: #f7fbfe;
  }
  .preview-expand-demo strong {
    color: #112033;
    font-size: 14px;
  }
  .preview-expand-demo p {
    margin: 4px 0 0;
    color: #66768a;
    font-size: 12px;
  }
  @media (max-width: 380px) {
    .component-preview {
      width: min(100% - 24px, 560px);
    }
    .preview-categories {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
