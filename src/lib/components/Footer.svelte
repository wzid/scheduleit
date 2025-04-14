<script lang="ts">
  import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
</script>

<footer
  class="mt-auto flex flex-col items-center gap-1.5 py-6 pb-8 pt-12 text-center text-sm lowercase leading-none text-zinc-500"
>
  <div>
    <span>
      Built by <a class="shine" target="_blank" href="https://github.com/wzid">Cameron</a> &
      <a class="shine" target="_blank" href="https://github.com/aelew">Andre</a>
    </span>
    <span>&bull;</span>
    <a class="shine" href="https://github.com/wzid/scheduleit">GitHub</a>
  </div>
  <a
    class="flex w-fit gap-1 text-peach-300 transition-colors hover:text-peach-300/80"
    href="https://buymeacoffee.com/cameronkffn"
    target="_blank"
  >
    If you found this useful, consider supporting us! <ArrowUpRightIcon class="size-4" />
  </a>
</footer>

<style lang="postcss">
  :root {
    --shadow: theme(colors.peach.300);
    --text-color: theme(colors.zinc.500);
  }

  .shine {
    background-color: #a1a1aa;
    background-image: linear-gradient(
      -75deg,
      var(--text-color) 0,
      var(--text-color) 5%,
      rgba(255, 255, 255, 0.5) 5%,
      rgba(255, 255, 255, 0.5) 25%,
      var(--text-color) 25%,
      var(--text-color) 100%
    );
    background-size: 200% 100%;
    -webkit-text-fill-color: transparent;
    -webkit-background-clip: text;
    transition: all 0.5s;
  }

  .shine:hover {
    font-weight: bold;
    filter: brightness(1.75);
    background-position: -150% 0;
  }
</style>
