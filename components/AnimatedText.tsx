'use client';

import { ElementType, ReactNode } from 'react';
import { isPlaceholder } from '@/data/content';

/* ------------------------------------------------------------------
   SplitText-lite — no paid GSAP plugin needed.
   Produces  .line > .line__inner > .word > .char  so any mask / stagger
   animation can target exactly the granularity it wants.
   ------------------------------------------------------------------ */

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  /** split granularity used for the innermost spans */
  by?: 'word' | 'char';
  /** wrap each line in an overflow-clipped mask (for reveal-from-below) */
  mask?: boolean;
  /** split source on this token to force line breaks */
  lineBreak?: string;
  style?: React.CSSProperties;
  'aria-hidden'?: boolean;
};

export default function AnimatedText({
  text,
  as: Tag = 'span',
  className = '',
  by = 'word',
  mask = false,
  lineBreak = '\n',
  style,
  ...rest
}: Props) {
  const lines = text.split(lineBreak);

  return (
    <Tag className={`atext ${mask ? 'atext--mask' : ''} ${className}`} style={style} {...rest}>
      <span className="sr-only">{text.replace(/\n/g, ' ')}</span>
      <span aria-hidden="true">
        {lines.map((line, li) => (
          <span className="line" key={`l-${li}`}>
            <span className="line__inner">
              {line.split(' ').map((word, wi) => (
                <span className="word" key={`w-${li}-${wi}`}>
                  {by === 'char'
                    ? word.split('').map((c, ci) => (
                        <span className="char" key={`c-${li}-${wi}-${ci}`}>
                          {c}
                        </span>
                      ))
                    : word}
                  {wi < line.split(' ').length - 1 ? '\u00A0' : ''}
                </span>
              ))}
            </span>
          </span>
        ))}
      </span>
    </Tag>
  );
}

/* Placeholder-aware field — anything wrapped in [ brackets ] renders as a
   visibly unfilled slot so it is obvious what still needs real content. */
export function Field({
  value,
  className = '',
  as: Tag = 'span',
}: {
  value: string;
  className?: string;
  as?: ElementType;
}) {
  const ph = isPlaceholder(value);
  return <Tag className={`${className} ${ph ? 'ph' : ''}`}>{value}</Tag>;
}

export function Chip({ value }: { value: string }) {
  return <li className={`chip mono ${isPlaceholder(value) ? 'chip--ph' : ''}`}>{value}</li>;
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`eyebrow label ${className}`}>
      <i aria-hidden="true" />
      {children}
    </span>
  );
}
