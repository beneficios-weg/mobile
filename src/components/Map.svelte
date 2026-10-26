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
    variant?: 'default' | 'category'
    showTiles?: boolean
    center?: MapPosition
    initialZoom?: number
    selectedBenefitId?: string | null
    userLocation?: MapPosition | null
    routeCoordinates?: [number, number][] | null
    onBenefitSelect?: (benefit: MapBenefit) => void
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
  }: Props = $props()

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
    selectedId: string | null = null,
    categoryStyle = false,
  ) {
    benefitMarkers ??= L.layerGroup().addTo(mapInstance)
    benefitMarkers.clearLayers()

    for (const benefit of items) {
      const marker = L.marker([benefit.latitude, benefit.longitude], {
        icon: L.divIcon({
          className: categoryStyle ? 'benefit-marker-wrapper benefit-marker-wrapper--category' : 'benefit-marker-wrapper',
          html: categoryStyle
            ? `<span class="benefit-marker benefit-marker--category${benefit.id === selectedId ? ' is-selected' : ''}"></span>`
            : '<span class="benefit-marker"></span>',
          iconSize: categoryStyle ? [24, 24] : [30, 42],
          iconAnchor: categoryStyle ? [12, 12] : [15, 38],
          popupAnchor: categoryStyle ? [0, -12] : [0, -36],
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
    const currentVariant = variant
    const currentSelectedBenefitId = selectedBenefitId
    const currentLocation = userLocation
    const currentRouteCoordinates = routeCoordinates
    const currentOnBenefitSelect = onBenefitSelect

    if (!currentMap) return

    renderBenefits(
      currentMap,
      currentBenefits,
      currentOnBenefitSelect,
      currentSelectedBenefitId,
      currentVariant === 'category',
    )
    renderUserLocation(currentMap, currentLocation)
    renderRoute(currentMap, currentRouteCoordinates)
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
      locationMarker = undefined
      routeLayer = undefined
    }
  })
</script>

<section class="benefits-map" class:benefits-map--category={variant === 'category'} aria-label="Mapa de benefícios">
  {#if variant === 'category'}
    <svg class="map-filter-definitions" aria-hidden="true" focusable="false">
      <defs>
        <filter id="osm-empty-land-tint" color-interpolation-filters="sRGB">
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              2.126 7.152 0.722 0 -9"
            result="brightness-mask"
          />
          <feComponentTransfer in="brightness-mask" result="empty-area-mask">
            <feFuncA type="table" tableValues="0 0 1 0 0" />
          </feComponentTransfer>
          <feFlood flood-color="#001f3f" result="blue-tint" />
          <feComposite in="blue-tint" in2="empty-area-mask" operator="in" result="tinted-empty-area" />
          <feBlend in="SourceGraphic" in2="tinted-empty-area" mode="normal" />
        </filter>
      </defs>
    </svg>
  {/if}
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
