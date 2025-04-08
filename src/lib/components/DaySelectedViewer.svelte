<script lang="ts">
  import { DAY_ABBREVIATIONS } from '$lib/constants';
  import { cn } from '$lib/utils';
  import type { User } from '$lib/constants';

  interface Props {
    daysSelected: Map<Readonly<string>, Array<User>>;
    shades: string[];
  }

  let { daysSelected, shades }: Props = $props();

  const boxClassNames: Record<string, string> = {
    M: 'rounded-bl-lg',
    Su: 'rounded-br-lg'
  };
</script>

<div class="rounded-lg bg-zinc-800/80">
  <div class="flex justify-between text-lg font-semibold">
    {#each DAY_ABBREVIATIONS as day}
      <span class="w-full text-center">{day}</span>
    {/each}
  </div>
  <div class="flex justify-between gap-1">
    {#each DAY_ABBREVIATIONS as day, i}
      <div class="group relative">
        <div
          style="background-color: {shades[daysSelected.get(day)?.length ?? 0]};"
          class={cn('h-10 w-10', boxClassNames[day])}
        ></div>
        <div
          class="pointer-events-none absolute left-1/2 top-12 z-10 hidden -translate-x-1/2 whitespace-nowrap group-hover:block"
        >
          <div
            class="rounded-lg bg-zinc-700/75 px-2 py-1 text-sm text-zinc-300 shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2"
          >
            <strong>
              Available: <span class="font-normal">{daysSelected.get(day)?.length ?? 0}</span>
            </strong>
            <ul class="list-inside list-disc pl-1">
              {#each daysSelected.get(day)?.map((user) => user.name) ?? [] as availableUserName}
                <li>{availableUserName}</li>
              {/each}
            </ul>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>
