<script lang="ts">
  import { Header, Meta, Footer } from '$lib';
  import '../app.css';

  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
</script>

<Meta />

<div class="flex min-h-screen flex-col px-4 md:container">
  <Header />
  {@render children?.()}
  <Footer />
</div>
