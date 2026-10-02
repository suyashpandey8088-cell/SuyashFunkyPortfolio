'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useIsoLayoutEffect, useMediaQuery } from '@/lib/hooks';
import { personalInfo, socialLinks } from '@/data/content';
import { isTouch } from '@/lib/scroll';
import { Field } from './AnimatedText';
import MagneticButton from './MagneticButton';

const WORDS = ["LET'S", 'MAKE', 'SOMETHING', 'WEIRD.'];

export default function Contact() {
  const root = useRef<HTMLElement>(null);
  const blobRef = useRef<HTMLSpanElement>(null);
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');

  useIsoLayoutEffect(() => {
    const el = root.current;
    if (!el || reduced) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add({ desktop: '(min-width: 900px)', mobile: '(max-width: 899px)' }, (c) => {
        const { desktop } = c.conditions as { desktop: boolean };
        const k = desktop ? 1 : 0.55;

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

        /* the four words fly in from four different places and assemble */
        const starts = [
          { x: -1.1, y: -0.5, r: -18, s: 1.5 },
          { x: 1.2, y: 0.4, r: 14, s: 0.6 },
          { x: -0.9, y: 0.8, r: 9, s: 1.9 },
          { x: 1.0, y: -0.75, r: -12, s: 0.8 },
        ];
        WORDS.forEach((_, i) => {
          const s = starts[i];
          tl.fromTo(
            `[data-cw="${i}"]`,
            {
              x: () => s.x * window.innerWidth * k,
              y: () => s.y * window.innerHeight * k,
              rotate: s.r,
              scale: s.s,
              opacity: 0,
              filter: 'blur(14px)',
            },
            {
              x: 0,
              y: 0,
              rotate: 0,
              scale: 1,
              opacity: 1,
              filter: 'blur(0px)',
              duration: 0.3,
              ease: 'power3.out',
            },
            0.02 + i * 0.035,
          );
        });

        const LINK_IN = { yPercent: 118, opacity: 0, skewY: 5 };
        const FOOT_IN = { opacity: 0, y: 40 };
        gsap.set('[data-contact-links] .clink__a', LINK_IN);
        gsap.set('[data-contact-foot]', FOOT_IN);

        tl.set('[data-contact-links] .clink__a', LINK_IN, 0)
          .set('[data-contact-foot]', FOOT_IN, 0)
          .to('[data-contact-title]', { scale: desktop ? 0.4 : 0.5, yPercent: -34, duration: 0.14, ease: 'power2.inOut' }, 0.3)
          .to('[data-contact-title]', { opacity: 0.35, duration: 0.08 }, 0.36)
          .to(
            '[data-contact-links] .clink__a',
            { yPercent: 0, opacity: 1, skewY: 0, duration: 0.13, stagger: 0.03, ease: 'power3.out' },
            0.36,
          )
          .to('[data-contact-foot]', { opacity: 1, y: 0, duration: 0.08, ease: 'power2.out' }, 0.56)
          /* A deliberate tail: GSAP maps the scroll range onto the timeline's own
             duration, so without this the list would only finish assembling on the
             very last pixel of the chapter. This gives the links real dwell time. */
          .to({}, { duration: 0.32 }, 0.64);

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      });

      /* hover blob follows the pointer across the link list */
      const list = el.querySelector<HTMLElement>('[data-contact-links]');
      const blob = blobRef.current;
      if (list && blob && !isTouch()) {
        const qx = gsap.quickTo(blob, 'x', { duration: 0.7, ease: 'power3.out' });
        const qy = gsap.quickTo(blob, 'y', { duration: 0.7, ease: 'power3.out' });
        const onMove = (e: PointerEvent) => {
          const r = list.getBoundingClientRect();
          qx(e.clientX - r.left);
          qy(e.clientY - r.top);
        };
        const onEnter = () => gsap.to(blob, { scale: 1, opacity: 1, duration: 0.5 });
        const onLeave = () => gsap.to(blob, { scale: 0.3, opacity: 0, duration: 0.6 });
        list.addEventListener('pointermove', onMove);
        list.addEventListener('pointerenter', onEnter);
        list.addEventListener('pointerleave', onLeave);
        return () => {
          list.removeEventListener('pointermove', onMove);
          list.removeEventListener('pointerenter', onEnter);
          list.removeEventListener('pointerleave', onLeave);
          mm.revert();
        };
      }

      return () => mm.revert();
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="contact" className={`chapter contact ${reduced ? 'is-static' : ''}`} ref={root} aria-labelledby="contact-title">
      <div className="stage contact__stage">
        <h2 className="contact__title display" id="contact-title" data-contact-title>
          <span className="sr-only">Let&apos;s make something weird.</span>
          {WORDS.map((w, i) => (
            <span className="contact__word" key={w} data-cw={i} aria-hidden="true">
              {w}
            </span>
          ))}
        </h2>

        <div className="contact__links" data-contact-links>
          <span className="contact__blob" ref={blobRef} aria-hidden="true" />
          <ul>
            {socialLinks.map((l) => (
              <li className="clink" key={l.id}>
                <a
                  href={l.href}
                  target={l.external ? '_blank' : undefined}
                  rel={l.external ? 'noreferrer noopener' : undefined}
                  data-cursor={l.external ? 'open' : 'click'}
                  className="clink__a"
                >
                  <span className="clink__word display">{l.label}</span>
                  <span className="clink__meta mono">
                    <Field value={l.hint} />
                  </span>
                  <span className="clink__arrow" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="contact__foot" data-contact-foot>
          <div className="contact__foot-col">
            <span className="label">STATUS</span>
            <span className="contact__status">
              <i className="dot" aria-hidden="true" />
              {personalInfo.status}
            </span>
          </div>
          <div className="contact__foot-col">
            <span className="label">BASED IN</span>
            <Field value={personalInfo.location} className="contact__foot-v" />
          </div>
          <MagneticButton
            className="contact__cta"
            href={socialLinks[0].href}
            cursor="click"
            ariaLabel="Send an email"
          >
            <span className="display">SAY HELLO</span>
            <i aria-hidden="true">→</i>
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
