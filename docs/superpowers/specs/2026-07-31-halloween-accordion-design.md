# Halloween page chips accordion

## Summary

Add an accordion to the Halloween page (`app/pages/events/halloween.server.vue`). Each chip that has a `description` becomes interactive: clicking it opens an accordion panel inside its section showing the description.

## Context

The page fetches `content/pages/halloween.md` and renders a set of "chips" grouped into sections. Some chips carry a `description` (currently only visible as a `title` tooltip). The page is a Nuxt server component (`.server.vue`), so interactive state must live in a hydrated client component.

Frontmatter of `content/pages/halloween.md`:

```yaml
sections:
  - heading: Videogiochi
    icon: 🎮
    items:
      - title: Pumpkin Jack
        description: platformer colorato e molto arcade-style, ...
```

## Decisions

- **Per-section accordion**: each section renders its own accordion panel below its chips. Clicking a chip with a description opens that section's panel showing that chip's description.
- **Toggle behavior**: clicking the chip whose description is already open closes the panel; clicking a different chip in the same section swaps the description shown.
- **Link wins**: a chip that has both `url` and `description` renders as a link (opens in new tab) and ignores `description`. Descriptions only apply to chips without a `url`.
- **No-JS safe**: server-rendered output still shows all chips; only the toggle behavior requires hydration.

## Approach A: per-section client component

New client component `HalloweenSection.vue` receives one section as a prop and renders the section heading, chips, and accordion panel with local reactive state. The server page delegates the section rendering to it.

## Components

### `app/components/HalloweenSection.vue` (new, client component)

- **Props**: `section: { heading?: string; icon?: string; items: Array<{ title: string; badge?: string; url?: string; description?: string; featured?: boolean }> }`
- **State**: `openItem: string | null` (holds the title of the chip whose description is shown).
- **Toggle logic**: clicking a description chip sets `openItem` to its title, or back to `null` if it's already open.
- **Chip rendering** per item:
  - `url` present → `<a>` link, unchanged (badge, external icon, `target="_blank"`, `rel="noopener noreferrer"`).
  - no `url` + `description` → `<button>` with `aria-expanded` and `aria-controls`, toggling the panel.
  - no `url` + no `description` → `<span>`.
- **Accordion panel**: rendered below the chips inside the section, shown when `openItem` is set. `role="region"` + `aria-labelledby` pointing to the triggering chip's `id`. Displays the open item's description. Wrapped in a Vue `<Transition>` for a lightweight fade/slide-in.
- The redundant `:title` tooltip attribute is removed from chips (description is now visible content).
- Styling in sibling `HalloweenSection.css` following the existing pattern (`.vue` files import their own `.css`).

### `app/pages/events/halloween.server.vue` (modified)

- Replaces the inline `v-for` section markup with `<HalloweenSection v-for="s in data?.sections" :key="s.heading" :section="s" />`.
- Keeps `Badge.css` import and page-level styles; chip styles move out.

### `app/pages/events/halloween-page.css` (modified)

- Chip, chips-list, and chip-hover styles move to `HalloweenSection.css`.
- Keeps page-level styles (`iframe` rule, section spacing/heading) that the new component's styles compose with, or moves them to the component as appropriate; final split keeps the page CSS minimal and non-conflicting.

### `app/components/__tests__/HalloweenSection.test.ts` (new)

Vitest + `@vue/test-utils` tests following existing component-test conventions:

- chips with `url` render as `<a>` links with href/target/rel.
- chips with `description` and no `url` render as `<button>`.
- clicking a description chip opens the panel showing its description.
- clicking the same chip again closes the panel.
- clicking a different description chip in the same section swaps the description.
- chips with neither `url` nor `description` render as `<span>`.
- a chip with both `url` and `description` renders as a link (link wins).
- sections without description chips never show a panel.

## Accessibility

- Interactive chips are native `<button>` elements (keyboard focusable by default).
- `aria-expanded` on the button reflects panel state.
- `aria-controls` on the button and `role="region"` + `aria-labelledby` on the panel wire the relationship.
- `prefers-reduced-motion` keeps existing hover transitions; accordion transition is subtle and motion-safe.

## Out of scope

- No global/search/filter behavior.
- No animation library; the transition is plain CSS + Vue `<Transition>`.
- No changes to the Xmas page or other content.
