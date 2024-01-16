<script lang="ts">
  import { createSlider, melt, type CreateSliderProps } from '@melt-ui/svelte';
  import { cn } from '$lib/utils';

  export let className: string = '';
  export let value: CreateSliderProps['value'];

  // Make sure you don't select the same hour twice
  const handleChange: CreateSliderProps['onValueChange'] = ({ curr, next }) => {
    if (next[0] == next[1]) {
      const index = next[0];
      if (index + 1 < 24) {
        next[1] = index + 1;
      } else {
        next[0] = index - 1;
      }
    }
    return next;
  };

  const {
    elements: { root, range, thumbs, ticks }
  } = createSlider({
    value,
    min: 0,
    max: 24,
    step: 1,
    onValueChange: handleChange
  });
</script>

<div class="relative w-full rounded-xl bg-zinc-800/80 px-3">
  <span use:melt={$root} class={cn(className, 'relative flex h-[20px] w-full items-center')}>
    <span use:melt={$range} class="h-2 bg-peach-200" />
    {#each $ticks as tick, i}
      <span use:melt={tick} class="h-1 w-1 rounded-full bg-zinc-500 data-[bounded]:bg-peach-700/75" />
      {#if i % 3 == 0}
        {#if i == 0}
          <span use:melt={tick} class="!-left-[.4rem] top-6 text-zinc-500"> 12 </span>
        {:else if i == 24}
          <span use:melt={tick} class="!-right-[.6rem] top-6 text-zinc-500"> 12 </span>
        {:else}
          <span use:melt={tick} class="top-6 text-zinc-500">
            {#if i <= 12}
              {i}
            {:else}
              {i - 12}
            {/if}
          </span>
        {/if}
      {/if}
    {/each}
    {#each $thumbs as thumb}
      <span
        use:melt={thumb}
        class="h-5 w-5 rounded-full bg-peach-200 shadow focus:ring-4 focus:!ring-black/40"
      />
    {/each}
  </span>
</div>
