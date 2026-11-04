<script lang="ts">
  import { onMount, untrack } from 'svelte'
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
    userLocationLabel?: string
    routeCoordinates?: [number, number][] | null
    alternativeRoutes?: [number, number][][]
    navigationActive?: boolean
    routePadding?: { topLeft: [number, number]; bottomRight: [number, number] }
    constrainToRegion?: boolean
    onBenefitSelect?: (benefit: MapBenefit) => void
    onBenefitOpen?: (benefit: MapBenefit) => void
    onViewportChange?: (viewport: MapViewport) => void
    onMapClick?: () => void
    onAlternativeSelect?: (index: number) => void
  }

  let {
    benefits,
    variant = 'default',
    showTiles = true,
    center = { latitude: -26.483, longitude: -49.078 },
    initialZoom = 13,
    selectedBenefitId = null,
    userLocation = null,
    userLocationLabel = 'Você está aqui',
    routeCoordinates = null,
    alternativeRoutes = [],
    navigationActive = false,
    routePadding = { topLeft: [32, 32], bottomRight: [32, 32] },
    constrainToRegion = true,
    onBenefitSelect,
    onBenefitOpen,
    onViewportChange,
    onMapClick,
    onAlternativeSelect,
  }: Props = $props()

  const southAmericaBounds = L.latLngBounds([-45, -78], [10, -34])

  let mapElement: HTMLDivElement
  let map = $state.raw<L.Map | undefined>(undefined)
  let benefitMarkers = $state.raw<L.LayerGroup | undefined>(undefined)
  let locationMarker = $state.raw<L.CircleMarker | undefined>(undefined)
  let routeLayer = $state.raw<L.Polyline | undefined>(undefined)
  let routeOutline: L.Polyline | undefined
  let alternativeLayers: L.LayerGroup | undefined
  let routeRenderer: L.Canvas | undefined
  let reportedViewport: MapViewport | undefined
  const markersById = new globalThis.Map<string, L.Marker>()

  export function changeZoom(delta: number) {
    map?.setZoom(map.getZoom() + delta)
  }

  export function recenter(position: MapPosition) {
    map?.panTo([position.latitude, position.longitude])
  }

  export function fitRoute(animate = false) {
    if (!map || !routeCoordinates?.length) return
    const bounds = L.latLngBounds(routeCoordinates)
    for (const route of alternativeRoutes) bounds.extend(L.latLngBounds(route))
    if (userLocation) bounds.extend([userLocation.latitude, userLocation.longitude])
    for (const place of benefits) bounds.extend([place.latitude, place.longitude])
    const padding = { paddingTopLeft: routePadding.topLeft, paddingBottomRight: routePadding.bottomRight, maxZoom: 16 }
    if (animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      map.flyToBounds(bounds, { ...padding, duration: 0.7 })
    } else map.fitBounds(bounds, { ...padding, animate: false })
  }

  export function focusUser() {
    if (!map || !userLocation) return
    const zoom = 17
    const size = map.getSize()
    const left = routePadding.topLeft[0], top = routePadding.topLeft[1]
    const right = routePadding.bottomRight[0], bottom = routePadding.bottomRight[1]
    const target = L.point(left + Math.max(40, size.x - left - right) / 2, top + Math.max(40, size.y - top - bottom) * 0.65)
    const position = map.project([userLocation.latitude, userLocation.longitude], zoom)
    const center = map.unproject(position.subtract(target.subtract(size.divideBy(2))), zoom)
    map.setView(center, zoom, { animate: !window.matchMedia('(prefers-reduced-motion: reduce)').matches })
  }

  export function focusBenefit(id: string) {
    const marker = markersById.get(id)
    if (!map || !marker) return
    map.panTo(marker.getLatLng())
    marker.openPopup()
    mapElement.focus({ preventScroll: true })
  }

  export function fitBenefits(items: MapBenefit[] = benefits) {
    if (!map || !items.length) return
    map.fitBounds(L.latLngBounds(items.map(item => [item.latitude, item.longitude])), {
      paddingTopLeft: [32, 132],
      paddingBottomRight: [64, 160],
      maxZoom: 15,
    })
  }

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
      .bindTooltip(userLocationLabel)
      .addTo(mapInstance)
  }

  function renderRoute(
    mapInstance: L.Map,
    coordinates: [number, number][] | null,
  ) {
    routeLayer?.remove()
    routeOutline?.remove()
    alternativeLayers?.remove()
    routeLayer = undefined
    routeOutline = undefined
    alternativeLayers = undefined
    if (!coordinates?.length) return
    routeRenderer ??= L.canvas({ tolerance: 2 })

    alternativeLayers = L.layerGroup().addTo(mapInstance)
    if (!navigationActive) for (const [index, alternative] of alternativeRoutes.entries()) {
      L.polyline(alternative, { renderer: routeRenderer, color: '#fff', weight: 9, opacity: 0.9, interactive: false }).addTo(alternativeLayers)
      L.polyline(alternative, { renderer: routeRenderer, color: '#8ba4ba', weight: 5, opacity: 1,
        interactive: !!onAlternativeSelect, bubblingMouseEvents: false,
      }).on('click', (event: L.LeafletMouseEvent) => {
        L.DomEvent.stopPropagation(event.originalEvent)
        onAlternativeSelect?.(index)
      }).addTo(alternativeLayers)
    }

    routeOutline = L.polyline(coordinates, { renderer: routeRenderer, color: '#fff', weight: 10, opacity: 0.95, interactive: false }).addTo(mapInstance)
    routeLayer = L.polyline(coordinates, {
      renderer: routeRenderer,
      className: 'benefit-route',
      color: '#0878e8',
      weight: 6,
      opacity: 1,
      interactive: !!onMapClick || !!onAlternativeSelect,
      bubblingMouseEvents: false,
      lineCap: 'round',
      lineJoin: 'round',
    }).on('click', (event: L.LeafletMouseEvent) => {
      L.DomEvent.stopPropagation(event.originalEvent)
      onMapClick?.()
    }).addTo(mapInstance)

  }

  $effect(() => {
    const currentMap = map
    const currentBenefits = benefits
    const currentSelectedBenefitId = selectedBenefitId
    const currentLocation = userLocation

    if (!currentMap) return

    renderBenefits(
      currentMap,
      currentBenefits,
      currentSelectedBenefitId,
    )
    renderUserLocation(currentMap, currentLocation)
    const selectedBenefit = currentBenefits.find((benefit) => benefit.id === currentSelectedBenefitId)
    if (selectedBenefit && !currentMap.getBounds().contains([selectedBenefit.latitude, selectedBenefit.longitude])) {
      currentMap.panTo([selectedBenefit.latitude, selectedBenefit.longitude])
    }
  })

  $effect(() => {
    const currentMap = map
    const coordinates = routeCoordinates
    alternativeRoutes
    const started = navigationActive
    routePadding
    if (!currentMap) return
    untrack(() => { renderRoute(currentMap, coordinates); if (!started) fitRoute() })
  })

  $effect(() => {
    map?.setMaxBounds(constrainToRegion ? southAmericaBounds : L.latLngBounds([-85, -180], [85, 180]))
  })

  $effect(() => {
    const instance = map
    const nextCenter = center
    const nextZoom = initialZoom
    if (!instance) return
    // A viewport reported by Leaflet is an acknowledgement, not a new camera command.
    if (reportedViewport?.zoom === nextZoom && reportedViewport.center.latitude === nextCenter.latitude && reportedViewport.center.longitude === nextCenter.longitude) return
    const current = instance.getCenter()
    const offset = instance.project(current, nextZoom).distanceTo(instance.project([nextCenter.latitude, nextCenter.longitude], nextZoom))
    if (offset > 1 || instance.getZoom() !== nextZoom) {
      instance.setView([nextCenter.latitude, nextCenter.longitude], nextZoom, { animate: false })
    }
  })

  onMount(() => {
    map = L.map(mapElement, {
      zoomControl: false,
      attributionControl: showTiles,
      preferCanvas: true,
      maxBounds: constrainToRegion ? southAmericaBounds : undefined,
      maxBoundsViscosity: 2,
      minZoom: 4,
      maxZoom: 18,
    }).setView([center.latitude, center.longitude], initialZoom)
    map.attributionControl?.setPrefix(false)
    map.on('click', () => onMapClick?.())
    const openOnEnter = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && onMapClick) { event.preventDefault(); onMapClick() }
    }
    mapElement.addEventListener('keydown', openOnEnter)

    const reportViewport = () => {
      if (!map) return
      const current = map.getCenter()
      const zoom = map.getZoom()
      if (reportedViewport?.zoom === zoom && reportedViewport.center.latitude === current.lat && reportedViewport.center.longitude === current.lng) return
      reportedViewport = { center: { latitude: current.lat, longitude: current.lng }, zoom }
      onViewportChange?.(reportedViewport)
    }
    map.on('moveend', reportViewport)
    reportViewport()

    if (showTiles) {
      const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      L.tileLayer(tileUrl, {
        maxZoom: 18,
        noWrap: true,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' +
          (constrainToRegion ? '' : ' · <a href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noopener noreferrer">Corrigir mapa</a>'),
      }).addTo(map)
    }

    const resizeObserver = new ResizeObserver(() => map?.invalidateSize({ pan: false }))
    resizeObserver.observe(mapElement)
    requestAnimationFrame(() => map?.invalidateSize({ pan: false }))

    return () => {
      resizeObserver.disconnect()
      mapElement.removeEventListener('keydown', openOnEnter)
      map?.remove()
      map = undefined
      benefitMarkers = undefined
      markersById.clear()
      locationMarker = undefined
      routeLayer = undefined
      routeOutline = undefined
      alternativeLayers = undefined
      routeRenderer = undefined
    }
  })
</script>

<section class="benefits-map" class:benefits-map--category={variant === 'category'} aria-label="Mapa de benefícios">
  <div class="map-frame">
    <div
      class="map-canvas"
      bind:this={mapElement}
      aria-label={onMapClick ? 'Mapa da rota. Pressione Enter para abrir em tela cheia.' : 'Mapa interativo com benefícios no Brasil.'}
      role="application"
    ></div>
  </div>
</section>
