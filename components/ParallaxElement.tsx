'use client';

import { ReactNode, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useIsoLayoutEffect } from '@/lib/hooks';
import { prefersReducedMotion } from '@/lib/scroll';

type Props = {
  children: ReactNode;
  /** negative = moves up faster than scroll, positive = lags behind */
  speed?: number;
  rotate?: number;
  scaleTo?: number;
  className?: string;
  style?: React.CSSProperties;
  as?: 'div' | 'span' | 'li';
};

/** Depth parallax driven by scroll position — scrubbed, GPU-only props. */
export default function ParallaxElement({
  children,
  speed = 0.2,
  rotate = 0,
  scaleTo,
  className = '',
  style,
  as: Tag = 'div',
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: -speed * 50, rotate: -rotate, ...(scaleTo ? { scale: 1 } : {}) },
        {
          yPercent: speed * 50,
          rotate,
          ...(scaleTo ? { scale: scaleTo } : {}),
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
            invalidateOnRefresh: true,
          },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [speed, rotate, scaleTo]);

  return (
    <Tag ref={ref as never} className={className} style={style}>
      {children}
    </Tag>
  );
}
