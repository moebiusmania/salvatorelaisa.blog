<template>
  <section>
    <div>
      <slot />
    </div>
  </section>
</template>

<style scoped>
section {
  overflow: hidden;
  color: #4B5563;

  &>div {
    margin: 0 auto;
    padding: var(--sp-8) var(--sp-3);
    max-width: 64rem;
  }
}
</style>
