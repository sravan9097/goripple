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
  lead: string[];
  /** Small label under the scene. */
  caption?: string;
  pillarsLabel?: string;
  pillars?: Pillar[];
  /** Quiet counterpoints after the pillars (what Rippl is not). */
  notes?: string[];
  closing: string;
}

export interface ResourceLink {
  label: string;
  href: string;
  comingSoon?: boolean;
  note?: string;
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
    act: 'Arrival',
    title: 'One drop.\nEvery product.',
    caption: 'Click the pool. One drop, and the rings reach every shore.',
    lead: [
      'A still, calm opening. One drop at the centre, rings that travel on their own, the name, the promise.',
      'Rippl asks nobody to believe in something new. It asks people to recognise something they already know: the same screen that looks three different ways, the small change that crawls through five products, the button rebuilt again and again.',
    ],
    pillarsLabel: 'The feeling we are designing for, in four states',
    pillars: [
      { word: 'curiosity,', title: 'Curiosity', body: 'What is this? It feels calm and considered. I want to scroll.' },
      { word: 'recognition,', title: 'Recognition', body: 'Oh yes, this is true. I have lived this exact problem. They understand.' },
      { word: 'belief,', title: 'Belief', body: 'This makes sense. One source, every product. Of course this is the way.' },
      { word: 'belonging', title: 'Belonging', body: 'This is ours. I know what it asks of me, and I want to be part of it.' },
    ],
    closing: 'Belief that is recognised lasts. Belief that is sold fades.',
  },
  {
    id: 'why',
    kicker: '02',
    act: 'Recognition',
    title: 'Every product was built with care.\nEvery product was built alone.',
    caption: 'Four teams, four years, one button. Scroll, and watch it drift.',
    lead: [
      'Stolt builds many digital products, across businesses, teams and years. Each one has its own buttons, its own colours, its own way of saying the same thing. Nobody chose this: it is what happens when good teams work fast without a shared foundation.',
      'No charts of blame, no finger pointing at any team. The villain is separation itself, never people.',
    ],
    pillarsLabel: 'What separate costs, in human terms',
    pillars: [
      { word: 'designers rebuild,', title: 'Designers rebuild instead of design.', body: 'The same table, form and card drawn again for every product. Craft spent on repetition instead of on problems worth solving.' },
      { word: 'developers translate,', title: 'Developers translate instead of build.', body: 'Every handoff begins with questions a shared language would have already answered.' },
      { word: 'users relearn,', title: 'Users relearn instead of flow.', body: 'A colleague moving between our products relearns patterns that should feel like home everywhere.' },
      { word: 'change waits', title: 'Change moves at the speed of the slowest product.', body: 'One small improvement has to be carried by hand into every island, one at a time. Most improvements never finish the trip.' },
    ],
    closing: 'Nothing was broken. Everything was separate. And separate is expensive.',
  },
  {
    id: 'how',
    kicker: '03',
    act: 'Revelation',
    title: 'Change once.\nRippl everywhere.',
    caption: 'One dot changes at the centre. Every dot follows.',
    lead: [
      'What if everything was defined once? What if change moved like a ripple instead of like cargo?',
      'Rippl is the single source every product trusts. Colours, type, buttons, tables, patterns, words, rules of behaviour: all defined once, in one place, used everywhere.',
    ],
    pillarsLabel: 'How it works, as to a friend over coffee',
    pillars: [
      { word: 'defined once,', title: 'Everything is defined once.', body: 'A single set of decisions sits at the centre: colours, type, spacing, components, patterns, words. Each made once, written down once, stored in one place. No second copy anywhere to drift out of date.' },
      { word: 'drawn from the centre,', title: 'Every product draws from the centre.', body: 'Products do not copy from Rippl, they connect to it. Everyone draws from the same well, so everyone’s water tastes the same.' },
      { word: 'rippling outward', title: 'Change ripples outward.', body: 'When the centre improves, every connected product improves with it. Maintenance stops being a tour of islands and becomes a single drop.' },
    ],
    closing: 'Built once. Built right. Built the same.',
  },
  {
    id: 'foundations',
    kicker: '04',
    act: 'Meaning',
    title: 'Ripple is a word the world owns.\nRippl is ours.',
    caption: 'Scroll: the last letter lets go, and the drop takes its place.',
    lead: [
      'Drop a single drop into still water and you get a ripple: a change that travels outward on its own, reaching every edge without being carried by hand. Change a token once, every screen follows. Fix a component once, every product inherits the fix.',
      'The final letter was dropped deliberately. Distinct, searchable, protectable, and a signal of intent: not a borrowed metaphor, a name we made.',
    ],
    pillarsLabel: 'Where Rippl lives',
    pillars: [
      { title: 'rippl.stolt-nielsen.com', body: 'Home. The landing experience and the front door to the system.' },
      { title: 'gorippl.com', body: 'The adoption movement: products and teams joining the system.' },
      { title: 'dorippl.com', body: 'The contribution culture: people giving back to the system.' },
    ],
    closing: 'The absence is the signature.',
  },
  {
    id: 'components',
    kicker: '05',
    act: 'Substance',
    title: 'Everything you build with,\ndecided once and done right.',
    caption: 'Pick a colour at the centre. Every part follows, at once.',
    lead: [
      'Rippl is Stolt-Nielsen’s design system: one shared foundation of building blocks, patterns and guidelines that every digital product draws from, built by DICe for every Stolt business.',
      'Designers work from the shared Figma library. Developers build with the shared component code in Storybook. Guidelines explain how and when to use each piece.',
    ],
    pillarsLabel: 'What Rippl is',
    pillars: [
      { word: 'a shared language,', title: 'A shared language.', body: 'Every product speaks the same way, and every person instantly understands it.' },
      { word: 'a living foundation,', title: 'A living foundation.', body: 'Maintained, versioned and growing. It improves continuously, and every product improves with it.' },
      { word: 'a promise of sameness', title: 'A promise of sameness.', body: 'The same action looks and behaves the same everywhere. Users carry their learning with them.' },
    ],
    notes: [
      'Not a restriction. It removes repetitive decisions, so teams spend their energy on the decisions that matter.',
      'Not a one-time project. A design system is a product that serves products, for as long as we build.',
      'Not only for designers. Designers, developers, product owners, every DICer and every Stolt business builds on it.',
    ],
    closing: 'One library. One codebase of parts. One set of answers.',
  },
  {
    id: 'patterns',
    kicker: '06',
    act: 'Belonging',
    title: 'Products GoRippl.\nPeople DoRippl.',
    caption: 'Hover a verb: the colours trade places.',
    lead: [
      'A system is a thing. A culture is a behaviour. Rippl has two verbs because we are building both.',
      'Nobody feels belonging toward a library. People do feel belonging toward a movement they can act in.',
    ],
    pillarsLabel: 'Which verb is yours today',
    pillars: [
      { word: 'your product joins,', title: 'Your product joins.', body: 'GoRippl brings products in. A product connects to the shared foundation and starts moving with everyone else: the journey from island to ecosystem.' },
      { word: 'your improvement travels,', title: 'Your improvement travels.', body: 'DoRippl makes people owners. Improve a component, propose a pattern or report a gap, and the whole organisation feels the ring.' },
      { word: 'both, in time', title: 'Both, in time.', body: 'Leave knowing which verb applies to you today, and that both will apply eventually.' },
    ],
    closing: 'One is direction. The other is participation.',
  },
  {
    id: 'who',
    kicker: '07',
    act: 'Invitation',
    title: 'One drop. Every product.\nStarting now.',
    caption: 'Two become one.',
    lead: [
      'Not because design systems are fashionable. Because one organisation should feel like one organisation, everywhere its people meet it.',
      'Rippl is the way we build now. One Figma library, one Storybook repo, one source of truth, and every product aligns to it. The tone is an invitation, the direction is certain.',
    ],
    pillarsLabel: 'Four reasons, in order of importance',
    pillars: [
      { word: 'one Stolt,', title: 'One Stolt, everywhere.', body: 'Every product a Stolt colleague or customer touches should feel like it came from the same hands. Uniformity is not cosmetic: it is trust, made visible.' },
      { word: 'change once,', title: 'Change once, everywhere.', body: 'Improvements travel like ripples, not like cargo carried island to island. Every fix becomes an organisation-wide fix.' },
      { word: 'craft over repetition,', title: 'Craft over repetition.', body: 'When the foundation is shared, designers and developers stop rebuilding the known and start solving the new.' },
      { word: 'speed with confidence', title: 'Speed with confidence.', body: 'Teams move faster when every building block is already decided, tested and trusted. Quality stops depending on who built which screen on which day.' },
    ],
    closing: 'We are not asking whether to align. We are showing how good aligned feels.',
  },
  {
    id: 'resources',
    kicker: '08',
    act: 'The doorway',
    title: 'Open the toolkit.',
    lead: [
      'The site holds the meaning. The system holds the depth. Start in Figma, build in Storybook, ship with @stolt/rippl.',
    ],
    closing: 'One drop, and the rings do the rest.',
  },
];

/** Act 2 scene: the same button, built four times, four years apart. */
export const ISLANDS = [
  { area: 'seafarm', name: 'Stolt Sea Farm', when: 'Year one', cta: 'Continue' },
  { area: 'containers', name: 'Stolt Tank Containers', when: 'Year two', cta: 'Submit' },
  { area: 'tankers', name: 'Stolt Tankers', when: 'Year three', cta: 'Confirm' },
  { area: 'terminals', name: 'Stolthaven Terminals', when: 'Year four', cta: 'Next step' },
];
export const ISLAND_BUTTON = 'Continue';
export const ISLAND_CAPTIONS = [
  'The same button, built again by every team.',
  'Nothing was broken. Everything was separate.',
  'Nobody chose this. It is what happens when good teams work fast without a shared foundation.',
];
export const ISLAND_GAP = 'The fault was never a person. It was the gap.';

/** Act 7 scene: what the two halves open into. */
export const SHARED_PROMISE =
  'A shared language, a living foundation and a promise of sameness, helping every Stolt product feel consistent, connected and instantly familiar.';

/** Act 6 scene: the two verbs, side by side and equal in weight (§8). */
export const VERBS = [
  {
    kicker: '01 / Adopt',
    title: 'GoRippl',
    body: 'When a product joins the system, it goes Rippl: it connects to the shared foundation and starts moving with everyone else.',
    href: 'https://gorippl.com',
  },
  {
    kicker: '02 / Contribute',
    title: 'DoRippl',
    body: 'Built by DICe, grown through everyone. Improve a component, propose a pattern or report a gap, and you do Rippl.',
    href: 'https://dorippl.com',
  },
];

export const LINKS: ResourceLink[] = [
  {
    label: 'Figma: Rippl UI kit',
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

/** Division logos for the Who section (Logo Version 1, white bg). */
export const DIVISIONS = [
  { name: 'Stolt-Nielsen', src: 'brand/Logos/Logo Version 1 for white background/PNG/SN_LOGO_1.png' },
  { name: 'Stolt Tankers', src: 'brand/Logos/Logo Version 1 for white background/PNG/ST_LOGO_1.png' },
  { name: 'Stolt Tank Containers', src: 'brand/Logos/Logo Version 1 for white background/PNG/STC_LOGO_1.png' },
  { name: 'Stolthaven Terminals', src: 'brand/Logos/Logo Version 1 for white background/PNG/SHVN_LOGO_1.png' },
  { name: 'Stolt Sea Farm', src: 'brand/Logos/Logo Version 1 for white background/PNG/SSF_LOGO_1.png' },
  { name: 'Stolt Nielsen Gas', src: 'brand/Logos/Logo Version 1 for white background/PNG/SNG_LOGO_1.png' },
];
