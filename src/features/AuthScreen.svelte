<script lang="ts">
  import { api, redirectUrl } from '../services/api'
  import { ArrowRight, ShieldCheck } from '@lucide/svelte'
  let { recovery = false, onupdated = () => {} }: { recovery?: boolean; onupdated?: () => void } = $props()
  let mode = $state<'login' | 'register' | 'recover'>('login')
  let email = $state(''), password = $state(''), busy = $state(false), message = $state(''), failed = $state(false)
  async function submit(event: SubmitEvent) {
    event.preventDefault(); message = ''; failed = false
    if (!api) { failed = true; message = 'O serviço de acesso ainda não está disponível.'; return }
    busy = true
    try {
      if (recovery) {
        const { error } = await api.auth.updateUser({ password }); if (error) throw error
        message = 'Senha atualizada.'; onupdated()
      } else if (mode === 'login') {
        const { error } = await api.auth.signInWithPassword({ email, password }); if (error) throw error
      } else if (mode === 'register') {
        const { data, error } = await api.auth.signUp({ email, password, options: { emailRedirectTo: redirectUrl() } }); if (error) throw error
        if (!data.session) message = 'Confira seu e-mail para confirmar o acesso.'
      } else {
        const { error } = await api.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl() }); if (error) throw error
        message = 'Se houver uma conta para esse e-mail, você receberá as instruções de recuperação.'
      }
    } catch (error) { failed = true; message = error instanceof Error ? error.message : 'Não foi possível concluir. Tente novamente.' }
    finally { busy = false }
  }
</script>

<main class="auth-page">
  <div class="auth-brand"><span class="brand-mark">W</span><strong>WEG <span>Benefits</span></strong></div>
  <section class="auth-panel">
    <p class="eyebrow">Benefícios para você</p>
    <h1>{recovery ? 'Crie uma nova senha' : mode === 'register' ? 'Seu primeiro acesso' : mode === 'recover' ? 'Recupere seu acesso' : 'Mais benefícios, mais perto.'}</h1>
    <p class="muted">{mode === 'login' && !recovery ? 'Descubra os parceiros e vantagens ao seu redor.' : 'Use o e-mail associado à sua conta.'}</p>
    <form onsubmit={submit}>
      {#if !recovery}<label>E-mail<input type="email" bind:value={email} autocomplete="email" required /></label>{/if}
      {#if mode !== 'recover' || recovery}<label>Senha<input type="password" bind:value={password} minlength="8" autocomplete={mode === 'login' && !recovery ? 'current-password' : 'new-password'} required /></label>{/if}
      <button class="primary" type="submit" disabled={busy || !api}>{busy ? 'Aguarde…' : recovery ? 'Salvar senha' : mode === 'register' ? 'Criar conta' : mode === 'recover' ? 'Enviar instruções' : 'Entrar'}<ArrowRight size={18} /></button>
    </form>
    {#if message}<p class:error-text={failed} role={failed ? 'alert' : 'status'}>{message}</p>{/if}
    {#if !api}<p role="status">O serviço de acesso ainda não está disponível.</p>{/if}
    {#if !recovery}<div class="auth-links">
      <button onclick={() => { mode = mode === 'recover' ? 'login' : 'recover'; message = '' }}>{mode === 'recover' ? 'Voltar para entrar' : 'Esqueci minha senha'}</button>
      <button onclick={() => { mode = mode === 'register' ? 'login' : 'register'; message = '' }}>{mode === 'register' ? 'Já tenho uma conta' : 'Primeiro acesso'}</button>
    </div>{/if}
    <p class="privacy-note"><ShieldCheck size={17} />A localização será solicitada somente quando você decidir usá-la.</p>
  </section>
</main>
