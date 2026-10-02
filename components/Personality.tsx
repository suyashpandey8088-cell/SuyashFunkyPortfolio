'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useIsoLayoutEffect, useMediaQuery } from '@/lib/hooks';
import { interests } from '@/data/content';
import { INTEREST_VIZ } from './visuals/InterestVisuals';

export default function Personality() {
  const root = useRef<HTMLElement>(null);
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');

  useIsoLayoutEffect(() => {
    const el = root.current;
    if (!el || reduced) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-pers-title] .word',
        { yPercent: 118, rotate: 6, opacity: 0 },
        {
          yPercent: 0,
          rotate: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.06,
          ease: 'power3.out',
          scrollTrigger: { trigger: '[data-pers-title]', start: 'top 85%', end: 'top 40%', scrub: 1 },
        },
      );

      gsap.utils.toArray<HTMLElement>('.pers__row').forEach((row, i) => {
        const dir = i % 2 === 0 ? -1 : 1;
        gsap.fromTo(
          row.querySelector('.pers__word'),
          { xPercent: dir * 26, opacity: 0.1, letterSpacing: '0.12em' },
          {
            xPercent: dir * -8,
            opacity: 1,
            letterSpacing: '-0.04em',
            ease: 'none',
            scrollTrigger: { trigger: row, start: 'top 90%', end: 'bottom 35%', scrub: 0.8 },
          },
        );
        gsap.fromTo(
          row.querySelector('.pers__viz'),
          { yPercent: 36, opacity: 0, scale: 0.9 },
          {
            yPercent: -18,
            opacity: 1,
            scale: 1,
            ease: 'none',
            scrollTrigger: { trigger: row, start: 'top 92%', end: 'bottom 30%', scrub: 0.8 },
          },
        );
        gsap.fromTo(
          row.querySelector('.pers__note'),
          { opacity: 0, y: 26 },
          {
            opacity: 1,
            y: 0,
            ease: 'power2.out',
            scrollTrigger: { trigger: row, start: 'top 80%', end: 'top 45%', scrub: 1 },
          },
        );
      });
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="weird" className="chapter pers" ref={root} aria-labelledby="pers-title">
      <div className="pers__head wrap">
        <span className="label label-accent">06 — WEIRD</span>
        <h2 className="pers__title display" id="pers-title" data-pers-title>
          <span className="sr-only">When I&apos;m not coding…</span>
          <span aria-hidden="true" className="pers__title-mask">
            {["WHEN", "I'M", 'NOT', 'CODING…'].map((w) => (
              <span className="word" key={w}>
                {w}
              </span>
            ))}
          </span>
        </h2>
      </div>

      <ul className="pers__rows">
        {interests.map((item, i) => {
          const Viz = INTEREST_VIZ[item.id];
          return (
            <li
              className="pers__row"
              key={item.id}
              style={{ '--pa': item.accent } as React.CSSProperties}
            >
              <span className="pers__idx mono" aria-hidden="true">
                0{i + 1}
              </span>
              <h3 className="pers__word display">{item.word}</h3>
              <div className="pers__viz" data-cursor="explore">
                {Viz ? <Viz /> : null}
              </div>
              <p className="pers__note body-text muted">{item.note}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
