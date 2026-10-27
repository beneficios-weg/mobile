<script lang="ts">
  import logo from '../assets/logo-wegbenefits-azul.svg'
  import Input from '../components/atoms/Input.svelte'
  import PrimaryButton from '../components/atoms/PrimaryButton.svelte'
  import BackButton from '../components/atoms/BackButton.svelte'
  import { navigate, goBack } from '../lib/navigation.svelte'
  import './styles/Login.css'

  let email = $state('')
  let password = $state('')

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    email = ''
    password = ''
    navigate('/')
  }

</script>

<svelte:head>
  <title>Entrar — WEG Benefits</title>
  <meta name="theme-color" content="#F3F7FA" />
</svelte:head>

<main class="login-page">
  <div class="login-page__back"><BackButton onclick={() => goBack('/')} /></div>
  <div class="login-layout">
    <section class="brand-block" aria-labelledby="login-title">
      <img class="brand" src={logo} alt="WEG Benefits" />
      <h1 id="login-title">Entre com seu e-mail corporativo <br>e acesse seus benefícios.</h1>
    </section>

    <section class="form-panel" aria-label="Acesso à conta">
      <form class="login-form" onsubmit={handleSubmit}>
        <div class="field-stack">
          <Input
            id="login-email"
            label="Usuário / E-mail "
            name="email"
            type="email"
            autocomplete="username"
            required
            bind:value={email}
          />
          <Input
            id="login-password"
            label="Senha"
            name="password"
            type="password"
            autocomplete="current-password"
            required
            bind:value={password}
          />
        </div>

        <PrimaryButton type="submit" label="Entrar" />
        <p class="form-notice">Prévia de navegação, sem autenticação real.</p>
      </form>
    </section>

    <p class="access-message">Acesso exclusivo para colaboradores WEG</p>
    <div class="orientation-divider" aria-hidden="true"></div>
  </div>
</main>
