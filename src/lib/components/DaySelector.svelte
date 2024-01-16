<script lang="ts">
  import { cn } from '$lib/utils';

  const daysOfWeek = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'];
  // create a map from the day to the selected state
  const daysSelected: Map<Readonly<string>, boolean> = new Map(
    daysOfWeek.map((day) => [day, false])
  );
  let count = 0;

  const boxClassNames: { [key: string]: string } = {
    M: 'rounded-bl-lg',
    Su: 'rounded-br-lg',
    default: ''
  };

  const toggleDay = (day: string) => {
    daysSelected.set(day, !daysSelected.get(day));
    console.log(daysSelected.get(day));
    count++;
  };
</script>

<div class="rounded-lg bg-zinc-800/80">
  <div class="flex justify-between text-lg font-semibold">
    {#each daysOfWeek as day}
      <span class="w-full text-center">{day}</span>
    {/each}
  </div>
  <div class="flex justify-between gap-1">
    {#each daysOfWeek as day}
      {#key count}
        <button
          type="button"
          on:click={() => toggleDay(day)}
          class={cn(
            daysSelected.get(day) ? 'bg-peach-300' : '',
            boxClassNames[day],
            'h-10 w-full bg-zinc-700 transition-all hover:opacity-80'
          )}
        />
      {/key}
    {/each}
  </div>
</div>
