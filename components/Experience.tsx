'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useIsoLayoutEffect, useMediaQuery } from '@/lib/hooks';
import { experience, experienceConclusion, journeyChain } from '@/data/content';
import { Field } from './AnimatedText';
import JourneyCanvas from './visuals/JourneyCanvas';

/* how much of the chapter each internship owns */
const SLOT = 0.16; // 5 × 0.16 = 0.80, the last 0.20 is the conclusion
const BRIDGES = ['AI → DATA', 'DATA → AI', 'AI → WEB', 'WEB → SOLUTIONS'];

type Cfg = {
  from: gsap.TweenVars;
  to: gsap.TweenVars;
  stagger: number | gsap.StaggerVars;
  exit: gsap.TweenVars;
};

/* every internship gets its own entrance grammar */
const CFG: Cfg[] = [
  {
    // 01 — emerges out of the neural network
    from: { scale: 0, opacity: 0, filter: 'blur(14px)' },
    to: { scale: 1, opacity: 1, filter: 'blur(0px)' },
    stagger: { each: 0.0035, from: 'random' },
    exit: { scale: 1.3, filter: 'blur(10px)' },
  },
  {
    // 02 — snaps in as tabulated rows
    from: { xPercent: -24, opacity: 0, skewX: 14 },
    to: { xPercent: 0, opacity: 1, skewX: 0 },
    stagger: { each: 0.004, from: 'start' },
    exit: { xPercent: 18, filter: 'blur(6px)' },
  },
  {
    // 03 — arrives from depth
    from: { z: -900, opacity: 0, rotateX: 48 },
    to: { z: 0, opacity: 1, rotateX: 0 },
    stagger: { each: 0.0038, from: 'center' },
    exit: { z: 420, filter: 'blur(9px)' },
  },
  {
    // 04 — typed into existence
    from: { yPercent: 110, opacity: 0 },
    to: { yPercent: 0, opacity: 1 },
    stagger: { each: 0.006, from: 'start' },
    exit: { yPercent: -70, filter: 'blur(7px)' },
  },
  {
    // 05 — the climax, slammed in from the edges
    from: { yPercent: 118, opacity: 0, rotate: 4, scale: 1.08 },
    to: { yPercent: 0, opacity: 1, rotate: 0, scale: 1 },
    stagger: { each: 0.0022, from: 'edges' },
    exit: { yPercent: -40, scale: 0.85, filter: 'blur(8px)' },
  },
];

function Chars({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      {text.split(' ').map((word, wi, arr) => (
        <span className="word" key={wi}>
          {word.split('').map((c, i) => (
            <span className="char" key={i}>
              {c}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}

export default function Experience() {
  const root = useRef<HTMLElement>(null);
  const morph = useRef(0);
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');

  useIsoLayoutEffect(() => {
    const el = root.current;
    if (!el || reduced) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>('.exp__panel');
      const bridge = el.querySelector<HTMLElement>('[data-exp-bridge]');
      const bridgeText = el.querySelector<HTMLElement>('[data-exp-bridge-text]');
      const railFill = el.querySelector<HTMLElement>('[data-exp-fill]');
      const railItems = gsap.utils.toArray<HTMLElement>('.exp__rail-item');

      gsap.set(panels, { autoAlpha: 0 });
      gsap.set('[data-exp-outro] > *', { autoAlpha: 0 });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.65,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            const sp = Math.min(1, p / (SLOT * 5)) * 5;
            const i = Math.min(4, Math.floor(sp));
            const local = sp - i;
            const tMorph = Math.min(1, Math.max(0, (local - 0.74) / 0.26));
            morph.current = Math.min(4, i + tMorph * tMorph * (3 - 2 * tMorph));

            if (railFill) railFill.style.transform = `scaleY(${Math.min(1, p / (SLOT * 5))})`;

            const activeIndex = Math.min(4, Math.floor(sp + 0.26));
            railItems.forEach((item, ri) => {
              item.classList.toggle('is-active', ri === activeIndex);
              item.classList.toggle('is-past', ri < activeIndex);
            });

            if (bridge && bridgeText) {
              const show = i < 4 ? tMorph : 0;
              bridge.style.opacity = String(Math.sin(show * Math.PI) * 0.95);
              bridge.style.transform = `translate(-50%,-50%) scale(${0.9 + show * 0.2})`;
              if (show > 0.02 && bridgeText.textContent !== BRIDGES[i]) {
                bridgeText.textContent = BRIDGES[i];
              }
            }
          },
        },
      });

      /* ---------------- per-internship choreography ---------------- */
      panels.forEach((panel, i) => {
        const cfg = CFG[i];
        const start = i * SLOT;
        const title = panel.querySelectorAll('[data-reveal="title"] .char');
        const num = panel.querySelector('[data-reveal="num"]');
        const rows = panel.querySelectorAll<HTMLElement>('[data-reveal="row"]');
        const chips = panel.querySelectorAll<HTMLElement>('.chip');

        tl.set(panel, { autoAlpha: 1 }, start + 0.004)
          .fromTo(num, { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.022 }, start + 0.004)
          .fromTo(title, cfg.from, { ...cfg.to, duration: 0.05, stagger: cfg.stagger }, start + 0.008)
          .fromTo(
            rows,
            { clipPath: 'inset(0% 0% 100% 0%)', y: 22, opacity: 0 },
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              y: 0,
              opacity: 1,
              duration: 0.03,
              stagger: 0.0075,
              ease: 'power2.out',
            },
            start + 0.038,
          )
          .fromTo(
            chips,
            { scale: 0.4, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.02, stagger: 0.0035, ease: 'back.out(2)' },
            start + 0.062,
          )
          .to(panel, { ...cfg.exit, autoAlpha: 0, duration: 0.028 }, start + SLOT - 0.034);
      });

      /* ---------------- conclusion ---------------- */
      const O = SLOT * 5; // 0.80
      tl.to('[data-exp-canvas]', { autoAlpha: 0.12, scale: 1.35, duration: 0.05 }, O - 0.03)
        .to('[data-exp-rail]', { autoAlpha: 0, x: -40, duration: 0.03 }, O - 0.03)
        .to('[data-exp-canvas]', { autoAlpha: 0, duration: 0.04 }, O + 0.02);

      const lines = gsap.utils.toArray<HTMLElement>('[data-exp-line]');
      const slots = [
        [O + 0.015, O + 0.055],
        [O + 0.075, O + 0.115],
        [O + 0.135, O + 0.175],
      ];
      lines.forEach((line, i) => {
        const [a, b] = slots[i];
        tl.set(line, { autoAlpha: 1 }, a)
          .fromTo(
            line.querySelectorAll('.char'),
            { yPercent: 115, opacity: 0, rotate: 5 },
            { yPercent: 0, opacity: 1, rotate: 0, duration: 0.022, stagger: 0.0022, ease: 'power3.out' },
            a,
          )
          .to(line, { scale: 0.96, duration: 0.03 }, a + 0.022);
        if (i < 2) {
          tl.to(line.querySelectorAll('.char'), {
            yPercent: -110,
            opacity: 0,
            duration: 0.016,
            stagger: 0.0018,
            ease: 'power2.in',
          }, b)
            .set(line, { autoAlpha: 0 }, b + 0.018);
        }
      });

      tl.fromTo(
        '[data-exp-chain] span',
        { opacity: 0, yPercent: 60, filter: 'blur(8px)' },
        { opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: 0.03, stagger: 0.008 },
        O + 0.155,
      )
        .set('[data-exp-chain]', { autoAlpha: 1 }, O + 0.15)
        .to('[data-exp-outro]', { scale: 0.92, autoAlpha: 0, duration: 0.03 }, 0.975);

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      id="experience"
      className={`chapter exp ${reduced ? 'is-static' : ''}`}
      ref={root}
      aria-labelledby="exp-title"
    >
      <h2 id="exp-title" className="sr-only">
        Experience — five internships
      </h2>

      <div className="stage exp__stage">
        <div className="exp__canvas" data-exp-canvas>
          <JourneyCanvas morphRef={morph} />
        </div>

        {/* ---------- vertical timeline ---------- */}
        <div className="exp__rail" data-exp-rail aria-hidden="true">
          <span className="label exp__rail-cap">THE JOURNEY</span>
          <div className="exp__rail-track">
            <span className="exp__rail-fill" data-exp-fill />
          </div>
          <ul className="exp__rail-list">
            {experience.map((e, i) => (
              <li key={e.id} className={`exp__rail-item ${i === 0 ? 'is-active' : ''}`}>
                <span className="exp__rail-num display">{e.index}</span>
                <span className="exp__rail-dot" />
              </li>
            ))}
          </ul>
        </div>

        {/* ---------- transition caption ---------- */}
        <div className="exp__bridge" data-exp-bridge aria-hidden="true">
          <span className="display" data-exp-bridge-text>
            AI → DATA
          </span>
        </div>

        {/* ---------- internship panels ---------- */}
        <div className="exp__panels">
          {experience.map((e, i) => (
            <article className="exp__panel" key={e.id} data-i={i}>
              <div className="exp__panel-head">
                <span className="exp__num display" data-reveal="num" aria-hidden="true">
                  {e.index}
                </span>
                <span className="label exp__theme" style={{ color: e.accent }}>
                  {e.themeLabel}
                </span>
              </div>

              <h3 className={`exp__role display ${i === 4 ? 'exp__role--climax' : ''}`}>
                <span className="sr-only">{`${e.index} — ${e.role}`}</span>
                {i === 4 ? (
                  <span data-reveal="title">
                    <Chars text="SOLUTION" className="exp__role-line" />
                    <Chars text="DEVELOPER" className="exp__role-line" />
                    <Chars text="INTERN" className="exp__role-line" />
                  </span>
                ) : (
                  <span data-reveal="title">
                    <Chars text={e.role} />
                  </span>
                )}
              </h3>

              <div className="exp__meta">
                <div className="exp__meta-item" data-reveal="row">
                  <span className="label">COMPANY</span>
                  <Field value={e.company} className="exp__meta-v" />
                </div>
                <div className="exp__meta-item" data-reveal="row">
                  <span className="label">DURATION</span>
                  <Field value={e.duration} className="exp__meta-v" />
                </div>
              </div>

              <p className="exp__desc body-text" data-reveal="row">
                <Field value={e.description} />
              </p>

              <div className="exp__cols">
                <div className="exp__col" data-reveal="row">
                  <span className="label">RESPONSIBILITIES</span>
                  <ul className="exp__list">
                    {e.responsibilities.map((r, ri) => (
                      <li key={ri}>
                        <Field value={r} />
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="exp__col" data-reveal="row">
                  <span className="label">KEY LEARNING</span>
                  <ul className="exp__list">
                    {e.learnings.map((r, ri) => (
                      <li key={ri}>
                        <Field value={r} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <ul className="exp__tech" data-reveal="row" aria-label="Technologies">
                {e.technologies.map((t, ti) => (
                  <li key={ti} className="chip mono chip--ph">
                    {t}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {/* ---------- conclusion ---------- */}
        <div className="exp__outro" data-exp-outro>
          {experienceConclusion.map((line) => (
            <p className="exp__outro-line display" key={line} data-exp-line>
              <span className="sr-only">{line}</span>
              <Chars text={line} />
            </p>
          ))}
          <p className="exp__chain mono" data-exp-chain>
            {journeyChain.map((w, i) => (
              <span key={`${w}-${i}`}>
                {w}
                {i < journeyChain.length - 1 ? <i aria-hidden="true"> → </i> : null}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
