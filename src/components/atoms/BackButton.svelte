<script lang="ts">
  type Props = {
    label?: string
    disabled?: boolean
    onclick?: (event: MouseEvent) => void
  }

  let { label = 'Voltar', disabled = false, onclick }: Props = $props()
</script>

<button class="back-button" type="button" {disabled} {onclick} aria-label={label}>
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="m15 18-6-6 6-6" />
  </svg>
</button>
