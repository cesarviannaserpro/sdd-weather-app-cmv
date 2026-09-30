import { expect, test, type Page } from "@playwright/test";

const city = {
  id: 3448433,
  name: "São Paulo",
  admin1: "São Paulo",
  country: "Brasil",
  latitude: -23.55,
  longitude: -46.63,
};

const forecast = {
  current: {
    temperature_2m: 20,
    relative_humidity_2m: 63,
    weather_code: 0,
    wind_speed_10m: 12,
    pressure_msl: 1013,
    precipitation: 0,
  },
  daily: {
    time: ["2026-09-30", "2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04"],
    temperature_2m_min: [14, 15, 16, 15, 14],
    temperature_2m_max: [20, 21, 22, 23, 21],
    weather_code: [0, 1, 2, 61, 3],
    precipitation_probability_max: [0, 10, 20, 70, 30],
    precipitation_sum: [0, 0, 0.4, 5.2, 1.1],
    wind_speed_10m_max: [12, 14, 11, 18, 16],
  },
};

async function mockOpenMeteo(page: Page, geocodingResponse: object = { results: [city] }) {
  await page.route("**/geocoding-api.open-meteo.com/**", (route) => route.fulfill({ json: geocodingResponse }));
  await page.route("**/api.open-meteo.com/**", (route) => route.fulfill({ json: forecast }));
}

test("busca cidade, mostra previsão e alterna para Fahrenheit", async ({ page }) => {
  await mockOpenMeteo(page);
  await page.goto("/");

  await page.getByLabel("Buscar cidade").fill("São Paulo");
  await page.getByRole("button", { name: "Buscar" }).click();

  await expect(page.getByRole("heading", { name: "São Paulo" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Previsão de 5 dias" })).toBeVisible();
  await page.getByRole("button", { name: "°F" }).click();
  await expect(page.getByText("68°", { exact: true })).toBeVisible();
});

test("mostra estado vazio quando o geocoding não retorna results", async ({ page }) => {
  await mockOpenMeteo(page, {});
  await page.goto("/");

  await page.getByLabel("Buscar cidade").fill("Cidade inexistente");
  await page.getByRole("button", { name: "Buscar" }).click();

  await expect(page.getByText("Nenhuma cidade encontrada")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Previsão de 5 dias" })).not.toBeVisible();
});

test.describe("fluxo principal mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("renderiza o clima em 375x812", async ({ page }) => {
    await mockOpenMeteo(page);
    await page.goto("/");

    await page.getByLabel("Buscar cidade").fill("São Paulo");
    await page.getByRole("button", { name: "Buscar" }).click();

    await expect(page.getByRole("heading", { name: "São Paulo" })).toBeVisible();
    await expect(page.getByRole("img", { name: "Céu limpo" }).first()).toBeVisible();
    await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 375);
  });
});
