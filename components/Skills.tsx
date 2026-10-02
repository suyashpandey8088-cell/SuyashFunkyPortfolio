'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useIsoLayoutEffect, useMediaQuery } from '@/lib/hooks';
import { skills } from '@/data/content';

const GOLD = Math.PI * (3 - Math.sqrt(5));

export default function Skills() {
  const root = useRef<HTMLElement>(null);
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');

  useIsoLayoutEffect(() => {
    const el = root.current;
    if (!el || reduced) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add({ desktop: '(min-width: 900px)', mobile: '(max-width: 899px)' }, (c) => {
        const { desktop } = c.conditions as { desktop: boolean };
        const spread = desktop ? 1 : 0.58;
        const words = gsap.utils.toArray<HTMLElement>('.skills__word');

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.7,
            invalidateOnRefresh: true,
          },
        });

        /* ---- title ---- */
        tl.fromTo(
          '[data-skills-title] .line__inner',
          { yPercent: 118, rotate: 5 },
          { yPercent: 0, rotate: 0, duration: 0.09, stagger: 0.022, ease: 'power3.out' },
          0,
        )
          .to('[data-skills-title]', { scale: 0.42, yPercent: -34, xPercent: -26, duration: 0.18 }, 0.14)
          .to('[data-skills-title]', { autoAlpha: 0.22, duration: 0.1 }, 0.26)
          .to('[data-skills-title]', { autoAlpha: 0, duration: 0.05 }, 0.74);

        /* ---- the floating field ---- */
        words.forEach((word, i) => {
          const a = GOLD * i;
          const r = 0.26 + ((i * 0.137) % 1) * 0.3;
          const sx = () => Math.cos(a) * window.innerWidth * r * 1.25 * spread;
          const sy = () => Math.sin(a) * window.innerHeight * r * 0.95 * spread;
          const rot = (i % 2 ? 1 : -1) * (6 + ((i * 13) % 22));
          const depth = -600 + ((i * 211) % 900);

          tl.fromTo(
            word,
            {
              x: () => sx() * 1.5,
              y: () => sy() * 1.5,
              z: depth,
              rotate: rot * 1.6,
              scale: 0.55,
              opacity: 0,
              filter: 'blur(12px)',
            },
            {
              x: sx,
              y: sy,
              z: depth * 0.4,
              rotate: rot,
              scale: 1,
              opacity: 1,
              filter: 'blur(0px)',
              duration: 0.2,
              ease: 'power2.out',
            },
            0.1 + i * 0.012,
          )
            // slow drift + depth shuffle while the field is alive
            .to(
              word,
              {
                x: () => -sx() * 0.55,
                y: () => -sy() * 0.7,
                z: depth * -0.8,
                rotate: -rot * 0.6,
                scale: 1.18,
                duration: 0.3,
                ease: 'sine.inOut',
              },
              0.34,
            )
            // converge into one legible stack
            .to(
              word,
              {
                x: 0,
                y: () =>
                  (i - (words.length - 1) / 2) *
                  Math.min(window.innerHeight * 0.095, desktop ? 78 : 58),
                z: 0,
                rotate: 0,
                scale: desktop ? 0.62 : 0.68,
                opacity: 1,
                filter: 'blur(0px)',
                duration: 0.14,
                ease: 'power3.inOut',
              },
              0.64,
            )
            // EXPLODE
            .to(
              word,
              {
                x: () => Math.cos(a) * window.innerWidth * 1.5,
                y: () => Math.sin(a) * window.innerHeight * 1.5,
                z: 900,
                rotate: rot * 3,
                scale: 2.6,
                opacity: 0,
                filter: 'blur(14px)',
                duration: 0.14,
                ease: 'power3.in',
              },
              0.84,
            );
        });

        /* ---- convergence flash + shockwave ---- */
        tl.fromTo(
          '[data-skills-core]',
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 0.9, duration: 0.08, ease: 'power2.out' },
          0.78,
        )
          .to('[data-skills-core]', { scale: 26, opacity: 0, duration: 0.12, ease: 'power3.in' }, 0.84)
          .fromTo(
            '[data-skills-flash]',
            { opacity: 0 },
            { opacity: 0.85, duration: 0.03, ease: 'power2.in' },
            0.855,
          )
          .to('[data-skills-flash]', { opacity: 0, duration: 0.09, ease: 'power2.out' }, 0.885)
          .fromTo(
            '[data-skills-next]',
            { opacity: 0, yPercent: 40, filter: 'blur(10px)' },
            { opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: 0.07 },
            0.9,
          );

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      });
      return () => mm.revert();
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="skills" className={`chapter skills ${reduced ? 'is-static' : ''}`} ref={root} aria-labelledby="skills-title">
      <div className="stage skills__stage">
        <div className="skills__flash" data-skills-flash aria-hidden="true" />

        <h2 className="skills__title display atext atext--mask" id="skills-title" data-skills-title>
          <span className="sr-only">Things I play with</span>
          {['THINGS', 'I PLAY', 'WITH.'].map((l) => (
            <span className="line" key={l} aria-hidden="true">
              <span className="line__inner">{l}</span>
            </span>
          ))}
        </h2>

        <div className="skills__field" aria-hidden="true">
          <span className="skills__core" data-skills-core />
          {skills.map((s, i) => (
            <span
              key={s}
              className={`skills__word display ${i % 3 === 0 ? 'outline' : ''}`}
              style={{ '--i': i } as React.CSSProperties}
            >
              {s}
            </span>
          ))}
        </div>

        <ul className="sr-only">
          {skills.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>

        {/* static list used when motion is reduced */}
        <ul className="skills__static" aria-hidden="true">
          {skills.map((s) => (
            <li key={s} className="display">
              {s}
            </li>
          ))}
        </ul>

        <p className="skills__next label" data-skills-next aria-hidden="true">
          AND HERE IS WHAT CAME OUT OF IT ↓
        </p>
      </div>
    </section>
  );
}
