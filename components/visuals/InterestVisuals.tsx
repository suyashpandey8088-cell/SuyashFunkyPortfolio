'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCanvasScene } from '@/lib/hooks';
import { prefersReducedMotion, scrollState } from '@/lib/scroll';

/* play only while on screen */
function useViewportLoop(build: (el: HTMLElement) => gsap.core.Timeline | undefined) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    if (prefersReducedMotion()) return;
    let tl: gsap.core.Timeline | undefined;
    const ctx = gsap.context(() => {
      tl = build(el);
      tl?.pause();
      ScrollTrigger.create({
        trigger: el,
        start: 'top 95%',
        end: 'bottom 5%',
        onToggle: (self) => (self.isActive ? tl?.play() : tl?.pause()),
      });
    }, el);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ref;
}

/* ----------------------------- CHESS ----------------------------- */
export function ChessViz() {
  const ref = useViewportLoop((el) => {
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.7, defaults: { ease: 'power3.inOut' } });
    const knight = el.querySelector('[data-piece="knight"]');
    const pawn = el.querySelector('[data-piece="pawn"]');
    const rook = el.querySelector('[data-piece="rook"]');
    const U = 25; // one square
    tl.to(pawn, { y: -U, duration: 0.5 })
      .to(knight, { x: U, y: -2 * U, duration: 0.7 }, '+=0.25')
      .to(rook, { x: -2 * U, duration: 0.6 }, '+=0.2')
      .to(pawn, { y: -2 * U, duration: 0.5 }, '+=0.15')
      .to(knight, { x: 2 * U, y: -U, duration: 0.7 }, '+=0.2')
      .to([knight, pawn, rook], { x: 0, y: 0, duration: 0.8, stagger: 0.08 }, '+=0.6');
    return tl;
  });

  return (
    <div className="viz viz--chess" ref={ref} aria-hidden="true">
      <svg viewBox="0 0 150 150" className="viz__svg">
        <g>
          {Array.from({ length: 36 }).map((_, i) => {
            const c = i % 6;
            const r = Math.floor(i / 6);
            return (
              <rect
                key={i}
                x={c * 25}
                y={r * 25}
                width="25"
                height="25"
                fill={(c + r) % 2 ? 'rgba(244,242,236,0.055)' : 'transparent'}
                stroke="rgba(244,242,236,0.09)"
                strokeWidth="0.5"
              />
            );
          })}
        </g>
        <text data-piece="rook" x="137" y="22" className="viz__piece" textAnchor="middle">
          ♜
        </text>
        <text data-piece="knight" x="37" y="135" className="viz__piece viz__piece--accent" textAnchor="middle">
          ♞
        </text>
        <text data-piece="pawn" x="87" y="110" className="viz__piece" textAnchor="middle">
          ♟
        </text>
      </svg>
    </div>
  );
}

/* --------------------------- BADMINTON --------------------------- */
export function BadmintonViz() {
  const ref = useViewportLoop((el) => {
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.35 });
    const shuttle = el.querySelector<SVGGElement>('[data-shuttle]');
    const trail = el.querySelector<SVGPathElement>('[data-trail]');
    if (!shuttle || !trail) return tl;
    const len = trail.getTotalLength();
    gsap.set(trail, { strokeDasharray: len, strokeDashoffset: len });
    const obj = { t: 0 };
    tl.to(obj, {
      t: 1,
      duration: 1.9,
      ease: 'power1.inOut',
      onUpdate: () => {
        const p = trail.getPointAtLength(obj.t * len);
        const p2 = trail.getPointAtLength(Math.min(len, obj.t * len + 2));
        const a = (Math.atan2(p2.y - p.y, p2.x - p.x) * 180) / Math.PI;
        shuttle.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${a + 90})`);
        gsap.set(trail, { strokeDashoffset: len * (1 - obj.t) });
      },
    })
      .to(trail, { opacity: 0, duration: 0.5 }, '-=0.15')
      .set(obj, { t: 0 })
      .set(trail, { opacity: 1, strokeDashoffset: len });
    return tl;
  });

  return (
    <div className="viz viz--badminton" ref={ref} aria-hidden="true">
      <svg viewBox="0 0 260 150" className="viz__svg">
        <line x1="130" y1="30" x2="130" y2="140" stroke="rgba(244,242,236,0.16)" strokeWidth="1" strokeDasharray="3 5" />
        <line x1="10" y1="140" x2="250" y2="140" stroke="rgba(244,242,236,0.16)" strokeWidth="1" />
        <path
          data-trail
          d="M 20 128 Q 130 -10 240 124"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.9"
        />
        <g data-shuttle>
          <circle cx="0" cy="0" r="3.2" fill="var(--accent)" />
          <path d="M -5 2 L 0 12 L 5 2 Z" fill="rgba(244,242,236,0.75)" />
        </g>
      </svg>
    </div>
  );
}

/* ----------------------------- COMICS ---------------------------- */
export function ComicsViz() {
  const ref = useViewportLoop((el) => {
    const panels = el.querySelectorAll('[data-panel]');
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.9, defaults: { ease: 'back.out(2.2)' } });
    tl.fromTo(panels, { scale: 0.2, opacity: 0, rotate: -12 }, { scale: 1, opacity: 1, rotate: 0, duration: 0.42, stagger: 0.1 })
      .to(panels, { rotate: (i) => (i % 2 ? 5 : -5), x: (i) => (i % 2 ? 10 : -10), duration: 0.5, ease: 'power2.inOut' }, '+=0.4')
      .to(panels, { rotate: 0, x: 0, duration: 0.45, ease: 'power2.inOut' }, '+=0.2')
      .to(panels, { scale: 0.2, opacity: 0, duration: 0.3, stagger: { each: 0.06, from: 'end' }, ease: 'power2.in' }, '+=0.5');
    return tl;
  });

  return (
    <div className="viz viz--comics" ref={ref} aria-hidden="true">
      <div className="viz__panels">
        <span data-panel className="viz__panel viz__panel--a" />
        <span data-panel className="viz__panel viz__panel--b" />
        <span data-panel className="viz__panel viz__panel--c">
          <i className="mono">POW</i>
        </span>
        <span data-panel className="viz__panel viz__panel--d" />
      </div>
    </div>
  );
}

/* ------------------------------ MUSIC ---------------------------- */
export function MusicViz() {
  const bars = 34;
  const state = useRef<number[]>(new Array(bars).fill(0.2));
  const ref = useCanvasScene((ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    if (w < 2) return;
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#2ED9FF';
    const gap = 3;
    const bw = (w - gap * (bars - 1)) / bars;
    const energy = 0.35 + scrollState.abs * 1.6;
    for (let i = 0; i < bars; i += 1) {
      const target =
        0.12 +
        Math.abs(Math.sin(t * 2.1 + i * 0.42)) * 0.45 * energy +
        Math.abs(Math.sin(t * 0.7 + i * 1.3)) * 0.3 * energy;
      state.current[i] += (Math.min(1, target) - state.current[i]) * 0.14;
      const bh = Math.max(2, state.current[i] * h * 0.92);
      ctx.fillStyle = i % 5 === 0 ? accent : `rgba(244,242,236,${0.22 + state.current[i] * 0.45})`;
      const x = i * (bw + gap);
      ctx.fillRect(x, (h - bh) / 2, bw, bh);
    }
  }, []);

  return (
    <div className="viz viz--music" aria-hidden="true">
      <canvas ref={ref} className="viz__canvas" />
    </div>
  );
}

/* ---------------------------- EXPLORING -------------------------- */
export function ExploreViz() {
  const ref = useViewportLoop((el) => {
    const path = el.querySelector<SVGPathElement>('[data-route]');
    const dot = el.querySelector<SVGCircleElement>('[data-rdot]');
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });
    if (!path || !dot) return tl;
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: `${len}`, strokeDashoffset: len });
    const obj = { t: 0 };
    tl.to(obj, {
      t: 1,
      duration: 2.6,
      ease: 'power1.inOut',
      onUpdate: () => {
        gsap.set(path, { strokeDashoffset: len * (1 - obj.t) });
        const p = path.getPointAtLength(obj.t * len);
        dot.setAttribute('cx', String(p.x));
        dot.setAttribute('cy', String(p.y));
      },
    })
      .to(dot, { attr: { r: 7 }, opacity: 0.2, duration: 0.5 }, '-=0.1')
      .set(dot, { attr: { r: 3.4 }, opacity: 1 })
      .set(obj, { t: 0 });
    return tl;
  });

  return (
    <div className="viz viz--explore" ref={ref} aria-hidden="true">
      <svg viewBox="0 0 240 150" className="viz__svg">
        {Array.from({ length: 7 }).map((_, i) => (
          <line
            key={i}
            x1={10 + i * 36}
            y1="10"
            x2={10 + i * 36}
            y2="140"
            stroke="rgba(244,242,236,0.06)"
            strokeWidth="0.6"
          />
        ))}
        {Array.from({ length: 4 }).map((_, i) => (
          <line
            key={i}
            x1="10"
            y1={20 + i * 36}
            x2="230"
            y2={20 + i * 36}
            stroke="rgba(244,242,236,0.06)"
            strokeWidth="0.6"
          />
        ))}
        <path
          data-route
          d="M 22 124 C 70 100, 58 48, 108 54 S 170 118, 220 28"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray="4 6"
        />
        <circle cx="22" cy="124" r="2.4" fill="rgba(244,242,236,0.5)" />
        <circle cx="220" cy="28" r="2.4" fill="rgba(244,242,236,0.5)" />
        <circle data-rdot cx="22" cy="124" r="3.4" fill="var(--accent)" />
      </svg>
    </div>
  );
}

export const INTEREST_VIZ: Record<string, () => React.ReactElement> = {
  chess: ChessViz,
  badminton: BadmintonViz,
  comics: ComicsViz,
  music: MusicViz,
  exploring: ExploreViz,
};
