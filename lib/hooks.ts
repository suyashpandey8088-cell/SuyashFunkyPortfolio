'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from './scroll';

export const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

/* ------------------------------------------------------------------
   Canvas scene helper.
   - handles DPR + resize
   - pauses the rAF loop whenever the canvas is off-screen
   - respects prefers-reduced-motion (renders a single static frame)
   ------------------------------------------------------------------ */
export function useCanvasScene(
  render: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number, dt: number) => void,
  deps: unknown[] = [],
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderRef = useRef(render);
  renderRef.current = render;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = performance.now();
    let start = last;
    let visible = true;
    let running = false;

    const dpr = () => Math.min(window.devicePixelRatio || 1, 2);

    /* a bad draw call must never be able to unmount the React tree */
    let failures = 0;
    const safeRender = (t: number, dt: number) => {
      if (failures > 4) return;
      try {
        renderRef.current(ctx, w, h, t, dt);
      } catch (err) {
        failures += 1;
        if (failures === 1) console.warn('[canvas] render skipped:', err);
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      const ratio = dpr();
      canvas.width = Math.round(w * ratio);
      canvas.height = Math.round(h * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      if (!running) safeRender(0, 0);
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(64, now - last);
      last = now;
      if (!visible) return;
      safeRender((now - start) / 1000, dt / 16.666);
    };

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
      },
      { rootMargin: '120px' },
    );
    io.observe(canvas);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    if (reduced) {
      // one static, representative frame
      safeRender(2.2, 0);
    } else {
      running = true;
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return canvasRef;
}
