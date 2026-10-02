'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { chapters } from '@/data/content';
import { scrollTo, startScroll, stopScroll } from '@/lib/scroll';

const items = chapters.filter((c) => c.menu);

export default function Nav() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (open) stopScroll();
    else startScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
        triggerRef.current?.focus();
      }
      if (e.key === 'Tab' && open && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>('a, button');
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => {
        panelRef.current?.querySelector<HTMLElement>('a, button')?.focus();
      }, 420);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    window.setTimeout(() => scrollTo(`#${id}`, -1), reduced ? 10 : 520);
  };

  const dur = reduced ? 0.01 : 0.9;

  return (
    <>
      <header className="nav">
        <button
          className="nav__brand"
          onClick={() => scrollTo(0)}
          data-cursor="click"
          aria-label="Suyash Pandey — back to top"
        >
          <span className="nav__brand-mark" aria-hidden="true" />
          <span className="display">SUYASH</span>
        </button>

        <button
          ref={triggerRef}
          className={`nav__menu ${open ? 'is-open' : ''}`}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="fullscreen-menu"
          data-cursor="click"
        >
          <span className="nav__menu-label display">{open ? 'CLOSE' : 'MENU'}</span>
          <span className="nav__burger" aria-hidden="true">
            <i />
            <i />
          </span>
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="fullscreen-menu"
            className="menu"
            ref={panelRef}
            initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            exit={{ clipPath: 'inset(100% 0% 0% 0%)' }}
            transition={{ duration: dur, ease: [0.76, 0, 0.24, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Main navigation"
          >
            <div className="menu__bg" aria-hidden="true" />
            <nav className="menu__list">
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  className="menu__row"
                  initial={{ y: '110%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  exit={{ y: '-60%', opacity: 0, transition: { duration: 0.3, delay: 0.02 * i } }}
                  transition={{
                    duration: reduced ? 0.01 : 0.85,
                    delay: reduced ? 0 : 0.14 + i * 0.07,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <button className="menu__link" onClick={() => go(item.id)} data-cursor="click">
                    <span className="menu__num mono">{item.num}</span>
                    <span className="menu__word display" data-text={item.menuLabel}>
                      {item.menuLabel}
                    </span>
                    <span className="menu__arrow" aria-hidden="true">
                      ↗
                    </span>
                  </button>
                </motion.div>
              ))}
            </nav>

            <motion.div
              className="menu__foot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: reduced ? 0 : 0.5 }}
            >
              <span className="label">SCROLL IS THE STORY</span>
              <span className="label">PRESS ESC TO CLOSE</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
