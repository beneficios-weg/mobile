<script lang="ts">
  type Props = {
    text: string
    id?: string
  }

  let { text, id }: Props = $props()
</script>

<h1 {id}>{text}</h1>

<style>
  h1 {
    margin: 0;
    color: #112033;
    font: 700 18px/22px Inter, system-ui, -apple-system, 'Segoe UI', sans-serif;
    letter-spacing: 0;
  }
</style>
