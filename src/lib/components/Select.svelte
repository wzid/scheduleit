<script lang="ts">
  import { createSelect, melt, type CreateSelectProps } from '@melt-ui/svelte';
  import { cn } from '$lib/utils';
  import { Check, ChevronDown } from 'lucide-svelte';
  import { fly } from 'svelte/transition';

  // string array or object with groups
  export let title: string | undefined = undefined;
  export let placeholder: string | undefined = undefined;
  export let className: string | undefined = undefined;

  export let options: Record<string, string[]>;
  export let selected: CreateSelectProps['selected'];

  const {
    elements: { trigger, menu, option, group, groupLabel, label },
    states: { selectedLabel, open, selected: selectedOption },
    helpers: { isSelected }
  } = createSelect({
    selected,
    forceVisible: true,
    positioning: {
      placement: 'bottom',
      fitViewport: true,
      sameWidth: true
    }
  });
</script>

<div class={cn('flex flex-col gap-1', className)}>
  <!-- svelte-ignore a11y-label-has-associated-control - $label contains the 'for' attribute -->
  {#if title}
    <label class="block text-peach-400" use:melt={$label}>{title}</label>
  {/if}
  <button
    class="flex h-10 min-w-[150px] items-center justify-between rounded-lg bg-zinc-800/80 px-3 py-2 text-peach-200 shadow ring-peach-300 transition-colors hover:bg-zinc-700/60 focus:outline-none focus:ring-1"
    type="button"
    aria-label={title}
    use:melt={$trigger}
    on:m-keydown={(e) => {
      e.preventDefault(); // Cancel default builder behabiour
      e.detail.originalEvent.preventDefault(); // Cancel page scroll

      const { key } = e.detail.originalEvent;

      if (!['ArrowDown', 'ArrowUp', 'Space', 'Enter'].includes(key)) return;

      const allOptions = Object.values(options).flat();
      const index = allOptions.indexOf($selectedLabel);

      if (key === 'ArrowDown') {
        const nextIndex = index + 1;
        const nextOption = allOptions[nextIndex] || allOptions[0];
        selectedOption.set({ value: nextOption, label: nextOption });
      } else if (key === 'ArrowUp') {
        const prevIndex = index - 1;
        const prevOption = allOptions[prevIndex] || allOptions[allOptions.length - 1];
        selectedOption.set({ value: prevOption, label: prevOption });
      } else {
        open.set(true);
      }
    }}
  >
    {$selectedLabel || placeholder}
    <ChevronDown class="h-5 w-5" />
  </button>
  {#if $open}
    <div
      class="z-10 flex !max-h-[250px] flex-col overflow-hidden rounded-lg"
      transition:fly={{ duration: 150, y: -10 }}
      use:melt={$menu}
    >
      <div
        class="fix-scrollbar flex max-h-full flex-col gap-0 overflow-y-auto bg-zinc-800 p-1 shadow focus:!ring-0"
      >
        {#each Object.entries(options) as [key, arr]}
          <div use:melt={$group(key)}>
            <div
              class="py-1 pl-4 pr-4 font-semibold capitalize text-white"
              use:melt={$groupLabel(key)}
            >
              {key}
            </div>
            {#each arr as item}
              <div
                class="relative cursor-pointer whitespace-nowrap rounded-lg py-1 pl-7 pr-4 text-white transition-colors duration-150 ease-out hover:bg-zinc-700/60 hover:text-peach-200 focus:z-10 focus:text-peach-700 data-[selected]:bg-peach-200 data-[selected]:text-peach-900"
                use:melt={$option({ value: item, label: item })}
              >
                <div class="check {$isSelected(item) ? 'block' : 'hidden'}">
                  <Check class="h-4 w-4" />
                </div>
                {item}
              </div>
            {/each}
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style lang="postcss">
  .check {
    position: absolute;
    left: theme(spacing.2);
    top: 50%;
    z-index: theme(zIndex.20);
    translate: 0 calc(-50% + 1px);
    color: theme(colors.peach.500);
  }

  .fix-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: theme(colors.zinc.500) theme(colors.zinc.800);
  }

  .fix-scrollbar::-webkit-scrollbar-track {
    border: orange 1;
    border-radius: 10rem;
  }

  /* Works on Chrome, Edge, and Safari */
  .fix-scrollbar::-webkit-scrollbar {
    width: 0.5rem;
    height: 0.5rem;
  }

  .fix-scrollbar::-webkit-scrollbar-track {
    background: theme(colors.zinc.800);
  }

  .fix-scrollbar::-webkit-scrollbar-thumb {
    background-color: theme(colors.zinc.500);
    border: 1px solid theme(colors.zinc.800);
    border-radius: 6px;
  }
</style>
