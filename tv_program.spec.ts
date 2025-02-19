import { test, expect } from '@playwright/test';

test('Najdi TV pořady od 20:00 na Seznam.cz', async ({ page }) => {
  // 1️⃣ Otevře hlavní stránku Seznam.cz
  await page.goto('https://www.seznam.cz/');

  // 2️⃣ Najde sekci "TV program"
  const tvProgramSection = page.locator('div.gadget[data-dot="gadgetTvProgram"]');
  await tvProgramSection.waitFor({ state: 'visible', timeout: 5000 });

  // 3️⃣ Klikne na záložku "20:00"
  const timeTab = tvProgramSection.locator('button:has-text("20:00")');
  await timeTab.waitFor({ state: 'visible', timeout: 5000 });
  await timeTab.click();

  // 4️⃣ Počká na načtení seznamu pořadů
  await page.waitForSelector('div.mol-tv-program-section__item', { timeout: 5000 });

  // 5️⃣ Najde všechny TV stanice
  const stations = await page.locator('div.mol-tv-program-section__item').all();
  console.log(`📡 Nalezeno TV stanic: ${stations.length}`);

  type TvStation = { name: string; shows: string[] };

  const tvStations: TvStation[] = [];

  for (const station of stations) {
    // 6️⃣ Získej jméno stanice
    const stationName = await station.locator('h3 span').textContent();

    // 7️⃣ Najdi všechny pořady
    const shows = await station.locator('div.atm-tv-program-item').all();
    const showList: string[] = [];

    for (const show of shows) {
      // 8️⃣ Najdi čas a název pořadu
      const timeText = await show.locator('span.atm-tv-program-item__time').textContent();
      const titleElement = show.locator('a.atm-link.atm-link--styled');
      const titleText = await titleElement.textContent();

      if (timeText?.trim() === '20:00') {
        showList.push(titleText?.trim() || '');
      }
    }

    if (showList.length > 0) {
      tvStations.push({ name: stationName?.trim() || 'Neznámá stanice', shows: showList });
    }
  }

  // 9️⃣ Výpis pořadů od 20:00 (pouze názvy)
  console.log('📺 Pořady vysílané od 20:00:');
  tvStations.forEach((station) => {
    console.log(`\n📡 ${station.name}:`);
    station.shows.forEach((show) => {
      console.log(`🕗 ${show}`);
    });
  });

  expect(tvStations.length).toBeGreaterThan(0);
});
