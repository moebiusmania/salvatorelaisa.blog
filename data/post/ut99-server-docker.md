---
title: Creare un server privato di UT99 con Docker
date: '2020-11-07'
tags: ['docker', 'ut99', 'gaming', 'tecnicismi']
draft: false
summary: 'Il mio (38°) compleanno si avvicina, e volevo festeggiarlo rievocando un LAN party di UT99 come ai vecchi tempi, ma siamo stati così fortunati che ci troviamo nel mezzo di un secondo lockdown nazionale.'
---

![la schermata iniziale di UT99](https://external-preview.redd.it/Rz9Gwj1URmf6I4IGUTWLruCb58fAsPNE_qn2WQBu98I.png?auto=webp&s=cfc13c82491d8202b4feb655389f97e10c35b7c0)

> Il mio (_38°_) compleanno si avvicina, e volevo festeggiarlo rievocando un **LAN party** di UT99 come ai vecchi tempi, ma siamo stati così fortunati che ci troviamo nel mezzo di un secondo lockdown nazionale.

Oggi è facile parlare di multiplayer online quando si tratta di giochi moderni o attivamente supportati, ma Unreal Tournament (_il primo_) ha da poco **superato i 20 anni** di esistenza e non è più supportato da Epic Games.

Quindi come si fa a giocare in multiplayer via internet un gioco così vecchio? Esistono alcune possibilità

- usare una VPN, ma avrei dovuto spiegare a tutti come funzionano e come setuppare il tutto e c'era il rischio di passare la serata così invece di giocare
- su UT99 sono presenti dei server pubblici "vuoti", facili da usare ma non hai controllo sui settaggi della partita e non puoi controllare chie entra e chi no

quello che volevo era un **server pubblico ma gestito da me**, così da poter passare agli amici l'indirizzo a cui collegarsi ma poter controllare ogni aspetto delle partite.

Fortunamente la ricerca è stata breve e mi ha portato quasi subito davanti a questo progetto su GitHub che fa esattamente quello che mi serviva: [ut99-server](https://github.com/Roemer/ut99-server)!

Mille grazie a [Roemer](https://github.com/Roemer) che non solo ha salvato il mio UT99 di compleanno, ma mi ha anche aperto un mondo con questo concetto di distribuire i server dei giochi con Docker 🤓.

## Io & Unreal Tournament (1999)

[Unreal Tournament](https://it.wikipedia.org/wiki/Unreal_Tournament) è stato uno di quei giochi ormai storici che posso dire di aver seguito fin dal lancio nel 1999.

Era uscito quasi in contemporane con il suo rivale **Quake 3: Arena**, li ho sempre apprezzati entrambi ma dato che il più dei miei amici giocava a UT rispetto a Quake, le mie memorie sull'alba del multiplayer online sono più legate a questo titolo.

![Io con alcuni amici in una ormai lontana sera di Marzo del 2007 mentre ci confrontiamo a fraggate su UT99 in LAN](https://raw.githubusercontent.com/moebiusmania/blog-assets/master/images/2020/LanParty_01.jpg) <small>_Io con alcuni amici in una ormai lontana sera di Marzo del 2007 mentre ci confrontiamo a fraggate su UT99 in LAN_</small>

Giocavamo tantissimo online ma poi verso il 2004 ci siamo comprati uno switch da 4 soldi ma che ci permetteva di collegarci fino a 16 persone in una rete locale, e da li abbiamo iniziato la nostra tradizione dei LAN party in casa 🤓. Non era una cosa che facevamo di frequente, ma quando capitava qualcuno con casa libera era facile che ci si caricasse i PC in macchina, si compravano birre e kebab... e giu di frag tutta la sera!

## Come usare questo custom server

Non serve molta roba, ma per fare una breve checklist del necessario:

- repo del progetto [ut99-server](https://github.com/Roemer/ut99-server) sottomano
- una [droplet basic](https://www.digitalocean.com/products/droplets/) su Digital Ocean
- un terminale con SSH
- una copia di Unreal Tournament per ogni partecipante (_è sia su [Steam](https://store.steampowered.com/app/13240/Unreal_Tournament_Game_of_the_Year_Edition/) che [GOG](https://www.gog.com/game/unreal_tournament_goty?gclsrc=aw.ds&)_)

Ovviamente Digital Ocean non è l'unica piattaforma disponibile per pubblicare live il vostro custom server di UT99, ma è quella che trovo più veloce, affidabile ed economica (_la droplet basic costa 5$ al mese_).

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
