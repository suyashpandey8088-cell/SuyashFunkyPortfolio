'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useIsoLayoutEffect, useMediaQuery } from '@/lib/hooks';
import { personalInfo } from '@/data/content';
import { prefersReducedMotion, scrollTo } from '@/lib/scroll';

const vw = (n: number) => window.innerWidth * n;
const vh = (n: number) => window.innerHeight * n;

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const reducedMq = useMediaQuery('(prefers-reduced-motion: reduce)');

  useIsoLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);

    const reduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      /* ---------- intro (runs once the loader hands over) ---------- */
      const intro = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
      intro
        .from('[data-w="hey"] .char', {
          yPercent: 130,
          rotate: 9,
          duration: 1.25,
          stagger: 0.07,
        })
        .from('[data-hero-meta] > *', { y: 24, opacity: 0, duration: 0.9, stagger: 0.08 }, 0.35)
        .from('[data-hero-hint]', { opacity: 0, y: 16, duration: 0.8 }, 0.6)
        .from('[data-hero-ring]', { scale: 0.2, opacity: 0, duration: 1.6, stagger: 0.1 }, 0);

      const play = () => intro.play();
      window.addEventListener('experience:ready', play, { once: true });
      // if the loader already finished before hydration
      if (document.body.classList.contains('is-locked') === false) {
        gsap.delayedCall(0.05, () => intro.play());
      }

      if (reduced) return;

      /* ---------- scroll choreography ---------- */
      const mm = gsap.matchMedia();

      mm.add(
        {
          desktop: '(min-width: 900px)',
          mobile: '(max-width: 899px)',
        },
        (context) => {
          const { desktop } = context.conditions as { desktop: boolean };
          const k = desktop ? 1 : 0.62;

          const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: el,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          });

          /* ---- STAGE 1 — HEY. travels to the upper-left ---- */
          tl.to(
            '[data-w="hey"]',
            {
              x: () => -vw(0.34 * k),
              y: () => -vh(0.33),
              scale: desktop ? 0.26 : 0.34,
              rotate: -6,
              ease: 'power2.inOut',
              duration: 0.16,
            },
            0,
          )
            .to('[data-w="hey"]', { opacity: 0.35, duration: 0.1 }, 0.1)
            .to('[data-hero-hint]', { opacity: 0, y: -20, duration: 0.05 }, 0)

            /* ---- STAGE 2 — I'M enters from the right ---- */
            .fromTo(
              '[data-w="im"]',
              { x: () => vw(0.85), opacity: 0, skewX: -14 },
              { x: () => -vw(0.17 * k), opacity: 1, skewX: 0, duration: 0.2, ease: 'power3.out' },
              0.13,
            )
            .to('[data-w="im"]', { y: () => -vh(0.17), scale: 0.62, duration: 0.16, ease: 'power2.inOut' }, 0.3)

            /* ---- STAGE 3 — SUYASH. scales dramatically ---- */
            .fromTo(
              '[data-w="suyash"]',
              { scale: 0.08, opacity: 0, filter: 'blur(26px)', y: () => vh(0.12) },
              {
                scale: desktop ? 1 : 0.92,
                opacity: 1,
                filter: 'blur(0px)',
                y: 0,
                duration: 0.22,
                ease: 'power2.out',
              },
              0.28,
            )
            .to('[data-w="suyash"]', { letterSpacing: '-0.07em', duration: 0.2 }, 0.3)

            /* ---- exit the name block into depth ---- */
            .to(
              ['[data-w="im"]', '[data-w="suyash"]'],
              { scale: '+=0.9', opacity: 0, filter: 'blur(18px)', duration: 0.12, ease: 'power2.in' },
              0.5,
            )
            .to('[data-w="hey"]', { opacity: 0, y: () => -vh(0.5), duration: 0.08 }, 0.48)

            /* ---- STAGE 4 — I BUILD moves horizontally ---- */
            .fromTo(
              '[data-w="build"]',
              { x: () => -vw(1.05), y: () => -vh(0.22), opacity: 1, skewX: 16 },
              { x: () => vw(0.1 * k), y: () => -vh(0.22), skewX: 0, duration: 0.18, ease: 'power1.inOut' },
              0.52,
            )
            .to(
              '[data-w="build"]',
              { y: () => -vh(0.36), scale: 0.5, opacity: 0.32, duration: 0.12 },
              0.66,
            )

            /* ---- STAGE 5 — DIGITAL stretches past the viewport ---- */
            .fromTo(
              '[data-w="digital"]',
              { scaleX: 0.22, scaleY: 1.5, y: () => vh(0.04), opacity: 0, filter: 'blur(10px)' },
              {
                scaleX: 1.42,
                scaleY: 1,
                y: () => vh(0.04),
                opacity: 1,
                filter: 'blur(0px)',
                duration: 0.2,
                ease: 'power3.out',
              },
              0.64,
            )
            .to('[data-w="digital"]', { scaleX: 2.6, opacity: 0.1, duration: 0.13, ease: 'power2.in' }, 0.81)

            /* ---- STAGE 6 — EXPERIENCES. rotates and leaves ---- */
            .fromTo(
              '[data-w="exp"]',
              { y: () => vh(0.55), rotate: 7, opacity: 0, scale: 1.1 },
              { y: 0, rotate: -3, opacity: 1, scale: 1, duration: 0.17, ease: 'power3.out' },
              0.76,
            )
            .to(
              '[data-w="exp"]',
              { y: () => -vh(0.75), rotate: -11, scale: 1.35, opacity: 0, filter: 'blur(12px)', duration: 0.12 },
              0.9,
            )

            /* ---- background reacts the whole way through ---- */
            .to('[data-hero-rings]', { scale: 3.4, rotate: 42, opacity: 0, duration: 1 }, 0)
            .to('[data-hero-floor]', { yPercent: 46, opacity: 0.1, duration: 1 }, 0)
            .fromTo(
              '[data-hero-slab]',
              { yPercent: 118, rotate: 6 },
              { yPercent: 0, rotate: 0, duration: 0.3, ease: 'power2.inOut' },
              0.72,
            )
            .to('[data-hero-stage]', { scale: 0.86, filter: 'blur(6px)', duration: 0.1 }, 0.93);

          return () => {
            tl.scrollTrigger?.kill();
            tl.kill();
          };
        },
      );

      return () => {
        window.removeEventListener('experience:ready', play);
        mm.revert();
      };
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="hero"
      className={`chapter hero ${reducedMq ? 'is-static' : ''}`}
      ref={root}
      aria-label="Introduction"
    >
      <div className="stage hero__stage" data-hero-stage>
        {/* ---------- background ---------- */}
        <div className="hero__rings" data-hero-rings aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} data-hero-ring style={{ '--i': i } as React.CSSProperties} />
          ))}
        </div>
        <div className="hero__floor" data-hero-floor aria-hidden="true" />
        <div className="hero__slab" data-hero-slab aria-hidden="true" />

        {/* ---------- words ---------- */}
        <h1 className="hero__words">
          <span className="sr-only">
            Hey. I&apos;m Suyash. I build digital experiences.
          </span>

          <span className="hero__word hero__word--hey display" data-w="hey" aria-hidden="true">
            {'HEY.'.split('').map((c, i) => (
              <span className="char" key={i}>
                {c}
              </span>
            ))}
          </span>

          <span className="hero__word hero__word--im display outline" data-w="im" aria-hidden="true">
            I&apos;M
          </span>

          <span className="hero__word hero__word--suyash display" data-w="suyash" aria-hidden="true">
            SUYASH.
          </span>

          <span className="hero__word hero__word--build display display-narrow" data-w="build" aria-hidden="true">
            I BUILD
          </span>

          <span className="hero__word hero__word--digital display" data-w="digital" aria-hidden="true">
            DIGITAL
          </span>

          <span className="hero__word hero__word--exp display outline-accent" data-w="exp" aria-hidden="true">
            EXPERIENCES.
          </span>
        </h1>

        {/* ---------- meta ---------- */}
        <div className="hero__meta" data-hero-meta>
          <span className="label">{personalInfo.shortIdentity}</span>
          <span className="label hero__status">
            <i className="dot" aria-hidden="true" />
            {personalInfo.status}
          </span>
        </div>

        <button className="hero__hint" data-hero-hint onClick={() => scrollTo('#about', -1)} data-cursor="click">
          <span className="label">SCROLL TO BEGIN</span>
          <span className="hero__hint-line" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
