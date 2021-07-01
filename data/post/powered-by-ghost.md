---
title: Powered by Ghost + OpenShift + GoDaddy
date: '2015-02-24'
tags: ['blog', 'tecnicismi']
draft: false
summary: 'Primo trasloco totale per il mio sito personale: ho cambiato hosting, dominio, e sistema di pubblicazione!'
---

![](https://cdn.colorlib.com/wp/wp-content/uploads/sites/2/ghost-logo.png)

Primo trasloco totale per il mio sito personale: ho cambiato **hosting, dominio, e sistema di pubblicazione**!

Lato tecnico è una bella rivoluzione, ma anche sui contenuti e obiettivo del sito sto facendo dei bei cambiamenti: lo utilizzerò solamente come **blog personale**, con forse un paio di paginette statiche su di me e qualche mio progetto, e ho fatto un po di pulizia e ordine negli articoli trasportati da quello vecchio. Non mi sono autocensurato, semplicemente alcuni articoli erano in realtà più da portfolio (di allora), tutti gli altri sono qui, o stanno tornando, sistemati come marcatura e immagini.

Essendo uno smanettone e sempre abbastanza gasato quando si tratta di sperimentare robba nuova (leggesi: **early adopter**) sto basando il sito su alcuni prodotti e servizi sulle quali non avevo ancora messo le mani:

- [Ghost](https://ghost.org/): una (recentissima) piattaforma di **solo** blogging, nata da un'idea dell'ex capo di UX di WordPress, con la particolarità di essere basata non su PHP ma su NodeJS.
- [NodeJS](http://nodejs.org/): permette l'utilizzo di Javascript per lo sviluppo lato server, nel bene e nel male.
- [OpenShift](https://www.openshift.com/): hosting per applicazioni di RedHat, supporta diverse piattaforme compreso NodeJS.
- [GoDaddy](https://it.godaddy.com/): il più grande domain provider su web.

Lato tecnico mi intriga il concetto di un CMS full-stack Javascript, lato usabilità sto molto apprezzando il minimalismo di Ghost e la comodità d'uso su mobile, unito al fatto che finora si sta dimostrando molto veloce e reattivo!

I lati "negativi" notati finora sono:

- **abituarsi al Markdown**: dopo aver usato per anni editor visuali il Markdown sulle prime può un pochino spaventare, in realtà è molto semplice da usare ma finché non si memorizzano i fondamenti si scrive con la guida aperta in un'altra scheda.
  ==Aggiunta del 08/11/2015:== nelle ultime release di Ghost (al momento siamo alla 0.7.1) è stato introdotto un piccolo pannello di riassunto dei comandi più comuni per il Markdown e delle abbreviazioni da tastiera per rendere il suo utilizzo ancora più immediato.
- **alcune funzionalità devono ancora arrivare**: plugin, programmazione degli articoli, gestione della navigazione e cosette di questo tipo sono previste nella roadmap di sviluppo di Ghost... quindi pazienza!
- **gestione basilare dei media**: al momento è possibile uploadare immagini in maniera molto basilare, se avete bisogno di includere audio e video vi consiglio di passare da servizi esterni (YouTube, Instagram, Flickr,...) e sfruttare i codici di embed.
- **nessuna gestione dei commenti**: per vari motivi è stato deciso di non includere un sistema di discussioni in Ghost, questo vi da la libertà di implementare quello che volete, strizzando notevolmente l'occhiolino a [Disqus](https://disqus.com/) ma significa anche il dover per forza magheggiare un minimo con il codice del tema in uso.\\n\\nCosa invece mi sta piacendo rispetto al mio precedente setup del sito (WordPress + MediaTemple Grid hosting)
- **ciao ciao FTP**: su Openshift (come molti hosting moderni) ogni account di "hosting" non è altro che un repository [Git](http://git-scm.com/) , basta lanciare un _clone_ per copiarlo in locale e fare una _push_ per caricare i file aggiornati sul proprio sito/app. Operazione decisamente più comoda!
- **UX Mobile first**: non ho mai avuto particolare esigenza di bloggare da smartphone o tablet e quelle poche volte che ne ho avuto la possibilità ho cercato di evitare... per quanto voglia bene a WordPress purtroppo ha adottato una UI responsive per l'area di admin solo dalla versione 3.8 che comunque si è (giustamente) dimostrato un'adattamento della versione desktop, lasciando alcune operazioni "privilegiate" su schermi larghi. In Ghost, probabilmente date le sue minori funzionalità rispetto a WP, la UI in versione mobile non subisce alcuna perdita <del>, anche se al momento non è possibile caricare foto da mobile (ma dovrebbe [essere risolto a breve](https://trello.com/c/eBvmLaSC/83-mobile-uploads-in-editor))</del> e "invoglia" a un suo utilizzo in mobilità, cosa che spero di poter testare in maniera pratica molto presto!
- **roadmap pubblica**: lo sviluppo di Ghost, come in molti progetti open source, è completamente trasparente. Una cosa che ho trovato molto chiara e interessante è la pubblicazione di una [board su Trello](https://trello.com/b/EceUgtCL/ghost-roadmap) nel quale è possibile visionare le features che sono in via di sviluppo e lo stato in cui si trovano, con la possibilità di esprimere "preferenze" per le feature che secondo noi possono essere di maggior interesse.

Ho scritto un bel papirone semitecnico quindi direi che posso fermarmi qui, ma ogni tanto tornerò ad aggiornare questo articolo.

Per il resto... let's smanettamento!
