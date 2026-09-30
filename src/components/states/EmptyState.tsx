export default function EmptyState() {
  return (
    <div aria-live="polite" className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-md" role="status" tabIndex={-1}>
      <p className="text-lg font-semibold text-white">Nenhuma cidade encontrada</p>
      <p className="mt-2 text-sm text-slate-300">Confira a grafia ou tente outro nome.</p>
    </div>
  );
}
