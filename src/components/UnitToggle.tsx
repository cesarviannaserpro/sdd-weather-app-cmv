import type { Unit } from "../types/weather";

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  return (
    <div aria-label="Unidade de temperatura" className="flex rounded-xl border border-white/10 bg-white/5 p-1" role="group">
      {(["celsius", "fahrenheit"] as const).map((option) => {
        const isActive = unit === option;
        return (
          <button
            aria-pressed={isActive}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${isActive ? "bg-accent-500 text-white" : "text-slate-400 hover:text-white"}`}
            key={option}
            onClick={() => onChange(option)}
            type="button"
          >
            {option === "celsius" ? "°C" : "°F"}
          </button>
        );
      })}
    </div>
  );
}
