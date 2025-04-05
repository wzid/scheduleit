<script lang="ts">
  import ClipboardCopyIcon from '@lucide/svelte/icons/clipboard-copy';
  import CheckIcon from '@lucide/svelte/icons/check';
  import NotebookPenIcon from '@lucide/svelte/icons/notebook-pen';
  import PlusIcon from '@lucide/svelte/icons/plus';
  import PencilIcon from '@lucide/svelte/icons/pencil';
  import { get, writable } from 'svelte/store';
  import { fly, fade } from 'svelte/transition';
  import { shadeGradient } from '$lib/utils';
  import { DAYS_OF_THE_WEEK, type Day } from '$lib/constants';
  import { superForm } from 'sveltekit-superforms/client';
  import type { User } from '$lib/constants';
  import { DayTimeRange } from '$lib';

  import { Button, Meta, Input } from '$lib';

  let { data } = $props();
  const event = data.event;
  

  const usersWritable = writable(data.users);
  let users: Array<User> = $state([]);

  usersWritable.subscribe((value) => (users = value));

  const {
    form: addUserForm,
    enhance,
    errors
  } = superForm(data.addUserForm, {
    dataType: 'json',
    onResult: async ({ result }) => {
      if (result.type !== 'success' || !result.data) return;
      usersWritable.update((prev) => {
        prev.push({
          id: result.data!.user.id,
          name: result.data!.user.name,
          availability: null
        });
        return prev;
      });
      activeUserId = result.data!.user.id;
      focusUserInput = false;
      recording = true;
      if (event.dateType == 'days') {
        recordedDays.set([]);
      }
    }
  });

  $addUserForm.eventId = event.id;

  // each users has a bit string of availability that corresponds to the days of the week or dates
  // we need to create a map of the days to the number of users that are available on that day
  let dayUserCountMap: Map<Readonly<string>, Array<User>> = DAYS_OF_THE_WEEK.map((day) => [
    day,
    []
  ]).reduce((map, [key, value]) => map.set(key, value), new Map());

  if (event.dateType == 'days') {
    // Iterate over the users array
    $usersWritable.forEach((user) => {
      if (!user.availability) return;
      // For each user, iterate over their availability bit string
      for (let i = 0; i < user.availability.length; i++) {
        // if the user is available on that day, increment the count for that day
        if (user.availability[i] == '1') {
          const day = DAYS_OF_THE_WEEK[i];
          // if the day is not in the map, set it to 1, otherwise increment it
          const arr = dayUserCountMap.get(day) ?? [];
          dayUserCountMap.set(day, arr.concat([user]));
        }
      }
    });
  }

  const shades = shadeGradient($usersWritable.length);
  const recordedDays = writable<Day[]>([]);

  let activeUserId = $state<string | null>(null);
  let activeUserPassword: string | null = null;

  let recording = $state(false);
  let focusUserInput = $state(false);
  let open = $state(false);

  async function copyLink() {
    await navigator.clipboard.writeText(`https://timeslot.one/${event.id}`);
    open = true;
    setTimeout(() => {
      open = false;
    }, 1000);
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key == 'Escape') {
      focusUserInput = false;
    }
  };

  const saveAvailability = (availabilityString: string) => {
    fetch('/api/availability', {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({
        eventId: event.id,
        userId: activeUserId,
        availability: availabilityString,
        password: activeUserPassword
      })
    }).then((res) => {
      if (res.ok) {
        recording = false;
        activeUserId = null;
        location.reload();
      }
    });
  };

  const cancel = () => {
    recording = false;
    activeUserId = null;
  };

  const logIn = async (userId: string, password?: string) => {
    const res = await fetch('/api/login', {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({
        userId,
        password
      })
    });
    if (!res.ok) {
      if (res.status === 401) {
        const answer = prompt(
          (password ? 'Invalid password. ' : '') + 'Enter your password to continue.'
        );
        if (answer) {
          logIn(userId, answer);
        }
      } else {
        alert('Uh oh! Something went wrong.');
      }
      return;
    }
    if (event.dateType == 'days') {
      recordedDays.set(
        (users
          .find((user) => user.id == userId)
          ?.availability?.split('')
          .map((bit, i) => (bit == '1' ? DAYS_OF_THE_WEEK[i] : null))
          .filter((day) => day != null) as Day[]) ?? []
      );
    }
    activeUserId = userId;
    activeUserPassword = password ?? null;
    recording = true;
  };
</script>

<Meta title={event.name} />

<svelte:body onkeydown={handleKeyDown} />

<h1>{event.name}</h1>

<div class="mt-4 w-fit space-x-2">
  <Button onClick={() => (focusUserInput = true)} variant="secondary">
    <NotebookPenIcon class="mr-2 h-5 w-5" />
    Record Time
  </Button>
  <div class="relative inline">
    <Button onClick={copyLink} variant="neutral">
      <ClipboardCopyIcon class="mr-2 h-5 w-5" />
      Copy Link
    </Button>
    {#if open}
      <div
        transition:fly={{ duration: 200, y: -15 }}
        class="absolute left-[.9rem] top-7 -z-10 mx-auto inline w-fit rounded-lg bg-zinc-700/70 shadow-lg"
      >
        <div class="flex items-center px-3 py-1 text-zinc-300">
          <span>Copied</span>
          <CheckIcon class="ml-2 h-4 w-4" strokeWidth={3} />
        </div>
      </div>
    {/if}
  </div>
</div>

<div class="mt-8 flex flex-col-reverse gap-6 sm:flex-row sm:gap-12">
  <div>
    <span class="text-2xl font-semibold text-zinc-500">Respondents</span>
    {#if focusUserInput}
      <div class="relative z-10">
        <form class="mt-1 flex items-start gap-4" method="POST" action="?/addUser" use:enhance>
          <div class="flex flex-col gap-2">
            <Input
              className="border border-peach-300 rounded-lg"
              placeholder="Your name"
              bind:value={$addUserForm.name}
            />
            <Input
              bind:value={$addUserForm.password}
              className="border border-peach-300 rounded-lg"
              placeholder="Password (optional)"
            />
            <div class="invalid !mt-0 text-xs">
              {#if $errors.name}<p>{$errors.name}</p>{/if}
              {#if $errors.password}<p>{$errors.password}</p>{/if}
            </div>
          </div>
          <Button variant="secondary" contentType="icon" type="submit">
            <PlusIcon class="h-5 w-5" strokeWidth={3} />
          </Button>
        </form>
      </div>
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <div
        transition:fade={{ duration: 100 }}
        onclick={() => (focusUserInput = false)}
        class="absolute left-0 top-0 z-0 h-screen w-screen bg-zinc-800/70"
      ></div>
    {/if}
    <ul>
      {#each users as user}
        <li class="flex items-center gap-2">
          {user.name}
          <div class="flex items-center gap-2">
            <div class="group relative">
              <button onclick={() => logIn(user.id)}>
                <PencilIcon
                  class="h-3.5 w-3.5 text-zinc-400 transition-colors hover:text-zinc-400/80"
                />
              </button>
              <div
                class="pointer-events-none absolute left-1/2 top-6 z-10 hidden -translate-x-1/2 whitespace-nowrap group-hover:block"
              >
                <div
                  class="rounded-lg bg-zinc-700 px-2 py-1 text-sm text-zinc-300 shadow-lg animate-in fade-in slide-in-from-bottom-2"
                >
                  Edit availability
                </div>
              </div>
            </div>
            {#if user.availability}
              <div class="group relative">
                <CheckIcon class="h-4 w-4 text-green-500" strokeWidth={3} />
                <div
                  class="pointer-events-none absolute left-1/2 top-6 z-10 hidden -translate-x-1/2 whitespace-nowrap group-hover:block"
                >
                  <div
                    class="rounded-lg bg-zinc-700 px-2 py-1 text-sm text-zinc-300 shadow-lg animate-in fade-in slide-in-from-bottom-2"
                  >
                    Availability recorded
                  </div>
                </div>
              </div>
            {/if}
          </div>
        </li>
      {/each}
    </ul>
  </div>
  <div class="flex w-full flex-col items-center">
    <!-- Shades for users -->
    <div class="flex items-center pl-20 text-lg text-zinc-300">
      <p class="mr-4">0/{users.length}</p>
      {#each shades as shade}
        <div style="background: {shade};" class="size-6"></div>
      {/each}
      <p class="ml-4">{users.length}/{users.length}</p>
    </div>

    <!-- The actually stuff (yes, stuff) -->
    {#if event.dateType == 'days'}
      <DayTimeRange
        {users}
        {recording}
        {saveAvailability}
        {cancel}
        startTime={event.startTime}
        endTime={event.endTime}
        {activeUserId}
        days={event.days ?? []}
      />
    {:else}
      <div>
        <h1>dates</h1>
      </div>
    {/if}
  </div>
</div>
