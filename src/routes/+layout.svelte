<script lang="ts">
  import { Header, Meta, Footer } from '$lib';
  import '../app.css';

  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
</script>

<Meta />

<div class="container flex min-h-screen flex-col">
  <Header />
  {@render children?.()}
  <Footer />
</div>
