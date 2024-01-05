<script lang="ts">
	import { Select, Button, Input, Calendar, DateRangePicker } from '$lib';
	import { TIMES } from '$lib/constants';
	import { get, writable } from 'svelte/store';

	let timeOptions = { times: TIMES };
	let tzOptions = { 'Time Zone': Intl.supportedValuesOf('timeZone') };
	const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

	// Default component values
	const fromTime = writable({ label: '12:00 AM', value: '12:00 AM' });
	const toTime = writable({ label: '12:30 AM', value: '12:30 AM' });
	const selectedTz = writable({ label: userTz, value: userTz });
	let eventName = '';

	function handleSubmit() {
		console.log(get(fromTime));
		console.log(get(toTime));
		console.log(eventName);
	}
</script>

<form class="w-fit flex flex-col gap-4" on:submit={handleSubmit}>
	<Input bind:value={eventName} size="lg" placeholder="Type your event name here..." />
	<div class="sm:flex gap-4 grid">
		<div>
			<div class="pb-2">
				<h3>Dates Available</h3>
				<p class="text-sm text-zinc-500">What dates might work?</p>
			</div>
			<Calendar className="w-80 md:w-72" />
		</div>
		<div>
			<div class="pb-2">
				<h3>Time Range</h3>
				<p class="text-sm text-zinc-500">What times might work?</p>
			</div>
			<div class="flex gap-2 items-center pb-4">
				<Select className="w-full" selected={fromTime} options={timeOptions} />
				<p class="text-lg">to</p>
				<Select className="w-full" selected={toTime} options={timeOptions} />
			</div>
			<div class="pb-2">
				<h3>Time Zone</h3>
			</div>
			<div class="flex gap-2 items-center pb-4">
				<Select className="w-full" selected={selectedTz} options={tzOptions} />
			</div>
			<Button className="w-full" variant="secondary">Create Event</Button>
		</div>
	</div>
</form>
