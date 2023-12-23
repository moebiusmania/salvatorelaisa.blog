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
    padding-left: 1.25rem;
    padding-right: 1.25rem;
    padding-top: 4rem;
    padding-bottom: 4rem;
    max-width: 64rem;
  }
}
</style>
