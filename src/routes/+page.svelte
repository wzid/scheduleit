<script lang="ts">
    import { Input } from '$lib/components/ui/input';
    import { Button } from '$lib/components/ui/button';
    import { RangeCalendar } from "$lib/components/ui/range-calendar";
    import { today, getLocalTimeZone } from "@internationalized/date";
    import * as Select from "$lib/components/ui/select";
  
    const start = today(getLocalTimeZone());
    const end = start.add({ days: 7 });
  
    let value = {
      start,
      end
    };

    function handleChange() {
        console.log("changed");
    }
</script>

<div class="flex gap-10">
    <div class="flex flex-col w-fit gap-6 bg-card">
        <Input placeholder="New event name"/>
        <RangeCalendar bind:value class="border rounded-md shadow" />
        <Button>Create Event</Button>
    </div>
    <div class="flex flex-col text-center">
        <h2>What times would work?</h2>
        <div>
            <Select.Root onSelectedChange={handleChange}>
                <Select.Trigger class="w-[180px]">
                  <Select.Value placeholder="Theme" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="light">Light</Select.Item>
                  <Select.Item value="dark">Dark</Select.Item>
                  <Select.Item value="system">System</Select.Item>
                </Select.Content>
              </Select.Root>
        </div>
    </div>
</div>
