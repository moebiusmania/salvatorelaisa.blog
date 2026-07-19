<script lang="ts" setup>
const { data } = await useAsyncData(() =>
	queryCollection("content").path("/pages/halloween").first(),
);
</script>

<template>
  <article class="content halloween-page">
    <h1>{{ data?.title }}</h1>
    <ContentRenderer :value="data || {}" />

    <section
      v-for="s in data?.sections"
      :key="s.heading"
      class="halloween-section"
    >
      <h2>
        <span v-if="s.icon" aria-hidden="true">{{ s.icon }}</span>
        {{ s.heading }}
      </h2>
      <ul class="halloween-chips">
        <li v-for="item in s.items" :key="item.title">
          <component
            :is="item.url ? 'a' : 'span'"
            :href="item.url || undefined"
            :target="item.url ? '_blank' : undefined"
            :rel="item.url ? 'noopener noreferrer' : undefined"
            :title="item.note || undefined"
            class="halloween-chip"
            :class="{ featured: item.featured }"
          >
            <span class="chip-title">{{ item.title }}</span>
            <span v-if="item.badge" class="sl-badge">{{ item.badge }}</span>
            <IconsExternal v-if="item.url" />
          </component>
        </li>
      </ul>
    </section>

    <hr />
  </article>
  <Tip />
</template>

<style>
@import url('../../components/Badge.css');
</style>

<style>
@import './halloween-page.css';
</style>
