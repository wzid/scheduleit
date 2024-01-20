<script lang="ts">
  import { ClipboardCopy, Check, NotebookPen, Plus } from 'lucide-svelte';
  import { writable } from 'svelte/store';
  import { fly, fade } from 'svelte/transition';
  import { shadeGradient } from '$lib/utils';
  import { DAYS_OF_THE_WEEK, type Day } from '$lib/constants';
  import { superForm } from 'sveltekit-superforms/client';

  import { DaySelector, DaySelectedViewer, AvailabilitySelector, Button, Meta, Input } from '$lib';

  export let data;
  const event = data.event;

  const usersWritable = writable(data.users);
  let users: typeof data.users = [];

  usersWritable.subscribe((value) => (users = value));

  const {
    form: addUserForm,
    enhance,
    errors
  } = superForm(data.addUserForm, {
    dataType: 'json',
    onResult: async (data) => {
      if (data.result.type !== 'success') return;
      enteringUser = false;
      usersWritable.update((prev) => {
        prev.push({
          name: $addUserForm.name,
          availability: null
        });
        return prev;
      });
      if (event.dateType == 'days') {
        recordedDays.set([]);
      }
    }
  });

  $addUserForm.eventId = event.id;

  // each users has a bit string of availability that corresponds to the days of the week or dates
  // we need to create a map of the days to the number of users that are available on that day
  let dayUserCountMap: Map<Readonly<string>, number> = DAYS_OF_THE_WEEK.map((day) => [
    day,
    0
  ]).reduce((map, [key, value]) => map.set(key, value), new Map());

  if (event.dateType == 'days') {
    // Iterate over the users array
    users.forEach((user) => {
      if (!user.availability) return;
      // For each user, iterate over their availability bit string
      for (let i = 0; i < user.availability.length; i++) {
        // if the user is available on that day, increment the count for that day
        if (user.availability[i] == '1') {
          const day = DAYS_OF_THE_WEEK[i];
          // if the day is not in the map, set it to 1, otherwise increment it
          dayUserCountMap.set(day, (dayUserCountMap.get(day) ?? 0) + 1);
        }
      }
    });
  }

  const shades = shadeGradient(users.length);
  let recording = false;
  let enteringUser = false;
  let open = false;
  const recordedDays = writable<Day[]>([]);
  // create a store to track the tooltip state

  async function copyLink() {
    await navigator.clipboard.writeText(`https://timeslot.one/${event.id}`);
    open = true;
    setTimeout(() => {
      open = false;
    }, 1000);
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key == 'Escape') {
      enteringUser = false;
    }
  };
</script>

<Meta title={event.name} />

<svelte:body on:keydown={handleKeyDown} />

<h1>{event.name}</h1>

<div class="mt-4 w-fit space-x-2">
  <Button onClick={() => (enteringUser = true)} variant="secondary">
    <NotebookPen class="mr-2 h-5 w-5" />
    Record Time
  </Button>
  <div class="relative inline">
    <Button onClick={copyLink} variant="neutral">
      <ClipboardCopy class="mr-2 h-5 w-5" />
      Copy Link
    </Button>
    {#if open}
      <div
        transition:fly={{ duration: 200, y: -15 }}
        class="absolute left-[.9rem] top-7 -z-10 mx-auto inline w-fit rounded-lg bg-zinc-700/70 shadow-lg"
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
    <span class="text-2xl font-semibold text-zinc-500">Respondents</span>
    <div class="text-xl">
      {#if enteringUser}
        <div class="relative z-10">
          <form class="mt-1 flex items-center gap-4" method="POST" action="?/addUser" use:enhance>
            <Input
              className="border border-peach-300 rounded-lg"
              placeholder="Enter your name"
              bind:value={$addUserForm.name}
            />
            <Button variant="secondary" contentType="icon" type="submit">
              <Plus class="h-5 w-5" strokeWidth={3} />
            </Button>
          </form>
          {#if $errors.name}<p class="invalid">{$errors.name}</p>{/if}
        </div>
        <div
          transition:fade={{ duration: 100 }}
          class="absolute left-0 top-0 z-0 h-screen w-screen bg-zinc-800/70"
        />
      {/if}
      {#each users as user}
        <p>{user.name}</p>
      {/each}
    </div>
  </div>
  <div class="flex w-full flex-col items-center">
    <!-- Shades for users -->
    <div class="flex items-center text-xl text-zinc-300">
      <p class="mr-4">0/{users.length}</p>
      {#each shades as shade}
        <div style="background: {shade};" class="size-8"></div>
      {/each}
      <p class="ml-4">{users.length}/{users.length}</p>
    </div>

    <!-- The actually stuff (yes, stuff) -->
    {#if event.dateType == 'days'}
      <div class="mt-8">
        {#if recording}
          <DaySelector value={recordedDays} />
        {:else}
          <DaySelectedViewer daysSelected={dayUserCountMap} {shades} />
        {/if}
      </div>
    {:else}
      <div>
        <h1>dates</h1>
      </div>
    {/if}
  </div>
</div>
