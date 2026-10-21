<script lang="ts">
  import { onMount } from 'svelte'
  import * as L from 'leaflet'
  import 'leaflet/dist/leaflet.css'
  import BenefitLocationCard from './atoms/BenefitLocationCard.svelte'
  import { demoBenefits, type Benefit } from '../services/benefitsService'
  import { getCurrentLocation, type Coordinates } from '../services/geolocationService'
  import { getManualBenefits, saveManualBenefits } from '../services/manualBenefitsService'
  import { getDrivingRoute, type RouteResult } from '../services/routingService'

  const initialCenter: L.LatLngExpression = [-26.483, -49.078]
  const brazilBounds = L.latLngBounds([-34, -74], [6, -34])
  const isInsideBrazil = (benefit: Benefit) =>
    brazilBounds.contains([benefit.latitude, benefit.longitude])

  let mapElement: HTMLDivElement
  let map: L.Map | undefined
  let locationMarker: L.CircleMarker | undefined
  let routeLayer: L.Polyline | undefined
  let benefitMarkers: L.LayerGroup | undefined
  let currentLocation = $state<Coordinates | null>(null)
  let selectedBenefit = $state<Benefit | null>(null)
  let manualBenefits = $state<Benefit[]>([])
  let allBenefits = $derived(
    [...demoBenefits, ...manualBenefits].filter(isInsideBrazil),
  )
  let locationState = $state<'idle' | 'loading' | 'ready' | 'error'>('idle')
  let routeState = $state<'idle' | 'loading' | 'ready' | 'error'>('idle')
  let locationMessage = $state('')
  let routeMessage = $state('')
  let routeSummary = $state('')
  let routeController: AbortController | undefined

  function formatDistance(meters: number) {
    return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`
  }

  function formatDuration(seconds: number) {
    const minutes = Math.max(1, Math.round(seconds / 60))
    if (minutes < 60) return `${minutes} min de carro`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes ? `${hours} h ${remainingMinutes} min de carro` : `${hours} h de carro`
  }

  function distanceFromUser(benefit: Benefit) {
    if (!currentLocation) return ''

    const radians = (degrees: number) => (degrees * Math.PI) / 180
    const earthRadiusKm = 6371
    const latitudeDelta = radians(benefit.latitude - currentLocation.latitude)
    const longitudeDelta = radians(benefit.longitude - currentLocation.longitude)
    const a =
      Math.sin(latitudeDelta / 2) ** 2 +
      Math.cos(radians(currentLocation.latitude)) *
        Math.cos(radians(benefit.latitude)) *
        Math.sin(longitudeDelta / 2) ** 2
    const distanceKm = earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return distanceKm < 1
      ? `${Math.round(distanceKm * 1000)} m`
      : `${distanceKm.toFixed(1).replace('.', ',')} km`
  }

  function makeBenefitPopup(benefit: Benefit) {
    const content = document.createElement('div')
    const title = document.createElement('strong')
    const category = document.createElement('div')
    title.textContent = benefit.name
    category.textContent = benefit.category
    content.append(title, category)
    return content
  }

  function addBenefitMarkers() {
    if (!map) return

    benefitMarkers?.remove()
    benefitMarkers = L.layerGroup().addTo(map)

    for (const benefit of allBenefits) {
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

      marker.bindPopup(makeBenefitPopup(benefit))
      marker.on('click', () => void selectBenefit(benefit))
    }
  }

  async function requestLocation() {
    locationState = 'loading'
    locationMessage = ''

    try {
      currentLocation = await getCurrentLocation()
      if (!brazilBounds.contains([currentLocation.latitude, currentLocation.longitude])) {
        currentLocation = null
        throw new Error('Sua localização está fora da área atendida no Brasil.')
      }
      locationState = 'ready'
      locationMessage = 'Sua localização foi encontrada.'

      if (map) {
        const position: L.LatLngExpression = [currentLocation.latitude, currentLocation.longitude]
        if (locationMarker) locationMarker.setLatLng(position)
        else {
          locationMarker = L.circleMarker(position, {
            className: 'user-location-marker',
            radius: 9,
            color: '#fff',
            weight: 3,
            fillColor: '#1684e8',
            fillOpacity: 1,
          })
            .bindTooltip('Você está aqui')
            .addTo(map)
        }

        if (selectedBenefit) await loadRoute(selectedBenefit)
        else map.setView(position, 15)
      }
    } catch (error) {
      locationState = 'error'
      locationMessage =
        error instanceof Error ? error.message : 'Não foi possível obter sua localização.'
    }
  }

  async function selectBenefit(benefit: Benefit) {
    selectedBenefit = benefit
    routeMessage = ''
    routeSummary = ''
    routeController?.abort()
    routeLayer?.remove()
    routeLayer = undefined

    map?.setView([benefit.latitude, benefit.longitude], 15, { animate: true })
    if (map) {
      L.popup().setLatLng([benefit.latitude, benefit.longitude]).setContent(makeBenefitPopup(benefit)).openOn(map)
    }

    if (currentLocation) await loadRoute(benefit)
    else routeMessage = 'Ative sua localização para traçar a rota até este benefício.'
  }

  async function loadRoute(benefit: Benefit) {
    if (!map || !currentLocation) return

    routeController?.abort()
    routeLayer?.remove()
    routeLayer = undefined
    routeController = new AbortController()
    const controller = routeController
    routeState = 'loading'
    routeMessage = 'Calculando a rota…'
    routeSummary = ''

    try {
      const route: RouteResult = await getDrivingRoute(
        currentLocation,
        benefit,
        controller.signal,
      )
      if (controller.signal.aborted || selectedBenefit?.id !== benefit.id) return

      routeLayer = L.polyline(route.coordinates, {
        className: 'benefit-route',
        color: '#0878e8',
        weight: 5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map)

      const bounds = L.latLngBounds(route.coordinates)
      if (locationMarker) bounds.extend(locationMarker.getLatLng())
      map.fitBounds(bounds, { padding: [32, 32], maxZoom: 15 })

      routeState = 'ready'
      routeMessage = ''
      routeSummary = `${formatDistance(route.distanceMeters)} · ${formatDuration(route.durationSeconds)}`
    } catch (error) {
      if (controller.signal.aborted) return
      routeState = 'error'
      routeMessage = error instanceof Error ? error.message : 'Não foi possível calcular a rota.'
    }
  }

  onMount(() => {
    manualBenefits = getManualBenefits().filter((benefit) =>
      brazilBounds.contains([benefit.latitude, benefit.longitude]),
    )

    map = L.map(mapElement, {
      zoomControl: false,
      preferCanvas: true,
      maxBounds: brazilBounds,
      maxBoundsViscosity: 1,
      minZoom: 4,
      maxZoom: 18,
    }).setView(initialCenter, 13)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      noWrap: true,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)
    addBenefitMarkers()
    return () => {
      routeController?.abort()
      map?.remove()
      map = undefined
    }
  })
</script>

<section class="benefits-map" aria-labelledby="map-title">
  <header class="map-header">
    <div>
      <p class="eyebrow">Benefícios por perto</p>
      <h1 id="map-title">Encontre um benefício</h1>
      <p class="intro">Veja os locais no mapa e trace uma rota a partir da sua localização.</p>
    </div>
    <button
      class="location-button"
      type="button"
      onclick={requestLocation}
      disabled={locationState === 'loading'}
    >
      {locationState === 'loading' ? 'Localizando…' : 'Usar minha localização'}
    </button>
  </header>

  {#if locationMessage}
    <p class:status-error={locationState === 'error'} class="status" aria-live="polite">
      {locationMessage}
    </p>
  {/if}

  <div class="benefit-list" aria-label="Benefícios disponíveis">
    {#each allBenefits as benefit (benefit.id)}
      {@const distance = distanceFromUser(benefit)}
      <BenefitLocationCard
        {benefit}
        {distance}
        selected={selectedBenefit?.id === benefit.id}
        onclick={() => selectBenefit(benefit)}
      />
    {/each}
  </div>

  {#if routeMessage || routeSummary}
    <p class:status-error={routeState === 'error'} class="route-status" aria-live="polite">
      {routeMessage || routeSummary}
    </p>
  {/if}

  <div class="map-frame">
    <div
      class="map-canvas"
      bind:this={mapElement}
      aria-label="Mapa interativo com benefícios no Brasil."
      role="application"
    ></div>
    <div class="map-legend" aria-hidden="true">
      <span class="legend-benefit"></span> Benefício
      <span class="legend-user"></span> Você
    </div>
  </div>
</section>
