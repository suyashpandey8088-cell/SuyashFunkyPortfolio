'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useIsoLayoutEffect, useMediaQuery } from '@/lib/hooks';
import { personalInfo } from '@/data/content';
import { scrollTo } from '@/lib/scroll';
import MagneticButton from './MagneticButton';

/* the story, played backwards */
const REWIND = [
  "LET'S MAKE SOMETHING WEIRD.",
  'THINGS GET WEIRD HERE.',
  'SELECTED WORK',
  'THINGS I PLAY WITH.',
  'AI → DATA → AI → WEB → SOLUTIONS',
  'WHO AM I?',
  "HEY. I'M SUYASH.",
];

export default function Outro() {
  const root = useRef<HTMLElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');

  useIsoLayoutEffect(() => {
    const el = root.current;
    if (!el || reduced) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (!countRef.current) return;
            const r = Math.max(0, Math.min(100, Math.round(100 - ((self.progress - 0.42) / 0.5) * 100)));
            countRef.current.textContent = String(self.progress < 0.42 ? 100 : r).padStart(2, '0');
          },
        },
      });

      /* baseline states — also re-asserted inside the timeline so any
         seek (or a ScrollTrigger refresh/invalidate) resolves correctly */
      const MADE_IN = { yPercent: 130, opacity: 0, rotate: 8 };
      const BACK_IN = { yPercent: 120, opacity: 0 };
      gsap.set('[data-outro="made"] .char', MADE_IN);
      gsap.set('[data-outro="back"]', { yPercent: 46, autoAlpha: 0 });
      gsap.set('[data-outro="back"] .char', BACK_IN);

      /* YOU MADE IT. lands while the chapter is still sliding up, so the stage
         is never a blank frame on the hand-off from CONTACT. */
      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          end: 'top top',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      }).to('[data-outro="made"] .char', {
        yPercent: 0,
        opacity: 1,
        rotate: 0,
        duration: 1,
        stagger: 0.05,
        ease: 'power3.out',
      });

      tl.set('[data-outro="made"]', { scale: 1, yPercent: 0, opacity: 1 }, 0)
        .set('[data-outro="back"]', { yPercent: 46, autoAlpha: 0, filter: 'blur(0px)' }, 0)
        .set('[data-outro="back"] .char', BACK_IN, 0)
        .to('[data-outro="made"]', { scale: 0.44, yPercent: -62, duration: 0.12, ease: 'power2.inOut' }, 0.22)
        .to('[data-outro="made"]', { opacity: 0.16, duration: 0.06 }, 0.28)

        /* SCROLL BACK UP. */
        .set('[data-outro="back"]', { autoAlpha: 1 }, 0.26)
        .to('[data-outro="back"]', { yPercent: 14, duration: 0.14, ease: 'power2.out' }, 0.26)
        .to(
          '[data-outro="back"] .char',
          { yPercent: 0, opacity: 1, duration: 0.08, stagger: 0.008, ease: 'power3.out' },
          0.26,
        )
        .to('[data-outro="back"]', { opacity: 0, filter: 'blur(10px)', duration: 0.06 }, 0.44)

        /* the rewind */
        .fromTo('[data-rewind]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.03 }, 0.42)
        .to('[data-rewind-tape]', { yPercent: 62, duration: 0.5, ease: 'none' }, 0.42)
        .fromTo('[data-rewind-bar]', { scaleX: 1 }, { scaleX: 0, duration: 0.5, ease: 'none' }, 0.42)
        .to('[data-rewind-scan]', { yPercent: -400, duration: 0.5, ease: 'none' }, 0.42);

      gsap.utils.toArray<HTMLElement>('[data-rewind-line]').forEach((line, i) => {
        const at = 0.44 + i * 0.062;
        tl.fromTo(
          line,
          { opacity: 0, xPercent: i % 2 ? 26 : -26, filter: 'blur(9px)', scale: 1.1 },
          { opacity: 1, xPercent: 0, filter: 'blur(0px)', scale: 1, duration: 0.022, ease: 'power2.out' },
          at,
        ).to(line, { opacity: 0.12, duration: 0.02 }, at + 0.034);
      });

      gsap.set('[data-outro-final]', { autoAlpha: 0, yPercent: 40 });
      tl.set('[data-outro-final]', { autoAlpha: 0, yPercent: 40 }, 0)
        .to('[data-rewind-tape]', { opacity: 0.14, duration: 0.05 }, 0.89)
        .to('[data-rewind-scan]', { opacity: 0, duration: 0.04 }, 0.89)
        .to('[data-outro-final]', { autoAlpha: 1, yPercent: 0, duration: 0.05, ease: 'power3.out' }, 0.9);

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="outro" className={`chapter outro ${reduced ? 'is-static' : ''}`} ref={root} aria-labelledby="outro-title">
      <div className="stage outro__stage">
        <h2 className="sr-only" id="outro-title">
          You made it — scroll back up
        </h2>

        <p className="outro__big display" data-outro="made" aria-hidden="true">
          {['YOU', 'MADE', 'IT.'].map((w) => (
            <span className="outro__line" key={w}>
              {w.split('').map((c, i) => (
                <span className="char" key={i}>
                  {c}
                </span>
              ))}
            </span>
          ))}
        </p>

        <p className="outro__mid display outline" data-outro="back" aria-hidden="true">
          {['SCROLL', 'BACK UP.'].map((w) => (
            <span className="outro__line" key={w}>
              {w.split('').map((c, i) => (
                <span className="char" key={i}>
                  {c === ' ' ? '\u00A0' : c}
                </span>
              ))}
            </span>
          ))}
        </p>

        {/* ---------- rewind illusion ---------- */}
        <div className="rewind" data-rewind aria-hidden="true">
          <div className="rewind__scan" data-rewind-scan />
          <div className="rewind__hud mono">
            <span className="rewind__tag">◀◀ REWINDING</span>
            <span className="rewind__count">
              <span ref={countRef}>100</span>%
            </span>
          </div>
          <div className="rewind__barwrap">
            <span className="rewind__bar" data-rewind-bar />
          </div>
          <div className="rewind__tape" data-rewind-tape>
            {REWIND.map((line, i) => (
              <span className="rewind__line display" key={line} data-rewind-line style={{ '--i': i } as React.CSSProperties}>
                {line}
              </span>
            ))}
          </div>
        </div>

        <div className="outro__final" data-outro-final>
          <MagneticButton className="outro__btn" onClick={() => scrollTo(0)} ariaLabel="Scroll back to the top" strength={0.5}>
            <span className="display">BACK TO 00</span>
            <i aria-hidden="true">↑</i>
          </MagneticButton>
          <p className="outro__credit label">
            {personalInfo.name} — BUILT WITH NEXT.JS, GSAP &amp; LENIS · SCROLL IS THE STORY
          </p>
        </div>
      </div>
    </section>
  );
}
