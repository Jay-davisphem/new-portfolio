"use client";

import { PORTFOLIO_STORAGE_KEYS } from "@/lib/storage/keys";

const SESSION_UNLOCK_KEY = "portfolio:admin:unlocked:v1";
const SESSION_LAST_ACTIVE_AT_KEY = "portfolio:admin:lastActiveAt:v1";

export type EnsureAdminResult =
  | { ok: true }
  | { ok: false; reason: "not-configured" | "invalid-passphrase" };

function isBrowser() {
  return typeof window !== "undefined";
}

function nowMs() {
  return Date.now();
}

function toBase64(bytes: Uint8Array) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function fromBase64(base64: string) {
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function pbkdf2Sha256(passphrase: string, salt: Uint8Array) {
  const enc = new TextEncoder();
  const safeSalt = new Uint8Array(salt);
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: safeSalt,
      iterations: 140_000,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  );
  return new Uint8Array(bits);
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a[i] ^ b[i];
  return out === 0;
}

export function getAdminConfigStatus(): "configured" | "not-configured" {
  if (!isBrowser()) return "not-configured";
  const hash = localStorage.getItem(PORTFOLIO_STORAGE_KEYS.adminHash);
  const salt = localStorage.getItem(PORTFOLIO_STORAGE_KEYS.adminSalt);
  return hash && salt ? "configured" : "not-configured";
}

export async function configureAdminPassphrase(passphrase: string): Promise<void> {
  if (!isBrowser()) return;
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2Sha256(passphrase, salt);
  localStorage.setItem(PORTFOLIO_STORAGE_KEYS.adminSalt, toBase64(salt));
  localStorage.setItem(PORTFOLIO_STORAGE_KEYS.adminHash, toBase64(hash));
}

export async function verifyAdminPassphrase(passphrase: string): Promise<EnsureAdminResult> {
  if (!isBrowser()) return { ok: false, reason: "not-configured" };

  const storedSalt = localStorage.getItem(PORTFOLIO_STORAGE_KEYS.adminSalt);
  const storedHash = localStorage.getItem(PORTFOLIO_STORAGE_KEYS.adminHash);

  if (!storedSalt || !storedHash) return { ok: false, reason: "not-configured" };

  const salt = fromBase64(storedSalt);
  const expected = fromBase64(storedHash);
  const got = await pbkdf2Sha256(passphrase, salt);

  return constantTimeEqual(got, expected)
    ? { ok: true }
    : { ok: false, reason: "invalid-passphrase" };
}

export function setAdminUnlocked(unlocked: boolean) {
  if (!isBrowser()) return;
  if (unlocked) {
    sessionStorage.setItem(SESSION_UNLOCK_KEY, "1");
    sessionStorage.setItem(SESSION_LAST_ACTIVE_AT_KEY, String(nowMs()));
  } else {
    sessionStorage.removeItem(SESSION_UNLOCK_KEY);
    sessionStorage.removeItem(SESSION_LAST_ACTIVE_AT_KEY);
  }
}

export function isAdminUnlocked(options?: { timeoutMs?: number }): boolean {
  if (!isBrowser()) return false;

  const timeoutMs = options?.timeoutMs ?? 10 * 60 * 1000; // 10 minutes
  const unlocked = sessionStorage.getItem(SESSION_UNLOCK_KEY) === "1";
  if (!unlocked) return false;

  const last = Number(sessionStorage.getItem(SESSION_LAST_ACTIVE_AT_KEY) ?? "0");
  if (!last || !Number.isFinite(last)) return false;

  if (nowMs() - last > timeoutMs) {
    setAdminUnlocked(false);
    return false;
  }

  return true;
}

export function touchAdminActivity() {
  if (!isBrowser()) return;
  if (sessionStorage.getItem(SESSION_UNLOCK_KEY) !== "1") return;
  sessionStorage.setItem(SESSION_LAST_ACTIVE_AT_KEY, String(nowMs()));
}
