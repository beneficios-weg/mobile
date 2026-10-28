<script lang="ts">
  import { onMount, tick } from 'svelte'
  import MainPage from './pages/MainPage.svelte'
  import CategoryPage from './pages/CategoryPage.svelte'
  import FavoritesPage from './pages/FavoritesPage.svelte'
  import VisitedPage from './pages/VisitedPage.svelte'
  import EstablishmentInfoPage from './pages/EstablishmentInfoPage.svelte'
  import Login from './pages/Login.svelte'
  import ComponentPreviewPage from './pages/ComponentPreviewPage.svelte'
  import NotFoundPage from './pages/NotFoundPage.svelte'
  import MapDialog from './components/MapDialog.svelte'
  import { findCategory, findPlace, establishmentDetails, initialize, refresh } from './lib/siteState.svelte'
  import type { DirectoryPlace } from './pages/catalog'
  import { navigation, syncLocation, goBack } from './lib/navigation.svelte'
  import { resolveRoute } from './lib/routes'
  import { siteState, setFavorite } from './lib/siteState.svelte'

  const route = $derived(resolveRoute(navigation.url))
  const category = $derived(route.kind === 'category' ? findCategory(route.parameter ?? '') : undefined)
  const place = $derived(route.kind === 'establishment' ? findPlace(route.parameter ?? '') : undefined)
  const favorites = $derived(siteState.favoriteIds.map(findPlace).filter((item): item is DirectoryPlace => !!item))

  onMount(() => {
    void initialize()
    const reconnect = () => { void refresh() }
    window.addEventListener('online', reconnect)
    window.addEventListener('popstate', syncLocation)
    return () => { window.removeEventListener('popstate', syncLocation); window.removeEventListener('online', reconnect) }
  })

  $effect(() => {
    navigation.url
    let cancelled = false
    void tick().then(() => {
      if (cancelled || navigation.map) return
      const heading = [...document.querySelectorAll<HTMLElement>('main h1')].find(element => element.getClientRects().length && getComputedStyle(element).display !== 'none')
      heading?.setAttribute('tabindex', '-1')
      heading?.focus({ preventScroll: true })
    })
    return () => { cancelled = true }
  })
</script>

{#key route.key}
  {#if siteState.phase === 'checking'}
    <main class="connection-screen"><h1>Conectando ao WEG Benefits…</h1><p>O primeiro acesso pode demorar alguns minutos.</p></main>
  {:else if siteState.phase === 'signed-out'}
    <Login />
  {:else if route.kind === 'home'}
    <MainPage />
  {:else if route.kind === 'login'}
    <Login />
  {:else if route.kind === 'favorites'}
    <FavoritesPage places={favorites} onback={() => goBack('/')} onremovefavorite={(id) => setFavorite(id, false)} />
  {:else if route.kind === 'visited'}
    <VisitedPage onback={() => goBack('/')} />
  {:else if route.kind === 'category' && category}
    <CategoryPage categorySlug={category.slug} onback={() => goBack('/')} />
  {:else if route.kind === 'establishment' && place}
    <EstablishmentInfoPage establishment={establishmentDetails(place.id)!} controlledFavorite liked={siteState.favoriteIds.includes(place.id)} onlikedchange={(liked) => setFavorite(place.id, liked)} />
  {:else if !siteState.syncedAt && siteState.syncing}
    <main class="connection-screen"><h1>Carregando benefícios…</h1></main>
  {:else if !siteState.syncedAt && siteState.offline}
    <main class="connection-screen"><h1>Benefícios indisponíveis</h1><p>Reconecte para carregar seus benefícios.</p></main>
  {:else if route.kind === 'preview'}
    <ComponentPreviewPage />
  {:else}
    <NotFoundPage />
  {/if}
{/key}

{#if siteState.phase === 'ready'}
  <aside class="sync-notice" aria-label="Estado da conexão">
    <span role="status">{siteState.syncing ? 'Atualizando benefícios…' : siteState.message}{#if siteState.queue.length} {siteState.queue.length} alteração(ões) de favoritos aguardando sincronização.{/if}</span>
    <button type="button" disabled={siteState.syncing} onclick={() => { siteState.message = ''; void refresh() }}>Atualizar</button>
  </aside>
{/if}

{#if navigation.map}
  <MapDialog context={navigation.map} />
{/if}

<style>
  .connection-screen { padding: 2rem; }
  .sync-notice { position: fixed; z-index: 1100; top: 0; left: 50%; transform: translateX(-50%); max-width: min(90vw, 40rem); padding: .35rem .75rem; background: #fff; border-radius: 0 0 .75rem .75rem; font-size: .75rem; display: flex; align-items: center; gap: .75rem; }
  .sync-notice button { color: #005ca9; border: 0; background: transparent; cursor: pointer; }


  :global(body) {
    margin: 0;
    background: #f3f7fa;
    color: #1b2938;
    font-family:
      -apple-system,
      BlinkMacSystemFont,
      "SF Pro",
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
</style>
