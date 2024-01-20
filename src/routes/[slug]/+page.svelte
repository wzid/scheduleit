<script lang="ts">
  import { ClipboardCopy, Check, NotebookPen } from 'lucide-svelte';
  import { writable } from 'svelte/store';
  import { fly } from 'svelte/transition';
  import { shadeGradient } from '$lib/utils'
  import { error } from '@sveltejs/kit';

  import { AvailabilitySelector, Button, Meta } from '$lib';

  export let data;
  const event = data.event;
  const users = data.users;

  const shades = shadeGradient(users.length);

  // create a store to track the tooltip state
  const open = writable(false);

  async function copyLink() {
    await navigator.clipboard.writeText(`https://timeslot.one/${event.id}`);
    open.set(true);
    setTimeout(() => {
      open.set(false);
    }, 1000);
  }
</script>

<Meta title={event.name} />

<h1>{event.name}</h1>

<div class="mt-4 space-x-2 w-fit">
  <Button variant="secondary">
    <NotebookPen class="mr-2 h-5 w-5" />
    Record Time
  </Button>
  <div class="relative inline">
    <Button onClick={copyLink} variant="neutral">
      <ClipboardCopy class="mr-2 h-5 w-5" />
      Copy Link
    </Button>
    {#if $open}
      <div
        transition:fly={{ duration: 200, y: -15 }}
        class="absolute inline left-[.9rem] top-7 -z-10 mx-auto w-fit rounded-lg bg-zinc-700/70 shadow-lg"
      >
        <div class="flex items-center px-3 py-1 text-zinc-300">
          <span>Copied</span>
          <Check class="ml-2 h-4 w-4" strokeWidth={3} />
        </div>
      </div>
    {/if}

  </div>
</div>

<div class="mt-8 flex flex-col gap-6 sm:flex-row sm:gap-12">
  <div>
    <span class="font-semibold text-2xl text-zinc-500">Respondents</span>
    <div class="ml-2 text-xl">
      {#each users as user}
        <p>{user.name}</p>
      {/each}
    </div>
  </div>
  <div class="flex flex-col w-full items-center">
    <!-- Shades for users -->
    <div class="flex items-center text-xl text-zinc-300">
      <p class="mr-4">0/{users.length}</p>
      {#each shades as shade}
        <div style="background: {shade};" class="size-8"></div>
      {/each}
      <p class="ml-4">{users.length}/{users.length}</p>
    </div>
    <div class="self-start mt-4 ml-12">
      {#if event.dateType == 'days'}
          <h1>days</h1>
      {:else}
        <h1>dates</h1>
      {/if}
    </div>
  </div>
</div>
