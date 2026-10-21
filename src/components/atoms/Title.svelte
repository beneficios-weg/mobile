<script lang="ts">
  type Props = {
    text: string
    id?: string
  }

  let { text, id }: Props = $props()
</script>

<h1 class="page-title" {id}>{text}</h1>
