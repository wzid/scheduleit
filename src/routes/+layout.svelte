<script lang="ts">
  import { Header, Meta, Footer } from '$lib';
  import { onNavigate } from '$app/navigation';

  import '../app.css';

  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();

  onNavigate((navigation) => {
    if (!document.startViewTransition) {
      return;
    }

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });
</script>

<Meta />

<div class="flex min-h-screen flex-col px-4 md:container">
  <Header />
  {@render children?.()}
  <Footer />
</div>
