<script lang="ts">
  interface Props {
    title?: string | undefined;
  }

  let { title = undefined }: Props = $props();
</script>

<svelte:head>
  <title>{title ? `${title} | timeslot.one` : 'timeslot.one'}</title>
</svelte:head>
