<script lang="ts">
  type Props = {
    count: number
  }

  let { count }: Props = $props()

  const label = $derived(`${count} ${count === 1 ? 'opção' : 'opções'}`)
</script>

<p class="results-count" aria-live="polite" aria-atomic="true">{label}</p>
