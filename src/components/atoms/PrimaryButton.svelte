<script lang="ts">
  type Props = {
    label: string
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    onclick?: (event: MouseEvent) => void
  }

  let {
    label,
    type = 'button',
    disabled = false,
    onclick,
  }: Props = $props()
</script>

<button class="primary-button" {type} {disabled} {onclick}>
  {label}
</button>
