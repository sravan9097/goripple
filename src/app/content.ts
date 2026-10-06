export interface Tile {
  id: string;
  title: string;
  /** Full-strength tile fill, the way the Dropbox grid is coloured. */
  accent: string;
  /** Text and artwork colour that clears contrast on that fill. */
  ink: string;
}

/** Grid face: "The" on its own line, remainder below. Resources stays one line. */
export function tileGridLines(title: string): [string, string] | null {
  if (!title.startsWith('The ')) return null;
  return ['The', title.slice(4)];
}

export interface Section {
  id: string;
  kicker: string;
  title: string;
  body: string[];
  /** Small label rendered beside the section visual. */
  caption?: string;
}

export interface ResourceLink {
  label: string;
  href: string;
  comingSoon?: boolean;
  note?: string;
}

/** Shown on the large centre box, before the first scroll. Primary tagline, see NARRATIVE.md §10. */
export const TAGLINE_ONE = 'One drop. Every product.';

/** Shown as the centre box contracts. Working tagline, see NARRATIVE.md §10. */
export const TAGLINE_TWO = 'Change once. Rippl everywhere.';

export const OUTRO_QUOTE = {
  text: 'One change. Felt everywhere.',
  attribution: 'Rippl Design System',
};

const LIGHT = 'var(--rippl-ref-color-white, #fff)';

/**
 * Tile order is act order (NARRATIVE.md §9): the grid, routes and prev/next all
 * follow it. Ids are route paths and art hooks; they are renamed per section as
 * each page is rewritten.
 */
export const TILES: Tile[] = [
  { id: 'what', title: 'The Drop', accent: 'var(--rippl-ref-color-cyan-500)', ink: LIGHT },
  { id: 'why', title: 'The World Before', accent: 'var(--rippl-ref-color-navy-blue-700)', ink: LIGHT },
  { id: 'how', title: 'The Idea', accent: 'var(--rippl-ref-color-magenta-600)', ink: LIGHT },
  {
    id: 'foundations',
    title: 'The Name',
    accent: 'var(--rippl-ref-color-primrose-yellow-400)',
    ink: LIGHT,
  },
  {
    id: 'components',
    title: 'The World Inside',
    accent: 'var(--rippl-ref-color-light-green-600)',
    ink: LIGHT,
  },
  { id: 'patterns', title: 'The Two Verbs', accent: 'var(--rippl-ref-color-orange-500)', ink: LIGHT },
  { id: 'who', title: 'The Promise', accent: 'var(--rippl-ref-color-cyan-800)', ink: LIGHT },
  { id: 'resources', title: 'Resources', accent: 'var(--rippl-ref-color-stolt-red-500)', ink: LIGHT },
];

export const SECTIONS: Section[] = [
  {
    id: 'what',
    kicker: '01',
    title: 'One drop. Every product.',
    caption: 'Click the pool. Rings do the rest.',
    body: [
      'A still, calm opening. One drop at the centre, rings that travel on their own, the name, the promise.',
      'This is the front door to Rippl. Exhale, slow down, and scroll when you are ready.',
    ],
  },
  {
    id: 'why',
    kicker: '02',
    title: 'Seven divisions. Dozens of products. One surface.',
    caption: 'Change once, felt everywhere',
    body: [
      'Before Rippl, every product redrew the same button, the same table, the same page. Consistency lived in people’s heads instead of in the system.',
      'Change a token once and the wave reaches Tankers, Tank Containers, Terminals, Sea Farm and Ventures — everywhere Stolt builds.',
    ],
  },
  {
    id: 'how',
    kicker: '03',
    title: 'Written once. Read by people and by agents.',
    caption: 'Figma to tokens to code',
    body: [
      'Figma variables become tokens. Tokens become Angular components. A knowledge base and a set of agent skills keep the whole chain honest.',
      'Rippl is an agentic design system. People author the source of truth, and agents help apply it without drifting.',
    ],
  },
  {
    id: 'foundations',
    kicker: '04',
    title: 'Colour. Type. Space. Motion.',
    caption: 'The ground everything stands on',
    body: [
      'OKLCH colour ramps, type roles, spacing, shape, elevation and motion — each one named so designers and engineers reach for the same word.',
      'Light and dark are modes of the same system, not two systems pretending to match.',
    ],
  },
  {
    id: 'components',
    kicker: '05',
    title: 'Forty-three pieces. Built to ship.',
    caption: 'Standalone Angular, versioned',
    body: [
      'Buttons, fields, tables, navigation and overlays, shipped as @stolt/rippl and documented in Storybook.',
      'Not a theme bolted onto somebody else’s kit. Our surfaces, our behaviour, our accessibility bar.',
    ],
  },
  {
    id: 'patterns',
    kicker: '06',
    title: 'Screens, not just parts.',
    caption: 'Compositions teams reuse',
    body: [
      'Page headers, side navigation, data tables, filter bars and drawers — the compositions teams reach for every week, already assembled out of Rippl pieces.',
    ],
  },
  {
    id: 'who',
    kicker: '07',
    title: 'For everyone who builds Stolt products.',
    caption: 'Every division, one surface',
    body: [
      'Designers who need a shared library. Developers who need a package rather than a PDF. Product owners who need one look across divisions.',
      'The wave only works if every shore can feel it.',
    ],
  },
  {
    id: 'resources',
    kicker: '08',
    title: 'Open the toolkit.',
    caption: 'Start here',
    body: [
      'Start in Figma. Build in Storybook. Ship with @stolt/rippl.',
    ],
  },
];

export const LINKS: ResourceLink[] = [
  {
    label: 'Figma — Rippl UI kit',
    href: 'https://www.figma.com/design/RbdGI9JdF0kv29eZjAlZSH',
    note: 'File key RbdGI9JdF0kv29eZjAlZSH',
  },
  {
    label: 'Storybook',
    href: '#',
    comingSoon: true,
    note: 'rippl.stolt.com (soon)',
  },
  {
    label: '@stolt/rippl',
    href: '#',
    comingSoon: true,
    note: 'Azure Artifacts (soon)',
  },
];

/** Copy for the single-page scroll story on `/`, in scene order (doc.md, NARRATIVE.md §9). */
export const STORY = {
  promise: ['One drop.', 'Every product.'],
  fragmentation: {
    index: '03',
    label: 'Product fragmentation',
    title: 'Every product was built',
    /** The title's last words, flipped on scroll: care, then alone. The full stop is the drop. */
    flip: ['with care', 'alone'],
    /** One per beat: beside the single button, the split, then the three screens. */
    notes: ['Nothing was broken', 'Everything was separate', 'Same Purpose. Different Faces.'],
    /** The one button, then the three it drifts into; the first is also the shared label. */
    buttons: ['Continue', 'Submit', 'Confirm'],
  },
  newWay: {
    index: '04',
    label: 'The new way',
    kicker: 'The new way:',
    /** The whole line swaps on scroll: "Change once." gives way to "Rippl everywhere." */
    flip: ['Change once.', 'Rippl everywhere.'],
    /** Fill from outline, one line per beat, as the dots spread. */
    lines: [
      'Rippl is Stolt-Nielsen’s design system.',
      'One shared foundation of building blocks, patterns and guidelines.',
      'Every product draws from it, built by DICe for every Stolt business.',
    ],
  },
  naming: {
    index: '05',
    label: 'Naming story',
    body: 'We dropped the final letter deliberately. ‘Ripple’ is a word the world owns. ‘Rippl’ is a word only we own.',
    signature: 'The absence is the signature.',
  },
  how: {
    index: '06',
    label: 'How it works',
    title: 'How Rippl works?',
    ideas: [
      { kicker: '01 / 03', line: 'Idea one: everything is defined once.', detail: 'Each decision is made once and kept in one place.' },
      { kicker: '02 / 03', line: 'Idea two: every product draws from the centre.', detail: 'Products connect to Rippl. They do not copy from it.' },
      { kicker: '03 / 03', line: 'Idea three: change ripples outward.', detail: 'When the centre improves, every connected product improves with it.' },
    ],
  },
  movements: {
    index: '07',
    label: 'Two movements',
    cards: [
      {
        kicker: '01 / Adopt',
        title: 'GoRippl',
        line: 'The adoption movement.',
        body: 'A product joins the shared foundation and starts moving with everyone else.',
      },
      {
        kicker: '02 / Contribute',
        title: 'DoRippl',
        line: 'The contribution culture.',
        body: 'Improve something, and the whole organisation feels the ring.',
      },
    ],
  },
  shared: {
    index: '08',
    label: 'Shared promise',
    /**
     * Copy from Figma 138:159, one beat per square. The first is the yellow card itself once it
     * has pushed navy out; navy is last because it grows into the close.
     */
    panels: [
      { colour: 'var(--amber)', text: 'A shared language, a living foundation' },
      { colour: 'var(--rippl-ref-color-magenta-500)', text: 'a promise of sameness' },
      { colour: 'var(--rippl-ref-color-cyan-600)', text: 'helping every Stolt product feel consistent,' },
      { colour: 'var(--rippl-ref-color-light-green-500)', text: 'connected, and instantly familiar.' },
      { colour: 'var(--navy)', text: 'One shared promise.' },
    ],
  },
  closing: {
    index: '09',
    label: 'Closing',
    lines: ['One drop.', 'Every product.'],
    last: 'Starting now.',
    credit: 'Rippl, built by DICe, for every Stolt business.',
  },
};

/** Division logos for the Who section (Logo Version 1, white bg). */
export const DIVISIONS = [
  { name: 'Stolt-Nielsen', src: 'brand/Logos/Logo Version 1 for white background/PNG/SN_LOGO_1.png' },
  { name: 'Stolt Tankers', src: 'brand/Logos/Logo Version 1 for white background/PNG/ST_LOGO_1.png' },
  { name: 'Stolt Tank Containers', src: 'brand/Logos/Logo Version 1 for white background/PNG/STC_LOGO_1.png' },
  { name: 'Stolthaven Terminals', src: 'brand/Logos/Logo Version 1 for white background/PNG/SHVN_LOGO_1.png' },
  { name: 'Stolt Sea Farm', src: 'brand/Logos/Logo Version 1 for white background/PNG/SSF_LOGO_1.png' },
  { name: 'Stolt Nielsen Gas', src: 'brand/Logos/Logo Version 1 for white background/PNG/SNG_LOGO_1.png' },
];

export const WHO_ICONS = [
  { name: 'Ship', src: 'brand/Divisional icons/Ship.png' },
  { name: 'Tank container', src: 'brand/Divisional icons/Tank container.png' },
  { name: 'Terminal', src: 'brand/Divisional icons/Terminal.png' },
  { name: 'Sea Farm', src: 'brand/Divisional icons/Flat fish.png' },
  { name: 'Rail', src: 'brand/Divisional icons/Railcar Tank.png' },
];
