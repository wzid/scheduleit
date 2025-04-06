<script lang="ts">
  import { page } from '$app/state';
</script>

<header class="py-8 text-center lowercase">
  {#if page.url.pathname === '/'}
    <h1 class="leading-none text-peach-300">
      <a href="/">Timeslot</a>
    </h1>
  {:else}
    <div class="text-h1 leading-none text-peach-300">
      <a href="/">Timeslot</a>
    </div>
  {/if}
  <span class="text-sm italic leading-none text-zinc-500">
    Find the time that works best for your team
  </span>
</header>
