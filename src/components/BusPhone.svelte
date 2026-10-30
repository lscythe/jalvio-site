<script lang="ts">
  import { onDestroy } from 'svelte';
  import { SvelteSet } from 'svelte/reactivity';
  import { type BusSummary, busView, collapseProgress, downstreamStops, notifyToast, UPSTREAM_STOPS } from '../lib/busPhone';

  const TOP_BAR_HEIGHT = 96;
  const TOAST_MS = 2200;

  let selected = $state(0);
  const notifying = new SvelteSet<number>();
  let scrollTop = $state(0);
  let collapsibleHeight = $state(250);
  let pinnedHeight = $state(150);
  let toast = $state<string | null>(null);
  let toastTimer: ReturnType<typeof setTimeout> | undefined;

  const view = $derived(busView({ selected, notifying }));
  const bus = $derived(view.selected);
  const stops = $derived(downstreamStops(bus.eta));
  const progress = $derived(collapseProgress(scrollTop, collapsibleHeight));
  const laterHeadingId = $props.id();

  function showToast(message: string) {
    clearTimeout(toastTimer);
    toast = message;
    toastTimer = setTimeout(() => (toast = null), TOAST_MS);
  }

  function toggleNotify(target: BusSummary) {
    showToast(notifyToast(target));
    if (target.notifying) notifying.delete(target.index);
    else notifying.add(target.index);
  }

  function dismissToast() {
    clearTimeout(toastTimer);
    toast = null;
  }

  onDestroy(() => clearTimeout(toastTimer));
</script>

<section class="phone" aria-label="Jalvio app preview: route 1 to Kota from Bundaran HI">
  <div class="status-bar" aria-hidden="true">
    <span>9:41</span>
    <span class="status-icons"><span></span><span></span></span>
  </div>

  <div class="scroller" onscroll={(event) => (scrollTop = event.currentTarget.scrollTop)}>
    <div class="hero-spacer" style:height="{TOP_BAR_HEIGHT + collapsibleHeight + pinnedHeight}px"></div>
    <div class="sheet">
      <div class="group">
        <h3 id="{laterHeadingId}-later" class="group-title">Later buses</h3>
        <ul class="later" aria-labelledby="{laterHeadingId}-later">
          {#each view.others as other (other.index)}
            <li>
              <button type="button" onclick={() => (selected = other.index)}>
                <span class="later-text">
                  <span class="later-title">{other.distanceLabel} · {other.clock}</span>
                  <span class="later-crowd">
                    <span class="dots" aria-hidden="true">
                      {#each other.crowdDots as filled}
                        <span style:background={filled ? other.crowdColor : 'var(--outline-variant)'}></span>
                      {/each}
                    </span>
                    {other.crowdNote}
                  </span>
                </span>
                <span class="later-eta display">{other.eta}</span>
                <span class="later-unit">min</span>
              </button>
            </li>
          {/each}
        </ul>
      </div>

      <div class="group">
        <div class="timeline-heading">
          <h3 class="group-title">After Bundaran HI</h3>
          <span>Bus at {bus.clock}</span>
        </div>
        <ol class="timeline">
          {#each stops as stop}
            <li class:terminus={stop.terminus}>
              <span class="rail" aria-hidden="true"><span class="stop-dot"></span></span>
              <span class="stop-name">{stop.name}</span>
              <span class="stop-rel">{stop.minutes} min</span>
              <span class="stop-clock">{stop.clock}</span>
            </li>
          {/each}
        </ol>
      </div>
    </div>
  </div>

  <div class="hero" style:box-shadow="0 4px 14px rgba(0,0,0,{(progress * 0.18).toFixed(2)})">
    <div class="hero-blob hero-blob-cookie" aria-hidden="true"></div>
    <div class="hero-blob hero-blob-flower" aria-hidden="true"></div>

    <div class="top-bar">
      <span class="back" aria-hidden="true"><span class="icon outlined">arrow_back</span></span>
      <span class="route-badge" aria-hidden="true">1</span>
      <span class="route-name">
        <span class="route-to">to Kota</span>
        <span class="route-from">from Bundaran HI</span>
      </span>
      <span class="mini-eta" style:opacity={Math.max(0, (progress - 0.6) / 0.4)} aria-hidden="true">
        <span class="display">{bus.eta}</span><span>min</span>
      </span>
    </div>

    <div class="collapsible" style:height="{Math.round(collapsibleHeight * (1 - progress))}px">
      <div
        class="collapsible-inner"
        bind:offsetHeight={collapsibleHeight}
        style:opacity={Math.max(0, 1 - progress * 1.6)}
        style:transform="translateY(-{Math.round(progress * 40)}px) scale({1 - progress * 0.15})"
      >
        <p class="lead"><span class="live-dot"></span>{view.lead}</p>
        <div class="big-eta">
          <span class="display">{bus.eta}</span>
          <span class="big-unit">min</span>
          <span class="plate"><span>{bus.plate}</span><span>{bus.fleet}</span></span>
        </div>
        <p class="hero-crowd">
          <span class="dots" aria-hidden="true">
            {#each bus.crowdDots as filled}
              <span style:background={filled ? 'currentColor' : 'color-mix(in oklch, currentColor 30%, transparent)'}></span>
            {/each}
          </span>
          {bus.crowdNote}
        </p>
      </div>
    </div>

    <div class="pinned" bind:offsetHeight={pinnedHeight}>
      <div class="strip">
        <div class="strip-track">
          <span class="track" aria-hidden="true"></span>
          {#each UPSTREAM_STOPS as _, j}
            <span class="strip-stop" style:left="{(j / UPSTREAM_STOPS.length) * 100}%" aria-hidden="true"></span>
          {/each}
          <span class="strip-you" aria-hidden="true"></span>
          {#each view.buses as chip (chip.index)}
            <button
              type="button"
              class="chip"
              class:on={chip.index === selected}
              style:left="{chip.stripPosition}%"
              aria-label="Bus in {chip.eta} min"
              aria-pressed={chip.index === selected}
              onclick={() => (selected = chip.index)}
            >
              <span class="icon" aria-hidden="true">directions_bus</span>{chip.eta}
            </button>
          {/each}
        </div>
        <div class="strip-labels" aria-hidden="true">
          <span>Bendungan Hilir</span><span>Dukuh Atas</span><span class="you">You</span>
        </div>
      </div>
      <div class="actions">
        <button type="button" class="notify" class:on={bus.notifying} onclick={() => toggleNotify(bus)}>
          <span class="icon" aria-hidden="true">{bus.notifyIcon}</span>{bus.notifyLabel}
        </button>
        <span class="route-action" aria-hidden="true"><span class="icon outlined">route</span>Route</span>
      </div>
    </div>
  </div>

  <div class="toast-region" role="status">
    {#if toast}
      <div class="toast">
        <span class="toast-drain" aria-hidden="true"></span>
        <span class="toast-badge" aria-hidden="true"><span class="icon">notifications_active</span></span>
        <span class="toast-text display-wide">{toast}</span>
        <button type="button" class="toast-close" aria-label="Dismiss" onclick={dismissToast}>
          <span class="icon outlined" aria-hidden="true">close</span>
        </button>
      </div>
    {/if}
  </div>
</section>

<style>
  .phone {
    position: relative;
    width: 360px;
    height: 760px;
    border-radius: 32px;
    overflow: hidden;
    /* Hero color behind the top half so the clipped hero's anti-aliased corners don't fringe white. */
    background: linear-gradient(var(--hero) 50%, var(--surface) 50%);
    color: var(--on-surface);
    /* A slightly lifted bezel in dark mode keeps the phone from melting into the page. */
    box-shadow:
      0 0 0 8px light-dark(#111, #2a2d34),
      0 30px 60px rgba(0, 0, 0, 0.22);
  }

  .status-bar {
    position: absolute;
    inset: 0 0 auto;
    height: 32px;
    z-index: 16;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 22px;
    font: 500 13px system-ui;
    color: var(--on-hero);
    pointer-events: none;
  }

  .status-icons {
    display: flex;
    gap: 5px;
  }

  .status-icons span {
    width: 14px;
    height: 10px;
    border-radius: 2px;
    background: currentColor;
  }

  .status-icons span + span {
    width: 20px;
    border-radius: 3px;
  }

  .scroller {
    position: absolute;
    inset: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    scrollbar-width: none;
    overscroll-behavior: contain;
  }

  .scroller::-webkit-scrollbar {
    display: none;
  }

  .hero-spacer {
    flex: none;
  }

  .sheet {
    flex: none;
    min-height: 690px;
    background: var(--surface);
    padding: 20px 16px 32px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .group {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .group-title {
    font-weight: 800;
    font-size: 16px;
    padding: 0 4px 5px;
  }

  .later {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .later button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    border: 0;
    border-radius: 6px 6px 20px 20px;
    background: var(--surface-container);
    padding: 10px 14px 10px 12px;
    text-align: left;
    cursor: pointer;
    transition: transform 394ms var(--sf);
  }

  .later li:first-child button {
    border-radius: 20px 20px 6px 6px;
  }

  .later button:active {
    transform: scale(0.98);
  }

  .later-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .later-title {
    font-weight: 700;
    font-size: 14px;
  }

  .later-crowd {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: var(--on-surface-variant);
  }

  .dots {
    display: flex;
    gap: 3px;
  }

  .dots span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .later-eta {
    font-size: 32px;
    line-height: 0.85;
    color: var(--primary);
  }

  .later-unit {
    font-size: 11px;
    font-weight: 700;
    color: var(--primary);
  }

  .timeline-heading {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .timeline-heading .group-title {
    flex: 1;
  }

  .timeline-heading span {
    font-size: 12px;
    color: var(--on-surface-variant);
    padding-right: 4px;
  }

  .timeline {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .timeline li {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 44px;
  }

  .rail {
    position: relative;
    flex: none;
    width: 24px;
    align-self: stretch;
    display: flex;
    justify-content: center;
  }

  .rail::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 6px;
    background: var(--primary);
    opacity: 0.35;
  }

  .terminus .rail::before {
    bottom: 50%;
  }

  .stop-dot {
    position: relative;
    align-self: center;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--surface);
    box-shadow: inset 0 0 0 3px var(--primary);
  }

  .terminus .stop-dot {
    width: 16px;
    height: 16px;
  }

  .stop-name {
    flex: 1;
    font-size: 14px;
    font-weight: 500;
  }

  .terminus .stop-name {
    font-weight: 800;
  }

  .stop-rel {
    font-size: 13px;
    color: var(--on-surface-variant);
  }

  .stop-clock {
    width: 44px;
    text-align: right;
    font-weight: 700;
    font-size: 14px;
  }

  .hero {
    position: absolute;
    inset: 0 0 auto;
    z-index: 10;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: var(--hero);
    color: var(--on-hero);
  }

  .hero::after {
    content: '';
    position: absolute;
    inset: auto 0 0;
    height: 1px;
    background: currentColor;
    opacity: 0.18;
  }

  .top-bar {
    flex: none;
    height: 96px;
    padding: 40px 12px 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .back {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .route-badge {
    flex: none;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: var(--hero);
    color: var(--on-hero);
    box-shadow: 0 0 0 2px var(--on-hero);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 850;
    font-stretch: 40%;
    font-size: 22px;
  }

  .route-name {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .route-to {
    font-weight: 800;
    font-size: 17px;
  }

  .route-from {
    font-size: 12px;
    opacity: 0.8;
  }

  .mini-eta {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    margin-right: 8px;
    font-size: 12px;
    font-weight: 700;
  }

  .mini-eta .display {
    font-size: 32px;
    line-height: 0.85;
  }

  .collapsible {
    flex: none;
    overflow: hidden;
  }

  .collapsible-inner {
    padding: 4px 20px 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    transform-origin: 0 0;
  }

  .lead {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 700;
  }

  .big-eta {
    display: flex;
    align-items: flex-end;
    gap: 6px;
  }

  .big-eta .display {
    font-size: 120px;
    line-height: 0.9;
  }

  .big-unit {
    flex: 1;
    font-weight: 700;
    font-size: 18px;
    margin-bottom: 6px;
  }

  .plate {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    margin-bottom: 4px;
    font: 500 11px 'Geist Mono', monospace;
  }

  .plate span + span {
    opacity: 0.8;
  }

  .hero-crowd {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
  }

  .pinned {
    flex: none;
    padding: 0 20px 18px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .strip {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .strip-track {
    position: relative;
    height: 56px;
    margin: 0 10px;
  }

  .track {
    position: absolute;
    inset: 34px 0 auto;
    height: 6px;
    border-radius: 3px;
    background: color-mix(in oklch, currentColor 30%, transparent);
  }

  .strip-stop,
  .strip-you {
    position: absolute;
    top: 31px;
    width: 12px;
    height: 12px;
    transform: translateX(-50%);
    border-radius: 50%;
    background: var(--surface);
    box-shadow: inset 0 0 0 3px var(--outline);
  }

  .strip-you {
    left: 100%;
    top: 27px;
    width: 20px;
    height: 20px;
    background: var(--primary);
    box-shadow: inset 0 0 0 3px var(--surface);
  }

  .chip {
    --icon-size: 14px;
    position: absolute;
    top: 24px;
    transform: translateX(-50%);
    height: 22px;
    min-width: 22px;
    padding: 0 6px;
    border: 0;
    border-radius: 11px;
    background: var(--surface);
    color: var(--primary);
    box-shadow: 0 0 0 2px var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2px;
    font-weight: 800;
    font-size: 11px;
    cursor: pointer;
    transition: all 394ms var(--sf);
  }

  .chip.on {
    top: 18px;
    height: 32px;
    min-width: 32px;
    border-radius: 16px;
    background: var(--primary);
    color: var(--on-primary);
    box-shadow: 0 0 0 2px var(--surface);
  }

  .strip-labels {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    font-weight: 600;
  }

  .strip-labels span {
    opacity: 0.75;
  }

  .strip-labels .you {
    font-weight: 800;
    opacity: 1;
  }

  .actions {
    --icon-size: 20px;
    display: flex;
    gap: 4px;
    height: 52px;
  }

  .notify,
  .route-action {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-weight: 700;
    font-size: 15px;
  }

  .notify {
    flex: 1;
    min-width: 0;
    border: 0;
    border-radius: 26px 8px 8px 26px;
    background: color-mix(in oklch, var(--on-hero) 18%, transparent);
    color: var(--on-hero);
    cursor: pointer;
    transition:
      background 252ms var(--fd),
      border-radius 394ms var(--sf),
      transform 394ms var(--sf);
  }

  .notify.on {
    background: var(--on-hero);
    color: var(--hero);
  }

  .notify:active {
    border-radius: 26px;
    transform: scale(0.97);
  }

  .route-action {
    flex: none;
    width: 112px;
    border-radius: 8px 26px 26px 8px;
    background: var(--accent);
    color: var(--on-accent);
  }

  /* Pages that crop the bottom of the phone raise the toast with --phone-toast-bottom so it stays in view. */
  .toast-region {
    position: absolute;
    inset: auto 12px var(--phone-toast-bottom, 24px);
    z-index: 20;
  }

  .toast {
    --icon-size: 27px;
    position: relative;
    border-radius: 32px;
    background: var(--primary-container);
    color: var(--on-primary-container);
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    overflow: hidden;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    animation:
      up 458ms var(--sd) both,
      fade 252ms var(--fd) both;
  }

  .toast-drain {
    position: absolute;
    inset: 0;
    background: color-mix(in oklch, var(--primary) 22%, var(--primary-container));
    transform-origin: 0 50%;
    animation: drain 2200ms linear both;
  }

  .toast-badge {
    position: relative;
    flex: none;
    width: 48px;
    height: 48px;
    background: var(--primary);
    color: var(--on-primary);
    clip-path: var(--flower);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .toast-badge .icon {
    animation: bob 612ms var(--sf) both;
  }

  .toast-text {
    position: relative;
    flex: 1;
    min-width: 0;
    font-size: 24px;
    padding-top: 3px;
    text-wrap: pretty;
  }

  .toast-close {
    --icon-size: 22px;
    position: relative;
    flex: none;
    width: 44px;
    height: 44px;
    border: 0;
    border-radius: 22px;
    background: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
</style>
