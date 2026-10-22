<script lang="ts">
  type Props = {
    visible?: boolean
    edge?: 'top' | 'bottom'
  }

  let { visible = false, edge = 'bottom' }: Props = $props()
</script>

<div
  class="scroll-shadow"
  class:visible
  class:top={edge === 'top'}
  class:bottom={edge === 'bottom'}
  aria-hidden="true"
></div>
