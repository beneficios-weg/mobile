<script module lang="ts">
  type TabId = 'home' | 'map' | 'favorites' | 'history'
  let lastSelection: TabId = 'home'
  let pendingSelection: { from: TabId; to: TabId } | null = null
</script>

<script lang="ts">
  import { onMount, untrack } from 'svelte'
  type Tab = { id: TabId; label: string }
  type Props = {
    selected?: TabId
    ontabchange?: (tab: TabId) => void
  }

  let { selected = $bindable<TabId>('home'), ontabchange }: Props = $props()
  let element: HTMLElement
  let ready = $state(false)
  let visualSelection = $state<TabId>(untrack(() => {
    if (pendingSelection?.to === selected) {
      const previous = pendingSelection.from
      pendingSelection = null
      return previous
    }
    return lastSelection
  }))

  onMount(() => {
    // Establish the previous tab's layout before transitioning on a new page.
    element.getBoundingClientRect()
    const frame = requestAnimationFrame(() => { ready = true })
    return () => cancelAnimationFrame(frame)
  })

  $effect(() => {
    const target = selected
    if (!ready) return
    visualSelection = target
    lastSelection = target
  })

  const tabs: Tab[] = [
    { id: 'home', label: 'Início' },
    { id: 'map', label: 'Mapa' },
    { id: 'favorites', label: 'Favoritos' },
    { id: 'history', label: 'Histórico' },
  ]

  function selectTab(tab: TabId) {
    pendingSelection = { from: visualSelection, to: tab }
    selected = tab
    ontabchange?.(tab)
  }
</script>

<nav class="floating-tabs" bind:this={element} aria-label="Navegação principal">
  {#each tabs as tab (tab.id)}
    <button
      class="tab"
      class:active={visualSelection === tab.id}
      type="button"
      aria-label={tab.label}
      aria-pressed={selected === tab.id}
      onclick={() => selectTab(tab.id)}
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        {#if tab.id === 'home'}
          <path d="m3.5 10 8.5-7 8.5 7v10.5h-6v-7h-5v7h-6V10Z" />
        {:else if tab.id === 'map'}
          <path d="m3.5 5.5 5.5-3 6 3 5.5-3v16l-5.5 3-6-3-5.5 3v-16Z" />
          <path d="M9 2.8v16.4M15 5.5v16" />
        {:else if tab.id === 'favorites'}
          <path d="M20.8 8.8c0 4.3-8.8 10.1-8.8 10.1S3.2 13.1 3.2 8.8a4.6 4.6 0 0 1 8.8-1.7 4.6 4.6 0 0 1 8.8 1.7Z" />
        {:else}
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3.2 2" />
        {/if}
      </svg>
      <span class="label">{tab.label}</span>
    </button>
  {/each}
</nav>
