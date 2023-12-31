<script lang="ts">
	import { createSelect, melt, type CreateSelectProps } from '@melt-ui/svelte';
	import { Check, ChevronDown } from 'lucide-svelte';

	// string array or object with groups
	export let title: string;
	export let placeholder: string;
	export let options: Record<string, string[]>;
	export let selected: CreateSelectProps['selected'];

	const {
		elements: { trigger, menu, option, group, groupLabel, label },
		states: { selectedLabel, open },
		helpers: { isSelected }
	} = createSelect({
		selected,
		forceVisible: true,
		positioning: {
			placement: 'bottom',
			fitViewport: true,
			sameWidth: true
		}
	});
</script>

<div class="flex flex-col gap-1">
	<!-- svelte-ignore a11y-label-has-associated-control - $label contains the 'for' attribute -->
	<label class="block text-glacier-200" use:melt={$label}>{title}</label>
	<button
		class="flex h-10 min-w-[220px] items-center justify-between rounded-lg bg-white px-3 py-2
    text-glacier-700 shadow transition-opacity hover:opacity-90"
		type="button"
		use:melt={$trigger}
		on:m-keydown={(e) => {
			e.preventDefault(); // Cancel default builder behabiour
			e.detail.originalEvent.preventDefault(); // Cancel page scroll

			const { key } = e.detail.originalEvent;

			if (!['ArrowDown', 'ArrowUp', 'Space', 'Enter'].includes(key)) return;

			const allOptions = Object.values(options).flat();
			const index = allOptions.indexOf(`${$selectedLabel}`);

			if (key === 'ArrowDown') {
				const nextIndex = index + 1;
				const nextOption = allOptions[nextIndex] || allOptions[0];
				selected.set({ value: nextOption, label: nextOption });
			} else if (key === 'ArrowUp') {
				const prevIndex = index - 1;
				const prevOption = allOptions[prevIndex] || allOptions[allOptions.length - 1];
				selected.set({ value: prevOption, label: prevOption });
			} else {
				open.set(true);
			}
		}}
		aria-label="Food"
	>
		{$selectedLabel || placeholder}
		<ChevronDown class="square-5" />
	</button>
	{#if $open}
		<div
			class="z-10 flex max-h-[300px] flex-col
      overflow-y-auto rounded-lg bg-white p-1
      shadow focus:!ring-0"
			use:melt={$menu}
		>
			{#each Object.entries(options) as [key, arr]}
				<div use:melt={$group(key)}>
					<div
						class="py-1 pl-4 pr-4 font-semibold capitalize text-neutral-800"
						use:melt={$groupLabel(key)}
					>
						{key}
					</div>
					{#each arr as item}
						<div
							class="relative cursor-pointer rounded-lg py-1 pl-8 pr-4 text-neutral-800
                focus:z-10 focus:text-glacier-700
              data-[highlighted]:bg-glacier-50 data-[selected]:bg-glacier-100
              data-[highlighted]:text-glacier-900 data-[selected]:text-glacier-900"
							use:melt={$option({ value: item, label: item })}
						>
							<div class="check {$isSelected(item) ? 'block' : 'hidden'}">
								<Check class="square-4" />
							</div>

							{item}
						</div>
					{/each}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style lang="postcss">
	.check {
		position: absolute;
		left: theme(spacing.2);
		top: 50%;
		z-index: theme(zIndex.20);
		translate: 0 calc(-50% + 1px);
		color: theme(colors.glacier.500);
	}
</style>
