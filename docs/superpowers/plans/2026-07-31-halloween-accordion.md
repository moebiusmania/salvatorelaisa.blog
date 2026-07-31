# Halloween Page Chips Accordion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Halloween page description chips into toggleable accordions, one per section.

**Architecture:** A new hydrated client component `HalloweenSection.vue` receives one section object as a prop, renders its chips, and manages a single open-accordion state for that section. The server page (`halloween.server.vue`) delegates section rendering to it. Content schema is updated to expose `description` on items.

**Tech Stack:** Nuxt 4, Vue 3 (`ref`/`computed`/`Transition`), Vitest + `@vue/test-utils`, CSS with sibling `*.css` files.

## Global Constraints

- Test files named `**/*.test.ts`, located in `app/components/__tests__/`.
- Components import their own sibling CSS via `<style>@import './Name.css';</style>`.
- No CSS preprocessor; no new npm dependencies.
- Vue `<script setup lang="ts">`; props destructured via `const { x } = defineProps<Props>()`.
- Use `export interface Props` for component props (existing convention).
- Keep code free of explanatory comments (match repo style).
- Indentation: tabs in TS/CSS, 2 spaces in Vue templates (match existing files).
- Follow existing accessibility pattern: real `<button>` elements, `aria-expanded`/`aria-controls`/`role="region"`.

---

### Task 1: Rename `note` to `description` in the content schema

The yaml fields in `content/pages/halloween.md` were already renamed from `note` to `description`, but `content.config.ts` still validates `note` — so the `description` values would be dropped/stripped from the parsed document and never reach the component.

**Files:**
- Modify: `content.config.ts:34`

**Interfaces:**
- Produces: item schema field `description: z.string().optional()` (replaces `note`). Later tasks rely on `description` being present in parsed section items.

- [ ] **Step 1: Edit `content.config.ts`**

In the `items` object schema (line 34), replace:

```ts
note: z.string().optional(),
```

with:

```ts
description: z.string().optional(),
```

- [ ] **Step 2: Verify schema parses**

Run: `npm run build`
Expected: build succeeds (compiles and type-checks `content.config.ts`; validates nothing else changed).

- [ ] **Step 3: Commit**

```bash
git add content.config.ts
git commit -m "feat(content): rename note to description in schema"
```

---

### Task 2: Create `HalloweenSection` client component (TDD)

A hydrated component that renders one section (heading, chips, accordion panel) with local accordion state. Chips: `url` → `<a>` link; no `url` + `description` → `<button>` toggling the panel; otherwise `<span>`.

**Files:**
- Create: `app/components/__tests__/HalloweenSection.test.ts`
- Create: `app/components/HalloweenSection.vue`
- Create: `app/components/HalloweenSection.css`

**Interfaces:**
- Consumes: section items with shape `{ title: string; badge?: string; url?: string; description?: string; featured?: boolean }` (from Task 1 schema).
- Produces: `<HalloweenSection :section="section" />` component, auto-imported by Nuxt from `app/components/HalloweenSection.vue`.

- [ ] **Step 1: Write the failing test**

Create `app/components/__tests__/HalloweenSection.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import HalloweenSection from "../HalloweenSection.vue";

interface HalloweenItem {
	title: string;
	badge?: string;
	url?: string;
	description?: string;
	featured?: boolean;
}

interface Section {
	heading?: string;
	icon?: string;
	items: HalloweenItem[];
}

const baseSection: Section = {
	heading: "Videogiochi",
	icon: "🎮",
	items: [
		{ title: "Pumpkin Jack", description: "platformer arcade-style" },
		{ title: "Dusk" },
		{ title: "LoFi", url: "https://example.com" },
		{ title: "Diablo", description: "atmosfere gotiche" },
	],
};

const mountSection = (section: Section = baseSection) =>
	mount(HalloweenSection, {
		props: { section },
		global: {
			stubs: { IconsExternal: true },
		},
	});

describe("HalloweenSection", () => {
	it("renders the section heading and icon", () => {
		const wrapper = mountSection();
		expect(wrapper.find("h2").text()).toContain("Videogiochi");
		expect(wrapper.find("h2").text()).toContain("🎮");
	});

	it("renders one chip per item", () => {
		const wrapper = mountSection();
		expect(wrapper.findAll("li").length).toBe(4);
	});

	it("renders chips with a url as links", () => {
		const wrapper = mountSection();
		const link = wrapper.find("a.halloween-chip");
		expect(link.exists()).toBe(true);
		expect(link.attributes("href")).toBe("https://example.com");
		expect(link.attributes("target")).toBe("_blank");
		expect(link.attributes("rel")).toBe("noopener noreferrer");
	});

	it("renders chips with a description as buttons", () => {
		const wrapper = mountSection();
		expect(wrapper.findAll("button.halloween-chip").length).toBe(2);
	});

	it("renders chips with neither url nor description as spans", () => {
		const wrapper = mountSection();
		const spans = wrapper.findAll("li > span.halloween-chip");
		expect(spans.length).toBe(1);
		expect(spans[0].text()).toBe("Dusk");
	});

	it("does not show the accordion panel by default", () => {
		const wrapper = mountSection();
		expect(wrapper.find(".halloween-accordion").exists()).toBe(false);
	});

	it("opens the accordion showing the description when a description chip is clicked", async () => {
		const wrapper = mountSection();
		const buttons = wrapper.findAll("button.halloween-chip");
		await buttons[0].trigger("click");
		const panel = wrapper.find(".halloween-accordion");
		expect(panel.exists()).toBe(true);
		expect(panel.text()).toBe("platformer arcade-style");
		expect(buttons[0].attributes("aria-expanded")).toBe("true");
	});

	it("closes the accordion when the same chip is clicked again", async () => {
		const wrapper = mountSection();
		const buttons = wrapper.findAll("button.halloween-chip");
		await buttons[0].trigger("click");
		await buttons[0].trigger("click");
		expect(wrapper.find(".halloween-accordion").exists()).toBe(false);
		expect(buttons[0].attributes("aria-expanded")).toBe("false");
	});

	it("swaps the description when a different chip in the same section is clicked", async () => {
		const wrapper = mountSection();
		const buttons = wrapper.findAll("button.halloween-chip");
		await buttons[0].trigger("click");
		await buttons[1].trigger("click");
		const panel = wrapper.find(".halloween-accordion");
		expect(panel.text()).toBe("atmosfere gotiche");
		expect(buttons[0].attributes("aria-expanded")).toBe("false");
		expect(buttons[1].attributes("aria-expanded")).toBe("true");
	});

	it("renders a chip with both url and description as a link (link wins)", () => {
		const wrapper = mountSection({
			heading: "Mix",
			items: [
				{ title: "Both", url: "https://example.com", description: "ignored" },
			],
		});
		expect(wrapper.find("a.halloween-chip").exists()).toBe(true);
		expect(wrapper.findAll("button.halloween-chip").length).toBe(0);
	});

	it("shows no panel for sections without description chips", async () => {
		const wrapper = mountSection({
			heading: "Solo link",
			items: [
				{ title: "A", url: "https://a.example.com" },
				{ title: "B" },
			],
		});
		expect(wrapper.findAll("button.halloween-chip").length).toBe(0);
		await wrapper.find("span.halloween-chip").trigger("click");
		expect(wrapper.find(".halloween-accordion").exists()).toBe(false);
	});
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run app/components/__tests__/HalloweenSection.test.ts`
Expected: FAIL — import error, `../HalloweenSection.vue` does not exist.

- [ ] **Step 3: Create the component**

Create `app/components/HalloweenSection.vue`:

```vue
<script setup lang="ts">
import { computed, ref } from "vue";

interface HalloweenItem {
	title: string;
	badge?: string;
	url?: string;
	description?: string;
	featured?: boolean;
}

export interface Props {
	section: {
		heading?: string;
		icon?: string;
		items?: HalloweenItem[];
	};
}

const { section } = defineProps<Props>();

const openItem = ref<string | null>(null);

const open = computed(
	() => section?.items?.find((item) => item.title === openItem.value) || null,
);

const toggle = (title: string) => {
	openItem.value = openItem.value === title ? null : title;
};

const slugify = (value: string) =>
	value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");

const sectionSlug = computed(() => slugify(section?.heading ?? ""));

const chipId = (title: string) => `chip-${sectionSlug.value}-${slugify(title)}`;
const panelId = (title: string) =>
	`panel-${sectionSlug.value}-${slugify(title)}`;
</script>

<template>
  <section class="halloween-section">
    <h2 v-if="section?.heading">
      <span v-if="section?.icon" aria-hidden="true">{{ section?.icon }}</span>
      {{ section?.heading }}
    </h2>
    <ul class="halloween-chips">
      <li v-for="item in section?.items" :key="item.title">
        <a
          v-if="item.url"
          class="halloween-chip"
          :class="{ featured: item.featured }"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="chip-title">{{ item.title }}</span>
          <span v-if="item.badge" class="sl-badge">{{ item.badge }}</span>
          <IconsExternal />
        </a>
        <button
          v-else-if="item.description"
          :id="chipId(item.title)"
          type="button"
          class="halloween-chip"
          :class="{ featured: item.featured, open: open?.title === item.title }"
          :aria-expanded="open?.title === item.title"
          :aria-controls="panelId(item.title)"
          @click="toggle(item.title)"
        >
          <span class="chip-title">{{ item.title }}</span>
          <span v-if="item.badge" class="sl-badge">{{ item.badge }}</span>
        </button>
        <span v-else class="halloween-chip" :class="{ featured: item.featured }">
          <span class="chip-title">{{ item.title }}</span>
          <span v-if="item.badge" class="sl-badge">{{ item.badge }}</span>
        </span>
      </li>
    </ul>
    <Transition name="halloween-accordion">
      <p
        v-if="open"
        :id="panelId(open.title)"
        :key="open.title"
        class="halloween-accordion"
        role="region"
        :aria-labelledby="chipId(open.title)"
      >
        {{ open.description }}
      </p>
    </Transition>
  </section>
</template>

<style>
@import './HalloweenSection.css';
</style>
```

- [ ] **Step 4: Create the component CSS**

Create `app/components/HalloweenSection.css`:

```css
.halloween-section {
	margin-top: var(--sp-5);
}

.halloween-section > h2 {
	display: flex;
	align-items: center;
	gap: var(--sp-2);
	margin-bottom: var(--sp-3);
	color: var(--text-base-content);
}

.halloween-section > h2 > span {
	line-height: 1;
}

.halloween-chips {
	display: flex;
	flex-wrap: wrap;
	gap: var(--sp-2);
	margin: 0;
	padding: 0;
	list-style: none;
	border-top-width: 0;
}

.halloween-chips > li {
	margin: 0;
	padding: 0;
	font-size: inherit;
	list-style: none;
}

.halloween-chip {
	display: inline-flex;
	align-items: center;
	gap: var(--sp-2);
	padding: var(--sp-1) var(--sp-2);
	border: 1px solid var(--border);
	border-radius: var(--sp-05);
	background-color: var(--bg-neutral);
	color: var(--text-base-content);
	text-decoration: none;
	line-height: 1.3;
	transition:
		transform 200ms ease,
		border-color 200ms ease,
		box-shadow 200ms ease;
}

button.halloween-chip {
	font: inherit;
	text-align: left;
	cursor: pointer;
}

.halloween-chip:hover {
	transform: translateY(-2px);
	border-color: var(--primary);
	box-shadow: 0 8px 20px -8px rgba(0, 0, 0, 0.25);
}

.halloween-chip:focus-visible {
	outline: 2px solid var(--primary);
	outline-offset: 2px;
}

.halloween-chip.featured,
.halloween-chip.open {
	border-color: var(--primary);
	box-shadow: inset 0 0 0 1px var(--primary);
}

.halloween-chip .chip-title {
	font-weight: 500;
}

.halloween-chip svg {
	display: inline-block;
	width: 0.9rem;
	height: 0.9rem;
	color: var(--text-secodary-content);
}

.halloween-accordion {
	margin: var(--sp-2) 0 0;
	padding: var(--sp-2);
	border-left: 3px solid var(--primary);
	border-radius: 0 var(--sp-05) var(--sp-05) 0;
	background-color: var(--bg-neutral);
	color: var(--text-base-content);
}

.halloween-accordion-enter-active,
.halloween-accordion-leave-active {
	transition:
		opacity 200ms ease,
		transform 200ms ease;
}

.halloween-accordion-enter-from,
.halloween-accordion-leave-to {
	opacity: 0;
	transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
	.halloween-chip,
	.halloween-chip:hover {
		transform: none;
		transition: none;
	}

	.halloween-accordion-enter-active,
	.halloween-accordion-leave-active {
		transition: none;
	}
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run app/components/__tests__/HalloweenSection.test.ts`
Expected: PASS (all 12 tests).

- [ ] **Step 6: Commit**

```bash
git add app/components/HalloweenSection.vue app/components/HalloweenSection.css app/components/__tests__/HalloweenSection.test.ts
git commit -m "feat: add HalloweenSection accordion component"
```

---

### Task 3: Wire the server page to `HalloweenSection`

The server page renders sections through the new client component and slims down `halloween-page.css` (section/chip styles now live in the component).

**Files:**
- Modify: `app/pages/events/halloween.server.vue`
- Modify: `app/pages/events/halloween-page.css`

**Interfaces:**
- Consumes: `<HalloweenSection :section="section" />` from Task 2.

- [ ] **Step 1: Update the server page**

In `app/pages/events/halloween.server.vue`, replace the inline section markup (from the `<section v-for=...>` through its closing `</section>` — lines 12–38) with:

```vue
    <HalloweenSection
      v-for="s in data?.sections"
      :key="s.heading"
      :section="s"
    />
```

Keep everything else unchanged (script block, `<h1>`, `<ContentRenderer>`, `<hr />`, `<Tip />`, both style imports).

- [ ] **Step 2: Slim down `halloween-page.css`**

Replace the entire contents of `app/pages/events/halloween-page.css` with:

```css
.halloween-page iframe {
	width: 100%;
	height: 450px;
	border: 1px solid var(--border);
}
```

(All section/chip styles moved to `app/components/HalloweenSection.css` in Task 2.)

- [ ] **Step 3: Verify build and tests**

Run: `npm run test:ci`
Expected: PASS (full suite, no regressions).

Run: `npm run build`
Expected: build succeeds with no type errors (verifies `data?.sections` type-checks against the component props).

- [ ] **Step 4: Commit**

```bash
git add app/pages/events/halloween.server.vue app/pages/events/halloween-page.css
git commit -m "feat: use HalloweenSection accordion on halloween page"
```

---

### Task 4: Final verification gate

Confirm the whole pipeline — tests, static build, and the actual static site generation that renders the halloween page (island + hydrated client component).

**Files:** none (verification only).

- [ ] **Step 1: Run full test suite**

Run: `npm run test:ci`
Expected: PASS.

- [ ] **Step 2: Generate the static site**

Run: `npm run generate`
Expected: succeeds and includes `/events/halloween/index.html`. Note: `pregenerate` downloads fonts via `npm run fonts:download` (needs network); if that fails offline, fall back to `npm run build` for compile verification and check the page manually with `npm run dev`.

- [ ] **Step 3: Manual smoke test**

Run: `npm run dev`, open `/events/halloween`, and verify:
- chips render as before (links still open in new tab, badges show);
- clicking a Videogiochi chip with a description opens the section's panel;
- clicking the same chip again closes it;
- clicking a different chip in the same section swaps the description;
- keyboard: Tab to a chip button, Enter/Space toggles it;
- `prefers-reduced-motion` disables the accordion transition.
