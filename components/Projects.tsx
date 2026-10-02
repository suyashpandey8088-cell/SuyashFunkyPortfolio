'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useIsoLayoutEffect, useMediaQuery } from '@/lib/hooks';
import { projects } from '@/data/content';
import { getLenis, prefersReducedMotion, startScroll, stopScroll } from '@/lib/scroll';
import ProjectShowcase from './ProjectShowcase';
import { Field } from './AnimatedText';

export default function Projects() {
  const root = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const counterRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [open, setOpen] = useState<number | null>(null);
  const sourceRect = useRef<DOMRect | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const detailMedia = useRef<HTMLDivElement>(null);
  const detailRoot = useRef<HTMLDivElement>(null);
  const lockedY = useRef(0);

  /* ---------------- horizontal gallery ---------------- */
  useIsoLayoutEffect(() => {
    const el = root.current;
    const track = trackRef.current;
    if (!el || !track || reduced) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      let centers: number[] = [];
      let first = 0;
      let last = 0;

      const measure = () => {
        const cards = cardsRef.current.filter(Boolean);
        centers = cards.map((c) => c.offsetLeft + c.offsetWidth / 2);
        first = centers[0] ?? 0;
        last = centers[centers.length - 1] ?? 0;
      };

      const apply = (p: number) => {
        const vw = window.innerWidth;
        // keep the active card optically centred inside the space left of the chapter rail
        const rail =
          parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue('--rail-space'),
          ) || 0;
        const centerX = (vw - rail) / 2;
        const trackX = centerX - first - p * (last - first);
        track.style.transform = `translate3d(${trackX.toFixed(2)}px,0,0)`;

        const cards = cardsRef.current.filter(Boolean);
        for (let i = 0; i < cards.length; i += 1) {
          const cx = centers[i] + trackX;
          const d = (cx - centerX) / vw; // -1 … 1 ish
          const ad = Math.min(Math.abs(d), 1.2);
          const scale = 1 - Math.min(ad, 1) * 0.15;
          const rotY = -d * 9;
          const blur = Math.min(ad * 4.5, 6);
          const op = 1 - Math.min(ad, 1) * 0.45;
          const el2 = cards[i];
          el2.style.transform = `perspective(1400px) translate3d(0,${(ad * 22).toFixed(
            2,
          )}px,0) rotateY(${rotY.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
          el2.style.filter = blur > 0.2 ? `blur(${blur.toFixed(2)}px)` : 'none';
          el2.style.opacity = op.toFixed(3);
          el2.classList.toggle('is-current', ad < 0.26);
        }

        const idx = Math.round(p * (cards.length - 1));
        if (counterRef.current) {
          counterRef.current.textContent = String(idx + 1).padStart(2, '0');
        }
        if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      };

      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          measure();
          apply(self.progress);
        },
        onUpdate: (self) => apply(self.progress),
      });

      measure();
      apply(0);

      /* header slides away as the gallery takes over */
      gsap.fromTo(
        '[data-proj-head]',
        { yPercent: 0, opacity: 1 },
        {
          yPercent: -140,
          opacity: 0,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top top', end: '+=60%', scrub: 0.5 },
        },
      );

      return () => st.kill();
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  /* ---------------- cinematic detail expand (FLIP) ---------------- */
  const handleOpen = useCallback(
    (index: number, mediaEl: HTMLElement, trigger: HTMLElement) => {
      sourceRect.current = mediaEl.getBoundingClientRect();
      returnFocus.current = trigger;
      lockedY.current = window.scrollY;
      stopScroll();
      document.body.classList.add('is-locked');
      setOpen(index);
    },
    [],
  );

  const handleClose = useCallback(() => {
    const media = detailMedia.current;
    const rootEl = detailRoot.current;
    const src = sourceRect.current;
    const finish = () => {
      document.body.classList.remove('is-locked');
      /* put the reader back exactly where they left the gallery */
      const y = lockedY.current;
      window.scrollTo(0, y);
      startScroll();
      getLenis()?.scrollTo(y, { immediate: true, force: true });
      setOpen(null);
      returnFocus.current?.focus({ preventScroll: true });
    };
    if (!media || !rootEl || !src || prefersReducedMotion()) return finish();

    const now = media.getBoundingClientRect();
    const sx = src.width / now.width;
    const sy = src.height / now.height;
    const img = media.querySelector<HTMLElement>('.pdetail__img');

    gsap
      .timeline({ onComplete: finish })
      .to(rootEl.querySelector('.pdetail__content'), { opacity: 0, y: 30, duration: 0.3, ease: 'power2.in' }, 0)
      .to(rootEl.querySelector('.pdetail__veil'), { opacity: 0, duration: 0.7, ease: 'power2.inOut' }, 0.1)
      .to(
        media,
        {
          x: src.left - now.left,
          y: src.top - now.top,
          scaleX: sx,
          scaleY: sy,
          duration: 0.78,
          ease: 'expo.inOut',
        },
        0.05,
      )
      .to(img, { scaleX: 1 / sx, scaleY: 1 / sy, duration: 0.78, ease: 'expo.inOut' }, 0.05)
      .to(rootEl, { opacity: 0, duration: 0.25 }, 0.55);
  }, []);

  useIsoLayoutEffect(() => {
    if (open === null) return;
    const media = detailMedia.current;
    const rootEl = detailRoot.current;
    const src = sourceRect.current;
    if (!media || !rootEl) return;

    if (prefersReducedMotion() || !src) {
      gsap.set(rootEl, { opacity: 1 });
      return;
    }

    const now = media.getBoundingClientRect();
    const sx = src.width / now.width;
    const sy = src.height / now.height;
    const img = media.querySelector<HTMLElement>('.pdetail__img');

    gsap.set(rootEl, { opacity: 1 });
    gsap.set(media, {
      x: src.left - now.left,
      y: src.top - now.top,
      scaleX: sx,
      scaleY: sy,
      transformOrigin: '0 0',
    });
    gsap.set(img, { scaleX: 1 / sx, scaleY: 1 / sy, transformOrigin: '0 0' });

    const tl = gsap.timeline();
    tl.fromTo(rootEl.querySelector('.pdetail__veil'), { opacity: 0 }, { opacity: 1, duration: 0.7, ease: 'power2.out' }, 0)
      .to(media, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 1.05, ease: 'expo.inOut' }, 0)
      .to(img, { scaleX: 1, scaleY: 1, duration: 1.05, ease: 'expo.inOut' }, 0)
      .fromTo(
        rootEl.querySelectorAll('[data-detail-row]'),
        { y: 46, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.07, ease: 'power3.out' },
        0.52,
      );
    return () => {
      tl.kill();
    };
  }, [open]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    const t = window.setTimeout(() => {
      detailRoot.current?.querySelector<HTMLElement>('.pdetail__close')?.focus();
    }, 120);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(t);
    };
  }, [open, handleClose]);

  const p = open !== null ? projects[open] : null;

  return (
    <section
      id="projects"
      className={`chapter projects ${reduced ? 'is-static' : ''}`}
      ref={root}
      aria-labelledby="projects-title"
      style={reduced ? undefined : { height: `${(projects.length + 1) * 100}vh` }}
    >
      <div className="stage projects__stage">
        <header className="projects__head" data-proj-head>
          <h2 id="projects-title" className="projects__title display">
            SELECTED<span className="outline"> WORK</span>
          </h2>
          <p className="label">SCROLL DOWN · MOVE SIDEWAYS</p>
        </header>

        <div className="projects__viewport">
          <div className="projects__track" ref={trackRef}>
            {projects.map((project, i) => (
              <ProjectShowcase
                key={project.id}
                project={project}
                index={i}
                onOpen={handleOpen}
                ref={(node: HTMLElement | null) => {
                  if (node) cardsRef.current[i] = node;
                }}
              />
            ))}
          </div>
        </div>

        <div className="projects__hud" aria-hidden="true">
          <span className="mono projects__counter">
            <span ref={counterRef}>01</span>
            <i>/</i>
            {String(projects.length).padStart(2, '0')}
          </span>
          <span className="projects__bar">
            <span className="projects__bar-fill" ref={barRef} />
          </span>
          <span className="label">05 — MADE</span>
        </div>
      </div>

      {/* ---------------- detail view ---------------- */}
      {p && (
        <div
          className="pdetail"
          ref={detailRoot}
          role="dialog"
          aria-modal="true"
          aria-label={`${p.name} — project detail`}
          style={{ '--pa': p.accent, opacity: 0 } as React.CSSProperties}
        >
          <div className="pdetail__veil" />
          <button className="pdetail__close" onClick={handleClose} data-cursor="click">
            <span className="mono">CLOSE</span>
            <i aria-hidden="true">✕</i>
          </button>

          <div className="pdetail__grid">
            <div className="pdetail__media" ref={detailMedia}>
              <div className="pdetail__img">
                <Image src={p.image} alt={p.alt} fill sizes="(max-width: 899px) 100vw, 52vw" quality={82} />
              </div>
            </div>

            <div className="pdetail__content">
              <div data-detail-row className="pdetail__row pdetail__row--head">
                <span className="label">PROJECT {p.index}</span>
                <h3 className="pdetail__name display">
                  <Field value={p.name} />
                </h3>
              </div>

              <div data-detail-row className="pdetail__row">
                <span className="label">DESCRIPTION</span>
                <p className="body-text">
                  <Field value={p.description} />
                </p>
              </div>

              <div data-detail-row className="pdetail__row pdetail__row--split">
                <div>
                  <span className="label">ROLE</span>
                  <p className="body-text">
                    <Field value={p.role} />
                  </p>
                </div>
                <div>
                  <span className="label">YEAR</span>
                  <p className="body-text">
                    <Field value={p.year} />
                  </p>
                </div>
              </div>

              <div data-detail-row className="pdetail__row">
                <span className="label">TECHNOLOGIES</span>
                <ul className="pdetail__tech">
                  {p.technologies.map((t, i) => (
                    <li key={i} className="chip mono chip--ph">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              <div data-detail-row className="pdetail__row">
                <span className="label">RESULT</span>
                <p className="body-text">
                  <Field value={p.result} />
                </p>
              </div>

              <div data-detail-row className="pdetail__row">
                <a
                  className="pdetail__link"
                  href={p.link}
                  target={p.link.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer noopener"
                  data-cursor="open"
                >
                  <span className="display">VISIT PROJECT</span>
                  <i aria-hidden="true">↗</i>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
