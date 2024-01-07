<script lang="ts">
  import { Button, Calendar, Combobox, Input, Meta, Select } from '$lib';
  import type { CalendarValue } from '@melt-ui/svelte';
  import { TIMES } from '$lib/constants';
  import { stripDateData } from '$lib/utils';
  import { writable } from 'svelte/store';
  import { superForm } from 'sveltekit-superforms/client';
  import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';
  import type { PageData } from './$types';

  const timeOptions = { times: TIMES };
  const tzOptions = Intl.supportedValuesOf('timeZone');
  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Default component values
  const fromTime = writable({ label: '12:00 AM', value: '12:00 AM' });
  const toTime = writable({ label: '12:30 AM', value: '12:30 AM' });
  const selectedTz = writable({ label: userTz, value: userTz });
  const dates = writable<CalendarValue<true>>([]);

  export let data: PageData;
  const { form, enhance, errors } = superForm(data.form, { dataType: 'json' });

  fromTime.subscribe((option) => ($form.fromTime = option.value));
  toTime.subscribe((option) => ($form.toTime = option.value));
  selectedTz.subscribe((option) => ($form.timeZone = option.value));
  dates.subscribe((values) => ($form.dates = stripDateData(values)));

  // TODO: Ensure fromTime is before toTime
</script>

<Meta title="Group Availability Tool" />

<form use:enhance method="POST" class="space-y-4">
  <div>
    <Input bind:value={$form.name} size="lg" placeholder="Type your event name here..." />
    {#if $errors.name}<p class="invalid">{$errors.name}</p>{/if}
  </div>
  <div class="flex flex-col gap-4 sm:flex-row">
    <div class="space-y-2">
      <div>
        <h3>Dates Available</h3>
        <p class="text-sm text-zinc-500">What dates might work?</p>
        {#if $errors.dates?._errors}<p class="invalid">{$errors.dates._errors[0]}</p>{/if}
      </div>
      <Calendar className="w-80 md:w-72" value={dates} />
    </div>
    <div class="space-y-4">
      <div class="space-y-2">
        <div>
          <h3>Time Range</h3>
          <p class="text-sm text-zinc-500">What times might work?</p>
        </div>
        <div class="flex items-center gap-2">
          <Select className="w-full" selected={fromTime} options={timeOptions} />
          <span>to</span>
          <Select className="w-full" selected={toTime} options={timeOptions} />
        </div>
        {#if $errors.fromTime}<p class="invalid">{$errors.fromTime}</p>{/if}
        {#if $errors.toTime}<p class="invalid">{$errors.toTime}</p>{/if}
      </div>
      <div class="space-y-2">
        <h3>Time Zone</h3>
        <Combobox selected={selectedTz} options={tzOptions} />
        {#if $errors.timeZone}<p class="invalid">{$errors.timeZone}</p>{/if}
      </div>
      <Button className="w-full" variant="secondary">Create Event</Button>
    </div>
  </div>
</form>

<!-- For debugging in dev -->
<SuperDebug data={$form} />
