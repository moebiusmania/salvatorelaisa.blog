<template>
  <section>
    <p>
      Se ti piace questo blog e ti va di supportarmi, o anche solo se se ti sto
      un pò simpatico, puoi offrirmi un caffé! E' un piccolo gesto ma che
      apprezzerei molto <span>🙂</span>.
    </p>
    <div>
      <Coffee />
    </div>
  </section>
</template>

<style scoped>
section {
  border-top-width: 0 !important;
  margin: 0 auto;

  & p {
    margin-bottom: var(--sp-2);
    font-size: 0.875rem;
    line-height: 1.25rem;
    font-style: italic;

    & span {
      font-style: normal;
    }
  }

  & div {
    margin: 0 auto;

    @media (min-width: 768px) {
      width: max-content;
    }
  }
}
</style>