import { useEffect, useRef, useState } from "react";
import CurrentWeather from "./components/CurrentWeather";
import EmptyState from "./components/states/EmptyState";
import ErrorState from "./components/states/ErrorState";
import LoadingState from "./components/states/LoadingState";
import ForecastList from "./components/ForecastList";
import SearchBar from "./components/SearchBar";
import UnitToggle from "./components/UnitToggle";
import { useWeather } from "./hooks/useWeather";
import type { Unit } from "./types/weather";

export default function App() {
  const [unit, setUnit] = useState<Unit>("celsius");
  const { cities, data, error, refresh, retry, search, selectCity, status } = useWeather();
  const resultRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (status === "success") {
      resultRef.current?.focus();
    }
  }, [status]);

  const errorMessage = error?.kind === "timeout"
    ? "A requisição demorou demais. Tente novamente."
    : error?.kind === "network"
      ? "Falha de rede. Confira sua conexão e tente novamente."
      : "Não foi possível carregar os dados. Tente novamente.";

  function renderContent() {
    switch (status) {
      case "loading":
        return <LoadingState />;
      case "empty":
        return <EmptyState />;
      case "error":
        return (
          <div className="space-y-6">
            <ErrorState message={errorMessage} onRetry={retry} />
            {data && (
              <div className="space-y-8">
                <CurrentWeather city={data.city} current={data.current} fetchedAt={data.fetchedAt} resultRef={resultRef} unit={unit} />
                <ForecastList forecast={data.forecast} unit={unit} />
              </div>
            )}
          </div>
        );
      case "success":
        if (!data) {
          return <p aria-live="polite" className="rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-300">Selecione uma cidade para carregar a previsão.</p>;
        }
        return (
          <div className="space-y-8">
            <div className="flex justify-end">
              <button className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun" onClick={refresh} type="button">Atualizar</button>
            </div>
            <CurrentWeather city={data.city} current={data.current} fetchedAt={data.fetchedAt} resultRef={resultRef} unit={unit} />
            <ForecastList forecast={data.forecast} unit={unit} />
          </div>
        );
      default:
        return (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-md">
            <p className="text-lg font-semibold text-white">Pesquise uma cidade para começar</p>
            <p className="mt-2 text-sm text-slate-300">Veja as condições atuais e os próximos cinco dias.</p>
          </div>
        );
    }
  }

  return (
    <div className="min-h-screen overflow-hidden text-white">
      <header className="border-b border-white/10 bg-night-900/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <a className="flex items-center gap-3" href="/" aria-label="WeatherView início">
            <span aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-2xl bg-sun text-xl text-night-900">☀</span>
            <span>
              <span className="block text-lg font-bold tracking-tight">WeatherView</span>
              <span className="block text-xs text-slate-400">Tempo para decidir melhor</span>
            </span>
          </a>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
            <SearchBar cities={status === "success" ? cities : []} disabled={status === "loading"} onSearch={search} onSelect={selectCity} />
            <UnitToggle onChange={setUnit} unit={unit} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div aria-busy={status === "loading"} className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-400">Previsão local</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">Um olhar claro para os próximos dias.</h1>
          <p className="mt-4 text-base leading-7 text-slate-300">Condições atuais e uma previsão de cinco dias para ajudar você a planejar o que vem pela frente.</p>
        </div>
        {renderContent()}
        <footer className="mt-10 border-t border-white/10 pt-5 text-xs text-slate-400">Dados meteorológicos por Open-Meteo</footer>
      </main>
    </div>
  );
}
