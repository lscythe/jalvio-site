<script lang="ts">
  import { onMount } from 'svelte';
  import { parseOverride, resolveTheme, THEME_STORAGE_KEY, type Theme, toggledOverride } from '../lib/colorScheme';

  let override = $state<Theme | null>(null);
  let prefersDark = $state(false);

  const theme = $derived(resolveTheme(override, prefersDark));
  const target = $derived(theme === 'dark' ? 'light' : 'dark');

  onMount(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    prefersDark = media.matches;
    override = parseOverride(document.documentElement.dataset.theme ?? readStored());
    const follow = (event: MediaQueryListEvent) => (prefersDark = event.matches);
    media.addEventListener('change', follow);
    return () => media.removeEventListener('change', follow);
  });

  function toggle() {
    override = toggledOverride(override, prefersDark);
    const root = document.documentElement;
    if (override) root.dataset.theme = override;
    else delete root.dataset.theme;
    store(override);
  }

  // Storage can be unavailable (private mode, blocked site data); the toggle still works for the visit.
  function readStored() {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function store(value: Theme | null) {
    try {
      if (value) localStorage.setItem(THEME_STORAGE_KEY, value);
      else localStorage.removeItem(THEME_STORAGE_KEY);
    } catch {}
  }
</script>

<button type="button" class="toggle" aria-label="Switch to {target} theme" title="Switch to {target} theme" onclick={toggle}>
  <span class="icon" aria-hidden="true">{target}_mode</span>
</button>

<style>
  .toggle {
    flex: none;
    width: 44px;
    height: 44px;
    border: 0;
    border-radius: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in oklch, currentColor 14%, transparent);
    color: inherit;
    cursor: pointer;
    transition:
      border-radius 394ms var(--sf),
      background 252ms var(--fd);
  }

  .toggle:hover {
    background: color-mix(in oklch, currentColor 22%, transparent);
  }

  .toggle:active {
    border-radius: 14px;
  }
</style>
