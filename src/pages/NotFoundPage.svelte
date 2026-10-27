<script lang="ts">
  import BackButton from '../components/atoms/BackButton.svelte'
  import PrimaryButton from '../components/atoms/PrimaryButton.svelte'
  import { goBack, navigate } from '../lib/navigation.svelte'
</script>

<svelte:head><title>Página não encontrada — WEG Benefits</title></svelte:head>
<main class="not-found-page">
  <BackButton onclick={() => goBack('/')} />
  <h1>Página não encontrada</h1>
  <p>Este endereço não está disponível. Volte ao início para continuar.</p>
  <PrimaryButton label="Ir para o início" onclick={() => navigate('/')} />
</main>

<style>
  .not-found-page { box-sizing: border-box; min-height: 100dvh; width: min(100%, 600px); margin: 0 auto; padding: 40px 24px; display: flex; flex-direction: column; gap: 24px; background: #f2f7fb; color: #14243a; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro', 'Segoe UI', sans-serif; }
  h1 { margin: 0; font: inherit; font-size: 24px; font-weight: 600; color: inherit; letter-spacing: 0; }
  p { margin: 0; font-size: 16px; }
</style>
