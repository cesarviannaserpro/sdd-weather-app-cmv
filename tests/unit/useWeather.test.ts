import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getWeather, searchCities, WeatherServiceError } from "../../src/services/weatherService";
import { useWeather } from "../../src/hooks/useWeather";
import type { City, WeatherData } from "../../src/types/weather";

vi.mock("../../src/services/weatherService", () => ({
  getWeather: vi.fn(),
  searchCities: vi.fn(),
  WeatherServiceError: class WeatherServiceError extends Error {
    readonly kind = "network";
    readonly status = 0;
  },
}));

const city: City = { id: 1, name: "São Paulo", region: "SP", country: "Brasil", latitude: -23.5, longitude: -46.6 };
const weather: WeatherData = {
  city,
  current: { temperatureC: 20, conditionCode: 0, humidityPercent: 50, windSpeedKmh: 10, pressureHpa: 1013, precipitationMm: 0 },
  forecast: [],
  fetchedAt: "2026-09-30T15:00:00.000Z",
  stale: false,
};

const mockedSearchCities = vi.mocked(searchCities);
const mockedGetWeather = vi.mocked(getWeather);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useWeather", () => {
  it("keeps idle and avoids services for blank search", async () => {
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.search("  "));

    expect(result.current.status).toBe("idle");
    expect(mockedSearchCities).not.toHaveBeenCalled();
  });

  it("exposes cities returned by a search until one is selected", async () => {
    mockedSearchCities.mockResolvedValue([city]);
    mockedGetWeather.mockResolvedValue(weather);
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.search("São Paulo"));

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.cities).toEqual([city]);
    expect(result.current.data).toBeNull();
    expect(mockedGetWeather).not.toHaveBeenCalled();
  });

  it("exposes empty when geocoding returns no cities", async () => {
    mockedSearchCities.mockResolvedValue([]);
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.search("Cidade inexistente"));

    expect(result.current.status).toBe("empty");
    expect(mockedGetWeather).not.toHaveBeenCalled();
  });

  it("retries the last failed operation", async () => {
    mockedSearchCities.mockResolvedValue([city]);
    mockedGetWeather.mockRejectedValueOnce(new WeatherServiceError(0, "Falha de rede."));
    mockedGetWeather.mockResolvedValueOnce(weather);
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.search("São Paulo"));
    await act(async () => result.current.selectCity(city));
    expect(result.current.status).toBe("error");

    await act(async () => result.current.retry());
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(mockedGetWeather).toHaveBeenCalledTimes(2);
  });

  it("refreshes the active city and preserves stale data on failure", async () => {
    mockedGetWeather.mockResolvedValueOnce(weather).mockRejectedValueOnce(new WeatherServiceError(503, "offline"));
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.selectCity(city));
    await waitFor(() => expect(result.current.status).toBe("success"));
    await act(async () => result.current.refresh());

    expect(result.current.status).toBe("error");
    expect(result.current.data).toMatchObject({ ...weather, stale: true });
    expect(result.current.data?.fetchedAt).toBe(weather.fetchedAt);
  });
});
