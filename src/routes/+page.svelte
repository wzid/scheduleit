<script lang="ts">
  import { Button, Calendar, Combobox, Input, Meta, Select } from '$lib';
  import type { CalendarValue } from '@melt-ui/svelte';
  import { TIMES } from '$lib/constants';
  import { get, writable } from 'svelte/store';
  import { stripDatesData } from '$lib/utils';

  let timeOptions = { times: TIMES };
  const tzOptions = Intl.supportedValuesOf('timeZone');
  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Default component values
  const fromTime = writable({ label: '12:00 AM', value: '12:00 AM' });
  const toTime = writable({ label: '12:30 AM', value: '12:30 AM' });
  const selectedTz = writable({ label: userTz, value: userTz });
  const dates = writable<CalendarValue<true>>([]);
  let eventName = '';

  function handleSubmit() {
    const data = {
      name: eventName,
      fromTime: get(fromTime).value,
      toTime: get(toTime).value,
      timeZone: get(selectedTz).value,
      dates: stripDatesData(get(dates))
    };
    console.log('recv submit', data);
  }
</script>

<Meta title="Group Availability Tool" />

<form class="flex w-fit flex-col gap-4" on:submit={handleSubmit}>
  <Input bind:value={eventName} size="lg" placeholder="Type your event name here..." />
  <div class="grid gap-4 sm:flex">
    <div>
      <div class="pb-2">
        <h3>Dates Available</h3>
        <p class="text-sm text-zinc-500">What dates might work?</p>
      </div>
      <Calendar className="w-80 md:w-72" value={dates} />
    </div>
    <div>
      <div class="pb-4">
        <div class="pb-2">
          <h3>Time Range</h3>
          <p class="text-sm text-zinc-500">What times might work?</p>
        </div>
        <div class="flex items-center gap-2">
          <Select className="w-full" selected={fromTime} options={timeOptions} />
          <p class="text-lg">to</p>
          <Select className="w-full" selected={toTime} options={timeOptions} />
        </div>
      </div>
      <div class="pb-4">
        <h3 class="pb-2">Time Zone</h3>
        <Combobox selected={selectedTz} options={tzOptions} />
      </div>
      <Button className="w-full" variant="secondary">Create Event</Button>
    </div>
  </div>
</form>
