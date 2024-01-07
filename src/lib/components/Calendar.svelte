<script lang="ts">
  import { createCalendar, melt, type CreateCalendarProps } from '@melt-ui/svelte';
  import { cn } from '$lib/utils';
  import { ChevronLeft, ChevronRight } from 'lucide-svelte';

  export let className: string | undefined = undefined;
  export let value: CreateCalendarProps<true>['value'];

  const {
    elements: { calendar, heading, grid, cell, prevButton, nextButton },
    states: { months, headingValue, weekdays },
    helpers: { isDateDisabled, isDateUnavailable }
  } = createCalendar({ value, multiple: true });
</script>

<div use:melt={$calendar} class={cn(className)}>
  <header>
    <button use:melt={$prevButton}>
      <ChevronLeft size={24} />
    </button>
    <div use:melt={$heading}>
      {$headingValue}
    </div>
    <button use:melt={$nextButton}>
      <ChevronRight size={24} />
    </button>
  </header>
  <div>
    {#each $months as month}
      <table use:melt={$grid}>
        <thead aria-hidden="true">
          <tr>
            {#each $weekdays as day}
              <th>
                <div>
                  {day}
                </div>
              </th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each month.weeks as weekDates}
            <tr>
              {#each weekDates as date}
                <td
                  role="gridcell"
                  aria-disabled={$isDateDisabled(date) || $isDateUnavailable(date)}
                >
                  <div use:melt={$cell(date, month.value)}>
                    {date.day}
                  </div>
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    {/each}
  </div>
</div>

<style lang="postcss">
  [data-melt-calendar] {
    @apply rounded-lg bg-zinc-800/80 p-3 text-white shadow-sm;
  }

  header {
    @apply flex items-center justify-between pb-2 text-xs sm:text-base;
  }

  header + div {
    @apply flex flex-col items-start gap-6 sm:flex-row;
  }

  .pagnation-button {
    @apply rounded-lg p-1 transition-all hover:bg-peach-400/20;
  }

  [data-melt-calendar-prevbutton] {
    @apply pagnation-button;
  }

  [data-melt-calendar-nextbutton] {
    @apply pagnation-button;
  }

  [data-melt-calendar-prevbutton][data-disabled] {
    @apply pointer-events-none rounded-lg p-1 opacity-40;
  }

  [data-melt-calendar-nextbutton][data-disabled] {
    @apply pointer-events-none rounded-lg p-1 opacity-40;
  }

  [data-melt-calendar-heading] {
    @apply font-semibold;
  }

  thead {
    @apply text-zinc-500;
  }

  tbody td {
    @apply py-0.5;
  }

  th {
    @apply text-sm font-semibold;

    & div {
      @apply flex h-6 w-6 items-center justify-center p-4;
    }
  }

  [data-melt-calendar-grid] {
    @apply w-full;
  }

  [data-melt-calendar-cell] {
    @apply flex h-6 w-6 cursor-pointer select-none items-center justify-center rounded-lg p-4 hover:bg-peach-400/20 focus:ring-2 focus:ring-peach-300/90;
  }

  [data-melt-calendar-cell][data-disabled] {
    @apply pointer-events-none opacity-40;
  }

  [data-melt-calendar-cell][data-unavailable] {
    @apply pointer-events-none text-red-400 line-through;
  }

  [data-melt-calendar-cell][data-selected] {
    @apply bg-peach-200 text-peach-900 transition-colors;
  }

  [data-melt-calendar-cell][data-outside-visible-months] {
    @apply pointer-events-none cursor-default opacity-40 hover:bg-transparent;
  }

  [data-melt-calendar-cell][data-outside-month] {
    @apply pointer-events-none cursor-default opacity-0 hover:bg-transparent;
  }
</style>
