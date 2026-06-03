type IntroOverlayProps = {
  onEnter: () => void;
};

export function IntroOverlay({ onEnter }: IntroOverlayProps) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4" style={{ background: "radial-gradient(circle at 50% 20%, rgba(0,212,255,0.13), transparent 28%), radial-gradient(circle at 20% 80%, rgba(155,89,255,0.11), transparent 30%), rgba(1,4,12,0.96)" }}>
      <div className="absolute inset-0 pointer-events-none opacity-40" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.22) 3px, rgba(0,0,0,0.22) 5px)" }} />

      <div className="relative w-full max-w-md rounded-2xl border p-5 sm:p-6 overflow-hidden" style={{ borderColor: "rgba(0,212,255,0.32)", background: "linear-gradient(180deg, rgba(2,10,24,0.96), rgba(2,4,12,0.91))", boxShadow: "0 0 40px rgba(0,212,255,0.16), inset 0 0 30px rgba(0,212,255,0.06)" }}>
        <div className="absolute -top-20 -right-20 w-44 h-44 rounded-full" style={{ background: "radial-gradient(circle, rgba(0,212,255,0.18), transparent 62%)" }} />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,140,0,0.12), transparent 64%)" }} />

        <div className="relative">
          <div className="text-[10px] font-mono tracking-[0.42em] uppercase text-orange-300/80 mb-2">MARTY LABS // FIELD ACCESS</div>
          <h1 className="text-3xl sm:text-4xl font-mono font-bold tracking-[0.18em] uppercase text-cyan-300" style={{ textShadow: "0 0 18px rgba(0,212,255,0.75)" }}>
            SpecTRL
          </h1>
          <div className="mt-1 text-[10px] font-mono tracking-[0.28em] uppercase text-cyan-100/45">V.0.2.1 — Trace Resonance Logger</div>

          <div className="mt-5 rounded-xl border p-3" style={{ borderColor: "rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.035)" }}>
            <p className="text-sm leading-relaxed text-slate-200/90">
              Ce protocole utilise de vrais signaux audio et environnementaux, puis les interprète comme des rémanences narratives.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-300/75">
              Les fragments détectés peuvent être des souvenirs, des parasites, une pièce qui craque, ou un esprit qui pense que personne ne l'écoute.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-[9px] font-mono tracking-[0.16em] uppercase text-slate-400">
            <div className="rounded border border-cyan-400/15 bg-cyan-400/5 px-2 py-2">Micro : actif</div>
            <div className="rounded border border-purple-400/15 bg-purple-400/5 px-2 py-2">Marty : douteux</div>
            <div className="rounded border border-orange-400/15 bg-orange-400/5 px-2 py-2">Preuve : non</div>
            <div className="rounded border border-green-400/15 bg-green-400/5 px-2 py-2">Ambiance : oui</div>
          </div>

          <button
            onClick={onEnter}
            className="mt-5 w-full rounded-xl border px-4 py-3 font-mono text-xs tracking-[0.22em] uppercase transition-transform active:scale-[0.98]"
            style={{ borderColor: "rgba(0,212,255,0.42)", color: "#bff7ff", background: "linear-gradient(90deg, rgba(0,212,255,0.13), rgba(155,89,255,0.12))", boxShadow: "0 0 18px rgba(0,212,255,0.14)" }}
          >
            Entrer dans le protocole
          </button>

          <button
            onClick={onEnter}
            className="mt-3 w-full text-[9px] font-mono uppercase tracking-[0.18em] text-slate-500"
          >
            Marty affirme que c'est suffisamment stable
          </button>
        </div>
      </div>
    </div>
  );
}
