/* ------------------------------------------------------------------
   CONTENT  —  EVERYTHING EDITABLE LIVES HERE
   ------------------------------------------------------------------
   Anything wrapped in [ SQUARE BRACKETS ] is an editable placeholder.
   It renders in the UI with a dashed "unfilled" style so you can spot
   it instantly. Replace the string and the style disappears.
   No companies, dates, metrics or stacks have been invented for you.
   ------------------------------------------------------------------ */

export const personalInfo = {
  name: 'Suyash Pandey',
  firstName: 'Suyash',
  /* Shown once, small, in the hero meta — not splashed everywhere. */
  identity: 'AI & Data Science Engineer · Developer · Problem Solver · Creative Technologist',
  shortIdentity: 'AI & DATA SCIENCE ENGINEER',
  heroLines: ['HEY.', "I'M", 'SUYASH.', 'I BUILD', 'DIGITAL', 'EXPERIENCES.'],
  about:
    "I'm an AI & Data Science Engineering student who enjoys building intelligent systems, digital experiences and solving problems through technology.",
  aboutSecondary:
    'I like the part where an idea is still messy — where a model, an interface and a stubborn problem have to be argued into the same room. Then I make it fast, make it clear, and make it feel good to use.',
  location: '[ CITY, COUNTRY ]',
  status: 'OPEN TO OPPORTUNITIES',
  /* Small facts strip under the About paragraph. */
  facts: [
    { k: 'FOCUS', v: 'AI · DATA · WEB' },
    { k: 'BASED IN', v: '[ CITY ]' },
    { k: 'INTERNSHIPS', v: '05' },
    { k: 'STATUS', v: 'BUILDING' },
  ],
};

/* ------------------------------------------------------------------
   EXPERIENCE — 5 internships.
   Roles are real. Everything else is a placeholder on purpose.
   ------------------------------------------------------------------ */

export type Internship = {
  id: string;
  index: string;
  role: string;
  company: string;
  duration: string;
  description: string;
  technologies: string[];
  responsibilities: string[];
  learnings: string[];
  /* Visual phase driving the canvas story: ai | data | ai2 | web | system */
  phase: 'ai' | 'data' | 'ai2' | 'web' | 'system';
  accent: string;
  themeLabel: string;
};

export const experience: Internship[] = [
  {
    id: 'exp-01',
    index: '01',
    role: 'AI INTERN',
    company: '[ COMPANY NAME ]',
    duration: '[ MONTH YEAR — MONTH YEAR ]',
    description: '[ One or two lines on what this team did and where you fit in. ]',
    technologies: ['[ TECH 1 ]', '[ TECH 2 ]', '[ TECH 3 ]'],
    responsibilities: ['[ Responsibility one ]', '[ Responsibility two ]', '[ Responsibility three ]'],
    learnings: ['[ Key learning from this internship ]'],
    phase: 'ai',
    accent: '#B14AFF',
    themeLabel: 'ARTIFICIAL INTELLIGENCE',
  },
  {
    id: 'exp-02',
    index: '02',
    role: 'DATA ENTRY INTERN',
    company: '[ COMPANY NAME ]',
    duration: '[ MONTH YEAR — MONTH YEAR ]',
    description: '[ One or two lines on the data you handled and why it mattered. ]',
    technologies: ['[ TOOL 1 ]', '[ TOOL 2 ]', '[ TOOL 3 ]'],
    responsibilities: ['[ Responsibility one ]', '[ Responsibility two ]', '[ Responsibility three ]'],
    learnings: ['[ Key learning from this internship ]'],
    phase: 'data',
    accent: '#9DFF2E',
    themeLabel: 'STRUCTURED DATA',
  },
  {
    id: 'exp-03',
    index: '03',
    role: 'AI INTERN',
    company: '[ COMPANY NAME ]',
    duration: '[ MONTH YEAR — MONTH YEAR ]',
    description: '[ One or two lines — this is the deeper AI round, say what changed. ]',
    technologies: ['[ TECH 1 ]', '[ TECH 2 ]', '[ TECH 3 ]'],
    responsibilities: ['[ Responsibility one ]', '[ Responsibility two ]', '[ Responsibility three ]'],
    learnings: ['[ Key learning from this internship ]'],
    phase: 'ai2',
    accent: '#2ED9FF',
    themeLabel: 'DEEPER INTELLIGENCE',
  },
  {
    id: 'exp-04',
    index: '04',
    role: 'WEB DEVELOPER INTERN',
    company: '[ COMPANY NAME ]',
    duration: '[ MONTH YEAR — MONTH YEAR ]',
    description: '[ One or two lines on what you shipped to the browser. ]',
    technologies: ['[ TECH 1 ]', '[ TECH 2 ]', '[ TECH 3 ]'],
    responsibilities: ['[ Responsibility one ]', '[ Responsibility two ]', '[ Responsibility three ]'],
    learnings: ['[ Key learning from this internship ]'],
    phase: 'web',
    accent: '#FF2E88',
    themeLabel: 'THE WEB',
  },
  {
    id: 'exp-05',
    index: '05',
    role: 'SOLUTION DEVELOPER INTERN',
    company: '[ COMPANY NAME ]',
    duration: '[ MONTH YEAR — MONTH YEAR ]',
    description: '[ One or two lines on the end-to-end solution you helped build. ]',
    technologies: ['[ TECH 1 ]', '[ TECH 2 ]', '[ TECH 3 ]'],
    responsibilities: ['[ Responsibility one ]', '[ Responsibility two ]', '[ Responsibility three ]'],
    learnings: ['[ Key learning from this internship ]'],
    phase: 'system',
    accent: '#FF7A1A',
    themeLabel: 'CONNECTED SYSTEMS',
  },
];

export const experienceConclusion = [
  '5 INTERNSHIPS.',
  '5 DIFFERENT PERSPECTIVES.',
  'ONE EVOLVING DEVELOPER.',
];

export const journeyChain = ['AI', 'DATA', 'AI', 'WEB', 'SOLUTIONS'];

/* ------------------------------------------------------------------
   SKILLS — free-floating typography field. Edit / add / remove freely.
   ------------------------------------------------------------------ */

export const skills = [
  'PYTHON',
  'AI',
  'DATA',
  'JAVASCRIPT',
  'REACT',
  'SQL',
  'WEB',
  'AUTOMATION',
];

/* ------------------------------------------------------------------
   PROJECTS — placeholder shells. Swap names, copy, tech, year, links
   and the cover images in /public/projects.
   ------------------------------------------------------------------ */

export type Project = {
  id: string;
  index: string;
  name: string;
  tagline: string;
  description: string;
  role: string;
  technologies: string[];
  result: string;
  year: string;
  link: string;
  image: string;
  alt: string;
  accent: string;
};

export const projects: Project[] = [
  {
    id: 'p1',
    index: '01',
    name: '[ PROJECT ONE ]',
    tagline: 'AI / EXPERIMENT',
    description:
      '[ Two lines about the problem, what you built and the one decision you are proud of. ]',
    role: '[ YOUR ROLE ]',
    technologies: ['[ TECH ]', '[ TECH ]', '[ TECH ]'],
    result: '[ Outcome / what it unlocked ]',
    year: '[ YEAR ]',
    link: '#',
    image: '/projects/project-01.jpg',
    alt: 'Abstract violet neural-network artwork used as a placeholder project cover',
    accent: '#B14AFF',
  },
  {
    id: 'p2',
    index: '02',
    name: '[ PROJECT TWO ]',
    tagline: 'DATA / TOOLING',
    description:
      '[ Two lines about the problem, what you built and the one decision you are proud of. ]',
    role: '[ YOUR ROLE ]',
    technologies: ['[ TECH ]', '[ TECH ]', '[ TECH ]'],
    result: '[ Outcome / what it unlocked ]',
    year: '[ YEAR ]',
    link: '#',
    image: '/projects/project-02.jpg',
    alt: 'Abstract green data-grid artwork used as a placeholder project cover',
    accent: '#9DFF2E',
  },
  {
    id: 'p3',
    index: '03',
    name: '[ PROJECT THREE ]',
    tagline: 'WEB / INTERFACE',
    description:
      '[ Two lines about the problem, what you built and the one decision you are proud of. ]',
    role: '[ YOUR ROLE ]',
    technologies: ['[ TECH ]', '[ TECH ]', '[ TECH ]'],
    result: '[ Outcome / what it unlocked ]',
    year: '[ YEAR ]',
    link: '#',
    image: '/projects/project-03.jpg',
    alt: 'Abstract pink interface-grid artwork used as a placeholder project cover',
    accent: '#FF2E88',
  },
  {
    id: 'p4',
    index: '04',
    name: '[ PROJECT FOUR ]',
    tagline: 'SYSTEM / AUTOMATION',
    description:
      '[ Two lines about the problem, what you built and the one decision you are proud of. ]',
    role: '[ YOUR ROLE ]',
    technologies: ['[ TECH ]', '[ TECH ]', '[ TECH ]'],
    result: '[ Outcome / what it unlocked ]',
    year: '[ YEAR ]',
    link: '#',
    image: '/projects/project-04.jpg',
    alt: 'Abstract orange system-architecture artwork used as a placeholder project cover',
    accent: '#FF7A1A',
  },
];

/* ------------------------------------------------------------------
   PERSONALITY
   ------------------------------------------------------------------ */

export const interests = [
  { id: 'chess', word: 'CHESS', note: 'Openings I over-prepare, endgames I improvise.', accent: '#B14AFF' },
  { id: 'badminton', word: 'BADMINTON', note: 'Best debugging happens between rallies.', accent: '#9DFF2E' },
  { id: 'comics', word: 'COMICS', note: 'Panels taught me pacing before any design class did.', accent: '#FF2E88' },
  { id: 'music', word: 'MUSIC', note: 'Loops on, world off, problem solved.', accent: '#2ED9FF' },
  { id: 'exploring', word: 'EXPLORING', note: 'New routes, new tools, same curiosity.', accent: '#FF7A1A' },
];

/* ------------------------------------------------------------------
   SOCIAL — replace the hrefs. They are intentionally generic.
   ------------------------------------------------------------------ */

export const socialLinks = [
  { id: 'email', label: 'EMAIL', href: 'mailto:[ YOUR@EMAIL.COM ]', hint: '[ YOUR@EMAIL.COM ]', external: false },
  { id: 'linkedin', label: 'LINKEDIN', href: 'https://linkedin.com/in/[ handle ]', hint: '/in/[ handle ]', external: true },
  { id: 'github', label: 'GITHUB', href: 'https://github.com/[ handle ]', hint: '@[ handle ]', external: true },
  { id: 'instagram', label: 'INSTAGRAM', href: 'https://instagram.com/[ handle ]', hint: '@[ handle ]', external: true },
  { id: 'resume', label: 'RESUME', href: '/resume.pdf', hint: 'PDF · [ UPDATED ]', external: true },
];

/* ------------------------------------------------------------------
   CHAPTERS — drives the side scroll indicator (01 … 07) and the menu.
   ------------------------------------------------------------------ */

export const chapters = [
  { id: 'hero', num: '01', label: 'HEY', accent: '#B14AFF', menu: false },
  { id: 'about', num: '02', label: 'WHO', accent: '#2ED9FF', menu: true, menuLabel: 'ABOUT' },
  { id: 'experience', num: '03', label: 'WORK', accent: '#B14AFF', menu: true, menuLabel: 'EXPERIENCE' },
  { id: 'skills', num: '04', label: 'PLAY', accent: '#9DFF2E', menu: true, menuLabel: 'SKILLS' },
  { id: 'projects', num: '05', label: 'MADE', accent: '#FF2E88', menu: true, menuLabel: 'PROJECTS' },
  { id: 'weird', num: '06', label: 'WEIRD', accent: '#FF7A1A', menu: false },
  { id: 'contact', num: '07', label: 'TALK', accent: '#B14AFF', menu: true, menuLabel: 'CONTACT' },
] as const;

export const isPlaceholder = (value: string) => /^\s*\[.*\]\s*$/.test(value);
