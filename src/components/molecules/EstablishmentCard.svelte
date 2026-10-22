<script lang="ts">
  import FavoriteButton from '../atoms/FavoriteButton.svelte'

  type Props = {
    name: string
    neighborhood: string
    distanceKm: number
    discount: number
    selected: boolean
    liked: boolean
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
    onselect,
    onlikedchange,
  }: Props = $props()
</script>

<article class="category-establishment-card" class:selected>
  <button
    class="category-establishment-card__main"
    type="button"
    aria-pressed={selected}
    onclick={onselect}
  >
    <span class="category-establishment-card__avatar" aria-hidden="true">{name.charAt(0)}</span>
    <span class="category-establishment-card__content">
      <strong>{name}</strong>
      <span>{neighborhood} · {distanceKm.toFixed(1).replace('.', ',')} km</span>
      <span class="category-establishment-card__offer">{discount}% OFF</span>
    </span>
  </button>
  <FavoriteButton {liked} {onlikedchange} />
</article>
