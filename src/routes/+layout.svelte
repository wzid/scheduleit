<script>
  import Header from '$lib/Header.svelte';

  import '../app.css';
</script>

<div class="flex justify-center py-12">
  <div class="flex flex-col items-center">
    <Header />
    <slot />
  </div>
</div>
