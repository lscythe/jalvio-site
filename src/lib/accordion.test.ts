import { beforeEach, describe, expect, it, vi } from 'vitest';
import { enhanceAccordion } from './accordion';

function renderFaq() {
  document.body.innerHTML = `
    <div class="faq-list">
      <details name="faq" open><summary>One</summary><p>First answer</p></details>
      <details name="faq"><summary>Two</summary><p>Second answer</p></details>
      <details name="faq"><summary>Three</summary><p>Third answer</p></details>
    </div>`;
  const root = document.querySelector<HTMLElement>('.faq-list');
  if (!root) throw new Error('FAQ fixture did not render');
  const items = [...root.querySelectorAll('details')];
  const summaries = [...root.querySelectorAll('summary')];
  return { root, items, summaries };
}

const openStates = (items: HTMLDetailsElement[]) => items.map((item) => item.open);

describe('enhanceAccordion without animation', () => {
  beforeEach(() => document.body.replaceChildren());

  it('takes over exclusivity from the native name attribute', () => {
    const { root, items } = renderFaq();
    enhanceAccordion(root, { animate: false });

    expect(items.every((item) => !item.hasAttribute('name'))).toBe(true);
  });

  it('opens the clicked item and closes the one that was open', () => {
    const { root, items, summaries } = renderFaq();
    enhanceAccordion(root, { animate: false });

    summaries[1].click();

    expect(openStates(items)).toEqual([false, true, false]);
  });

  it('closes an open item when its summary is clicked again', () => {
    const { root, items, summaries } = renderFaq();
    enhanceAccordion(root, { animate: false });

    summaries[0].click();

    expect(openStates(items)).toEqual([false, false, false]);
  });
});

describe('enhanceAccordion with animation', () => {
  function stubAnimations(items: HTMLDetailsElement[]) {
    const animations: { onfinish: (() => void) | null; cancel: () => void }[] = [];
    for (const item of items) {
      item.animate = vi.fn(() => {
        const animation = { onfinish: null, cancel: vi.fn() };
        animations.push(animation);
        return animation as unknown as Animation;
      });
    }
    return animations;
  }

  it('opens immediately so the content can grow into view', () => {
    const { root, items, summaries } = renderFaq();
    stubAnimations(items);
    enhanceAccordion(root, { animate: true });

    summaries[2].click();

    expect(items[2].open).toBe(true);
    expect(items[2].animate).toHaveBeenCalled();
  });

  it('keeps a closing item open until its collapse finishes', () => {
    const { root, items, summaries } = renderFaq();
    const animations = stubAnimations(items);
    enhanceAccordion(root, { animate: true });

    summaries[0].click();

    expect(items[0].open).toBe(true);
    expect(items[0].classList.contains('closing')).toBe(true);

    animations[0].onfinish?.();

    expect(items[0].open).toBe(false);
    expect(items[0].classList.contains('closing')).toBe(false);
  });
});
