'use client';

import { useMemo } from 'react';
import { useCanvasScene } from '@/lib/hooks';
import { scrollState } from '@/lib/scroll';

type P = { x: number; y: number; z: number };

/**
 * Wireframe / particle orb. Spin rate is driven by scroll velocity with
 * inertia: flick the page and it over-rotates, then settles.
 */
export default function OrbCanvas({ count = 260 }: { count?: number }) {
  const pts = useMemo<P[]>(() => {
    const n = count;
    const out: P[] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      out.push({ x: Math.cos(theta) * r, y, z: Math.sin(theta) * r });
    }
    return out;
  }, [count]);

  const neighbours = useMemo(() => {
    const links: [number, number][] = [];
    for (let i = 0; i < pts.length; i += 1) {
      for (let j = i + 1; j < Math.min(pts.length, i + 9); j += 1) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const dz = pts[i].z - pts[j].z;
        if (dx * dx + dy * dy + dz * dz < 0.055) links.push([i, j]);
      }
    }
    return links;
  }, [pts]);

  const state = useMemo(() => ({ rotY: 0, rotX: -0.25, spin: 0.0042, wobble: 0 }), []);

  const ref = useCanvasScene((ctx, w, h, t, dt) => {
    ctx.clearRect(0, 0, w, h);
    if (w < 2 || h < 2) return;

    const cx = w / 2;
    const cy = h / 2;
    const R = Math.min(w, h) * 0.37;

    const targetSpin = 0.0042 + scrollState.smooth * 0.055;
    state.spin += (targetSpin - state.spin) * 0.06;
    state.rotY += state.spin * Math.max(dt, 0.3);
    state.rotX += (Math.sin(t * 0.3) * 0.22 - 0.1 - state.rotX) * 0.01;
    state.wobble += (scrollState.abs - state.wobble) * 0.06;

    const cosY = Math.cos(state.rotY);
    const sinY = Math.sin(state.rotY);
    const cosX = Math.cos(state.rotX);
    const sinX = Math.sin(state.rotX);

    const proj: { x: number; y: number; d: number }[] = new Array(pts.length);
    for (let i = 0; i < pts.length; i += 1) {
      const p = pts[i];
      const breathe = 1 + Math.sin(t * 0.9 + p.y * 3.1) * (0.035 + state.wobble * 0.11);
      let x = p.x * R * breathe;
      let y = p.y * R * breathe;
      let z = p.z * R * breathe;

      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;
      const y1 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;
      x = x1;
      y = y1;
      z = z2;

      const persp = 620 / (620 - z);
      proj[i] = { x: cx + x * persp, y: cy + y * persp, d: (z + R) / (2 * R) };
    }

    const accent =
      getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#b14aff';

    ctx.lineWidth = 1;
    for (let i = 0; i < neighbours.length; i += 1) {
      const [a, b] = neighbours[i];
      const pa = proj[a];
      const pb = proj[b];
      const d = (pa.d + pb.d) / 2;
      if (d < 0.34) continue;
      ctx.strokeStyle = `rgba(244,242,236,${(d - 0.3) * 0.2})`;
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
    }

    for (let i = 0; i < proj.length; i += 1) {
      const p = proj[i];
      const r = 0.6 + p.d * 2.1;
      if (i % 11 === 0) {
        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.35 + p.d * 0.65;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      } else {
        ctx.fillStyle = `rgba(244,242,236,${0.1 + p.d * 0.6})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // soft core — globalAlpha keeps this safe for any colour notation
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.25);
    g.addColorStop(0, accent);
    g.addColorStop(1, 'transparent');
    ctx.globalAlpha = 0.14;
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
  }, [pts, neighbours]);

  return <canvas ref={ref} className="orb-canvas" aria-hidden="true" />;
}
