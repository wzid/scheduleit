<script lang="ts">
  import { CalendarPlus } from 'lucide-svelte';
  import { AvailabilitySelector, Button, Calendar, Combobox, Input, Meta, Select, TimeRangeSlider } from '$lib';
  import type { CalendarValue } from '@melt-ui/svelte';
  import { convertDatesToISO } from '$lib/utils';
  import { writable } from 'svelte/store';
  import { superForm } from 'sveltekit-superforms/client';
  import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';

  const tzOptions = Intl.supportedValuesOf('timeZone');
  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const selectedDateType = writable({ label: 'Specific dates', value: 'Specific dates' });
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
</script>

<Meta title="Group Availability Tool" />

<form use:enhance method="POST" class="space-y-4">
  <!-- Event Name -->
  <div>
    <Input bind:value={$form.name} size="lg" placeholder="Your event name here…" />
    {#if $errors.name}<p class="invalid">{$errors.name}</p>{/if}
  </div>
  <!-- Duration and Time Zone -->
  <div class="flex gap-4 w-full">
    <div class="flex flex-col gap-4 w-full">
      <div class="space-y-2">
        <h2>Date Type</h2>
        <Select
          options={{ 'Date Type': ['Specific dates', 'Days of the week'] }}
          selected={selectedDateType}
        />
      </div>
      <div class="space-y-2">
        <div>
          <h2>Dates Available</h2>
          <p class="text-sm text-zinc-500">What dates might work?</p>
        </div>
        <Calendar className="w-80" value={dates} />
      </div>
    </div>
    <div class="flex flex-col gap-4 w-full">
      <div class="space-y-2">
        <h2>Time Zone</h2>
        <Combobox selected={selectedTz} options={tzOptions} />
        {#if $errors.timeZone}<p class="invalid">{$errors.timeZone}</p>{/if}
      </div>

      <div class="space-y-2">
        <!-- Time range -->
        <div>
          <h2>Time Range</h2>
          <p class="text-sm text-zinc-500">What times might work?</p>
        </div>
        <TimeRangeSlider />
    
      </div>
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
