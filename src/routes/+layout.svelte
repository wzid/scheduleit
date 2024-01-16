<script>
  import { Header, Meta, Footer } from '$lib';
  import '../app.css';
</script>

<Meta />

<div class="flex h-screen justify-center py-6">
  <div class="flex flex-col items-center">
    <Header />
    <slot />
    <Footer />
  </div>
</div>
