<script lang="ts">
  import { CalendarPlus } from 'lucide-svelte';
  import { Button, Calendar, Combobox, Input, Meta, Select, TimeRangeSlider } from '$lib';
  import type { CalendarValue } from '@melt-ui/svelte';
  import { get, writable } from 'svelte/store';
  import { superForm } from 'sveltekit-superforms/client';
  import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import { convertDatesToISO } from '$lib/utils';

  const tzOptions = Intl.supportedValuesOf('timeZone');
  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const dateTypeOptions = ['Specific dates', 'Days of the week'];

  const selectedDateType = writable({ label: dateTypeOptions[0], value: dateTypeOptions[0] });
  const selectedTz = writable({ label: userTz, value: userTz });
  const dates = writable<CalendarValue<true>>([]);
  const timeRange = writable<number[]>([9, 17]);

  let timeRangeValue: string[] = [];

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

  dates.subscribe((values) => ($form.dates = convertDatesToISO(values)));
  selectedTz.subscribe((option) => ($form.timeZone = option.value));

  selectedDateType.subscribe((option) => {
    const value = option.value === 'Specific dates' ? 'specific' : 'days_of_week';
    $form.dateType = value;
  });

  timeRange.subscribe((range) => {
    // convert 24h to 12h
    let [rangeStart, rangeEnd] = range;
    $form.startTime = rangeStart;
    $form.endTime = rangeEnd;

    if (rangeStart === 0) rangeStart = 12;
    if (rangeEnd === 24) rangeEnd = 12;

    const start = rangeStart > 12 ? rangeStart - 12 + ' PM' : rangeStart + ' AM';
    const end = rangeEnd > 12 ? rangeEnd - 12 + ' PM' : rangeEnd + ' AM';

    timeRangeValue = [start, end];
  });
</script>

<Meta title="Group Availability Tool" />

<form use:enhance method="POST" class="space-y-4">
  <!-- Event name -->
  <div>
    <Input bind:value={$form.name} size="lg" placeholder="Your event name..." />
    {#if $errors.name}<p class="invalid">{$errors.name}</p>{/if}
  </div>
  <!-- Date type and time zone -->
  <div class="grid gap-4 sm:grid-cols-2">
    <div class="space-y-2">
      <h2>Date Type</h2>
      <Select options={{ 'Date Type': dateTypeOptions }} selected={selectedDateType} />
    </div>
    <div class="space-y-2">
      <h2>Time Zone</h2>
      <Combobox selected={selectedTz} options={tzOptions} />
      {#if $errors.timeZone}<p class="invalid">{$errors.timeZone}</p>{/if}
    </div>
  </div>
  <div class="grid gap-4 sm:grid-cols-2">
    <!-- Dates available -->
    <div class="space-y-2">
      <div>
        <h2>Dates Available</h2>
        <p class="text-sm text-zinc-500">What dates might work?</p>
      </div>
      {#if $errors.dates?._errors}<p class="invalid">{$errors.dates._errors[0]}</p>{/if}
      <Calendar className="min-w-full w-72" value={dates} />
    </div>
    <div class="space-y-2">
      <!-- Time range -->
      <div class="mb-10 space-y-2">
        <div class="flex items-center justify-between">
          <div class="space-y-2">
            <h2>Time Range</h2>
            <p class="text-sm text-zinc-500">What times might work?</p>
          </div>
          <span class="font-medium">{timeRangeValue[0]} - {timeRangeValue[1]}</span>
        </div>
        <TimeRangeSlider value={timeRange} />
      </div>
      <!-- Custom ID -->
      <div class="space-y-2">
        <div>
          <h2>Custom ID</h2>
          <p class="text-sm text-zinc-500">Example: timeslot.one/event/[customId]</p>
        </div>
        <Input bind:value={$form.id} placeholder="Your custom ID (optional)" />
        {#if $errors.id}<p class="invalid">{$errors.id}</p>{/if}
      </div>
    </div>
  </div>
  <!-- Submit -->
  <Button className="w-full" variant="secondary" type="submit">
    <CalendarPlus class="mr-1.5 h-4 w-4" /> Create event
  </Button>
</form>

<!-- For debugging in dev -->
<SuperDebug data={$form} />
