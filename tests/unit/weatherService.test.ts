import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchWithTimeout, getWeather, searchCities, WeatherServiceError } from "../../src/services/weatherService";
import type { City } from "../../src/types/weather";

const city: City = {
  id: 1,
  name: "São Paulo",
  region: "São Paulo",
  country: "Brasil",
  latitude: -23.55,
  longitude: -46.63,
};

function response(payload: unknown, ok = true, status = 200): Response {
  const result = new Response(JSON.stringify(payload), {
    headers: { "content-type": "application/json" },
    status,
  });
  Object.defineProperty(result, "ok", { value: ok });
  return result;
}

function forecastPayload() {
  return {
    current: {
      temperature_2m: 20.4,
      relative_humidity_2m: 63,
      weather_code: 0,
      wind_speed_10m: 12.3,
      pressure_msl: 1013.4,
      precipitation: null,
    },
    daily: {
      time: ["2026-09-30", "2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04"],
      temperature_2m_min: [14, 15, 16, 15, 14],
      temperature_2m_max: [22, 23, 24, 22, 21],
      weather_code: [0, 1, 2, 61, 3],
      precipitation_probability_max: [0, 10, 20, 70, 30],
      precipitation_sum: [null, 0, 0.4, 5.2, 1.1],
      wind_speed_10m_max: [12, 14, 11, 18, 16],
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("searchCities", () => {
  it("returns an empty list without calling fetch for blank input", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(searchCities("   ")).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps geocoding results to City", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ results: [{ id: 1, name: "São Paulo", admin1: "SP", country: "Brasil", latitude: -23.55, longitude: -46.63 }] }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(searchCities(" São Paulo ")).resolves.toEqual([{ ...city, region: "SP" }]);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("name=S%C3%A3o%20Paulo"),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("treats a missing results field as empty", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({})));
    await expect(searchCities("Recife")).resolves.toEqual([]);
  });

  it("throws WeatherServiceError for non-ok responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({}, false, 503)));
    await expect(searchCities("Recife")).rejects.toMatchObject({ name: "WeatherServiceError", status: 503, kind: "http" });
  });

  it("maps invalid JSON to invalid-response", async () => {
    const invalidResponse = new Response("not-json", { status: 200 });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(invalidResponse));

    await expect(searchCities("Recife")).rejects.toMatchObject({ kind: "invalid-response" });
  });

  it.each([
    { results: [null] },
    { results: [{ id: 1, name: "São Paulo", latitude: 91, longitude: -46.6 }] },
  ])("rejects malformed city results", async (payload) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response(payload)));

    await expect(searchCities("São Paulo")).rejects.toMatchObject({ kind: "invalid-response" });
  });
});

describe("fetchWithTimeout", () => {
  it("maps network failures to WeatherServiceError", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    await expect(fetchWithTimeout("https://example.test")).rejects.toMatchObject({ kind: "network", message: "Falha de rede." });
  });

  it("aborts after ten seconds and clears the timer", async () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
    const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => new Promise<Response>((_, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
    }));
    vi.stubGlobal("fetch", fetchMock);

    const request = fetchWithTimeout("https://example.test");
    const rejection = expect(request).rejects.toMatchObject({ kind: "timeout", message: "A requisição demorou demais." });
    await vi.advanceTimersByTimeAsync(10_000);

    await rejection;
    expect(clearTimeoutSpy).toHaveBeenCalled();
    vi.useRealTimers();
  });
});

describe("getWeather", () => {
  it("rejects invalid city coordinates before calling fetch", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(getWeather({ ...city, latitude: 91 })).rejects.toMatchObject({ kind: "invalid-response" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps current weather and five parallel daily entries", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response(forecastPayload())));

    const result = await getWeather(city);

    expect(result.city).toEqual(city);
    expect(result.current.temperatureC).toBe(20.4);
    expect(result.forecast).toHaveLength(5);
    expect(result.forecast[3]).toMatchObject({ date: "2026-10-03", temperatureMaxC: 22, precipitationProbabilityPercent: 70 });
  });

  it("preserves null precipitation for the UI fallback", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response(forecastPayload())));
    const result = await getWeather(city);

    expect(result.current.precipitationMm).toBeNull();
    expect(result.forecast[0].precipitationSumMm).toBeNull();
  });

  it.each([
    { current: undefined, daily: forecastPayload().daily },
    { current: forecastPayload().current, daily: undefined },
  ])("throws for incomplete responses", async (payload) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response(payload)));
    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
  });
});
