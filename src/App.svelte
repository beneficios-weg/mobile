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
  import { findCategory, findPlace, establishmentDetails, type DirectoryPlace } from './pages/catalog'
  import { previewFavoritesLocation } from './pages/favorites'
  import { navigation, syncLocation, goBack } from './lib/navigation.svelte'
  import { resolveRoute } from './lib/routes'
  import { siteState, setFavorite } from './lib/siteState.svelte'

  const route = $derived(resolveRoute(navigation.url))
  const category = $derived(route.kind === 'category' ? findCategory(route.parameter ?? '') : undefined)
  const place = $derived(route.kind === 'establishment' ? findPlace(route.parameter ?? '') : undefined)
  const favorites = $derived(siteState.favoriteIds.map(findPlace).filter((item): item is DirectoryPlace => !!item))

  onMount(() => {
    window.addEventListener('popstate', syncLocation)
    return () => window.removeEventListener('popstate', syncLocation)
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
  {#if route.kind === 'home'}
    <MainPage />
  {:else if route.kind === 'login'}
    <Login />
  {:else if route.kind === 'favorites'}
    <FavoritesPage places={favorites} userLocation={previewFavoritesLocation} onback={() => goBack('/')} onremovefavorite={(id) => setFavorite(id, false)} />
  {:else if route.kind === 'visited'}
    <VisitedPage onback={() => goBack('/')} />
  {:else if route.kind === 'category' && category}
    <CategoryPage categorySlug={category.slug} onback={() => goBack('/')} />
  {:else if route.kind === 'establishment' && place}
    <EstablishmentInfoPage establishment={establishmentDetails(place)} liked={siteState.favoriteIds.includes(place.id)} onlikedchange={(liked) => setFavorite(place.id, liked)} />
  {:else if route.kind === 'preview'}
    <ComponentPreviewPage />
  {:else}
    <NotFoundPage />
  {/if}
{/key}

{#if navigation.map}
  <MapDialog context={navigation.map} />
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
</style>
