# Lavoro – La Spesa Sfusa

App per il negozio: compiti e orari di mamma e Alessia, preventivi con margine. Si installa sul telefono come Magazzino e funziona anche senza internet.

- **Oggi** e **Settimana**: compiti e orari di mamma e Alessia, con spunta, "Adesso" e "In ritardo".
- **Prepara** (la imposta mamma, una volta sola): 1 prodotti e prezzi (dal backup del Magazzino o a mano), 2 piatti con gli ingredienti a persona, 3 menu, 4 servizio (personale, allestimento, extra).
- **Preventivi**: catering ed eventi, pranzi aziendali (più giorni, pasti al giorno, settimane), bomboniere e ceste. L'app calcola ingredienti, personale, allestimento ed extra e propone i prezzi; il cliente vede due voci (menu e servizio) o un solo prezzo a persona. Margine visibile solo a chi prepara. "Accettato" crea i compiti.
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
