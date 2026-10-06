<script lang="ts">
  import { onMount } from 'svelte'
  import L from 'leaflet'
  import 'leaflet/dist/leaflet.css'
  import type { Establishment } from '../domain/models'
  let { establishments, current = null, online = true, onselect }: {
    establishments: Establishment[]; current?: { latitude: number; longitude: number } | null
    online?: boolean; onselect: (establishment: Establishment) => void
  } = $props()
  let element: HTMLDivElement
  let map = $state<L.Map | null>(null)
  let tiles: L.TileLayer | null = null
  let markers: L.LayerGroup | null = null
  let alive = false
  onMount(() => {
    const instance = L.map(element, { zoomControl: true, zoomAnimation: false, fadeAnimation: false, markerZoomAnimation: false }).setView([-26.486, -49.066], 12)
    alive = true
    markers = L.layerGroup().addTo(instance)
    map = instance
    const observer = new ResizeObserver(() => { if (alive) instance.invalidateSize() })
    observer.observe(element)
    return () => { alive = false; observer.disconnect(); map = null; markers = null; tiles = null; instance.stop(); instance.remove() }
  })
  $effect(() => {
    const instance = map
    if (!instance || !markers || !alive) return
    markers.clearLayers()
    for (const item of establishments) {
      L.circleMarker([item.latitude, item.longitude], { radius: 10, color: '#fff', weight: 2, fillColor: '#006aa7', fillOpacity: 1 })
        .bindTooltip(item.name).on('click', () => onselect(item)).addTo(markers)
    }
    if (current) L.circleMarker([current.latitude, current.longitude], { radius: 6, color: '#e4f6ff', fillColor: '#232e45', fillOpacity: 1 }).bindTooltip('Sua posição').addTo(markers)
    const coordinates = establishments.map(item => [item.latitude, item.longitude] as L.LatLngTuple)
    if (current) coordinates.push([current.latitude, current.longitude])
    if (coordinates.length) instance.fitBounds(L.latLngBounds(coordinates), { padding: [30, 30], maxZoom: 15, animate: false })
    if (online && !tiles) {
      tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(instance)
    } else if (!online && tiles) { tiles.remove(); tiles = null }
  })
</script>

<div class="map-shell">
  <div bind:this={element} class="map" aria-label="Mapa dos estabelecimentos. Os mesmos locais estão disponíveis na lista."></div>
  {#if !online}<p class="map-note">Sem internet: consulte os locais salvos na lista. Mapas não são baixados para uso offline.</p>{/if}
</div>

<style>
  .map-shell { position: relative; height: 100%; min-height: 260px; overflow: hidden; border-radius: 24px; isolation: isolate; }
  .map { height: 100%; min-height: 260px; background: #e8eef1; }
  .map-note { position: absolute; bottom: 25px; left: 10px; right: 10px; z-index: 500; background: white; padding: 12px; border-radius: 12px; font-size: .8rem; }
</style>
