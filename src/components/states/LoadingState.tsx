export default function LoadingState() {
  return (
    <div aria-busy="true" aria-live="polite" className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-md" role="status">
      <div aria-hidden="true" className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-accent-400 border-t-transparent" />
      <p className="mt-4 text-slate-300">Buscando condições...</p>
    </div>
  );
}
