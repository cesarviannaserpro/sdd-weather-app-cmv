const weatherDescriptions: Record<number, string> = {
  0: "Céu limpo",
  1: "Predominantemente limpo",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Névoa",
  48: "Névoa congelante",
  51: "Garoa leve",
  53: "Garoa moderada",
  55: "Garoa intensa",
  61: "Chuva leve",
  63: "Chuva moderada",
  65: "Chuva intensa",
  71: "Neve leve",
  73: "Neve moderada",
  75: "Neve intensa",
  80: "Pancadas leves",
  81: "Pancadas moderadas",
  82: "Pancadas intensas",
  95: "Trovoada",
  96: "Trovoada com granizo",
  99: "Trovoada com granizo intenso",
};

export function getWeatherDescription(code: number | null): string {
  return code === null ? "Condição não disponível" : (weatherDescriptions[code] ?? "Condição não disponível");
}

export function getWeatherIcon(code: number | null): string {
  if (code === null) {
    return "?";
  }
  if (code === 0) {
    return "☀";
  }
  if ([1, 2].includes(code)) {
    return "◐";
  }
  if ([3, 45, 48].includes(code)) {
    return "☁";
  }
  if ([61, 63, 65, 80, 81, 82].includes(code)) {
    return "☂";
  }
  if ([95, 96, 99].includes(code)) {
    return "ϟ";
  }
  return "✦";
}
