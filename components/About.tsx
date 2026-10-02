'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useIsoLayoutEffect } from '@/lib/hooks';
import { personalInfo } from '@/data/content';
import { prefersReducedMotion } from '@/lib/scroll';
import OrbCanvas from './visuals/OrbCanvas';
import { Field } from './AnimatedText';

export default function About() {
  const root = useRef<HTMLElement>(null);

  useIsoLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add({ desktop: '(min-width: 900px)', mobile: '(max-width: 899px)' }, (c) => {
        const { desktop } = c.conditions as { desktop: boolean };
        const k = desktop ? 1 : 0.6;

        /* ---- depth parallax on WHO / AM / I? ---- */
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

        tl.fromTo('[data-a="who"]', { yPercent: 36, scale: 0.92 }, { yPercent: -26, scale: 1.02, duration: 1 }, 0)
          .fromTo('[data-a="am"]', { yPercent: 95, xPercent: 8 * k }, { yPercent: -92, xPercent: -6 * k, duration: 1 }, 0)
          .fromTo('[data-a="i"]', { yPercent: 190, scale: 1.18 }, { yPercent: -205, scale: 0.86, duration: 1 }, 0)
          .fromTo('[data-a="ghost"]', { yPercent: -20, opacity: 0.08 }, { yPercent: 24, opacity: 0.16, duration: 1 }, 0)
          .to('[data-about-title]', { opacity: 0, filter: 'blur(10px)', duration: 0.16 }, 0.62)
          .fromTo(
            '[data-about-body]',
            { opacity: 0, y: () => window.innerHeight * 0.18 },
            { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' },
            0.56,
          )
          .to('[data-about-body]', { y: -40, duration: 0.18 }, 0.84);

        /* ---- mask reveal on the paragraph lines ---- */
        gsap.fromTo(
          '[data-mask-line] .line__inner',
          { yPercent: 115, rotate: 3 },
          {
            yPercent: 0,
            rotate: 0,
            ease: 'power3.out',
            stagger: 0.09,
            duration: 1,
            scrollTrigger: {
              trigger: '[data-about-body]',
              start: 'top 78%',
              end: 'top 28%',
              scrub: 1,
              invalidateOnRefresh: true,
            },
          },
        );

        gsap.fromTo(
          '[data-about-facts] li',
          { yPercent: 120, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            ease: 'power3.out',
            stagger: 0.08,
            duration: 1,
            scrollTrigger: { trigger: '[data-about-facts]', start: 'top 92%', end: 'top 55%', scrub: 1 },
          },
        );

        /* ---- the orb drifts + its frame clips open ---- */
        gsap.fromTo(
          '[data-about-orb]',
          { clipPath: 'circle(0% at 50% 50%)', scale: 1.25 },
          {
            clipPath: 'circle(72% at 50% 50%)',
            scale: 1,
            ease: 'power2.out',
            scrollTrigger: { trigger: '[data-about-body]', start: 'top 88%', end: 'top 40%', scrub: 1 },
          },
        );

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      });
      return () => mm.revert();
    }, el);

    return () => ctx.revert();
  }, []);

  const lines = personalInfo.about.split(/(?<=[,.])\s+/).reduce<string[]>((acc, cur) => {
    const last = acc[acc.length - 1];
    if (last && (last + ' ' + cur).length < 54) acc[acc.length - 1] = `${last} ${cur}`;
    else acc.push(cur);
    return acc;
  }, []);

  return (
    <section id="about" className="chapter about" ref={root} aria-labelledby="about-title">
      <div className="stage about__stage">
        <div className="about__ghost display" data-a="ghost" aria-hidden="true">
          WHO
        </div>

        <div className="about__title" data-about-title>
          <h2 id="about-title" className="sr-only">
            Who am I?
          </h2>
          <span className="about__word about__word--who display" data-a="who" aria-hidden="true">
            WHO
          </span>
          <span className="about__word about__word--am display outline" data-a="am" aria-hidden="true">
            AM
          </span>
          <span className="about__word about__word--i display" data-a="i" aria-hidden="true">
            I?
          </span>
        </div>

        <div className="about__body wrap" data-about-body>
          <div className="about__copy">
            <span className="label label-accent">02 — WHO</span>
            <p className="about__lead atext atext--mask" data-mask-line>
              {lines.map((l, i) => (
                <span className="line" key={i}>
                  <span className="line__inner">{l}</span>
                </span>
              ))}
            </p>
            <p className="about__sub body-text muted">{personalInfo.aboutSecondary}</p>

            <ul className="about__facts" data-about-facts>
              {personalInfo.facts.map((f) => (
                <li key={f.k}>
                  <span className="label">{f.k}</span>
                  <Field value={f.v} className="about__fact-v display" />
                </li>
              ))}
            </ul>
          </div>

          <div className="about__visual" data-about-orb data-cursor="explore">
            <OrbCanvas />
            <span className="about__visual-ring" aria-hidden="true" />
            <span className="label about__visual-cap">SCROLL VELOCITY → SPIN</span>
          </div>
        </div>
      </div>
    </section>
  );
}
