<script lang="ts">
  import { onMount } from 'svelte';
  import { CROWD_MOODS } from '../lib/content';
  import { HERO_TICK_MS, INITIAL_HERO, previousMinute, tickHero } from '../lib/countdown';
  import Mascot from './Mascot.svelte';

  let hero = $state(INITIAL_HERO);
  const mood = $derived(CROWD_MOODS[hero.moodIndex]);

  onMount(() => {
    const timer = setInterval(() => (hero = tickHero(hero)), HERO_TICK_MS);
    return () => clearInterval(timer);
  });
</script>

<div class="live">
  <div class="countdown">
    <p class="route">Corridor 1 to Kota · Bundaran HI</p>
    <p class="eta" role="timer" aria-label="Next bus in {hero.minutes} minutes">
      {#key hero.minutes}
        <span class="digits" aria-hidden="true">
          <span class="digit leaving">{previousMinute(hero.minutes)}</span>
          <span class="digit arriving">{hero.minutes}</span>
        </span>
      {/key}
      <span class="unit" aria-hidden="true">min</span>
    </p>
  </div>
  <div class="jali">
    <p class="bubble" style:background={mood.background} style:color={mood.foreground}>{mood.name} · {mood.says}</p>
    <div class="jali-figure">
      <Mascot mood={mood.mood} tone="container" size={132} />
    </div>
  </div>
</div>

<style>
  .live {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 28px;
  }

  .countdown {
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  .route {
    font-size: 18px;
    font-weight: 700;
    opacity: 0.85;
  }

  .eta {
    display: flex;
    align-items: flex-end;
    gap: 10px;
  }

  .digits {
    position: relative;
    display: inline-block;
    overflow: hidden;
    padding: 8px 4px;
    margin: -8px -4px;
  }

  .digit {
    display: block;
    font-weight: 850;
    font-stretch: 28%;
    font-size: var(--countdown-size, 240px);
    line-height: 0.78;
  }

  .leaving {
    position: absolute;
    left: 4px;
    top: 8px;
    animation: cd-out 458ms var(--sd) both;
  }

  .arriving {
    animation: cd-in 458ms var(--sd) both;
  }

  .unit {
    font-weight: 850;
    font-stretch: 40%;
    font-size: calc(var(--countdown-size, 240px) * 0.234);
    line-height: 1;
    padding-bottom: 8px;
  }

  .jali {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding-bottom: 8px;
  }

  .bubble {
    padding: 12px 16px;
    border-radius: 20px 20px 20px 6px;
    font-weight: 800;
    font-size: 15px;
    white-space: nowrap;
    transition:
      background 252ms var(--fd),
      color 252ms var(--fd);
  }

  @media (max-width: 640px) {
    .live {
      --countdown-size: 168px;
      gap: 16px;
    }

    .countdown {
      gap: 20px;
    }

    .route {
      font-size: 16px;
    }

    .jali-figure {
      width: 99px;
      height: 99px;
    }

    .jali-figure :global(.mascot) {
      transform: scale(0.75);
      transform-origin: 0 0;
    }
  }
</style>
