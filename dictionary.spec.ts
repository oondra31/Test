import { test, expect } from '@playwright/test';

test('Ověření překladu "zubní ordinace" v Seznam slovníku na Seznam.cz', async ({ page }) => {
  // 1️⃣ Otevřeme hlavní stránku Seznam.cz
  await page.goto('https://www.seznam.cz/');

  // 2️⃣ Najdeme a klikneme na tlačítko "Slovník"
  const dictionaryTab = page.locator('button.atm-search-tab-button[data-dot="slovnik"]');
  await dictionaryTab.waitFor({ state: 'visible', timeout: 5000 });
  await dictionaryTab.click();

  // 3️⃣ Najdeme **správné** vyhledávací pole pro Slovník a zadáme "zubní ordinace"
  const searchInput = page.locator('input#slovnik-input'); // Použití přesného ID
  await searchInput.waitFor({ state: 'visible', timeout: 5000 });
  await searchInput.fill('zubní ordinace');

  // 4️⃣ Odeslat hledání (Enter)
  await searchInput.press('Enter');

  // 5️⃣ Počkáme na načtení překladu
  await page.waitForSelector('.TranslatePage-results-short', { timeout: 15000 });

  // 6️⃣ Najdeme všechny přeložené výrazy
  const allTranslations = await page.locator('.TranslatePage-results-short span').allTextContents();

  // 7️⃣ Ověříme, že alespoň jeden prvek obsahuje "dentist's office"
  const containsDentistOffice = allTranslations.some(text => text.includes("dentist's office"));

  // 8️⃣ Výpis překladu do konzole
  console.log('📖 Překlady nalezené ve slovníku:', allTranslations);

  expect(containsDentistOffice).toBeTruthy();
});
