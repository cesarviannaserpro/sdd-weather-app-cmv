import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import CurrentWeather from "../../src/components/CurrentWeather";
import SearchBar from "../../src/components/SearchBar";
import UnitToggle from "../../src/components/UnitToggle";
import type { City, CurrentWeather as CurrentWeatherData } from "../../src/types/weather";

const city: City = { id: 1, name: "São Paulo", region: "SP", country: "Brasil", latitude: -23.5, longitude: -46.6 };
const current: CurrentWeatherData = { temperatureC: 0, conditionCode: 0, humidityPercent: 50, windSpeedKmh: 10, pressureHpa: 1013, precipitationMm: 0 };

describe("SearchBar", () => {
  it("does not search an empty input", () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("searches with the entered value", () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    fireEvent.change(screen.getByLabelText("Buscar cidade"), { target: { value: "  Recife  " } });
    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));
    expect(onSearch).toHaveBeenCalledWith("Recife");
  });
});

describe("unit conversion in presentation", () => {
  it("updates CurrentWeather from 0°C to 32°F", () => {
    function Harness() {
      const [unit, setUnit] = useState<"celsius" | "fahrenheit">("celsius");
      return <><UnitToggle onChange={setUnit} unit={unit} /><CurrentWeather city={city} current={current} unit={unit} /></>;
    }

    render(<Harness />);
    expect(screen.getByText("0°")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "°F" }));
    expect(screen.getByText("32°")).toBeInTheDocument();
  });
});
