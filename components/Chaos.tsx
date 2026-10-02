'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useIsoLayoutEffect, useMediaQuery } from '@/lib/hooks';
import { scrollState } from '@/lib/scroll';

const STRIP_A = ['EXPERIMENT', 'BREAK IT', 'REBUILD', 'SHIP IT', 'REPEAT'];
const STRIP_B = ['CURIOUS', 'STUBBORN', 'FAST', 'WEIRD', 'ON PURPOSE'];

export default function Chaos() {
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
        const k = desktop ? 1 : 0.5;

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });

        /* The headline drifts sideways. The words are full-bleed blocks, so on a
           phone a percentage drift throws letters off-screen — there we swing a
           small pixel amount and lean on rotation/scale for the chaos instead. */
        const drift = (pct: number) => (desktop ? { xPercent: pct } : { x: pct * 0.22 });
        tl.fromTo('[data-chaos="w1"]', { ...drift(-70), rotate: -9 }, { ...drift(26), rotate: 4, duration: 1 }, 0)
          .fromTo('[data-chaos="w2"]', { ...drift(90), rotate: 11 }, { ...drift(-34), rotate: -6, duration: 1 }, 0)
          .fromTo('[data-chaos="w3"]', { ...drift(-46), rotate: 5, scale: 0.8 }, { ...drift(54), rotate: -3, scale: 1.1, duration: 1 }, 0)
          .fromTo('[data-chaos="w4"]', { ...drift(58), rotate: -14 }, { ...drift(-20), rotate: 8, duration: 1 }, 0)
          .fromTo('[data-chaos-blob]', { yPercent: 70, rotate: 0 }, { yPercent: -70, rotate: 220, duration: 1 }, 0);

        gsap.utils.toArray<HTMLElement>('[data-chaos-shape]').forEach((shape, i) => {
          const dirX = i % 2 === 0 ? -1 : 1;
          const dirY = i % 3 === 0 ? -1 : 1;
          gsap.fromTo(
            shape,
            { xPercent: dirX * (140 + i * 40) * k, yPercent: dirY * 110 * k, rotate: dirX * 80, scale: 0.6 },
            {
              xPercent: -dirX * (90 + i * 25) * k,
              yPercent: -dirY * 95 * k,
              rotate: -dirX * 120,
              scale: 1.25,
              ease: 'none',
              scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 + i * 0.25 },
            },
          );
        });

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      });

      /* velocity-driven marquees — speed and skew follow the scroll */
      const a = el.querySelector<HTMLElement>('[data-marquee="a"]');
      const b = el.querySelector<HTMLElement>('[data-marquee="b"]');
      let xa = 0;
      let xb = 0;
      const tick = () => {
        const v = scrollState.smooth;
        xa -= 0.9 + v * 9;
        xb += 0.7 + v * 7;
        if (a) {
          const w = a.scrollWidth / 2 || 1;
          xa = ((xa % w) + w) % w;
          a.style.transform = `translate3d(${-xa}px,0,0) skewX(${(-v * 7).toFixed(2)}deg)`;
        }
        if (b) {
          const w = b.scrollWidth / 2 || 1;
          xb = ((xb % w) + w) % w;
          b.style.transform = `translate3d(${xb - w}px,0,0) skewX(${(v * 7).toFixed(2)}deg)`;
        }
      };
      gsap.ticker.add(tick);

      return () => {
        gsap.ticker.remove(tick);
        mm.revert();
      };
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="chaos" className={`chapter chaos ${reduced ? 'is-static' : ''}`} ref={root} aria-labelledby="chaos-title">
      <div className="chaos__inner">
        <div className="chaos__blob" data-chaos-blob aria-hidden="true" />

        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={`chaos__shape chaos__shape--${i}`} data-chaos-shape aria-hidden="true" />
        ))}

        <h2 className="chaos__title" id="chaos-title">
          <span className="sr-only">Things get weird here.</span>
          <span className="chaos__word display" data-chaos="w1" aria-hidden="true">
            THINGS
          </span>
          <span className="chaos__word chaos__word--out display outline" data-chaos="w2" aria-hidden="true">
            GET
          </span>
          <span className="chaos__word display" data-chaos="w3" aria-hidden="true">
            WEIRD
          </span>
          <span className="chaos__word chaos__word--accent display" data-chaos="w4" aria-hidden="true">
            HERE.
          </span>
        </h2>

        <div className="chaos__marquees" aria-hidden="true">
          <div className="chaos__marquee">
            <div className="chaos__marquee-inner" data-marquee="a">
              {[...STRIP_A, ...STRIP_A].map((w, i) => (
                <span key={i} className="display">
                  {w}
                  <i>✸</i>
                </span>
              ))}
            </div>
          </div>
          <div className="chaos__marquee chaos__marquee--alt">
            <div className="chaos__marquee-inner" data-marquee="b">
              {[...STRIP_B, ...STRIP_B].map((w, i) => (
                <span key={i} className="display outline">
                  {w}
                  <i>✦</i>
                </span>
              ))}
            </div>
          </div>
        </div>

        <p className="chaos__note body-text">
          A portfolio should also show how someone thinks when nobody is grading the layout. So: controlled chaos —
          everything here still reads, it just refuses to sit still.
        </p>
      </div>
    </section>
  );
}
