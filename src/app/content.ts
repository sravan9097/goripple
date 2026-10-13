export interface Tile {
  id: string;
  title: string;
  /** Full-strength tile fill, the way the Dropbox grid is coloured. */
  accent: string;
  /** Text and artwork colour that clears contrast on that fill. */
  ink: string;
}

/** Grid face: "The" on its own line, remainder below. One-word titles stay one line. */
export function tileGridLines(title: string): [string, string] | null {
  if (!title.startsWith('The ')) return null;
  return ['The', title.slice(4)];
}

export interface Pillar {
  /** One or two words for the big statement line; the line is skipped when any pillar has none. */
  word?: string;
  title: string;
  body: string;
}

/** One chapter page: opener line, scene, lead copy, pillars, closing line (NARRATIVE.md §9). */
export interface Section {
  id: string;
  kicker: string;
  /** The act's feeling, shown with the kicker. */
  act: string;
  /** Opener line(s); `\n` breaks the line. */
  title: string;
  /** Lead, pillars and closing are the generic chapter body; a chapter with its own sub-sections leaves them out. */
  lead?: string[];
  /** Small label under the scene. */
  caption?: string;
  pillarsLabel?: string;
  pillars?: Pillar[];
  /** Quiet counterpoints after the pillars (what Rippl is not). */
  notes?: string[];
  closing?: string;
}

export interface ResourceLink {
  label: string;
  href: string;
  /** Which port lists this link. */
  port: 'design' | 'build';
  comingSoon?: boolean;
  note?: string;
}

export interface StoryCard {
  title: string;
  body: string;
  /** Icon name drawn by app-icon. */
  icon: string;
}

/** Shown on the large centre box, before the first scroll. Primary tagline, see NARRATIVE.md §10. */
export const TAGLINE_ONE = 'One drop.\nEvery product.';

/** Shown as the centre box contracts. Working tagline, see NARRATIVE.md §10. */
export const TAGLINE_TWO = 'Change once. Rippl everywhere.';

/** Closing page of the brief, shown at the end of the last chapter. */
export const OUTRO_QUOTE = {
  text: 'Tell the story so well that nobody needs to be convinced.',
  attribution: 'Rippl, built by DICe, for every Stolt business.',
};

const LIGHT = 'var(--rippl-ref-color-white, #fff)';

/**
 * Tile order is grid / prev-next order. The North Star leads, then The Rippl effect.
 * Ids are route paths and art hooks.
 */
export const TILES: Tile[] = [
  { id: 'why', title: 'The North Star', accent: 'var(--rippl-ref-color-navy-blue-700)', ink: LIGHT },
  { id: 'what', title: 'The Rippl effect', accent: 'var(--rippl-ref-color-cyan-500)', ink: LIGHT },
  { id: 'how', title: 'The Fleet', accent: 'var(--rippl-ref-color-magenta-600)', ink: LIGHT },
  {
    id: 'foundations',
    title: 'The Compass',
    accent: 'var(--rippl-ref-color-primrose-yellow-400)',
    ink: LIGHT,
  },
  {
    id: 'components',
    title: 'The rules of the Sea',
    accent: 'var(--rippl-ref-color-light-green-600)',
    ink: LIGHT,
  },
  { id: 'patterns', title: 'Beyond the Horizon', accent: 'var(--rippl-ref-color-orange-500)', ink: LIGHT },
  { id: 'who', title: 'The Designer port', accent: 'var(--rippl-ref-color-cyan-800)', ink: LIGHT },
  { id: 'resources', title: 'The Developer Port', accent: 'var(--rippl-ref-color-stolt-red-500)', ink: LIGHT },
];

export const SECTIONS: Section[] = [
  {
    id: 'why',
    kicker: '01',
    act: 'The North Star',
    title:
      'Rippl exists to connect the decisions behind our digital experiences—so every team can build with greater clarity, and every person can feel the difference.',
  },
  {
    id: 'what',
    kicker: '02',
    act: 'Why adopt',
    title: 'Why every product\nshould feel like one.',
    lead: ['One shared way of making, so every product feels like the same organisation.'],
    closing: 'Familiar everywhere. Decided once.',
  },
  {
    id: 'how',
    kicker: '03',
    act: 'Foundations',
    title: 'What creates Rippl.',
    lead: ['Colour, type, space and pattern, decided once and shared by every product.'],
    closing: 'Defined once. Drawn from the centre. Rippling outward.',
  },
  {
    id: 'foundations',
    kicker: '04',
    act: 'How it works',
    title: 'From an idea\nto a product.',
    lead: ['Rippl turns an idea into a product, and gives a team a direction through the options.'],
    closing: 'Think. Ideate. Create. Repeat.',
  },
  {
    id: 'components',
    kicker: '05',
    act: 'GoRippl',
    title: 'Products GoRippl.',
    lead: ['One set of components makes products consistent. Every product joins the same design system.'],
    closing: 'One system. Every product on the line.',
  },
  {
    id: 'patterns',
    kicker: '06',
    act: 'DoRippl',
    title: 'People DoRippl.',
    lead: ['People make the system, and their contributions are what make it scale.'],
    closing: 'The foundation holds. People build the height.',
  },
  {
    id: 'who',
    kicker: '07',
    act: 'For designers',
    title: 'A single design language\nacross every Stolt product.',
    lead: ['Open the kit, and design from the centre.'],
    closing: 'Start in Figma. The parts are already decided.',
  },
  {
    id: 'resources',
    kicker: '08',
    act: 'For developers',
    title: 'Foundations, components\nand patterns, ready to ship.',
    lead: ['Build from the same centre every other product uses.'],
    closing: 'One package. Every product draws from it.',
  },
];

/** Chapter 1, from the Figma "Why — The North Star" frame: the four sub-sections under the opener. */
export const NORTH_STAR = {
  /** The illustration's three text groups, in the order the scenes reveal them. */
  points: [
    {
      title: 'Common language',
      body: 'Designers and engineers use the same tokens, naming, and component patterns so every feature feels like the same product.',
    },
    {
      title: 'Faster delivery',
      body: 'Approved components reduce duplication and speed up implementation, so teams ship more consistently and with less rework.',
    },
    {
      title: 'Better decisions',
      body: 'Approved patterns for common flows give teams a clear direction, so product decisions become more predictable and coherent.',
    },
  ],
  library: { title: 'Rippl Library', tabs: ['Foundations', 'Components', 'Patterns', 'Governance'] },
  oneDirection: 'One direction. Connected products.',
  /** Three slides: the opening line, the title, the line under it. */
  slides: {
    lead: 'Bring reasoning into the open. A shared starting point helps teams spend less time reconciling choices and more time understanding needs.',
    title: 'Less excess.\nMore effect.',
    note: 'Similar interactions a common language. People should not have to relearn the interface every time they move between products.',
  },
  name: {
    title: 'What’s in the Name?',
    body: 'We dropped the final letter deliberately. "Ripple" is a word the world owns. "Rippl" is a word only we own.',
  },
  onward: {
    title: 'Coherent by design.\nHuman by default.',
    body: 'Our north star is a digital experience that feels connected, understandable and considerate. Rippl is the shared language that lets different teams work toward that same experience.',
  },
};

/** Chapter 2: six reasons, told on the accordion cards. */
export const PRINCIPLES: StoryCard[] = [
  { icon: 'clarity', title: 'Clarity', body: 'Make complexity understandable.' },
  { icon: 'consistency', title: 'Consistency', body: 'Familiarity creates confidence.' },
  { icon: 'humanity', title: 'Humanity', body: 'Technology should feel intuitive.' },
  { icon: 'access', title: 'Accessibility', body: 'Design for everyone.' },
  { icon: 'efficiency', title: 'Efficiency', body: 'Every interaction should move the user forward.' },
  { icon: 'scale', title: 'Scalability', body: 'Design once, enable many.' },
];

/** Chapter 3: the foundations, one card at a time. */
export const FOUNDATIONS: StoryCard[] = [
  { icon: 'colour', title: 'Colour', body: 'The colours of every product, named once.' },
  { icon: 'type', title: 'Typography', body: 'The type every screen reads in.' },
  { icon: 'space', title: 'Spacing', body: 'The space between things, the same on every screen.' },
  { icon: 'grid', title: 'Grid', body: 'The columns a layout is built on.' },
  { icon: 'layout', title: 'Layout', body: 'How a page is put together.' },
  { icon: 'elevation', title: 'Elevation', body: 'How far a surface sits above the one behind it.' },
  { icon: 'pattern', title: 'Pattern', body: 'The arrangements of parts that teams reuse.' },
];

/** Chapter 3: the brochure, cover first, then each fold. */
export const BROCHURE: { kicker: string; title: string; body: string }[] = [
  {
    kicker: 'Idea one',
    title: 'Everything is defined once.',
    body: 'Colour, type, space and parts live in one place. There is no second copy to drift.',
  },
  {
    kicker: 'Idea two',
    title: 'Every product draws from the centre.',
    body: 'Products connect to Rippl. They do not keep a private copy.',
  },
  {
    kicker: 'Idea three',
    title: 'Change ripples outward.',
    body: 'Improve the centre, and every connected product improves with it.',
  },
];

/** Chapter 4: the working loop. */
export const CYCLE = ['Think', 'Ideate', 'Create', 'Repeat'];

/** Chapter 4: the line under the network. */
export const NETWORK_LINE = 'The connections you make are the ones everyone else uses.';

/** Chapter 7: what a designer works with. */
export const DESIGN_PARTS: { title: string; body: string }[] = [
  { title: 'Colour', body: 'A palette every product shares, so a screen is recognisable before anyone reads a word.' },
  { title: 'Typography', body: 'One set of type, so Stolt reads the same way everywhere.' },
  { title: 'Accessibility', body: 'Contrast, focus and labels decided once, and held on every component.' },
  { title: 'Tokens', body: 'The named values behind colour, type and space. Change the token, and the designs follow.' },
  { title: 'Iconography', body: 'One family of icons, used the same way on every product.' },
  { title: 'Components', body: 'Buttons, fields, tables and the rest, drawn once and reused.' },
  { title: 'Patterns', body: 'How those parts sit together on a real screen.' },
];

/** Chapter 8: what a developer takes from the system. */
export const BUILD_BLOCKS: { title: string; body: string }[] = [
  { title: 'Foundations', body: 'Tokens for colour, type and space, so a screen starts from the same values everywhere.' },
  { title: 'Components', body: 'Buttons, fields, tables and the rest, already built and ready to compose.' },
  { title: 'Patterns', body: 'The ways those parts go together, so a flow feels like Stolt on every product.' },
];

export const LINKS: ResourceLink[] = [
  {
    label: 'Figma: Rippl UI kit',
    href: 'https://www.figma.com/design/RbdGI9JdF0kv29eZjAlZSH',
    port: 'design',
    note: 'File key RbdGI9JdF0kv29eZjAlZSH',
  },
  {
    label: 'Storybook',
    href: '#',
    port: 'build',
    comingSoon: true,
    note: 'rippl.stolt.com (soon)',
  },
  {
    label: '@stolt/rippl',
    href: '#',
    port: 'build',
    comingSoon: true,
    note: 'Azure Artifacts (soon)',
  },
];

/** Division logos for the Who section (Logo Version 1, white bg). */
export const DIVISIONS = [
  { name: 'Stolt-Nielsen', src: 'brand/Logos/Logo Version 1 for white background/PNG/SN_LOGO_1.png' },
  { name: 'Stolt Tankers', src: 'brand/Logos/Logo Version 1 for white background/PNG/ST_LOGO_1.png' },
  { name: 'Stolt Tank Containers', src: 'brand/Logos/Logo Version 1 for white background/PNG/STC_LOGO_1.png' },
  { name: 'Stolthaven Terminals', src: 'brand/Logos/Logo Version 1 for white background/PNG/SHVN_LOGO_1.png' },
  { name: 'Stolt Sea Farm', src: 'brand/Logos/Logo Version 1 for white background/PNG/SSF_LOGO_1.png' },
  { name: 'Stolt Nielsen Gas', src: 'brand/Logos/Logo Version 1 for white background/PNG/SNG_LOGO_1.png' },
];
