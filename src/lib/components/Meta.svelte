<script lang="ts">
  interface Props {
    title?: string;
  }

  let { title }: Props = $props();

  const app = {
    name: 'schedule it!',
    description: 'Find the time that works best for your team.',
    ogImage: {
      url: 'https://scheduleit.now/images/og.jpg',
      width: '1200',
      height: '630'
    }
  };

  const pageTitle = title ? `${title} | ${app.name}` : app.name;
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={app.description} />
  <meta name="application-name" content={app.name} />

  <meta property="og:type" content="website" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:site_name" content={app.name} />
  <meta property="og:description" content={app.description} />

  <meta property="og:image" content={app.ogImage.url} />
  <meta property="og:image:alt" content={app.name} />
  <meta property="og:image:width" content={app.ogImage.width} />
  <meta property="og:image:height" content={app.ogImage.height} />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={pageTitle} />
  <meta name="twitter:image" content={app.ogImage.url} />
  <meta name="twitter:description" content={app.description} />
</svelte:head>
