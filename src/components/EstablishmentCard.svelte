<script lang="ts">
  import { Heart, MapPin, ChevronRight } from '@lucide/svelte'
  import type { Establishment, Benefit } from '../domain/models'
  let { establishment, benefit, favorite, distance, onopen, onfavorite }: {
    establishment: Establishment; benefit?: Benefit; favorite: boolean; distance?: number
    onopen: () => void; onfavorite: () => void
  } = $props()
</script>

<article class="store-card">
  <button class="store-open" onclick={onopen}>
    <span class="store-symbol"><MapPin size={24} /></span>
    <span class="store-content"><strong>{establishment.name}</strong><span>{establishment.address || 'Parceiro WEG Benefits'}{distance !== undefined ? ` · ${(distance / 1000).toFixed(1)} km` : ''}</span>
      {#if benefit}<span class="benefit-badge">{benefit.title}</span>{/if}
    </span>
    <ChevronRight size={18} />
  </button>
  <button class="favorite-button" aria-label={`${favorite ? 'Remover' : 'Adicionar'} ${establishment.name} ${favorite ? 'dos' : 'aos'} favoritos`} aria-pressed={favorite} onclick={onfavorite}><Heart size={20} fill={favorite ? 'currentColor' : 'none'} /></button>
</article>
