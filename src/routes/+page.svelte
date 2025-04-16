<script lang="ts">
  import CalendarPlusIcon from '@lucide/svelte/icons/calendar-plus';
  import {
    Button,
    Calendar,
    Combobox,
    Input,
    Meta,
    Select,
    TimeRangeSlider,
    DaySelector
  } from '$lib';
  import type { CalendarValue } from '@melt-ui/svelte';
  import { writable } from 'svelte/store';
  import { superForm } from 'sveltekit-superforms/client';
  import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';
  import type { PageData } from './$types';
  import { convertDatesToISO } from '$lib/utils';
  import type { DayAbbreviation } from '$lib/constants';
  import { dev } from '$app/environment';
  import { goto } from '$app/navigation';

  const tzOptions = Intl.supportedValuesOf('timeZone');
  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const dateTypeOptions = ['Specific dates', 'Days of the week'];

  const selectedDateType = writable({ label: dateTypeOptions[0], value: dateTypeOptions[0] });
  const selectedTz = writable({ label: userTz, value: userTz });
  const dates = writable<CalendarValue<true>>([]);
  const days = writable<DayAbbreviation[]>([]);
  const timeRange = writable<number[]>([9, 17]);

  let timeRangeValue: string[] = $state([]);
  let dateTypeValue: string = $state('dates');

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  const { form, enhance, errors } = superForm(data.form, {
    dataType: 'json',
    onResult: ({ result }) => {
      if (result.type === 'success' && result.data) {
        setTimeout(() => goto(`/e/${result.data!.eventId}`));
      } else if (result.type === 'failure' && result.data?.error) {
        alert(result.data.error);
      } else if (result.type === 'error') {
        alert('An unexpected error occurred: ' + result.error.toString());
      }
    }
  });

  dates.subscribe((values) => ($form.dates = convertDatesToISO(values)));
  days.subscribe((values) => ($form.days = values));

  selectedTz.subscribe((option) => ($form.timeZone = option.value));

  selectedDateType.subscribe((option) => {
    const value = option.value === 'Specific dates' ? 'dates' : 'days';
    $form.dateType = value;
    dateTypeValue = value;
  });

  timeRange.subscribe((range) => {
    // convert 24h to 12h
    let [rangeStart, rangeEnd] = range;
    $form.startTime = rangeStart;
    $form.endTime = rangeEnd;

    let end = rangeEnd > 12 ? rangeEnd - 12 + ' PM' : rangeEnd + ' AM';
    let start = rangeStart > 12 ? rangeStart - 12 + ' PM' : rangeStart + ' AM';

    if (rangeStart === 0) {
      start = '12 AM';
    }
    if (rangeStart === 12) {
      start = '12 PM';
    }
    if (rangeEnd === 12) {
      end = '12 PM';
    }

    if (rangeEnd === 24) {
      end = '11:59 PM';
    }

    timeRangeValue = [start, end];
  });
</script>

<Meta title="Plan a Meeting" />

<form use:enhance method="POST" class="space-y-6">
  <!-- Event name -->
  <div>
    <Input bind:value={$form.name} size="lg" placeholder="Your event name..." />
    {#if $errors.name}<p class="invalid">{$errors.name}</p>{/if}
  </div>
  <!-- Date type and time zone -->
  <div class="grid gap-6 sm:grid-cols-2">
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
  <div class="grid gap-6 sm:grid-cols-2">
    <!-- Dates available -->
    <div class="flex h-full flex-col gap-2">
      {#if dateTypeValue == 'dates'}
        <div>
          <h2>Dates Available</h2>
          <p class="text-sm text-zinc-500">What dates might work?</p>
        </div>
        {#if $errors.dates?._errors}<p class="invalid !-mt-2">{$errors.dates?._errors[0]}</p>{/if}
        <Calendar className="w-full" value={dates} />
      {:else}
        <div>
          <h2>Days Available</h2>
          <p class="text-sm text-zinc-500">What days might work?</p>
        </div>
        {#if $errors._errors}<p class="invalid">{$errors._errors[0]}</p>{/if}
        <DaySelector value={days} />
        <img
          alt="Stickman with a text bubble: That sounds like a great idea"
          class="mt-auto hidden self-end invert-[100%] sm:block"
          src="/images/stickman/2.png"
          draggable="false"
          width="215"
        />
      {/if}
    </div>
    <div>
      <!-- Time range -->
      <div class="mb-12 space-y-2 sm:mb-10">
        <div class="flex items-center justify-between">
          <div class="space-y-2">
            <h2>Time Range</h2>
            <p class="text-sm text-zinc-500">What times might work?</p>
          </div>
          <span class="font-medium">{timeRangeValue[0]} - {timeRangeValue[1]}</span>
        </div>
        <TimeRangeSlider value={timeRange} />
      </div>
      <!-- Custom Slug -->
      <div class="space-y-2">
        <div>
          <h2>Custom Slug</h2>
          <p class="text-sm text-zinc-500">
            Example: scheduleit.now/e/{$form.id.trim() || '[slug]'}
          </p>
        </div>
        <Input bind:value={$form.id} placeholder="Your custom slug (optional)" />
        {#if $errors.id}<p class="invalid">{$errors.id}</p>{/if}
      </div>
      <img
        alt="Stickman with a text bubble: Let's find a time to meet using scheduleit.now"
        class="!mt-2 hidden invert-[100%] sm:block"
        src="/images/stickman/1.png"
        draggable="false"
        width="275"
      />
    </div>
  </div>
  <!-- Submit -->
  <Button className="w-full" variant="secondary" type="submit">
    <CalendarPlusIcon class="mr-1.5 h-4 w-4" /> Create event
  </Button>
</form>

<!-- For debugging in dev -->
<!-- <SuperDebug data={$form} display={dev} /> -->
