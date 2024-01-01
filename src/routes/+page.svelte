<script lang="ts">
	import Select from '$lib/components/Select.svelte';
	import Button from '$lib/components/Button.svelte';
	import { get, writable } from 'svelte/store';

	let options = {
		food: ['Cookies', 'Pizza', 'Burgers']
	};

	const selected = writable({ label: '', value: '' });

	function handleSubmit() {
		console.log(get(selected));
	}
</script>

<form class="w-fit flex flex-col gap-6" on:submit={handleSubmit}>
	<Select title="Food" placeholder="Select your Food" {selected} {options} />
	<Button>Submit</Button>
</form>
