<script lang="ts">
  import { writable, get } from 'svelte/store';
  import {
    DAY_ABBREVIATION_SUN_START,
    DAYS_OF_THE_WEEK,
    type DayAbbreviation,
    type User
  } from '$lib/constants';
  import { shadeGradient, cn } from '$lib/utils';
  import { innerWidth } from 'svelte/reactivity/window';
  import { formatInTimeZone } from 'date-fns-tz';
  import CheckIcon from '@lucide/svelte/icons/check';

  interface Props {
    users: Array<User>;
    recording: boolean;
    saveAvailability: (availabilityString: string) => void;
    cancel: () => void;
    startTime: number;
    endTime: number;
    activeUserId: string | null;
    timeline:
      | { type: 'days'; days: Array<DayAbbreviation> }
      | { type: 'dates'; dates: Array<string> };
    timeZone: string;
  }

  let { users, recording, startTime, endTime, activeUserId, timeline, timeZone }: Props = $props();

  // Get the user's local timezone
  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Calculate timezone offset in hours
  function calculateTimezoneOffset(sourceTimezone: string, targetTimezone: string): number {
    if (sourceTimezone === targetTimezone) {
      return 0;
    }
    // Create a reference date at noon to avoid DST issues
    const now = new Date();
    const referenceDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);

    // Format the date in both timezones and extract the hour
    const sourceHour = parseInt(formatInTimeZone(referenceDate, sourceTimezone, 'H'));
    const targetHour = parseInt(formatInTimeZone(referenceDate, targetTimezone, 'H'));

    // Calculate difference
    return targetHour - sourceHour;
  }

  // Get timezone offset between event timezone and local timezone
  const timezoneOffset = calculateTimezoneOffset(timeZone, localTimeZone);

  // Adjust start and end times based on timezone difference
  const adjustedStartTime = (startTime + timezoneOffset + 24) % 24;
  const adjustedEndTime = (endTime + timezoneOffset + 24) % 24;

  // Handle day shift for timezone differences
  // If going east (positive offset) AND crossing midnight, add a day
  // If going west (negative offset) AND crossing midnight, subtract a day
  const dayShift = (() => {
    // No day shift needed within the same timezone
    if (timezoneOffset === 0) return 0;

    // Check start time crossing day boundary
    if (timezoneOffset > 0) {
      // Moving east (e.g., NY to London)
      return startTime + timezoneOffset >= 24 ? 1 : 0;
    } else {
      // Moving west (e.g., London to NY)
      return startTime + timezoneOffset < 0 ? -1 : 0;
    }
  })();

  const isDaysTimeline = timeline.type === 'days';
  let days = isDaysTimeline ? timeline.days : timeline.dates;

  // Shift days if needed for timezone adjustment (only for day-based events)
  if (isDaysTimeline && dayShift !== 0) {
    const dayAbbreviations = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'] as DayAbbreviation[];

    // Adjust each day based on the day shift
    days = days.map((day) => {
      const currentIndex = dayAbbreviations.indexOf(day as DayAbbreviation);
      const newIndex = (currentIndex + dayShift + 7) % 7; // Add 7 to handle negative shifts
      return dayAbbreviations[newIndex];
    });
  } else if (!isDaysTimeline && dayShift !== 0) {
    // For date-based timelines, adjust the actual dates
    days = days.map((dateStr) => {
      const date = new Date(dateStr);
      date.setDate(date.getDate() + dayShift);
      return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    });
  }

  const numberOfTimeSlots =
    (adjustedEndTime > adjustedStartTime
      ? adjustedEndTime - adjustedStartTime
      : adjustedEndTime + 24 - adjustedStartTime) * 4; // 4 slots per hour (15 min intervals)

  // if the window width is less than 768px, we want to return 4
  // otherwise, we want to return 7
  let chunkSize = $derived((innerWidth.current ?? 1080) < 768 ? 3 : 7);

  function getChunkedDays(): Array<Array<DayAbbreviation | string>> {
    // split the days into chunks of 7
    const chunks: Array<Array<DayAbbreviation | string>> = [];
    for (let i = 0; i < days.length; i += chunkSize) {
      // we can do out of bounds cause slice only extends to the end of the array
      chunks.push(days.slice(i, i + chunkSize));
    }
    return chunks;
  }

  function getDayIndex(chunkIndex: number, dayIndex: number): number {
    return chunkIndex * chunkSize + dayIndex;
  }

  const chunkedDays = $derived(getChunkedDays());

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
    if (time === '24:00') {
      time = '23:59';
    }
    const [hour, minute] = time.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  }

  const endTimeHour = adjustedEndTime === 0 ? '24:00' : `${adjustedEndTime}:00`;

  // Generate time slots between start and end time
  function generateTimeSlots(start: number, end: number): string[] {
    const slots = [];
    // Ensure we handle the case where end time is before start time (crossing midnight)
    const hours = end > start ? end - start : end + 24 - start;

    for (let i = 0; i < hours; i++) {
      const hour = (start + i) % 24;
      for (let quarter = 0; quarter < 4; quarter++) {
        const minutes = quarter * 15;
        slots.push(`${hour}:${minutes.toString().padStart(2, '0')}`);
      }
    }
    return slots;
  }

  const timeSlots = generateTimeSlots(adjustedStartTime, adjustedEndTime);

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

  const shades = $derived(shadeGradient(users.length));

  // Prepare availability string based on selected slots
  export function getAvailabilityString(): string {
    const availabilityArray = get(selectedSlots).map((daySlots) => {
      return daySlots.map((selected) => (selected ? '1' : '0')).join('');
    });

    return availabilityArray.join(',');
  }

  function getShade(dayIndex: number, timeIndex: number): string {
    const usersForSlot = getUsersForSlot(dayIndex, timeIndex);
    // Ensure we don't exceed the shades array length
    const index = Math.min(usersForSlot.length, shades.length - 1);
    return shades[index];
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

  function convertTo12HourFormat(time: string): string {
    const [hour, minute] = time.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  }

  function parseDay(dateString: string): string {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return formatted;
  }

  function parseDayAsDate(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed
  }

  function getDateAndTimeString(dayIndex: number, timeIndex: number): string {
    const time = convertTo12HourFormat(timeSlots[timeIndex]);
    if (isDaysTimeline) {
      return `${DAYS_OF_THE_WEEK[days[dayIndex] as DayAbbreviation]} ${time}`;
    }

    return `${parseDay(days[dayIndex])} ${time}`;
  }
</script>

<svelte:window
  onmouseup={handleDragStop}
  ontouchend={handleDragStop}
  ontouchmove={handleTouchMove}
  ontouchcancel={handleDragStop}
/>

<div class="flex w-full max-w-2xl flex-col items-center md:w-fit">
  <!-- Main outer loop -->
  <div class="flex w-full flex-col gap-6">
    {#each chunkedDays as chunk, chunkIndex}
      <!-- Outer div -->
      <div class={cn('w-fit', recording && 'touch-none')}>
        <!-- Day labels -->
        <div class="flex w-full justify-center gap-[1px] pb-1 pl-16 md:pl-20">
          <!-- Empty cell for time labels -->
          {#each chunk as day}
            <div
              class="flex w-20 flex-col items-center justify-center text-center text-sm font-medium text-zinc-400"
            >
              <p class="text-xs leading-none">
                {!isDaysTimeline ? DAY_ABBREVIATION_SUN_START[parseDayAsDate(day).getDay()] : ''}
              </p>
              <p>
                {isDaysTimeline ? day : parseDay(day as string)}
              </p>
            </div>
          {/each}
        </div>

        <div class="flex">
          <!-- Time slots -->
          <div class="-mt-1 flex w-16 flex-col md:w-20">
            {#each timeSlots as time, i}
              {#if i % 4 === 0}
                <!-- 36px = 9px * 4 slots -->
                <!-- we have to minus by 4 because we only display text based on the hour so we have to minus by the slots after the last hour i.e 7 oclock -->
                <div
                  class={cn(
                    'h-[40px] text-xs leading-none text-zinc-400 md:text-center',
                    timeSlots.length - 4 === i ? '!h-4' : ''
                  )}
                >
                  {formatTime(time)}
                </div>
              {/if}
            {/each}
            <div class="-mb-[4px] mt-auto text-xs leading-none text-zinc-400 md:text-center">
              {formatTime(endTimeHour)}
            </div>
          </div>

          <!-- Actual Grid -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="grid gap-x-[1px]"
            style="grid-template-columns: repeat({chunk.length}, minmax(0, 1fr)); grid-template-rows: repeat({timeSlots.length}, minmax(0, 1fr));"
          >
            {#each timeSlots as _timeSlot, timeIndex}
              {#each chunk as _day, dayIndex}
                {#if recording}
                  <!-- svelte-ignore a11y_click_events_have_key_events -->
                  <!-- svelte-ignore a11y_no_static_element_interactions -->
                  <!-- svelte-ignore a11y_mouse_events_have_key_events -->
                  <div
                    class={cn(
                      isSlotSelected(getDayIndex(chunkIndex, dayIndex), timeIndex)
                        ? 'bg-peach-400'
                        : 'bg-zinc-700/70',
                      'h-2.5 w-20 text-xs',
                      timeIndex != 0 &&
                        (timeIndex % 4 == 0
                          ? 'border-t border-zinc-600'
                          : timeIndex % 2 == 0
                            ? 'border-t border-dotted border-zinc-600'
                            : '')
                    )}
                    data-day-index={getDayIndex(chunkIndex, dayIndex)}
                    data-time-index={timeIndex}
                    onmousedown={(e) =>
                      handleDragStart(e, getDayIndex(chunkIndex, dayIndex), timeIndex)}
                    onmouseover={() => handleDragOver(getDayIndex(chunkIndex, dayIndex), timeIndex)}
                    ontouchstart={(e) =>
                      handleTouchStart(e, getDayIndex(chunkIndex, dayIndex), timeIndex)}
                  ></div>
                {:else}
                  {@const slotBackgroundColor = getShade(
                    getDayIndex(chunkIndex, dayIndex),
                    timeIndex
                  )}
                  {@const slotDateTimeString = getDateAndTimeString(dayIndex, timeIndex)}
                  {@const slotAvailableUsers = getUsersForSlot(dayIndex, timeIndex)}

                  <!-- svelte-ignore a11y_no_static_element_interactions -->
                  <!-- svelte-ignore a11y_mouse_events_have_key_events -->
                  <div
                    style="background-color: {slotBackgroundColor}"
                    class={cn(
                      'group relative h-2.5 w-20 text-xs transition-colors hover:bg-opacity-75',
                      timeIndex != 0 &&
                        (timeIndex % 4 == 0
                          ? 'border-t border-zinc-600'
                          : timeIndex % 2 == 0
                            ? 'border-t border-dotted border-zinc-600'
                            : '')
                    )}
                  >
                    <div class="absolute hidden size-full bg-black/20 group-hover:block"></div>
                    <div
                      class="pointer-events-none absolute left-1/2 top-6 z-10 hidden -translate-x-1/2 whitespace-nowrap group-hover:block"
                    >
                      <div
                        class="grid select-none gap-0.5 rounded-lg bg-zinc-700/65 px-2 py-1 text-sm text-zinc-300 shadow-lg backdrop-blur-sm"
                      >
                        <div>
                          <p class="font-semibold text-white">{slotDateTimeString}</p>
                          <p>{slotAvailableUsers.length}/{users.length} available</p>
                        </div>
                        <ul>
                          {#each slotAvailableUsers as availableUser}
                            <li class="flex items-center gap-1">
                              <CheckIcon class="-mb-0.5 size-4 text-green-400" />
                              {availableUser.name}
                            </li>
                          {/each}
                        </ul>
                      </div>
                    </div>
                  </div>
                {/if}
              {/each}
            {/each}
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>
