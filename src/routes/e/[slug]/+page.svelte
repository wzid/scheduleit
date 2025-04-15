<script lang="ts">
  import ClipboardCopyIcon from '@lucide/svelte/icons/clipboard-copy';
  import CheckIcon from '@lucide/svelte/icons/check';
  import NotebookPenIcon from '@lucide/svelte/icons/notebook-pen';
  import PlusIcon from '@lucide/svelte/icons/plus';
  import PencilIcon from '@lucide/svelte/icons/pencil';
  import { writable } from 'svelte/store';
  import { fly, fade, slide } from 'svelte/transition';
  import { cn, shadeGradient } from '$lib/utils';
  import { DAY_ABBREVIATIONS, type DayAbbreviation } from '$lib/constants';
  import { superForm } from 'sveltekit-superforms/client';
  import type { User } from '$lib/constants';
  import { DayTimeRange } from '$lib';

  import { Button, Meta, Input } from '$lib';
  import { expoInOut } from 'svelte/easing';
  import { invalidateAll } from '$app/navigation';

  let { data } = $props();
  const event = data.event;

  // Get the user's local timezone
  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const isLocalTimezoneDifferent = localTimeZone !== event.timeZone;

  const usersWritable = writable(data.users);
  let users: Array<User> = $state([]);

  usersWritable.subscribe((value) => (users = value));

  $effect(() => {
    usersWritable.set(data.users);
  });

  const {
    form: addUserForm,
    enhance,
    errors
  } = superForm(data.addUserForm, {
    dataType: 'json',
    onResult: async ({ result }) => {
      if (result.type === 'failure' && result.data?.error) {
        alert(result.data.error);
        return;
      }

      if (result.type !== 'success' || !result.data) {
        return;
      }

      usersWritable.update((prev) => {
        if (!result.data) {
          throw new Error('Failed to add user');
        }

        prev.push({ ...result.data.user, availability: null });
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

  // derived helps it update the shades when the users change
  const shades = $derived(shadeGradient(users.length));
  const recordedDays = writable<DayAbbreviation[]>([]);

  let activeUserId = $state<string | null>(null);
  let activeUserPassword: string | null = null;

  let recording = $state(false);
  let focusUserInput = $state(false);
  let open = $state(false);

  async function copyLink() {
    await navigator.clipboard.writeText(new URL(`/e/${event.id}`, window.location.href).toString());
    open = true;
    setTimeout(() => {
      open = false;
    }, 1000);
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key == 'Escape') {
      if (recording) {
        cancel();
        (document.activeElement as HTMLElement)?.blur();
      } else {
        focusUserInput = false;
      }
    }
  };

  // https://svelte.dev/tutorial/svelte/component-this
  // https://svelte.dev/docs/svelte/bind#bind:this
  let dayTimeRange: DayTimeRange;

  const saveAvailability = () => {
    const availabilityString = dayTimeRange.getAvailabilityString();

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
        invalidateAll();
        recording = false;
        activeUserId = null;
      }
    });
  };

  const cancel = () => {
    recording = false;
    activeUserId = null;
  };

  const handlePostLogIn = (user: User, password?: string) => {
    if (event.dateType == 'days') {
      recordedDays.set(
        (users
          .find((u) => u.id == user.id)
          ?.availability?.split('')
          .map((bit, i) => (bit == '1' ? DAY_ABBREVIATIONS[i] : null))
          .filter((day) => day != null) as DayAbbreviation[]) ?? []
      );
    }

    activeUserId = user.id;
    activeUserPassword = password ?? null;
    recording = true;
  };

  const logIn = async (user: User, password?: string) => {
    if (!user.hasPassword) {
      handlePostLogIn(user, password);
      return;
    }

    const response = await fetch('/api/login', {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({
        userId: user.id,
        password
      })
    });

    if (response.status === 401) {
      const answer = prompt(
        password
          ? 'Invalid password. Enter your password to continue.'
          : 'Enter your password to continue.'
      );
      if (answer) {
        logIn(user, answer);
      }
      return;
    }

    if (!response.ok) {
      alert('Uh oh! Something went wrong.');
      return;
    }

    handlePostLogIn(user, password);
  };
</script>

<Meta title={event.name} />

<svelte:body onkeydown={handleKeyDown} />

<h1>{event.name}</h1>

<div class="mt-4 flex w-fit gap-3">
  <Button onClick={() => (focusUserInput = true)} variant="secondary">
    <NotebookPenIcon class="mr-2 h-5 w-5" />
    Record availability
  </Button>
  <div class="relative inline">
    <Button onClick={copyLink} variant="neutral">
      <ClipboardCopyIcon class="mr-2 h-5 w-5" />
      Copy link
    </Button>
    {#if open}
      <div
        transition:fly={{ duration: 200, y: -15 }}
        class="absolute left-[.9rem] top-10 mx-auto inline w-fit rounded-lg bg-zinc-700/50 shadow-lg backdrop-blur-sm"
      >
        <div class="flex items-center px-3 py-1 text-zinc-300">
          <span>Copied</span>
          <CheckIcon class="ml-2 h-4 w-4" strokeWidth={3} />
        </div>
      </div>
    {/if}
  </div>
</div>

<div class="mt-4 flex w-full flex-col gap-12 md:mt-4 md:flex-row">
  <!-- Div that holds the edit controls and Respondents -->
  <div class="w-[7.5rem]">
    <!-- Edit Controls -->
    {#if recording}
      <div
        class="!overflow-visible pb-3 duration-300 ease-in-out animate-in fade-in-0"
        transition:slide={{ duration: 100 }}
      >
        <p class="w-[12rem] text-balance pb-2 text-sm text-zinc-400">
          Click on individual time slots to toggle your availability.
        </p>
        <div class="flex gap-2">
          <Button onClick={cancel} variant="neutral">Cancel</Button>
          <Button onClick={saveAvailability} variant="primary">Save</Button>
        </div>
      </div>
    {/if}

    <div>
      <h2 class="pb-1 font-semibold leading-none text-zinc-500">Respondents</h2>
      {#if focusUserInput}
        <div
          class="relative z-20 !overflow-visible duration-500 ease-in-out animate-in fade-in-0"
          transition:slide={{ duration: 100, easing: expoInOut }}
        >
          <form class="mt-1 flex items-start gap-2" method="POST" action="?/addUser" use:enhance>
            <div class="flex flex-col gap-2">
              <Input
                bind:value={$addUserForm.name}
                className="border border-peach-300 rounded-lg shadow-xl shadow-black/20"
                placeholder="Your name"
              />
              <Input
                bind:value={$addUserForm.password}
                className="border border-peach-300 rounded-lg shadow-xl shadow-black/20"
                placeholder="Password (optional)"
              />
              <div class="invalid !mt-0 text-xs">
                {#if $errors.name}<p>{$errors.name}</p>{/if}
                {#if $errors.password}<p>{$errors.password}</p>{/if}
              </div>
            </div>
            <Button
              className="shadow-xl shadow-black/20"
              variant="secondary"
              contentType="icon"
              type="submit"
            >
              <PlusIcon class="h-5 w-5" strokeWidth={3} />
            </Button>
          </form>
        </div>
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
        <div
          transition:fade={{ duration: 100 }}
          onclick={() => (focusUserInput = false)}
          class="fixed left-0 top-0 z-10 h-screen w-screen bg-zinc-800/80"
        ></div>
      {/if}
      <ul>
        {#each users as user}
          <li class="flex items-center gap-2 text-nowrap">
            {user.name}
            <div class="flex items-center gap-2">
              <div class="group relative">
                <button onclick={() => logIn(user)}>
                  <PencilIcon
                    class="h-3.5 w-3.5 text-zinc-400 transition-colors hover:text-zinc-400/80"
                  />
                </button>
                <div
                  class="pointer-events-none absolute left-1/2 top-6 z-10 hidden -translate-x-1/2 whitespace-nowrap group-hover:block"
                >
                  <div
                    class="rounded-lg bg-zinc-700/75 px-2 py-1 text-sm text-zinc-300 shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2"
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
                      class="rounded-lg bg-zinc-700/75 px-2 py-1 text-sm text-zinc-300 shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2"
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
  </div>

  <div class="flex w-fit flex-col items-center">
    {#if isLocalTimezoneDifferent}
      <div class="mb-2 ml-20 text-xs italic text-zinc-400">
        Shown in your time zone ({localTimeZone})
      </div>
    {/if}

    <div
      class="mb-2 ml-16 flex items-center gap-2 rounded-lg bg-white/10 px-2 py-1 text-sm tabular-nums tracking-widest text-zinc-300 md:ml-20"
    >
      <span>0/{users.length}</span>
      <div class="flex">
        {#each shades as shade}
          <div
            class={cn(
              'size-6 border border-white/20',
              shades.length == 1
                ? 'rounded-md'
                : 'border-x-0 border-r-0 first:rounded-l-md first:border-l last:rounded-r-md last:border-l-0 last:border-r'
            )}
            style="background: {shade}"
          ></div>
        {/each}
      </div>
      <span>{users.length}/{users.length}</span>
    </div>

    <!-- The actual stuff (yes, stuff) -->
    <DayTimeRange
      bind:this={dayTimeRange}
      {users}
      {recording}
      {saveAvailability}
      {cancel}
      startTime={event.startTime}
      endTime={event.endTime}
      {activeUserId}
      timeline={event.dateType === 'days'
        ? { type: 'days', days: event.days ?? [] }
        : { type: 'dates', dates: event.dates ?? [] }}
      timeZone={event.timeZone}
    />
  </div>
</div>
