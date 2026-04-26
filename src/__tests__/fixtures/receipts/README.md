# Fixture scontrini per test OCR

Ogni caso di test ha la propria sottocartella con:
- Le foto sorgente (`foto_N.jpg/jpeg`)
- `expected.json` con i valori attesi del parser

## Struttura

```
receipts/
  synthetic/              → testi OCR sintetici (.txt) per test deterministici
    scontrino_lungo.txt
    expected.json
  ScontrinoLungo1/        → supermercato, 3 foto reali con sovrapposizione
    foto_1.jpeg
    foto_2.jpeg
    foto_3.jpeg
    expected.json
  ScontrinoCorto1/        → ristorante, screenshot app (totale-only)
    foto_1.jpg
    expected.json
```

## Aggiungere un nuovo caso di test

1. Crea una cartella `NomeCase/`
2. Aggiungi le foto come `foto_1.jpg`, `foto_2.jpg`, ...
3. Crea `expected.json` con `itemCount`, `total`, `isValid`
4. Aggiungi un `it()` in `ocr_real.test.ts`

## Convenzione nomi cartelle

```
{Tipo}{Numero}   es. ScontrinoLungo2, ScontrinoFarmacia1, ScontrinoBar1
```
