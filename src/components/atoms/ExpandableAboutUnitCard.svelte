<script lang="ts">
  import { aboutUnitExpansion } from '../../lib/aboutUnitExpansion'

  type Props = {
    title: string
    description: string
    expanded?: boolean
    onclick?: () => void
  }

  let { title, description, expanded = false, onclick }: Props = $props()
  const id = $props.id()
</script>

<div class="expandable-about-unit-card__slot" use:aboutUnitExpansion={expanded}>
  <article class="expandable-about-unit-card" class:expanded>
    <h3 class="expandable-about-unit-card__title">{title}</h3>
    <div class="expandable-about-unit-card__viewport" id={`${id}-description`}>
      <p class="expandable-about-unit-card__description">{description}</p>
    </div>
    <button
      class="expandable-about-unit-card__toggle"
      type="button"
      aria-label={`${expanded ? 'Recolher' : 'Expandir'} ${title}`}
      aria-expanded={expanded}
      aria-controls={`${id}-description`}
      onclick={() => onclick?.()}
    ></button>
  </article>
</div>
