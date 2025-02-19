import { test } from '@playwright/test';
import readlineSync from 'readline-sync';

test('Vyhledani spojeni v jizdnim radu', async ({ page }) => {
  await page.goto('https://www.seznam.cz/jizdnirady');

  console.log("\n⚙️ Nastavení výpisu ceny:");
  console.log("1️⃣ Vyhodit error, pokud není nalezena celková cena");
  console.log("2️⃣ Zobrazit částečné ceny, pokud není dostupná celková cena");
  const priceHandling = readlineSync.question(">> Vyber moznost (1/2): ").trim();
  const throwErrorIfNoPrice = priceHandling === "1";

  console.log(`✔ Zvolena moznost: ${throwErrorIfNoPrice ? "Vyhodit error" : "Zobrazit cast. cenu"}`);

  // 🏁 Start - vychozi stanice
  const odkud = readlineSync.question(">> ODKUD jedes: ");
  console.log(`✔ Start: ${odkud}`);

  const fromInput = page.locator('#departure');
  await fromInput.waitFor({ state: 'visible', timeout: 5000 });
  await fromInput.fill(odkud);

  // 🎯 Cíl - cilova stanice
  const kam = readlineSync.question(">> KAM jedes: ");
  console.log(`✔ Cil: ${kam}`);

  const toInput = page.locator('#arrival');
  await toInput.waitFor({ state: 'visible', timeout: 5000 });
  await toInput.fill(kam);

  // 🕒 Klikneme na výběr času
  const timeButton = page.locator('button[data-dot="vyber_casu"]');
  await timeButton.waitFor({ state: 'visible', timeout: 5000 });
  await timeButton.click();

  // 🌅 Klikneme na "Zítra"
  const tomorrowButton = page.locator('button.nextDay');
  await tomorrowButton.waitFor({ state: 'visible', timeout: 5000 });
  await tomorrowButton.click();

  // ⏰ Vyplníme hodiny "8"
  const hoursInput = page.locator('input.timeInput.hours');
  await hoursInput.waitFor({ state: 'visible', timeout: 5000 });
  await hoursInput.fill('8');

  // ⏳ Nastavíme minuty na "00"
  const minutesInput = page.locator('input.timeInput.minutes');
  await minutesInput.waitFor({ state: 'visible', timeout: 5000 });
  await minutesInput.fill('00');

  // 🚆 Klikneme na "Příjezd"
  const arrivalButton = page.locator('button[aria-label="vybráno dle času příjezdu"]');
  await arrivalButton.waitFor({ state: 'visible', timeout: 5000 });
  await arrivalButton.click();

  // 🔍 Klikneme na tlačítko "Hledat"
  const searchButton = page.locator('button#submit');
  await searchButton.waitFor({ state: 'visible', timeout: 5000 });
  await searchButton.click();

  // 📌 Počkáme na výsledky
  const firstResult = page.locator('a.body.row').first();
  await firstResult.waitFor({ state: 'visible', timeout: 10000 });

  // 🛠️ Získáme informace o prvním spojení
  const duration = await firstResult.locator('.basic-info .duration').textContent();
  const transfers = await firstResult.locator('.basic-info .transfers').textContent();

  console.log(`🕒 Doba jízdy: ${duration?.trim()}`);
  console.log(`🔄 Přestupy: ${transfers?.trim()}`);

  // 👉 Klikneme na první nalezené spojení
  await firstResult.click();

  // ⏳ Počkáme na načtení detailu spojení
  await page.waitForTimeout(3000);

  // 💰 Získání ceny jízdenky
  const priceElement = page.locator('.price-item.price .price');
  const isPriceVisible = await priceElement.isVisible();

  let priceText = "Nenalezeno";
  if (isPriceVisible) {
    priceText = (await priceElement.textContent())?.trim() ?? "Nenalezeno";
  }

  // 🛑 Kontrola, zda se má vyhodit error
  if (throwErrorIfNoPrice && priceText === "Nenalezeno") {
    throw new Error("❌ ERROR: Celkova cena nebyla nalezena!");
  } else if (!throwErrorIfNoPrice && priceText === "Nenalezeno") {
    console.log("⚠ Celková cena nenalezena, zobrazují se částečné ceny:");

    // 🔍 Hledání částečných cen
    const partialPrices = await page.locator('.price-item.partialprice').all();
    
    if (partialPrices.length === 0) {
      console.log("❌ Nebyly nalezeny ani částečné ceny.");
    } else {
      for (const partialPrice of partialPrices) {
        const fromStation = await partialPrice.locator('.name[title]').first().textContent();
        const toStation = await partialPrice.locator('.name[title]').nth(1).textContent();
        const priceValue = await partialPrice.locator('.price').textContent();

        console.log(`💰 ${fromStation?.trim()} ➞ ${toStation?.trim()} ${priceValue?.trim()}`);
      }
    }
  } else {
    console.log(`💰 Celková cena: ${priceText}`);
  }

// 🚆 Hledání všech dopravních prostředků ve výsledku
const transportElements = await page.locator('.trip-card-header').all();
let transportList: string[] = [];

// 🔎 Mapa ikon → typ dopravy
const transportTypes: { [key: string]: string } = {
    "icon-train": "Vlak",
    "icon-bus": "Autobus",
    "icon-trolleybus": "Trolejbus",
    "icon-tram": "Tramvaj",
    "icon-subway": "Metro",
    "icon-walk": "Pěšky",
    "icon-trolley": "Trolejbus"
};

for (const element of transportElements) {
    // 📌 Získáme typ dopravy z ikonky
    const iconElement = await element.locator('svg.icon').first();
    const iconClass = await iconElement.getAttribute('class');

    let transportType = "Neznámý"; // Pokud nenajdeme, nastavíme výchozí
    if (iconClass) {
        for (const key in transportTypes) {
            if (iconClass.includes(key)) {
                transportType = transportTypes[key];
                break;
            }
        }
    }

    // 📌 Získáme název spoje
    const text = await element.locator('.trip-card-header-title').textContent();
    if (text && !text.includes("Pěšky") && !text.includes("Přestup")) {
        transportList.push(`${transportType} ${text.trim()}`); // Přidáme s typem dopravy
    }
}

// 🛑 Odstranění duplicitních čárek a nesprávných hodnot
const formattedTransportList = transportList.filter(Boolean).join(", ");

// 🚌 🚆 Výpis dopravních prostředků s typem
console.log(`🚍 Dopravní prostředky: ${formattedTransportList}`);

 // 🛑 Kontrola, zda poslední úsek cesty je "Pěšky"
const walkElements = await page.locator('.trip-card-header-title').all();
let lastWalkElement: string | null = null;

for (const element of walkElements) {
    const text = await element.textContent();
    if (text && text.includes("Pěšky")) {
        lastWalkElement = text.trim();
    }
}

// Pokud poslední prvek je pěší chůze, vypíšeme varování
if (lastWalkElement) {
    console.log("⚠ Spoj nejede do cílové stanice, nutnost dojít pěšky!");
    console.log(`🚶‍♂️ ${lastWalkElement}`);
}

  await page.pause(); // Debug mode
});