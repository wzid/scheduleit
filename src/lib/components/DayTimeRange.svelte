<script lang="ts">
  import { writable, get } from 'svelte/store';
  import { fly } from 'svelte/transition';
  import { Button } from '$lib';
  import type { Day, User } from '$lib/constants';
  import { shadeGradient, cn } from '$lib/utils';

  interface Props {
    users: Array<User>;
    recording: boolean;
    saveAvailability: (availabilityString: string) => void;
    cancel: () => void;
    startTime: number;
    endTime: number;
    activeUserId: string | null;
    timeline: { type: 'days'; days: Array<Day> } | { type: 'dates'; dates: Array<string> };
  }

  let {
    users,
    recording,
    saveAvailability,
    cancel,
    startTime,
    endTime,
    activeUserId,
    timeline
  }: Props = $props();

  const isDaysTimeline = timeline.type === 'days';
  const days = isDaysTimeline ? timeline.days : timeline.dates;

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

  const endTimeHour = `${endTime}:00`;
  // Generate time slots between start and end time
  function generateTimeSlots(start: number, end: number): string[] {
    const slots = [];
    for (let hour = start; hour < end; hour++) {
      for (let quarter = 0; quarter < 4; quarter++) {
        const minutes = quarter * 15;
        slots.push(`${hour}:${minutes.toString().padStart(2, '0')}`);
      }
    }
    // slots.push(`${end}:00`); // Add end time
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

  // START DRAG LOGIC
  let dragging = false;
  let dragAction = false;
  let dragStartDayIndex = -1;
  let dragStartTimeIndex = -1;
  let dragStartSnapshot: boolean[][] = [];

  function handleDragStart(e: Event, dayIndex: number, timeIndex: number) {
    if (!recording) {
      return;
    }

    e.preventDefault();

    dragging = true;
    dragStartDayIndex = dayIndex;
    dragStartTimeIndex = timeIndex;

    // save snapshot of current grid state
    dragStartSnapshot = get(selectedSlots).map((row) => [...row]);

    // if starting on a selected slot, then remove (false). otherwise, add (true)
    dragAction = $selectedSlots[dayIndex][timeIndex] ? false : true;

    // Immediately update the starting cell
    selectedSlots.update((slots) => {
      const newSlots = [...slots];

      newSlots[dayIndex] = [...newSlots[dayIndex]];
      newSlots[dayIndex][timeIndex] = dragAction;

      return newSlots;
    });
  }

  function handleDragOver(dayIndex: number, timeIndex: number) {
    if (!dragging || dragStartDayIndex === -1 || dragStartTimeIndex === -1) {
      return;
    }

    const minDay = Math.min(dragStartDayIndex, dayIndex);
    const maxDay = Math.max(dragStartDayIndex, dayIndex);

    const minTime = Math.min(dragStartTimeIndex, timeIndex);
    const maxTime = Math.max(dragStartTimeIndex, timeIndex);

    selectedSlots.set(
      dragStartSnapshot
        .map((row) => [...row])
        .map((row, day) => {
          if (day >= minDay && day <= maxDay) {
            for (let time = minTime; time <= maxTime; time++) {
              row[time] = dragAction;
            }
          }
          return row;
        })
    );
  }

  function handleTouchMove(e: TouchEvent) {
    if (!dragging) {
      return;
    }

    // prevent scrolling and other touch behaviors
    e.preventDefault();
    e.stopPropagation();

    const touch = e.touches[0];

    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!element) {
      return;
    }

    const dayIndex = parseInt(element.getAttribute('data-day-index') || '-1');
    const timeIndex = parseInt(element.getAttribute('data-time-index') || '-1');

    if (dayIndex === -1 || timeIndex === -1) {
      return;
    }

    handleDragOver(dayIndex, timeIndex);
  }

  function handleTouchStart(e: TouchEvent, dayIndex: number, timeIndex: number) {
    // prevent any default touch behaviors
    e.preventDefault();
    e.stopPropagation();
    handleDragStart(e, dayIndex, timeIndex);
  }

  function handleDragStop() {
    if (!dragging) {
      return;
    }
    dragging = dragAction = false;
    dragStartDayIndex = dragStartTimeIndex = -1;
    dragStartSnapshot = [];
  }
  // END DRAG LOGIC

  // Function to handle save (to be passed to the parent component)
  function handleSave() {
    // Set the availability string in a way your API can access it
    const availabilityString = getAvailabilityString();

    // You would set this somewhere your API call can access it
    // For example, you might store it in a variable that's in scope for your API call
    // console.log('Saving availability:', availabilityString);

    // Call the parent's saveAvailability function
    saveAvailability(availabilityString);
  }
</script>

<svelte:window
  onmouseup={handleDragStop}
  ontouchend={handleDragStop}
  ontouchmove={handleTouchMove}
  ontouchcancel={handleDragStop}
/>

<div class="flex w-fit max-w-2xl touch-none flex-col items-center">
  <div class="flex w-full justify-center py-4 pl-20">
    {#if recording}
      <div class="flex gap-2">
        <Button onClick={cancel} variant="neutral">Cancel</Button>
        <Button onClick={handleSave} variant="primary">Save</Button>
      </div>
    {/if}
  </div>

  <!-- Day labels -->
  <div class="flex w-full justify-center pl-20">
    <!-- Empty cell for time labels -->
    {#each days as day}
      <div class="w-20 text-center text-sm font-medium text-zinc-400">
        {isDaysTimeline
          ? day
          : new Date(day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
      </div>
    {/each}
  </div>

  <div class="flex">
    <!-- Time slots -->
    <div class="-mt-1 flex w-20 flex-col">
      {#each timeSlots as time, i}
        {#if i % 4 === 0}
          <!-- 36px = 9px * 4 slots -->
          <!-- we have to minus by 4 because we only display text based on the hour so we have to minus by the slots after the last hour i.e 7 oclock -->
          <div
            class={cn(
              'h-[40px] text-center text-xs leading-none text-zinc-400',
              timeSlots.length - 4 === i ? '!h-4' : ''
            )}
          >
            {formatTime(time)}
          </div>
        {/if}
      {/each}
      <div class="-mb-[4px] mt-auto text-center text-xs leading-none text-zinc-400">
        {formatTime(endTimeHour)}
      </div>
    </div>

    <!-- Actual Grid -->
    <div
      class="grid gap-x-[1px]"
      style="grid-template-columns: repeat({days.length}, minmax(0, 1fr)); grid-template-rows: repeat({timeSlots.length}, minmax(0, 1fr));"
    >
      {#each timeSlots as time, timeIndex}
        {#each days as day, dayIndex}
          {#if recording}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <!-- svelte-ignore a11y_mouse_events_have_key_events -->
            <div
              class={cn(
                isSlotSelected(dayIndex, timeIndex) ? 'bg-peach-400' : 'bg-zinc-700/70',
                'h-2.5 w-20 text-xs',
                timeIndex != 0 &&
                  (timeIndex % 4 == 0
                    ? 'border-t border-zinc-600'
                    : timeIndex % 2 == 0
                      ? 'border-t border-dotted border-zinc-600'
                      : '')
              )}
              data-day-index={dayIndex}
              data-time-index={timeIndex}
              onmousedown={(e) => handleDragStart(e, dayIndex, timeIndex)}
              onmouseover={() => handleDragOver(dayIndex, timeIndex)}
              ontouchstart={(e) => handleTouchStart(e, dayIndex, timeIndex)}
            ></div>
          {:else}
            <div
              class={cn(
                'h-2.5 w-20 text-xs',
                timeIndex != 0 &&
                  (timeIndex % 4 == 0
                    ? 'border-t border-zinc-600'
                    : timeIndex % 2 == 0
                      ? 'border-t border-dotted border-zinc-600'
                      : '')
              )}
              style="background-color: {getShade(dayIndex, timeIndex)};"
            ></div>
          {/if}
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
