<!-- Not sure what to add here until we get further down in development-->
<div class="pb-8 text-center">
  <h1
    class="bg-gradient-to-r from-peach-200 to-peach-300 bg-clip-text leading-none text-transparent"
  >
    timeslot
  </h1>
  <div class="text-sm text-zinc-500">
    built by <a class="playful" target="_blank" href="https://github.com/wzid">cameron</a> &
    <a class="shine" target="_blank" href="https://github.com/aelew">andre</a>
  </div>
</div>

<style lang="postcss">
  :root {
    --shadow: theme(colors.peach.400);
    --text-color: theme(colors.zinc.500);
  }

  .playful {
    transition: all 0.25s ease-in-out;
  }

  .playful:hover {
    font-weight: bold;
    color: #fff;
    text-shadow:
      1.75px 1.75px var(--shadow),
      1.5px 1.5px var(--shadow),
      1.25px 1.25px var(--shadow),
      1px 1px var(--shadow),
      0.75px 0.75px var(--shadow),
      0.5px 0.5px var(--shadow),
      0.25px 0.25px var(--shadow);
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
    filter: brightness(1.25);
    background-position: -150% 0;
  }
</style>
