"use client";

// Spielstand mitnehmen: Code/QR erzeugen (Eltern-Ecke) und übernehmen —
// per eingefügtem Code oder über den Link aus dem QR-Code.

import { useEffect, useState } from "react";
import { Check, Copy, QrCode as QrIcon, Share2 } from "lucide-react";
import { exportCode, importLink, parseCode } from "@/game/transfer";
import { readSave, replaceSave, type SaveState } from "@/game/state";
import { Button } from "./Button";
import { Sheet } from "./chrome";
import { QrCode } from "./QrCode";

/** Ab dieser Länge wird der QR-Code zu fein zum Scannen vom Bildschirm. */
const QR_MAX = 2300;

function summary(s: Partial<SaveState>): string {
  const stars = Object.values(s.nodes ?? {}).reduce((a, n) => a + n.stars.reduce((x, y) => x + y, 0), 0);
  return `${s.profile?.name ?? "Unbekannt"} · ${stars} Sterne · ${s.coins ?? 0} Münzen`;
}

export function TransferSection() {
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [paste, setPaste] = useState("");
  const [incoming, setIncoming] = useState<Partial<SaveState> | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const makeCode = async () => setCode(await exportCode());
  const copy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  const share = async () => {
    if (!code) return;
    try {
      await navigator.share({ title: "Sternenpfad-Spielstand", text: `Sternenpfad-Spielstand von ${readSave().profile?.name ?? ""}:\n${code}` });
    } catch {
      // abgebrochen
    }
  };
  const check = async () => {
    setError("");
    const data = await parseCode(paste);
    if (!data) setError("Der Code passt nicht. Bitte ganz kopieren und nochmal einfügen.");
    setIncoming(data);
  };

  return (
    <div className="flex flex-col gap-3 rounded-[22px] bg-mist p-4">
      <div className="font-extrabold">Spielstand mitnehmen</div>
      <p className="text-sm text-ink-soft">Auf ein anderes Gerät umziehen: Code erstellen und dort unter „Spielstand übernehmen“ einfügen – oder den QR-Code mit der Kamera scannen.</p>
      {!code ? (
        <Button tone="grape" size="md" onClick={makeCode}>
          <QrIcon size={20} /> Code erstellen
        </Button>
      ) : (
        <>
          {code.length <= QR_MAX && (
            <div className="flex justify-center">
              <QrCode text={importLink(code)} size={280} />
            </div>
          )}
          <div className="max-h-20 overflow-y-auto break-all rounded-xl bg-white p-2 font-mono text-[11px] font-normal text-ink-soft">{code}</div>
          <div className="grid grid-cols-2 gap-2">
            <Button tone="white" size="md" onClick={copy}>
              {copied ? <Check size={20} /> : <Copy size={20} />} {copied ? "Kopiert" : "Kopieren"}
            </Button>
            <Button tone="white" size="md" onClick={share}>
              <Share2 size={20} /> Teilen
            </Button>
          </div>
        </>
      )}

      <div className="mt-2 font-extrabold">Spielstand übernehmen</div>
      {done ? (
        <p className="rounded-xl bg-leaf-light p-3 text-sm font-extrabold text-leaf-dark">Übernommen! Viel Spaß beim Weiterspielen.</p>
      ) : (
        <>
          <textarea value={paste} onChange={(e) => setPaste(e.target.value)} rows={3} placeholder="Code hier einfügen (beginnt mit SP1.)" aria-label="Code einfügen" className="rounded-xl border-4 border-grape-light bg-white p-2 font-mono text-xs font-normal outline-none focus:border-grape" />
          {error && <p className="text-sm font-extrabold text-rose-dark">{error}</p>}
          <Button tone="sky" size="md" disabled={paste.trim().length < 10} onClick={check}>
            Prüfen
          </Button>
        </>
      )}
      {incoming && (
        <ConfirmImport
          incoming={incoming}
          onClose={() => setIncoming(null)}
          onDone={() => {
            setIncoming(null);
            setPaste("");
            setDone(true);
          }}
        />
      )}
    </div>
  );
}

function ConfirmImport({ incoming, onClose, onDone }: { incoming: Partial<SaveState>; onClose: () => void; onDone: () => void }) {
  const current = readSave();
  return (
    <Sheet open onClose={onClose}>
      <div className="flex flex-col gap-3">
        <h2 className="font-display text-2xl font-semibold">Spielstand übernehmen?</h2>
        <div className="rounded-xl bg-leaf-light p-3 font-extrabold">Neu: {summary(incoming)}</div>
        {current.profile && (
          <p className="text-sm text-ink-soft">
            Der Stand auf diesem Gerät (<b>{summary(current)}</b>) wird dabei ersetzt.
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button tone="white" size="md" onClick={onClose}>
            Abbrechen
          </Button>
          <Button
            tone="leaf"
            size="md"
            onClick={() => {
              replaceSave(incoming);
              onDone();
            }}
          >
            Übernehmen
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

/** Öffnet sich, wenn die App über den Link aus dem QR-Code gestartet wurde. */
export function ImportFromLink() {
  const [incoming, setIncoming] = useState<Partial<SaveState> | null>(null);

  useEffect(() => {
    if (!window.location.hash.startsWith("#spielstand=")) return;
    const hash = window.location.hash;
    // Code aus der Adresszeile nehmen, damit ein Neuladen nicht nochmal fragt.
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    void parseCode(hash).then(setIncoming);
  }, []);

  if (!incoming) return null;
  return <ConfirmImport incoming={incoming} onClose={() => setIncoming(null)} onDone={() => window.location.reload()} />;
}
