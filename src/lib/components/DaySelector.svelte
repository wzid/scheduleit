<script lang="ts">
  import { DAYS_OF_THE_WEEK, type Day } from '$lib/constants';
  import { cn } from '$lib/utils';
  import { Check } from 'lucide-svelte';
  import { get, type Writable } from 'svelte/store';

  // create a map from the day to the selected state
  const daysSelected: Map<Readonly<string>, boolean> = new Map(
    DAYS_OF_THE_WEEK.map((day) => [day, false])
  );

  export let value: Writable<Day[]>;
  let dragStartIdx = -1;
  let dragEndIdx = -1;
  let dragging = false;
  let removing = false;
  let count = 0;

  const values = get(value);
  for (let i = 0; i < values.length; i++) {
    daysSelected.set(values[i], true);
  }

  const isBlockSelected = (i: number) => {
    if (dragging) {
      let inDragRange: boolean =
        (dragStartIdx <= i && i <= dragEndIdx) || (dragEndIdx <= i && i <= dragStartIdx);
      if (removing) {
        if (inDragRange) {
          return false;
        } else {
          return daysSelected.get(DAYS_OF_THE_WEEK[i]);
        }
      } else {
        return inDragRange || daysSelected.get(DAYS_OF_THE_WEEK[i]);
      }
    } else {
      return daysSelected.get(DAYS_OF_THE_WEEK[i]);
    }
  };

  const fixSelection = () => {
    if (dragEndIdx < dragStartIdx) {
      const temp = dragStartIdx;
      dragStartIdx = dragEndIdx;
      dragEndIdx = temp;
    }
  };

  const handleDragStart = (i: number) => {
    dragging = true;
    dragStartIdx = i;
    removing = daysSelected.get(DAYS_OF_THE_WEEK[i]) ?? false;
    count++;
  };

  const handleDragOver = (i: number) => {
    if (!dragging) return;
    dragEndIdx = i;
    count++;
  };

  const handleDragStop = () => {
    if (!dragging) return;
    fixSelection();
    dragging = false;
    for (let i = dragStartIdx; i <= dragEndIdx; i++) {
      daysSelected.set(DAYS_OF_THE_WEEK[i], !removing);
    }

    const days: Day[] = [];
    for (let i = 0; i < daysSelected.size; i++) {
      const day = DAYS_OF_THE_WEEK[i];
      if (daysSelected.get(day)) {
        days.push(day);
      }
    }
    value.set(days);

    removing = false;
    count = 0;
  };

  const boxClassNames: Record<string, string> = {
    M: 'rounded-bl-lg',
    Su: 'rounded-br-lg'
  };
</script>

<svelte:body on:mouseup={handleDragStop} />

<div class="rounded-lg bg-zinc-800/80">
  <div class="flex justify-between text-lg font-semibold">
    {#each DAYS_OF_THE_WEEK as day}
      <span class="w-full text-center">{day}</span>
    {/each}
  </div>
  <div class="flex justify-between gap-1">
    {#each DAYS_OF_THE_WEEK as day, i}
      {#key count}
        <!-- svelte-ignore a11y-no-static-element-interactions a11y-mouse-events-have-key-events -->
        <button
          type="button"
          on:mousedown={() => handleDragStart(i)}
          on:mouseover={() => handleDragOver(i)}
          class={cn(
            'h-10 w-10 shrink-0 transition-colors duration-100 hover:opacity-80',
            isBlockSelected(i) ? 'bg-peach-200' : 'bg-zinc-700',
            boxClassNames[day]
          )}
        >
          <Check
            strokeWidth={3}
            class={cn('mx-auto h-6 w-6 text-peach-900', isBlockSelected(i) ? 'block' : 'hidden')}
          />
        </button>
      {/key}
    {/each}
  </div>
</div>
