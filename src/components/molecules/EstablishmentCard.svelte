<script lang="ts">
  import FavoriteButton from '../atoms/FavoriteButton.svelte'

  type Props = {
    name: string
    neighborhood: string
    distanceKm?: number
    discount?: number
    offerLabel?: string
    selected: boolean
    liked: boolean
    variant?: 'category' | 'favorites'
    favoriteDisabled?: boolean
    controlledFavorite?: boolean
    onselect: () => void
    onlikedchange: (liked: boolean) => void
  }

  let {
    name,
    neighborhood,
    distanceKm,
    discount,
    offerLabel,
    selected,
    liked,
    variant = 'category',
    favoriteDisabled = false,
    controlledFavorite = false,
    onselect,
    onlikedchange,
  }: Props = $props()

  const cardClass = $derived(variant === 'favorites' ? 'favorites-card' : 'category-establishment-card')
  const initial = $derived(variant === 'favorites'
    ? name.charAt(0).normalize('NFD').replace(/\p{Diacritic}/gu, '')
    : name.charAt(0))
  const distance = $derived(distanceKm === undefined ? null : variant === 'favorites'
    ? distanceKm.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    : distanceKm.toFixed(1).replace('.', ','))
</script>

<article
  class={`directory-card ${cardClass}`}
  class:selected
  data-selected={variant === 'favorites' ? selected : undefined}
  aria-label={variant === 'favorites' ? name : undefined}
>
  <button
    class={`directory-card__main ${cardClass}__main`}
    type="button"
    aria-pressed={selected}
    onclick={onselect}
  >
    <span class={`directory-card__avatar ${cardClass}__avatar`} aria-hidden="true">{initial}</span>
    <span class={`directory-card__content ${cardClass}__content`}>
      <strong>{name}</strong>
      <span>{neighborhood}{#if distance !== null} · {distance} km{/if}</span>
      <span class={`directory-card__offer ${cardClass}__offer`}>{offerLabel ?? (discount === undefined ? 'Ver benefício' : `${discount}% OFF`)}</span>
    </span>
  </button>
  <FavoriteButton controlled={controlledFavorite} {liked} disabled={favoriteDisabled} {onlikedchange} />
</article>
