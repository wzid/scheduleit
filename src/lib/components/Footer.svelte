<footer class="mt-auto py-6">
  <div class="text-center text-sm lowercase leading-none text-zinc-500">
    <a class="shine" target="_blank" href="https://github.com/wzid/scheduleit">GitHub</a>
    <span>&bull;</span>
    <span>
      Built by <a class="shine" target="_blank" href="https://github.com/wzid">Cameron</a> &
      <a class="shine" target="_blank" href="https://github.com/aelew">Andre</a>
    </span>
  </div>
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
