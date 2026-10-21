<script lang="ts">
  import logo from '../assets/logo-wegbenefits-azul.svg'
  import Input from '../components/atoms/Input.svelte'
  import PrimaryButton from '../components/atoms/PrimaryButton.svelte'

  let email = $state('')
  let password = $state('')
  let notice = $state('')

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    notice = 'A autenticação ainda não está conectada ao aplicativo.'
  }

</script>

<svelte:head>
  <title>Entrar — WEG Benefits</title>
  <meta name="theme-color" content="#F3F7FA" />
</svelte:head>

<main class="login-page">
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
        {#if notice}
          <p class="form-notice" aria-live="polite">{notice}</p>
        {/if}
      </form>
    </section>

    <p class="access-message">Acesso exclusivo para colaboradores WEG</p>
    <div class="orientation-divider" aria-hidden="true"></div>
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    background: #f3f7fa;
  }

  :global(#app) {
    width: 100%;
    max-width: none;
    min-height: 100svh;
    margin: 0;
    border: 0;
    text-align: initial;
  }

  .login-page {
    min-height: 100svh;
    overflow: auto;
    background: #f3f7fa;
    color: #66768a;
    font-family: Inter, system-ui, -apple-system, 'Segoe UI', sans-serif;
  }

  .login-layout {
    position: relative;
    display: flex;
    min-height: 100svh;
    box-sizing: border-box;
    flex-direction: column;
    align-items: center;
    padding: 12.8svh 24px 96px;
  }

  .brand-block {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .brand {
    display: block;
    width: min(268px, calc(100vw - 48px));
    height: auto;
  }

  h1 {
    margin: 40px 0 0;
    color: #66768A;
    font: 400 14px/20px Inter, system-ui, -apple-system, 'Segoe UI', sans-serif;
    letter-spacing: 0;
    white-space: nowrap;
    text-align: center;
  }

  .form-panel {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .login-form {
    width: min(342px, 100%);
    display: flex;
    flex-direction: column;
    margin-top: 80px;
  }

  .field-stack {
    display: grid;
    gap: 12px;
  }

  .field-stack :global(.input-field) {
    min-height: 56px;
    border-color: #d8e2ec;
    border-radius: 18px;
    box-shadow: 0 4px 14px rgb(0 110 250 / 10%);
  }

  .field-stack :global(input) {
    color: #1b2938;
    font-family: Inter, system-ui, -apple-system, 'Segoe UI', sans-serif;
    font-size: 14px;
  }

  .login-form :global(button) {
    margin-top: 20px;
    font-family: Inter, system-ui, -apple-system, 'Segoe UI', sans-serif;
  }

  .form-notice {
    min-height: 18px;
    margin-top: 10px;
    color: #66768a;
    font-size: 12px;
    line-height: 18px;
    text-align: center;
  }

  .access-message {
    position: absolute;
    right: 16px;
    bottom: 8.2svh;
    left: 16px;
    margin: 0;
    color: #66768a;
    font-size: 14px;
    line-height: 18px;
    text-align: center;
  }

  .orientation-divider {
    display: none;
  }

  @media (min-width: 700px) and (orientation: portrait) {
    .login-layout {
      padding-top: 16.5svh;
    }

    h1 {
      margin-top: 40px;
    }

    .login-form {
      width: min(480px, 100%);
      margin-top: 156px;
    }

    .field-stack {
      gap: 16px;
    }

    .field-stack :global(.input-field) {
      min-height: 64px;
    }

    .login-form :global(button) {
      min-height: 60px;
      margin-top: 26px;
    }

    .access-message {
      bottom: 170px;
    }
  }

  @media (orientation: landscape) and (min-width: 560px) {
    .login-layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      align-items: stretch;
      padding: 0;
    }

    .brand-block {
      grid-column: 1;
      grid-row: 1;
      align-items: center;
      padding-top: 60px;
    }

    h1 {
      margin-top: 40px;
    }

    .form-panel {
      grid-column: 2;
      grid-row: 1;
      align-items: center;
      padding: 0 clamp(32px, 4.9vw, 58px);
      box-sizing: border-box;
    }

    .login-form {
      width: 100%;
      margin: 0;
    }

    .access-message {
      right: auto;
      bottom: 16svh;
      left: 0;
      width: 50%;
    }

    .orientation-divider {
      position: absolute;
      top: 8.2svh;
      bottom: 8.2svh;
      left: 50%;
      display: block;
      width: 1.5px;
      border-radius: 1px;
      background: #d8e2ec;
      transform: translateX(-50%);
      pointer-events: none;
    }
  }

  @media (min-width: 850px) and (min-height: 500px) and (orientation: landscape) {
    .brand-block {
      padding-top: 180px;
    }

    h1 {
      margin-top: 64px;
    }

    .field-stack {
      gap: 16px;
    }

    .field-stack :global(.input-field) {
      min-height: 64px;
    }

    .login-form :global(button) {
      min-height: 60px;
      margin-top: 26px;
    }

    .access-message {
      bottom: 22svh;
    }

    .orientation-divider {
      top: 7.7svh;
      bottom: 7.7svh;
    }
  }

  @media (max-height: 450px) and (orientation: landscape) {
    .brand-block {
      padding-top: 16.9svh;
    }

    h1 {
      margin-top: 40px;
    }

    .form-panel {
      padding-inline: 32px;
    }
  }

  @media (max-height: 760px) and (orientation: portrait) {
    .login-layout {
      padding-top: 10svh;
    }

    .login-form {
      margin-top: clamp(40px, 9svh, 68px);
    }

    .access-message {
      bottom: 24px;
    }
  }
</style>
