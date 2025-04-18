<script lang="ts">
  import { run } from 'svelte/legacy';

  import { createCombobox, melt, type CreateComboboxProps } from '@melt-ui/svelte';
  import CheckIcon from '@lucide/svelte/icons/check';
  import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
  import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';
  import { fly } from 'svelte/transition';
  import { cn } from '$lib/utils';

  interface Props {
    options: string[];
    selected: CreateComboboxProps<string>['selected'];
    className?: string;
  }

  let { options, selected, className = '' }: Props = $props();

  const {
    elements: { menu, input, option },
    states: { open, inputValue, touchedInput, selected: selectedOption },
    helpers: { isSelected }
  } = createCombobox<string>({ selected, forceVisible: true });

  run(() => {
    if (!$open) {
      $inputValue = $selectedOption?.value ?? '';
    }
  });

  let filteredOptions = $derived(
    $touchedInput
      ? options.filter((o) => {
          const normalizedInput = $inputValue.toLowerCase().trim().replaceAll(' ', '_');
          return o.toLowerCase().includes(normalizedInput);
        })
      : options
  );
</script>

<div class={cn(className, 'flex flex-col gap-1')}>
  <div class="relative w-full">
    <input
      class="flex h-10 w-full items-center justify-between rounded-lg bg-zinc-800/80 px-3 py-2 text-peach-200 shadow ring-peach-300 transition-colors placeholder:text-zinc-500 hover:bg-zinc-700/60 focus:outline-none focus:ring-1"
      placeholder="Select an option..."
      use:melt={$input}
    />
    <div class="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-peach-200">
      {#if $open}
        <ChevronUpIcon class="h-5 w-5" />
      {:else}
        <ChevronDownIcon class="h-5 w-5" />
      {/if}
    </div>
  </div>
</div>
{#if $open}
  <ul
    class="z-10 flex max-h-[300px] flex-col overflow-hidden rounded-lg"
    transition:fly={{ duration: 150, y: -5 }}
    use:melt={$menu}
  >
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div class="flex max-h-full flex-col gap-0 overflow-y-auto bg-zinc-800 px-2 py-2" tabindex="0">
      {#each filteredOptions as item, index (index)}
        <li
          class="relative cursor-pointer scroll-my-2 rounded-lg py-1 pl-7 pr-4 text-white transition-colors duration-150 ease-out hover:bg-zinc-700/60 hover:text-peach-200 focus:z-10 focus:text-peach-700 data-[selected]:bg-peach-200 data-[selected]:text-peach-900 data-[disabled]:opacity-50"
          use:melt={$option({ value: item })}
        >
          <div class="check {$isSelected(item) ? 'block' : 'hidden'}">
            <CheckIcon class="h-4 w-4" />
          </div>
          {item}
        </li>
      {:else}
        <li class="relative cursor-pointer rounded-md py-1 pl-8 pr-4">No results found.</li>
      {/each}
    </div>
  </ul>
{/if}

<style lang="postcss">
  .check {
    @apply absolute left-2 top-1/2 text-peach-700;
    translate: 0 calc(-50% + 1px);
  }
</style>
