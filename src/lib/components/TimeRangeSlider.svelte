<script lang="ts">
  import { createSlider, melt, type CreateSliderProps } from '@melt-ui/svelte';
  import { cn } from '$lib/utils';

  interface Props {
    className?: string;
    value: CreateSliderProps['value'];
  }

  let { className = '', value }: Props = $props();

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
    <span use:melt={$range} class="h-2 bg-peach-200"></span>
    {#each $ticks as tick, i}
      <span use:melt={tick} class="h-1 w-1 rounded-full bg-zinc-500 data-[bounded]:bg-peach-700/30"
      ></span>
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
      <button
        use:melt={thumb}
        type="button"
        class="size-[1.125rem] rounded-full bg-peach-200 shadow focus:outline-none focus:ring-[3px] focus:ring-peach-700/75"
      ></button>
    {/each}
  </span>
</div>
