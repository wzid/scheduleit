<script lang="ts">
  import { DAYS_OF_THE_WEEK, type Day } from '$lib/constants';
  import { cn } from '$lib/utils';
  import { get, type Writable } from 'svelte/store';

  // create a map from the day to the selected state
  const daysSelected: Map<Readonly<string>, boolean> = new Map(
    DAYS_OF_THE_WEEK.map((day) => [day, false])
  );

  interface Props {
    value: Writable<Day[]>;
  }

  let { value }: Props = $props();
  let dragStartIdx = -1;
  let dragEndIdx = $state(-1);
  let lastDragOverIdx = -1;

  let dragging = false;
  let removing = false;
  let touching = $state(false);
  let count = $state(0);

  const updateDays = (days: Day[]) => {
    daysSelected.forEach((_, key) => daysSelected.set(key, false));
    days.forEach((day) => daysSelected.set(day, true));
    count++;
  };

  updateDays(get(value));
  value.subscribe(updateDays);

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
    if (!dragging || lastDragOverIdx === i) return;
    lastDragOverIdx = i;
    dragEndIdx = i;
    count++;
  };

  const handleDragStop = () => {
    if (!dragging) return;
    fixSelection();
    dragging = false;
    lastDragOverIdx = -1;
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
  };
</script>

<svelte:body
  onmouseup={() => {
    if (touching) return;
    handleDragStop();
  }}
/>

<div class="rounded-lg bg-zinc-800 overflow-hidden">
  {#key count}
    <div class="flex flex-wrap">
      {#each DAYS_OF_THE_WEEK as day, i}
        <!-- svelte-ignore a11y_no_static_element_interactions, a11y_mouse_events_have_key_events -->
        <button
          type="button"
          onmousedown={() => {
            if (touching) return;
            handleDragStart(i);
          }}
          onmouseover={() => {
            if (touching) return;
            handleDragOver(i);
          }}
          ontouchstart={() => {
            touching = true;
            handleDragStart(i);
            dragEndIdx = i;
            handleDragStop();
          }}
          class={cn(
            'relative flex flex-col items-center justify-center w-[14.28%] py-3 transition-all duration-150',
            isBlockSelected(i) 
              ? 'bg-peach-200' 
              : 'bg-zinc-800 hover:bg-zinc-700'
          )}
        >
          <span class={cn(
            'font-semibold mb-1',
            isBlockSelected(i) ? 'text-peach-900' : 'text-zinc-400'
          )}>
            {day}
          </span>
          <div class={cn(
            'w-2 h-2 rounded-full transition-all duration-150',
            isBlockSelected(i) 
              ? 'bg-peach-900 scale-100' 
              : 'bg-zinc-600 scale-75 opacity-50'
          )}></div>
          <div class={cn(
            'absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-150',
            isBlockSelected(i) ? 'bg-peach-300' : 'bg-transparent'
          )}></div>
        </button>
      {/each}
    </div>
  {/key}
</div>

