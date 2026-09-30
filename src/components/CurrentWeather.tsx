import { formatNumber, formatTime } from "../lib/format";
import { getWeatherDescription, getWeatherIcon } from "../lib/weatherCodes";
import { formatTemperature } from "../lib/temperature";
import type { RefObject } from "react";
import type { City, CurrentWeather as CurrentWeatherData, Unit } from "../types/weather";

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
  fetchedAt?: string;
  resultRef?: RefObject<HTMLElement | null>;
}

interface MetricProps {
  label: string;
  value: string;
}

function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
      <dt className="text-xs uppercase tracking-wider text-slate-400">{label}</dt>
      <dd className="mt-2 text-lg font-semibold text-white">{value}</dd>
    </div>
  );
}

export default function CurrentWeather({ city, current, unit, fetchedAt, resultRef }: CurrentWeatherProps) {
  const temperatureUnit = current.temperatureC === null ? "" : unit === "celsius" ? "°C" : "°F";
  const wind = current.windSpeedKmh === null ? "Indisponível" : `${formatNumber(current.windSpeedKmh)} km/h`;
  const precipitation = current.precipitationMm === null ? "Indisponível" : `${formatNumber(current.precipitationMm, 1)} mm`;
  const pressure = current.pressureHpa === null ? "Indisponível" : `${formatNumber(current.pressureHpa)} hPa`;

  return (
    <section aria-labelledby="current-weather-title" className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glass backdrop-blur-md sm:p-8" ref={resultRef} tabIndex={-1}>
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-accent-400">Condições atuais</p>
          <h2 className="mt-1 text-2xl font-semibold text-white" id="current-weather-title">{city.name}</h2>
          <p className="text-sm text-slate-400">{[city.region, city.country].filter(Boolean).join(", ")}</p>
        </div>
        <div className="flex items-center gap-5">
          <span aria-label={getWeatherDescription(current.conditionCode)} className="text-6xl text-sun" role="img">{getWeatherIcon(current.conditionCode)}</span>
          <div>
            <p className="text-6xl font-bold tracking-tight text-white sm:text-7xl">{formatTemperature(current.temperatureC, unit)}<span className="text-2xl text-slate-400">{temperatureUnit}</span></p>
            <p className="mt-2 text-slate-300">{getWeatherDescription(current.conditionCode)}</p>
          </div>
        </div>
      </div>
      <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Umidade" value={current.humidityPercent === null ? "Indisponível" : `${formatNumber(current.humidityPercent)}%`} />
        <Metric label="Vento" value={wind} />
        <Metric label="Precipitação" value={precipitation} />
        <Metric label="Pressão" value={pressure} />
      </dl>
      <p className="mt-6 text-xs text-slate-400">{fetchedAt ? `Consultado às ${formatTime(fetchedAt)} em Brasília` : "Horário da consulta indisponível"}</p>
    </section>
  );
}
