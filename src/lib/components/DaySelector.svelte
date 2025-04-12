<script lang="ts">
  import { DAY_ABBREVIATIONS, type DayAbbreviation } from '$lib/constants';
  import { cn } from '$lib/utils';
  import { get, type Writable } from 'svelte/store';

  // create a map from the day to the selected state
  const daysSelected: Map<Readonly<string>, boolean> = new Map(
    DAY_ABBREVIATIONS.map((day) => [day, false])
  );

  interface Props {
    value: Writable<DayAbbreviation[]>;
  }

  let { value }: Props = $props();
  let dragStartIdx = -1;
  let dragEndIdx = $state(-1);
  let lastDragOverIdx = -1;

  let dragging = false;
  let removing = false;
  let touching = $state(false);
  let count = $state(0);

  const updateDays = (days: DayAbbreviation[]) => {
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
          return daysSelected.get(DAY_ABBREVIATIONS[i]);
        }
      } else {
        return inDragRange || daysSelected.get(DAY_ABBREVIATIONS[i]);
      }
    } else {
      return daysSelected.get(DAY_ABBREVIATIONS[i]);
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
    removing = daysSelected.get(DAY_ABBREVIATIONS[i]) ?? false;
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
      daysSelected.set(DAY_ABBREVIATIONS[i], !removing);
    }

    const days: DayAbbreviation[] = [];
    for (let i = 0; i < daysSelected.size; i++) {
      const day = DAY_ABBREVIATIONS[i];
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

<div class="overflow-hidden rounded-lg bg-zinc-800">
  {#key count}
    <div class="flex flex-wrap">
      {#each DAY_ABBREVIATIONS as day, i}
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
            'relative flex w-[14.28%] flex-col items-center justify-center py-3 transition-all duration-150',
            isBlockSelected(i) ? 'bg-peach-200' : 'bg-zinc-800 hover:bg-zinc-700'
          )}
        >
          <span
            class={cn(
              'mb-1 font-semibold',
              isBlockSelected(i) ? 'text-peach-900' : 'text-zinc-400'
            )}
          >
            {day}
          </span>
          <div
            class={cn(
              'h-2 w-2 rounded-full transition-all duration-150',
              isBlockSelected(i) ? 'scale-100 bg-peach-900' : 'scale-75 bg-zinc-600 opacity-50'
            )}
          ></div>
          <div
            class={cn(
              'absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-150',
              isBlockSelected(i) ? 'bg-peach-300' : 'bg-transparent'
            )}
          ></div>
        </button>
      {/each}
    </div>
  {/key}
</div>
