<script lang="ts">
  import { ClipboardCopy, Check } from 'lucide-svelte';
  import { writable } from 'svelte/store';

  import { fly } from 'svelte/transition';
  import { Button } from '$lib';

  export let data;
  const event = data.event;
  // create a store to track the tooltip state
  const open = writable(false);

  let copylink = () => {
    open.set(true);
    setTimeout(() => {
      open.set(false);
    }, 1000);
    navigator.clipboard.writeText(`https://timeslot.one/${event.id}`);
  };
</script>

<h1>{event.name}</h1>
<div class="mt-4 w-fit">
  <Button onClick={copylink} className="text-base" variant="neutral">
    <ClipboardCopy class="mr-2 h-5 w-5" />
    Copy Link
  </Button>
  {#if $open}
    <div
      transition:fly={{ duration: 200, y: -10 }}
      class="-z-10 mx-auto w-fit rounded-lg bg-zinc-700/70 shadow-lg"
    >
      <p class="mt-3 px-3 py-1 text-zinc-300">
        Copied
        <Check class="mb-[.15rem] ml-2 inline h-5 w-5" strokeWidth={3} />
      </p>
    </div>
  {/if}
</div>
