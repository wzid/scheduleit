<script>
  import { Header, Meta, Footer } from '$lib';
  import '../app.css';
</script>

<Meta />

<div class="container flex min-h-screen flex-col">
  <Header />
  <slot />
  <Footer />
</div>
