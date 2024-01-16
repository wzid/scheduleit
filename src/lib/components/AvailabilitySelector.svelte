<script lang="ts">
  import { TIMES } from '$lib/constants';
  import { cn } from '$lib/utils';

  const HOURS = 24;
  const BLOCKS_PER_SEGMENT = 4;

  // create a map from index to a boolean if it is selected (initially all false)
  const selectionMap = new Map<number, boolean>(
    Array(HOURS * BLOCKS_PER_SEGMENT)
      .fill(0)
      .map((_, i) => [i, false])
  );

  let dragStartIdx = -1;
  let dragEndIdx = -1;
  let dragging = false;
  let removing = false;
  let count = 0;

  const getBlockIdx = (i: number, j: number) => i * BLOCKS_PER_SEGMENT + j;

  const isBlockSelected = (i: number, j: number) => {
    const blockIdx = getBlockIdx(i, j);

    // I wouldnt simplify this, it's easier to read this way
    if (dragging) {
      let inDragRange: boolean =
        (dragStartIdx <= blockIdx && blockIdx <= dragEndIdx) ||
        (dragEndIdx <= blockIdx && blockIdx <= dragStartIdx);
      if (removing) {
        if (inDragRange) {
          return false;
        } else {
          return selectionMap.get(blockIdx);
        }
      } else {
        return inDragRange || selectionMap.get(blockIdx);
      }
    } else {
      return selectionMap.get(blockIdx);
    }
  };

  const fixSelection = () => {
    if (dragEndIdx < dragStartIdx) {
      const temp = dragStartIdx;
      dragStartIdx = dragEndIdx;
      dragEndIdx = temp;
    }
  };

  const handleDragStart = (i: number, j: number) => {
    dragging = true;
    dragStartIdx = getBlockIdx(i, j);
    removing = selectionMap.get(dragStartIdx) ?? false;
    count++;
  };

  const handleDragOver = (i: number, j: number) => {
    if (!dragging) return;
    dragEndIdx = getBlockIdx(i, j);
    count++;
  };

  const handleDragStop = () => {
    if (!dragging) return;
    fixSelection();
    dragging = false;
    for (let i = dragStartIdx; i <= dragEndIdx; i++) {
      selectionMap.set(i, !removing);
    }
    removing = false;
    count = 0;
  };
</script>

<svelte:body on:mouseup={handleDragStop} />

<h3>
  selected:
  {dragStartIdx === -1 || dragEndIdx === -1
    ? 'waiting...'
    : `${TIMES[dragStartIdx]} - ${TIMES[(dragEndIdx + 1) % TIMES.length]}`}
</h3>

<div class="divide-y divide-zinc-900">
  {#each Array(HOURS) as _, i}
    <div>
      {#each Array(BLOCKS_PER_SEGMENT) as _, j}
        {#key count}
          <!-- figure out accessibility later -->
          <!-- svelte-ignore a11y-no-static-element-interactions a11y-mouse-events-have-key-events -->
          <div
            on:mousedown={() => handleDragStart(i, j)}
            on:mouseover={() => handleDragOver(i, j)}
            class={cn(
              'h-[.4rem] w-32 bg-zinc-800/80 transition-colors duration-100',
              isBlockSelected(i, j) ? 'bg-peach-200' : 'hover:bg-zinc-700'
            )}
          />
        {/key}
      {/each}
    </div>
  {/each}
</div>
