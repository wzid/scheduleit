<script lang="ts">
  import { DAYS_OF_THE_WEEK, type Day } from '$lib/constants';
  import { cn } from '$lib/utils';

  export let daysSelected: Map<Readonly<string>, number>;
  export let shades: string[];

  const boxClassNames: Record<string, string> = {
    M: 'rounded-bl-lg',
    Su: 'rounded-br-lg'
  };
</script>

<div class="rounded-lg bg-zinc-800/80">
  <div class="flex justify-between text-lg font-semibold">
    {#each DAYS_OF_THE_WEEK as day}
      <span class="w-full text-center">{day}</span>
    {/each}
  </div>
  <div class="flex justify-between gap-1">
    {#each DAYS_OF_THE_WEEK as day, i}
      <!-- svelte-ignore a11y-no-static-element-interactions a11y-mouse-events-have-key-events -->
      <div style="background-color: {shades[daysSelected.get(day) ?? 0]};" class={cn('h-10 w-10', boxClassNames[day])}></div>
    {/each}
  </div>
</div>
