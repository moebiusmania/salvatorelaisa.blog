<script setup lang="ts">
import HeaderLink from "./HeaderLink.vue";
import { SITE_TITLE } from "@/utils/config";

const emit = defineEmits<{
  (e: "theme"): void;
}>();

const { dark } = defineProps<{ dark: boolean }>();
const route = useRoute();

const onClick = (e: MouseEvent): void => {
  emit("theme");
};
</script>

<template>
  <header class="text-gray-600 body-font">
    <div class="max-w-5xl mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
      <NuxtLink class="flex title-font font-medium items-center text-base-content mb-4 md:mb-0" href="/">
        <img src="/static/images/avatar.png" :alt="SITE_TITLE" class="w-10 h-10 text-white rounded-full" />
        <span class="ml-3 text-xl">{{ SITE_TITLE }}</span>
      </NuxtLink>
      <nav class="md:ml-auto flex flex-wrap items-center text-base justify-center">
        <HeaderLink className="mr-5 hover:text-neutral-focus dark:hover:text-neutral-content" href="/post/page/1"
          :pathname="route.path">Cerca</HeaderLink>
        <HeaderLink className="mr-5 hover:text-neutral-focus dark:hover:text-neutral-content" href="/about"
          :pathname="route.path">About</HeaderLink>
        <HeaderLink className="mr-5 hover:text-neutral-focus dark:hover:text-neutral-content" href="/tags"
          :pathname="route.path">Tags</HeaderLink>
        <button aria-label="theme switcher" data-toggle-theme="dark,corporate"
          class="w-6 h-6 pt-0.5 cursor-pointer hover:text-neutral-focus dark:hover:text-neutral-content" id="theme"
          @click="onClick">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="currentColor">
            <path v-if="dark" class="sun" fill-rule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clip-rule="evenodd"></path>
            <path v-else class="moon" d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
          </svg>
        </button>
      </nav>
    </div>
  </header>
</template>
