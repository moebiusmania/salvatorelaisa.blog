<script setup lang="ts">
export interface Props {
  href: string
  className: string
  pathname: string
}

const { href, className, pathname } = defineProps<Props>()
const isActive: boolean = href === pathname
</script>

<template>
  <NuxtLink :href="href" :class="[className, { underline: isActive }]">
    <slot />
  </NuxtLink>
</template>
