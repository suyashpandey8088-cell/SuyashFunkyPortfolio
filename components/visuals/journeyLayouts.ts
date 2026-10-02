/* ------------------------------------------------------------------
   One particle system, five worlds.

   Every layout returns exactly `n` normalised (0..1) positions, so the
   same particles can be morphed between:

     AI net  →  data table  →  deeper AI net  →  browser  →  ecosystem

   which is what makes the transitions between internships read as a
   single continuous object rather than five separate graphics.
   ------------------------------------------------------------------ */

export type Marker = { x: number; y: number; text: string; size: number; dim?: boolean };

export type Layout = {
  pos: Float32Array; // x0,y0,x1,y1…
  edges: number[]; // flat index pairs
  markers: Marker[];
  glow: number[]; // indices rendered as accent "hot" nodes
};

const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/* --------------------------- 01 · AI ----------------------------- */
function aiLayout(n: number): Layout {
  const r = rng(7);
  const pos = new Float32Array(n * 2);
  const edges: number[] = [];
  const glow: number[] = [];
  const layers = [4, 6, 5, 3];
  const xs = [0.24, 0.42, 0.6, 0.77];
  const ids: number[][] = [];
  let i = 0;

  layers.forEach((count, li) => {
    const col: number[] = [];
    for (let k = 0; k < count && i < n; k += 1, i += 1) {
      const y = 0.5 + (k - (count - 1) / 2) * (0.5 / Math.max(count, 3));
      pos[i * 2] = xs[li];
      pos[i * 2 + 1] = y;
      col.push(i);
    }
    ids.push(col);
  });

  for (let li = 0; li < ids.length - 1; li += 1) {
    ids[li].forEach((a) => ids[li + 1].forEach((b) => edges.push(a, b)));
  }
  ids[ids.length - 1].forEach((id) => glow.push(id));

  // floating data points around the net
  for (; i < n; i += 1) {
    const a = r() * Math.PI * 2;
    const rad = 0.3 + r() * 0.3;
    pos[i * 2] = 0.5 + Math.cos(a) * rad * 0.95;
    pos[i * 2 + 1] = 0.5 + Math.sin(a) * rad * 0.62;
  }

  return {
    pos,
    edges,
    glow,
    markers: [
      { x: 0.14, y: 0.22, text: 'Σ', size: 30 },
      { x: 0.86, y: 0.3, text: 'σ', size: 26 },
      { x: 0.2, y: 0.8, text: '∂w', size: 20, dim: true },
      { x: 0.72, y: 0.84, text: 'θ', size: 24 },
      { x: 0.5, y: 0.12, text: 'f(x) = Wx + b', size: 13, dim: true },
    ],
  };
}

/* -------------------------- 02 · DATA ---------------------------- */
function dataLayout(n: number): Layout {
  const pos = new Float32Array(n * 2);
  const edges: number[] = [];
  const glow: number[] = [];
  const cols = 10;
  const rows = Math.ceil(n / cols);
  const x0 = 0.14;
  const x1 = 0.86;
  const y0 = 0.2;
  const y1 = 0.82;

  for (let i = 0; i < n; i += 1) {
    const c = i % cols;
    const rw = Math.floor(i / cols);
    pos[i * 2] = x0 + (c / (cols - 1)) * (x1 - x0);
    pos[i * 2 + 1] = y0 + (rw / Math.max(rows - 1, 1)) * (y1 - y0);
    if (c < cols - 1 && i + 1 < n) edges.push(i, i + 1);
    if (c === 3 && rw % 3 === 0) glow.push(i);
  }

  return {
    pos,
    edges,
    glow,
    markers: [
      { x: 0.14, y: 0.14, text: 'ID', size: 12 },
      { x: 0.33, y: 0.14, text: 'FIELD', size: 12 },
      { x: 0.55, y: 0.14, text: 'VALUE', size: 12 },
      { x: 0.76, y: 0.14, text: 'STATUS', size: 12 },
      { x: 0.5, y: 0.9, text: '— ROWS VALIDATED —', size: 11, dim: true },
    ],
  };
}

/* ------------------------- 03 · AI DEEPER ------------------------ */
function ai2Layout(n: number): Layout {
  const r = rng(29);
  const pos = new Float32Array(n * 2);
  const edges: number[] = [];
  const glow: number[] = [];
  const layers = [5, 9, 11, 11, 8, 4];
  const ids: number[][] = [];
  let i = 0;

  layers.forEach((count, li) => {
    const col: number[] = [];
    const x = 0.11 + (li / (layers.length - 1)) * 0.78;
    for (let k = 0; k < count && i < n; k += 1, i += 1) {
      const y = 0.5 + (k - (count - 1) / 2) * (0.62 / Math.max(count, 4));
      pos[i * 2] = x;
      pos[i * 2 + 1] = y;
      col.push(i);
    }
    ids.push(col);
  });

  for (let li = 0; li < ids.length - 1; li += 1) {
    const next = ids[li + 1];
    ids[li].forEach((a) => {
      for (let k = 0; k < 3; k += 1) {
        edges.push(a, next[Math.floor(r() * next.length)]);
      }
    });
  }
  ids[2].forEach((id) => glow.push(id));
  ids[ids.length - 1].forEach((id) => glow.push(id));

  // data streams flowing through the network
  const streams = 6;
  const left = n - i;
  for (let s = 0; s < streams && i < n; s += 1) {
    const per = Math.floor(left / streams);
    const yBase = 0.1 + (s / (streams - 1)) * 0.8;
    for (let k = 0; k < per && i < n; k += 1, i += 1) {
      const t = k / Math.max(per - 1, 1);
      pos[i * 2] = 0.04 + t * 0.92;
      pos[i * 2 + 1] = yBase + Math.sin(t * Math.PI * 2 + s) * 0.035;
    }
  }
  for (; i < n; i += 1) {
    pos[i * 2] = r();
    pos[i * 2 + 1] = 0.08 + r() * 0.84;
  }

  return {
    pos,
    edges,
    glow,
    markers: [
      { x: 0.08, y: 0.08, text: 'INPUT', size: 11 },
      { x: 0.5, y: 0.06, text: 'HIDDEN LAYERS', size: 11, dim: true },
      { x: 0.92, y: 0.08, text: 'OUTPUT', size: 11 },
      { x: 0.5, y: 0.94, text: 'loss ↓   epochs ↑', size: 12, dim: true },
    ],
  };
}

/* --------------------------- 04 · WEB ---------------------------- */
function webLayout(n: number): Layout {
  const pos = new Float32Array(n * 2);
  const edges: number[] = [];
  const glow: number[] = [];

  type Shape = { x: number; y: number; w: number; h: number; weight: number; closed: boolean };
  const shapes: Shape[] = [
    { x: 0.1, y: 0.14, w: 0.8, h: 0.72, weight: 4, closed: true }, // window
    { x: 0.1, y: 0.14, w: 0.8, h: 0.08, weight: 2, closed: true }, // chrome bar
    { x: 0.3, y: 0.164, w: 0.4, h: 0.032, weight: 1.1, closed: true }, // address field
    { x: 0.14, y: 0.27, w: 0.4, h: 0.17, weight: 2, closed: true }, // hero block
    { x: 0.58, y: 0.27, w: 0.28, h: 0.17, weight: 1.6, closed: true }, // side block
    { x: 0.14, y: 0.49, w: 0.22, h: 0.14, weight: 1.4, closed: true }, // card 1
    { x: 0.39, y: 0.49, w: 0.22, h: 0.14, weight: 1.4, closed: true }, // card 2
    { x: 0.64, y: 0.49, w: 0.22, h: 0.14, weight: 1.4, closed: true }, // card 3
    { x: 0.14, y: 0.69, w: 0.5, h: 0.0, weight: 0.8, closed: false }, // text line
    { x: 0.14, y: 0.735, w: 0.42, h: 0.0, weight: 0.7, closed: false },
    { x: 0.14, y: 0.78, w: 0.3, h: 0.0, weight: 0.6, closed: false },
    { x: 0.68, y: 0.72, w: 0.18, h: 0.06, weight: 1, closed: true }, // button
  ];

  const total = shapes.reduce((s, sh) => s + sh.weight, 0);
  let i = 0;

  shapes.forEach((sh, si) => {
    const count = Math.max(4, Math.round((sh.weight / total) * n));
    const first = i;
    for (let k = 0; k < count && i < n; k += 1, i += 1) {
      const t = k / count;
      if (sh.h === 0) {
        pos[i * 2] = sh.x + t * sh.w;
        pos[i * 2 + 1] = sh.y;
      } else {
        const per = 2 * (sh.w + sh.h);
        let d = t * per;
        let x = sh.x;
        let y = sh.y;
        if (d < sh.w) {
          x = sh.x + d;
        } else if ((d -= sh.w) < sh.h) {
          x = sh.x + sh.w;
          y = sh.y + d;
        } else if ((d -= sh.h) < sh.w) {
          x = sh.x + sh.w - d;
          y = sh.y + sh.h;
        } else {
          d -= sh.w;
          y = sh.y + sh.h - d;
        }
        pos[i * 2] = x;
        pos[i * 2 + 1] = y;
      }
      if (k > 0) edges.push(i - 1, i);
    }
    if (sh.closed && i - 1 > first) edges.push(i - 1, first);
    if (si === 11) for (let g = first; g < i; g += 1) glow.push(g);
  });

  for (; i < n; i += 1) {
    pos[i * 2] = 0.5;
    pos[i * 2 + 1] = 0.5;
  }

  return {
    pos,
    edges,
    glow,
    markers: [
      { x: 0.5, y: 0.182, text: 'https://  —  building…', size: 11, dim: true },
      { x: 0.14, y: 0.245, text: '<section>', size: 11 },
      { x: 0.86, y: 0.9, text: '</body>', size: 11, dim: true },
      { x: 0.77, y: 0.752, text: 'CTA', size: 11 },
    ],
  };
}

/* ------------------------- 05 · SYSTEM --------------------------- */
function systemLayout(n: number): Layout {
  const pos = new Float32Array(n * 2);
  const edges: number[] = [];
  const glow: number[] = [];
  const clusters = [
    { x: 0.5, y: 0.5, r: 0.07, label: 'CORE' },
    { x: 0.16, y: 0.28, r: 0.065, label: 'FRONTEND' },
    { x: 0.84, y: 0.26, r: 0.065, label: 'API' },
    { x: 0.14, y: 0.74, r: 0.06, label: 'DATA' },
    { x: 0.86, y: 0.74, r: 0.06, label: 'AI' },
    { x: 0.5, y: 0.12, r: 0.05, label: 'INTERFACES' },
    { x: 0.5, y: 0.89, r: 0.05, label: 'SERVICES' },
  ];

  const per = Math.floor(n / clusters.length);
  const heads: number[] = [];
  let i = 0;

  clusters.forEach((c, ci) => {
    const first = i;
    const count = ci === clusters.length - 1 ? n - i : per;
    for (let k = 0; k < count && i < n; k += 1, i += 1) {
      const a = (k / count) * Math.PI * 2;
      const rr = c.r * (k % 3 === 0 ? 1 : 0.62);
      pos[i * 2] = c.x + Math.cos(a) * rr;
      pos[i * 2 + 1] = c.y + Math.sin(a) * rr * 1.25;
      if (k > 0) edges.push(i - 1, i);
    }
    if (i - 1 > first) edges.push(i - 1, first);
    heads.push(first);
    glow.push(first);
  });

  for (let c = 1; c < heads.length; c += 1) {
    edges.push(heads[0], heads[c]);
    edges.push(heads[c], heads[(c % (heads.length - 1)) + 1]);
  }

  return {
    pos,
    edges,
    glow,
    markers: clusters.map((c) => ({
      x: c.x,
      y: c.y - c.r - 0.055,
      text: c.label,
      size: 11,
      dim: c.label !== 'CORE',
    })),
  };
}

export function buildLayouts(n: number): Layout[] {
  return [aiLayout(n), dataLayout(n), ai2Layout(n), webLayout(n), systemLayout(n)];
}
