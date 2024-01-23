<script lang="ts">
  import { ClipboardCopy, Check, NotebookPen, Plus, Pencil } from 'lucide-svelte';
  import { get, writable } from 'svelte/store';
  import { fly, fade } from 'svelte/transition';
  import { shadeGradient } from '$lib/utils';
  import { DAYS_OF_THE_WEEK, type Day } from '$lib/constants';
  import { superForm } from 'sveltekit-superforms/client';
  import type { User } from '$lib/constants';

  import { DaySelector, DaySelectedViewer, AvailabilitySelector, Button, Meta, Input } from '$lib';

  export let data;
  const event = data.event;

  const usersWritable = writable(data.users);
  let users: Array<User> = [];

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
    users.forEach((user) => {
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

  const shades = shadeGradient(users.length);
  const recordedDays = writable<Day[]>([]);

  let activeUserId: string | null = null;
  let activeUserPassword: string | null = null;

  let recording = false;
  let focusUserInput = false;
  let open = false;

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

  const saveAvailability = () => {
    const days = get(recordedDays);
    const bitString = DAYS_OF_THE_WEEK.map((day) => (days.includes(day) ? '1' : '0')).join('');
    fetch('/api/availability', {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({
        eventId: event.id,
        userId: activeUserId,
        availability: bitString,
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

<svelte:body on:keydown={handleKeyDown} />

<h1>{event.name}</h1>

<div class="mt-4 w-fit space-x-2">
  <Button onClick={() => (focusUserInput = true)} variant="secondary">
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
            <Plus class="h-5 w-5" strokeWidth={3} />
          </Button>
        </form>
      </div>
      <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
      <div
        transition:fade={{ duration: 100 }}
        on:click={() => (focusUserInput = false)}
        class="absolute left-0 top-0 z-0 h-screen w-screen bg-zinc-800/70"
      />
    {/if}
    <ul>
      {#each users as user}
        <li class="flex items-center gap-2">
          {user.name}
          <div class="flex items-center gap-2">
            <div class="group relative">
              <button on:click={() => logIn(user.id)}>
                <Pencil
                  class="h-3.5 w-3.5 text-zinc-400 transition-colors hover:text-zinc-400/80"
                />
              </button>
              <div
                class="pointer-events-none absolute left-1/2 top-6 z-10 hidden -translate-x-1/2 whitespace-nowrap group-hover:block"
              >
                <div
                  class="animate-in fade-in slide-in-from-bottom-2 rounded-lg bg-zinc-700 px-2 py-1 text-sm text-zinc-300 shadow-lg"
                >
                  Edit availability
                </div>
              </div>
            </div>
            {#if user.availability}
              <div class="group relative">
                <Check class="h-4 w-4 text-green-500" strokeWidth={3} />
                <div
                  class="pointer-events-none absolute left-1/2 top-6 z-10 hidden -translate-x-1/2 whitespace-nowrap group-hover:block"
                >
                  <div
                    class="animate-in fade-in slide-in-from-bottom-2 rounded-lg bg-zinc-700 px-2 py-1 text-sm text-zinc-300 shadow-lg"
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
    <div class="flex items-center text-xl text-zinc-300">
      <p class="mr-4">0/{users.length}</p>
      {#each shades as shade}
        <div style="background: {shade};" class="size-8"></div>
      {/each}
      <p class="ml-4">{users.length}/{users.length}</p>
    </div>

    <!-- The actually stuff (yes, stuff) -->
    {#if event.dateType == 'days'}
      <div class="mt-8 space-y-4">
        {#if recording}
          <DaySelector value={recordedDays} />
          <div class="flex w-full gap-2">
            <Button onClick={saveAvailability} className="w-3/4">Apply changes</Button>
            <Button onClick={cancel} variant="red">Cancel</Button>
          </div>
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
