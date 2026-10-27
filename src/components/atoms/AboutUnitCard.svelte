<script lang="ts">
  type Props = {
    title: string
    description: string
  }

  let { title, description }: Props = $props()
</script>

<article class="about-unit-card">
  <h3 class="about-unit-card__title">{title}</h3>
  <p class="about-unit-card__description">{description}</p>
</article>
