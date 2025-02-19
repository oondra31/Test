import { test, expect } from '@playwright/test';

test('Scrapování výsledků vyhledávání na Seznam.cz z první a druhé stránky', async ({ page }) => {
  // 1️⃣ Otevřeme Seznam.cz
  await page.goto('https://www.seznam.cz');

  // 2️⃣ Najdeme vyhledávací pole a zadáme hledaný výraz
  const searchInput = page.locator('input.szn-input-with-suggest-list.search-form__input');
  await searchInput.waitFor({ state: 'visible', timeout: 5000 });
  await searchInput.fill('Pes');

  // 3️⃣ Klikneme na tlačítko "Vyhledat"
  const searchButton = page.locator('button[data-dot="search-button"]');
  await searchButton.waitFor({ state: 'visible', timeout: 5000 });
  await searchButton.click();

  // 📌 Funkce pro scrapování výsledků
  async function scrapeResults() {
    // 4️⃣ Počkáme na načtení výsledků
    await page.waitForSelector('h3 a', { timeout: 15000 });

    // 5️⃣ Získáme všechny výsledky (nadpisy + odkazy)
    const results = await page.locator('h3 a').all();

    let scrapedResults: { title: string; link: string }[] = [];

    for (const result of results) {
      // 📌 Získáme URL odkazu
      const link = await result.getAttribute('href');

      // 📌 Získáme text uvnitř <span><b>...</b> | <b>...</b></span>
      const titleElements = await result.locator('span').allTextContents();
      const title = titleElements.join(' '); // Spojí všechny části dohromady

      if (link && title) {
        scrapedResults.push({ title, link });
      }
    }

    return scrapedResults;
  }

  // 6️⃣ Scrapujeme první stránku
  let allResults = await scrapeResults();
  console.log('📌 Výsledky z první stránky:');
  allResults.forEach(result => console.log(`🔹 ${result.title} (${result.link})`));

  // 7️⃣ Klikneme na tlačítko "2" pro druhou stránku
  const nextPageButton = page.locator('a.Paging-link', { hasText: '2' });
  if (await nextPageButton.count() > 0) {
    await nextPageButton.click();
    await page.waitForLoadState('domcontentloaded');

    // 8️⃣ Scrapujeme druhou stránku
    const secondPageResults = await scrapeResults();
    console.log('📌 Výsledky z druhé stránky:');
    secondPageResults.forEach(result => console.log(`🔹 ${result.title} (${result.link})`));

    // Přidáme výsledky z druhé stránky do seznamu
    allResults = [...allResults, ...secondPageResults];
  } else {
    console.log('❌ Druhá stránka neexistuje nebo nebyla nalezena.');
  }

  // Ověříme, že jsme našli alespoň 1 výsledek
  expect(allResults.length).toBeGreaterThan(0);
});
