import { describe, expect, it } from "vitest";
import { convertTemperature, formatTemperature, unitLabel } from "../../src/lib/temperature";

describe("temperature helpers", () => {
  it.each([
    [0, 32],
    [100, 212],
    [-40, -40],
  ])("converts %d°C to %d°F", (celsius, fahrenheit) => {
    expect(convertTemperature(celsius, "fahrenheit")).toBe(fahrenheit);
  });

  it("returns the original value for Celsius", () => {
    expect(convertTemperature(21.5, "celsius")).toBe(21.5);
  });

  it("formats rounded temperatures with the degree symbol", () => {
    expect(formatTemperature(20.6, "celsius")).toBe("21°");
    expect(formatTemperature(0, "fahrenheit")).toBe("32°");
    expect(formatTemperature(null, "celsius")).toBe("Indisponível");
  });

  it("returns the unit label", () => {
    expect(unitLabel("celsius")).toBe("°C");
    expect(unitLabel("fahrenheit")).toBe("°F");
  });
});
