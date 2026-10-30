import '@testing-library/jest-dom/vitest';

// jsdom has no layout engine; Svelte's dimension bindings only need the observer to exist.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
