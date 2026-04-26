# Parser OCR Scontrini — Note e Casi Osservati

Documento raccoglie pattern, problemi e regole emersi dai test reali sui 4 fixture.
Aggiornare ad ogni nuova fixture o modifica al parser.

---

## 1. Struttura attesa degli scontrini italiani

### Formato articolo standard (scontrino fiscale elettronico)
```
DESCRIZIONE ARTICOLO         1,50 A
```
- Descrizione a sinistra (MAIUSCOLO)
- Prezzo in fondo alla riga con virgola italiana (`1,50`) o punto (`1.50`)
- Lettera IVA opzionale dopo il prezzo: `A`=4%, `B`=10%, `C`=5%, `D`=22%

### Formato moltiplicatore (ristoranti / bar)
```
3 X 2,00
COPERTÒ                      6,00
```
- Riga `N × prezzo_unitario` precede l'articolo
- Il parser associa `qty` e `unitPrice` all'articolo successivo
- Separatore: `X`, `x`, `×` (anche con testo mescolato, es. `22X1,50`)

### Riga totale
```
TOTALE COMPLESSIVO          39,10
IMPORTO PAGATO              39,10
TOTALE EURO                 39,10
```
- Keyword riconosciute: `TOTALE`, `TOT.`, `IMPORTO`, `TOTALE EURO`
- Se totale appare più volte, il parser prende il valore più alto
- **Controllo anticipato**: `totalKw` viene cercato PRIMA di `skipKw`, perché `IMPORTO PAGATO` contiene `PAGATO` che è in skipKw

---

## 2. Righe ignorate (skipKw)

Il parser salta le righe contenenti:

| Keyword | Motivo |
|---------|--------|
| `SUBTOTALE`, `S.TOTALE` | Parziali, non il totale finale |
| `IVA` | Riga riepilogo IVA |
| `SCONTO`, `SCONTI` | Riga sconto separata dall'articolo |
| `RESTO`, `CONTANTE` | Pagamento in contanti |
| `BANCOMAT`, `MASTERCARD`, `VISA` | Metodo di pagamento |
| `PAGATO`, `PAGAMENTO` | Conferma pagamento (⚠ può contenere il totale — vedi §3) |
| `PUNTI`, `TESSERA` | Fidelity card |
| `OPERATORE`, `CASSA` | Info terminale |
| `P.IVA`, `C.F.` | Dati fiscali intestazione |
| `SCONTRINO`, `FISCALE` | Titoli documento |
| `CAMBIO` | Resto |
| `BORSINA`, `SACCHETTO` | Categorie imballaggio |
| `GRAZIE`, `ARRIVEDERCI` | Footer |
| `WWW.`, `HTTP`, `TEL`, `FAX`, `EMAIL` | Contatti |
| `ORARIO`, `APERTURA`, `DATA`, `ORA` | Metadati |

> ⚠ **Nota**: `CARTA` **non** è in skipKw — matcherebbe `CARTA IGIENICA` ecc.
> Per carte di pagamento si usa `BANCOMAT` / `MASTERCARD` / `VISA`.

---

## 3. Problemi noti con il totale

### Totale skippato per PAGAMENTO/PAGATO
**Caso**: scontrini bar/caffetteria dove la riga del totale è:
```
Pagamento elettronico 6.60
ores pagato 6.60
```
Entrambe contengono `PAGAMENTO`/`PAGATO` → skippate → `total: null`.

**Soluzione attuale**: il parser non legge il totale in questi casi.
**Fix possibile**: estrarre il totale da `Pagamento elettronico X.XX` come caso speciale,
ma c'è rischio di falsi positivi (potrebbe non essere il totale).

### Totale letto due volte (TOTALE COMPLESSIVO vs IMPORTO PAGATO)
**Caso ScontrinoLungo1**: lo scontrino ha sia `TOTALE COMPLESSIVO 30.10` che `IMPORTO PAGATO 39.10`.
Il parser prende il valore più alto → legge correttamente `39.10`.

---

## 4. Problemi noti con la data

### Data parziale (1 cifra nel giorno)
**Caso ScontrinoCorto2**: OCR legge `5-04-2026` invece di `26-04-2026`
(la cifra iniziale `2` viene persa o fusa con caratteri adiacenti).
`dateRegex` richiede `\d{2}` → no match → `date: undefined`.

### Cifra OCR errata (decade confusa)
**Caso ScontrinoLungo1**: OCR legge `2006-04-26` invece di `2026-04-26`
(il `2` della decade `20` viene letto come `200`).
Il parser estrae `2006-04-26` — anno sbagliato ma struttura corretta.

### Data fuori campo
**Caso ScontrinoLungo2**: le foto coprono solo la parte centrale → riga data non visibile → `date: undefined`.

---

## 5. Problemi OCR nei nomi articolo

### Simboli spurii da OCR
OCR produce caratteri non stampati all'inizio del nome:
```
| PASTA BARILLA        → parser strip "|" iniziale
® CAPPUCCINO          → parser strip "®" iniziale
```
Strip applicato: `^[|\/*~_^`#@_®©™]+`

### Lettera IVA finita nel nome
Scontrini con percentuale IVA nel campo descrizione:
```
CAPPUCCINO 10,00% 1,60
```
→ parser strip `\s*\d+[,.]\d+%` e `\s*\d+%` dal nome.

### Prefisso barcode nel nome
**Caso ScontrinoLungo1** — `LATTUGHINO 6.90 1,38`:
Il codice EAN/barcode `6.90` viene interpretato come parte del nome
perché non c'è separatore netto → nome risultante `LATTUGHINO 6.90`.

### Rumore riga barcode (riga spuria)
**Caso ScontrinoCorto2** — riga `q LR 1,60`:
Riga di rumore da linea barcode/quantità prima del secondo cappuccino.
4 caratteri → supera soglia minima (3) → viene inclusa come articolo spurio.

### Carattere OCR B→10 o B→8
**Caso ScontrinoLungo1** — `SHOPPER BI0 ORTOFRUT`:
OCR legge la `B` di `BIO` come `BI0` (zero invece di O).

**Caso generico** — la lettera IVA `B` letta come `8`:
→ segnalato come `confidence: 'uncertain'`, `uncertainReason: 'iva8'`.

### Punto decimale nei nomi (prezzi al peso)
**Caso ScontrinoLungo1** — `GRAMIX GRATTUGIATO 1 1,85`:
Il suffisso `1` è il tipo/variante del prodotto, non un prezzo.
Parser legge correttamente `1,85` come prezzo.

---

## 6. Filtri sul nome articolo

| Regola | Valore | Motivo |
|--------|--------|--------|
| Lunghezza minima | 3 caratteri | Elimina `IR`, `q ` ecc. |
| Strip simboli iniziali | `® © ™ \| \ / * ~ _ ^ \` # @` | Rumore OCR |
| Strip simboli finali | `\| \ / * ~ _ ^ \` # @` | Rumore OCR |
| Strip spazi multipli | → spazio singolo | Normalizzazione |
| Strip IVA% inline | `\d+[,.]\d+%` e `\d+%` | `10,00%` o `10%` nel campo nome |

---

## 7. Sistema di confidenza

Il parser assegna `confidence: 'uncertain'` quando:

| Condizione | `uncertainReason` | Esempio |
|------------|-------------------|---------|
| Lettera IVA letta come `8` | `'iva8'` | `PASTA 1,29 8` → zona cifre inaffidabile |
| Nome inizia o finisce con `!` | `'linea_rumorosa'` | `FUSILLI 98 ! 0,99` → suffisso IVA nel campo nome |
| `qty × unitPrice ≠ price` (>2¢) | `'moltiplicatore_errato'` | Moltiplicatore OCR errato |

Items `uncertain` → UI mostra bordo arancio + banner "N prezzi da verificare".

---

## 8. Sconti e fidelity

**Non gestiti** (righe skippate da `skipKw`):
```
SCONTO BLUCARD 30%          -0,56
```
Lo sconto non viene sottratto dal prezzo dell'articolo precedente.
Il prezzo estratto è quello lordo (prima dello sconto).

---

## 9. Prezzi al peso (3 decimali)

```
BANANE CHIQUITA    2,180 A
```
`priceRegex` accetta 2-3 decimali → `2,180` viene letto → arrotondato a `2.18` via `.toFixed(2)`.
Prezzo reale può differire di 1¢ per arrotondamento OCR.

---

## 10. Casi per tipo di scontrino

### Scontrino Fiscale Elettronico (supermercato)
- Formato: `DESCRIZIONE   PREZZO LETTERA_IVA`
- Totale: `IMPORTO PAGATO` oppure `TOTALE COMPLESSIVO`
- Sconti su riga separata, non sottratti
- Data in fondo in formato `dd-mm-yyyy` o `dd/mm/yyyy`
- **Fonte**: ScontrinoLungo1, ScontrinoLungo2

### Preconto non fiscale (ristorante)
- Formato libero, moltiplicatori `N X prezzo`
- Nessuna lettera IVA
- Totale: `TOTALE` semplice
- Data: `dd/mm/yyyy`
- **isValid**: `true` se somma = totale
- **Fonte**: ScontrinoCorto1 (Trattoria I Giganti)

### Scontrino Bar / Caffetteria (elettronico)
- Lettera IVA `B` (10%) frequente
- Totale su riga `Pagamento elettronico X.XX` → **non letto** dal parser
- Data spesso su riga unica con ora `5-04-2026 08:15` → giorno parziale
- **Fonte**: ScontrinoCorto2

---

## 11. Fixture presenti

| Cartella | Tipo | Foto | Stato test |
|----------|------|------|------------|
| `ScontrinoLungo1/` | Supermercato, scontrino completo | 3 .jpeg | ✅ stable |
| `ScontrinoLungo2/` | Stesso scontrino, copertura parziale | 3 .jpg | ✅ stable |
| `ScontrinoCorto1/` | Ristorante, preconto | 1 .jpg | ✅ stable |
| `ScontrinoCorto2/` | Bar/caffetteria | 1 .jpg | ✅ stable |
| `synthetic/` | Testo sintetico (no foto) | — | ✅ stable |

---

## 12. Miglioramenti futuri (backlog parser)

- [ ] Estrarre totale da `Pagamento elettronico X.XX` (se nessun `TOTALE` trovato)
- [ ] Sottrarre sconti `SCONTO BLUCARD` dal prezzo articolo precedente
- [ ] Regex data: accettare giorno a 1 cifra (`\d{1,2}` invece di `\d{2}`)
- [ ] Filtrare righe barcode spurie con euristica (es. nome < 5 char + solo lettere minuscole)
- [ ] Gestire suffisso peso nel nome (`GRAMIX GRATTUGIATO 1` → strip `\s+\d$`)
