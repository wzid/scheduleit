<script lang="ts">
  import { page } from '$app/state';
</script>

<header class="flex flex-col items-center gap-1 py-8 text-center lowercase">
  {#if page.url.pathname === '/'}
    <h1 class="leading-none text-peach-300">
      <a href="/">Schedule It!</a>
    </h1>
  {:else}
    <a
      class="text-h1 w-fit leading-none text-peach-300 transition-colors hover:text-peach-300/80"
      href="/">Schedule It!</a
    >
  {/if}
  <span class="text-sm italic leading-none text-zinc-500">
    Find the time that works best for your team
  </span>
</header>
