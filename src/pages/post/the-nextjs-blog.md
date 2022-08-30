---
layout: ../../layouts/BlogPost.astro
title: The Next(.js) blog
date: '2021-07-02'
tags: ['blog', 'tecnicismi']
draft: false
summary: 'Devo ammettere che questo blog ormai ha visto più rifacimenti che articoli 🤣.'
images:
  [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Nextjs-logo.svg/1200px-Nextjs-logo.svg.png',
  ]
---

![il logo di Next.js](https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Nextjs-logo.svg/1200px-Nextjs-logo.svg.png)

Devo ammettere che questo blog ormai ha visto più rifacimenti che articoli 🤣.

## Che è successo?

Quindi sì, l'ho (_ri_)fatto di nuovo, ho cambiato il sistema sotto al cofano che gestisce il sito... anche se questa volta va detto che non ho fatto cambiamenti radicali come in passato (_tipo da WordPress a Ghost_) ho mantenuto il paradigma del sito statico generato sulla base di file Markdown, ho mantenuto Github come hosting (_Pages_) e come tool di automazioni (_Actions_) ma ho cambiato il framework di generazione del sito passando da VuePress a [Next.js](https://nextjs.org/).

## E niente altro?

Beh come si può vedere ho cambiato layout proseguendo la mia strada verso il minimalismo assoluto 🤓.

Con l'età che avanza apprezzo sempre di più le cose semplici ed immediate quindi volevo che il mio blog fosse il primo esempio di questo tipo. Che poi è anche qualcosa che paga sotto alcune metriche, come per esempio:

<iframe width="100%" height="260" src="/lighthouse/20210702.html" frameBorder="0" allowFullScreen></iframe> <small><i>Il report di Lighthouse della home page di questo sito del 02/07/2021</i></small>

E, piccola nota, ho **rimosso lo script di Google Analytics**, quindi io non avrò alcun dato su visualizzazioni e dintorni (_ecchissene_) e voi un posto in meno nel web dove verrete tracciati 😉.

## Motivazione

Non ero contentissimo del tema VuePress che stavo usando prima, più che altro per una questione di performance poi come già scritto sopra volevo un layout più minimalista e tipografico e nel "parco temi" di VuePress non ho trovato nulla che mi convincesse.

Ho iniziato a guardare subito verso Next.js e non ci ho messo molto a trovare [questo starter](https://github.com/timlrx/tailwind-nextjs-starter-blog) su cui mi sono basato, che bene o male includeva un pò tutto quello che mi interessava. Non nascondo che speravo di dover fare meno customizzazioni a livello di codice, ma alla fine ne è valsa la pena.

## Quanto durerà questa versione?

Conto di non fare altri grandi stravolgimenti nel medio termine (_e anche questo di per se non è stato un vero stravolgimento dalla versione precedente_) ma dipende quando uscirà qualche nuovo giocattolino che attirerà la mia attenzione...
