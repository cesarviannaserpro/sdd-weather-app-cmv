import { useRef, useState } from "react";
import { getWeather, searchCities, WeatherServiceError } from "../services/weatherService";
import type { City, WeatherData, WeatherError } from "../types/weather";

export type WeatherHookStatus = "idle" | "loading" | "success" | "error" | "empty";

interface SearchOperation {
  kind: "search";
  query: string;
}

interface SelectOperation {
  kind: "select";
  city: City;
}

interface RefreshOperation {
  kind: "refresh";
  city: City;
  previousData: WeatherData;
}

type WeatherOperation = SearchOperation | SelectOperation | RefreshOperation;

export interface UseWeatherState {
  status: WeatherHookStatus;
  data: WeatherData | null;
  cities: City[];
  error: WeatherError | null;
  query: string;
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  refresh: () => Promise<void>;
  retry: () => Promise<void>;
}

export function useWeather(): UseWeatherState {
  const [status, setStatus] = useState<WeatherHookStatus>("idle");
  const [data, setData] = useState<WeatherData | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<WeatherError | null>(null);
  const [query, setQuery] = useState("");
  const lastOperation = useRef<WeatherOperation | null>(null);
  const requestVersion = useRef(0);
  const activeController = useRef<AbortController | null>(null);

  function beginRequest(): { version: number; signal: AbortSignal } {
    activeController.current?.abort();
    const controller = new AbortController();
    activeController.current = controller;
    return { version: ++requestVersion.current, signal: controller.signal };
  }

  function endRequest(version: number): void {
    if (version === requestVersion.current) {
      activeController.current = null;
    }
  }

  async function selectCity(city: City): Promise<void> {
    if (status === "loading") {
      return;
    }

    const operation: SelectOperation = { kind: "select", city };
    const previousData = data;
    const request = beginRequest();
    const version = request.version;
    lastOperation.current = operation;
    setStatus("loading");
    setError(null);
    setCities([]);
    setData(null);

    try {
      const weather = await getWeather(city, { signal: request.signal });
      if (version !== requestVersion.current) {
        return;
      }
      setData(weather);
      setStatus("success");
      endRequest(version);
    } catch (caughtError) {
      if (version !== requestVersion.current) {
        return;
      }
      const serviceError = toWeatherError(caughtError);
      setError(serviceError);
      setStatus("error");
      if (previousData) {
        setData({ ...previousData, stale: true });
      }
      endRequest(version);
    }
  }

  async function search(name: string): Promise<void> {
    if (status === "loading") {
      return;
    }

    const normalizedName = name.trim();
    setQuery(normalizedName);

    if (!normalizedName) {
      activeController.current?.abort();
      activeController.current = null;
      ++requestVersion.current;
      lastOperation.current = null;
      setCities([]);
      setData(null);
      setError(null);
      setStatus("idle");
      return;
    }

    const operation: SearchOperation = { kind: "search", query: normalizedName };
    const request = beginRequest();
    const version = request.version;
    lastOperation.current = operation;
    setStatus("loading");
    setError(null);
    setData(null);

    try {
      const results = await searchCities(normalizedName, { signal: request.signal });
      if (version !== requestVersion.current) {
        return;
      }
      setCities(results);

      if (results.length === 0) {
        setStatus("empty");
        return;
      }

      setData(null);
      setStatus("success");
      endRequest(version);
    } catch (caughtError) {
      if (version !== requestVersion.current) {
        return;
      }
      const serviceError = toWeatherError(caughtError);
      setError(serviceError);
      setStatus("error");
      endRequest(version);
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

    if (operation.kind === "refresh") {
      await refresh();
      return;
    }

    await selectCity(operation.city);
  }

  async function refresh(): Promise<void> {
    if (!data || status === "loading") {
      return;
    }
    const operation: RefreshOperation = { kind: "refresh", city: data.city, previousData: data };
    const request = beginRequest();
    lastOperation.current = operation;
    setStatus("loading");
    setError(null);

    try {
      const weather = await getWeather(data.city, { signal: request.signal });
      if (request.version !== requestVersion.current) return;
      setData(weather);
      setStatus("success");
      endRequest(request.version);
    } catch (caughtError) {
      if (request.version !== requestVersion.current) return;
      setData({ ...operation.previousData, stale: true });
      setError(toWeatherError(caughtError));
      setStatus("error");
      endRequest(request.version);
    }
  }

  return { status, data, cities, error, query, search, selectCity, refresh, retry };
}

function toWeatherError(error: unknown): WeatherError {
  if (error instanceof WeatherServiceError) {
    return { kind: error.kind, status: error.status, message: error.message };
  }

  return { kind: "network", message: "Falha de rede." };
}
