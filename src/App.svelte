<script lang="ts">
  import BackButton from "./components/atoms/BackButton.svelte";
  import BenefitLocationCard from "./components/atoms/BenefitLocationCard.svelte";
  import CategoryButton from "./components/atoms/CategoryButton.svelte";
  import FavoriteButton from "./components/atoms/FavoriteButton.svelte";
  import FloatingTabBar from "./components/atoms/FloatingTabBar.svelte";
  import Input from "./components/atoms/Input.svelte";
  import Map from "./components/Map.svelte";
  import PrimaryButton from "./components/atoms/PrimaryButton.svelte";
  import ResultsCount from "./components/atoms/ResultsCount.svelte";
  import Search from "./components/atoms/Search.svelte";
  import { demoBenefits } from "./services/benefitsService";
  import './components/styles/style.css'
  let selectedCategory = $state("Alimentação");
  let activeTab = $state<"home" | "map" | "favorites" | "history">("home");
  let favorite = $state(false);
  let query = $state("");
  let searchText = $state("");
</script>

<svelte:head>
  <title>WEG Benefits — revisão dos componentes</title>
</svelte:head>

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

  <FloatingTabBar bind:selected={activeTab} />
</main>

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
  @media (max-width: 380px) {
    .component-preview {
      width: min(100% - 24px, 560px);
    }
    .preview-categories {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>