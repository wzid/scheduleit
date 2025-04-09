<script lang="ts">
  interface Props {
    title?: string;
  }

  let { title }: Props = $props();
</script>

<svelte:head>
  <title>{title ? `${title} | schedule it!` : 'schedule it!'}</title>
</svelte:head>
