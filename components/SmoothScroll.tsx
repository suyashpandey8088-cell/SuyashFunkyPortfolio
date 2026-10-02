'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { clamp, prefersReducedMotion, scrollState, setLenis } from '@/lib/scroll';

/**
 * Lenis <-> GSAP ScrollTrigger bridge.
 * Also publishes smoothed scroll velocity to a CSS custom property so that
 * purely-visual velocity reactions cost zero React renders.
 */
export default function SmoothScroll() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const reduced = prefersReducedMotion();
    scrollState.reduced = reduced;

    const lenis = new Lenis({
      lerp: reduced ? 1 : 0.085,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      smoothWheel: !reduced,
      syncTouch: false,
      autoRaf: false,
      anchors: false,
    });
    setLenis(lenis);
    // handy for debugging / automated checks
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    if (!scrollState.ready) lenis.stop();

    const root = document.documentElement;
    let raw = 0;

    const onScroll = (e: { velocity: number; progress: number; direction: 1 | -1 | 0 }) => {
      raw = e.velocity;
      scrollState.velocity = e.velocity;
      scrollState.progress = e.progress;
      if (e.direction !== 0) scrollState.direction = e.direction;
      ScrollTrigger.update();
    };
    lenis.on('scroll', onScroll);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
      // smooth + normalise
      const target = clamp(raw / 42, -1, 1);
      scrollState.smooth += (target - scrollState.smooth) * 0.12;
      if (Math.abs(scrollState.smooth) < 0.0008) scrollState.smooth = 0;
      scrollState.abs = Math.abs(scrollState.smooth);
      if (!reduced) {
        root.style.setProperty('--vel', scrollState.smooth.toFixed(4));
        root.style.setProperty('--vel-abs', scrollState.abs.toFixed(4));
      }
    };

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // keep ScrollTrigger honest when fonts / images settle in
    const refresh = () => ScrollTrigger.refresh();
    const t1 = window.setTimeout(refresh, 400);
    const t2 = window.setTimeout(refresh, 1600);
    if (document.fonts) document.fonts.ready.then(refresh).catch(() => {});
    window.addEventListener('load', refresh);

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        lenis.resize();
        ScrollTrigger.refresh();
      }, 180);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      window.removeEventListener('load', refresh);
      gsap.ticker.remove(tick);
      lenis.off('scroll', onScroll);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
