<script lang="ts">
  import { ClipboardCopy, Check } from 'lucide-svelte';
  import { writable } from 'svelte/store';
  import { fly } from 'svelte/transition';

  import { Button, Meta } from '$lib';

  export let data;
  const event = data.event;

  // create a store to track the tooltip state
  const open = writable(false);

  const copyLink = () => {
    open.set(true);
    setTimeout(() => {
      open.set(false);
    }, 1000);
    navigator.clipboard.writeText(`https://timeslot.one/${event.id}`);
  };
</script>

{#if event}
  <Meta title={event.name} />

  <h1>{event.name}</h1>

  <div class="mt-4 w-fit">
    <Button onClick={copyLink} className="text-base font-medium" variant="neutral">
      <ClipboardCopy class="mr-2 h-5 w-5" />
      Copy Link
    </Button>
    {#if $open}
      <div
        transition:fly={{ duration: 200, y: -10 }}
        class="-z-10 mx-auto w-fit rounded-lg bg-zinc-700/70 shadow-lg"
      >
        <div class="mt-3 flex items-center px-3 py-1 text-zinc-300">
          <span>Copied</span>
          <Check class="ml-2 h-4 w-4" strokeWidth={3} />
        </div>
      </div>
    {/if}
  </div>
{:else}
  <h1>404</h1>
  <p>Event not found</p>
{/if}
