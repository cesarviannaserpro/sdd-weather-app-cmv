import { useRef, useState } from "react";
import { getWeather, searchCities, WeatherServiceError } from "../services/weatherService";
import type { City, WeatherData } from "../types/weather";

export type WeatherHookStatus = "idle" | "loading" | "success" | "error" | "empty";

interface SearchOperation {
  kind: "search";
  query: string;
}

interface SelectOperation {
  kind: "select";
  city: City;
}

type WeatherOperation = SearchOperation | SelectOperation;

export interface UseWeatherState {
  status: WeatherHookStatus;
  data: WeatherData | null;
  cities: City[];
  error: WeatherServiceError | null;
  query: string;
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => Promise<void>;
}

export function useWeather(): UseWeatherState {
  const [status, setStatus] = useState<WeatherHookStatus>("idle");
  const [data, setData] = useState<WeatherData | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<WeatherServiceError | null>(null);
  const [query, setQuery] = useState("");
  const lastOperation = useRef<WeatherOperation | null>(null);
  const requestVersion = useRef(0);

  async function selectCity(city: City): Promise<void> {
    if (status === "loading") {
      return;
    }

    const operation: SelectOperation = { kind: "select", city };
    const version = ++requestVersion.current;
    lastOperation.current = operation;
    setStatus("loading");
    setError(null);
    setData(null);

    try {
      const weather = await getWeather(city);
      if (version !== requestVersion.current) {
        return;
      }
      setData(weather);
      setStatus("success");
    } catch (caughtError) {
      if (version !== requestVersion.current) {
        return;
      }
      const serviceError = toWeatherServiceError(caughtError);
      setError(serviceError);
      setStatus("error");
    }
  }

  async function search(name: string): Promise<void> {
    if (status === "loading") {
      return;
    }

    const normalizedName = name.trim();
    setQuery(normalizedName);

    if (!normalizedName) {
      ++requestVersion.current;
      lastOperation.current = null;
      setCities([]);
      setData(null);
      setError(null);
      setStatus("idle");
      return;
    }

    const operation: SearchOperation = { kind: "search", query: normalizedName };
    const version = ++requestVersion.current;
    lastOperation.current = operation;
    setStatus("loading");
    setError(null);
    setData(null);

    try {
      const results = await searchCities(normalizedName);
      if (version !== requestVersion.current) {
        return;
      }
      setCities(results);

      if (results.length === 0) {
        setStatus("empty");
        return;
      }

      const weather = await getWeather(results[0]);
      if (version !== requestVersion.current) {
        return;
      }
      setData(weather);
      setStatus("success");
    } catch (caughtError) {
      if (version !== requestVersion.current) {
        return;
      }
      const serviceError = toWeatherServiceError(caughtError);
      setError(serviceError);
      setStatus("error");
    }
  }

  async function retry(): Promise<void> {
    const operation = lastOperation.current;
    if (!operation) {
      return;
    }

    if (operation.kind === "search") {
      await search(operation.query);
      return;
    }

    await selectCity(operation.city);
  }

  return { status, data, cities, error, query, search, selectCity, retry };
}

function toWeatherServiceError(error: unknown): WeatherServiceError {
  if (error instanceof WeatherServiceError) {
    return error;
  }

  return new WeatherServiceError(0, "Falha de rede.");
}
