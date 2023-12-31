<script lang="ts">
	import Select from '$lib/Select.svelte';
	import { get, writable } from 'svelte/store';

	let options = {
		food: ['Cookies', 'Pizza', 'Burgers']
	};

	const selected = writable({ label: 'Cookies', value: 'Cookies' });

	function handleSubmit() {
		console.log(get(selected));
	}
</script>

<form class="w-fit" on:submit={handleSubmit}>
	<Select title="Food" placeholder="Select your Food" {selected} {options} />
	<button class="inline-flex items-center justify-center shadow text-sm px-4 py-2 font-semibold bg-glacier-500 rounded-lg hover:bg-glacier-500/80 transition-colors">Submit</button>
</form>
