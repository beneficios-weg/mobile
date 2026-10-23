<script lang="ts">
  type Props = {
    title: string
    description: string
    expanded?: boolean
    onclick?: () => void
  }

  let { title, description, expanded = false, onclick }: Props = $props()
</script>

<article class="expandable-about-unit-card" class:expanded>
  <h3 class="expandable-about-unit-card__title">{title}</h3>
  <p class="expandable-about-unit-card__description">{description}</p>
  <button
    class="expandable-about-unit-card__toggle"
    type="button"
    aria-label={`${expanded ? 'Recolher' : 'Expandir'} ${title}`}
    aria-expanded={expanded}
    onclick={() => onclick?.()}
  ></button>
</article>
