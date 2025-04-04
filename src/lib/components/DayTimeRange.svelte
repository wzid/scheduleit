<script lang="ts">
  import { writable, get } from 'svelte/store';
  import { fly } from 'svelte/transition';
  import { Button } from '$lib';
  import type { Day, User } from '$lib/constants';
  import { shadeGradient, cn } from '$lib/utils';

  interface Props {
    users: Array<User>;
    recording: boolean;
    saveAvailability: () => void;
    cancel: () => void;
    startTime: number;
    endTime: number;
    activeUserId: string | null;
    days: Array<Day>;
  }

  let {
    users,
    recording,
    saveAvailability,
    cancel,
    startTime,
    endTime,
    activeUserId,
    days
  }: Props = $props();

  // Store for selected time slots
  // Format will be a 2D array: [dayIndex][timeIndex]
  const selectedSlots = writable<boolean[][]>(
    days.map(() => Array(endTime - startTime + 1).fill(false))
  );

  // Initialize from active user's availability if it exists
  $effect(() => {
    console.log(activeUserId, recording);
    if (activeUserId && recording) {
      // Find the active user and set their availability
      const activeUser = users.find((user) => user.id === activeUserId);
      if (activeUser?.availability) {
        const dayAvailabilities = activeUser.availability.split(',');
        const newSelectedSlots = days.map((_, dayIndex) => {
          const dayAvailability = dayAvailabilities[dayIndex] || '';
          return Array(endTime - startTime + 1)
            .fill(false)
            .map((_, timeIndex) => {
              return dayAvailability[timeIndex] === '1';
            });
        });
        console.log(newSelectedSlots);
        selectedSlots.set(newSelectedSlots);
      } else {
        // Reset to all false if no availability
        selectedSlots.set(days.map(() => Array(endTime - startTime + 1).fill(false)));
      }
    }
  });

  // Convert 24h time to display format (12h with am/pm)
  function formatTime(hour: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour} ${period}`;
  }

  // Generate time slots between start and end time
  function generateTimeSlots(start: number, end: number): number[] {
    const slots = [];
    for (let i = start; i <= end; i++) {
      slots.push(i);
    }
    return slots;
  }

  const timeSlots = generateTimeSlots(startTime, endTime);

  // Toggle time slot selection
  function toggleTimeSlot(dayIndex: number, timeIndex: number) {
    if (!recording) return;

    selectedSlots.update((slots) => {
      const newSlots = [...slots];
      newSlots[dayIndex] = [...newSlots[dayIndex]];
      newSlots[dayIndex][timeIndex] = !newSlots[dayIndex][timeIndex];
      return newSlots;
    });
  }

  // Check if a time slot is selected
  function isSlotSelected(dayIndex: number, timeIndex: number): boolean {
    return get(selectedSlots)[dayIndex][timeIndex];
  }

  // Get users available for a specific time slot
  function getUsersForSlot(dayIndex: number, timeIndex: number): User[] {
    return users.filter((user) => {
      if (!user.availability) return false;

      const dayAvailabilities = user.availability.split(',');
      const dayAvailability = dayAvailabilities[dayIndex] || '';
      return dayAvailability[timeIndex] === '1';
    });
  }

  const shades = shadeGradient(users.length);

  // Prepare availability string based on selected slots
  function getAvailabilityString(): string {
    const availabilityArray = get(selectedSlots).map((daySlots) => {
      return daySlots.map((selected) => (selected ? '1' : '0')).join('');
    });

    return availabilityArray.join(',');
  }

  // Function to handle save (to be passed to the parent component)
  function handleSave() {
    // Set the availability string in a way your API can access it
    const availabilityString = getAvailabilityString();

    // You would set this somewhere your API call can access it
    // For example, you might store it in a variable that's in scope for your API call
    console.log('Saving availability:', availabilityString);

    // Call the parent's saveAvailability function
    saveAvailability();
  }
</script>

<div class="w-full max-w-2xl">
  <div class="mb-4 flex items-center justify-between">
    <h3 class="text-xl font-medium text-zinc-300">Select your availability</h3>
    {#if recording}
      <div class="flex gap-2">
        <Button onClick={cancel} variant="neutral">Cancel</Button>
        <Button onClick={handleSave} variant="primary">Save</Button>
      </div>
    {/if}
  </div>

  <!-- Day labels -->
  <div class="grid" style="grid-template-columns: 60px repeat({days.length}, 1fr);">
    <div class="text-center"></div>
    <!-- Empty cell for time labels -->
    {#each days as day, i}
      <div class="text-center text-sm font-medium text-zinc-400">{day}</div>
    {/each}
  </div>

  <!-- Time slots and availability grid -->
  <div class="grid" style="grid-template-columns: 60px repeat({days.length}, 1fr); gap: 2px;">
    {#each timeSlots as time, timeIndex}
      <div class="flex items-center justify-end pr-2 text-xs text-zinc-500">
        {formatTime(time)}
      </div>

      {#if recording}
        {#each days as day, dayIndex}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class={cn(
              'flex h-8 items-center justify-center rounded-md transition-colors duration-150 cursor-pointer hover:brightness-125',
              isSlotSelected(dayIndex, timeIndex) ? 'bg-peach-700' : 'bg-zinc-800'
            )}
            onclick={() => toggleTimeSlot(dayIndex, timeIndex)}
          >
          </div>
        {/each}
      {:else}
        {#each days as day, dayIndex}
          <div
            class="flex h-8 items-center justify-center rounded-md transition-colors duration-150"
            style="background-color: {shades[getUsersForSlot(dayIndex, timeIndex).length]};"
          >
            {#if getUsersForSlot(dayIndex, timeIndex).length > 0}
              <span class="text-xs font-medium text-white">
                {getUsersForSlot(dayIndex, timeIndex).length}/{users.length}
              </span>
            {/if}
          </div>
        {/each}
      {/if}
    {/each}
  </div>

  {#if recording}
    <div class="mt-4" transition:fly={{ y: 20, duration: 200 }}>
      <p class="text-sm text-zinc-400">
        Click on individual time slots to toggle your availability. Blue cells indicate slots where
        others are available.
      </p>
    </div>
  {/if}
</div>
