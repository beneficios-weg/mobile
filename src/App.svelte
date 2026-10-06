<script lang="ts">
  import { onMount } from 'svelte'
  import { App as CapacitorApp } from '@capacitor/app'
  import { Share } from '@capacitor/share'
  import { Home, Heart, MapPin, History, Search, ArrowLeft, Settings, RefreshCw, LogOut, Share2, Navigation, Expand, WifiOff } from '@lucide/svelte'
  import AuthScreen from './features/AuthScreen.svelte'
  import MonitoringSettings from './features/MonitoringSettings.svelte'
  import MapView from './components/MapView.svelte'
  import EstablishmentCard from './components/EstablishmentCard.svelte'
  import { api, authCallback } from './services/api'
  import { data, syncing, openRepository, closeRepository, synchronize, toggleFavorite, importNativeVisits } from './services/repository'
  import { isAndroid, position, sessionStorageAdapter } from './services/native'
  import { disableMonitoring } from './services/location'
  import { distanceMeters, type Establishment } from './domain/models'
  import type { User } from '@supabase/supabase-js'
  import type { PluginListenerHandle } from '@capacitor/core'

  type Page = 'home' | 'category' | 'favorites' | 'map' | 'visits' | 'store' | 'settings'
  let page = $state<Page>('home'), previousPage = $state<Page>('home')
  let user = $state<User | null>(null), initializing = $state(true), recovery = $state(false)
  let online = $state(navigator.onLine), query = $state(''), categoryId = $state<string | null>(null)
  let selected = $state<Establishment | null>(null), current = $state<{ latitude: number; longitude: number } | null>(null)
  let message = $state(''), errorMessage = $state(''), locating = $state(false), order = $state('name')
  let loadedOwner: string | null = null
  let accountGeneration = 0
  const report = (error: unknown) => { errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Não foi possível concluir a operação.' }
  const stores = $derived($data.establishments.filter(item =>
    (!categoryId || item.category_id === categoryId) &&
    (page !== 'favorites' || $data.favorites[item.id]?.isFavorite) &&
    `${item.name} ${item.description} ${item.address} ${$data.benefits.find(benefit => benefit.establishment_id === item.id)?.title ?? ''}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))
  ).sort((a, b) => order === 'distance' && current ? distanceMeters(current, a) - distanceMeters(current, b) : a.name.localeCompare(b.name, 'pt-BR')))
  const selectedBenefit = $derived($data.benefits.find(item => item.establishment_id === selected?.id))
  const pendingCount = $derived($data.queue.length + $data.visits.filter(item => !item.synced).length)
  const blockedCount = $derived($data.queue.filter(item => item.blocked).length + $data.visits.filter(item => item.blocked).length)
  const heading = $derived(page === 'favorites' ? 'Seus favoritos' : page === 'visits' ? 'Lojas visitadas' : page === 'category' ? $data.categories.find(item => item.id === categoryId)?.name ?? 'Categoria' : page === 'settings' ? 'Sua conta' : page === 'store' ? selected?.name ?? 'Estabelecimento' : page === 'map' ? 'Explore o mapa' : 'Benefícios por perto')

  async function loadAccount(nextUser: User | null) {
    if (nextUser?.id === loadedOwner) { user = nextUser; return }
    const generation = ++accountGeneration
    if (loadedOwner) {
      await disableMonitoring(loadedOwner).catch(report)
      await closeRepository()
    }
    loadedOwner = nextUser?.id ?? null; user = nextUser
    if (nextUser) {
      api?.auth.startAutoRefresh()
      await openRepository(nextUser.id)
      if (generation !== accountGeneration) return
      page = 'home'; query = ''; categoryId = null; selected = null
      if (navigator.onLine) await synchronize().catch(report)
    }
  }
  async function refresh(force = false) {
    if (!user) return
    errorMessage = ''
    try { await importNativeVisits(); await synchronize(force); message = 'Dados atualizados.' }
    catch (error) { report(error) }
  }
  async function locate() {
    locating = true; errorMessage = ''
    try { current = await position(); order = 'distance' }
    catch (error) { report(error) }
    finally { locating = false }
  }
  async function favorite(id: string) {
    try { await toggleFavorite(id); message = online ? 'Favorito salvo. Sincronizando…' : 'Alteração salva neste aparelho para sincronizar depois.'; if (online) await synchronize().catch(report) }
    catch (error) { report(error) }
  }
  function navigate(next: Page) { previousPage = page; page = next; categoryId = null; query = ''; selected = null; window.scrollTo(0, 0) }
  function openStore(store: Establishment) { previousPage = page; selected = store; page = 'store'; window.scrollTo(0, 0) }
  async function shareStore() {
    if (!selected) return
    try { await Share.share({ title: selected.name, text: `${selected.name}\n${selectedBenefit?.title ?? ''}\n${selected.address}`, dialogTitle: 'Compartilhar benefício' }) }
    catch (error) { report(error) }
  }
  async function logout() {
    if (pendingCount && !window.confirm('Existem alterações pendentes. Sair remove os dados e a fila deste aparelho. Deseja continuar?')) return
    try {
      if (loadedOwner) await disableMonitoring(loadedOwner).catch(report)
      api!.auth.stopAutoRefresh()
      await api!.auth.signOut({ scope: 'local' })
      await sessionStorageAdapter.removeItem('weg-benefits-auth')
      await sessionStorageAdapter.removeItem('weg-benefits-auth-code-verifier')
      await loadAccount(null); message = ''; errorMessage = ''
    } catch (error) { report(error) }
  }
  onMount(() => {
    let disposed = false
    const listeners: PluginListenerHandle[] = []
    const subscription = api?.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') recovery = true
      // Supabase auth callbacks must not await another auth request.
      setTimeout(() => { if (!disposed) void loadAccount(session?.user ?? null).catch(report) }, 0)
    }).data.subscription
    void (async () => {
      if (api) {
        await authCallback(location.href)
        if (new URL(location.href).searchParams.has('code')) history.replaceState(null, '', '/')
        const { data: auth, error } = await api.auth.getSession()
        if (error) throw error
        await loadAccount(auth.session?.user ?? null)
      }
    })().catch(report).finally(() => { initializing = false })
    const connectivity = () => { online = navigator.onLine; if (online && user) void synchronize().catch(report) }
    const visibility = () => { if (!document.hidden && user) void refresh() }
    window.addEventListener('online', connectivity); window.addEventListener('offline', connectivity)
    document.addEventListener('visibilitychange', visibility)
    if (isAndroid) {
      void CapacitorApp.addListener('appStateChange', event => { if (event.isActive && user) void refresh() }).then(listener => { if (disposed) void listener.remove(); else listeners.push(listener) })
      void CapacitorApp.addListener('appUrlOpen', event => { void authCallback(event.url).catch(report) }).then(listener => { if (disposed) void listener.remove(); else listeners.push(listener) })
      void CapacitorApp.getLaunchUrl().then(url => { if (url) return authCallback(url.url) }).catch(report)
    }
    const timer = window.setInterval(() => { if (user && navigator.onLine && !document.hidden) void synchronize().catch(() => {}) }, 30000)
    return () => { disposed = true; subscription?.unsubscribe(); listeners.forEach(listener => void listener.remove()); clearInterval(timer); window.removeEventListener('online', connectivity); window.removeEventListener('offline', connectivity); document.removeEventListener('visibilitychange', visibility) }
  })
</script>

{#if initializing}<main class="loading-page" aria-busy="true"><span class="brand-mark">W</span><p>Preparando seus benefícios…</p></main>
{:else if !user || recovery}
  <AuthScreen {recovery} onupdated={() => recovery = false} />
  {#if errorMessage}<p class="global-error" role="alert">{errorMessage}</p>{/if}
{:else}
  <div class="app-shell">
    <header class="app-header">
      <button class="brand" onclick={() => navigate('home')} aria-label="WEG Benefits, início"><span class="brand-mark">W</span><strong>WEG <span>Benefits</span></strong></button>
      <div class="header-actions"><button class="icon-button" aria-label="Atualizar dados" disabled={$syncing} onclick={() => refresh(true)}><RefreshCw size={20} class={$syncing ? 'spin' : ''} /></button><button class="icon-button" aria-label="Sua conta e permissões" onclick={() => navigate('settings')}><Settings size={20} /></button></div>
    </header>
    {#if !online}<div class="offline-banner"><WifiOff size={16} />Você está offline. Exibindo dados salvos neste aparelho.</div>{/if}
    <main class:full-map={page === 'map'}>
      <div class="page-heading">
        {#if page === 'store' || page === 'category' || page === 'map' || page === 'settings'}<button class="icon-button" aria-label="Voltar" onclick={() => { page = previousPage === 'store' ? 'home' : previousPage; selected = null }}><ArrowLeft size={22} /></button>{/if}
        <div><p class="eyebrow">{page === 'home' ? 'Explore suas vantagens' : 'WEG Benefits'}</p><h1>{heading}</h1></div>
      </div>
      {#if errorMessage}<div class="notice error" role="alert">{errorMessage}<button onclick={() => errorMessage = ''} aria-label="Dispensar erro">×</button></div>{/if}
      {#if message}<div class="notice" role="status">{message}<button onclick={() => message = ''} aria-label="Dispensar mensagem">×</button></div>{/if}
      {#if pendingCount}<p class="queue-status">{pendingCount} alteração(ões) aguardando sincronização{blockedCount ? ` · ${blockedCount} precisa(m) de revisão` : ''}. <button onclick={() => refresh(true)}>Tentar novamente</button></p>{/if}

      {#if page === 'settings'}
        <section class="account-panel"><p class="muted">Conectado como</p><strong>{user.email}</strong><p>Dados pessoais e alterações locais são removidos ao sair. A primeira entrada exige conexão com a internet.</p><button class="secondary" onclick={logout}><LogOut size={18} />Sair da conta</button></section>
        <MonitoringSettings owner={user.id} establishments={$data.establishments} onerror={report} />
      {:else if page === 'store' && selected}
        <section class="detail-hero"><MapPin size={38} /><h2>{selected.name}</h2><p>{selected.address}</p><p>{selected.description}</p></section>
        {#if selectedBenefit}<section class="benefit-detail"><p class="eyebrow">Sua vantagem</p><h2>{selectedBenefit.title}</h2><p>{selectedBenefit.description}</p>{#if selectedBenefit.terms}<h3>Condições</h3><p>{selectedBenefit.terms}</p>{/if}{#if selectedBenefit.valid_until}<p class="muted">Válido até {new Date(selectedBenefit.valid_until).toLocaleDateString('pt-BR')}</p>{/if}</section>{:else}<p class="empty-state">Nenhum benefício ativo disponível para este parceiro.</p>{/if}
        <div class="detail-actions"><button class="primary" onclick={() => selected && favorite(selected.id)}><Heart size={18} fill={$data.favorites[selected.id]?.isFavorite ? 'currentColor' : 'none'} />{$data.favorites[selected.id]?.isFavorite ? 'Remover dos favoritos' : 'Favoritar'}</button><button class="secondary" onclick={shareStore}><Share2 size={18} />Compartilhar</button></div>
      {:else if page === 'visits'}
        {#if !$data.visits.length}<div class="empty-state"><History size={32} /><h2>Seu histórico começa aqui</h2><p>As visitas detectadas aparecerão nesta lista. Ative a verificação em Sua conta.</p><button class="secondary" onclick={() => navigate('settings')}>Configurar visitas</button></div>{/if}
        <div class="visit-list">{#each [...$data.visits].sort((a, b) => b.detectedAt - a.detectedAt) as visit (visit.id)}{@const store = $data.establishments.find(item => item.id === visit.establishmentId)}<article class="visit-card"><span class="store-symbol"><History size={23} /></span><div><button class="text-link" onclick={() => store && openStore(store)} disabled={!store}>{store?.name ?? 'Estabelecimento indisponível'}</button><p>{new Date(visit.detectedAt).toLocaleString('pt-BR')}</p><span class="status-badge">{visit.synced ? 'Sincronizada' : visit.blocked ? 'Envio rejeitado — revisar' : 'Detectada no aparelho · pendente'}</span>{#if visit.error}<p class="error-text">{visit.error}</p>{/if}</div></article>{/each}</div>
      {:else}
        <div class="search-row"><label class="search-field"><Search size={18} /><input bind:value={query} placeholder="Busque um parceiro ou benefício" aria-label="Buscar estabelecimentos" /></label><button class="icon-button locate" disabled={locating} aria-label="Usar minha localização" onclick={locate}><Navigation size={19} /></button></div>
        {#if page === 'home' || page === 'category' || page === 'map'}<div class:expanded={page === 'map'} class="map-container"><MapView establishments={stores} {current} {online} onselect={openStore} />{#if page !== 'map'}<button class="map-expand" aria-label="Expandir mapa" onclick={() => { previousPage = page; page = 'map' }}><Expand size={18} /></button>{/if}</div>{/if}
        {#if page === 'home'}<section class="category-section"><div class="section-heading"><h2>Encontre por categoria</h2></div><div class="category-grid">{#each $data.categories as category}<button class="category-card" onclick={() => { categoryId = category.id; previousPage = page; page = 'category' }}><span><MapPin size={20} /></span>{category.name}</button>{/each}</div></section>{/if}
        <section class="stores-section"><div class="section-heading"><h2>{page === 'favorites' ? 'Parceiros favoritos' : 'Parceiros para você'} <small>{stores.length}</small></h2><label class="sort-label">Ordenar<select bind:value={order} aria-label="Ordenar estabelecimentos"><option value="name">Nome</option><option value="distance" disabled={!current}>Distância</option></select></label></div>
          {#if $syncing && !stores.length}<p class="empty-state" aria-busy="true">Buscando seus benefícios…</p>{:else if !stores.length}<div class="empty-state"><MapPin size={30} /><h3>{query ? 'Nenhum resultado para sua busca' : page === 'favorites' ? 'Você ainda não salvou favoritos' : 'Nenhum parceiro disponível'}</h3><p>{online ? 'Atualize os dados ou escolha outra categoria.' : 'Não há dados salvos para esta consulta. Conecte-se para atualizar.'}</p>{#if online}<button class="secondary" onclick={() => refresh(true)}>Atualizar</button>{/if}</div>{/if}
          <div class="store-list">{#each stores as establishment (establishment.id)}<EstablishmentCard {establishment} benefit={$data.benefits.find(item => item.establishment_id === establishment.id)} favorite={!!$data.favorites[establishment.id]?.isFavorite} distance={current ? distanceMeters(current, establishment) : undefined} onopen={() => openStore(establishment)} onfavorite={() => favorite(establishment.id)} />{/each}</div>
        </section>
      {/if}
      <p class="last-sync">{$data.lastSyncAt ? `Última atualização: ${new Date($data.lastSyncAt).toLocaleString('pt-BR')}` : 'Ainda não há dados sincronizados.'}</p>
    </main>
    <nav class="tab-bar" aria-label="Navegação principal"><button class:active={page === 'home' || page === 'category'} onclick={() => navigate('home')} aria-current={page === 'home' ? 'page' : undefined}><Home size={21} /><span>Início</span></button><button class:active={page === 'favorites'} onclick={() => navigate('favorites')} aria-current={page === 'favorites' ? 'page' : undefined}><Heart size={21} /><span>Favoritos</span></button><button class:active={page === 'map'} onclick={() => navigate('map')} aria-current={page === 'map' ? 'page' : undefined}><MapPin size={21} /><span>Mapa</span></button><button class:active={page === 'visits'} onclick={() => navigate('visits')} aria-current={page === 'visits' ? 'page' : undefined}><History size={21} /><span>Visitas</span></button></nav>
  </div>
{/if}
