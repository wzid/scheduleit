<script>
  import { Header, Meta, Footer } from '$lib';
  import '../app.css';
</script>

<Meta />

<div class="flex justify-center py-6 h-screen">
  <div class="flex flex-col items-center ">
    <Header />
    <slot />
    <Footer />
  </div>
</div>
