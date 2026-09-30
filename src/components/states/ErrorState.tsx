interface ErrorStateProps {
  onRetry: () => void;
  message?: string;
}

export default function ErrorState({ onRetry, message = "Não foi possível carregar os dados. Confira a conexão e tente novamente." }: ErrorStateProps) {
  return (
    <div aria-live="assertive" className="rounded-3xl border border-red-300/20 bg-red-400/10 p-8 text-center backdrop-blur-md" role="alert">
      <p className="text-lg font-semibold text-white">{message}</p>
      <button className="mt-6 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-night-900 transition hover:bg-slate-100" onClick={onRetry} type="button">Tentar novamente</button>
    </div>
  );
}
