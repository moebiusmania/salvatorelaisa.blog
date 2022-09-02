---
layout: ../../layouts/BlogPost.astro
title: E il quattro vien da se
date: '2022-09-03'
tags: ['tecnicismi', 'blog']
draft: false
summary: ""
images: [""]
---

Ma per riassumere, cosa ci ho guadagnato in questa migrazione?

## Meno dipendenze da gestire
Il file `package.json` contava ben **42** dipendenze (_42... coincidenze?_) che purtroppo non erano facili da tenere aggiornate dato che a volte si pestavano i piedi tra di loro. Ora ne ho solo **8**. Questo si traduce anche in **build più veloci** (_una build della v3 constro una della v4_) e di conseguenza minor minutaggio consumato nel tier gratuito di Github Actions.

## Developer Experience
Oltre a quanto detto sopra ora posso finalmente usare **Typescript** nei sorgenti, nella versione precedente il tentativo di portare il template su TS non era proprio andato a buon fine. Lavorare con i file `.astro` rispeto al `JSX` non mi sta dispiacendo, anche se conto di migrare i componenti a Vue più avanti (_sì, Astro è cross-framework_). Sto usando ancora [Tailwind]() ma con meno customizzazioni e con l'aggiunta di [DaisyUI]() come libreria per le poche component UI che uso, ma sopratutto per [i temi](), così ogni tanto potrò giocare a cambiare il _look&feel_ del blog.

Essendomi scritto quasi tutti i file da zero ho maggior conoscenza della codebase e mi viene più facile fare modifiche.

## User Experience
Tutti i tecnicismi appena citati portano ad un punto principale per gli utenti finali: **performance ancora migliori**.

Astro punta a generare file finali con molto meno codice Javascript rispetto a Next.js e questo ha impatti positivi sulla metrica del _Time-To-Interactive_. Sto utilizzando solo **font di sistema** quindi ci sono anche meno risorse esterne da caricare, il che rende le pagine più veloci nel dowload e non c'è il "salto" di render del cambio di font.

Il layout è rimasto grossomodo molto simile, qualche aggiustatina alla configurazione di header e footer, il menu su schermi piccoli ora è sempre visibile. Il cambiamento più grande è nella formattazione degli articoli su desktop: **ho completamente rimosso quella specie di sidebar che c'era prima** lasciando il 100% dello spazio del contenitore per... i contenuti! (_chi l'avrebbe mai detto_)