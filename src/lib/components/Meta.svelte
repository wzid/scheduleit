<script lang="ts">
  interface Props {
    title?: string;
  }

  let { title }: Props = $props();
</script>

<svelte:head>
  <title>{title ? `${title} | timeslot` : 'timeslot'}</title>
</svelte:head>
