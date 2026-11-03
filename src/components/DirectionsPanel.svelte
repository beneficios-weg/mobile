<script lang="ts">
  import { onMount, tick } from 'svelte'
  import PrimaryButton from './atoms/PrimaryButton.svelte'
  import { getCurrentLocation } from '../services/geolocationService'
  import { getRouteOptions } from '../services/routingService'
  import { isPosition, formatRouteDistance, formatRouteDuration, type DrivingRoute, type TravelMode, type DirectionsPlan, travelModes } from '../lib/directions'
  import { useDemoDirectionsLocation, demoDirectionsLocation } from '../lib/directionsLocation'
  import type { MapPlace, MapPosition } from '../lib/mapTypes'
  import './styles/directions-panel.css'

  let { destination, initialPlan, onplanchange, onchange, onfit, onstart, onstop }: {
    destination: MapPlace & { address?: string }
    initialPlan?: DirectionsPlan
    onplanchange?: (plan: DirectionsPlan) => void
    onchange: (route: DrivingRoute | null, origin: MapPosition | null, alternatives: DrivingRoute[]) => void
    onstart: () => void
    onstop: () => void
    onfit: (animate?: boolean) => void
  } = $props()
  let status = $state<'locating' | 'routing' | 'ready' | 'error'>('locating')
  let message = $state('')
  let options = $state.raw<DrivingRoute[]>([])
  let selected = $state(0)
  const route = $derived(options[selected] ?? null)
  let mode = $state<TravelMode>('driving')
  const modeLabel = $derived(travelModes.find(item => item.id === mode)!.description)
  let origin = $state<MapPosition | null>(null)
  let started = $state(false)
  let controller: AbortController | undefined
  let mounted = false

  async function calculate() {
    controller?.abort()
    const request = new AbortController()
    controller = request
    options = []
    selected = 0
    started = false
    onstop()
    message = ''
    status = 'locating'
    onchange(null, null, [])
    try {
      origin = useDemoDirectionsLocation ? { ...demoDirectionsLocation } : await getCurrentLocation()
      if (!mounted || request.signal.aborted) return
      if (!isPosition(origin)) throw new Error('A localização recebida não é válida. Tente novamente.')
      status = 'routing'
      onchange(null, origin, [])
      const result = await getRouteOptions(origin, destination, mode, request.signal)
      if (!mounted || request.signal.aborted) return
      options = result
      status = 'ready'
      onchange(result[0], origin, result.slice(1))
      onplanchange?.({ origin, options: result, selected: 0, mode })
    } catch (error) {
      if (!mounted || request.signal.aborted) return
      status = 'error'
      message = error instanceof Error && error.name === 'TimeoutError'
        ? 'O cálculo da rota demorou para responder. Tente novamente.'
        : error instanceof Error ? error.message : 'Não foi possível calcular a rota. Tente novamente.'
    }
  }

  export async function chooseRoute(index: number) {
    if (!options[index] || started) return
    selected = index
    onchange(options[index], origin, options.filter((_, item) => item !== index))
    if (origin) onplanchange?.({ origin, options, selected: index, mode })
    await tick()
    onfit()
  }

  function changeMode(next: TravelMode) {
    if (mode === next) return
    mode = next
    void calculate()
  }

  async function startRoute() {
    started = true
    await tick()
    onstart()
  }

  async function stopRoute() {
    started = false
    onstop()
    await tick()
    onfit()
  }

  function showRouteOverview(event: MouseEvent) {
    const button = event.currentTarget as HTMLButtonElement
    if (event.detail > 0) button.blur()
    const icon = button.querySelector('svg')
    if (icon && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      icon.getAnimations().forEach(animation => animation.cancel())
      icon.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(0.82)', offset: 0.4 },
        { transform: 'scale(1)' },
      ], { duration: 280, easing: 'ease-out' })
    }
    onfit(true)
  }

  onMount(() => {
    mounted = true
    if (initialPlan?.options.length) {
      options = initialPlan.options
      origin = initialPlan.origin
      mode = initialPlan.mode
      selected = initialPlan.selected
      status = 'ready'
      onchange(options[selected], origin, options.filter((_, item) => item !== selected))
    } else void calculate()
    return () => { mounted = false; controller?.abort() }
  })
</script>

<section class="directions-panel" class:is-started={started} aria-label="Planejar trajeto" aria-busy={status === 'locating' || status === 'routing'}>
  <header class="directions-header">
      <strong>{destination.name}</strong>
      <small>{destination.address ?? destination.category}</small>
  </header>
  {#if !started}
    <div class="directions-panel__modes" role="group" aria-label="Meio de transporte">
      {#each travelModes as item}
        <button type="button" aria-pressed={mode === item.id} onclick={() => changeMode(item.id)}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {#if item.id === 'driving'}
              <path d="m5 7 2-4h10l2 4M3 8h18v10H3V8ZM5 18v3m14-3v3M7 12h.01M17 12h.01M3 8l2-1h14l2 1" />
            {:else if item.id === 'walking'}
              <circle cx="14" cy="4" r="2" /><path d="m7 12 3-4h4l2 5 4 1M12 8l-1 7-4 6m4-6 5 6" />
            {:else}
              <circle cx="5" cy="17" r="4" /><circle cx="19" cy="17" r="4" /><path d="m5 17 5-9 5 9H5Zm5-9h6l3 9M8 5h4m4 0h3l-3 3" />
            {/if}
          </svg>
          <span>{item.label}</span>
        </button>
      {/each}
    </div>
  {/if}
  {#if status === 'locating' || status === 'routing'}
    <div class="directions-panel__status" role="status">
      <span class="directions-panel__spinner" aria-hidden="true"></span>
      <div><strong>{status === 'locating' ? (useDemoDirectionsLocation ? 'Preparando partida ' : 'Obtendo sua localização') : 'Calculando a rota'}</strong>
        <p>{status === 'locating' ? (useDemoDirectionsLocation ? 'Usando uma localização em Joinville.' : 'Permita o acesso à localização para traçar o caminho até o estabelecimento.') : 'Buscando trajetos para o modo escolhido.'}</p></div>
    </div>
  {:else if status === 'error'}
    <div role="alert"><strong>Não foi possível traçar a rota</strong><p>{message}</p></div>
    <PrimaryButton label="Tentar novamente" onclick={() => void calculate()} />
  {:else if route}
    {#if started}
      <div class="directions-panel__guidance" role="status">
        <span class="directions-panel__guidance-icon" aria-hidden="true">↑</span>
        <div><small>Rota iniciada · {modeLabel}</small><strong>{route.steps[0]?.instruction ?? 'Siga o caminho destacado'}</strong></div>
      </div>
      <div class="directions-panel__summary">
        <div><strong class="directions-panel__duration">{formatRouteDuration(route.durationSeconds)}</strong>
          <span class="directions-panel__distance">{formatRouteDistance(route.distanceMeters)}</span></div>
        <button type="button" class="directions-panel__fit" onclick={showRouteOverview} aria-label="Ver rota completa">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m3.5 5.5 5.5-3 6 3 5.5-3v16l-5.5 3-6-3-5.5 3v-16ZM9 2.8v16.4M15 5.5v16" /></svg>
        </button>
      </div>
    {:else}
      <div class="directions-panel__options" class:single-option={options.length === 1} role="group" aria-label="Opções de trajeto">
        {#each options as option, index}
          <button type="button" class="directions-panel__option" class:selected={selected === index} aria-pressed={selected === index} onclick={() => chooseRoute(index)}>
            <span class="directions-panel__option-check" aria-hidden="true">{selected === index ? '●' : '○'}</span>
            <span><strong>{formatRouteDuration(option.durationSeconds)} <small>({formatRouteDistance(option.distanceMeters)})</small></strong>
              <span>{option.via ? `Via ${option.via}` : `Trajeto ${index + 1}`}</span>
              <small>{index === 0 ? 'Recomendado' : `Alternativa ${index}`}</small>
            </span>
          </button>
        {/each}
      </div>
    {/if}
    <div class="directions-panel__actions">
      {#if started}
        <PrimaryButton label="Encerrar rota" onclick={() => void stopRoute()} />
      {:else}
        <PrimaryButton label="Iniciar rota" onclick={() => void startRoute()} />
        <PrimaryButton label="Recalcular" variant="secondary" onclick={() => void calculate()} />
      {/if}
    </div>
  {/if}
</section>
