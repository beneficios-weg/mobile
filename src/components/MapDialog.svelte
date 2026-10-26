<script lang="ts">
  import { onMount } from 'svelte'
  import BackButton from './atoms/BackButton.svelte'
  import Map from './Map.svelte'
  import { closeMap, openEstablishment, type MapContext } from '../lib/navigation.svelte'
  import './styles/map-dialog.css'

  let { context }: { context: MapContext } = $props()
  let dialog: HTMLDialogElement
  let opened = $state(false)
  onMount(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    dialog.showModal()
    opened = true
    return () => {
      dialog.close()
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
    }
  })
</script>

<dialog class="map-dialog" bind:this={dialog} aria-labelledby="map-dialog-title"
  oncancel={(event) => { event.preventDefault(); closeMap() }}>
  <header class="map-dialog__header">
    <BackButton label="Voltar para a página anterior" onclick={closeMap} />
    <h1 id="map-dialog-title">{context.title}</h1>
  </header>
  <div class="map-dialog__map">
    {#if opened}
    <Map
      benefits={context.benefits}
      center={context.center}
      userLocation={context.userLocation}
      selectedBenefitId={context.selectedBenefitId}
      initialZoom={context.initialZoom ?? 13}
      onViewportChange={(viewport) => {
        context.center = viewport.center
        context.initialZoom = viewport.zoom
        context.onviewportchange?.(viewport)
      }}
      onBenefitSelect={(place) => {
        context.selectedBenefitId = place.id
        context.onselect?.(place.id)
      }}
      onBenefitOpen={(place) => openEstablishment(place.id)}
    />
    {/if}
  </div>
</dialog>
