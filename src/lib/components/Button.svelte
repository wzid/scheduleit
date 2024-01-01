<script lang="ts">
	export const onClick: () => void = () => {};
	export const type: string | undefined = undefined;
	export const className: string | undefined = undefined;

	import { cn } from '$lib/utils';
</script>

<button
	{type}
	on:click={onClick}
	class={cn(
		className,
		'inline-flex items-center justify-center shadow text-sm px-4 py-2 font-semibold',
		'bg-royalblue-500 rounded-lg hover:bg-royalblue-500/80 transition-colors',
		'focus:ring-2 focus:ring-royalblue-700 focus:ring-offset-2 focus:ring-offset-zinc-900'
	)}
>
	<!-- This is the content inside of the button--->
	<slot />
</button>
