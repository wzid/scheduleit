<script lang="ts">
  import { Minus, Plus } from 'lucide-svelte';
  import { Button, Calendar, Combobox, Input, Meta, Select, NumericInput } from '$lib';
  import type { CalendarValue } from '@melt-ui/svelte';
  import { TIMES } from '$lib/constants';
  import { convertDatesToISO } from '$lib/utils';
  import { writable } from 'svelte/store';
  import { superForm } from 'sveltekit-superforms/client';
  import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';

  const timeOptions = { times: TIMES };
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

  const increment = () => {
    duration.minutes += 1;
    if (duration.minutes === 60) {
      duration.minutes = 0;
      duration.hours += 1;
    }
  }

  const decrement = () => {
    // We decrease the hours first, then the minutes if the hours are greater than 0
    if (duration.hours > 0 && duration.minutes === 0) {
      duration.hours -= 1;
      duration.minutes = 59;
    } else if (duration.minutes > 0) { 
      // We decrease the minutes if they are greater than 0
      duration.minutes -= 1;
    }
  }
  

  // TODO: Ensure fromTime is before toTime
</script>

<Meta title="Group Availability Tool" />

<form use:enhance method="POST" class="space-y-4">
  <div>
    <Input bind:value={$form.name} size="lg" placeholder="Type your event name here..." />
    {#if $errors.name}<p class="invalid">{$errors.name}</p>{/if}
  </div>
  <div class="flex flex-col gap-4 sm:flex-row">
    <div class="flex gap-4">
      <div>
        <h3 class="pb-2">Duration</h3>
        <div class="flex gap-4 items-center">
          <Button className="h-10 w-10" contentType="icon" onClick={decrement} variant="neutral" >
            <Minus size={20} strokeWidth={3} />
          </Button>
          <div class="flex gap-2 items-center">
            <NumericInput size="lg" className="w-10" value={duration.hours} />
            <p>h</p>
            <NumericInput size="lg" className="w-10" value={duration.minutes} />
            <p>m</p>
          </div>
          <Button className="h-10 w-10" contentType="icon" onClick={increment} variant="neutral" >
            <Plus size={20} strokeWidth={3} />
          </Button>
        </div>
      </div>
      <div>
        <h3 class="pb-2">Time Zone</h3>
        <Combobox selected={selectedTz} options={tzOptions} />
        {#if $errors.timeZone}<p class="invalid">{$errors.timeZone}</p>{/if}
      </div>
    </div>
  </div>
</form>


<!-- For debugging in dev 
<SuperDebug data={$form} />
-->

