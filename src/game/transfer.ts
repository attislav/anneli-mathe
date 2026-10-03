"use client";

// Spielstand mitnehmen — ohne Server.
//
// Der ganze Spielstand wird zu einem Text-Code: JSON → zusammengepresst
// (deflate) → Base64url, vorne „SP1." als Erkennung. Den Code kann man
// kopieren, teilen (AirDrop, Nachricht) oder als QR-Code scannen. Der QR-Code
// enthält einen Link `…/#spielstand=CODE`; die App fragt beim Öffnen nach.

import { readSave, type SaveState } from "./state";

const PREFIX = "SP1.";
const PREFIX_RAW = "SP0.";

function toB64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(text: string): Uint8Array {
  const b64 = text.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const out = new Blob([bytes as BlobPart]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

const canCompress = () => typeof CompressionStream !== "undefined" && typeof DecompressionStream !== "undefined";

/** Der aktuelle Spielstand als Text-Code. */
export async function exportCode(): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(readSave()));
  if (!canCompress()) return PREFIX_RAW + toB64url(json);
  return PREFIX + toB64url(await pipe(json, new CompressionStream("deflate-raw")));
}

/** Liest einen Code. `null`, wenn er kaputt ist oder kein Spielstand drinsteckt. */
export async function parseCode(input: string): Promise<Partial<SaveState> | null> {
  const code = input.trim().replace(/^.*#spielstand=/, "").replace(/\s+/g, "");
  try {
    let bytes: Uint8Array;
    if (code.startsWith(PREFIX)) {
      if (!canCompress()) return null;
      bytes = await pipe(fromB64url(code.slice(PREFIX.length)), new DecompressionStream("deflate-raw"));
    } else if (code.startsWith(PREFIX_RAW)) {
      bytes = fromB64url(code.slice(PREFIX_RAW.length));
    } else {
      return null;
    }
    const data = JSON.parse(new TextDecoder().decode(bytes)) as Partial<SaveState>;
    if (data.v !== 1 || !data.profile || typeof data.nodes !== "object") return null;
    return data;
  } catch {
    return null;
  }
}

/** Link für den QR-Code — öffnet die App und bietet die Übernahme an. */
export function importLink(code: string): string {
  return `${window.location.origin}/#spielstand=${code}`;
}
