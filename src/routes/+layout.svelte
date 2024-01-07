<script>
  import { Header, Meta } from '$lib';
  import '../app.css';
</script>

<Meta />

<div class="flex justify-center py-6">
  <div class="flex flex-col items-center">
    <Header />
    <slot />
  </div>
</div>
