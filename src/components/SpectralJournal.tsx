import { useEffect, useMemo, useState } from "react";
import {
  clearSpectralJournal,
  deleteSpectralEntry,
  getSpectralJournal,
  saveSpectralJournalEntry,
  updateSpectralEntry,
  type SpectralJournalEntry,
} from "../utils/spectralJournal";

const APP_URL = "https://benoitlub.github.io/SpecTRL/";
const PAYPAL_URL = "https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=benoitlubert@gmail.com&currency_code=EUR&item_name=Support+SpecTRL";
const LAB_LINE = "Aucune entité n’a été rémunérée pendant cette manifestation. Marty Labs accepte les dons en piles, en silence ou en Wi-Fi stable.";
const SHARE_CTA_TEXT = "Scanne toi aussi les tyrans du courant d’air :";
const SHARE_CTA = `${SHARE_CTA_TEXT}\n${APP_URL}`;

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return value;
  }
}

function Metric({ label, value, suffix = "" }: { label: string; value?: number; suffix?: string }) {
  if (value === undefined || value === null) return null;
  return (
    <span className="rounded border px-1.5 py-0.5 text-[8px] font-mono tracking-wider" style={{ borderColor: "#9b59ff2e", color: "#d6c0ff" }}>
      {label}: {value}{suffix}
    </span>
  );
}

function buildShareText(entry: SpectralJournalEntry, includeUrl = true) {
  const place = entry.locationNote || entry.habitat || "rémanence non localisée";
  return [
    "SpecTRL a intercepté :",
    `${entry.signatureName} — ${entry.confidence}%`,
    `“${entry.translation}”`,
    `Lieu : ${place}`,
    `Date : ${formatDate(entry.createdAt)}`,
    "",
    LAB_LINE,
    "",
    includeUrl ? SHARE_CTA : SHARE_CTA_TEXT,
  ].join("\n");
}

export function SpectralJournal({ latestEntry, compact = false }: { latestEntry: SpectralJournalEntry | null; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<SpectralJournalEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState("");

  useEffect(() => {
    setEntries(getSpectralJournal());
  }, [latestEntry]);

  const selected = useMemo(() => entries.find(entry => entry.id === selectedId) || entries[0] || null, [entries, selectedId]);
  const visibleEntries = compact ? entries.slice(0, 5) : entries;

  const updateSelected = (patch: Partial<SpectralJournalEntry>) => {
    if (!selected) return;
    const next = updateSpectralEntry(selected.id, patch);
    setEntries(next);
  };

  const removeSelected = () => {
    if (!selected) return;
    const next = deleteSpectralEntry(selected.id);
    setEntries(next);
    setSelectedId(next[0]?.id || null);
  };

  const wipe = () => {
    const ok = window.confirm("Effacer tout le journal local SpecTRL ? Les entités feront semblant de l’avoir voulu.");
    if (!ok) return;
    setEntries(clearSpectralJournal());
    setSelectedId(null);
  };

  const shareSelected = async () => {
    if (!selected) return;
    const fullText = buildShareText(selected, true);
    const nativeText = buildShareText(selected, false);
    setShareStatus("");
    try {
      if (navigator.share) {
        await navigator.share({ title: `SpecTRL — ${selected.signatureName}`, text: nativeText, url: APP_URL });
        setShareStatus("Trace partagée. Marty nie toute mise en scène.");
        return;
      }
      await navigator.clipboard.writeText(fullText);
      setShareStatus("Trace copiée avec le lien SpecTRL.");
    } catch {
      try {
        await navigator.clipboard.writeText(fullText);
        setShareStatus("Partage annulé, mais trace copiée avec le lien SpecTRL.");
      } catch {
        setShareStatus("Partage impossible ici. Le tiroir conserve une influence considérable.");
      }
    }
  };

  const donate = () => {
    window.open(PAYPAL_URL, "_blank", "noopener,noreferrer");
  };

  const copyLabLine = async () => {
    try {
      await navigator.clipboard.writeText(`${LAB_LINE}\n\n${SHARE_CTA}\n\nDon PayPal : benoitlubert@gmail.com`);
      setShareStatus("Appel Marty copié avec le lien et le PayPal.");
    } catch {
      setShareStatus(`${LAB_LINE}\n\n${SHARE_CTA}\n\nPayPal : benoitlubert@gmail.com`);
    }
  };

  const saveAgain = () => {
    if (!latestEntry) return;
    const next = saveSpectralJournalEntry(latestEntry);
    setEntries(next);
    setSelectedId(latestEntry.id);
    setShareStatus("Dernière trace archivée dans le journal.");
  };

  return (
    <div className="rounded border p-2 backdrop-blur-sm" style={{ borderColor: "#9b59ff30", background: "rgba(7,5,22,0.66)", boxShadow: "inset 0 0 16px rgba(155,89,255,0.06)" }}>
      <button type="button" onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between gap-2 text-left">
        <span className="text-[9px] font-mono tracking-[0.32em] uppercase text-purple-300/85">Journal des traces spectrales</span>
        <span className="text-[8px] font-mono tracking-wider text-gray-500">
          {entries.length} trace{entries.length > 1 ? "s" : ""} // {open ? "fermer" : "ouvrir"}
        </span>
      </button>

      {latestEntry && !open && (
        <div className="mt-2 flex items-center justify-between gap-2 text-[8px] font-mono text-green-300/70 tracking-wider">
          <span className="truncate">Dernière rémanence : {latestEntry.signatureName} — {latestEntry.confidence}%</span>
          <button type="button" onClick={saveAgain} className="text-purple-200/80 uppercase tracking-wider">archiver</button>
        </div>
      )}

      {open && (
        <div className="mt-3 grid grid-cols-1 gap-3">
          <div className="space-y-1 max-h-44 overflow-auto pr-1">
            {entries.length === 0 && (
              <div className="text-[9px] font-mono text-gray-600 tracking-wider border rounded p-2" style={{ borderColor: "#ffffff11" }}>
                Aucune rémanence archivée. Appuie sur STOP après un scan pour capturer une trace Marty.
              </div>
            )}
            {visibleEntries.map(entry => (
              <button
                key={entry.id}
                type="button"
                onClick={() => setSelectedId(entry.id)}
                className="w-full text-left rounded border px-2 py-1.5 transition-all"
                style={{
                  borderColor: selected?.id === entry.id ? "#9b59ff66" : "#ffffff11",
                  background: selected?.id === entry.id ? "rgba(155,89,255,0.08)" : "rgba(255,255,255,0.02)",
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] font-mono text-purple-100 truncate">{entry.signatureName}</span>
                  <span className="text-[8px] font-mono text-cyan-300">{entry.confidence}%</span>
                </div>
                <div className="text-[8px] font-mono text-gray-500 truncate">{formatDate(entry.createdAt)}</div>
              </button>
            ))}
          </div>

          {selected && (
            <div className="rounded border p-2 space-y-2" style={{ borderColor: "#ffffff12", background: "rgba(2,8,20,0.6)" }}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-mono font-bold text-white tracking-wider">{selected.signatureName}</div>
                  <div className="text-[8px] font-mono text-gray-500 tracking-wider">
                    {formatDate(selected.createdAt)} // {selected.habitat}
                  </div>
                </div>
                <button type="button" onClick={() => updateSelected({ favorite: !selected.favorite })} className="text-lg leading-none" title="Favori">
                  {selected.favorite ? "★" : "☆"}
                </button>
              </div>

              <div className="rounded border p-2 text-[11px] font-mono leading-relaxed text-purple-50/90 whitespace-pre-line" style={{ borderColor: "#9b59ff28" }}>
                {selected.translation}
              </div>

              {!compact && (
                <>
                  <div className="flex flex-wrap gap-1">
                    <Metric label="Freq" value={selected.metrics.dominantFreq} suffix="Hz" />
                    <Metric label="Spectre" value={selected.metrics.spectralCentroid} suffix="Hz" />
                    <Metric label="RMS" value={selected.metrics.rms} suffix="%" />
                    <Metric label="Résonance" value={selected.metrics.resonance} suffix="%" />
                    <Metric label="Clarté" value={selected.metrics.clarity} suffix="%" />
                  </div>

                  <label className="block space-y-1">
                    <span className="text-[8px] font-mono text-gray-500 tracking-wider uppercase">Lieu / contexte</span>
                    <input
                      value={selected.locationNote}
                      onChange={event => updateSelected({ locationNote: event.target.value })}
                      placeholder="Salon, couloir, cuisine, grenier, rideau vexé..."
                      className="w-full rounded border bg-transparent px-2 py-1 text-[10px] font-mono text-gray-200 outline-none"
                      style={{ borderColor: "#ffffff18" }}
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="text-[8px] font-mono text-gray-500 tracking-wider uppercase">Notes</span>
                    <textarea
                      value={selected.userNotes}
                      onChange={event => updateSelected({ userNotes: event.target.value })}
                      placeholder="Ex : rideau immobile mais arrogant, box suspecte, café tiède..."
                      className="w-full min-h-16 rounded border bg-transparent px-2 py-1 text-[10px] font-mono text-gray-200 outline-none"
                      style={{ borderColor: "#ffffff18" }}
                    />
                  </label>
                </>
              )}

              <div className="rounded border p-2 space-y-1" style={{ borderColor: "#9b59ff22", background: "rgba(155,89,255,0.04)" }}>
                <div className="text-[8px] font-mono tracking-[0.22em] uppercase text-purple-300/80">Partager / soutenir</div>
                <div className="text-[9px] font-mono text-purple-100/70 leading-relaxed">{LAB_LINE}</div>
                <div className="text-[8px] font-mono text-cyan-200/70 leading-relaxed whitespace-pre-line">{SHARE_CTA}</div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button type="button" onClick={shareSelected} className="rounded border border-cyan-300/25 px-2 py-1 text-[8px] font-mono tracking-wider text-cyan-300 uppercase">Partager</button>
                  <button type="button" onClick={donate} className="rounded border border-orange-300/25 px-2 py-1 text-[8px] font-mono tracking-wider text-orange-300 uppercase">Don PayPal</button>
                  <button type="button" onClick={copyLabLine} className="rounded border border-purple-300/25 px-2 py-1 text-[8px] font-mono tracking-wider text-purple-300 uppercase">Copier appel</button>
                </div>
                {shareStatus && <div className="text-[8px] font-mono text-green-300/70 tracking-wider pt-1 whitespace-pre-line">{shareStatus}</div>}
              </div>

              <div className="flex justify-between gap-2 pt-1">
                <button type="button" onClick={removeSelected} className="text-[8px] font-mono tracking-wider text-red-300/70 uppercase">Supprimer</button>
                <button type="button" onClick={wipe} className="text-[8px] font-mono tracking-wider text-gray-500 uppercase">Effacer tout</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
