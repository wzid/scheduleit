<script lang="ts">
  import { cn } from '$lib/utils';


  interface Props {
    title?: string | undefined;
    placeholder: string;
    value: string;
    className?: string | undefined;
    size?: 'md' | 'lg';
  }

  let {
    title = undefined,
    placeholder,
    value = $bindable(),
    className = undefined,
    size = 'md'
  }: Props = $props();

  let sizes = {
    md: 'text-base',
    lg: 'text-lg'
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
      'rounded-lg bg-zinc-800/80 p-1 pl-2 text-white ring-peach-300 placeholder:text-zinc-500 focus:ring-1 focus-visible:outline-none'
    )}
    type="text"
    {placeholder}
  />
</div>
