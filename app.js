/* Lavoro – La Spesa Sfusa
   Compiti e orari di ognuna, piatti e menu con i prezzi del negozio, preventivi che si compilano da soli.
   Dati nel telefono (localStorage). Backup con "Salva backup" in Impostazioni. */
'use strict';
(function () {
  /* =========================================================
     Costanti
     ========================================================= */
  const KEY = 'lavoro-spesa-sfusa-v1';
  const GIORNI = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
  const NOME = { m: 'Mamma', a: 'Alessia' };
  const EUR = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });
  const TUTTI = [1, 2, 3, 4, 5, 6];
  const SVG_OK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const TIPI_PIATTO = [['antipasto', 'Antipasti'], ['primo', 'Primi'], ['secondo', 'Secondi'], ['contorno', 'Contorni'], ['dolce', 'Dolci'], ['altro', 'Altro']];
  const BASI = [['acq', 'Prezzo d\'acquisto, IVA esclusa'], ['acqiva', 'Prezzo d\'acquisto, IVA inclusa'], ['ven', 'Prezzo di vendita nel negozio']];

  const TIPI = {
    cat: { nome: 'Catering ed eventi', corto: 'Catering', unita: 'persone', rif: true,
      compiti: [[-14, 'Conferma menu e ospiti', ['m']], [-7, 'Ordina ingredienti e materiali', ['m']], [-3, 'Acquisti freschi e controllo scorte', ['a']], [-1, 'Prepara le basi e carica l\'allestimento', ['m', 'a']], [0, 'Evento: servizio e allestimento', ['m', 'a']]] },
    pra: { nome: 'Pranzo aziendale', corto: 'Pranzi', unita: 'pasti', rif: false, compiti: [] },
    ces: { nome: 'Bomboniere e ceste', corto: 'Ceste', unita: 'pezzi', rif: false,
      compiti: [[-10, 'Conferma contenuto e personalizzazioni', ['m']], [-7, 'Ordina prodotti e confezioni', ['m']], [-1, 'Componi e confeziona', ['m', 'a']], [0, 'Consegna', ['a']]] }
  };

  /* =========================================================
     Dati
     ========================================================= */
  const uid = () => Math.random().toString(36).slice(2, 9);
  function predefiniti() {
    const c = (id, da, a, t, chi, g, n) => ({ id, t, n: n || '', da, a, chi, g, data: null });
    return {
      v: 2, pesi: {}, profilo: null, azienda: { nome: 'La Spesa Sfusa di Mancini Anita', indirizzo: 'Via Lazio 66, 63812 Montegranaro (FM)', tel: '331 405 2958', email: 'laspesasfusa@gmail.com', piva: '02174870440', pec: 'laspesasfusa@pec.it', logo: '' }, ricarico: 50, notifiche: false, fatti: {}, preventivi: [],
      prodotti: [], piatti: [], menu: [],
      servizio: { pers: { ogni: 25, min: 2, ore: 6, tar: 12 }, allest: [], extra: [] },
      basePrezzo: { cat: 'acq', pra: 'acq', ces: 'ven' },
      compiti: [
        c('pul', '09:00', '09:30', 'Pulizia di apertura', ['m', 'a'], TUTTI, 'Banco, cucina, pavimenti'),
        c('cuc', '09:30', '12:15', 'Cucina i pasti per la fabbrica', ['m'], TUTTI, 'Menu e quantità del giorno'),
        c('ban', '09:30', '10:30', 'Banco e verdura fresca', ['a'], TUTTI, 'Sistema la verdura appena arriva'),
        c('sca', '10:30', '11:00', 'Controllo scadenze', ['a'], TUTTI, 'Dall\'app Magazzino: prodotti che scadono presto'),
        c('ban2', '11:00', '12:15', 'Banco e clienti', ['a'], TUTTI),
        c('imp', '12:15', '12:45', 'Impacchetta i pasti', ['m', 'a'], TUTTI, 'Carica tutto per la consegna'),
        c('con', '12:45', '13:00', 'Consegna in fabbrica', ['a'], TUTTI, 'Parte alle 12:45 per essere lì alle 13'),
        c('bam', '12:45', '13:00', 'Banco da sola fino alla chiusura', ['m'], TUTTI, 'Alessia è in consegna'),
        c('cu2', '14:30', '15:30', 'Sistema la cucina', ['m'], TUTTI, 'Prepara anche gli ingredienti di domani'),
        c('ord', '15:30', '17:00', 'Ordini ai fornitori', ['m'], [1, 6], 'Lista suggerita dalle giacenze'),
        c('pre', '15:30', '17:00', 'Preventivi', ['m'], [2, 5], 'Eventi, pranzi aziendali, ceste'),
        c('pan', '15:30', '17:00', 'Pane e dolci per domani', ['m'], [3]),
        c('cnt', '15:30', '17:00', 'Contabilità', ['m'], [4]),
        c('sbn', '17:00', '18:00', 'Banco e clienti', ['a'], TUTTI),
        c('m17', '17:00', '20:00', 'Compito del giorno, poi il banco', ['m'], TUTTI, 'Lo stesso compito fisso del pomeriggio, se non finito'),
        c('lis', '18:00', '19:30', 'Lista di domani e preventivi nell\'app', ['a'], TUTTI, 'Ingredienti da ordinare, bozze da inserire'),
        c('ban3', '19:30', '20:00', 'Banco e clienti', ['a'], TUTTI),
        c('chi', '20:00', '20:30', 'Chiusura', ['m', 'a'], TUTTI, 'Cassa, scadenze del giorno, cosa manca per domani')
      ]
    };
  }
  function migra(o) {
    const d = Object.assign(predefiniti(), o || {});
    d.azienda = Object.assign({ nome: 'La Spesa Sfusa di Mancini Anita', indirizzo: 'Via Lazio 66, 63812 Montegranaro (FM)', tel: '331 405 2958', email: 'laspesasfusa@gmail.com', piva: '02174870440', pec: 'laspesasfusa@pec.it', logo: '' }, d.azienda || {});
    if (!d.pesi || typeof d.pesi !== 'object') d.pesi = {};
    if (!Array.isArray(d.menu)) d.menu = [];
    if (!Array.isArray(d.prodotti)) d.prodotti = [];
    if (!Array.isArray(d.piatti)) d.piatti = [];
    d.servizio = Object.assign({ pers: { ogni: 25, min: 2, ore: 6, tar: 12 }, allest: [], extra: [] }, d.servizio || {});
    d.servizio.pers = Object.assign({ ogni: 25, min: 2, ore: 6, tar: 12 }, d.servizio.pers || {});
    d.basePrezzo = Object.assign({ cat: 'acq', pra: 'acq', ces: 'ven' }, d.basePrezzo || {});
    d.preventivi = (d.preventivi || []).filter(p => p && p.v === 2);
    return d;
  }
  let D = carica();
  function carica() {
    try {
      const s = localStorage.getItem(KEY);
      if (s) { const o = JSON.parse(s); if (o && Array.isArray(o.compiti)) return migra(o); }
    } catch (e) { }
    return predefiniti();
  }
  function salva() { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) { } }

  /* =========================================================
     Utilità
     ========================================================= */
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const p2 = n => String(n).padStart(2, '0');
  function iso(d) { return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()); }
  function daIso(s) { return new Date(s + 'T12:00:00'); }
  function addDays(d, n) { const x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; }
  const minuti = h => { const p = String(h).split(':'); return (+p[0] || 0) * 60 + (+p[1] || 0); };
  const dataLunga = s => daIso(s).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const dataBreve = s => daIso(s).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' });
  const num = v => { const x = parseFloat(String(v == null ? '' : v).replace(',', '.')); return isNaN(x) ? 0 : x; };
  const numero = id => { const el = document.getElementById(id); return el ? num(el.value) : 0; };
  const chiTesto = chi => chi.map(x => NOME[x]).join(' e ');
  const altra = p => (p === 'm' ? 'a' : 'm');
  const nf = (x, d) => (Math.round(x * Math.pow(10, d || 0)) / Math.pow(10, d || 0)).toLocaleString('it-IT', { maximumFractionDigits: d || 0 });
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  (function pulisciVecchi() {
    const limite = iso(addDays(new Date(), -90));
    let cambiato = false;
    Object.keys(D.fatti).forEach(k => { if (k.slice(0, 10) < limite) { delete D.fatti[k]; cambiato = true; } });
    if (cambiato) salva();
  })();

  let toastTimer = null;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 2800);
  }
  function apriModale(html) {
    $('#modalBody').innerHTML = html;
    const m = $('#modal');
    if (m.showModal) { if (!m.open) m.showModal(); } else m.setAttribute('open', '');
  }
  function chiudiModale() { const m = $('#modal'); if (m.close) { if (m.open) m.close(); } else m.removeAttribute('open'); }

  function compitiDel(giorno, persona) {
    const d0 = iso(giorno), dow = giorno.getDay();
    return D.compiti
      .filter(t => (t.data ? t.data === d0 : (t.g || []).indexOf(dow) > -1) && (!persona || t.chi.indexOf(persona) > -1))
      .sort((a, b) => minuti(a.da) - minuti(b.da) || minuti(a.a) - minuti(b.a));
  }
  const chiaveFatto = (d0, id, p) => d0 + '|' + id + '|' + p;

  /* =========================================================
     Prodotti, piatti, menu: i conti
     ========================================================= */
  const prodotto = id => D.prodotti.find(p => p.id === id);
  const piatto = id => D.piatti.find(p => p.id === id);
  const menuDi = p => D.menu.find(m => m.id === p.menuId);
  function parseFormato(s) {
    const m = /(\d+(?:[.,]\d+)?)\s*(kg|gr|g|lt|l|ml|cl)\b/i.exec(String(s || ''));
    if (!m) return null;
    const q = num(m[1]), u = m[2].toLowerCase();
    if (u === 'kg') return { q: q * 1000, u: 'g' };
    if (u === 'g' || u === 'gr') return { q, u: 'g' };
    if (u === 'l' || u === 'lt') return { q: q * 1000, u: 'ml' };
    if (u === 'cl') return { q: q * 10, u: 'ml' };
    return { q, u: 'ml' };
  }
  function prezzoBase(pr, base) {
    if (pr.manuale) return pr.acq != null ? pr.acq : pr.ven;
    const acq = pr.acq, acqiva = acq == null ? null : acq * (1 + (pr.iva || 0) / 100);
    let x = base === 'ven' ? pr.ven : base === 'acqiva' ? acqiva : acq;
    if (x == null) x = base === 'ven' ? acqiva : pr.ven;   // se manca il prezzo scelto, usa l'altro invece di non calcolare
    return x == null ? null : x;
  }
  const FATT = { g: 1, kg: 1000, ml: 1, l: 1000, cucchiaio: 15, cucchiaino: 5 };
  function costoIng(pr, q, u, base) {
    const x = prezzoBase(pr, base); if (x == null) return null;
    if (pr.tipo === 'kg' || pr.tipo === 'l') return FATT[u] ? x * q * FATT[u] / 1000 : null;
    if (u === 'pz') return x * q;
    if (FATT[u] && pr.conf && FATT[pr.conf.u] && pr.conf.q > 0) return x * q * FATT[u] / (pr.conf.q * FATT[pr.conf.u]);
    return null;
  }
  function unitaOk(pr, u) { return costoIng({ tipo: pr.tipo, conf: pr.conf, acq: 1, ven: 1, iva: 0, manuale: true }, 1, u, 'ven') != null; }
  const unitaDefault = pr => (pr.tipo === 'kg' ? 'g' : pr.tipo === 'l' ? 'ml' : 'pz');
  function testoPrezzo(pr, base) {
    const x = prezzoBase(pr, base), su = pr.tipo === 'kg' ? '/kg' : pr.tipo === 'l' ? '/l' : '/pz';
    return x == null ? 'senza prezzo' : EUR.format(x) + su;
  }
  function costoPiatto(d, base) {
    let tot = 0; const manca = [];
    (d.ing || []).forEach(i => {
      const pr = prodotto(i.pid); if (!pr) { manca.push('prodotto tolto'); return; }
      const c = costoIng(pr, i.q, i.u, base);
      if (c == null) manca.push(pr.nome); else tot += c;
    });
    return { c: tot, manca };
  }
  function costoMenu(m, base) {
    let pp = 0; const manca = [];
    ((m && m.piatti) || []).forEach(id => { const d = piatto(id); if (!d) return; const r = costoPiatto(d, base); pp += r.c; r.manca.forEach(x => { if (manca.indexOf(x) < 0) manca.push(x); }); });
    return { pp, manca };
  }
  function fmtQ(q, u) {
    if (u === 'g') return q >= 1000 ? nf(q / 1000, 2) + ' kg' : nf(q, 0) + ' g';
    if (u === 'ml') return q >= 1000 ? nf(q / 1000, 2) + ' l' : nf(q, 0) + ' ml';
    if (u === 'kg' || u === 'l') return nf(q, 2) + ' ' + u;
    if (u === 'cucchiaio') return nf(q, 1) + (q === 1 ? ' cucchiaio' : ' cucchiai');
    if (u === 'cucchiaino') return nf(q, 1) + (q === 1 ? ' cucchiaino' : ' cucchiaini');
    return nf(q, 1) + ' pz';
  }
  function listaIngredienti(m, mult, base) {
    const acc = new Map();
    ((m && m.piatti) || []).forEach(id => {
      const d = piatto(id); if (!d) return;
      (d.ing || []).forEach(i => {
        const pr = prodotto(i.pid); if (!pr) return;
        const k = pr.id + '|' + i.u; let r = acc.get(k);
        if (!r) { r = { nome: pr.nome, u: i.u, q: 0, c: 0, manca: false }; acc.set(k, r); }
        r.q += i.q * mult;
        const c = costoIng(pr, i.q * mult, i.u, base);
        if (c == null) r.manca = true; else r.c += c;
      });
    });
    return [...acc.values()].sort((a, b) => a.nome.localeCompare(b.nome, 'it'));
  }

  /* =========================================================
     Preventivi: i conti
     ========================================================= */
  function nuovoPrev(tipo) {
    const S = D.servizio.pers;
    return { v: 2, id: uid(), cliente: '', tipo, evento: iso(addDays(new Date(), 30)), n: tipo === 'cat' ? 80 : tipo === 'ces' ? 40 : 25,
      menuId: (D.menu.find(m => m.tipo === tipo) || {}).id || '', ore: tipo === 'cat' ? S.ore : 3, ric: D.ricarico,
      allest: [], extra: [], extraMano: 0, ppMenu: null, forfait: null, vista: 'diviso',
      giorni: [1, 2, 3, 4, 5], pasti: { 1: 25, 2: 25, 3: 25, 4: 25, 5: 25, 6: 25 }, settimane: 4, oreCucina: 3, consegna: 0, pp: null,
      stato: 'bozza', creato: Date.now() };
  }
  function calcolaPrev(p) {
    const base = D.basePrezzo[p.tipo], m = menuDi(p), mi = costoMenu(m, base), ric = +p.ric || 0, S = D.servizio.pers;
    if (p.tipo === 'pra') {
      const giorni = (p.giorni || []).slice().sort();
      const pasti = Math.max(1, giorni.reduce((s, g) => s + (+p.pasti[g] || 0), 0));
      const ing = pasti * mi.pp, lav = giorni.length * (+p.oreCucina || 0) * (+S.tar || 0), cons = giorni.length * (+p.consegna || 0);
      const costo = ing + lav + cons, prop = Math.ceil(costo * (1 + ric / 100) / pasti * 10) / 10, pp = p.pp == null ? prop : +p.pp;
      const ricavo = pp * pasti;
      return { tipo: 'pra', mi, giorni, pasti, ing, lav, cons, costo, ric, prop, pp, ricavo, marg: ricavo - costo, pct: ricavo ? (ricavo - costo) / ricavo * 100 : 0,
        periodo: ricavo * (+p.settimane || 1), mese: ricavo * 52 / 12 };
    }
    const n = Math.max(1, Math.round(+p.n || 1));
    const staff = p.tipo === 'cat' ? Math.max(+S.min || 1, Math.ceil(n / (+S.ogni || 25))) : 1;
    const pers = staff * (+p.ore || 0) * (+S.tar || 0);
    const allest = D.servizio.allest.filter(a => (p.allest || []).indexOf(a.id) > -1).reduce((s, a) => s + (+a.p || 0), 0);
    const extra = D.servizio.extra.filter(a => (p.extra || []).indexOf(a.id) > -1).reduce((s, a) => s + (+a.p || 0), 0) + (+p.extraMano || 0);
    const costoMenuTot = mi.pp * n, costoServ = pers + allest + extra, costo = costoMenuTot + costoServ;
    const propMenu = p.tipo === 'cat' ? Math.ceil(mi.pp * (1 + ric / 100)) : Math.ceil(mi.pp * (1 + ric / 100) * 10) / 10;
    const propServ = Math.ceil(costoServ * (1 + ric / 100) / 10) * 10;
    const ppMenu = p.ppMenu == null ? propMenu : +p.ppMenu, forfait = p.forfait == null ? propServ : +p.forfait;
    const ricavoMenu = ppMenu * n, totale = ricavoMenu + forfait;
    const unico = p.tipo === 'cat' ? Math.ceil(totale / n) : Math.ceil(totale / n * 10) / 10;
    return { tipo: p.tipo, mi, n, staff, pers, allest, extra, costoMenuTot, costoServ, costo, ric, propMenu, propServ, ppMenu, forfait, ricavoMenu, totale,
      unico, totUnico: unico * n, marg: totale - costo, pct: totale ? (totale - costo) / totale * 100 : 0 };
  }
  const riga = (a, b, forte) => '<div class="r' + (forte ? ' forte' : '') + '"><span>' + a + '</span><span>' + b + '</span></div>';

  /* =========================================================
     Stato dell'interfaccia
     ========================================================= */
  const oggiDow = new Date().getDay();
  const S = { giorno: oggiDow >= 1 && oggiDow <= 6 ? oggiDow : 1, chi: null, prev: null, prevNuovo: false, q: '' };
  let paginaPrima = '';
  let pendente = null;

  /* =========================================================
     Viste: compiti
     ========================================================= */
  function testata(titolo, sotto, destra) {
    return '<header class="head"><div><div class="brand">LA SPESA SFUSA</div><h1>' + esc(titolo) + '</h1>' + (sotto ? '<p class="sub">' + esc(sotto) + '</p>' : '') + '</div>' + (destra || '') + '</header>';
  }
  const indietro = (href, testo) => '<a class="indietro" href="' + href + '">‹ ' + esc(testo) + '</a>';

  function viewScelta() {
    return '<div class="benvenuto">' + testata('Chi sei?', 'Scegli una volta sola: questo telefono mostra i compiti di chi è scelta.') +
      '<button class="btn scuro" data-act="scegli" data-p="m">Mamma</button>' +
      '<button class="btn scuro" data-act="scegli" data-p="a">Alessia</button></div>';
  }

  function viewOggi() {
    const ora = new Date(), d0 = iso(ora), nm = ora.getHours() * 60 + ora.getMinutes(), p = D.profilo;
    const lista = compitiDel(ora, p);
    const fatta = t => !!D.fatti[chiaveFatto(d0, t.id, p)];
    const nF = lista.filter(fatta).length;
    const ritardo = lista.filter(t => !fatta(t) && minuti(t.a) <= nm).length;
    const prossimo = lista.find(t => !fatta(t) && minuti(t.a) > nm);
    let html = testata('Oggi', cap(ora.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })), '<span class="who">' + NOME[p] + '</span>');
    html += '<div class="kpi"><div><b>' + nF + '/' + lista.length + '</b><span>fatte</span></div>' +
      '<div><b>' + (prossimo ? prossimo.da : '–') + '</b><span>prossimo</span></div>' +
      '<div class="' + (ritardo ? 'rosso' : '') + '"><b>' + ritardo + '</b><span>in ritardo</span></div></div>';
    const aggiungi = '<div class="azioni"><button class="btn" data-act="nuovo-oggi">+ Aggiungi un lavoro per oggi</button></div>';
    if (!lista.length) return html + '<div class="vuoto">Nessun compito per oggi.</div>' + aggiungi;
    html += '<ul class="tempo">';
    lista.forEach(t => {
      const f = fatta(t), inCorso = !f && minuti(t.da) <= nm && nm < minuti(t.a), tardi = !f && minuti(t.a) <= nm;
      const classe = f ? 'fatto' : inCorso ? 'ora' : tardi ? 'ritardo' : '';
      let tag = '';
      if (inCorso) tag += '<span class="tag adesso">ADESSO</span>';
      if (tardi) tag += '<span class="tag ritardo">IN RITARDO</span>';
      if (t.chi.length > 1) tag += '<span class="tag">con ' + NOME[altra(p)] + '</span>';
      html += '<li class="slot ' + classe + '"><div class="when"><b>' + esc(t.da) + '</b><span>' + esc(t.a) + '</span></div><div class="rail"></div>' +
        '<div class="scheda"><div><div class="tit">' + esc(t.t) + '</div>' + (t.n ? '<div class="nota">' + esc(t.n) + '</div>' : '') + (tag ? '<div class="tags">' + tag + '</div>' : '') + '<button class="modifica" data-act="apri-compito" data-id="' + esc(t.id) + '">Modifica</button></div>' +
        '<button class="check" data-act="spunta" data-id="' + esc(t.id) + '" aria-label="' + (f ? 'Rimetti da fare: ' : 'Segna fatto: ') + esc(t.t) + '">' + SVG_OK + '</button></div></li>';
    });
    return html + '</ul>' + aggiungi;
  }

  function viewSettimana() {
    const filtro = S.chi || D.profilo;
    const ora = new Date(), lunedi = addDays(ora, -((ora.getDay() + 6) % 7));
    const data = addDays(lunedi, S.giorno - 1);
    const lista = compitiDel(data, filtro === 't' ? null : filtro);
    let html = testata('Settimana', 'Compiti e orari. Tocca un compito per cambiarlo.');
    html += '<div class="giorni" role="group" aria-label="Giorno">' + TUTTI.map(g => '<button data-act="giorno" data-g="' + g + '" aria-pressed="' + (g === S.giorno) + '" class="' + (g === oggiDow ? 'oggi' : '') + '">' + GIORNI[g] + '</button>').join('') + '</div>';
    html += '<div class="seg" role="group" aria-label="Persona">' + [['m', 'Mamma'], ['a', 'Alessia'], ['t', 'Tutti']].map(x => '<button data-act="filtro" data-f="' + x[0] + '" aria-pressed="' + (filtro === x[0]) + '">' + x[1] + '</button>').join('') + '</div>';
    if (!lista.length) html += '<div class="vuoto">Nessun compito per questo giorno.</div>';
    lista.forEach(t => {
      html += '<button class="riga" data-act="apri-compito" data-id="' + esc(t.id) + '"><span class="ora">' + esc(t.da) + '<br><span class="chi">' + esc(t.a) + '</span></span><span><b>' + esc(t.t) + '</b>' + (t.data ? '<br><span class="chi">Una volta sola · ' + esc(dataBreve(t.data)) + '</span>' : '') + '</span><span class="chi">' + esc(chiTesto(t.chi)) + '</span></button>';
    });
    html += '<div class="azioni"><button class="btn primario" data-act="nuovo-compito">Nuovo compito</button></div>';
    return html;
  }

  function editorCompito(id, oggi) {
    const t = id ? D.compiti.find(x => x.id === id) : { id: null, t: '', n: '', da: '09:00', a: '09:30', chi: [D.profilo], g: [S.giorno], data: oggi ? iso(new Date()) : null };
    if (!t) return;
    const unaVolta = !!t.data;
    apriModale('<h2>' + (id ? 'Modifica compito' : 'Nuovo compito') + '</h2>' +
      '<div class="campi">' +
      '<label class="campo largo"><span>Che cosa</span><input id="ec-t" type="text" value="' + esc(t.t) + '" autocomplete="off"></label>' +
      '<label class="campo largo"><span>Nota (facoltativa)</span><input id="ec-n" type="text" value="' + esc(t.n) + '" autocomplete="off"></label>' +
      '<label class="campo"><span>Dalle</span><input id="ec-da" type="time" value="' + esc(t.da) + '"></label>' +
      '<label class="campo"><span>Alle</span><input id="ec-a" type="time" value="' + esc(t.a) + '"></label>' +
      '<div class="campo largo"><span>Chi</span><div class="scelte">' + ['m', 'a'].map(x => '<label class="scelta"><input type="checkbox" name="ec-chi" value="' + x + '"' + (t.chi.indexOf(x) > -1 ? ' checked' : '') + '><span>' + NOME[x] + '</span></label>').join('') + '</div></div>' +
      '<label class="campo largo"><span>Quando</span><select id="ec-rip"><option value="sett"' + (unaVolta ? '' : ' selected') + '>Ogni settimana, nei giorni scelti</option><option value="data"' + (unaVolta ? ' selected' : '') + '>Una volta sola</option></select></label>' +
      '<div class="campo largo" id="ec-giorni"' + (unaVolta ? ' hidden' : '') + '><span>Giorni</span><div class="scelte">' + TUTTI.map(g => '<label class="scelta"><input type="checkbox" name="ec-g" value="' + g + '"' + ((t.g || []).indexOf(g) > -1 ? ' checked' : '') + '><span>' + GIORNI[g] + '</span></label>').join('') + '</div></div>' +
      '<label class="campo largo" id="ec-data-box"' + (unaVolta ? '' : ' hidden') + '><span>Data</span><input id="ec-data" type="date" value="' + esc(t.data || iso(new Date())) + '"></label>' +
      '</div>' +
      '<div class="azioni"><button class="btn primario" data-mact="salva-compito" data-id="' + esc(id || '') + '">Salva</button>' +
      (id ? '<button class="btn pericolo" data-mact="elimina-compito" data-id="' + esc(id) + '">Elimina</button>' : '') +
      '<button class="btn" data-mact="chiudi">Annulla</button></div>');
  }

  /* =========================================================
     Viste: prepara (prodotti, piatti, menu, servizio)
     ========================================================= */
  function viewPrepara() {
    let html = testata('Prepara', 'Si imposta una volta sola, nell\'ordine: poi i preventivi si compilano da soli.');
    const passo = (n, titolo, testo, href) => '<a class="passo" href="' + href + '"><span class="num">' + n + '</span><span><b>' + esc(titolo) + '</b><br><span class="piccolo">' + esc(testo) + '</span></span><span class="freccia">›</span></a>';
    html += passo(1, 'Prodotti e prezzi', D.prodotti.length ? D.prodotti.length + ' prodotti' : 'Carica il backup del Magazzino o aggiungili a mano', '#prodotti');
    html += passo(2, 'Piatti', D.piatti.length ? D.piatti.length + ' piatti con gli ingredienti' : 'I piatti che fai di solito, con gli ingredienti per persona', '#piatti');
    html += passo(3, 'Menu', D.menu.length ? D.menu.length + ' menu' : 'Metti insieme i piatti: catering, pranzi aziendali, ceste', '#menu');
    html += passo(4, 'Servizio', D.servizio.allest.length + D.servizio.extra.length ? 'Personale, allestimento ed extra impostati' : 'Personale, allestimento ed extra', '#servizio');
    if (!D.prodotti.length && !D.piatti.length) {
      html += '<div class="pannello"><div class="etichetta">Per provare</div><p style="margin:0 0 10px">Carica dei dati inventati per vedere come funziona. Si cancellano con un tasto.</p><button class="btn scuro pieno" data-act="esempi">Carica i dati d\'esempio</button></div>';
    } else if (D.prodotti.some(x => x.origine === 'esempio')) {
      html += '<div class="pannello"><div class="etichetta">Dati d\'esempio</div><p style="margin:0 0 10px">Ci sono dati inventati nell\'app. Toglili prima di iniziare con quelli veri.</p><button class="btn pericolo pieno" data-act="togli-esempi">Togli i dati d\'esempio</button></div>';
    }
    return html;
  }

  function elencoProdotti() {
    const q = S.q.trim().toLowerCase();
    const lista = D.prodotti.filter(p => !q || p.nome.toLowerCase().indexOf(q) > -1).sort((a, b) => a.nome.localeCompare(b.nome, 'it')).slice(0, 80);
    if (!D.prodotti.length) return '<div class="vuoto">Nessun prodotto. Carica il backup del Magazzino oppure aggiungili a mano.</div>';
    if (!lista.length) return '<div class="vuoto">Nessun prodotto con questo nome.</div>';
    return lista.map(p => {
      const base = D.basePrezzo.cat;
      const mano = p.origine !== 'magazzino';
      const t = '<span><b>' + esc(p.nome) + '</b><br><span class="piccolo">' + esc(testoPrezzo(p, base)) + (p.manuale ? ' · scritto a mano' : '') + (p.origine === 'esempio' ? ' · esempio' : '') + '</span></span>';
      return mano ? '<button class="riga prod" data-act="apri-prodotto" data-id="' + esc(p.id) + '">' + t + '<span class="chi">Modifica</span></button>' : '<div class="riga prod">' + t + '<span class="chi">Magazzino</span></div>';
    }).join('') + (D.prodotti.length > 80 && !q ? '<p class="piccolo">Mostro i primi 80: cerca per nome per trovare gli altri.</p>' : '');
  }
  function viewProdotti() {
    let html = indietro('#prepara', 'Prepara') + testata('Prodotti e prezzi', 'I prezzi che contano per i preventivi.');
    html += '<p class="piccolo" style="margin-top:0">I prodotti del Magazzino si caricano dal suo backup (Magazzino → Impostazioni → Fai backup). Quelli che non ci sono, come la verdura del mercato, si aggiungono a mano.</p>';
    html += '<div class="azioni" style="margin:0 0 12px"><button class="btn primario" data-act="carica-magazzino">Carica il backup del Magazzino</button><button class="btn" data-act="nuovo-prodotto">Aggiungi a mano</button></div>';
    html += '<label class="campo" style="margin-bottom:12px"><span>Cerca</span><input id="q-prod" type="search" value="' + esc(S.q) + '" autocomplete="off" placeholder="Nome del prodotto"></label>';
    html += '<div id="lista-prod">' + elencoProdotti() + '</div>';
    return html;
  }
  function editorProdotto(id) {
    const p = id ? prodotto(id) : { id: null, nome: '', tipo: 'kg', acq: '' };
    if (!p) return;
    apriModale('<h2>' + (id ? 'Modifica prodotto' : 'Nuovo prodotto') + '</h2><div class="campi">' +
      '<label class="campo largo"><span>Nome</span><input id="ep-n" type="text" value="' + esc(p.nome) + '" autocomplete="off"></label>' +
      '<label class="campo"><span>Si compra al</span><select id="ep-t">' + [['kg', 'kg'], ['l', 'litro'], ['pz', 'pezzo']].map(x => '<option value="' + x[0] + '"' + (p.tipo === x[0] ? ' selected' : '') + '>' + x[1] + '</option>').join('') + '</select></label>' +
      '<label class="campo"><span>Prezzo (€)</span><input id="ep-p" type="number" inputmode="decimal" min="0" step="0.01" value="' + esc(p.acq == null ? '' : p.acq) + '"></label></div>' +
      '<div class="azioni"><button class="btn primario" data-mact="salva-prodotto" data-id="' + esc(id || '') + '">Salva</button>' +
      (id ? '<button class="btn pericolo" data-mact="elimina-prodotto" data-id="' + esc(id) + '">Elimina</button>' : '') +
      '<button class="btn" data-mact="chiudi">Annulla</button></div>');
  }

  function viewPiatti() {
    let html = indietro('#prepara', 'Prepara') + testata('Piatti', 'Gli ingredienti per persona, senza procedimento.');
    html += '<div class="azioni" style="margin:0 0 12px"><button class="btn primario" data-act="nuovo-piatto">Nuovo piatto</button></div>';
    if (!D.piatti.length) return html + '<div class="vuoto">Ancora nessun piatto.</div>';
    TIPI_PIATTO.forEach(([k, nome]) => {
      const l = D.piatti.filter(d => (d.tipo || 'altro') === k).sort((a, b) => a.nome.localeCompare(b.nome, 'it'));
      if (!l.length) return;
      html += '<div class="sezione">' + nome + '</div>';
      l.forEach(d => {
        const c = costoPiatto(d, D.basePrezzo.cat);
        html += '<button class="riga prod" data-act="apri-piatto" data-id="' + esc(d.id) + '"><span><b>' + esc(d.nome) + '</b><br><span class="piccolo">' + (d.ing || []).length + ' ingredienti' + (c.manca.length ? ' · prezzo mancante' : '') + '</span></span><span class="chi">' + EUR.format(c.c) + ' a testa</span></button>';
      });
    });
    return html;
  }
  function rigaIng(i) {
    const pr = i && prodotto(i.pid);
    return '<div class="ing-riga"><input class="in-nome" list="dl-prod" type="text" value="' + esc(pr ? pr.nome : '') + '" placeholder="Prodotto" autocomplete="off" aria-label="Prodotto">' +
      '<input class="in-q" type="text" inputmode="decimal" pattern="[0-9.,]*" value="' + esc(i ? i.q : '') + '" placeholder="Quanto" aria-label="Quantità per persona">' +
      '<select class="in-u" aria-label="Unità">' + ['g', 'kg', 'ml', 'l', 'pz', 'cucchiaio', 'cucchiaino'].map(u => '<option value="' + u + '"' + (i && i.u === u ? ' selected' : '') + '>' + (u === 'cucchiaio' ? 'cucchiai' : u === 'cucchiaino' ? 'cucchiaini' : u) + '</option>').join('') + '</select>' +
      '<button type="button" data-mact="togli-riga" aria-label="Togli ingrediente">✕</button></div>';
  }
  function editorPiatto(id) {
    const d = id ? piatto(id) : { id: null, nome: '', tipo: 'primo', ing: [] };
    if (!d) return;
    apriModale('<h2>' + (id ? 'Modifica piatto' : 'Nuovo piatto') + '</h2><div class="campi">' +
      '<label class="campo largo"><span>Nome del piatto</span><input id="pi-n" type="text" value="' + esc(d.nome) + '" autocomplete="off"></label>' +
      '<label class="campo largo"><span>Tipo</span><select id="pi-t">' + TIPI_PIATTO.map(x => '<option value="' + x[0] + '"' + ((d.tipo || 'altro') === x[0] ? ' selected' : '') + '>' + x[1].replace(/i$/, 'o').replace(/ori$/, 'ore') + '</option>').join('') + '</select></label></div>' +
      '<div class="sezione" style="margin-top:16px">Ingredienti per persona</div>' +
      '<datalist id="dl-prod">' + D.prodotti.map(p => '<option value="' + esc(p.nome) + '"></option>').join('') + '</datalist>' +
      '<div id="pi-righe">' + (d.ing || []).map(rigaIng).join('') + (d.ing && d.ing.length ? '' : rigaIng(null)) + '</div>' +
      '<div class="azioni" style="margin-top:8px"><button class="btn" data-mact="aggiungi-riga">Aggiungi ingrediente</button></div>' +
      '<p class="piccolo">Se scrivi un prodotto che non è in elenco, ti chiedo il prezzo.</p>' +
      '<div class="azioni"><button class="btn primario" data-mact="salva-piatto" data-id="' + esc(id || '') + '">Salva</button>' +
      (id ? '<button class="btn pericolo" data-mact="elimina-piatto" data-id="' + esc(id) + '">Elimina</button>' : '') +
      '<button class="btn" data-mact="chiudi">Annulla</button></div>');
  }

  function viewMenu() {
    let html = indietro('#prepara', 'Prepara') + testata('Menu', 'Piatti messi insieme, con il costo a persona.');
    html += '<div class="azioni" style="margin:0 0 12px"><button class="btn primario" data-act="nuovo-menu">Nuovo menu</button></div>';
    if (!D.menu.length) return html + '<div class="vuoto">Ancora nessun menu.' + (D.piatti.length ? '' : ' Crea prima qualche piatto.') + '</div>';
    Object.keys(TIPI).forEach(k => {
      const l = D.menu.filter(m => m.tipo === k);
      if (!l.length) return;
      html += '<div class="sezione">' + TIPI[k].nome + '</div>';
      l.forEach(m => {
        const c = costoMenu(m, D.basePrezzo[k]);
        html += '<button class="riga prod" data-act="apri-menu" data-id="' + esc(m.id) + '"><span><b>' + esc(m.nome) + '</b><br><span class="piccolo">' + (m.piatti || []).length + ' piatti' + (c.manca.length ? ' · prezzo mancante' : '') + '</span></span><span class="chi">' + EUR.format(c.pp) + ' a testa</span></button>';
      });
    });
    return html;
  }
  function editorMenu(id) {
    const m = id ? D.menu.find(x => x.id === id) : { id: null, nome: '', tipo: 'cat', piatti: [] };
    if (!m) return;
    let lista = '';
    TIPI_PIATTO.forEach(([k, nome]) => {
      const l = D.piatti.filter(d => (d.tipo || 'altro') === k).sort((a, b) => a.nome.localeCompare(b.nome, 'it'));
      if (!l.length) return;
      lista += '<div class="sezione" style="margin-top:12px">' + nome + '</div><div class="scelte">' + l.map(d => '<label class="scelta lungo"><input type="checkbox" name="mn-p" value="' + esc(d.id) + '"' + (m.piatti.indexOf(d.id) > -1 ? ' checked' : '') + '><span>' + esc(d.nome) + '</span></label>').join('') + '</div>';
    });
    apriModale('<h2>' + (id ? 'Modifica menu' : 'Nuovo menu') + '</h2><div class="campi">' +
      '<label class="campo largo"><span>Nome del menu</span><input id="mn-n" type="text" value="' + esc(m.nome) + '" autocomplete="off"></label>' +
      '<label class="campo largo"><span>Per quale preventivo</span><select id="mn-t">' + Object.keys(TIPI).map(k => '<option value="' + k + '"' + (m.tipo === k ? ' selected' : '') + '>' + TIPI[k].nome + '</option>').join('') + '</select></label></div>' +
      (lista || '<p class="piccolo">Non ci sono piatti: creali prima in Piatti.</p>') +
      '<div class="azioni"><button class="btn primario" data-mact="salva-menu" data-id="' + esc(id || '') + '">Salva</button>' +
      (id ? '<button class="btn pericolo" data-mact="elimina-menu" data-id="' + esc(id) + '">Elimina</button>' : '') +
      '<button class="btn" data-mact="chiudi">Annulla</button></div>');
  }

  function righeVoci(lista, k) {
    return D.servizio[lista].map((v, i) => '<div class="menu-riga"><input type="text" data-voce="' + lista + '" data-i="' + i + '" data-k="n" value="' + esc(v.n) + '" aria-label="Nome"><input type="number" inputmode="decimal" step="1" min="0" data-voce="' + lista + '" data-i="' + i + '" data-k="p" value="' + esc(v.p) + '" aria-label="Costo in euro"><button data-act="voce-togli" data-lista="' + lista + '" data-i="' + i + '" aria-label="Togli ' + esc(v.n) + '">✕</button></div>').join('') +
      '<button class="btn" data-act="voce-aggiungi" data-lista="' + lista + '">' + k + '</button>';
  }
  function viewServizio() {
    const P = D.servizio.pers;
    let html = indietro('#prepara', 'Prepara') + testata('Servizio', 'Quanto costano personale, allestimento ed extra.');
    html += '<div class="sezione">Personale (catering ed eventi)</div><div class="gruppo"><div class="campi">' +
      '<label class="campo"><span>Una persona ogni … ospiti</span><input id="sv-ogni" type="number" inputmode="numeric" min="1" value="' + esc(P.ogni) + '"></label>' +
      '<label class="campo"><span>Almeno … persone</span><input id="sv-min" type="number" inputmode="numeric" min="1" value="' + esc(P.min) + '"></label>' +
      '<label class="campo"><span>Ore di servizio</span><input id="sv-ore" type="number" inputmode="decimal" min="0" value="' + esc(P.ore) + '"></label>' +
      '<label class="campo"><span>Costo orario (€)</span><input id="sv-tar" type="number" inputmode="decimal" min="0" value="' + esc(P.tar) + '"></label></div>' +
      '<p class="piccolo" style="margin:0">Il personale si calcola da solo dal numero di ospiti.</p></div>';
    html += '<div class="sezione">Allestimento: cosa costa</div><div class="gruppo">' + righeVoci('allest', 'Aggiungi una voce') + '</div>';
    html += '<div class="sezione">Extra: cosa costa</div><div class="gruppo">' + righeVoci('extra', 'Aggiungi una voce') + '</div>';
    return html;
  }

  /* =========================================================
     Viste: preventivi
     ========================================================= */
  function viewPreventivi() {
    let html = testata('Preventivi', 'I conti si fanno da soli, dai prezzi e dai menu.');
    html += '<div class="azioni" style="margin:0 0 14px"><button class="btn primario" data-act="nuovo-prev">Nuovo preventivo</button></div>';
    const lista = D.preventivi.slice().sort((a, b) => b.creato - a.creato);
    if (!lista.length) return html + '<div class="vuoto">Ancora nessun preventivo salvato.</div>';
    lista.forEach(p => {
      const c = calcolaPrev(p), tot = p.tipo === 'pra' ? c.ricavo : c.totale, t = TIPI[p.tipo];
      html += '<button class="preventivo-riga" data-act="apri-prev" data-id="' + esc(p.id) + '"><b>' + esc(p.cliente || 'Senza nome') + '</b><span class="tot">' + EUR.format(tot) + (p.tipo === 'pra' ? '<span class="piccolo"> a settimana</span>' : '') + '</span>' +
        '<span class="piccolo">' + esc(t.nome) + (p.tipo !== 'pra' && p.evento ? ' · ' + esc(dataBreve(p.evento)) : '') + '</span><span class="piccolo"><span class="stato-tag ' + (p.stato === 'accettato' ? 'acc' : '') + '">' + (p.stato === 'accettato' ? 'ACCETTATO' : 'BOZZA') + '</span></span></button>';
    });
    return html;
  }

  function viewPrev() {
    const p = S.prev;
    if (!p) return viewPreventivi();
    const t = TIPI[p.tipo], menus = D.menu.filter(m => m.tipo === p.tipo);
    let html = indietro('#preventivi', 'Preventivi') + testata(S.prevNuovo ? 'Nuovo preventivo' : 'Preventivo', t.nome);
    html += '<div class="seg" role="group" aria-label="Tipo">' + Object.keys(TIPI).map(k => '<button data-act="tipo" data-tipo="' + k + '" aria-pressed="' + (k === p.tipo) + '">' + esc(TIPI[k].corto) + '</button>').join('') + '</div>';
    html += '<div class="campi"><label class="campo largo"><span>Cliente</span><input id="pv-cliente" type="text" value="' + esc(p.cliente) + '" autocomplete="off" placeholder="Nome o azienda"></label>';
    if (p.tipo !== 'pra') {
      html += '<label class="campo"><span>Numero di ' + esc(t.unita) + '</span><input id="pv-n" type="number" inputmode="numeric" min="1" value="' + esc(p.n) + '"></label>' +
        '<label class="campo"><span>Data</span><input id="pv-evento" type="date" value="' + esc(p.evento) + '"></label>';
    }
    html += '<label class="campo largo"><span>' + (p.tipo === 'ces' ? 'Pacchetto' : 'Menu') + '</span>' + (menus.length ? '<select id="pv-menu">' + menus.map(m => '<option value="' + esc(m.id) + '"' + (m.id === p.menuId ? ' selected' : '') + '>' + esc(m.nome) + '</option>').join('') + '</select>' : '<div class="stato avviso">Non c\'è ancora un menu per questo tipo. <a href="#menu">Crea un menu</a>.</div>') + '</label>';
    if (p.tipo === 'pra') {
      html += '<div class="campo largo"><span>Giorni di consegna</span><div class="scelte">' + TUTTI.map(g => '<label class="scelta"><input type="checkbox" id="pv-g-' + g + '"' + (p.giorni.indexOf(g) > -1 ? ' checked' : '') + '><span>' + GIORNI[g] + '</span></label>').join('') + '</div></div>' +
        TUTTI.map(g => '<label class="campo" id="pv-pb-' + g + '"><span>Pasti il ' + GIORNI[g] + '</span><input id="pv-pasti-' + g + '" type="number" inputmode="numeric" min="0" value="' + esc(p.pasti[g]) + '"></label>').join('') +
        '<label class="campo"><span>Per quante settimane</span><input id="pv-sett" type="number" inputmode="numeric" min="1" value="' + esc(p.settimane) + '"></label>' +
        '<label class="campo"><span>Ore di cucina al giorno</span><input id="pv-oc" type="number" inputmode="decimal" min="0" value="' + esc(p.oreCucina) + '"></label>' +
        '<label class="campo"><span>Consegna al giorno (€)</span><input id="pv-cons" type="number" inputmode="decimal" min="0" value="' + esc(p.consegna) + '"></label>';
    } else {
      html += '<label class="campo"><span>' + (p.tipo === 'cat' ? 'Ore di servizio' : 'Ore di lavoro') + '</span><input id="pv-ore" type="number" inputmode="decimal" min="0" value="' + esc(p.ore) + '"></label>';
      if (D.servizio.allest.length) html += '<div class="campo largo"><span>Allestimento</span><div class="scelte">' + D.servizio.allest.map(a => '<label class="scelta lungo"><input type="checkbox" id="pv-a-' + esc(a.id) + '"' + (p.allest.indexOf(a.id) > -1 ? ' checked' : '') + '><span>' + esc(a.n) + ' · ' + EUR.format(a.p) + '</span></label>').join('') + '</div></div>';
      if (D.servizio.extra.length) html += '<div class="campo largo"><span>Extra</span><div class="scelte">' + D.servizio.extra.map(a => '<label class="scelta lungo"><input type="checkbox" id="pv-e-' + esc(a.id) + '"' + (p.extra.indexOf(a.id) > -1 ? ' checked' : '') + '><span>' + esc(a.n) + ' · ' + EUR.format(a.p) + '</span></label>').join('') + '</div></div>';
      html += '<label class="campo"><span>Altri extra (€)</span><input id="pv-xm" type="number" inputmode="decimal" min="0" value="' + esc(p.extraMano) + '"></label>';
    }
    html += '<label class="campo"><span>Ricarico (%)</span><input id="pv-ric" type="number" inputmode="decimal" min="0" value="' + esc(p.ric) + '"></label>';
    if (p.tipo === 'pra') html += '<label class="campo largo"><span>Prezzo a pasto (€)</span><input id="pv-pp" type="number" inputmode="decimal" min="0" step="0.1"></label>';
    else {
      html += '<label class="campo"><span>' + (p.tipo === 'cat' ? 'Menu a persona (€)' : 'Prezzo a pezzo (€)') + '</span><input id="pv-ppm" type="number" inputmode="decimal" min="0" step="0.1"></label>' +
        '<label class="campo"><span>Servizio e allestimento (€)</span><input id="pv-forf" type="number" inputmode="decimal" min="0" step="10"></label>';
      if (p.tipo === 'cat') html += '<label class="campo largo"><span>Come lo vede il cliente</span><select id="pv-vista"><option value="diviso"' + (p.vista === 'diviso' ? ' selected' : '') + '>Due voci: menu e servizio</option><option value="unico"' + (p.vista === 'unico' ? ' selected' : '') + '>Un solo prezzo a persona</option></select></label>';
    }
    html += '</div><div class="azioni"><button class="btn" data-act="usa-proposto">Usa i prezzi proposti</button></div>';
    html += '<div class="pannello privato"><div class="etichetta">Solo per te · non va al cliente</div><div id="pv-costi"></div><div id="pv-margine"></div><div id="pv-conf"></div></div>';
    html += '<div class="pannello"><div class="etichetta">Documento per il cliente</div><div id="pv-doc"></div></div>';
    html += '<div class="pannello"><div class="etichetta">Ingredienti da ordinare</div><div id="pv-lista"></div></div>';
    if (p.tipo !== 'pra') html += '<div class="pannello"><div class="etichetta">Compiti dalla data</div><ul class="piano" id="pv-piano"></ul></div>';
    html += '<div class="azioni"><button class="btn primario" data-act="salva-prev">Salva</button><button class="btn scuro" data-act="pdf-prev">Crea PDF</button></div><div class="azioni"><button class="btn" data-act="condividi-prev">Condividi testo</button></div>';
    html += '<div class="azioni">' + (p.stato === 'accettato' ? '<span class="piccolo">Accettato' + (p.taskCreati ? ' · compiti creati' : '') + '</span>' : '<button class="btn" data-act="accetta-prev">' + (p.tipo === 'pra' ? 'Segna accettato' : 'Accettato: crea i compiti') + '</button>') +
      (!S.prevNuovo ? '<button class="btn pericolo" data-act="elimina-prev">Elimina</button>' : '') + '</div>';
    return html;
  }

  function leggiModuloPrev() {
    const p = S.prev; if (!p || !$('#pv-cliente')) return;
    p.cliente = $('#pv-cliente').value; p.ric = numero('pv-ric');
    const m = $('#pv-menu'); if (m) p.menuId = m.value;
    if (p.tipo === 'pra') {
      p.giorni = TUTTI.filter(g => $('#pv-g-' + g).checked);
      TUTTI.forEach(g => { p.pasti[g] = numero('pv-pasti-' + g); });
      p.settimane = numero('pv-sett') || 1; p.oreCucina = numero('pv-oc'); p.consegna = numero('pv-cons');
    } else {
      p.n = numero('pv-n') || 1; p.evento = $('#pv-evento').value; p.ore = numero('pv-ore'); p.extraMano = numero('pv-xm');
      p.allest = D.servizio.allest.filter(a => { const e = document.getElementById('pv-a-' + a.id); return e && e.checked; }).map(a => a.id);
      p.extra = D.servizio.extra.filter(a => { const e = document.getElementById('pv-e-' + a.id); return e && e.checked; }).map(a => a.id);
      const v = $('#pv-vista'); if (v) p.vista = v.value;
    }
  }
  function aggiornaPrev() {
    const p = S.prev; if (!p || !$('#pv-costi')) return;
    const t = TIPI[p.tipo], c = calcolaPrev(p), m = menuDi(p);
    const fuoco = id => document.activeElement && document.activeElement.id === id;
    if (p.tipo === 'pra') {
      TUTTI.forEach(g => { $('#pv-pb-' + g).hidden = p.giorni.indexOf(g) < 0; });
      if (!fuoco('pv-pp')) $('#pv-pp').value = String(p.pp == null ? c.prop : p.pp);
    } else {
      if (!fuoco('pv-ppm')) $('#pv-ppm').value = String(p.ppMenu == null ? c.propMenu : p.ppMenu);
      if (!fuoco('pv-forf')) $('#pv-forf').value = String(p.forfait == null ? c.propServ : p.forfait);
    }
    const manca = (!menuDi(p) ? '<div class="stato avviso">Scegli un menu: senza menu non posso calcolare il costo.</div>' : !(menuDi(p).piatti || []).length ? '<div class="stato avviso">Questo menu non ha piatti: aggiungili da Prepara → Menu.</div>' : '') +
      (c.mi.manca.length ? '<div class="stato avviso">Manca il prezzo (o l\'unità non torna) di: ' + esc(c.mi.manca.join(', ')) + '. Il costo è calcolato senza: correggilo da Prepara → Prodotti o nel piatto.</div>' : '');
    if (p.tipo === 'pra') {
      $('#pv-costi').innerHTML = manca +
        riga('Ingredienti (' + c.pasti + ' pasti a settimana)', EUR.format(c.ing)) + riga('Cucina (' + c.giorni.length + ' giorni × ' + (+p.oreCucina || 0) + ' ore)', EUR.format(c.lav)) + riga('Consegne', EUR.format(c.cons)) +
        riga('Costo a settimana', EUR.format(c.costo), true) + riga('Prezzo proposto (ricarico ' + c.ric + '%)', EUR.format(c.prop) + ' a pasto');
    } else {
      $('#pv-costi').innerHTML = manca +
        riga('Ingredienti (' + c.n + ' × ' + EUR.format(c.mi.pp) + ')', EUR.format(c.costoMenuTot)) +
        riga('Personale (' + c.staff + ' ' + (c.staff === 1 ? 'persona' : 'persone') + ' × ' + (+p.ore || 0) + ' ore)', EUR.format(c.pers)) +
        riga('Allestimento', EUR.format(c.allest)) + riga('Extra', EUR.format(c.extra)) +
        riga('Costo totale', EUR.format(c.costo), true) +
        riga('Proposto: menu', EUR.format(c.propMenu) + (p.tipo === 'cat' ? ' a persona' : ' a pezzo')) + riga('Proposto: servizio', EUR.format(c.propServ));
    }
    const sotto = p.tipo === 'pra' ? c.pp < c.prop : (c.ppMenu < c.propMenu || c.forfait < c.propServ);
    $('#pv-margine').innerHTML = '<div class="stato ' + (sotto ? 'avviso' : 'ok') + '"><strong>Margine ' + EUR.format(c.marg) + '</strong> (' + Math.round(c.pct) + '% del prezzo)<br>' +
      (sotto ? 'Almeno una voce è sotto il tuo ricarico del ' + c.ric + '%.' : 'Rispetta il tuo ricarico del ' + c.ric + '%.') + '</div>';
    if (t.rif) {
      const pp = c.ppMenu;
      const testo = pp < 86 ? 'Il menu è sotto la fascia media che abbiamo trovato nelle Marche (86-111 €).'
        : pp <= 111 ? 'Il menu è nella fascia media delle Marche (86-111 €).'
        : pp <= 150 ? 'Il menu è in fascia alta, da palazzo storico (110-150 € nei portali).'
        : pp <= 180 ? 'Il menu è molto alto: vale per servizi di grande cura (fino a circa 180 €).'
        : 'Il menu è sopra tutte le tariffe che abbiamo trovato.';
      $('#pv-conf').innerHTML = '<div class="stato neutro"><strong>Confronto con la zona</strong> (solo menu)<br>' + testo + '<br><span class="piccolo">Prezzi "da" dei portali dei matrimoni: una stima, non un listino.</span></div>';
    } else $('#pv-conf').innerHTML = '';
    $('#pv-doc').innerHTML = docCliente(p, c, m);
    const mult = p.tipo === 'pra' ? c.pasti : c.n;
    const li = listaIngredienti(m, mult, D.basePrezzo[p.tipo]);
    $('#pv-lista').innerHTML = !li.length ? '<span class="piccolo">Scegli un menu per vedere gli ingredienti.</span>' :
      (p.tipo === 'pra' ? '<div class="piccolo" style="margin-bottom:6px">Per una settimana.</div>' : '') + li.map(r => riga(esc(r.nome), esc(fmtQ(r.q, r.u)) + (r.manca ? ' · senza prezzo' : ''))).join('');
    const piano = $('#pv-piano');
    if (piano) {
      piano.innerHTML = '';
      const d0 = p.evento ? daIso(p.evento) : null;
      t.compiti.forEach(x => {
        const l = document.createElement('li'), q = document.createElement('span'), w = document.createElement('span');
        q.className = 'quando'; q.textContent = d0 ? dataBreve(iso(addDays(d0, x[0]))) : (x[0] === 0 ? 'Il giorno' : x[0] + ' giorni');
        w.textContent = x[1] + ' · ' + chiTesto(x[2]);
        l.appendChild(q); l.appendChild(w); piano.appendChild(l);
      });
    }
  }
  function docCliente(p, c, m) {
    const t = TIPI[p.tipo], nome = m ? esc(m.nome) : 'Menu';
    let h = '<strong>Preventivo · ' + esc(t.nome) + '</strong>' + (p.cliente ? '<div>' + esc(p.cliente) + '</div>' : '');
    if (p.tipo === 'pra') {
      h += riga(nome + ' · ' + c.pasti + ' pasti a settimana × ' + EUR.format(c.pp), EUR.format(c.ricavo)) + '<div class="piccolo">Giorni: ' + c.giorni.map(g => GIORNI[g]).join(', ') + '</div>' +
        riga('Per ' + (+p.settimane || 1) + ' settimane', EUR.format(c.periodo), true) + '<div class="piccolo">Circa ' + EUR.format(c.mese) + ' al mese. IVA da definire.</div>';
    } else if (p.tipo === 'cat' && p.vista === 'diviso') {
      h += riga(nome + ' · ' + c.n + ' ' + t.unita + ' × ' + EUR.format(c.ppMenu), EUR.format(c.ricavoMenu)) + riga('Servizio e allestimento', EUR.format(c.forfait)) + riga('Totale', EUR.format(c.totale), true) + '<div class="piccolo">IVA da definire.</div>';
    } else {
      h += riga(nome + ' · ' + c.n + ' ' + t.unita + ' × ' + EUR.format(c.unico), EUR.format(c.totUnico)) + '<div class="piccolo">Servizio e allestimento inclusi nel prezzo.</div>' + riga('Totale', EUR.format(c.totUnico), true) + '<div class="piccolo">IVA da definire.</div>';
    }
    return h;
  }
  function testoPrev(p) {
    const c = calcolaPrev(p), t = TIPI[p.tipo], m = menuDi(p), nome = m ? m.nome : 'Menu', r = ['Preventivo – ' + t.nome];
    if (p.cliente) r.push(p.cliente);
    if (p.tipo !== 'pra' && p.evento) r.push('Data: ' + dataLunga(p.evento));
    r.push('');
    if (p.tipo === 'pra') {
      r.push(nome + ': ' + c.pasti + ' pasti a settimana × ' + EUR.format(c.pp) + ' = ' + EUR.format(c.ricavo), 'Giorni: ' + c.giorni.map(g => GIORNI[g]).join(', '), 'Per ' + (+p.settimane || 1) + ' settimane: ' + EUR.format(c.periodo) + ' (IVA da definire)');
    } else if (p.tipo === 'cat' && p.vista === 'diviso') {
      r.push(nome + ': ' + c.n + ' ' + t.unita + ' × ' + EUR.format(c.ppMenu) + ' = ' + EUR.format(c.ricavoMenu), 'Servizio e allestimento: ' + EUR.format(c.forfait), 'Totale: ' + EUR.format(c.totale) + ' (IVA da definire)');
    } else {
      r.push(nome + ': ' + c.n + ' ' + t.unita + ' × ' + EUR.format(c.unico) + ' = ' + EUR.format(c.totUnico), 'Servizio e allestimento inclusi', 'Totale: ' + EUR.format(c.totUnico) + ' (IVA da definire)');
    }
    r.push('', 'La Spesa Sfusa');
    return r.join('\n');
  }
  function salvaPrev() {
    const p = S.prev; leggiModuloPrev();
    const i = D.preventivi.findIndex(x => x.id === p.id), copia = JSON.parse(JSON.stringify(p));
    if (i < 0) D.preventivi.push(copia); else D.preventivi[i] = copia;
    S.prevNuovo = false; salva();
  }
  function compitiDaCreare(p) {
    const oggi = iso(new Date()), t = TIPI[p.tipo], out = [];
    if (!p.evento || !t.compiti.length) return out;
    t.compiti.forEach(x => {
      const d = iso(addDays(daIso(p.evento), x[0]));
      if (d < oggi) return;
      out.push({ id: uid(), t: x[1] + ' · ' + (p.cliente || t.nome), n: '', da: x[0] === 0 ? '09:00' : '15:30', a: x[0] === 0 ? '13:00' : '17:00', chi: x[2], g: null, data: d });
    });
    return out;
  }

  /* =========================================================
     Viste: impostazioni
     ========================================================= */
  /* =========================================================
     PDF del preventivo (generato qui, senza librerie)
     ========================================================= */
  const HW = [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584];
  const CP = { 8364: 0x80, 8211: 0x96, 8212: 0x97, 8217: 0x92, 8216: 0x91, 8220: 0x93, 8221: 0x94, 8226: 0x95, 8230: 0x85 };
  const cod = ch => { const c = ch.charCodeAt(0); return CP[c] != null ? CP[c] : (c < 256 ? c : 63); };
  const larg = (s, pt, bold) => { let w = 0; for (let i = 0; i < s.length; i++) { const c = cod(s[i]); w += (c >= 32 && c <= 126) ? HW[c - 32] : 556; } return w * pt / 1000 * (bold ? 1.04 : 1); };
  const pdfStr = s => { let o = '('; for (let i = 0; i < s.length; i++) { const c = cod(s[i]); if (c === 40 || c === 92 || c === 41) o += '\\' + String.fromCharCode(c); else if (c < 32) o += ' '; else o += String.fromCharCode(c); } return o + ')'; };
  function spezza(s, pt, max, bold) {
    const out = []; let riga = '';
    String(s).split(' ').forEach(w => { const t = riga ? riga + ' ' + w : w; if (larg(t, pt, bold) > max && riga) { out.push(riga); riga = w; } else riga = t; });
    if (riga) out.push(riga); return out;
  }
  function caricaLogo(src) {
    return new Promise(res => {
      if (!src) return res(null);
      const im = new Image();
      im.onload = () => {
        const cv = document.createElement('canvas'); cv.width = im.naturalWidth; cv.height = im.naturalHeight;
        const x = cv.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, cv.width, cv.height); x.drawImage(im, 0, 0);
        const b = atob(cv.toDataURL('image/jpeg', 0.9).split(',')[1]), a = new Uint8Array(b.length);
        for (let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i);
        res({ w: cv.width, h: cv.height, dati: a });
      };
      im.onerror = () => res(null); im.src = src;
    });
  }
  function righePdf(p) {
    const c = calcolaPrev(p), t = TIPI[p.tipo], m = menuDi(p), nome = m ? m.nome : 'Menu', R = [];
    if (p.tipo === 'pra') {
      R.push([nome + ' · ' + c.pasti + ' pasti a settimana × ' + EUR.format(c.pp), EUR.format(c.ricavo)]);
      R.push(['Giorni di consegna: ' + c.giorni.map(g => GIORNI[g]).join(', '), '', 'nota']);
      R.push(['Totale per ' + (+p.settimane || 1) + ' settimane', EUR.format(c.periodo), 'tot']);
      R.push(['Circa ' + EUR.format(c.mese) + ' al mese', '', 'nota']);
    } else if (p.tipo === 'cat' && p.vista === 'diviso') {
      R.push([nome + ' · ' + c.n + ' ' + t.unita + ' × ' + EUR.format(c.ppMenu), EUR.format(c.ricavoMenu)]);
      R.push(['Servizio e allestimento', EUR.format(c.forfait)]);
      R.push(['Totale', EUR.format(c.totale), 'tot']);
    } else {
      R.push([nome + ' · ' + c.n + ' ' + t.unita + ' × ' + EUR.format(c.unico), EUR.format(c.totUnico)]);
      R.push(['Servizio e allestimento inclusi nel prezzo', '', 'nota']);
      R.push(['Totale', EUR.format(c.totUnico), 'tot']);
    }
    return R;
  }
  const LOGO_PREDEF = 'logo.jpg';
  async function creaPdf(p) {
    const A = D.azienda || {}, W = 595, H = 842, M = 48, logo = await caricaLogo(A.logo || LOGO_PREDEF);
    let s = ''; let y = H - M;
    const col = (r, g, b) => (r / 255).toFixed(3) + ' ' + (g / 255).toFixed(3) + ' ' + (b / 255).toFixed(3);
    const testo = (x, yy, str, pt, bold, c) => { s += 'BT /' + (bold ? 'F2' : 'F1') + ' ' + pt + ' Tf ' + col.apply(null, c || [20, 30, 45]) + ' rg ' + x.toFixed(1) + ' ' + yy.toFixed(1) + ' Td ' + pdfStr(str) + ' Tj ET\n'; };
    const destra = (xr, yy, str, pt, bold, c) => testo(xr - larg(str, pt, bold), yy, str, pt, bold, c);
    const linea = (yy, c, sp) => { s += col.apply(null, c || [200, 208, 220]) + ' RG ' + (sp || 0.7) + ' w ' + M + ' ' + yy.toFixed(1) + ' m ' + (W - M) + ' ' + yy.toFixed(1) + ' l S\n'; };
    // intestazione
    let xT = M, altLogo = 0;
    if (logo) { const k = Math.min(140 / logo.w, 66 / logo.h), lw = logo.w * k, lh = logo.h * k; altLogo = lh; s += 'q ' + lw.toFixed(1) + ' 0 0 ' + lh.toFixed(1) + ' ' + M + ' ' + (y - lh).toFixed(1) + ' cm /Im1 Do Q\n'; xT = M + lw + 20; }
    let yT = y - 14;
    testo(xT, yT, A.nome || 'La Spesa Sfusa', 13, true, [16, 36, 62]); yT -= 15;
    [A.indirizzo, [A.tel && 'Tel. ' + A.tel, A.email].filter(Boolean).join('  ·  '), [A.piva && 'P.IVA ' + A.piva, A.pec && 'PEC ' + A.pec].filter(Boolean).join('  ·  ')].filter(Boolean).forEach(r => { testo(xT, yT, r, 9.5, false, [90, 100, 115]); yT -= 12.5; });
    y = Math.min(y - altLogo, yT) - 14; linea(y, [16, 36, 62], 1.6); y -= 34;
    // titolo
    const t = TIPI[p.tipo], oggi = new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
    testo(M, y, 'PREVENTIVO', 22, true, [16, 36, 62]); destra(W - M, y + 2, 'del ' + oggi, 10.5, false, [90, 100, 115]); y -= 20;
    testo(M, y, t.nome, 11, false, [90, 100, 115]); y -= 30;
    const campo = (et, val) => { if (!val) return; testo(M, y, et, 8.5, true, [90, 100, 115]); testo(M + 80, y, val, 11); y -= 18; };
    campo('CLIENTE', p.cliente);
    if (p.tipo !== 'pra' && p.evento) campo('DATA', dataLunga(p.evento));
    const m = menuDi(p);
    y -= 10;
    // tabella
    s += col(16, 36, 62) + ' rg ' + M + ' ' + (y - 6) + ' ' + (W - 2 * M) + ' 22 re f\n';
    testo(M + 10, y, 'DESCRIZIONE', 8.5, true, [255, 255, 255]); destra(W - M - 10, y, 'IMPORTO', 8.5, true, [255, 255, 255]); y -= 30;
    righePdf(p).forEach(r => {
      const tot = r[2] === 'tot', nota = r[2] === 'nota';
      if (tot) { y -= 4; linea(y + 14, [16, 36, 62], 1); }
      spezza(r[0], nota ? 9.5 : 11.5, W - 2 * M - 130, tot).forEach(rg => { testo(M + 10, y, rg, nota ? 9.5 : (tot ? 13 : 11.5), tot, nota ? [90, 100, 115] : null); if (r[1]) { destra(W - M - 10, y, r[1], tot ? 14 : 11.5, tot); r[1] = ''; } y -= tot ? 20 : 17; });
      if (!tot && !nota) { linea(y + 10); y -= 6; }
    });
    // composizione del menu
    const piatti = ((m && m.piatti) || []).map(id => piatto(id)).filter(Boolean);
    if (piatti.length) {
      y -= 18; testo(M, y, 'COMPOSIZIONE DEL MENU', 8.5, true, [90, 100, 115]); y -= 6; linea(y, null, 0.7); y -= 16;
      piatti.forEach(d => { if (y < 110) return; testo(M + 4, y, '•  ' + d.nome, 10.5); y -= 15; });
    }
    // note
    const note = [p.tipo === 'pra' ? 'Prezzi per pasto consegnato. IVA da definire.' : 'IVA da definire.', 'Preventivo valido 30 giorni dalla data di emissione.'];
    if (p.note) note.unshift(p.note);
    let yn = 92; linea(yn + 14);
    note.forEach(n => spezza(n, 9, W - 2 * M, false).forEach(rg => { testo(M, yn, rg, 9, false, [90, 100, 115]); yn -= 12; }));
    // assemblaggio
    const enc = new TextEncoder(), parti = [], off = []; let len = 0;
    const put = x => { const b = typeof x === 'string' ? Uint8Array.from(x, ch => ch.charCodeAt(0) & 255) : x; parti.push(b); len += b.length; };
    const oggetto = (n, corpo, bin) => { off[n] = len; put(n + ' 0 obj\n'); put(corpo); if (bin) { put(bin); put('\nendstream'); } put('\nendobj\n'); };
    put('%PDF-1.4\n');
    oggetto(1, '<< /Type /Catalog /Pages 2 0 R >>'); oggetto(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    oggetto(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + W + ' ' + H + '] /Resources << /Font << /F1 4 0 R /F2 5 0 R >>' + (logo ? ' /XObject << /Im1 7 0 R >>' : '') + ' >> /Contents 6 0 R >>');
    oggetto(4, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'); oggetto(5, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
    const sb = Uint8Array.from(s, ch => ch.charCodeAt(0) & 255);
    oggetto(6, '<< /Length ' + sb.length + ' >>\nstream\n', sb);
    let n = 7;
    if (logo) oggetto(7, '<< /Type /XObject /Subtype /Image /Width ' + logo.w + ' /Height ' + logo.h + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + logo.dati.length + ' >>\nstream\n', logo.dati), n = 8;
    const xr = len; put('xref\n0 ' + n + '\n0000000000 65535 f \n'); for (let i = 1; i < n; i++) put(String(off[i]).padStart(10, '0') + ' 00000 n \n');
    put('trailer\n<< /Size ' + n + ' /Root 1 0 R >>\nstartxref\n' + xr + '\n%%EOF');
    return new Blob(parti, { type: 'application/pdf' });
  }
  async function pdfPrev(p) {
    const blob = await creaPdf(p), nome = 'Preventivo' + (p.cliente ? ' ' + p.cliente.replace(/[^\wÀ-ÿ ]/g, '').trim() : '') + '.pdf';
    const file = new File([blob], nome, { type: 'application/pdf' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: nome }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nome; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 20000); toast('PDF pronto');
  }

  function viewImpostazioni() {
    let html = testata('Impostazioni', '');
    html += '<div class="sezione">Questo telefono</div><div class="gruppo"><div class="seg" style="margin:0" role="group" aria-label="Chi usa questo telefono">' +
      ['m', 'a'].map(x => '<button data-act="profilo" data-p="' + x + '" aria-pressed="' + (D.profilo === x) + '">' + NOME[x] + '</button>').join('') + '</div></div>';
    html += '<div class="sezione">Preventivi</div><div class="gruppo"><div class="campi"><label class="campo largo"><span>Ricarico predefinito (%)</span><input id="st-ric" type="number" inputmode="decimal" min="0" value="' + esc(D.ricarico) + '"></label></div>' +
      '<div class="piccolo">Quale prezzo contano gli ingredienti:</div>' +
      Object.keys(TIPI).map(k => '<label class="campo"><span>' + TIPI[k].nome + '</span><select data-base="' + k + '">' + BASI.map(b => '<option value="' + b[0] + '"' + (D.basePrezzo[k] === b[0] ? ' selected' : '') + '>' + b[1] + '</option>').join('') + '</select></label>').join('') + '</div>';
    const Z = D.azienda, cz = (k, et, tp) => '<label class="campo largo"><span>' + et + '</span><input data-az="' + k + '" type="' + (tp || 'text') + '" value="' + esc(Z[k] || '') + '"></label>';
    html += '<div class="sezione">Intestazione dei preventivi</div><div class="gruppo"><div class="campi">' + cz('nome', 'Nome del negozio') + cz('indirizzo', 'Indirizzo') + cz('tel', 'Telefono', 'tel') + cz('email', 'Email', 'email') + cz('piva', 'Partita IVA') + cz('pec', 'PEC', 'email') + '</div>' +
      (Z.logo ? '<img src="' + Z.logo + '" alt="Logo" style="max-width:120px;max-height:120px;display:block;margin:10px 0;border-radius:8px">' : '') +
      '<button class="btn" data-act="logo">' + (Z.logo ? 'Cambia il logo' : 'Scegli la foto del logo') + '</button>' + (Z.logo ? '<button class="btn" data-act="logo-togli">Togli il logo</button>' : '') + '</div>';
    const supporta = 'Notification' in window;
    html += '<div class="sezione">Avvisi</div><div class="gruppo"><p class="piccolo" style="margin:0">Un avviso 10 minuti prima di ogni compito. Per ora arriva mentre l\'app è aperta; per averlo anche ad app chiusa serve il collegamento al server del negozio, che si aggiunge dopo.</p>' +
      (supporta ? '<button class="btn ' + (D.notifiche ? '' : 'primario') + '" data-act="notifiche">' + (D.notifiche ? 'Avvisi accesi: spegni' : 'Accendi gli avvisi') + '</button>' : '<p class="piccolo" style="margin:0">Questo telefono non supporta gli avvisi.</p>') + '</div>';
    html += '<div class="sezione">Copia di sicurezza</div><div class="gruppo"><button class="btn" data-act="backup">Salva backup</button><button class="btn" data-act="ripristina">Carica un backup</button><button class="btn pericolo" data-act="ripristina-compiti">Rimetti i compiti iniziali</button></div>';
    html += '<p class="piccolo" style="margin-top:18px">Lavoro 1.4.1 · i dati restano su questo telefono.</p>';
    return html;
  }

  /* =========================================================
     Dati d'esempio
     ========================================================= */
  function caricaEsempi() {
    const pr = (nome, tipo, p) => ({ id: 'e_' + uid(), nome, tipo, acq: p, iva: 0, ven: p, conf: null, manuale: true, origine: 'esempio' });
    const P = {}; [['Pasta secca', 'kg', 2.2], ['Riso', 'kg', 2.8], ['Farina 00', 'kg', 1.1], ['Olio extravergine', 'l', 9.5], ['Passata di pomodoro', 'kg', 1.6], ['Pollo', 'kg', 6.5], ['Arrosto di maiale', 'kg', 8], ['Patate', 'kg', 1], ['Zucchine', 'kg', 2.2], ['Parmigiano', 'kg', 16], ['Mozzarella', 'kg', 8.5], ['Uova', 'pz', 0.3], ['Burro', 'kg', 9], ['Zucchero', 'kg', 1.3], ['Frutta di stagione', 'kg', 2.5], ['Pane', 'kg', 3], ['Miele', 'kg', 10], ['Biscotti', 'kg', 6], ['Frutta secca', 'kg', 11], ['Cesto di vimini', 'pz', 4], ['Nastro e carta', 'pz', 1.5]]
      .forEach(x => { P[x[0]] = pr(x[0], x[1], x[2]); });
    D.prodotti = D.prodotti.concat(Object.values(P));
    const pi = (nome, tipo, ing) => ({ id: 'e_' + uid(), nome, tipo, ing: ing.map(i => ({ pid: P[i[0]].id, q: i[1], u: i[2] })), esempio: true });
    const A = pi('Tagliere di formaggi e pane', 'antipasto', [['Parmigiano', 40, 'g'], ['Mozzarella', 40, 'g'], ['Pane', 50, 'g'], ['Miele', 5, 'g']]);
    const L = pi('Lasagne', 'primo', [['Farina 00', 40, 'g'], ['Uova', 0.5, 'pz'], ['Passata di pomodoro', 80, 'g'], ['Mozzarella', 40, 'g'], ['Parmigiano', 15, 'g']]);
    const T = pi('Pasta al pomodoro', 'primo', [['Pasta secca', 80, 'g'], ['Passata di pomodoro', 100, 'g'], ['Olio extravergine', 10, 'ml'], ['Parmigiano', 10, 'g']]);
    const R = pi('Arrosto di maiale', 'secondo', [['Arrosto di maiale', 150, 'g'], ['Olio extravergine', 8, 'ml']]);
    const K = pi('Pollo al forno', 'secondo', [['Pollo', 200, 'g'], ['Olio extravergine', 8, 'ml']]);
    const N = pi('Patate al forno', 'contorno', [['Patate', 200, 'g'], ['Olio extravergine', 10, 'ml']]);
    const Z = pi('Zucchine trifolate', 'contorno', [['Zucchine', 150, 'g'], ['Olio extravergine', 8, 'ml']]);
    const F = pi('Frutta di stagione', 'dolce', [['Frutta di stagione', 150, 'g']]);
    const O = pi('Torta della casa', 'dolce', [['Farina 00', 30, 'g'], ['Zucchero', 25, 'g'], ['Burro', 20, 'g'], ['Uova', 0.4, 'pz']]);
    const C = pi('Cesta base', 'altro', [['Cesto di vimini', 1, 'pz'], ['Frutta secca', 150, 'g'], ['Miele', 100, 'g'], ['Biscotti', 200, 'g'], ['Nastro e carta', 1, 'pz']]);
    D.piatti = D.piatti.concat([A, L, T, R, K, N, Z, F, O, C]);
    const mn = (nome, tipo, l) => ({ id: 'e_' + uid(), nome, tipo, piatti: l.map(x => x.id), esempio: true });
    D.menu = D.menu.concat([mn('Cena servita', 'cat', [A, L, R, N, O]), mn('Pranzo del giorno', 'pra', [T, K, Z, F]), mn('Cesta base', 'ces', [C])]);
    if (!D.servizio.allest.length) D.servizio.allest = [{ id: 'e_' + uid(), n: 'Tavoli, tovaglie e stoviglie', p: 150 }, { id: 'e_' + uid(), n: 'Centrotavola', p: 80 }, { id: 'e_' + uid(), n: 'Luci e candele', p: 60 }];
    if (!D.servizio.extra.length) D.servizio.extra = [{ id: 'e_' + uid(), n: 'Trasporto', p: 50 }, { id: 'e_' + uid(), n: 'Noleggio attrezzatura', p: 120 }];
    salva();
  }
  function togliEsempi() {
    const ids = new Set(D.prodotti.filter(p => p.origine === 'esempio').map(p => p.id));
    D.prodotti = D.prodotti.filter(p => !ids.has(p.id));
    D.piatti = D.piatti.filter(d => !d.esempio);
    D.menu = D.menu.filter(m => !m.esempio);
    D.servizio.allest = D.servizio.allest.filter(a => String(a.id).indexOf('e_') !== 0);
    D.servizio.extra = D.servizio.extra.filter(a => String(a.id).indexOf('e_') !== 0);
    D.preventivi = D.preventivi.filter(p => !(menuDi(p) === undefined && p.menuId && String(p.menuId).indexOf('e_') === 0));
    salva();
  }

  /* =========================================================
     Routing
     ========================================================= */
  const PAGINE = { oggi: viewOggi, settimana: viewSettimana, preventivi: viewPreventivi, prepara: viewPrepara, prodotti: viewProdotti, piatti: viewPiatti, menu: viewMenu, servizio: viewServizio, impostazioni: viewImpostazioni };
  const TAB = { prodotti: 'prepara', piatti: 'prepara', menu: 'prepara', servizio: 'prepara', prev: 'preventivi' };
  function render() {
    const h = (location.hash || '#oggi').slice(1), parti = h.split('/'), pg = parti[0];
    const nav = $('#nav');
    let html, tab = TAB[pg] || pg;
    if (!D.profilo) { html = viewScelta(); nav.hidden = true; }
    else {
      nav.hidden = false;
      if (pg === 'prev') {
        if (parti[1] === 'nuovo') { if (!S.prev || !S.prevNuovo) { S.prev = nuovoPrev('cat'); S.prevNuovo = true; } }
        else { const f = D.preventivi.find(x => x.id === parti[1]); if (f && (!S.prev || S.prev.id !== f.id)) { S.prev = JSON.parse(JSON.stringify(f)); S.prevNuovo = false; } }
        html = viewPrev();
      } else if (PAGINE[pg]) html = PAGINE[pg]();
      else { tab = 'oggi'; html = viewOggi(); }
    }
    const chiave = pg + '/' + (parti[1] || '');
    $('#view').innerHTML = html;
    document.querySelectorAll('.nav a').forEach(a => { if (a.dataset.tab === tab) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    if (chiave !== paginaPrima) { window.scrollTo(0, 0); paginaPrima = chiave; }
    if (pg === 'prev') aggiornaPrev();
  }
  window.addEventListener('hashchange', render);

  /* =========================================================
     Azioni
     ========================================================= */
  let fileMode = 'lavoro';
  function chiediPrezzi() {
      apriModale('<h2>Quanto costano?</h2><p class="piccolo">Questi ingredienti non sono in elenco. Scrivi il prezzo e li aggiungo.</p>' +
        pendente.ignoti.map((x, i) => '<div class="menu-riga nuovo"><span><b>' + esc(x.nome) + '</b></span><input id="np-p-' + i + '" type="number" inputmode="decimal" min="0" step="0.01" placeholder="Prezzo €" aria-label="Prezzo di ' + esc(x.nome) + '"><select id="np-t-' + i + '" aria-label="Al">' + [['kg', 'al kg'], ['l', 'al litro'], ['pz', 'al pezzo']].map(o => '<option value="' + o[0] + '"' + (o[0] === (x.u === 'g' ? 'kg' : x.u === 'ml' ? 'l' : 'pz') ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select></div>').join('') +
        '<div class="azioni"><button class="btn primario" data-mact="prezzi-nuovi">Salva piatto</button><button class="btn" data-mact="chiudi">Annulla</button></div>');

  }
  function chiediPesi() {
    apriModale('<h2>Quanto pesa la confezione?</h2><p class="piccolo">In Magazzino queste confezioni sono contate a pezzi. Scrivi una volta quanto pesa o quanto contiene una confezione: il piatto lo usa per calcolare il costo.</p>' +
      pendente.senzaPeso.map((x, i) => '<div class="menu-riga nuovo"><span><b>' + esc(x.nome) + '</b><br><span class="piccolo">1 confezione =</span></span><input id="pw-q-' + i + '" type="text" inputmode="decimal" placeholder="Quanto" aria-label="Peso di ' + esc(x.nome) + '"><select id="pw-u-' + i + '" aria-label="Unità">' + ['g', 'kg', 'ml', 'l'].map(u => '<option value="' + u + '"' + ((u === 'g' && x.u !== 'ml') || u === x.u ? ' selected' : '') + '>' + u + '</option>').join('') + '</select></div>').join('') +
      '<div class="azioni"><button class="btn primario" data-mact="salva-pesi">Continua</button><button class="btn" data-mact="chiudi">Annulla</button></div>');
  }
  const AZ = {
    scegli(b) { D.profilo = b.dataset.p; salva(); location.hash = '#oggi'; render(); },
    profilo(b) { D.profilo = b.dataset.p; salva(); render(); toast('Questo telefono mostra i compiti di ' + NOME[D.profilo]); },
    spunta(b) {
      const k = chiaveFatto(iso(new Date()), b.dataset.id, D.profilo);
      if (D.fatti[k]) delete D.fatti[k]; else D.fatti[k] = 1;
      salva(); render();
    },
    giorno(b) { S.giorno = +b.dataset.g; render(); },
    filtro(b) { S.chi = b.dataset.f; render(); },
    'nuovo-compito'() { editorCompito(null); },
    'nuovo-oggi'() { editorCompito(null, true); },
    'apri-compito'(b) { editorCompito(b.dataset.id); },
    esempi() { caricaEsempi(); render(); toast('Dati d\'esempio caricati'); },
    'togli-esempi'() { togliEsempi(); render(); toast('Dati d\'esempio tolti'); },
    'carica-magazzino'() { fileMode = 'magazzino'; $('#fileInput').click(); },
    'nuovo-prodotto'() { editorProdotto(null); },
    'apri-prodotto'(b) { editorProdotto(b.dataset.id); },
    'nuovo-piatto'() { editorPiatto(null); },
    'apri-piatto'(b) { editorPiatto(b.dataset.id); },
    'nuovo-menu'() { editorMenu(null); },
    'apri-menu'(b) { editorMenu(b.dataset.id); },
    'voce-aggiungi'(b) { D.servizio[b.dataset.lista].push({ id: uid(), n: 'Nuova voce', p: 0 }); salva(); render(); },
    'voce-togli'(b) { D.servizio[b.dataset.lista].splice(+b.dataset.i, 1); salva(); render(); },
    'nuovo-prev'() { S.prev = nuovoPrev('cat'); S.prevNuovo = true; location.hash = '#prev/nuovo'; render(); },
    'apri-prev'(b) { S.prev = null; location.hash = '#prev/' + b.dataset.id; },
    tipo(b) {
      const prima = S.prev; leggiModuloPrev();
      S.prev = Object.assign(nuovoPrev(b.dataset.tipo), { id: prima.id, cliente: prima.cliente, creato: prima.creato });
      render();
    },
    'usa-proposto'() { S.prev.ppMenu = null; S.prev.forfait = null; S.prev.pp = null; aggiornaPrev(); },
    'salva-prev'() {
      leggiModuloPrev();
      if (!S.prev.menuId) { toast('Scegli un menu prima di salvare'); return; }
      salvaPrev(); toast('Preventivo salvato'); location.hash = '#prev/' + S.prev.id; render();
    },
    'pdf-prev'() { leggiModuloPrev(); if (!S.prev.menuId) { toast('Scegli un menu prima'); return; } pdfPrev(S.prev).catch(() => toast('Non riesco a creare il PDF')); },
    'logo'() { fileMode = 'logo'; $('#fileInput').click(); },
    'logo-togli'() { D.azienda.logo = ''; salva(); render(); },
    'condividi-prev'() {
      leggiModuloPrev(); const testo = testoPrev(S.prev);
      if (navigator.share) { navigator.share({ text: testo }).catch(() => { }); return; }
      copiaTesto(testo).then(ok => toast(ok ? 'Testo copiato: incollalo in WhatsApp' : 'Non riesco a copiare: seleziona il testo a mano'));
    },
    'accetta-prev'() {
      leggiModuloPrev();
      if (S.prev.tipo === 'pra') {
        apriModale('<h2>Segnare il preventivo accettato?</h2><p>I pranzi aziendali non creano compiti: la cucina e la consegna sono già nei compiti di ogni giorno.</p><div class="azioni"><button class="btn primario" data-mact="crea-compiti">Segna accettato</button><button class="btn" data-mact="chiudi">Annulla</button></div>');
        return;
      }
      const lista = compitiDaCreare(S.prev);
      if (!S.prev.evento) { toast('Scrivi prima la data'); return; }
      apriModale('<h2>Crea questi compiti?</h2>' + (lista.length ? '<ul class="piano">' + lista.map(t => '<li><span class="quando">' + esc(dataBreve(t.data)) + '</span><span>' + esc(t.t) + ' · ' + esc(chiTesto(t.chi)) + '</span></li>').join('') + '</ul>' : '<p>Le date sono già passate: nessun compito da creare.</p>') +
        '<div class="azioni"><button class="btn primario" data-mact="crea-compiti">' + (lista.length ? 'Crea e segna accettato' : 'Segna accettato') + '</button><button class="btn" data-mact="chiudi">Annulla</button></div>');
    },
    'elimina-prev'() {
      apriModale('<h2>Eliminare il preventivo?</h2><p>Non si può annullare.</p><div class="azioni"><button class="btn pericolo" data-mact="conferma-elimina-prev">Elimina</button><button class="btn" data-mact="chiudi">Annulla</button></div>');
    },
    notifiche() {
      if (D.notifiche) { D.notifiche = false; salva(); render(); toast('Avvisi spenti'); return; }
      Notification.requestPermission().then(r => {
        D.notifiche = r === 'granted'; salva(); render();
        toast(D.notifiche ? 'Avvisi accesi' : 'Permesso negato: abilitalo dalle impostazioni del telefono');
      });
    },
    backup() {
      const nome = 'lavoro-backup-' + iso(new Date()) + '.json', testo = JSON.stringify(D, null, 1);
      const file = new File([testo], nome, { type: 'application/json' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) { navigator.share({ files: [file], title: nome }).catch(() => { }); return; }
      const a = document.createElement('a'); a.href = URL.createObjectURL(file); a.download = nome; document.body.appendChild(a); a.click(); a.remove();
      toast('Backup salvato');
    },
    ripristina() { fileMode = 'lavoro'; $('#fileInput').click(); },
    'ripristina-compiti'() {
      apriModale('<h2>Rimettere i compiti iniziali?</h2><p>I compiti che hai cambiato o aggiunto vanno persi. Le spunte, i menu e i preventivi restano.</p><div class="azioni"><button class="btn pericolo" data-mact="conferma-ripristina-compiti">Rimetti</button><button class="btn" data-mact="chiudi">Annulla</button></div>');
    }
  };
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (b && AZ[b.dataset.act]) { e.preventDefault(); AZ[b.dataset.act](b); return; }
    const m = e.target.closest('[data-mact]');
    if (m && MAZ[m.dataset.mact]) MAZ[m.dataset.mact](m);
  });

  function finisciPiatto(piattoNuovo) {
    const i = D.piatti.findIndex(x => x.id === piattoNuovo.id);
    if (i < 0) D.piatti.push(piattoNuovo); else D.piatti[i] = piattoNuovo;
    pendente = null; salva(); chiudiModale(); render(); toast('Piatto salvato');
  }
  const MAZ = {
    chiudi() { pendente = null; chiudiModale(); },
    'salva-compito'(b) {
      const id = b.dataset.id || null;
      const t = $('#ec-t').value.trim(), da = $('#ec-da').value, a = $('#ec-a').value;
      const chi = [...document.querySelectorAll('input[name="ec-chi"]:checked')].map(x => x.value);
      const una = $('#ec-rip').value === 'data';
      const g = [...document.querySelectorAll('input[name="ec-g"]:checked')].map(x => +x.value);
      const data = $('#ec-data').value;
      if (!t) { toast('Scrivi che cosa c\'è da fare'); return; }
      if (!da || !a || minuti(a) <= minuti(da)) { toast('L\'ora di fine deve essere dopo quella di inizio'); return; }
      if (!chi.length) { toast('Scegli chi lo fa'); return; }
      if (una ? !data : !g.length) { toast(una ? 'Scegli la data' : 'Scegli almeno un giorno'); return; }
      const nuovo = { id: id || uid(), t, n: $('#ec-n').value.trim(), da, a, chi, g: una ? null : g, data: una ? data : null };
      const i = D.compiti.findIndex(x => x.id === id);
      if (i < 0) D.compiti.push(nuovo); else D.compiti[i] = nuovo;
      salva(); chiudiModale(); render(); toast('Compito salvato');
    },
    'elimina-compito'(b) { D.compiti = D.compiti.filter(x => x.id !== b.dataset.id); salva(); chiudiModale(); render(); toast('Compito eliminato'); },
    'salva-prodotto'(b) {
      const id = b.dataset.id || null, nome = $('#ep-n').value.trim(), prezzo = numero('ep-p'), tipo = $('#ep-t').value;
      if (!nome) { toast('Scrivi il nome'); return; }
      if (!(prezzo > 0)) { toast('Scrivi il prezzo'); return; }
      const nuovo = { id: id || 'x_' + uid(), nome, tipo, acq: prezzo, iva: 0, ven: prezzo, conf: null, manuale: true, origine: id && prodotto(id) ? prodotto(id).origine : 'mano' };
      const i = D.prodotti.findIndex(x => x.id === id);
      if (i < 0) D.prodotti.push(nuovo); else D.prodotti[i] = nuovo;
      salva(); chiudiModale(); render(); toast('Prodotto salvato');
    },
    'elimina-prodotto'(b) {
      const id = b.dataset.id, usato = D.piatti.some(d => (d.ing || []).some(i => i.pid === id));
      if (usato) {
        const nomi = D.piatti.filter(d => (d.ing || []).some(i => i.pid === id)).map(d => d.nome);
        apriModale('<h2>Eliminare il prodotto?</h2><p>È un ingrediente di: <b>' + esc(nomi.join(', ')) + '</b>. Lo tolgo anche da quei piatti.</p><div class="azioni"><button class="btn pericolo" data-mact="conferma-elimina-prodotto" data-id="' + esc(id) + '">Elimina</button><button class="btn" data-mact="chiudi">Annulla</button></div>');
        return;
      }
      MAZ['conferma-elimina-prodotto'](b);
    },
    'conferma-elimina-prodotto'(b) {
      const id = b.dataset.id;
      D.piatti.forEach(d => { d.ing = (d.ing || []).filter(i => i.pid !== id); });
      D.prodotti = D.prodotti.filter(x => x.id !== id); salva(); chiudiModale(); render(); toast('Prodotto eliminato');
    },
    'aggiungi-riga'() { $('#pi-righe').insertAdjacentHTML('beforeend', rigaIng(null)); },
    'togli-riga'(b) { const r = b.closest('.ing-riga'); if (r) r.remove(); },
    'salva-piatto'(b) {
      const id = b.dataset.id || null, nome = $('#pi-n').value.trim();
      if (!nome) { toast('Scrivi il nome del piatto'); return; }
      const righe = [...document.querySelectorAll('#pi-righe .ing-riga')].map(r => ({ nome: r.querySelector('.in-nome').value.trim(), q: num(r.querySelector('.in-q').value), u: r.querySelector('.in-u').value })).filter(r => r.nome);
      if (!righe.length) { toast('Aggiungi almeno un ingrediente'); return; }
      if (righe.some(r => !(r.q > 0))) { toast('Scrivi la quantità di ogni ingrediente'); return; }
      const trova = n => D.prodotti.find(p => p.nome.toLowerCase() === n.toLowerCase());
      const noti = righe.filter(r => trova(r.nome));
      const senzaPeso = []; noti.forEach(r => { const pr = trova(r.nome); if (!unitaOk(pr, r.u) && pr.tipo === 'pz' && FATT[r.u] && !senzaPeso.some(x => x.id === pr.id)) senzaPeso.push({ id: pr.id, nome: pr.nome, u: r.u }); });
      const ignoti = []; righe.forEach(r => { if (!trova(r.nome) && !ignoti.some(x => x.nome.toLowerCase() === r.nome.toLowerCase())) ignoti.push({ nome: r.nome, u: r.u }); });
      pendente = { id: id || uid(), nome, tipo: $('#pi-t').value, righe, ignoti };
      pendente.senzaPeso = senzaPeso;
      if (senzaPeso.length) { chiediPesi(); return; }
      if (!ignoti.length) { MAZ['conferma-piatto'](); return; }
      chiediPrezzi();
    },
    'salva-pesi'() {
      if (!pendente) return;
      for (let i = 0; i < pendente.senzaPeso.length; i++) {
        const x = pendente.senzaPeso[i], q = numero('pw-q-' + i), u = $('#pw-u-' + i).value;
        if (!(q > 0)) { toast('Scrivi quanto pesa ' + x.nome); return; }
        const conf = { q: q * FATT[u], u: (u === 'kg' || u === 'g') ? 'g' : 'ml' };
        const pr = prodotto(x.id); if (pr) { pr.conf = conf; D.pesi[pr.id] = conf; }
      }
      salva(); pendente.senzaPeso = [];
      if (pendente.ignoti.length) chiediPrezzi(); else MAZ['conferma-piatto']();
    },
    'prezzi-nuovi'() {
      if (!pendente) return;
      const nuovi = [];
      for (let i = 0; i < pendente.ignoti.length; i++) {
        const x = pendente.ignoti[i], prezzo = numero('np-p-' + i), tipo = $('#np-t-' + i).value;
        if (!(prezzo > 0)) { toast('Scrivi il prezzo di ' + x.nome); return; }
        const pr = { id: 'x_' + uid(), nome: x.nome, tipo, acq: prezzo, iva: 0, ven: prezzo, conf: null, manuale: true, origine: 'mano' };
        nuovi.push(pr);
      }
      nuovi.forEach(pr => D.prodotti.push(pr));
      MAZ['conferma-piatto']();
    },
    'conferma-piatto'() {
      if (!pendente) return;
      const ing = pendente.righe.map(r => ({ pid: D.prodotti.find(p => p.nome.toLowerCase() === r.nome.toLowerCase()).id, q: r.q, u: r.u }));
      finisciPiatto({ id: pendente.id, nome: pendente.nome, tipo: pendente.tipo, ing, esempio: (piatto(pendente.id) || {}).esempio });
    },
    'elimina-piatto'(b) {
      const id = b.dataset.id;
      const inMenu = D.menu.filter(m => (m.piatti || []).indexOf(id) > -1);
      if (inMenu.length) {
        apriModale('<h2>Eliminare il piatto?</h2><p>È dentro ' + (inMenu.length === 1 ? 'il menu' : 'i menu') + ': <b>' + esc(inMenu.map(m => m.nome).join(', ')) + '</b>. Lo tolgo anche da lì.</p><div class="azioni"><button class="btn pericolo" data-mact="conferma-elimina-piatto" data-id="' + esc(id) + '">Elimina</button><button class="btn" data-mact="chiudi">Annulla</button></div>');
        return;
      }
      MAZ['conferma-elimina-piatto'](b);
    },
    'conferma-elimina-piatto'(b) {
      const id = b.dataset.id;
      D.menu.forEach(m => { m.piatti = (m.piatti || []).filter(x => x !== id); });
      D.piatti = D.piatti.filter(x => x.id !== id); salva(); chiudiModale(); render(); toast('Piatto eliminato');
    },
    'salva-menu'(b) {
      const id = b.dataset.id || null, nome = $('#mn-n').value.trim();
      if (!nome) { toast('Scrivi il nome del menu'); return; }
      const piatti = [...document.querySelectorAll('input[name="mn-p"]:checked')].map(x => x.value);
      if (!piatti.length) { toast('Scegli almeno un piatto'); return; }
      const nuovo = { id: id || uid(), nome, tipo: $('#mn-t').value, piatti, esempio: id ? (D.menu.find(m => m.id === id) || {}).esempio : undefined };
      const i = D.menu.findIndex(x => x.id === id);
      if (i < 0) D.menu.push(nuovo); else D.menu[i] = nuovo;
      salva(); chiudiModale(); render(); toast('Menu salvato');
    },
    'elimina-menu'(b) {
      const id = b.dataset.id;
      const n = D.preventivi.filter(p => p.menuId === id).length;
      if (n) {
        apriModale('<h2>Eliminare il menu?</h2><p>È scelto in ' + n + (n === 1 ? ' preventivo' : ' preventivi') + ': resteranno senza menu e dovrai sceglierne un altro.</p><div class="azioni"><button class="btn pericolo" data-mact="conferma-elimina-menu" data-id="' + esc(id) + '">Elimina</button><button class="btn" data-mact="chiudi">Annulla</button></div>');
        return;
      }
      MAZ['conferma-elimina-menu'](b);
    },
    'conferma-elimina-menu'(b) {
      const id = b.dataset.id;
      D.preventivi.forEach(p => { if (p.menuId === id) p.menuId = ''; });
      D.menu = D.menu.filter(x => x.id !== id); salva(); chiudiModale(); render(); toast('Menu eliminato');
    },
    'crea-compiti'() {
      const nuovi = compitiDaCreare(S.prev); nuovi.forEach(t => D.compiti.push(t));
      S.prev.stato = 'accettato'; S.prev.taskCreati = nuovi.length > 0;
      salvaPrev(); chiudiModale(); location.hash = '#prev/' + S.prev.id; render();
      toast(nuovi.length ? nuovi.length + ' compiti creati' : 'Preventivo segnato accettato');
    },
    'conferma-elimina-prev'() { D.preventivi = D.preventivi.filter(x => x.id !== S.prev.id); salva(); S.prev = null; chiudiModale(); location.hash = '#preventivi'; render(); toast('Preventivo eliminato'); },
    'conferma-ripristina-compiti'() { D.compiti = predefiniti().compiti; salva(); chiudiModale(); render(); toast('Compiti iniziali rimessi'); }
  };
  document.addEventListener('change', e => {
    const el = e.target;
    if (el.id === 'ec-rip') { const una = el.value === 'data'; $('#ec-giorni').hidden = una; $('#ec-data-box').hidden = !una; return; }
    if (el.id === 'st-ric') { D.ricarico = numero('st-ric'); salva(); return; }
    if (el.dataset && el.dataset.base) { D.basePrezzo[el.dataset.base] = el.value; salva(); return; }
    if (el.id && el.id.indexOf('sv-') === 0) { D.servizio.pers = { ogni: numero('sv-ogni') || 25, min: numero('sv-min') || 1, ore: numero('sv-ore'), tar: numero('sv-tar') }; salva(); return; }
    if (el.dataset && el.dataset.voce) {
      const v = D.servizio[el.dataset.voce][+el.dataset.i];
      if (v) { v[el.dataset.k] = el.dataset.k === 'p' ? num(el.value) : el.value; salva(); }
    }
  });
  document.addEventListener('input', e => {
    if (e.target.dataset && e.target.dataset.az) { D.azienda[e.target.dataset.az] = e.target.value; salva(); return; }
    const el = e.target, id = el.id || '';
    if (id === 'q-prod') { S.q = el.value; $('#lista-prod').innerHTML = elencoProdotti(); return; }
    if (id.indexOf('pv-') !== 0 || !S.prev) return;
    if (id === 'pv-ppm') { S.prev.ppMenu = el.value === '' ? null : num(el.value); aggiornaPrev(); return; }
    if (id === 'pv-forf') { S.prev.forfait = el.value === '' ? null : num(el.value); aggiornaPrev(); return; }
    if (id === 'pv-pp') { S.prev.pp = el.value === '' ? null : num(el.value); aggiornaPrev(); return; }
    leggiModuloPrev(); aggiornaPrev();
  });
  $('#fileInput').addEventListener('change', e => {
    const f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f) return;
    const modo = fileMode;
    if (modo === 'logo') {
      const u = URL.createObjectURL(f), im = new Image();
      im.onload = () => { const k = Math.min(1, 500 / Math.max(im.naturalWidth, im.naturalHeight)), cv = document.createElement('canvas'); cv.width = Math.round(im.naturalWidth * k); cv.height = Math.round(im.naturalHeight * k); const x = cv.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, cv.width, cv.height); x.drawImage(im, 0, 0, cv.width, cv.height); D.azienda.logo = cv.toDataURL('image/jpeg', 0.88); URL.revokeObjectURL(u); salva(); render(); toast('Logo salvato'); };
      im.onerror = () => toast('Non riesco a leggere la foto'); im.src = u; return;
    }
    const r = new FileReader();
    r.onload = () => {
      try {
        const o = JSON.parse(r.result);
        if (modo === 'magazzino') {
          if (!o || o.app !== 'spesasfusa-magazzino' || !Array.isArray(o.prodotti)) throw new Error('Questo file non è un backup del Magazzino');
          const nuovi = o.prodotti.map(x => {
            const sf = !!x.sfuso, tipo = sf ? (x.unita === 'l' ? 'l' : 'kg') : 'pz';
            const iva = x.iva == null ? null : +x.iva, acq = x.prezzoAcquisto == null ? null : +x.prezzoAcquisto, ric = x.ricarico || 50;
            const ven = x.prezzoManuale != null ? +x.prezzoManuale : (acq != null && iva != null ? Math.ceil(acq * (1 + ric / 100) * (1 + iva / 100) * 10 - 1e-9) / 10 : null);
            return { id: 'm_' + x.id, nome: x.nome, tipo, acq, iva, ven, conf: sf ? null : (D.pesi['m_' + x.id] || parseFormato(x.formato) || parseFormato(x.nome)), origine: 'magazzino', cat: x.categoria || '' };
          });
          D.prodotti = D.prodotti.filter(p => p.origine !== 'magazzino').concat(nuovi); salva(); render();
          toast(nuovi.length + ' prodotti caricati dal Magazzino');
        } else {
          if (!o || !Array.isArray(o.compiti)) throw new Error('Questo file non è un backup di Lavoro');
          D = migra(o); salva(); render(); toast('Backup caricato');
        }
      } catch (err) { toast(err.message === 'Unexpected end of JSON input' || err.name === 'SyntaxError' ? 'Il file non è leggibile' : err.message); }
    };
    r.readAsText(f);
  });
  function copiaTesto(testo) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(testo).then(() => true, () => false);
    return Promise.resolve(false);
  }

  /* =========================================================
     Avvisi (10 minuti prima, finché l'app è aperta)
     ========================================================= */
  const avvisati = new Set();
  function controllaAvvisi() {
    if (!D.notifiche || !D.profilo || !('Notification' in window) || Notification.permission !== 'granted') return;
    const ora = new Date(), d0 = iso(ora), nm = ora.getHours() * 60 + ora.getMinutes();
    compitiDel(ora, D.profilo).forEach(t => {
      const k = d0 + '|' + t.id, tra = minuti(t.da) - nm;
      if (D.fatti[chiaveFatto(d0, t.id, D.profilo)] || avvisati.has(k) || tra < 0 || tra > 10) return;
      avvisati.add(k);
      const testo = t.da + ' · ' + t.t, corpo = tra === 0 ? 'Adesso' : 'Tra ' + tra + ' minuti';
      if (navigator.serviceWorker && navigator.serviceWorker.ready) navigator.serviceWorker.ready.then(r => r.showNotification(testo, { body: corpo, icon: 'icons/icon-192.png', tag: k })).catch(() => { try { new Notification(testo, { body: corpo }); } catch (e) { } });
      else { try { new Notification(testo, { body: corpo }); } catch (e) { } }
    });
  }
  setInterval(() => { controllaAvvisi(); if (!document.hidden && (location.hash || '#oggi') === '#oggi' && !$('#modal').open) render(); }, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { controllaAvvisi(); if ((location.hash || '#oggi') === '#oggi') render(); } });

  /* =========================================================
     Avvio
     ========================================================= */
  render();
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => { });
})();
