---
title: Raspberry Pi (Zero) Mania
image: https://raw.githubusercontent.com/moebiusmania/blog-assets/master/images/2019/IMG_20190122_215800.jpg
imageMeta:
  attribution:
  attributionLink:
type: post
author: salvatore
date: Wed Feb 06 2019 21:17:00 GMT+0100 (Central European Standard Time)
publish: 2019-02-06
tags:
  - iot
---

Qualche giorno fa durante un evento alla sede milanese di Microsoft ho ricevuto un [Raspberry Pi Zero](https://www.raspberrypi.org/products/raspberry-pi-zero/) in regalo... ed è partita la mia nuova mania per questi mesi 🤣.

<!-- more -->

Veloce riassunto per chi non sapesse di cosa sto parlando, i **Raspberry Pi** sono dei *single-board computers* , ovviamente e volutamente di scarsa potenza di calcolo rispetto a un PC tradizionale, ma data la loro natura estremamente compatta e il prezzo contenuto sono ideali per progetti fai-da-te di domotica o **Internet of Things** (*IoT*).

Il modello Zero accentua il fattore dimensioni ridotte (*e ovviamente ha una potenza di calcolo inferiore ai modelli 2/3*) ma questo gli permette di essere venduto **in commercio a soli 5 euro, 10 nel caso del modello che include il ricevitore WiFi**.

<iframe width="560" height="500" src="https://www.youtube.com/embed/jFoA4u4x2uk" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

### Carino... ma che ci faccio?
E' stata tipo la prima domanda che mi sono posto quando ho aperto la scatola.

Sulle prime non morivo dalla voglia di mettermi a fare IoT, principalmente per il poco tempo a disposizione che ho a casa per scrivere codice e programmare cose.

Poi ho fatto qualche ricerca, e ho scoperto **quanta diamine di roba già pronta esiste**! Sia a livello hardware che software, certo un po di smanettamenti sono necessari (*e che divertimento ci sarebbe altrimenti?*) ma tutte cose gestibili in poche ore a settimana.

Tra le cose fattibili che mi interessano:

* computer (*magari con accesso da remoto*) di emergenza
* mini videocamere di sorveglianza, comprando un modulino webcam dedicato a parte
* emulatori per console e arcade di vecchia generazione 16bit (*Sega Mega Drive, Super Nintendo, Neo Geo*)
* ricevitore Google Cast + AirPlay per le TV
* cornici interattive/smart totem
* simil Google Home

L'idea di tornare a giocare con dell'hardware e assemblare dei piccoli device un po in stile lego, non mi dispiaceva affatto e non ho perso tempo sul da farsi.

Ma mi serviva ancora qualche pezzo...
 
### Rimediare il materiale per iniziare
Uno dei difetti del modello Zero è che per mantenere dimensioni molto ridotte usa porte micro USB e micro HDMI, e quindi richiede qualche adattatore. Ma visti i prezzi di questi adattatori in molti negozi di elettronica/informatica, ho trovato su [Amazon i kit ufficiali del Raspberry Pi](https://www.amazon.it/gp/product/B07D5G3459/ref=ppx_yo_dt_b_asin_title_o00__o00_s00?ie=UTF8&psc=1), in **30 euro** sono inclusi:

* Raspberry Pi Zero W(*iFi*)
* adattatore micro HDMI
* adattatore micro USB
* micro SD (*+ adattatore*) con Raspbian OS già installato
* case di plastica con 3 varianti

Manca solo un cavetto micro USB per fare da alimentatore, ma quello è abbastanza comune e può andare bene anche il caricabatterie di uno smartphone.

Prezzo **onestissimo** per smanettare il prima possibile!

### Vendicare le console dell'infanzia 🎮
Tra le cose per cui sbavavo tantissimo da piccolo e che non ho mai avuto ci sono le due console a 16bit che hanno definito la prima metà degli anni '90: il **Sega MegaDrive e il Super Nintendo**.

Certo qualche anno dopo grazie gli emulatori per PC ho avuto la prima rivincita e da un paio di anni esistono le versioni classic/flashback delle suddette console... ma costano tra i 60 e gli 80 euro l'uno. Sicuramente i c[ontroller quasai identici e il case somigliante a quello originale](https://www.polygon.com/2017/10/13/16051258/sega-genesis-flashback-hd-review) fanno la loro scena... ma a me interessa principalmente potermi sedere davanti alla TV con un controller in mano e rigiocarmi i giochi con cui ci sfidavamo a casa degli amici da bambino, e farlo con un solo mini-device da 30 euro non è affatto un cattivo risultato 🤓.

[RetroPie](https://retropie.org.uk/) è un progetto molto interessante (*e multi piattaforma*) che mette a disposizione una ventina di emulatori di console tra i più noti e gettonati, con un OS che permette di gestirli ed in più ha precaricati svariati driver di controller (*io sto usando un controller Xbox 360 USB*)... il tutto in una sola e comoda immagine già pronta per Raspberry Pi 😎.

Una volta [scaricata l'immagine](https://retropie.org.uk/download/) l'ho flashata sulla SD inclusa nel kit usando [Etcher](https://www.balena.io/etcher/). Dopo aver sbattuto un po la testa per collegare il device alla rete wifi, mi sento di consigliare [questo metodo](https://github.com/RetroPie/RetroPie-Setup/wiki/Wifi#connecting-to-wifi-without-a-keyboard-raspbian-stretch) che vi permette di creare un file da PC in cui indicate il nome della rete e la password in un file da copiare nella SD appena finito di flashare RetroPie.

A questo punto vi basta collegare il Raspberry alla tv, dargli energia e attaccare un gamepad... ed ecco Retropie funzionante!

Il vantaggio del settare il wifi è che [tramite il protocollo Samba](https://github.com/retropie/retropie-setup/wiki/Transferring-Roms#samba-shares) potrete collegarvi al Raspberry dal vostro computer (*ma devono essere sulla stessa rete*) e copiare le ROM dei giochi nelle cartelle dei vari emulatori in maniera easy peasy! E finalmente... let's game the '90s 🎮🤓!

![Golden Axe](https://github.com/moebiusmania/blog-assets/blob/master/images/2019/goldenaxe.jpg?raw=true)

Un paio di cose da notare:
* si può usare anche il Pi Zero non-wifi per Retropie, ma a quel punto le ROM possono essere trasferite solo tramite chiavetta USB.
* il Pi Zero si alimenta anche con le porte USB della TV, comodo per non avere cavi in vista.
* per far sparire completamente il Pi Zero l'ho chiuso in uno dei case inclusi nel kit e usando un pezzetto di nastro biadesivo l'ho attaccato dietro la TV. E' leggerissimo.
* il Pi Zero emula egregiamente finoo alle console a 16bit, se volete emulare anche Playstation, Saturn e Nintendo64 conviene passare al Raspberry Pi 3.
* esistono case per Raspberry simili a quelli delle console sopra citate. E anche repliche dei controller.

### Per chiudere
Il Raspberry Pi Zero ha riacceso la mia voglia di smanettare con software e hardware, ma sono **volontariamente** ben lontano dal definirmi un maker, dato che per ora mi voglio limitare ad assemblare componenti esistenti e creare piccoli aggeggi e soluzioni home made. Il vantaggio di questo approccio è, oltre che economico, anche quello che è tutto modificabile in base alle proprie esigenze al contrario dei device comprati in negozio.

Man mano che andrò avanti a smanettare con le soluzioni che vorrei realizzare, posterò altri articoli sia come promemoria ma anche per magari far risparmiare qualche minuto di sbattimenti di testa a qualcun'altro interessato a cose simili. 