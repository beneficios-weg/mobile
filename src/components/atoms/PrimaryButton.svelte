<script lang="ts">
  type Props = {
    label: string
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    variant?: 'primary' | 'secondary'
    onclick?: (event: MouseEvent) => void
  }

  let {
    label,
    type = 'button',
    disabled = false,
    variant = 'primary',
    onclick,
  }: Props = $props()
</script>

<button class="primary-button" class:secondary={variant === 'secondary'} {type} {disabled} {onclick}>
  {label}
</button>
