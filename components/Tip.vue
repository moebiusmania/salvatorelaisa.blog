<template>
  <section class="tip-section" role="complementary" aria-labelledby="tip-heading" aria-describedby="tip-description">
    <h2 id="tip-heading" class="sr-only">Support this blog</h2>
    <p id="tip-description" class="tip-text">
      Se ti piace questo blog e ti va di supportarmi, o anche solo se se ti sto
      un pò simpatico, puoi offrirmi un caffé! E' un piccolo gesto ma che
      apprezzerei molto <span aria-label="sorriso" role="img">🙂</span>.
    </p>
    <div class="tip-action" role="group" aria-label="Support options">
      <Coffee />
    </div>
  </section>
</template>

<style scoped>
.tip-section {
  border-top-width: 0 !important;
  margin: 0 auto;
}

.tip-text {
  margin-bottom: var(--sp-2);
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-style: italic;

  & span {
    font-style: normal;
  }
}

.tip-action {
  margin: 0 auto;

  @media (min-width: 768px) {
    width: max-content;
  }
}

/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>