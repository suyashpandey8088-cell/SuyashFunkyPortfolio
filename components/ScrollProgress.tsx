'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { chapters } from '@/data/content';
import { scrollState, scrollTo } from '@/lib/scroll';

export default function ScrollProgress() {
  const [active, setActive] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    /* Chapter detection is positional rather than event-based: the page has
       sections that are *not* chapters (chaos), and a reload or deep link can
       drop the reader anywhere. Reading the position every frame always
       resolves to the right chapter, no matter how we got there. */
    const els = chapters.map((c) => document.getElementById(c.id));
    let tops: number[] = [];

    const measure = () => {
      tops = els.map((el) => {
        if (!el) return Number.POSITIVE_INFINITY;
        return el.getBoundingClientRect().top + window.scrollY;
      });
    };
    measure();

    const bar = barRef.current;
    const rail = railRef.current;

    const tick = () => {
      if (bar) bar.style.transform = `scaleX(${scrollState.progress || 0})`;
      if (rail) {
        rail.style.transform = `translateY(calc(-50% + ${(-scrollState.smooth * 14).toFixed(2)}px)) skewY(${(
          scrollState.smooth * 2.2
        ).toFixed(2)}deg)`;
      }

      const mark = window.scrollY + window.innerHeight * 0.45;
      let idx = 0;
      for (let i = 0; i < tops.length; i += 1) {
        if (tops[i] <= mark) idx = i;
      }
      if (idx !== activeRef.current) {
        activeRef.current = idx;
        setActive(idx);
        document.documentElement.style.setProperty('--accent', chapters[idx].accent);
      }
    };

    gsap.ticker.add(tick);
    ScrollTrigger.addEventListener('refresh', measure);
    window.addEventListener('resize', measure);

    return () => {
      gsap.ticker.remove(tick);
      ScrollTrigger.removeEventListener('refresh', measure);
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <>
      {/* desktop / tablet : vertical chapter rail */}
      <div className="rail" ref={railRef} aria-hidden="true">
        <div className="rail__line">
          <span className="rail__line-fill" style={{ height: `${((active + 1) / chapters.length) * 100}%` }} />
        </div>
        <ul className="rail__list">
          {chapters.map((c, i) => (
            <li key={c.id} className={`rail__item ${i === active ? 'is-active' : ''} ${i < active ? 'is-past' : ''}`}>
              <button
                className="rail__btn"
                onClick={() => scrollTo(`#${c.id}`, -1)}
                tabIndex={-1}
                data-cursor="click"
              >
                <span className="rail__num mono">{c.num}</span>
                <span className="rail__label mono">{c.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* mobile : minimal top progress line */}
      <div className="topbar" aria-hidden="true">
        <div className="topbar__fill" ref={barRef} />
      </div>

      {/* a11y: announce chapter changes without the visual noise */}
      <p className="sr-only" aria-live="polite">
        Chapter {chapters[active].num} of {chapters.length}: {chapters[active].label}
      </p>
    </>
  );
}
