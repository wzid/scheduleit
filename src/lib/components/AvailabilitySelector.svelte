<script lang="ts">
  import { TIMES } from '$lib/constants';
  import { cn } from '$lib/utils';

  const SEGMENTS = 24;
  const BLOCKS_PER_SEGMENT = 4;

  let dragStartIdx = -1;
  let dragEndIdx = -1;
  let dragging = false;
  let count = 0;

  const getBlockIdx = (i: number, j: number) => i * BLOCKS_PER_SEGMENT + j;

  const isBlockSelected = (i: number, j: number) => {
    const blockIdx = getBlockIdx(i, j);
    return (
      (dragStartIdx <= blockIdx && blockIdx <= dragEndIdx) ||
      (dragEndIdx <= blockIdx && blockIdx <= dragStartIdx)
    );
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
    console.log('drag complete', dragStartIdx, 'to', dragEndIdx);
    dragging = false;
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

<div class="divide-y divide-transparent">
  {#each Array(SEGMENTS) as _, i}
    <div>
      {#each Array(BLOCKS_PER_SEGMENT) as _, j}
        {#key count}
          <!-- figure out accessibility later -->
          <!-- svelte-ignore a11y-no-static-element-interactions a11y-mouse-events-have-key-events -->
          <div
            on:mousedown={() => handleDragStart(i, j)}
            on:mouseover={() => handleDragOver(i, j)}
            class={cn(
              'h-1 w-32 bg-zinc-800 transition-colors',
              isBlockSelected(i, j) ? 'bg-peach-200' : 'hover:bg-zinc-700'
            )}
          />
        {/key}
      {/each}
    </div>
  {/each}
</div>
