<script lang="ts">
  import FavoriteButton from '../atoms/FavoriteButton.svelte'

  type Props = {
    name: string
    neighborhood: string
    distanceKm: number
    discount: number
    selected: boolean
    liked: boolean
    variant?: 'category' | 'favorites'
    favoriteDisabled?: boolean
    onselect: () => void
    onlikedchange: (liked: boolean) => void
  }

  let {
    name,
    neighborhood,
    distanceKm,
    discount,
    selected,
    liked,
    variant = 'category',
    favoriteDisabled = false,
    onselect,
    onlikedchange,
  }: Props = $props()

  const cardClass = $derived(variant === 'favorites' ? 'favorites-card' : 'category-establishment-card')
  const initial = $derived(variant === 'favorites'
    ? name.charAt(0).normalize('NFD').replace(/\p{Diacritic}/gu, '')
    : name.charAt(0))
  const distance = $derived(variant === 'favorites'
    ? distanceKm.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    : distanceKm.toFixed(1).replace('.', ','))
</script>

<article
  class={cardClass}
  class:selected
  data-selected={variant === 'favorites' ? selected : undefined}
  aria-label={variant === 'favorites' ? name : undefined}
>
  <button
    class={`${cardClass}__main`}
    type="button"
    aria-pressed={selected}
    onclick={onselect}
  >
    <span class={`${cardClass}__avatar`} aria-hidden="true">{initial}</span>
    <span class={`${cardClass}__content`}>
      <strong>{name}</strong>
      <span>{neighborhood} · {distance} km</span>
      <span class={`${cardClass}__offer`}>{discount}% OFF</span>
    </span>
  </button>
  <FavoriteButton {liked} disabled={favoriteDisabled} {onlikedchange} />
</article>
