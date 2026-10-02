'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { isTouch, prefersReducedMotion } from '@/lib/scroll';

type Props = {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  strength?: number;
  cursor?: string;
  ariaLabel?: string;
  target?: string;
  rel?: string;
};

export default function MagneticButton({
  children,
  className = '',
  href,
  onClick,
  strength = 0.38,
  cursor = 'click',
  ariaLabel,
  target,
  rel,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || isTouch() || prefersReducedMotion()) return;
    const inner = el.querySelector<HTMLElement>('.magnetic__inner') ?? el;
    const qx = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const qy = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
    const ix = gsap.quickTo(inner, 'x', { duration: 0.7, ease: 'power3.out' });
    const iy = gsap.quickTo(inner, 'y', { duration: 0.7, ease: 'power3.out' });

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      qx(x * strength);
      qy(y * strength * 0.8);
      ix(x * strength * 0.3);
      iy(y * strength * 0.3);
    };
    const onLeave = () => {
      qx(0);
      qy(0);
      ix(0);
      iy(0);
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [strength]);

  const cls = `magnetic ${className}`;

  if (href) {
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        className={cls}
        data-cursor={cursor}
        aria-label={ariaLabel}
        target={target}
        rel={rel}
      >
        <span className="magnetic__inner">{children}</span>
      </a>
    );
  }

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type="button"
      className={cls}
      onClick={onClick}
      data-cursor={cursor}
      aria-label={ariaLabel}
    >
      <span className="magnetic__inner">{children}</span>
    </button>
  );
}
