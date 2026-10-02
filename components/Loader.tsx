'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion, scrollState, startScroll, stopScroll } from '@/lib/scroll';

const FRAGMENTS = [
  'const story = scroll',
  '0x1F / BOOT',
  'gsap.timeline()',
  'lenis.on("scroll")',
  'AI → DATA → AI → WEB',
  'render(experience)',
  '[ok] shaders warm',
  'depth: 7 chapters',
];

export default function Loader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const num = numRef.current;
    const bar = barRef.current;
    if (!root || !num || !bar) return;

    const reduced = prefersReducedMotion();
    document.body.classList.add('is-locked');
    stopScroll();
    window.scrollTo(0, 0);

    const finish = () => {
      document.body.classList.remove('is-locked');
      scrollState.ready = true;
      startScroll();
      window.dispatchEvent(new CustomEvent('experience:ready'));
      requestAnimationFrame(() => ScrollTrigger.refresh());
      setDone(true);
    };

    if (reduced) {
      num.textContent = '100';
      gsap.set(bar, { scaleX: 1 });
      const t = window.setTimeout(() => {
        gsap.to(root, { autoAlpha: 0, duration: 0.3, onComplete: finish });
      }, 350);
      return () => window.clearTimeout(t);
    }

    const counter = { v: 0 };
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('[data-loader-title] .char', {
        yPercent: 120,
        opacity: 0,
        duration: 0.7,
        stagger: 0.022,
        ease: 'power4.out',
      })
        .from('[data-loader-frag]', { opacity: 0, duration: 0.4, stagger: 0.05 }, 0.15)
        .to(
          counter,
          {
            v: 100,
            duration: 1.85,
            ease: 'power2.inOut',
            onUpdate: () => {
              const v = Math.round(counter.v);
              num.textContent = String(v).padStart(2, '0');
            },
          },
          0.1,
        )
        .to(bar, { scaleX: 1, duration: 1.85, ease: 'power2.inOut' }, 0.1)
        // glitch pulses while loading
        .to(
          '[data-loader-title]',
          {
            keyframes: [
              { skewX: 7, x: -8, duration: 0.07 },
              { skewX: -5, x: 6, duration: 0.07 },
              { skewX: 0, x: 0, duration: 0.07 },
            ],
            repeat: 3,
            repeatDelay: 0.42,
          },
          0.5,
        )
        // exit: cinematic split wipe
        .addLabel('out', '+=0.12')
        .to('[data-loader-inner]', { opacity: 0, filter: 'blur(14px)', duration: 0.4 }, 'out')
        .to('[data-loader-panel="top"]', { yPercent: -101, duration: 1.0, ease: 'expo.inOut' }, 'out+=0.1')
        .to('[data-loader-panel="bottom"]', { yPercent: 101, duration: 1.0, ease: 'expo.inOut' }, 'out+=0.1')
        .to('[data-loader-seam]', { scaleX: 1, duration: 0.35, ease: 'power2.in' }, 'out')
        .to('[data-loader-seam]', { opacity: 0, duration: 0.5, ease: 'power2.out' }, 'out+=0.45')
        .add(finish, 'out+=0.62')
        .set(root, { display: 'none' });
    }, root);

    return () => ctx.revert();
  }, []);

  if (done) return null;

  return (
    <div className="loader" ref={rootRef} role="status" aria-live="polite" aria-label="Loading experience">
      <div className="loader__panel" data-loader-panel="top" />
      <div className="loader__panel loader__panel--b" data-loader-panel="bottom" />
      <div className="loader__seam" data-loader-seam />

      <div className="loader__inner" data-loader-inner>
        <div className="loader__frags" aria-hidden="true">
          {FRAGMENTS.map((f, i) => (
            <span
              key={f}
              className="loader__frag mono"
              data-loader-frag
              style={
                {
                  '--i': i,
                  top: `${8 + ((i * 11.3) % 82)}%`,
                  left: `${(i % 2 === 0 ? 4 : 58) + ((i * 7) % 26)}%`,
                } as React.CSSProperties
              }
            >
              {f}
            </span>
          ))}
        </div>

        <h2 className="loader__title display" data-loader-title>
          {'INITIALIZING EXPERIENCE'.split('').map((c, i) => (
            <span className="char" key={`${c}-${i}`}>
              {c === ' ' ? '\u00A0' : c}
            </span>
          ))}
        </h2>

        <div className="loader__meta">
          <span className="loader__num display">
            <span ref={numRef}>00</span>%
          </span>
          <span className="label">SUYASH PANDEY — PORTFOLIO</span>
        </div>

        <div className="loader__track">
          <div className="loader__bar" ref={barRef} />
        </div>
      </div>
    </div>
  );
}
