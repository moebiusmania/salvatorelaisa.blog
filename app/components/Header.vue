<script setup lang="ts">
import { SITE_TITLE, SEASON_EMOJI, EVENTS } from "@/utils/config";

export interface NavItem {
	name: string;
	href: string;
	title: string;
	external?: boolean;
}

defineEmits(["changeTheme"]);

const items: Array<NavItem> = [
	{
		name: "Cerca",
		href: "/post/page/1",
		title: "Tutti gli articoli del blog",
	},
	{
		name: "About",
		href: "/about",
		title: "Qualche riga su di me",
	},
	{
		name: "Tags",
		href: "/tags",
		title: "Articoli per tag",
	},
	{
		name: "Adesso",
		href: "/now",
		title: "Cosa sto facendo in questo periodo",
	},
];

// const nav: Array<NavItem> = [EVENTS.earthDay, ...items];
const nav: Array<NavItem> = [...items];

const { dark } = defineProps<{ dark: boolean }>();
const route = useRoute();

const isActive = (href: string, route: any) => [
	"navitem",
	{ "router-link-active": href === route.path },
];
</script>

<template>
  <header class="header">
    <div>
      <NuxtLink href="/">
        <img src="/static/images/avatar.webp" alt="Il mio avatar in pixel art" />
        <span>{{ SITE_TITLE }}</span>
        <span>{{ SEASON_EMOJI }}</span>
      </NuxtLink>
      <nav>
        <NuxtLink v-for="(item, index) in nav" :title="item.title" :key="index" :class="isActive(item.href, route)"
          :href="item.href" :target="item.external ? '_blank' : '_self'">{{
            item.name }}</NuxtLink>
        <a class="navitem" aria-label="theme switcher" href="#" id="theme" @click="$emit('changeTheme')">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor">
            <path v-if="dark" class="sun" fill-rule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clip-rule="evenodd"></path>
            <path v-else class="moon" d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
          </svg>
        </a>
      </nav>
    </div>
  </header>
</template>

<style>
@import './Header.css';
</style>
