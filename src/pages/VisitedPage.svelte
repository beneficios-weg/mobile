<script lang="ts">
  import CategoryPage from './CategoryPage.svelte'

  type Props = { onback?: () => void }
  let { onback }: Props = $props()

</script>

<CategoryPage variant="visited" {onback} />
