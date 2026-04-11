import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import type { CachedSession } from "./types.js";

const CACHE_PATH = join(homedir(), ".cache", "domo-cli", "session.json");

type CacheStore = Record<string, CachedSession>;

function readStore(): CacheStore {
  try {
    return JSON.parse(readFileSync(CACHE_PATH, "utf-8"));
  } catch {
    return {};
  }
}

function writeStore(store: CacheStore): void {
  const dir = dirname(CACHE_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  // Prune expired entries before saving
  const now = Date.now();
  const clean: CacheStore = {};
  for (const [k, v] of Object.entries(store)) {
    if (v.expiresAt > now) clean[k] = v;
  }

  writeFileSync(CACHE_PATH, JSON.stringify(clean, null, 2));
}

/**
 * Load a cached SID for an instance if still valid.
 */
export function loadCachedSession(instance: string): CachedSession | null {
  const store = readStore();
  const entry = store[instance];
  if (entry && Date.now() < entry.expiresAt) return entry;
  return null;
}

/**
 * Persist a session to the disk cache.
 */
export function saveCachedSession(instance: string, session: CachedSession): void {
  const store = readStore();
  store[instance] = session;
  writeStore(store);
}
