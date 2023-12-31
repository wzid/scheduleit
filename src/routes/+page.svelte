<script lang="ts">
    import Select from '$lib/Select.svelte';

    let options = {
        food:['Cookies', 'Pizza', 'Burgers']
    }
</script>

<div class="w-fit">
    <Select title="Food" placeholder="Select your Food" options={options} />
</div>


