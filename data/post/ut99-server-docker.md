---
title: Creare un server privato di UT99 con Docker
date: '2020-11-07'
tags: ['docker', 'ut99', 'gaming', 'tecnicismi']
draft: true
summary: 'Il mio (38°) compleanno si avvicina, e volevo festeggiarlo rievocando un LAN party di UT99 come ai vecchi tempi, ma siamo stati così fortunati che ci troviamo nel mezzo di un secondo lockdown nazionale.'
---

![la schermata iniziale di UT99](https://external-preview.redd.it/Rz9Gwj1URmf6I4IGUTWLruCb58fAsPNE_qn2WQBu98I.png?auto=webp&s=cfc13c82491d8202b4feb655389f97e10c35b7c0)

> Il mio (_38°_) compleanno si avvicina, e volevo festeggiarlo rievocando un **LAN party** di UT99 come ai vecchi tempi, ma siamo stati così fortunati che ci troviamo nel mezzo di un secondo lockdown nazionale.

## Io & Unreal Tournament (1999)

Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Integer vel ipsum purus. Suspendisse mollis libero nec sodales porttitor. Mauris a quam dui. Duis dapibus, diam sed congue hendrerit, libero eros feugiat tellus, sed ornare arcu quam molestie orci. Nam fringilla commodo dignissim. Morbi eget risus vitae ex imperdiet ultricies. Pellentesque egestas dui felis, sit amet ornare dui facilisis non.

![Io con alcuni amici in una ormai lontana sera di Marzo del 2007 mentre ci confrontiamo a fraggate su UT99 in LAN](https://raw.githubusercontent.com/moebiusmania/blog-assets/master/images/2020/LanParty_01.jpg) <small>_Io con alcuni amici in una ormai lontana sera di Marzo del 2007 mentre ci confrontiamo a fraggate su UT99 in LAN_</small>

## Cosa serve e passaggi

- repo del progetto [ut99-server](https://github.com/Roemer/ut99-server) sottomano
- una [droplet basic](https://www.digitalocean.com/products/droplets/) su Digital Ocean
- un terminale con SSH
- una copia di Unreal Tournament per ogni partecipante (_è sia su [Steam](https://store.steampowered.com/app/13240/Unreal_Tournament_Game_of_the_Year_Edition/) che [GOG](https://www.gog.com/game/unreal_tournament_goty?gclsrc=aw.ds&)_)

![L'interfaccia di amministrazione del vostro server pubblico di UT99](https://user-images.githubusercontent.com/1764542/87203342-ae4f3980-c302-11ea-87a5-f535ce5087ee.png)<small>_L'interfaccia di amministrazione del vostro server pubblico di UT99_</small>

I passaggi non sono complessi, ma bisogna conoscere un minimo gli strumenti:

- connettersi in SSH alla droplet di Digital Ocean
- avviare l'immagine Docker con il comando `docker run --name ut99 -p 5580:5580 -p 7777:7777/udp -p 7778:7778/udp -v ut99-data:/ut-data roemer/ut99-server:latest`
- accedere al pannello di admin del server di UT appena creato, l'indirizzo è `https://[IP_DROPLET]:5580`, da qui fatevi subito un giro per attivare/disattivare le modalità che vi interessano, settare la difficoltà dei bot e customizzare la rotation delle mappe (_di default non include alcune chicche come DM-Morbias][_)
- passare ai partecipanti l'indirizzo del server che è `https://[IP_DROPLET]:7777`
- avviare UT99, aprie il menu `Multiplayer -> Open location` e inserire l'indirizzo del server (_ignorate eventuali messaggi di configurazione della connessione_)

A questo punto...

# ...buon divertimento a suon di frag 😎

<iframe src="https://store.steampowered.com/widget/13240/679/" frameBorder="0" width="100%" height="190"></iframe>
