import type { City } from "../types/weather";

interface SearchBarProps {
  onSearch: (city: string) => void;
  onSelect?: (city: City) => void;
  cities?: City[];
  disabled?: boolean;
}

export default function SearchBar({ onSearch, onSelect, cities = [], disabled = false }: SearchBarProps) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const city = String(formData.get("city") ?? "").trim();

    if (city && !disabled) {
      onSearch(city);
    }
  }

  return (
    <form aria-busy={disabled} className="relative w-full max-w-xl" role="search" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="city-search">
        Buscar cidade
      </label>
      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 shadow-glass backdrop-blur-md">
        <input
          aria-label="Buscar cidade"
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun focus-visible:ring-offset-2 focus-visible:ring-offset-night-900"
          disabled={disabled}
          id="city-search"
          name="city"
          placeholder="Buscar cidade..."
          type="search"
        />
        <button
          className="rounded-xl bg-accent-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
          type="submit"
        >
          Buscar
        </button>
      </div>
      {cities.length > 0 && onSelect && (
        <div aria-label="Sugestões de cidade" className="absolute z-10 mt-2 w-full rounded-2xl border border-white/10 bg-night-800 p-2 shadow-glass" role="listbox">
          {cities.map((city) => (
            <button
              className="block w-full rounded-xl px-3 py-3 text-left text-sm text-slate-200 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun"
              key={city.id}
              onClick={() => onSelect(city)}
              role="option"
              type="button"
            >
              <span className="block font-semibold">{city.name}</span>
              <span className="block text-xs text-slate-400">{[city.region, city.country].filter(Boolean).join(", ")}</span>
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
