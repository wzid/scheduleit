<script>
    import Header from '$lib/Header.svelte';
    import "../app.css";
</script>

<div class="flex justify-center pt-6">
    <div class="w-3/4">
        <Header />
        <slot />
    </div>
</div>