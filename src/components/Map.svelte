<script lang="ts">
  import { onMount } from 'svelte'
  import * as L from 'leaflet'
  import 'leaflet/dist/leaflet.css'
  import type { MapPlace as MapBenefit, MapPosition, MapViewport } from '../lib/mapTypes'

  type Props = {
    benefits: MapBenefit[]
    variant?: 'default' | 'category'
    showTiles?: boolean
    center?: MapPosition
    initialZoom?: number
    selectedBenefitId?: string | null
    userLocation?: MapPosition | null
    routeCoordinates?: [number, number][] | null
    onBenefitSelect?: (benefit: MapBenefit) => void
    onBenefitOpen?: (benefit: MapBenefit) => void
    onViewportChange?: (viewport: MapViewport) => void
  }

  let {
    benefits,
    variant = 'default',
    showTiles = true,
    center = { latitude: -26.483, longitude: -49.078 },
    initialZoom = 13,
    selectedBenefitId = null,
    userLocation = null,
    routeCoordinates = null,
    onBenefitSelect,
    onBenefitOpen,
    onViewportChange,
  }: Props = $props()

  const southAmericaBounds = L.latLngBounds([-45, -78], [10, -34])

  let mapElement: HTMLDivElement
  let map = $state.raw<L.Map | undefined>(undefined)
  let benefitMarkers = $state.raw<L.LayerGroup | undefined>(undefined)
  let locationMarker = $state.raw<L.CircleMarker | undefined>(undefined)
  let routeLayer = $state.raw<L.Polyline | undefined>(undefined)
  const markersById = new globalThis.Map<string, L.Marker>()

  function createBenefitPopup(benefit: MapBenefit) {
    const content = document.createElement('div')
    const title = document.createElement('strong')
    const category = document.createElement('div')
    title.textContent = benefit.name
    category.textContent = benefit.category
    content.append(title, category)
    if (onBenefitOpen) {
      const action = document.createElement('button')
      action.type = 'button'
      action.className = 'map-popup-action'
      action.textContent = 'Ver estabelecimento'
      action.addEventListener('click', () => {
        const current = benefits.find((item) => item.id === benefit.id)
        if (current) onBenefitOpen?.(current)
      })
      content.append(action)
    }
    return content
  }

  function renderBenefits(
    mapInstance: L.Map,
    items: MapBenefit[],
    selectedId: string | null = null,
  ) {
    benefitMarkers ??= L.layerGroup().addTo(mapInstance)
    const visibleIds = new Set(items.map((benefit) => benefit.id))
    for (const [id, marker] of markersById) {
      if (!visibleIds.has(id)) {
        benefitMarkers.removeLayer(marker)
        markersById.delete(id)
      }
    }

    for (const benefit of items) {
      let marker = markersById.get(benefit.id)
      if (!marker) {
        marker = L.marker([benefit.latitude, benefit.longitude], {
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
        marker.on('click', () => {
          const currentBenefit = benefits.find((item) => item.id === benefit.id)
          if (currentBenefit) onBenefitSelect?.(currentBenefit)
        })
        markersById.set(benefit.id, marker)
      } else {
        marker.setLatLng([benefit.latitude, benefit.longitude])
      }

      marker.bindPopup(createBenefitPopup(benefit))
      const element = marker.getElement()
      element?.setAttribute('aria-label', `Selecionar ${benefit.name}, ${benefit.category}`)
      element?.setAttribute('aria-pressed', String(benefit.id === selectedId))
      element?.querySelector('.benefit-marker')?.classList.toggle('is-selected', benefit.id === selectedId)
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
    const currentSelectedBenefitId = selectedBenefitId
    const currentLocation = userLocation
    const currentRouteCoordinates = routeCoordinates

    if (!currentMap) return

    renderBenefits(
      currentMap,
      currentBenefits,
      currentSelectedBenefitId,
    )
    renderUserLocation(currentMap, currentLocation)
    renderRoute(currentMap, currentRouteCoordinates)
    const selectedBenefit = currentBenefits.find((benefit) => benefit.id === currentSelectedBenefitId)
    if (selectedBenefit && !currentMap.getBounds().contains([selectedBenefit.latitude, selectedBenefit.longitude])) {
      currentMap.panTo([selectedBenefit.latitude, selectedBenefit.longitude])
    }
  })

  $effect(() => {
    const instance = map
    const nextCenter = center
    const nextZoom = initialZoom
    if (!instance) return
    const current = instance.getCenter()
    if (Math.abs(current.lat - nextCenter.latitude) > 0.000001 || Math.abs(current.lng - nextCenter.longitude) > 0.000001 || instance.getZoom() !== nextZoom) {
      instance.setView([nextCenter.latitude, nextCenter.longitude], nextZoom, { animate: false })
    }
  })

  onMount(() => {
    map = L.map(mapElement, {
      zoomControl: false,
      attributionControl: showTiles && variant !== 'category',
      preferCanvas: true,
      maxBounds: southAmericaBounds,
      maxBoundsViscosity: 2,
      minZoom: 4,
      maxZoom: 18,
    }).setView([center.latitude, center.longitude], initialZoom)

    const reportViewport = () => {
      if (!map) return
      const current = map.getCenter()
      onViewportChange?.({ center: { latitude: current.lat, longitude: current.lng }, zoom: map.getZoom() })
    }
    map.on('moveend zoomend', reportViewport)
    reportViewport()

    if (showTiles) {
      const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      L.tileLayer(tileUrl, {
        maxZoom: 18,
        noWrap: true,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)
    }

    if (variant === 'category' && showTiles) {
      L.control.attribution({ position: 'topright', prefix: false }).addTo(map)
    }
    if (variant === 'default') L.control.zoom({ position: 'bottomright' }).addTo(map)

    const resizeObserver = new ResizeObserver(() => map?.invalidateSize({ pan: false }))
    resizeObserver.observe(mapElement)
    requestAnimationFrame(() => map?.invalidateSize({ pan: false }))

    return () => {
      resizeObserver.disconnect()
      map?.remove()
      map = undefined
      benefitMarkers = undefined
      markersById.clear()
      locationMarker = undefined
      routeLayer = undefined
    }
  })
</script>

<section class="benefits-map" class:benefits-map--category={variant === 'category'} aria-label="Mapa de benefícios">
  <div class="map-frame">
    <div
      class="map-canvas"
      bind:this={mapElement}
      aria-label="Mapa interativo com benefícios no Brasil."
      role="application"
    ></div>
    {#if variant === 'default'}
    <div class="map-legend" aria-hidden="true">
      <span class="legend-benefit"></span> Benefício
      {#if userLocation}
        <span class="legend-user"></span> Você
      {/if}
    </div>
    {/if}
  </div>
</section>
