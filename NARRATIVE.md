# Rippl narrative brief and content plan

Extracted from `Rippl_Story_Narrative_Brief_20261001.pdf` (Digital Innovation Centre, v1.0, October 2026). This file is the working reference; the PDF does not need to be opened again. Section numbers match the PDF.

Cover line: **One drop. Every product.**
Cover subtitle: The story, the reason and the feeling behind Rippl: everything a designer needs to build a landing experience that makes every visitor think, oh yes, this is true.
Closing page: Tell the story so well that nobody needs to be convinced. They will recognise it, believe it and belong to it. That is the landing experience. One drop, and the rings do the rest.
Footer credit: Rippl, built by DICe, for every Stolt business.

---

## Content plan for this site

### Status

| Stage | Scope | State |
|---|---|---|
| 1 | Taglines on the centre box, tile names, browser titles | Done (`src/app/content.ts`, `src/app/app.routes.ts`) |
| 2 | Act 1 · The drop (`/what`) | Done: copy + interactive drop pool |
| 3+ | Acts 2 to 8, one at a time | Pending |

### Act to tile mapping

The grid stays at eight tiles (decided: do not reduce). The brief has seven acts. Acts 1 to 7 take tiles 1 to 7 in order; tile 8 is Resources, the practical doorway (the addresses from §5 plus Figma, Storybook and package links), which is the "clear, single next step" act 7 points at.

| Tile | Route id (current) | Title | Act | Feeling | Sample line |
|---|---|---|---|---|---|
| 1 | `what` | The drop | 1 Arrival | Calm curiosity | One drop. Every product. |
| 2 | `why` | The world before | 2 Recognition | "Oh yes, this is true" | Every product was built with care. Every product was built alone. |
| 3 | `how` | The idea | 3 Revelation | Relief, clarity | Change once. Rippl everywhere. |
| 4 | `foundations` | The name | 4 Meaning | Delight in the detail | Ripple is a word the world owns. Rippl is ours. |
| 5 | `components` | The world inside | 5 Substance | Confidence, trust | Everything you build with, decided once and done right. |
| 6 | `patterns` | The two verbs | 6 Belonging | Belonging, ownership | Products GoRippl. People DoRippl. |
| 7 | `who` | The promise | 7 Invitation | Resolve, "I'm in" | One drop. Every product. Starting now. |
| 8 | `resources` | Resources | Doorway (§5 addresses, links) | | |

Route ids are the old What/Why/How names. Rename each id to its act slug when that section page is rewritten (id is used in `hero-grid.html` tile art `@switch`, `hero-grid.scss` `.art-*` and `.tile-*`, `section-page.html` `@switch`, `app.spec.ts`).

### Per-section rewrite checklist (apply when each page is done)

- Section `kicker`, `title`, `body`, `caption` in `content.ts` rewritten from the act's source sections below.
- One idea per screen. Problem before solution, meaning before mechanics, belief before belonging.
- House style pass (§10): no em-dashes, never "just", British spelling, sentence-case headings, "we" and "our".
- Motion enacts the act (rings spread, islands connect, change travels).
- Depth limit: no file structures, token syntax, repo screenshots, process diagrams, API pages, token tables, setup guides.
- Pending house-style fixes already known: em-dashes in `SECTIONS` body copy and in `LINKS` label "Figma — Rippl UI kit"; `OUTRO_QUOTE` to be re-sourced from the acts.

### Source sections per act

| Act | Read |
|---|---|
| 1 The drop | §9 act 1, §10 taglines, §2 state 1 |
| 2 The world before | §3 whole, §2 states 2 and guardrail, §9 act 2 |
| 3 The idea | §4 whole, §7 ideas one to three, §9 act 3 |
| 4 The name | §5 whole, §9 act 4 |
| 5 The world inside | §4 "it is" trio, §7 three columns and depth limit, §9 act 5 |
| 6 The two verbs | §8 whole, §9 act 6 |
| 7 The promise | §6 whole, §9 act 7, closing page |
| 8 Resources | §5 addresses table, existing `LINKS` |

---

## §1 Why this document exists

Read this before you design a single pixel.

We are building a landing experience for Rippl. Not a manual, not a component browser: a story the whole organisation walks through. Rippl already exists as work: a Figma library, a Storybook repo, guidelines, trackers. What it does not yet have is a front door. The landing site is that front door, and a front door has one job: when someone steps through it, they should understand what this place is, why it matters, and why it matters to them.

Every section must answer one question: which part of the story am I telling? If a section cannot answer that, it does not belong on the site.

**A note on the reference.** Inspired by the craft of great brand sites: generous pacing, one idea per screen, scroll that feels like turning pages of a story. Take the discipline, not the content. Everything on our site comes from this document and from Rippl itself.

**The one rule.** Keep it simple. If a visitor needs design vocabulary to understand a section, rewrite the section. Rippl should be explainable to anyone at Stolt, from a deck officer to a developer, in the time it takes to drink a coffee.

Document map: §2 to §4 the heart (feeling, world before, what Rippl is). §5 and §6 the soul (name, reason). §7 and §8 the shape (how it works, two verbs). §9 the spine (visitor's journey). §10 and §11 keep us honest (voice, what the site must never become).

## §2 The feeling we are designing for

Target: **"Oh yes, this is true."** Not "this looks nice", not "this is impressive". Recognition. The quiet nod of someone who has lived the problem and now sees it named.

Most internal launches ask people to believe in something new. Rippl asks people to recognise something they already know. Everyone at Stolt has seen the same screen look three different ways. Everyone has waited for a small change to crawl through five products. Everyone has wondered why the same button needs to be rebuilt again and again. When the site puts that into words, the visitor supplies the belief themselves. We do not sell Rippl, we let people recognise it.

**Belief that is recognised lasts. Belief that is sold fades.**

### The emotional arc, four states in order

1. **Curiosity.** "What is this? It feels calm and considered. I want to scroll."
2. **Recognition.** "Oh yes, this is true. I have lived this exact problem. They understand."
3. **Belief.** "This makes sense. One source, every product. Of course this is the way."
4. **Belonging.** "This is ours. I know what it asks of me, and I want to be part of it."

**Guardrail.** If any section creates confusion, scepticism or the feeling of being lectured, it has broken the arc. Recognition first, always. Facts and features only ever arrive after the visitor already feels understood.

## §3 The world before Rippl

**Every product was an island.**

Stolt builds many digital products, across businesses, teams and years. Each one was built with care. But each one was also built alone. Its own buttons. Its own colours. Its own way of saying the same thing. Nobody chose this: it is what happens when good teams work fast without a shared foundation.

**Nothing was broken. Everything was separate. And separate is expensive.**

What that world costs, in human terms:

- Designers rebuild instead of design. The same table, form and card drawn again for every product. Craft spent on repetition instead of on problems worth solving.
- Developers translate instead of build. Every handoff begins with questions a shared language would have already answered.
- Users relearn instead of flow. A colleague moving between our products relearns patterns that should feel like home everywhere.
- Change moves at the speed of the slowest product. One small improvement has to be carried by hand into every island, one at a time. Most improvements never finish the trip.

**How the site should tell this.** Visually and gently: sameness drifting apart, the one button that became five, the change that travels slowly across islands. No charts of blame, no finger pointing at any team. The villain is separation itself, never people. This section carries the heaviest emotional load; it is where "oh yes, this is true" happens. Give it room and quiet, resist rushing to the solution. The longer the visitor sits in recognition, the stronger the belief that follows.

## §4 What: the simple answer

Rippl is Stolt-Nielsen's design system: one shared foundation of building blocks, patterns and guidelines that every digital product draws from, built by DICe for every Stolt business.

Even more simply: Rippl is the single source every product trusts. Colours, type, buttons, tables, patterns, words, rules of behaviour, all defined once, in one place, used everywhere.

**It is**

- **A shared language.** Every product speaks the same way, and every person instantly understands it.
- **A living foundation.** Maintained, versioned and growing. It improves continuously, and every product improves with it.
- **A promise of sameness.** The same action looks and behaves the same everywhere. Users carry their learning with them.

**It is not**

- **A restriction.** It removes repetitive decisions, so teams spend their energy on the decisions that matter.
- **A one-time project.** It has no end date. A design system is a product that serves products, for as long as we build.
- **Only for designers.** Designers, developers, product owners, every DICer and every Stolt business builds on it.

**The one-sentence version for the site.** Rippl is the one place where Stolt's digital world is defined, so that every product is built once, built right and built the same.

Placement: this answer lands after the world-before section, never first. Context first, answer second: that is the order of the whole experience.

## §5 The story behind the name

The name is the entire idea of the system compressed into five letters; treat it as a story worth telling slowly.

**Ripple physics.** Drop a single drop into still water and you get a ripple: a change that travels outward on its own, reaching every edge, touching everything, without being carried by hand. Change a token once, every screen follows. Fix a component once, every product inherits the fix. Improve a pattern once, the improvement travels everywhere the pattern lives. One drop at the centre, motion at every edge. The name is a physics lesson about how change should move through an organisation.

**The missing E.** Dropped deliberately. "Ripple" is a word the world owns. "Rippl" is a word only we own. Distinct, searchable, protectable, and it signals intent: not a borrowed metaphor, a name we made. The absence is the signature. Clean to trademark, impossible to confuse with anything else.

**Where Rippl lives**

| Address | Role |
|---|---|
| rippl.stolt-nielsen.com | Home. The landing experience and the front door to the system. |
| gorippl.com | The adoption movement: products and teams joining the system (§8). |
| dorippl.com | The contribution culture: people giving back to the system (§8). |

**How the site should tell this.** Give the name its own moment: a quiet screen, a single drop, rings spreading on scroll, then the word with the E falling away. The one screen every visitor should remember.

## §6 Why: the reason it matters

Not because design systems are fashionable. Because one organisation should feel like one organisation, everywhere its people meet it.

Four reasons, in order of importance:

1. **One Stolt, everywhere.** Every product a Stolt colleague or customer touches should feel like it came from the same hands. Uniformity is not cosmetic: it is trust, made visible.
2. **Change once, everywhere.** Improvements travel like ripples, not like cargo carried island to island. The system turns every fix into an organisation-wide fix.
3. **Craft over repetition.** When the foundation is shared, designers and developers stop rebuilding the known and start solving the new. Rippl buys back time for real problems.
4. **Speed with confidence.** Teams move faster when every building block is already decided, tested and trusted. Quality stops depending on who built which screen on which day.

**The honest line on adoption.** Warm, but not vague: Rippl is the way we build now. Adoption is not a menu option among many. One Figma library, one Storybook repo, one source of truth, and every product aligns to it. The tone is an invitation, the direction is certain.

**We are not asking whether to align. We are showing how good aligned feels.**

**How the site should carry this.** Confidence without threat. Say "this is how we build" the way a captain states a course: calmly, once, no raised voice. Pair every statement of certainty with a statement of support, so the visitor hears direction and help in the same breath.

## §7 How: in plain words

Explain the machinery as to a friend over coffee: three ideas, no jargon, no diagrams that need a legend.

- **Idea one: everything is defined once.** A single set of decisions sits at the centre: colours, type, spacing, components, patterns, words. Each made once, written down once, stored in one place. No second copy anywhere to drift out of date.
- **Idea two: every product draws from the centre.** Products do not copy from Rippl, they connect to it. Designers work from the shared Figma library. Developers build with the shared component code in Storybook. Guidelines explain how and when to use each piece. Everyone draws from the same well, so everyone's water tastes the same.
- **Idea three: change ripples outward.** When the centre improves, every connected product improves with it. That is the whole trick, and why the name is the name. Maintenance stops being a tour of islands and becomes a single drop.

| For designers | For developers | For everyone |
|---|---|---|
| **One library.** Open Figma, and everything you need is already there, already correct, already consistent. | **One codebase of parts.** Components arrive built, tested and documented. You assemble products, not parts. | **One set of answers.** Guidelines settle the debates before they start, so meetings are about problems, not pixels. |

**Depth limit for the site.** This is as technical as the landing experience ever gets. No file structures, no token syntax, no repo screenshots, no process diagrams. Visitors who want depth will find it inside the system itself; the site's job is to make them want to look.

## §8 The two verbs: GoRippl and DoRippl

A system is a thing. A culture is a behaviour. Rippl has two verbs because we are building both; present them as the living part of the story.

- **GoRippl (gorippl.com).** The adoption movement. When a product joins the system, it goes Rippl: it connects to the shared foundation and starts moving with everyone else. The journey every product takes from island to ecosystem.
- **DoRippl (dorippl.com).** The contribution culture. Built by DICe, grown through everyone. When you improve a component, propose a pattern or report a gap, you do Rippl: you drop something into the water and the whole organisation feels the ring.

Together: GoRippl brings products in, DoRippl makes people owners. One is direction, the other is participation. A visitor should leave knowing which verb applies to them today, and that both will apply eventually.

**Why this matters psychologically.** Verbs turn an artefact into an identity. Nobody feels belonging toward a library; people do feel belonging toward a movement they can act in. The verbs convert belief (state 3) into belonging (state 4): the bridge from "this is true" to "this is ours".

**How the site should tell this.** Two verbs side by side, equal in weight, late in the journey. Human language only: "your product joins", "your improvement travels", never "stakeholder onboarding" or "contribution workflow".

## §9 The visitor's journey: seven acts, one scroll

| # | Act | Message | Feeling | Sample line |
|---|---|---|---|---|
| 1 | **The drop · arrival** | A still, calm opening. One drop, rings spreading, the name, the promise. No menus shouting, no feature lists. The visitor should exhale, slow down and want to scroll. | Calm curiosity | "One drop. Every product." |
| 2 | **The world before · recognition** | The islands. The button that became five buttons. The change that travelled by hand and never arrived. Told gently, visually, with the honesty of §3. The longest emotional beat; let it breathe. | "Oh yes, this is true" | "Every product was built with care. Every product was built alone." |
| 3 | **The idea · revelation** | The turn. What if everything was defined once? What if change moved like a ripple instead of like cargo? The solution arrives as relief, earned by living act two. | Relief, clarity | "Change once. Rippl everywhere." |
| 4 | **The name · meaning** | Ripple physics and the missing E, as in §5. The quiet signature moment, the screen people remember. | Delight in the detail | "Ripple is a word the world owns. Rippl is ours." |
| 5 | **The world inside · substance** | What lives in Rippl, in human words: shared language, living foundation, promise of sameness. The three ideas of §7, shown more than said. Enough substance to trust, never enough to drown. | Confidence, trust | "Everything you build with, decided once and done right." |
| 6 | **The two verbs · belonging** | GoRippl and DoRippl side by side, as in §8. The visitor finds their own place: my product joins, my improvements travel, this is mine too. | Belonging, ownership | "Products GoRippl. People DoRippl." |
| 7 | **The promise · invitation** | The close. One Stolt, every product, one foundation, and a clear, single next step for each kind of visitor. End on certainty and warmth. | Resolve, "I'm in" | "One drop. Every product. Starting now." |

**Rules that hold the journey together**

- One idea per screen. If a screen tells two things, split it or cut one.
- The order is the argument. Problem before solution, meaning before mechanics, belief before belonging. Do not reorder the acts.
- Motion serves meaning. Every animation enacts the story: rings spread, islands connect, change travels. Nothing moves for decoration alone.
- Light, open, unhurried. Bright and generous, with room to breathe. Calm is part of the message: a system should feel like relief.
- Scroll like a story. Reveal as the visitor moves, so reading the site feels like watching the idea happen rather than studying a page.

## §10 Voice, words and taglines

Rippl speaks clean, confident, human. Short sentences. Real words. No filler. The copy carries half the experience.

**Primary tagline:** One drop. Every product.
**Working tagline:** Change once. Rippl everywhere.

**Voice principles**

- Confident, never boastful. State things plainly. "This is how we build" needs no exclamation mark.
- Warm, never casual-for-effect. A trusted colleague, not an advert.
- Simple, never simplistic. Short words for big ideas. If a sentence needs a comma map, cut it in half.
- We and our, always. Rippl is something we built together, not something issued to "users" by "the team".
- Verbs over nouns. Change travels, products join, people contribute.

**Words we use, words we avoid**

| Say | Instead of |
|---|---|
| One place, one source, the centre | Repository, single source of truth (as jargon) |
| Building blocks, parts, patterns | Assets, artefact inventory, UI kit |
| Your product joins | Stakeholder onboarding, migration rollout |
| Change travels, ripples | Propagation, downstream updates |
| DICers, colleagues, everyone at Stolt | Users, resources, team members |

**House style, non-negotiable**

- No em-dashes anywhere: use commas, colons or full stops.
- Never the word "just".
- British-English spellings.
- Sentence-case headings.
- Keep every line scannable; if a paragraph takes more than ten seconds to read, it is two paragraphs.

## §11 What the site is not

- **Not documentation.** Never a manual. No component API pages, no token tables, no setup guides. The system holds the depth; the site holds the meaning.
- **Not a feature list.** We are not selling capabilities to a buyer. A grid of twelve feature cards flattens the journey into a brochure. Every piece of substance arrives inside the story, in its act, in its order.
- **Not a trophy cabinet.** No stats walls, no logos of tools, no screenshots of trackers. The proof of Rippl is the coherence the visitor feels: the site must be the first product that visibly lives the system.
- **Not loud.** No countdowns, no confetti, no competing animations. The brand is a ripple, not a wave. Quiet confidence is the aesthetic and the argument at once.

**The final test before anything ships.** Four yeses, or return to this document before the canvas:

1. Can a visitor who knows nothing about design finish the scroll and retell the story of Rippl in their own words?
2. Did they feel "oh yes, this is true" before they were given a single fact?
3. Does every screen know which act it belongs to?
4. Would the site itself pass as a product built with Rippl's own care?
