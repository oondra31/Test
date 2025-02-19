# 🚆 Automatizované testování spojení v jízdním řádu

Tento projekt umožňuje automatizované testování vyhledávání spojení v jízdním řádu pomocí **Playwright** a **readline-sync**.

## 🛠️ Požadavky

1. **Node.js** – stáhni a nainstaluj pre-buildnutou verzi z:
   [Node.js ke stažení](https://nodejs.org/en/download)

2. **Terminál** – otevři terminál a přesuň se do složky, kde chceš mít uložený testovací projekt.

## 🚀 Instalace

### 1️⃣ Instalace Playwright

V terminálu spusť následující příkaz pro inicializaci Playwrightu:

```sh
npm init playwright@latest
```

Tento příkaz stáhne a nastaví Playwright pro testování webových aplikací.

### 2️⃣ Instalace `readline-sync`

Pro správné fungování testů je potřeba knihovna **readline-sync**, která umožňuje interaktivní vstup v konzoli.
Nainstaluješ ji příkazem:

```sh
npm install readline-sync
```

## 🎯 Spuštění testu

Pro spuštění testu **`jizdni_rad.spec.ts`** zadej do terminálu:

```sh
npx playwright tests/jizdni_rad
```

## 📌 Použití

1. Po spuštění testu se zobrazí nastavení:

   ```
   ⚙️ Nastavení výpisu ceny:
   1️⃣ Vyhodit error, pokud není nalezena celková cena
   2️⃣ Zobrazit částečné ceny, pokud není dostupná celková cena
   >> Vyber možnost (1/2):
   ```

   Odpověz zadáním **1** nebo **2**, podle toho, jak chceš s cenou pracovat.

2. **Zadej výchozí stanici** – test se tě zeptá:

   ```
   >> ODKUD jedeš:
   ```

   Zadej **název stanice bez háčků a čárek** (např. `Praha Hlavni nadrazi`).

3. **Zadej cílovou stanici** – test se tě zeptá:

   ```
   >> KAM jedeš:
   ```

   Opět zadej **název stanice bez háčků a čárek** (např. `Brno hlavni nadrazi`).

4. Test automaticky:

   - Otevře stránku jízdních řádů Seznamu
   - Vyplní zadané stanice
   - Nastaví čas odjezdu na **zítra v 8:00**
   - Klikne na **Vyhledat** a zobrazí první nalezené spojení

5. **Výstup testu** obsahuje informace o:

   - **Délce jízdy**
   - **Počtu přestupů**
   - **Celkové nebo částečné ceně jízdenky**
   - **Použitých dopravních prostředcích (vlak, autobus, tramvaj, atd.)**

## 🛑 Debugging

Pokud chceš **spustit testy s debug režimem**, použij příkaz:

```sh
npx playwright test --debug
```

Tím se otevře Playwright Inspector, kde můžeš krokovat testy a sledovat jejich průběh.

---
