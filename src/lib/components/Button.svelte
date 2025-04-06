<script lang="ts">
  import { cn, longpress } from '$lib/utils';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  // switch between primary, secondary, and ghost buttons
  const variantClasses = {
    primary: 'bg-royalblue-500 hover:bg-royalblue-500/80 text-white',
    secondary: 'bg-peach-200 hover:bg-peach-200/80 text-peach-900',
    red: 'bg-red-500 hover:bg-red-500/80 text-white',
    neutral: 'bg-zinc-700/70 hover:bg-zinc-700/50 text-zinc-300',
    ghost: 'bg-transparent hover:bg-zinc-800/80 text-gray-100'
  };

  interface Props {
    onClick?: () => void;
    type?: HTMLButtonAttributes['type'];
    className?: string | undefined;
    // Must be one of the keys in variantClasses
    variant?: keyof typeof variantClasses;
    contentType?: 'text' | 'icon';
    children?: import('svelte').Snippet;
  }

  let {
    onClick = () => {},
    type = 'button',
    className = undefined,
    variant = 'primary',
    contentType = 'text',
    children
  }: Props = $props();

  const contentClasses = {
    text: 'px-4 py-2',
    icon: 'h-fit p-1.5 !rounded-lg'
  };

  let duration = 200;
</script>

<button
  {type}
  onmouseup={onClick}
  class={cn(
    'inline-flex items-center justify-center rounded-xl text-sm font-semibold shadow transition-colors',
    contentClasses[contentType],
    variantClasses[variant],
    className
  )}
>
  <!-- This is the content inside of the button--->
  {@render children?.()}
</button>
