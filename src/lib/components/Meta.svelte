<script lang="ts">
  export let title: string | undefined = undefined;
</script>

<svelte:head>
  <title>{title ? `${title} | timeslot.one` : 'timeslot.one'}</title>
</svelte:head>
