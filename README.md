# Lavoro – La Spesa Sfusa

App per il negozio: compiti e orari di Anita e Alessia, preventivi con margine. Si installa sul telefono come Magazzino e funziona anche senza internet.

- **Oggi** e **Settimana**: compiti e orari di Anita e Alessia, con spunta, "Adesso" e "In ritardo".
- **Prepara** (la imposta Anita, una volta sola): 1 prodotti e prezzi (dal backup del Magazzino o a mano), 2 piatti con gli ingredienti a persona, 3 menu, 4 servizio (personale, allestimento, extra).
- **Preventivi**: eventi e cene, pranzi aziendali (più giorni, pasti al giorno, settimane), bomboniere e ceste. L'app calcola ingredienti, personale, allestimento ed extra e propone i prezzi; il cliente vede due voci (menu e servizio) o un solo prezzo a persona. Margine visibile solo a chi prepara. "Accettato" crea i compiti.
- **PDF**: in ogni preventivo "Crea PDF" con intestazione (logo, indirizzo, email, P.IVA e PEC del negozio già inseriti e telefono già inseriti) e lo si invia direttamente da WhatsApp o Mail.
- **Più telefoni insieme** (Altro): si collega ogni telefono con la password di Magazzino; compiti, spunte, piatti, menu, preventivi e impostazioni diventano uguali ovunque. Senza internet si lavora lo stesso e si sincronizza dopo.
- **Altro**: chi usa il telefono, costo orario e ricarico, avvisi 10 minuti prima (app aperta), backup.

I dati restano nel telefono (localStorage). Il backup si salva da Impostazioni.

## Pubblicazione (come Magazzino)

1. Nuovo repository `lavoro` su GitHub con questi file nella radice.
2. Settings → Pages → "Deploy from a branch" → `main`, cartella `/ (root)`.
3. Aprire `https://<utente>.github.io/lavoro/` dal telefono e aggiungere alla schermata Home. Su iPhone: Safari → Condividi → "Aggiungi alla schermata Home" (gli avvisi richiedono iOS 16.4 o successivo e l'app installata).

## Prossimi passi

- Collegare le spunte e i compiti tra i due telefoni con il Firebase del negozio.
- Avvisi anche ad app chiusa.
- Leggere dal Magazzino scadenze e scorte, e costi veri dalle ricette.

## 1.9.0
Preventivo semplificato: una sola schermata a domande ("Per chi e quando?", "Cosa mangiano?", "Chi lavora e cosa serve?", "A che prezzo?"). Il personale si calcola da solo (modificabile), le altre spese sono un elenco unico di voci con suggerimenti ricordati dai preventivi precedenti. La sezione "Servizio" è sparita da Prepara: i valori predefiniti del personale e le voci salvate sono in Impostazioni. I vecchi preventivi si convertono da soli.

## 2.0.0
Nuovo aspetto "Bottega": verde bottiglia, carta di sacco, titoli con caratteri da insegna, cartellini tratteggiati. Funzioni e schermate invariate.

## 2.1.0
Grafica più vicina a Magazzino (fascia scura in alto, schede e pulsanti più grandi) con toni più scuri. Nuova icona: le due S del logo su verde scuro con il sole.

## 2.2.0
Lavoro legge i prodotti e i prezzi direttamente dal Magazzino (stessa base dati, sola lettura), senza più caricare il backup: nuovi prodotti, prezzi cambiati e prodotti tolti arrivano da soli. Collegamento "Apri Magazzino" in Prodotti e in Altro. Il backup resta come ripiego.

## 2.2.2
Tolto "catering" dai testi (ora "Eventi e cene"). Nome nell'intestazione: "La Spesa Sfusa di Anita Mancini". Nel PDF il documento si chiama "Proposta" (nell'app resta "Preventivo").
