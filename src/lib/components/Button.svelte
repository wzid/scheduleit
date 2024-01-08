<script lang="ts">
  import { cn } from '$lib/utils';

  export const onClick: () => void = () => {};
  export const type: string | undefined = undefined;
  export let className: string | undefined = undefined;
  // Variant is going to be used to index the variantClasses object
  // must be defined
  export let variant: 'primary' | 'secondary' | 'ghost' = 'primary';

  // switch between primary, secondary, and ghost buttons
  const variantClasses = {
    primary: 'bg-royalblue-500 hover:bg-royalblue-500/80 text-white',
    secondary: 'bg-peach-200 hover:bg-peach-200/80 text-peach-900',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-900'
  };
</script>

<button
  {type}
  on:click={onClick}
  class={cn(
    className,
    'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold shadow transition-colors',
    variantClasses[variant]
  )}
>
  <!-- This is the content inside of the button--->
  <slot />
</button>
