import type { Unit } from "../types/weather";

export function convertTemperature(valueC: number | null, unit: Unit): number | null {
  if (valueC === null) {
    return null;
  }

  return unit === "fahrenheit" ? (valueC * 9) / 5 + 32 : valueC;
}

export function formatTemperature(valueC: number | null, unit: Unit): string {
  const value = convertTemperature(valueC, unit);
  return value === null ? "Indisponível" : `${Math.round(value)}°`;
}

export function unitLabel(unit: Unit): string {
  return unit === "celsius" ? "°C" : "°F";
}
