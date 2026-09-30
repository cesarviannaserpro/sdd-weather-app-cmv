export type Unit = "celsius" | "fahrenheit";

export type WeatherErrorKind = "network" | "http" | "timeout" | "invalid-response";

export interface WeatherError {
  kind: WeatherErrorKind;
  status?: number;
  message: string;
}

export type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; cities: City[] }
  | { status: "empty" }
  | { status: "error"; error: WeatherError };

export type WeatherState =
  | { status: "idle" }
  | { status: "loading"; previousData?: WeatherData }
  | { status: "success"; data: WeatherData }
  | { status: "error"; error: WeatherError; previousData?: WeatherData };

export interface City {
  id: number;
  name: string;
  region: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  temperatureC: number | null;
  conditionCode: number | null;
  humidityPercent: number | null;
  windSpeedKmh: number | null;
  pressureHpa: number | null;
  precipitationMm: number | null;
}

export interface ForecastDay {
  date: string;
  temperatureMinC: number | null;
  temperatureMaxC: number | null;
  conditionCode: number | null;
  precipitationProbabilityPercent: number | null;
  precipitationSumMm: number | null;
  windSpeedMaxKmh: number | null;
}

export interface WeatherData {
  city: City;
  current: CurrentWeather;
  forecast: ForecastDay[];
  fetchedAt: string;
  stale: boolean;
}
