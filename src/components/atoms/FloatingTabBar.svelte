<script lang="ts">
  type TabId = 'home' | 'map' | 'favorites' | 'history'
  type Tab = { id: TabId; label: string }
  type Props = {
    selected?: TabId
    ontabchange?: (tab: TabId) => void
  }

  let { selected = $bindable<TabId>('home'), ontabchange }: Props = $props()

  const tabs: Tab[] = [
    { id: 'home', label: 'Início' },
    { id: 'map', label: 'Mapa' },
    { id: 'favorites', label: 'Favoritos' },
    { id: 'history', label: 'Histórico' },
  ]

  function selectTab(tab: TabId) {
    selected = tab
    ontabchange?.(tab)
  }
</script>

<nav class="floating-tabs" aria-label="Navegação principal">
  {#each tabs as tab (tab.id)}
    <button
      class="tab"
      class:active={selected === tab.id}
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

<style>
  .floating-tabs {
    position: fixed;
    width: 350px;
    height: 64px;
    z-index: 20;
    left: 50%;
    bottom: 20px;
    display: flex;
    align-items: center;
    gap: 4px;
    box-sizing: border-box;
    padding: 7px 8px;
    border: 1px solid rgb(225 232 240 / 85%);
    border-radius: 26px;
    background: #fff;
    box-shadow: 0 8px 28px rgb(22 48 76 / 18%);
    transform: translateX(-50%);
  }

  .tab {
    height: 48px;
    min-width: 0;
    flex: 20 1 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-sizing: border-box;
    overflow: hidden;
    padding: 0;
    border: 0;
    border-radius: 20px;
    background: transparent;
    color: #667991;
    cursor: pointer;
    transition:
      flex-grow 500ms ease,
      padding 500ms ease,
      background-color 250ms ease,
      color 250ms ease;
  }

  .tab.active {
    flex-grow: 38;
    padding: 0 16px;
    background: #e8f3fb;
    color: #00579d;
  }

  .tab svg {
    width: 20px;
    height: 20px;
    flex: 0 0 20px;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .label {
    max-width: 0;
    overflow: hidden;
    opacity: 0;
    white-space: nowrap;
    font: 500 13px/1.2 system-ui, sans-serif;
    transition:
      max-width 500ms ease,
      opacity 220ms ease;
  }

  .active .label {
    max-width: 84px;
    opacity: 1;
    transition-delay: 100ms;
  }

  .tab:focus-visible {
    outline: 3px solid rgb(0 87 157 / 35%);
    outline-offset: 2px;
  }

  @media (max-width: 389px) {
    .floating-tabs {
      bottom: max(0px, calc(13.3333vw - 32px));
      transform: translateX(-50%) scale(clamp(0.5, calc(100vw / 390px), 1));
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .tab,
    .label {
      transition-duration: 0.01ms;
    }
  }
</style>
