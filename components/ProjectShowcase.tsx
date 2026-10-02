'use client';

import Image from 'next/image';
import { forwardRef, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import type { Project } from '@/data/content';
import { isTouch, prefersReducedMotion } from '@/lib/scroll';
import { Field } from './AnimatedText';

type Props = {
  project: Project;
  index: number;
  onOpen: (index: number, mediaEl: HTMLElement, trigger: HTMLElement) => void;
};

const ProjectShowcase = forwardRef<HTMLElement, Props>(function ProjectShowcase(
  { project, index, onOpen },
  ref,
) {
  const mediaRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media || isTouch() || prefersReducedMotion()) return;
    const inner = media.querySelector<HTMLElement>('.pcard__img');
    const ghostA = media.querySelector<HTMLElement>('.pcard__ghost--a');
    const ghostB = media.querySelector<HTMLElement>('.pcard__ghost--b');
    const reveal = media.querySelector<HTMLElement>('.pcard__hidden');
    if (!inner) return;

    const qx = gsap.quickTo(inner, 'x', { duration: 0.7, ease: 'power3.out' });
    const qy = gsap.quickTo(inner, 'y', { duration: 0.7, ease: 'power3.out' });
    const qrx = gsap.quickTo(media, 'rotateY', { duration: 0.8, ease: 'power3.out' });
    const qry = gsap.quickTo(media, 'rotateX', { duration: 0.8, ease: 'power3.out' });

    const onMove = (e: PointerEvent) => {
      const r = media.getBoundingClientRect();
      const nx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const ny = (e.clientY - (r.top + r.height / 2)) / r.height;
      qx(nx * 34);
      qy(ny * 26);
      qrx(nx * 9);
      qry(-ny * 7);
      if (ghostA) gsap.to(ghostA, { x: nx * 48 + 7, y: ny * 30, duration: 0.8, ease: 'power3.out' });
      if (ghostB) gsap.to(ghostB, { x: nx * 20 - 7, y: ny * 12, duration: 0.9, ease: 'power3.out' });
    };
    const onEnter = () => {
      gsap.to(inner, { scale: 1.1, duration: 0.9, ease: 'power3.out' });
      gsap.to(media, { '--split': 1, duration: 0.6, ease: 'power2.out' });
      if (reveal) gsap.to(reveal.querySelectorAll('.char'), { yPercent: 0, opacity: 1, duration: 0.6, stagger: 0.012, ease: 'power3.out' });
    };
    const onLeave = () => {
      gsap.to(inner, { scale: 1, x: 0, y: 0, duration: 1, ease: 'power3.out' });
      gsap.to(media, { rotateX: 0, rotateY: 0, '--split': 0, duration: 1, ease: 'power3.out' });
      if (ghostA) gsap.to(ghostA, { x: 0, y: 0, duration: 1, ease: 'power3.out' });
      if (ghostB) gsap.to(ghostB, { x: 0, y: 0, duration: 1, ease: 'power3.out' });
      if (reveal) gsap.to(reveal.querySelectorAll('.char'), { yPercent: 110, opacity: 0, duration: 0.4, ease: 'power2.in' });
    };

    media.addEventListener('pointermove', onMove);
    media.addEventListener('pointerenter', onEnter);
    media.addEventListener('pointerleave', onLeave);
    return () => {
      media.removeEventListener('pointermove', onMove);
      media.removeEventListener('pointerenter', onEnter);
      media.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <article
      className="pcard"
      ref={ref as React.Ref<HTMLElement>}
      data-i={index}
      style={{ '--pa': project.accent } as React.CSSProperties}
    >
      <div className="pcard__inner">
        <div className="pcard__media" ref={mediaRef} data-cursor="explore" data-project-media>
          <span className="pcard__ghost pcard__ghost--a" aria-hidden="true" />
          <span className="pcard__ghost pcard__ghost--b" aria-hidden="true" />
          <div className="pcard__img">
            <Image
              src={project.image}
              alt={project.alt}
              fill
              sizes="(max-width: 899px) 86vw, 46vw"
              quality={78}
              priority={index === 0}
            />
          </div>
          <span className="pcard__scrim" aria-hidden="true" />
          <span className="pcard__hidden display" aria-hidden="true">
            {'EXPLORE'.split('').map((c, i) => (
              <span className="char" key={i}>
                {c}
              </span>
            ))}
          </span>
          <span className="pcard__corner mono" aria-hidden="true">
            {project.index}
          </span>
        </div>

        <div className="pcard__body">
          <div className="pcard__top">
            <span className="pcard__index display">{project.index}</span>
            <span className="label pcard__tag">{project.tagline}</span>
          </div>

          <h3 className="pcard__name display">
            <Field value={project.name} />
          </h3>

          <p className="pcard__desc body-text">
            <Field value={project.description} />
          </p>

          <ul className="pcard__tech" aria-label="Technologies">
            {project.technologies.map((t, i) => (
              <li key={i} className="chip mono chip--ph">
                {t}
              </li>
            ))}
          </ul>

          <div className="pcard__foot">
            <span className="label">
              YEAR <Field value={project.year} />
            </span>
            <button
              ref={triggerRef}
              className="pcard__btn"
              data-cursor="view"
              onClick={() => {
                if (mediaRef.current && triggerRef.current) {
                  onOpen(index, mediaRef.current, triggerRef.current);
                }
              }}
              aria-label={`Explore project ${project.index}: ${project.name}`}
            >
              <span className="pcard__btn-label mono">EXPLORE</span>
              <span className="pcard__btn-arrow" aria-hidden="true">
                →
              </span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
});

export default ProjectShowcase;
