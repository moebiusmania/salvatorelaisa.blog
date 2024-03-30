<script lang="ts" setup>

const state = reactive({
  length: 12,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
});

const generated = ref<string>(generatePassword(state));

const onSubmit = (e: Event) => {
  e.preventDefault();
  generated.value = generatePassword(state);
};
</script>

<template>
  <section>
    <h1>Free Password<br> Generator</h1>

    <form @submit="onSubmit">
      <div class="fields">
        <fieldset>
          <label for="length">Length</label>
          <input type="number" id="length" name="length" :min="8" :max="64" v-model="state.length" />
        </fieldset>

        <fieldset>
          <input type="checkbox" id="uppercase" name="uppercase" v-model="state.uppercase" />
          <label for="uppercase">Include Uppercase</label>
        </fieldset>

        <fieldset>
          <input type="checkbox" id="lowercase" name="lowercase" v-model="state.lowercase" />
          <label for="lowercase">Include Lowercase</label>
        </fieldset>

        <fieldset>
          <input type="checkbox" id="numbers" name="numbers" v-model="state.numbers" />
          <label for="numbers">Include Numbers</label>
        </fieldset>

        <fieldset>
          <input type="checkbox" id="symbols" name="symbols" v-model="state.symbols" />
          <label for="symbols">Include Symbols</label>
        </fieldset>
      </div>

      <button type="submit">Generate Password</button>
    </form>


    <p class="result">Generated Password: <code>{{ generated }}</code></p>
  </section>
</template>

<style scoped>
h1 {
  text-transform: capitalize;
}

section {
  text-align: center;

  & form {
    margin-top: var(--sp-3);

    & .fields {
      display: flex;
      flex-direction: column;
      gap: var(--sp-2);
      width: 50%;
      margin: 0 auto;

      & fieldset {
        display: flex;
        gap: var(--sp-1);
        align-items: center;
      }

      @media (min-width: 768px) {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        width: 100%;
      }
    }
  }

  & label {
    font-weight: bold;
  }

  & input[type="number"] {
    width: 50%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    transition-duration: 0.4s;

    &:focus {
      outline: var(--primary);
      border-color: var(--primary);
      box-shadow: 0 0 0 0.1rem var(--primary);
    }
  }

  & button {
    background-color: var(--primary);
    /* Green */
    border: none;
    color: var(--white);
    padding: var(--sp-2) var(--sp-4);
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: var(--sp-3);
    cursor: pointer;
    transition-duration: 0.4s;

    &:hover {
      background-color: var(--primary);
    }
  }

  .result {
    font-size: 1.5em;
    margin-top: var(--sp-3);

    & code {
      background-color: #ededed;
      display: inline-block;
      padding: var(--sp-1) var(--sp-2);
      border-radius: var(--sp-05);
    }
  }
}
</style>