<script lang="ts">
  import { cn } from '$lib/utils';


  interface Props {
    onDroppedFocus?: () => void;
    title?: string | undefined;
    placeholder?: string | undefined;
    value: number;
    className?: string | undefined;
    size?: 'md' | 'lg';
  }

  let {
    onDroppedFocus = () => {},
    title = undefined,
    placeholder = undefined,
    value = $bindable(),
    className = undefined,
    size = 'md'
  }: Props = $props();

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
    onfocusout={onDroppedFocus}
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
