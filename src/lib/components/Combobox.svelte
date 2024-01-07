<script lang="ts">
  import { createCombobox, melt, type CreateComboboxProps } from '@melt-ui/svelte';
  import { Check, ChevronDown, ChevronUp } from 'lucide-svelte';
  import { fly } from 'svelte/transition';

  export let options: string[];
  export let selected: CreateComboboxProps<string>['selected'];

  const {
    elements: { menu, input, option },
    states: { open, inputValue, touchedInput, selected: selectedOption },
    helpers: { isSelected }
  } = createCombobox<string>({ selected, forceVisible: true });

  $: if (!$open) {
    $inputValue = $selectedOption?.value ?? '';
  }

  $: filteredOptions = $touchedInput
    ? options.filter((o) => {
        const normalizedInput = $inputValue.toLowerCase();
        return o.toLowerCase().includes(normalizedInput);
      })
    : options;
</script>

<div class="flex flex-col gap-1">
  <div class="relative w-full">
    <input
      class="flex h-10 w-full items-center justify-between rounded-lg bg-zinc-800/80 px-3 py-2 text-peach-200 shadow ring-peach-300 transition-colors placeholder:text-zinc-500 hover:bg-zinc-700/60 focus:outline-none focus:ring-1"
      placeholder="Select an option..."
      use:melt={$input}
    />
    <div class="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-peach-200">
      {#if $open}
        <ChevronUp class="h-5 w-5" />
      {:else}
        <ChevronDown class="h-5 w-5" />
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
    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
    <div class="flex max-h-full flex-col gap-0 overflow-y-auto bg-zinc-800 px-2 py-2" tabindex="0">
      {#each filteredOptions as item, index (index)}
        <li
          class="relative cursor-pointer scroll-my-2 rounded-lg py-1 pl-7 pr-4 text-white transition-colors duration-150 ease-out hover:bg-zinc-700/60 hover:text-peach-200 focus:z-10 focus:text-peach-700 data-[selected]:bg-peach-200 data-[selected]:text-peach-900 data-[disabled]:opacity-50"
          use:melt={$option({ value: item })}
        >
          <div class="check {$isSelected(item) ? 'block' : 'hidden'}">
            <Check class="h-4 w-4" />
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
    @apply absolute left-2 top-1/2 text-peach-500;
    translate: 0 calc(-50% + 1px);
  }
</style>
