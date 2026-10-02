'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { scrollState } from '@/lib/scroll';

/**
 * Persistent background that evolves across the whole story:
 * three soft accent blobs + a perspective floor grid.
 * Driven from one gsap ticker — no per-blob ScrollTriggers.
 */
export default function Background() {
  const aRef = useRef<HTMLDivElement>(null);
  const bRef = useRef<HTMLDivElement>(null);
  const cRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const a = aRef.current;
    const b = bRef.current;
    const c = cRef.current;
    const grid = gridRef.current;
    if (!a || !b || !c || !grid) return;

    let t = 0;
    const tick = () => {
      t += 0.0032 + scrollState.abs * 0.012;
      const p = scrollState.progress;
      const v = scrollState.smooth;

      a.style.transform = `translate3d(${Math.sin(t) * 12 - p * 26}vw, ${
        Math.cos(t * 0.8) * 9 + p * 34 - v * 6
      }vh, 0) scale(${1 + Math.sin(t * 0.6) * 0.14 + scrollState.abs * 0.12})`;

      b.style.transform = `translate3d(${Math.cos(t * 0.7) * 16 + p * 32}vw, ${
        Math.sin(t * 0.55) * 12 - p * 42 + v * 8
      }vh, 0) scale(${1.1 + Math.cos(t * 0.5) * 0.18})`;

      c.style.transform = `translate3d(${Math.sin(t * 0.45 + 2) * 20}vw, ${
        Math.cos(t * 0.65 + 1) * 16 + p * 12
      }vh, 0) scale(${0.9 + Math.sin(t * 0.4) * 0.2})`;

      grid.style.transform = `perspective(620px) rotateX(74deg) translateY(${(p * 400) % 60}px) scale(${
        1 + scrollState.abs * 0.08
      })`;
      grid.style.opacity = String(0.22 + scrollState.abs * 0.2);
    };

    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  return (
    <div className="bg" aria-hidden="true">
      <div className="bg__blob bg__blob--a" ref={aRef} />
      <div className="bg__blob bg__blob--b" ref={bRef} />
      <div className="bg__blob bg__blob--c" ref={cRef} />
      <div className="bg__gridwrap">
        <div className="bg__grid" ref={gridRef} />
      </div>
    </div>
  );
}
