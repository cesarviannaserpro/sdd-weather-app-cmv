import { formatDayLabel, formatNumber } from "../lib/format";
import { formatTemperature } from "../lib/temperature";
import { getWeatherDescription, getWeatherIcon } from "../lib/weatherCodes";
import type { ForecastDay, Unit } from "../types/weather";

interface ForecastCardProps {
  day: ForecastDay;
  unit: Unit;
}

interface ForecastCardPropsWithIndex extends ForecastCardProps {
  index?: number;
}

export default function ForecastCard({ day, unit, index = 0 }: ForecastCardPropsWithIndex) {
  return (
    <article aria-label={`Previsão para ${formatDayLabel(day.date, index)}`} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition hover:border-accent-400/50">
      <p className="text-sm font-semibold capitalize text-white">{formatDayLabel(day.date, index)}</p>
      <span aria-label={getWeatherDescription(day.conditionCode)} className="my-4 block text-4xl text-sun" role="img">{getWeatherIcon(day.conditionCode)}</span>
      <p className="text-xs text-slate-400">{getWeatherDescription(day.conditionCode)}</p>
      <div className="mt-4 flex items-end gap-2">
        <strong className="text-xl text-white">{formatTemperature(day.temperatureMaxC, unit)}</strong>
        <span className="text-sm text-slate-400">{formatTemperature(day.temperatureMinC, unit)}</span>
      </div>
      <p className="mt-4 text-xs text-slate-300">Chuva: {day.precipitationProbabilityPercent === null ? "Indisponível" : `${formatNumber(day.precipitationProbabilityPercent)}%`}</p>
    </article>
  );
}
