'use client';

import { MutableRefObject, useMemo } from 'react';
import { useCanvasScene, useMediaQuery } from '@/lib/hooks';
import { scrollState } from '@/lib/scroll';
import { buildLayouts } from './journeyLayouts';

const ACCENTS = ['#B14AFF', '#9DFF2E', '#2ED9FF', '#FF2E88', '#FF7A1A'];

const hexToRgb = (hex: string) => {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255] as const;
};
const RGB = ACCENTS.map(hexToRgb);

const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * The single morphing organism behind the whole Experience chapter.
 * `morphRef.current` is a 0…4 float written by ScrollTrigger:
 *   0 = AI net · 1 = data table · 2 = deeper AI · 3 = browser · 4 = ecosystem
 */
export default function JourneyCanvas({ morphRef }: { morphRef: MutableRefObject<number> }) {
  const small = useMediaQuery('(max-width: 899px)');
  const n = small ? 90 : 190;
  const layouts = useMemo(() => buildLayouts(n), [n]);

  const buf = useMemo(() => ({ x: new Float32Array(n), y: new Float32Array(n), init: false }), [n]);

  const ref = useCanvasScene(
    (ctx, w, h, t) => {
      ctx.clearRect(0, 0, w, h);
      if (w < 2 || h < 2) return;

      const m = Math.max(0, Math.min(4, morphRef.current || 0));
      const i0 = Math.min(3, Math.floor(m));
      const i1 = i0 + 1;
      const k = smooth(Math.min(1, Math.max(0, m - i0)));

      const A = layouts[i0];
      const B = layouts[i1];

      const padX = w * 0.04;
      const padY = h * 0.05;
      const sx = (x: number) => padX + x * (w - padX * 2);
      const sy = (y: number) => padY + y * (h - padY * 2);

      const [r0, g0, b0] = RGB[i0];
      const [r1, g1, b1] = RGB[Math.min(4, i1)];
      const ar = Math.round(r0 + (r1 - r0) * k);
      const ag = Math.round(g0 + (g1 - g0) * k);
      const ab = Math.round(b0 + (b1 - b0) * k);
      const accent = `${ar},${ag},${ab}`;

      const vel = scrollState.smooth;
      const chaos = Math.min(1, Math.abs(vel) * 0.9) * (k > 0.02 && k < 0.98 ? 1 : 0.25);

      // ---- morph positions ----
      for (let i = 0; i < n; i += 1) {
        const ax = A.pos[i * 2];
        const ay = A.pos[i * 2 + 1];
        const bx = B.pos[i * 2];
        const by = B.pos[i * 2 + 1];
        // arc the particles outward mid-transition so it reads as "breaking apart"
        const bow = Math.sin(k * Math.PI) * (0.055 + chaos * 0.05);
        const dirX = Math.cos(i * 1.7) * bow;
        const dirY = Math.sin(i * 2.3) * bow;
        const drift = Math.sin(t * 0.7 + i * 0.6) * 0.0035;
        buf.x[i] = sx(ax + (bx - ax) * k + dirX + drift);
        buf.y[i] = sy(ay + (by - ay) * k + dirY + drift * 1.4);
      }

      // ---- edges ----
      const drawEdges = (edges: number[], alpha: number) => {
        if (alpha <= 0.015) return;
        ctx.strokeStyle = `rgba(${accent},${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let e = 0; e < edges.length; e += 2) {
          const a = edges[e];
          const b = edges[e + 1];
          ctx.moveTo(buf.x[a], buf.y[a]);
          ctx.lineTo(buf.x[b], buf.y[b]);
        }
        ctx.stroke();
      };

      drawEdges(A.edges, 0.3 * (1 - k));
      drawEdges(B.edges, 0.3 * k);

      // faint white structure lines so it never reads as pure colour mush
      ctx.strokeStyle = `rgba(244,242,236,${0.055 * (1 - Math.abs(k - 0.5) * 1.2)})`;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      const srcEdges = k < 0.5 ? A.edges : B.edges;
      for (let e = 0; e < srcEdges.length; e += 6) {
        const a = srcEdges[e];
        const b = srcEdges[e + 1];
        ctx.moveTo(buf.x[a], buf.y[a]);
        ctx.lineTo(buf.x[b], buf.y[b]);
      }
      ctx.stroke();

      // ---- nodes ----
      const glow = new Set<number>(k < 0.5 ? A.glow : B.glow);
      for (let i = 0; i < n; i += 1) {
        const hot = glow.has(i);
        const pulse = 0.5 + 0.5 * Math.sin(t * 2.1 + i * 0.9);
        if (hot) {
          ctx.fillStyle = `rgba(${accent},${0.55 + pulse * 0.45})`;
          ctx.beginPath();
          ctx.arc(buf.x[i], buf.y[i], 2.6 + pulse * 1.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(${accent},0.1)`;
          ctx.beginPath();
          ctx.arc(buf.x[i], buf.y[i], 9 + pulse * 5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = `rgba(244,242,236,${0.3 + pulse * 0.28})`;
          ctx.beginPath();
          ctx.arc(buf.x[i], buf.y[i], 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ---- markers (symbols / column headers / code bits / labels) ----
      const drawMarkers = (layout: typeof A, alpha: number) => {
        if (alpha <= 0.03) return;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        layout.markers.forEach((mk) => {
          ctx.font = `${mk.size * (small ? 0.85 : 1)}px var(--font-mono), ui-monospace, monospace`;
          ctx.fillStyle = mk.dim
            ? `rgba(244,242,236,${0.3 * alpha})`
            : `rgba(${accent},${0.75 * alpha})`;
          ctx.fillText(mk.text, sx(mk.x), sy(mk.y));
        });
      };
      drawMarkers(A, 1 - k);
      drawMarkers(B, k);
    },
    [layouts, n, small],
  );

  return <canvas ref={ref} className="journey-canvas" aria-hidden="true" />;
}
