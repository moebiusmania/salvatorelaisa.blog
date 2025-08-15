---
title: "PC building"
date: "2025-08-12"
tags:
  - "tecnicismi"
  - "desktop"
  - "gaming"
  - "ai"
draft: true
summary: ""
images: [""]
---

## Ragionamenti preliminari

Nel casino dei miei pensieri sono riuscito a chiarirmi un paio di idee:

- **non volevo un altro tower giganterrimo**, quindi ho iniziato a fare qualche ricerca per vedere se era possibile assemblare PC da gaming "compatti" e devo dire che alcuni risultati mi hanno sbalordito, anche se a me bastava che fosse più piccolo di un tower comune, e da qui la scoperta dei case "_mini ITX_".
- **non mi intessano le super prestazioni**, volevo qualcosa di fascia "mid"

Poi ovviamente i dubbi sul "_sì, ok... ma effettivamente come si assembla un PC da zero?_" 🙄.

Sapevo che le RAM e gli hard disk NVMe M.2 sono facili da montare, su tutto il resto buio totale, quindi ho aperto YouTube e ho iniziato a guardarmi vari video/tutorial su come assemblare PC in generale e qualcuno specifico sulle build con case compatti. Questo di [Paul's Hardware](https://www.youtube.com/@paulshardware) è stato uno dei più utili e che mi sento di consigliare vivamente:

<iframe class="w-full" height="450" loading="lazy" src="https://www.youtube.com/embed/AJtfMrwmtZU" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Cosa ho assemblato

| Componente    | Nome                                           |
| ------------- | ---------------------------------------------- |
| Scheda madre  | Aorus B5501 PROX AX                            |
| CPU           | AMD **Ryzen 5** 5600G                          |
| GPU           | Gigabyte Nvidia **RTX 5060**                   |
| HD (NVMe M.2) | Samsung SSD 990 Pro (con Heathsink) **1tb**    |
| RAM           | Corsair Vengeance LPX DDR4 **32gb**            |
| Case          | Cooler Master MasterBox NRP200P (**mini ITX**) |

Per quanto riguarda il raffreddamento:

- per la CPU sto usando la **ventola _Wraith_ inclusa nella confezione**, non conto di fare overclocking e spingere l'utilizzo in modo particolare, quindi in teoria basta. Ed è anche sileziosa
- nel case erano **incluse due ventole**, una l'ho montata sul pannello superiore, l'altra ancora devo decidere se montarla, nel caso penso su un pannello laterale
- non sto usando il **pannello di vetro incluso con il case**, quindi ogni lato escluso il pannello frontale permettere ricircolo di aria
- avendo scelto componenti di dimensioni ridotte in realtà è avanzato più spazio del previsto nel case NRP200P, quindi la dispersione di aria calda mi sembra buona, anche considerato il punto precedente

Invece per la GPU sarei anche "rimasto" sulla generazione Nvidia precedente (_RTX 40xx_) ma i prezzi delle schede comprate nuove erano praticamente identici a quelli della generazione attuale, quindi non essendo interessato a performance particolari e volendo rimanere su una scheda dalla dimensioni contenute, sono andato di 5060.

![Le scatole dei vari componenti del PC che ho ordinato disposte su un tavolino.](https://raw.githubusercontent.com/moebiusmania/blog-assets/refs/heads/master/images/2025/pc_componenti.webp)<small>I vari componenti del PC pronti per essere assemblati!</small>

## Mettere insieme i pezzi

## Tornare a Windows 11...

Sulle installazioni di Windows da zero, da ragazzo ne ho fatte diverse da _Windows 95_ in poi, l'ultima volta però credo sia stato _Vista_, e devo dire che il processo è rimasto grossomodo invariato.

L'unica nota dolente di 11 è uno step che ti obbliga ad attivare la connessione internet per proseguire. Certo, se hai il router e un cavo di rete a portata di mano o un ricevitore wifi riconosciuto in automatico ci sta, in tutti gli altri casi è una richiesta un po rognosa... ma una breve ricerca permette di trovare un _workaround_ per saltare la schermata e fare un'installazione completamente offline.

A installazione finita e un primo giro di aggiornamenti, era già tutto mediamente funzionante. La tediosa fase del dover installare svariati driver è ormai (_fortunatamente_) un lontano ricordo. Gli unici che ho installato a manina sono stati quelli di Nvidia e AMD (_che in realtà vengono gestiti automagicamente da dei loro software proprietari_) e della scheda wifi.

## I miei takeaway principali di questa esperienza

- non so se vale anche per altri case (_spero di si_) ma il NRP200P è facilissimo da aprire e richiudere e offre più di una opzione per distribuire i componenti all'interno
- il "test a banco" tra le varie cose ti permette anche di capire come passeranno i cavi ed evitare possibili intrecci
- la scatola della scheda madre è un ottimo supporto su cui fare il "test a banco"
- recuperare una MicroSD inutilizzata da anni per usarla come drive di boot per Windows potrebbe non essere la scelta migliore, magari nel mentre si è danneggiata...
- si può creare un drive di boot Windows anche da MacOS, ma bisogna smanettare un pò da terminale
- il trapano è sempre il migliore amico di una vite spanata 😈
- in generale: avevo non poca ansia e dubbi sul come collegare i vari cavetti interni, sopratutto quelli dell'alimentazione, ma in realtà ho visto che è facile confondersi ma è molto difficile sbagliare dato che i connettori sono quasi 1:1 con il loro cavo

## In conclusione

A parte i tempi di consegna di alcune componenti (_ma qui è anche colpa mia che mi metto a fare queste cose in Agosto..._) tutto il processo di assemblaggio, test e installazioni varie **è durato circa una giornata**, molto meno di quello che mi aspettavo e per lo più è andato liscio.

L'assemblaggio

---

## Degne di nota: le GPU integrate dei Ryzen

Ho passato quasi tutto il primo giorno di questa build con la GPU nella scatola, sia perché il "test a banco" in realtà è più un check del grosso dei componenti e non del PC completo e sia perché volevo rendere il PC il più funzionante possibile in caso di problemi con la GPU.

Usare una CPU con scheda grafica integrata (_come Ryzen 5 5600G_) permette appunto di utilizzare il PC con un setup minimale e in caso di problemi con la GPU di **poter vedere qualcosa** 🤓.

Ero rimasto e quando le schede grafiche integrate erano molto molto limitate come capacità, sopratutto al di fuori del renderizzare le schermate di Windows, ma per curiosità ho voluto provare _World of Warcraft_ e _Overwatch_ in questo setup senza GPU e **sono rimasto colpito dal fatto che si riesce a giocare sui 50FPS**, ovviamente impostando settaggi grafici in _"low"_ 👀.

Qui un video di benchmark di vari giochi usando un modello più potente di quello che ho scelto per la mia build:

<iframe class="w-full" height="450" loading="lazy" src="https://www.youtube.com/embed/pOYS0ng_Wec?si=wsnK6ehS4_QOE_G_" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Questo **ovviamente** non vuol dire che butterei via le GPU dedicate, ma visto che con qualche compromesso si riescono ad avere delle performance decenti con un budget ridotto, queste CPU con GPU integrata della AMD (_ovvero quelle con una "G" alla fine del nome del modello_) possono essere un'ottima scelta per build da costi ridotti o form-factor più piccoli. Tipo qualcosa delle dimensioni di un Mac Mini e quindi comodo da portare in giro 😇...
