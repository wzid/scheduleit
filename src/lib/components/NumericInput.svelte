<script lang="ts">
  import { cn } from '$lib/utils';

  export let title: string | undefined = undefined;
  export let placeholder: string | undefined = undefined;
  export let value: number;
  export let className: string | undefined = undefined;

  export let size: 'md' | 'lg' = 'md';

  let sizes = {
    md: 'text-base',
    lg: 'text-lg h-10'
  };
</script>

<div class={cn('flex flex-col', className)}>
  {#if title}
    <label class="pb-1 text-white" for="input">{title}</label>
  {/if}
  <input
    bind:value
    class={cn(
      sizes[size],
      'rounded-lg bg-zinc-800/80 p-1 text-center text-peach-200 shadow ring-peach-300 placeholder:text-zinc-500 focus:ring-1 focus-visible:outline-none'
    )}
    type="number"
    {placeholder}
  />
</div>

<style lang="postcss">
  /* Firefox */
  input[type='number'] {
    -moz-appearance: textfield;
    appearance: textfield;
    margin: 0;
  }

  /* Chrome */
  input[type='number']::-webkit-inner-spin-button,
  input[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
</style>
