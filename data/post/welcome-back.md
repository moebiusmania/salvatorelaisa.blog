---
title: Welcome back (again)
date: '2018-12-30'
tags: ['blog', 'tecnicismi', 'nuovo anno']
draft: false
images:
  [
    'https://images.unsplash.com/photo-1546074177-31bfa593f731?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1200&q=80',
  ]
summary: "Ebbene si. Terzo 'remake' di questo blog... e non accade neanche a caso, ma alla vigilia di inizio anno 2019 e della chiusura del mio account su Facebook (ma di questo ne parleremo un'altra volta...)."
---

[![Photo by Sincerely Media su Unsplash](https://images.unsplash.com/photo-1546074177-31bfa593f731?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2767&q=80)](https://unsplash.com/@sincerelymedia) <small>_Foto di Sincerely Media su Unsplash_</small>

Ebbene si.

Terzo "remake" di questo blog... e non accade neanche a caso, ma alla vigilia di inizio anno 2019 e della chiusura del mio account su Facebook (_ma di questo ne parleremo un'altra volta..._).

D'altronde per noi smanettoni il blog/sito personale è il giocattolo su cui possiamo fare tutte le sperimentazioni che vogliamo sapendo che alla peggio faremo solo un danno a noi stessi 🤣.

E ora una breve lista delle novità:

## Il dominio

sono passato a un più esplicito **.blog**, tanto alla fine lo uso solo per questo... e come provider sono passato da GoDaddy all'italiana [Netsons](https://www.netsons.com/). Non dovendo fare nulla di particolare con il dominio ho trovato GoDaddy alquanto confusionario e furbetto sulla parte dei prezzi.

## Gestione e hosting del sito

Dopo WordPress e Ghost è giunta l'ora di passare a uno static site generator. Non ci ho messo troppo a optare per [VuePress](https://vuepress.vuejs.org/) dato che ultimamente l'ho molto apprezzato su altri progetti e perché ho trovato un [porting del tema Casper](https://github.com/alexander-heimbuch/vuepress-theme-casper), <del>motivo per cui esteticamente non è cambiato molto</del>.

- **WordPress**: paradossalmente è diventato bloated per dei "banali" blog ed è abbastanza difficile da incastrare in un sistema di versionamento, altro paletto che ho posto fondamentale per questo remake.

- **Ghost**: mi piaceva molto, ma i continui cambi nel sistema di installazione in ogni major release lo hanno reso problematico da aggiornare/mantenere.

Usando uno **static site generator posso** continuare a scrivere in Markdown ma hostare il sito su una GitHub page, like a boss 😎 con **costi molti più bassi e tempi di caricamento decisamente migliori**, per non parlare del fatto che con una pagina statica non esistono problemi di sicurezza.

Un altro piccolo vantaggio di questa soluzione è che i contenuti vivono insieme al codice nel repository Github, quindi versionamento e backup sono parte del sistema e in più sono unificati, al contrario dei classici CMS che richiedono un backup specifico del database.

## Editor

Un lato "negativo" degli static site generator è che si perde l'editor integrato in sistemi come WordPress e Ghost, ma come dicevo prima essendo basato su **Markdown** posso sia editare direttamente da GitHub che scrivere un file in locale (_e offline_) usando un qualunque editor compatibile. Per adesso userò il buon Visual Studio Code, che fa il suo sporco lavoro anche come editor per Markdown, più avanti magari ne sperimenterò di altri.

## I vecchi contenuti?

Con calma... torneranno 🤣.

Detto questo, non mi rimane che iniziare questo 2019 sul web senza Facebook e con una nuova versione del sito _"torniamo-a-quando-le-pagine-statiche-erano-belle"_!
