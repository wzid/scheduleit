<script lang="ts">
    export let title: string | undefined = undefined;
    export let placeholder: string;
    export let value: string;

    export let size: 'md' | 'lg' = 'md';
    
    import { cn } from "$lib/utils";
    let sizes = {
        'md': 'text-base',
        'lg': 'text-lg'
    };

</script>

<div class="flex flex-col">
    {#if title}
        <label class="text-white pb-1" for="input">{title}</label>
    {/if}
    <input bind:value={value} class={cn(
        sizes[size],
        "bg-zinc-800/80 rounded-lg p-1 pl-2 text-white placeholder:text-zinc-500 ",
        "focus-visible:outline-none focus:ring-1  ring-peach-300")} id="input" type="text" placeholder={placeholder} />
</div>