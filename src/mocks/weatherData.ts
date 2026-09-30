import type { WeatherData } from "../types/weather";

export const mockWeatherData: WeatherData = {
  city: {
    id: 3448433,
    name: "São Paulo",
    region: "São Paulo",
    country: "Brasil",
    latitude: -23.55,
    longitude: -46.63,
  },
  current: {
    temperatureC: 20.4,
    conditionCode: 2,
    humidityPercent: 63,
    windSpeedKmh: 12.3,
    pressureHpa: 1013.4,
    precipitationMm: 0.6,
  },
  forecast: [
    { date: "2026-09-30", temperatureMinC: 14.2, temperatureMaxC: 22.6, conditionCode: 0, precipitationProbabilityPercent: 0, precipitationSumMm: 0, windSpeedMaxKmh: 12.3 },
    { date: "2026-10-01", temperatureMinC: 15.1, temperatureMaxC: 23, conditionCode: 1, precipitationProbabilityPercent: 10, precipitationSumMm: 0, windSpeedMaxKmh: 14 },
    { date: "2026-10-02", temperatureMinC: 16, temperatureMaxC: 24.1, conditionCode: 2, precipitationProbabilityPercent: 20, precipitationSumMm: 0.4, windSpeedMaxKmh: 11.2 },
    { date: "2026-10-03", temperatureMinC: 15.4, temperatureMaxC: 22.8, conditionCode: 61, precipitationProbabilityPercent: 70, precipitationSumMm: 5.2, windSpeedMaxKmh: 18.5 },
    { date: "2026-10-04", temperatureMinC: 14.8, temperatureMaxC: 21.9, conditionCode: 3, precipitationProbabilityPercent: 30, precipitationSumMm: 1.1, windSpeedMaxKmh: 16.1 },
  ],
  fetchedAt: "2026-09-30T15:00:00.000Z",
  stale: false,
};
