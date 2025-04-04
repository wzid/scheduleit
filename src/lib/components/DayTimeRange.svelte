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

  const numberOfTimeSlots = (endTime - startTime + 1) * 4; // 4 slots per hour (15 min intervals)

  // Store for selected time slots
  // Format will be a 2D array: [dayIndex][timeIndex]
  const selectedSlots = writable<boolean[][]>(days.map(() => Array(numberOfTimeSlots).fill(false)));

  // Initialize from active user's availability if it exists
  $effect(() => {
    if (activeUserId && recording) {
      // Find the active user and set their availability
      const activeUser = users.find((user) => user.id === activeUserId);
      if (activeUser?.availability) {
        const dayAvailabilities = activeUser.availability.split(',');
        const newSelectedSlots = days.map((_, dayIndex) => {
          const dayAvailability = dayAvailabilities[dayIndex] || '';
          return Array(numberOfTimeSlots)
            .fill(false)
            .map((_, timeIndex) => {
              return dayAvailability[timeIndex] === '1';
            });
        });
        selectedSlots.set(newSelectedSlots);
      } else {
        // Reset to all false if no availability
        selectedSlots.set(days.map(() => Array(numberOfTimeSlots).fill(false)));
      }
    }
  });

  // Convert 24h time to display format (12h with am/pm)
  function formatTime(time: string): string {
    const [hour, minute] = time.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  }

  // Generate time slots between start and end time
  function generateTimeSlots(start: number, end: number): string[] {
    const slots = [];
    for (let hour = start; hour <= end; hour++) {
      for (let quarter = 0; quarter < 4; quarter++) {
        const minutes = quarter * 15;
        slots.push(`${hour}:${minutes.toString().padStart(2, '0')}`);
      }
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
    return $selectedSlots[dayIndex][timeIndex];
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

  function getShade(dayIndex: number, timeIndex: number): string {
    const usersForSlot = getUsersForSlot(dayIndex, timeIndex);
    const userCount = usersForSlot.length;
    return shades[userCount] || '#fff';
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

<div class="flex flex-col items-center w-fit max-w-2xl">
  <div class="mb-4 flex items-center justify-between">
    {#if recording}
      <div class="flex gap-2">
        <Button onClick={cancel} variant="neutral">Cancel</Button>
        <Button onClick={handleSave} variant="primary">Save</Button>
      </div>
    {/if}
  </div>

  <!-- Day labels -->
  <div class="flex w-full pl-20">
    <!-- Empty cell for time labels -->
    {#each days as day, i}
      <div class="text-center text-sm font-medium text-zinc-400 w-20">{day}</div>
    {/each}
  </div>

  <div class="flex">
    <!-- Time slots -->
    <div class="flex w-20 flex-col justify-start">
      {#each timeSlots as time, i}
        {#if i % 4 === 0}
          <!-- 36px = 9px * 4 slots -->
          <div class="h-[36px] text-center text-xs leading-none text-zinc-400">
            {formatTime(time)}
          </div>
        {/if}
      {/each}
    </div>

    <!-- Actual Grid -->
    <div
      class="grid gap-x-[1px]"
      style="grid-template-columns: repeat({days.length}, minmax(0, 1fr)); grid-template-rows: repeat({timeSlots.length}, minmax(0, 1fr));"
    >
      {#each timeSlots as time, timeIndex}
        {#each days as day, dayIndex}
          <div
            class={cn(
              'w-20 h-[9px] text-xs',
              timeIndex != 0 &&
                (timeIndex % 4 == 0
                  ? 'border-t border-zinc-600'
                  : timeIndex % 2 == 0
                    ? 'border-t border-dotted border-zinc-600'
                    : '')
            )}
            style="background-color: {getShade(dayIndex, timeIndex)};"
          ></div>
        {/each}
      {/each}
    </div>
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
