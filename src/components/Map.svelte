<script lang="ts">
  import { onMount } from 'svelte'
  import * as L from 'leaflet'
  import 'leaflet/dist/leaflet.css'

  type MapBenefit = {
    id: string
    name: string
    category: string
    latitude: number
    longitude: number
  }

  type MapPosition = {
    latitude: number
    longitude: number
  }

  type Props = {
    benefits: MapBenefit[]
    userLocation?: MapPosition | null
    routeCoordinates?: [number, number][] | null
    onBenefitSelect?: (benefit: MapBenefit) => void
  }

  let {
    benefits,
    userLocation = null,
    routeCoordinates = null,
    onBenefitSelect,
  }: Props = $props()

  const initialCenter: L.LatLngExpression = [-26.483, -49.078]
  const southAmericaBounds = L.latLngBounds([-45, -78], [10, -34])

  let mapElement: HTMLDivElement
  let map = $state.raw<L.Map | undefined>(undefined)
  let benefitMarkers = $state.raw<L.LayerGroup | undefined>(undefined)
  let locationMarker = $state.raw<L.CircleMarker | undefined>(undefined)
  let routeLayer = $state.raw<L.Polyline | undefined>(undefined)

  function createBenefitPopup(benefit: MapBenefit) {
    const content = document.createElement('div')
    const title = document.createElement('strong')
    const category = document.createElement('div')
    title.textContent = benefit.name
    category.textContent = benefit.category
    content.append(title, category)
    return content
  }

  function renderBenefits(
    mapInstance: L.Map,
    items: MapBenefit[],
    onSelect?: (benefit: MapBenefit) => void,
  ) {
    benefitMarkers ??= L.layerGroup().addTo(mapInstance)
    benefitMarkers.clearLayers()

    for (const benefit of items) {
      const marker = L.marker([benefit.latitude, benefit.longitude], {
        icon: L.divIcon({
          className: 'benefit-marker-wrapper',
          html: '<span class="benefit-marker"></span>',
          iconSize: [30, 42],
          iconAnchor: [15, 38],
          popupAnchor: [0, -36],
        }),
        title: benefit.name,
        alt: benefit.name,
      }).addTo(benefitMarkers)

      marker.bindPopup(createBenefitPopup(benefit))
      marker.on('click', () => onSelect?.(benefit))
    }
  }

  function renderUserLocation(mapInstance: L.Map, location: MapPosition | null) {
    if (!location) {
      locationMarker?.remove()
      locationMarker = undefined
      return
    }

    const position: L.LatLngExpression = [location.latitude, location.longitude]
    if (locationMarker) {
      locationMarker.setLatLng(position)
      return
    }

    locationMarker = L.circleMarker(position, {
      className: 'user-location-marker',
      radius: 9,
      color: '#fff',
      weight: 3,
      fillColor: '#1684e8',
      fillOpacity: 1,
    })
      .bindTooltip('Você está aqui')
      .addTo(mapInstance)
  }

  function renderRoute(
    mapInstance: L.Map,
    coordinates: [number, number][] | null,
  ) {
    routeLayer?.remove()
    routeLayer = undefined
    if (!coordinates?.length) return

    routeLayer = L.polyline(coordinates, {
      className: 'benefit-route',
      color: '#0878e8',
      weight: 5,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(mapInstance)

    const bounds = L.latLngBounds(coordinates)
    if (locationMarker) bounds.extend(locationMarker.getLatLng())
    mapInstance.fitBounds(bounds, { padding: [32, 32], maxZoom: 15 })
  }

  $effect(() => {
    const currentMap = map
    const currentBenefits = benefits
    const currentLocation = userLocation
    const currentRouteCoordinates = routeCoordinates
    const currentOnBenefitSelect = onBenefitSelect

    if (!currentMap) return

    renderBenefits(currentMap, currentBenefits, currentOnBenefitSelect)
    renderUserLocation(currentMap, currentLocation)
    renderRoute(currentMap, currentRouteCoordinates)
  })

  onMount(() => {
    map = L.map(mapElement, {
      zoomControl: false,
      preferCanvas: true,
      maxBounds: southAmericaBounds,
      maxBoundsViscosity: 2,
      minZoom: 4,
      maxZoom: 18,
    }).setView(initialCenter, 13)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      noWrap: true,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    return () => {
      map?.remove()
      map = undefined
      benefitMarkers = undefined
      locationMarker = undefined
      routeLayer = undefined
    }
  })
</script>

<section class="benefits-map" aria-label="Mapa de benefícios">
  <div class="map-frame">
    <div
      class="map-canvas"
      bind:this={mapElement}
      aria-label="Mapa interativo com benefícios no Brasil."
      role="application"
    ></div>
    <div class="map-legend" aria-hidden="true">
      <span class="legend-benefit"></span> Benefício
      {#if userLocation}
        <span class="legend-user"></span> Você
      {/if}
    </div>
  </div>
</section>