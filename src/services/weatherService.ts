import type { City, CurrentWeather, ForecastDay, WeatherData } from "../types/weather";

const GEOCODING_ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_ENDPOINT = "https://api.open-meteo.com/v1/forecast";
const REQUEST_TIMEOUT_MS = 10_000;

type WeatherServiceErrorKind = "http" | "timeout" | "network" | "invalid-response";

export class WeatherServiceError extends Error {
  readonly status: number;
  readonly kind: WeatherServiceErrorKind;

  constructor(
    status: number,
    message = `Weather service request failed with status ${status}`,
    kind: WeatherServiceErrorKind = status === 0 ? "network" : "http",
  ) {
    super(message);
    this.name = "WeatherServiceError";
    this.status = status;
    this.kind = kind;
  }
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (isAbortError(error)) {
      throw new WeatherServiceError(408, "A requisição demorou demais.", "timeout");
    }

    throw new WeatherServiceError(0, "Falha de rede.");
  } finally {
    clearTimeout(timeoutId);
  }
}

function isAbortError(error: unknown): boolean {
  return (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError");
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new WeatherServiceError(
      response.status,
      "A resposta da Open-Meteo é inválida.",
      "invalid-response",
    );
  }
}

interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string | null;
  country?: string | null;
}

interface GeocodingResponse {
  results?: GeocodingResult[] | null;
}

interface ForecastCurrentResponse {
  temperature_2m?: unknown;
  relative_humidity_2m?: unknown;
  weather_code?: unknown;
  wind_speed_10m?: unknown;
  pressure_msl?: unknown;
  precipitation?: unknown;
}

interface ForecastDailyResponse {
  time?: unknown;
  temperature_2m_min?: unknown;
  temperature_2m_max?: unknown;
  weather_code?: unknown;
  precipitation_probability_max?: unknown;
  precipitation_sum?: unknown;
  wind_speed_10m_max?: unknown;
}

interface ForecastResponse {
  current?: ForecastCurrentResponse;
  daily?: ForecastDailyResponse;
}

function nullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function numberOrZero(value: unknown): number {
  return nullableNumber(value) ?? 0;
}

function hasFiveItems(value: unknown): value is unknown[] {
  return Array.isArray(value) && value.length >= 5;
}

export async function searchCities(name: string): Promise<City[]> {
  const query = name.trim();

  if (!query) {
    return [];
  }

  const url = `${GEOCODING_ENDPOINT}?name=${encodeURIComponent(query)}&count=10&language=pt&format=json`;
  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new WeatherServiceError(response.status);
  }

  const payload = (await readJson(response)) as GeocodingResponse | null;

  if (!payload || (payload.results !== undefined && payload.results !== null && !Array.isArray(payload.results))) {
    throw new WeatherServiceError(response.status, "A resposta da Open-Meteo é inválida.", "invalid-response");
  }

  return (payload.results ?? []).map((result) => ({
    id: result.id,
    name: result.name,
    region: result.admin1 ?? null,
    country: result.country ?? null,
    latitude: result.latitude,
    longitude: result.longitude,
  }));
}

export async function getWeather(city: City): Promise<WeatherData> {
  const currentFields = [
    "temperature_2m",
    "relative_humidity_2m",
    "weather_code",
    "wind_speed_10m",
    "pressure_msl",
    "precipitation",
  ].join(",");
  const dailyFields = [
    "temperature_2m_min",
    "temperature_2m_max",
    "weather_code",
    "precipitation_probability_max",
    "precipitation_sum",
    "wind_speed_10m_max",
  ].join(",");
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: currentFields,
    daily: dailyFields,
    timezone: "America/Sao_Paulo",
    forecast_days: "5",
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    precipitation_unit: "mm",
  });
  const response = await fetchWithTimeout(`${FORECAST_ENDPOINT}?${params.toString()}`);

  if (!response.ok) {
    throw new WeatherServiceError(response.status);
  }

  const payload = (await readJson(response)) as ForecastResponse | null;
  const daily = payload?.daily;

  if (!payload?.current || !daily) {
    throw new WeatherServiceError(
      response.status,
      "Weather service returned an incomplete response",
      "invalid-response",
    );
  }

  if (
    !hasFiveItems(daily.time) ||
    !hasFiveItems(daily.temperature_2m_min) ||
    !hasFiveItems(daily.temperature_2m_max) ||
    !hasFiveItems(daily.weather_code) ||
    !hasFiveItems(daily.precipitation_probability_max) ||
    !hasFiveItems(daily.precipitation_sum) ||
    !hasFiveItems(daily.wind_speed_10m_max)
  ) {
    throw new WeatherServiceError(
      response.status,
      "Weather service returned incomplete daily data",
      "invalid-response",
    );
  }

  const dates = daily.time;
  const minimums = daily.temperature_2m_min;
  const maximums = daily.temperature_2m_max;
  const weatherCodes = daily.weather_code;
  const precipitationProbabilities = daily.precipitation_probability_max;
  const precipitationSums = daily.precipitation_sum;
  const windSpeeds = daily.wind_speed_10m_max;

  const current: CurrentWeather = {
    temperatureC: nullableNumber(payload.current.temperature_2m),
    conditionCode: nullableNumber(payload.current.weather_code),
    humidityPercent: nullableNumber(payload.current.relative_humidity_2m),
    windSpeedKmh: nullableNumber(payload.current.wind_speed_10m),
    pressureHpa: nullableNumber(payload.current.pressure_msl),
    precipitationMm: numberOrZero(payload.current.precipitation),
  };

  const forecast: ForecastDay[] = Array.from({ length: 5 }, (_, index) => ({
    date: typeof dates[index] === "string" ? dates[index] : "",
    temperatureMinC: nullableNumber(minimums[index]),
    temperatureMaxC: nullableNumber(maximums[index]),
    conditionCode: nullableNumber(weatherCodes[index]),
    precipitationProbabilityPercent: nullableNumber(precipitationProbabilities[index]),
    precipitationSumMm: numberOrZero(precipitationSums[index]),
    windSpeedMaxKmh: nullableNumber(windSpeeds[index]),
  }));

  return {
    city,
    current,
    forecast,
    fetchedAt: new Date().toISOString(),
    stale: false,
  };
}
