interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const city = String(formData.get("city") ?? "").trim();

    if (city && !disabled) {
      onSearch(city);
    }
  }

  return (
    <form aria-busy={disabled} className="w-full max-w-xl" role="search" onSubmit={handleSubmit}>
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
    </form>
  );
}
