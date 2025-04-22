<template>
  <article class="content">
    <h1>Xmas 2024 🎁 </h1>
    <p>Per il periodo natalizio 2024 ho voluto cambiare il tema del blog con qualche piccolo accorgimento:</p>
    <ul>
      <li>sostituito i colori principali della tipografia con una <a
          href="https://coolors.co/palette/f2545b-a93f55-19323c-f3f7f0-8c5e58" target="_blank"
          rel="noopener noreferrer">palette
          natalizia</a> presa da <strong>Coolors.co</strong>, utilizzandola anche per il tema scuro.</li>
      <li>aggiunta qualche <strong>emoji</strong> natalizia (🎁, 🎄, ☃️), cosa molto comoda per avere facilmente delle
        icone senza dover importare
        direttamente immagini 🤓.</li>
      <li>aggiunto un <a href="https://codepen.io/codeconvey/pen/xRzQay" target="_blank"
          rel="noopener noreferrer">effetto di neve in puro CSS</a> preso da <strong>CodePen</strong> e incapsulato in
        un
        semplice
        <a href="https://github.com/moebiusmania/salvatorelaisa.blog/blob/main/components/content/Snow.server.vue"
          target="_blank" rel="noopener noreferrer">componente Vue</a>.
      </li>
    </ul>
    <p>Nulla di eccezionale, ma un po' di piccole cose possono fare la differenza...</p>
    <p>Per chi preferisce del buon vecchio HTML+CSS (<i>e la comodità di avere tutto in un solo file</i>) ho preparato
      un semplice "tema" basato su questi elementi e molto simile a quello che vedete qui, disponibile in uno <a
        href="https://gist.github.com/moebiusmania/f98477573e28f56e5e0fdf2b8e30f7f9" target="_blank"
        rel="noopener noreferrer">snippet</a>:
    </p>
    <iframe width="100%" height="350" src="data:text/html;charset=utf-8,
    <head><base target='_blank' /></head>
    <body style='margin: 0;'><script src='https://gist.github.com/moebiusmania/f98477573e28f56e5e0fdf2b8e30f7f9.js'></script>
      </body>">
    </iframe>
    <hr />
  </article>
  <Tip />
</template>

<style scoped>
iframe {
  width: 100%;
  height: 450px;
  border: 1px solid var(--border);
}
</style>