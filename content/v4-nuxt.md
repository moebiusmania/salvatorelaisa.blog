---
title: E il quattro vien da se
date: "2022-10-25"
tags: ["tecnicismi", "blog"]
draft: false
summary: 'Ed eccoci a un altra puntata di "io che riscrivo da zero questo blog per sperimentare nuove soluzioni" 🤓. Anche questa volta ho solo cambiato il framework di generazione delle pagine ma sono rimasto ai file Markdown per i contenuti e la soluzione descritta in precedenza.'
images: ["https://nuxt.com/assets/design-kit/logo/full-logo-green-dark.svg"]
---

<img src="https://nuxt.com/assets/design-kit/logo/full-logo-green-dark.svg" width="100%" alt="Il logo del framework Nuxt 3" /> <small>_Il logo del framework Nuxt 3_</small>

Ed eccoci a un'altra puntata di _"io che riscrivo da zero questo blog per sperimentare nuove soluzioni"_ 🤓. Anche questa volta ho **solo** cambiato il framework di generazione delle pagine ma sono rimasto ai file Markdown per i contenuti e la [soluzione descritta in precedenza](/post/the-nextjs-blog).

Sono passato da `Next.js` a [Nuxt](https://nuxt.com/) (_versione 3_), il nome suona simile di proposito dato che è un framework per web apps molto simile a Next.js ma basato su `Vue` anziche `React`. E' una specie di ritorno alla `v2`che era scritta con il più acerbo `VuePress`, ma dato che la semplicità e immediatezza di Vue mi ha sempre fatto gola, non ho resitito alla tentazione di poter utilizzare un framework potente ma semplice per questo blog!

Ma per riassumere, cosa ci ho guadagnato in questa migrazione?

## Meno dipendenze da gestire

Il file `package.json` contava ben **42** dipendenze (_42... coincidenze?_) che purtroppo non erano facili da tenere aggiornate dato che a volte si pestavano i piedi tra di loro. Ora ne ho solo **8**. Questo si traduce anche in **build più veloci** (_una build della v3 constro una della v4_) e di conseguenza minor minutaggio consumato nel tier gratuito di Github Actions.

## Developer Experience

Oltre a quanto detto sopra ora posso finalmente usare **Typescript** nei sorgenti, nella versione precedente il tentativo di portare il template su TS non era proprio andato a buon fine. Lavorare con i file `.vue` rispeto al `JSX` non mi sta affatto dispiacendo. Sto usando ancora [Tailwind](https://tailwindcss.com/) ma con meno customizzazioni dirette e con l'aggiunta di [DaisyUI](https://daisyui.com) come libreria per le poche component UI che uso, ma sopratutto per [i temi](https://daisyui.com/themes), così ogni tanto potrò giocare a cambiare il _look&feel_ del blog.

Essendomi scritto quasi tutti i file da zero ho maggiore conoscenza della codebase e mi viene più facile fare modifiche.

## User Experience

Tutti i tecnicismi appena citati portano ad un punto principale per gli utenti finali: **performance ancora migliori**.

Nuxt punta a generare file finali con meno codice Javascript rispetto a Next.js e questo ha impatti positivi sulla metrica del _Time-To-Interactive_. Sto utilizzando solo **font di sistema** quindi ci sono anche meno risorse esterne da caricare, il che rende le pagine più veloci nel dowload e non c'è il "salto" di render del cambio di font.

Il layout è rimasto grossomodo molto simile, qualche aggiustatina alla configurazione di header e footer, il menu su schermi piccoli ora è sempre visibile. Il cambiamento più grande è nel formato degli articoli su desktop: **ho completamente rimosso quella specie di sidebar che c'era prima** lasciando il 100% dello spazio del contenitore per... i contenuti! (_chi l'avrebbe mai detto..._)

## Privacy e tracking

Rimango convinto della mia opinione di circa 2 anni fa di **non utilizzare alcuna forma di tracking o profilazione degli utenti su questo sito**. Alla fine è un blog personale dove elaboro alcuni dei miei pensieri, non ho nessun piano editoriale in mente e tantomeno progetti di monetizzazione. Quindi che ci sia 1, 10 o 100 visitatori mi importa davvero poco.

Questo mi permette di non dover aggiungere ulteriore codice Javascript a carico dei visitatori e di liberarmi dei vari banner legati all'orripilante questione di
"cookie policy".
