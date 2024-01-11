<script lang="ts">
  import { CalendarPlus, Minus, Plus } from 'lucide-svelte';
  import { Button, Calendar, Combobox, Input, Meta, Select, NumericInput } from '$lib';
  import type { CalendarValue } from '@melt-ui/svelte';
  import { TIMES } from '$lib/constants';
  import { convertDatesToISO, getTimeRangesFromDuration } from '$lib/utils';
  import { writable } from 'svelte/store';
  import { superForm } from 'sveltekit-superforms/client';
  import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
    import { min } from 'drizzle-orm';

  const tzOptions = Intl.supportedValuesOf('timeZone');
  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  let duration = { hours: 0, minutes: 30 };

  const selectedTz = writable({ label: userTz, value: userTz });
  const dates = writable<CalendarValue<true>>([]);

  export let data: PageData;
  const { form, enhance, errors } = superForm(data.form, {
    dataType: 'json',
    onResult: ({ result }) => {
      if (result.type === 'success' && result.data) {
        const eventId = result.data.eventId;
        goto(`/event/${eventId}`);
      }
    }
  });

  selectedTz.subscribe((option) => ($form.timeZone = option.value));

  function increment() {
    duration.minutes += 1;
    if (duration.minutes === 60) {
      duration.minutes = 0;
      duration.hours += 1;
    }
  }

  function decrement() {
    // We decrease the hours first, then the minutes if the hours are greater than 0
    if (duration.hours > 0 && duration.minutes === 0) {
      duration.hours -= 1;
      duration.minutes = 59;
    } else if (duration.minutes > 0) {
      // We decrease the minutes if they are greater than 0
      duration.minutes -= 1;
    }
  }

  function fixTimeRange() {
    if (duration.minutes >= 60) {
      duration.hours += Math.floor(duration.minutes / 60);
      duration.minutes = duration.minutes % 60;
    }
  }

  // TODO: Ensure fromTime is before toTime
</script>

<Meta title="Group Availability Tool" />

<form use:enhance method="POST" class="space-y-4">
  <!-- Event Name -->
  <div>
    <Input bind:value={$form.name} size="lg" placeholder="Your event name here…" />
    {#if $errors.name}<p class="invalid">{$errors.name}</p>{/if}
  </div>
  <!-- Duration and Time Zone -->
  <div class="grid gap-4 sm:grid-cols-2">
    <div class="space-y-2">
      <h2>Duration</h2>
      <div class="flex justify-between">
        <Button onClick={decrement} className="h-10 w-10" contentType="icon" variant="neutral">
          <Minus class="h-5 w-5" />
        </Button>
        <div class="flex items-center gap-2">
          <NumericInput size="lg" className="w-10" bind:value={duration.hours} />
          <p>h</p>
          <NumericInput onDroppedFocus={fixTimeRange} size="lg" className="w-10" bind:value={duration.minutes} />
          <p>m</p>
        </div>
        <Button onClick={increment} className="h-10 w-10" contentType="icon" variant="neutral">
          <Plus class="h-5 w-5" />
        </Button>
      </div>
    </div>
    <div class="space-y-2">
      <h2>Time Zone</h2>
      <Combobox selected={selectedTz} options={tzOptions} />
      {#if $errors.timeZone}<p class="invalid">{$errors.timeZone}</p>{/if}
    </div>
  </div>
  <!-- Calendar -->
  <div class="grid gap-4 sm:grid-cols-2">
    <div class="space-y-2">
      <div>
        <h2>Dates Available</h2>
        <p class="text-sm text-zinc-500">What dates might work?</p>
      </div>
      <Calendar className="w-80 md:w-72" value={dates} />
    </div>
    <!-- turn into component? -->
    <div class="space-y-3.5 rounded-lg text-center shadow-sm">
      <h3>Monday, January 8, 2024</h3>
      <div class="flex max-h-60 flex-col gap-2 overflow-y-auto">
        <!-- TODO: Make these actually time slots, not just 30 minute intervals -->
        {#each getTimeRangesFromDuration(duration) as time}
          <Button className="w-full" variant="neutral">{time.start} - {time.end}</Button>
        {/each}
        <!-- <Button className="w-full" variant="neutral">8:00 AM - 8:30 AM</Button> -->
      </div>
      <!-- need to find a way to make this button stand out but not as much as the submit button -->
      <Button className="w-full" variant="neutral">Apply times to all selected dates</Button>
    </div>
  </div>
  <!-- Submit -->
  <Button className="w-full" variant="secondary">
    <CalendarPlus class="mr-1.5 h-4 w-4" /> Create event
  </Button>
</form>

<!-- For debugging in dev 
<SuperDebug data={$form} />
-->
