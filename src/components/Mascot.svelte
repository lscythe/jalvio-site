<script lang="ts">
  import { type MascotMood, type MascotTone, mascotFigure } from '../lib/mascot';

  interface Props {
    mood?: MascotMood;
    tone?: MascotTone;
    size?: number;
    idle?: boolean;
  }

  let { mood = 'calm', tone = 'primary', size = 120, idle = true }: Props = $props();

  const figure = $derived(mascotFigure({ mood, tone, size, idle }));
</script>

<div class="mascot" style:width="{size}px" style:height="{size}px" aria-hidden="true">
  <div class="stage" style:transform="scale({figure.scale})">
    <div class="idle" style:animation={figure.idleAnimation}>
      <div
        class="body"
        style:left="{figure.body.left}px"
        style:top="{figure.body.top}px"
        style:width="{figure.body.width}px"
        style:height="{figure.body.height}px"
        style:clip-path={figure.clipPath}
        style:background={figure.bodyColor}
      ></div>
      <div class="eyes" style:top="{figure.eyeLine}px">
        {#each figure.eyes as eye}
          <div class="eye" style:left="{eye.x}px" style:transform="scaleX({eye.flip})">
            <div class="lid" class:blinking={figure.blinks}>
              {#each eye.parts as part}
                <div
                  class="part"
                  style:left="{part.left}px"
                  style:top="{part.top}px"
                  style:width="{part.width}px"
                  style:height="{part.height}px"
                  style:border-radius={part.radius}
                  style:background={part.fill}
                  style:border-color={part.border}
                  style:border-width={part.borderWidth}
                  style:transform="rotate({part.rotate}deg)"
                ></div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .mascot {
    position: relative;
    flex: none;
  }

  .stage {
    position: absolute;
    left: 0;
    top: 0;
    width: 100px;
    height: 100px;
    transform-origin: 0 0;
  }

  .idle {
    position: absolute;
    inset: 0;
    transform-origin: 50% 90%;
  }

  .body {
    position: absolute;
    transition:
      left 400ms var(--sf, ease),
      top 400ms var(--sf, ease),
      width 400ms var(--sf, ease),
      height 400ms var(--sf, ease),
      clip-path 500ms var(--sf, ease),
      background 300ms ease;
  }

  .eyes {
    position: absolute;
    left: 50px;
    width: 0;
    height: 0;
    transition: top 400ms var(--sf, ease);
  }

  .eye,
  .lid {
    position: absolute;
    left: 0;
    top: 0;
    width: 0;
    height: 0;
  }

  .eye {
    transition: left 400ms var(--sf, ease);
  }

  .blinking {
    animation: mm-blink 4.2s linear infinite;
  }

  .part {
    position: absolute;
    border-style: solid;
  }
</style>
