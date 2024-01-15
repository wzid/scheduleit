<script lang="ts">
  import { createSlider, melt } from '@melt-ui/svelte';
  import { cn } from '$lib/utils';

  export let className: string = '';
  export let defaultValue: [number] | [number, number] = [5, 8];

  const {
    elements: { root, range, thumbs, ticks }
  } = createSlider({
    defaultValue,
    min: 0,
    max: 24,
    step: 1,
  });
</script>

<div class="w-full px-3 bg-zinc-800/80 relative rounded-xl">
  <span use:melt={$root} class={cn(className, "relative flex h-[20px] w-full min-w-[24rem] items-center")}>
    <span use:melt={$range} class="h-2 bg-peach-200" />
    
    {#each $ticks as tick, i}
      <span
        use:melt={tick}
        class="data-[bounded]:bg-peach-700/75 h-1 w-1 rounded-full bg-zinc-500"
      />
      {#if i % 3 == 0}
        {#if i == 0}
          <span use:melt={tick} class="top-6 text-zinc-500 !-left-[.4rem]">
            12
          </span>
        {:else if i == 24}
          <span use:melt={tick} class="top-6 text-zinc-500 !-right-[.6rem]">
            12
          </span>
        {:else}
          <span use:melt={tick} class="top-6 text-zinc-500">
            {#if i < 12}
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
        class="h-5 w-5 rounded-full bg-peach-200 focus:ring-4 focus:!ring-black/40"
      />
    {/each}
  </span>

</div>
