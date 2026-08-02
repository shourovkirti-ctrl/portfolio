# Design Plan

What this site is, and why it is built the way it is. Companion to `TECHNICAL_PLAN.md`, which covers how it gets built.

Written 2 August 2026, at the end of the design phase.

---

## 1. What this is

The personal portfolio of **Khondokar Zobaed Hassan** — photographer, 3D documentarian and heritage researcher in Dhaka.

His work spans four things that usually belong to four different people: photography, commercial 3D and animation, cultural heritage documentation in three dimensions, and published research. The site's job is to make that read as one continuous practice rather than four unrelated careers.

### The thesis

> A photograph holds a moment. Enough photographs hold an object.

That sentence is literally true of his craft — photogrammetry turns hundreds of photographs into a measurable object — and it is the organising idea for the whole site. Where the interface reaches for a metaphor, it reaches for this one: **flat image becomes points becomes object**.

### Who it is for

Museums and cultural institutions · government and heritage bodies · commercial clients evaluating 3D and photography work · researchers.

These audiences want different things, and the tabs are split by **purpose rather than by medium** because of it. A 360° tour is a technique, not a subject; heritage tours belong with places, commercial tours belong with clients.

---

## 2. Governing principles

**Show, don't claim.** Nothing goes on the site that cannot be verified from outside it. Superlatives are replaced with numbers; where a claim is genuinely uncertain, the wording is hedged ("the only *known* record"). Careful wording makes a claim credible rather than weaker.

**Numbers earn respect; vanity metrics don't.** Follower counts, likes and view counts appear nowhere. Volume-of-work numbers — panorama counts, image counts, face counts — appear freely, because they describe the work rather than its reception.

**Credit everyone.** Sculptures are other artists' work; posters have a named artist; photographs of him were taken by someone. Every borrowed thing carries its maker's name.

**Contrast is a design tool.** Not every room should be loud. The Photography tab is deliberately the quiet one, because silence next to noise makes the noise louder.

**Never hijack the visitor.** No auto-navigation, no forced sequences, no scroll-jacking that can't be escaped. Where the site wants to lead somewhere, it offers a visible door rather than pushing.

---

## 3. Site structure

Six tabs.

| Tab | Job |
|---|---|
| **Home** | One continuous scroll that states the thesis and hands over the map |
| **Heritage** | Places and exhibitions — the body of documentation work |
| **Photography** | The quiet room; where the thesis is inverted |
| **Commercial** | Client work, built to be evaluated quickly |
| **Research & Writing** | Papers and the public-facing series behind them |
| **About / Contact** | The line connecting all of it |

A seventh tab for virtual tours was designed and then removed. Splitting by purpose sent the heritage tours to the map and the exhibition tour to the sculpture segment, leaving only three commercial tours behind — and a thin tab is worse than no tab.

---

## 4. Home — the scale ladder

A single continuous scroll with no cuts:

```
coin → sculpture → room → building → hill → map of Bangladesh
```

Between each rung the object **disperses into points, and the cloud re-forms as the next object**. The points are the shared medium; nothing ever cuts.

### Why this order

It is not simply small to large. It runs **personal to universal**: something held in a hand, then human expression, then human dwelling, then human power, then the land all of it stands on. The order carries the meaning and must not be shuffled.

The hill is the only rung **no one built**. Everything before it is human work; the land is not.

### The ending

The ladder does not stop at the hill. The camera keeps pulling back, the terrain disperses, and the points re-form as the **map of Bangladesh** with his pins lighting up one by one.

This does three things at once: it hides a final rung the visitor never expected; it retroactively changes what the journey was about, since what looked like assorted objects turns out to be one country documented place by place; and it answers "what now?" by handing over the map, which is exactly a home page's job.

The map at the end is an **invitation, not the Heritage tab itself** — pins respond to hover, a visible label offers the way in, and clicking navigates. It never navigates on its own.

### Supporting details

A faint real measurement tracks the scroll — `3 cm → 91 cm → 8 m → 8.07 m → ~2 km`. The 8.07 m is measured from his own digital elevation model, published in one of his papers. For someone who publishes sub-millimetre resolutions, the numbers on his own site should be real.

A **skip control is mandatory**, treated as a feature rather than a courtesy. Returning visitors should not have to watch the sequence again.

---

## 5. Heritage

The largest tab, holding two threads that are related but not the same.

> **Places outlive us. Exhibitions do not.**

A mosque stands for five hundred years. An exhibition runs for a month and is gone. Both are documented here; the distinction shapes how each is presented.

### Structure

The landing shows a **custom SVG map of Bangladesh** — not Google Maps or Mapbox, which are heavy, generic, and impose their own styling — beside a **featured strip** linking directly to the deepest experiences.

Both are needed. The map serves browsing; the featured strip serves "show me the best". Without the strip, the strongest work sits three clicks deep and nobody finds it.

A toggle switches between **Places** (the map) and **Exhibitions** (a chronological list).

### Places

Clicking a pin does **not** immediately load a heavy 3D scene — the visitor may only be checking what is there. It opens a light panel: name, district, period, one line of context, and cards for **every format held for that place**.

This is where an idea becomes concrete: a place with three formats shows three cards, one with a single format shows one. Pin weight on the map encodes the same thing, so the map says not only *where* but *how deeply*.

Some sites carry a 360° tour, a mesh and a Gaussian splat; the heaviest pin carries a tour, a destroyed object's only 3D record, and a published survey.

### Exhibitions

The thread grows by one or two a year, so exhibitions use a **repeatable template rather than bespoke pages**: name, organising institution, dates, one paragraph, the tour, the counts, and a closing line stating that the exhibition has ended and survives only in this archive.

### The deep experiences

**Paharpur — two generations.** The same UNESCO site exists as a 2023 photogrammetric mesh and a 2025 Gaussian splat. Shown side by side, they demonstrate three years of technical evolution without a word of explanation.

The two views share **one camera rendered into two viewports**, so synchronisation is exact by construction rather than approximated. The real work is registering the two reconstructions into one coordinate space, which is done once, offline.

**A Forgotten Palace.** One room of an obscure zamindar house whose name is not recorded. The visitor arrives in the present ruin carrying a weak light, searches for a period chandelier switch, and clicking it lights the room — the restoration spreading outward with the light. The boundary between ruin and restoration is not a slider; it is the light itself.

Hidden interactions are undiscoverable, so hinting escalates over time: dust drifts toward the switch, then the chandelier stirs, then the switch glows. Nobody leaves empty-handed. The state toggles, because the comparison is the whole value.

The reconstruction is labelled as **interpretive, informed by primary sources** — not presented as fact.

**The sculpture archive.** Hundreds of works from a national exhibition that no longer exists, arranged in rings grouped by material. The overview floats several rings at once; entering one places the visitor **inside** it, with the sculptures facing inward and a fixed pool of light on the floor marking focus. The ring turns; the light does not.

Distant sculptures are **flat photographs that become full 3D as they rotate into focus** — the performance strategy and the site's central metaphor turning out to be the same thing.

Every sculpture gets its own URL, its own page, and its artist's name.

**The Venus Statue.** A statue that stood in front of Shashi Lodge, Mymensingh, destroyed by vandals after 5 August 2024. Three independent records survive: a 3D model timestamped by a third party before the destruction, a 360° panorama showing it standing on a government domain, and the original capture photographs.

The page opens on a still frame of it **standing in place** — an ordinary photograph, no text. On scroll it lifts out of the image, becomes points, becomes the model, and can be handled. Only then does the fact appear.

The ordering is the design. The visitor spends time with the object before learning it is gone. Nothing else is needed — no music, no darkness, no memorial iconography. Restraint is the respect, and it is also what keeps the rest of the archive credible.

One rule: points may assemble into the statue, never the reverse. Showing it break apart would re-enact the destruction.

---

## 6. Photography

By the time a visitor arrives here they have been through the scale ladder, the floating rings and the chandelier room. **This room is deliberately quiet.**

It is also the exact inverse of the site's thesis. The rest of the site says *enough photographs hold an object*; this room says *one photograph holds a moment*. So: **one image at a time, full bleed, no grid.** A masonry grid would make every photograph equally unimportant.

### Order

Segments run by **camera distance**, pulling back continuously:

```
Portrait → Street → Nature & Bird → Bird Eye View
```

This rhymes with the home page inverted — there the objects grow, here the camera retreats.

Fashion and studio work sits **outside this flow with its own entrance**. Different register; the visitor should enter it knowingly.

### The bridge

The final aerial image is a **real drone photograph** of Paharpur — not a render, because a photography section should not contain non-photographs. Photogrammetry has already solved the exact camera pose of every source frame, so the model's opening camera can be set to that solved pose and the transition lands exactly, because it is literally true.

The image dissolves into points, re-forms as the model, and offers an explicit button. **It never navigates on its own.** This is the only cross-tab bridge on the site; repeating the device everywhere would turn it into a pattern, and patterns get ignored.

Camera settings are whispered in a corner — small, for the part of the audience that cares.

---

## 7. Commercial

This tab has a different job from every other one. The rest of the site says who he is; this decides whether someone hires him. It is also the tab most likely to be someone's **first** page, arriving from a search rather than through the site's journey — so it must explain itself quickly and stay two levels deep at most.

### An index, not a grid of cards

Visitors here are **evaluating**, not browsing. They want something dense, scannable and comparable, so the landing is a typographic index — client, capability, year — with a preview panel that fills as rows are hovered.

A card grid reads as a brochure. An index reads as a record of work.

It also lets a pattern surface that a grid would scatter: several competing companies in the same industry appear consecutively. Nobody has to write "specialist"; the list says it.

Each client opens a single-screen page: what was needed, what was made, the artefact, the year. Business visitors scan rather than read.

### Constraints

Muted video loops play only while on screen and never autoplay on mobile or slow connections — a page of simultaneously playing videos is hostile. Full videos carry controls and do not autoplay, since the visitor may be in an office.

No testimonials. Real ones cannot be obtained this long after the work, and anonymous ones ("— Retail Client") damage credibility rather than building it. The client names do that work already.

No prices, no service-package grids, no animated statistics, no process timelines. Those belong on agency sites.

---

## 8. Research & Writing

Three papers, published with DOIs.

Each subject exists at **three depths on one page**:

| Depth | What | For |
|---|---|---|
| 1 | The live 3D model | anyone, ten seconds |
| 2 | A five-part narrative series, ~400 words each, bilingual | the curious reader |
| 3 | The full paper — PDF and DOI | researchers |

A casual visitor reads part one and leaves satisfied; a researcher downloads the paper. Nobody enters through the wrong door.

This is the one thing a journal cannot offer: the paper describes damage to an object, and on this site the reader can rotate the object and find it.

There is no separate blog tab. The writing lives with the object it is about; this tab indexes it.

**Wording discipline**: preprints are described as preprints. Nothing is called peer-reviewed until it is.

---

## 9. About / Contact

By the time a visitor reaches About they have seen five tabs of evidence. About's job is not to prove anything — it is to **connect** what they have already seen.

Two structures do the work.

**A line.** A career timeline from 2013 to now, showing that cinematography, photography, animation, photogrammetry and heritage research are one continuous path rather than four hobbies.

**Institutions.** A short list of organisations with long relationships — a university, a national arts academy, a national tourism portal, a certification body. All externally verifiable. This answers "why should I trust this person" without him claiming anything.

The central paragraph explains the whole profile in one fact: he completed majors in two different university departments, computer science and journalism, which is why one person does both the machine and the story.

A single line resolves the fact that he appears online under several names.

Contact is minimal — no street address, and email and phone rendered by script rather than sitting in the HTML for scrapers to harvest.

---

## 10. Cross-cutting rules

**Language.** The interface is English; long-form content is bilingual with a per-article toggle. Bengali is where it matters — the stories about Bangladeshi heritage, written for Bangladeshi readers — rather than on navigation labels.

**Motion.** `prefers-reduced-motion` is honoured everywhere. Floating elements never share a period or phase, so they never synchronise into something mechanical. Camera moves avoid roll.

**Accessibility.** Every 3D room ships a server-rendered text equivalent underneath. This is not a consolation prize — it is also the crawlable content, since a WebGL canvas gives search engines nothing to read. The map is always paired with a synchronised list, because a map-only interface is unusable by keyboard and screen reader.

**Mobile** is the binding constraint on every 3D idea, planned from the start rather than retrofitted. Where an interaction depends on a cursor, mobile gets a different interaction rather than a broken one.

**Never on this site**: fabricated or AI-generated imagery presented as record; anonymous testimonials; follower counts; unverifiable superlatives; a claim of a credential without evidence behind it.

---

## 11. Build order

Three phases, sequenced by **how much each depends on content only Shourov can supply** — so the site can be live and credible long before the heaviest work is done.

**v1** ✅ built — Home (simple), Heritage map and place panels, the exhibitions thread, Research & Writing, About. Needs almost nothing new; the tour links, DOIs and copy already exist.

One rule the build had to invent: **a record that is held but not yet published says so.** Twenty-seven places carry forty formats between them, and fourteen of those are captures that exist on a hard drive and have not been through the asset pipeline. Hiding them would make the archive look smaller than it is; showing them as live would be a claim the site cannot support. They appear as cards marked *held, not yet published*, and pin weight counts them — because what the map is encoding is depth of documentation, not depth of publication.

**v2** — Photography, Commercial, the Paharpur comparison. Needs his curation.

**v3** — The sculpture ring system, A Forgotten Palace, the full scale ladder. Needs his production work.

A site that is live beats a site that is half-built, and small pull requests are reviewable in a way that one enormous one is not.
