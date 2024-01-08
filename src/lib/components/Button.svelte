<script lang="ts">
  import { cn, longpress } from '$lib/utils';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  export let onClick: () => void = () => {};

  export let type: HTMLButtonAttributes['type'] = 'button';
  export let className: string | undefined = undefined;

  // Must be one of the keys in variantClasses
  export let variant: keyof typeof variantClasses = 'primary';

  // switch between primary, secondary, and ghost buttons
  const variantClasses = {
    primary: 'bg-royalblue-500 hover:bg-royalblue-500/80 text-white',
    secondary: 'bg-peach-200 hover:bg-peach-200/80 text-peach-900',
    neutral: 'bg-zinc-800/80 hover:bg-zinc-700/60 text-white',
    ghost: 'bg-transparent hover:bg-zinc-800/80 text-gray-100'
  };

  export let contentType: 'text' | 'icon' = 'text';

  const contentClasses = {
    text: 'px-4 py-2',
    icon: 'p-2'
  };

  let duration = 200;
</script>

<button
  {type}
  use:longpress={duration}
  on:longpress={onClick}
  on:mouseup={onClick}
  class={cn(
    'inline-flex items-center justify-center rounded-xl text-sm font-semibold shadow transition-colors',
    contentClasses[contentType],
    variantClasses[variant],
    className
  )}
>
  <!-- This is the content inside of the button--->
  <slot />
</button>
