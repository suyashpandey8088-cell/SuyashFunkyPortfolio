'use client';

import type Lenis from 'lenis';

/* A tiny module-level store so any component can read scroll physics
   without re-rendering React on every frame. */

type ScrollState = {
  /* raw lenis velocity (px per frame-ish) */
  velocity: number;
  /* smoothed, normalised -1 … 1 */
  smooth: number;
  /* absolute smoothed 0 … 1 */
  abs: number;
  /* 0 … 1 over the whole document */
  progress: number;
  direction: 1 | -1;
  ready: boolean;
  reduced: boolean;
};

export const scrollState: ScrollState = {
  velocity: 0,
  smooth: 0,
  abs: 0,
  progress: 0,
  direction: 1,
  ready: false,
  reduced: false,
};

let lenis: Lenis | null = null;

export const setLenis = (instance: Lenis | null) => {
  lenis = instance;
};
export const getLenis = () => lenis;

export const stopScroll = () => lenis?.stop();
export const startScroll = () => lenis?.start();

export const scrollTo = (target: string | number | HTMLElement, offset = 0) => {
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.4 });
    return;
  }
  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: 'smooth' });
  } else {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    el?.scrollIntoView({ behavior: 'smooth' });
  }
};

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isTouch = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window);

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

/* maps v from [a,b] -> [0,1], clamped */
export const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* smootherstep — nicer than linear for scrubbed transforms */
export const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
