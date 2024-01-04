<script lang="ts">
	import { Select, Button, Input, Calendar, DateRangePicker }  from '$lib';
	import { get, writable } from 'svelte/store';

	let options = {
		times: [
			'12:00 AM',
			'12:30 AM',
			'1:00 AM',
			'1:30 AM',
			'2:00 AM',
			'2:30 AM',
			'3:00 AM',
			'3:30 AM',
			'4:00 AM',
			'4:30 AM',
			'5:00 AM',
			'5:30 AM',
			'6:00 AM',
			'6:30 AM',
			'7:00 AM',
			'7:30 AM',
			'8:00 AM',
			'8:30 AM',
			'9:00 AM',
			'9:30 AM',
			'10:00 AM',
			'10:30 AM',
			'11:00 AM',
			'11:30 AM',
			'12:00 PM',
			'12:30 PM',
			'1:00 PM',
			'1:30 PM',
			'2:00 PM',
			'2:30 PM',
			'3:00 PM',
			'3:30 PM',
			'4:00 PM',
			'4:30 PM',
			'5:00 PM',
			'5:30 PM',
			'6:00 PM',
			'6:30 PM',
			'7:00 PM',
			'7:30 PM',
			'8:00 PM',
			'8:30 PM',
			'9:00 PM',
			'9:30 PM',
			'10:00 PM',
			'10:30 PM',
			'11:00 PM',
			'11:30 PM'
		]
	};

	// These are the default values of the select component
	const fromTime = writable({ label: '12:00 AM', value: '12:00 AM' });
	const toTime = writable({ label: '12:30 AM', value: '12:30 AM' });
	let eventName = '';

	function handleSubmit() {
		console.log(get(fromTime));
		console.log(get(toTime));
		console.log(eventName);
	}
</script>

<form class="w-fit flex flex-col gap-4" on:submit={handleSubmit}>
	<Input bind:value={eventName} size="lg" placeholder="Type your event name here"/>
	<div class="flex gap-4">
		<div>
			<div class="pb-2">
				<h3>Dates Available</h3>
				<p class="text-sm text-zinc-500">What dates might work?</p>
			</div>
			<Calendar className="w-72" />
		</div>
		<div>
			<div class="pb-2">
				<h3>Time Range</h3>
				<p class="text-sm text-zinc-500">What times might work?</p>
			</div>
			<div class="flex gap-2 items-center pb-4">
				<Select selected={fromTime} {options} />
				<p class="text-lg">to</p>
				<Select selected={toTime} {options} />
			</div>
			<Button className="w-full" variant="secondary">Submit</Button>
		</div>
	</div>
</form>
