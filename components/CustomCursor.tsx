'use client';

import { useEffect, useRef } from 'react';
import { isTouch, prefersReducedMotion } from '@/lib/scroll';

type CursorMode = 'default' | 'view' | 'open' | 'explore' | 'click' | 'drag' | 'hide';

const LABELS: Record<CursorMode, string> = {
  default: '',
  view: 'VIEW',
  open: 'OPEN',
  explore: 'EXPLORE',
  click: 'CLICK',
  drag: 'DRAG',
  hide: '',
};

/**
 * Dot + lerped follower ring. Mode is driven by `data-cursor="view|open|explore|click"`
 * anywhere in the tree (event delegation, so new nodes just work).
 * Completely disabled on coarse pointers.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isTouch() || prefersReducedMotion()) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return;

    document.documentElement.classList.add('has-custom-cursor');

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let dx = mx;
    let dy = my;
    let rx = mx;
    let ry = my;
    let raf = 0;
    let mode: CursorMode = 'default';
    let down = false;

    const setMode = (next: CursorMode) => {
      if (next === mode) return;
      mode = next;
      ring.dataset.mode = next;
      dot.dataset.mode = next;
      label.textContent = LABELS[next];
    };

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (ring.dataset.visible !== 'true') {
        dx = rx = mx;
        dy = ry = my;
        ring.dataset.visible = 'true';
        dot.dataset.visible = 'true';
      }
    };

    const onOver = (e: Event) => {
      const target = e.target as HTMLElement | null;
      const host = target?.closest?.('[data-cursor]') as HTMLElement | null;
      if (host?.dataset.cursor) {
        setMode(host.dataset.cursor as CursorMode);
        return;
      }
      const link = target?.closest?.('a, button, [role="button"]') as HTMLElement | null;
      if (link) {
        const isExternal =
          link.tagName === 'A' && (link.getAttribute('target') === '_blank' || /^https?:/.test(link.getAttribute('href') || ''));
        setMode(isExternal ? 'open' : 'click');
        return;
      }
      setMode('default');
    };

    const onLeave = () => {
      ring.dataset.visible = 'false';
      dot.dataset.visible = 'false';
    };
    const onEnter = () => {
      ring.dataset.visible = 'true';
      dot.dataset.visible = 'true';
    };
    const onDown = () => {
      down = true;
      ring.dataset.down = 'true';
    };
    const onUp = () => {
      down = false;
      ring.dataset.down = 'false';
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      dx += (mx - dx) * 0.42;
      dy += (my - dy) * 0.42;
      rx += (mx - rx) * 0.13;
      ry += (my - ry) * 0.13;
      // squash the ring slightly in the direction of travel
      const vx = mx - rx;
      const vy = my - ry;
      const speed = Math.min(Math.hypot(vx, vy) / 140, 0.34);
      const angle = (Math.atan2(vy, vx) * 180) / Math.PI;
      dot.style.transform = `translate3d(${dx}px, ${dy}px, 0) translate(-50%, -50%)`;
      ring.style.transform =
        `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) rotate(${angle}deg) scale(${
          1 + speed + (down ? -0.12 : 0)
        }, ${1 - speed * 0.75 + (down ? -0.12 : 0)})`;
      label.style.transform = `rotate(${-angle}deg)`;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    document.addEventListener('focusin', onOver, { passive: true });
    document.addEventListener('pointerdown', onDown, { passive: true });
    document.addEventListener('pointerup', onUp, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('focusin', onOver);
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
    };
  }, []);

  return (
    <div className="cursor-layer" aria-hidden="true">
      <div ref={dotRef} className="cursor-dot" data-visible="false" data-mode="default" />
      <div ref={ringRef} className="cursor-ring" data-visible="false" data-mode="default">
        <span ref={labelRef} className="cursor-label" />
      </div>
    </div>
  );
}
