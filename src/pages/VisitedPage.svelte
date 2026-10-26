<script lang="ts">
  import CategoryPage from './CategoryPage.svelte'

  type Props = { onback?: () => void }
  let { onback }: Props = $props()

  function navigate(tab: 'home' | 'map' | 'favorites' | 'history') {
    if (tab === 'home') window.location.assign('/')
    else if (tab === 'favorites') window.location.assign('/favoritos')
    else if (tab === 'map') document.querySelector<HTMLElement>('.visited-page .leaflet-container')?.focus()
  }
</script>

<CategoryPage variant="visited" {onback} onnavigate={navigate} />
