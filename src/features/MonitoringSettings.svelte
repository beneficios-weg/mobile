<script lang="ts">
  import { onMount } from 'svelte'
  import { enableMonitoring, disableMonitoring, type VisitParameters } from '../services/location'
  import { isAndroid, native, storage } from '../services/native'
  import type { Establishment } from '../domain/models'
  let { owner, establishments, onerror }: { owner: string; establishments: Establishment[]; onerror: (message: string) => void } = $props()
  let enabled = $state(false), busy = $state(false), consent = $state(false)
  // Proposed MVP values, editable and explicitly documented; not a claim of field validation.
  let dwell = $state(180), accuracy = $state(30), speed = $state(2), cooldown = $state(3600), radius = $state(150), visitRadius = $state(60)
  onMount(() => { void (async () => {
    if (isAndroid) enabled = (await native.status()).enabled
    const saved = await storage.getItem(`monitoring:${owner}`)
    if (saved) { const config: VisitParameters = JSON.parse(saved); dwell = config.dwellMs / 1000; accuracy = config.maxAccuracy; speed = config.maxSpeed; cooldown = config.cooldownMs / 1000; radius = config.geofenceRadius; visitRadius = config.visitRadius }
  })().catch(error => onerror(error.message)) })
  async function toggle() {
    busy = true
    try {
      if (enabled) { await disableMonitoring(owner); enabled = false }
      else {
        await enableMonitoring(owner, establishments, { dwellMs: dwell * 1000, maxAccuracy: accuracy, maxSpeed: speed, cooldownMs: cooldown * 1000, maxGapMs: 15000, minimumSamples: 6, geofenceRadius: radius, visitRadius })
        enabled = true
      }
    } catch (error) { onerror(error instanceof Error ? error.message : 'Não foi possível alterar o monitoramento.') }
    finally { busy = false }
  }
</script>

<section class="settings-panel">
  <h2>Visitas automáticas</h2>
  <p>O Android pode detectar regiões próximas mesmo sem a interface aberta. Após um evento, a localização é verificada por um período curto, com uma notificação. Somente o resumo da visita é salvo; o trajeto não é armazenado.</p>
  <p class="muted">Eventos podem atrasar. A parada forçada do aplicativo impede o monitoramento até a próxima abertura. Locais sobrepostos ou sinais imprecisos não confirmam visitas.</p>
  {#if isAndroid}
    <details><summary>Critérios iniciais para revisão</summary><div class="settings-grid">
      <label>Permanência (segundos)<input type="number" min="30" max="900" bind:value={dwell} /></label>
      <label>Precisão máxima (metros)<input type="number" min="1" max="100" bind:value={accuracy} /></label>
      <label>Velocidade máxima (m/s)<input type="number" min="0.1" max="10" step="0.1" bind:value={speed} /></label>
      <label>Intervalo entre visitas (segundos)<input type="number" min="0" bind:value={cooldown} /></label>
      <label>Região de aproximação (metros)<input type="number" min="100" max="1000" bind:value={radius} /></label>
      <label>Raio de visita (metros)<input type="number" min="10" max={radius} bind:value={visitRadius} /></label>
    </div><p class="muted">Valores iniciais precisam de validação em campo. Até 100 parceiros próximos são registrados a cada ativação.</p></details>
    {#if !enabled}<label class="consent"><input type="checkbox" bind:checked={consent} />Quero habilitar a verificação de visitas com localização em segundo plano.</label>{/if}
    <button class="primary" disabled={busy || !enabled && !consent} onclick={toggle}>{busy ? 'Aguarde…' : enabled ? 'Desativar monitoramento' : 'Ativar monitoramento'}</button>
    <button class="secondary" onclick={() => native.openSettings().catch(error => onerror(error.message))}>Abrir permissões do aplicativo</button>
  {:else}<p>Este recurso precisa do aplicativo Android instalado. O modo web permite consultar dados e testar a sincronização.</p>{/if}
</section>
