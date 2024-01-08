<script lang="ts">
  import { cn, longpress } from '$lib/utils';

  export let onClick: () => void = () => {};
  
  export let type: 'button' | 'submit' = 'button';
  export let className: string | undefined = undefined;
  // Variant is going to be used to index the variantClasses object
  // must be defined
  export let variant: 'primary' | 'secondary' | 'ghost' | 'neutral' = 'primary';
  
  // switch between primary, secondary, and ghost buttons
  const variantClasses = {
    primary: 'bg-royalblue-500 hover:bg-royalblue-500/80 text-white',
    secondary: 'bg-peach-200 hover:bg-peach-200/80 text-peach-900',
    neutral: 'bg-zinc-800/80 hover:bg-zinc-700/60 text-white',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-900'
  };

  export let contentType: 'text' | 'icon' = 'text';

  const contentClasses = {
    text: 'px-4 py-2',
    icon: 'p-2'
  };

  let duration = 300;
  

</script>

<button
  {type}
  use:longpress={duration}
  on:longpress={onClick}
  on:mouseup={onClick}
  class={cn(
    className,
    contentClasses[contentType],
    variantClasses[variant],
    'inline-flex items-center justify-center rounded-xl text-sm font-semibold shadow transition-colors'
  )}
>
  <!-- This is the content inside of the button--->
  <slot />
</button>
