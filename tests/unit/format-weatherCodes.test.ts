import { describe, expect, it } from "vitest";
import { formatDayLabel, getShortDate } from "../../src/lib/format";
import { getWeatherDescription } from "../../src/lib/weatherCodes";

describe("weather code helpers", () => {
  it("describes known codes", () => {
    expect(getWeatherDescription(0)).toBe("Céu limpo");
  });

  it("uses a fallback for unknown codes", () => {
    expect(getWeatherDescription(999)).toBe("Condição não disponível");
  });
});

describe("date helpers", () => {
  it("labels today and tomorrow by forecast index", () => {
    expect(formatDayLabel("2026-09-30", 0)).toBe("Hoje");
    expect(formatDayLabel("2026-10-01", 1)).toBe("Amanhã");
  });

  it("uses the weekday for later days and formats short dates", () => {
    expect(formatDayLabel("2026-10-02", 2)).toContain("sex");
    expect(getShortDate("2026-10-01")).toBe("01/10");
  });
});
