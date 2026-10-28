<script lang="ts">
  type Props = {
    name: string
    neighborhood: string
    address: string
    openingStatus: string
    openingHours: string
    contact: string
    facadeImageUrl?: string
  }

  let {
    name,
    neighborhood,
    address,
    openingStatus,
    openingHours,
    contact,
    facadeImageUrl = '',
  }: Props = $props()

  let facadeDialog = $state<HTMLDialogElement>()
  const phone = $derived(/^[+()\d\s.-]{8,}$/.test(contact) ? contact.replace(/[^+\d]/g, '') : '')
</script>

<article class="establishment-facade-card">
  <div class="establishment-facade-card__details">
    <h3 class="establishment-facade-card__name">{name}</h3>
    <p class="establishment-facade-card__address">{neighborhood} · {address}</p>
    {#if openingStatus || openingHours}<p class="establishment-facade-card__hours">{openingStatus} · {openingHours}</p>{/if}
    {#if phone}
      <a class="establishment-facade-card__contact" href={`tel:${phone}`}>
        <span>Contato</span>
        <span>{contact}</span>
      </a>
    {:else}
      <div class="establishment-facade-card__contact"><span>Contato</span><span>{contact || 'Não informado'}</span></div>
    {/if}
  </div>

  <button
    class="establishment-facade-card__action"
    type="button"
    aria-label={`Ver fachada de ${name}`}
    disabled={!facadeImageUrl}
    onclick={() => facadeDialog?.showModal()}
  >
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m20.5 15-5-5L5 20.5" />
    </svg>
    <span>Ver fachada</span>
  </button>

  {#if facadeImageUrl}
    <dialog
      class="establishment-facade-card__dialog"
      aria-label={`Fachada de ${name}`}
      bind:this={facadeDialog}
    >
      <div class="establishment-facade-card__dialog-header">
        <h2>{name}</h2>
        <button
          class="establishment-facade-card__close"
          type="button"
          aria-label="Fechar imagem da fachada"
          onclick={() => facadeDialog?.close()}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
      <img src={facadeImageUrl} alt={`Fachada de ${name}`} />
    </dialog>
  {/if}
</article>
