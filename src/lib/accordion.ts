const DURATION_MS = 394;
const FALLBACK_EASING = 'cubic-bezier(0.2, 0, 0, 1)';

interface AccordionOptions {
  animate?: boolean;
}

const prefersMotion = () =>
  typeof Element.prototype.animate === 'function' &&
  !(typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);

// Reuses the site's spring curve so the accordion moves like the rest of the page.
const springEasing = () => getComputedStyle(document.documentElement).getPropertyValue('--sd').trim() || FALLBACK_EASING;

/**
 * Animates a group of <details> as an exclusive accordion. The native `name` attribute keeps
 * exclusivity working without JavaScript, but it would snap the old item shut, so it is removed here.
 */
export function enhanceAccordion(root: HTMLElement, { animate = prefersMotion() }: AccordionOptions = {}) {
  const items = [...root.querySelectorAll('details')];
  const running = new WeakMap<HTMLDetailsElement, Animation>();

  const isShowing = (item: HTMLDetailsElement) => item.open && !item.classList.contains('closing');

  function resize(item: HTMLDetailsElement, opening: boolean) {
    if (!animate) {
      item.open = opening;
      return;
    }
    const startHeight = item.getBoundingClientRect().height;
    running.get(item)?.cancel();
    item.classList.toggle('closing', !opening);
    item.open = true;
    const summary = item.querySelector('summary');
    const endHeight = opening ? item.scrollHeight : (summary?.offsetHeight ?? 0);

    item.style.overflow = 'hidden';
    const animation = item.animate({ height: [`${startHeight}px`, `${endHeight}px`] }, { duration: DURATION_MS, easing: springEasing() });
    running.set(item, animation);
    animation.onfinish = () => {
      running.delete(item);
      item.style.overflow = '';
      item.classList.remove('closing');
      if (!opening) item.open = false;
    };
  }

  for (const item of items) {
    item.removeAttribute('name');
    item.querySelector('summary')?.addEventListener('click', (event) => {
      event.preventDefault();
      const opening = !isShowing(item);
      if (opening) {
        for (const other of items) if (other !== item && isShowing(other)) resize(other, false);
      }
      resize(item, opening);
    });
  }
}
