<script lang="ts">
  import Input from './components/atoms/Input.svelte'
  import FilterDropdown from './components/molecules/FilterDropdown.svelte'
</script>

<main class="preview">
  <section class="establishments" aria-label="Estabelecimentos da categoria">
    <Input label="Buscar estabelecimentos" placeholder="Buscar estabelecimentos" type="search" />
    <FilterDropdown />
  </section>
</main>

<style>
  .preview {
    min-height: 100vh;
    box-sizing: border-box;
    padding: 24px 16px;
    background: #f8fafc;
  }

  .establishments {
    width: min(100%, 358px);
    margin: 0 auto;
    display: grid;
    gap: 12px;
  }
</style>
