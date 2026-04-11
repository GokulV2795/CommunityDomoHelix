import type { DomoAuth } from "../auth/index.js";
import type { DomoResult } from "./types.js";
import { ok, fail } from "./types.js";

export async function listCards(auth: DomoAuth, pageId: string): Promise<DomoResult> {
  const res = await auth.fetch(`/api/content/v1/pages/${pageId}/cards`);
  if (!res.ok) return fail(res);
  return ok(await res.json());
}

export async function getCardDetails(auth: DomoAuth, cardId: string): Promise<DomoResult> {
  const res = await auth.fetch(`/api/content/v1/cards/${cardId}/details`);
  if (!res.ok) return fail(res);
  return ok(await res.json());
}

export async function getCardData(auth: DomoAuth, cardId: string): Promise<DomoResult> {
  const res = await auth.fetch(`/api/content/v1/cards/${cardId}/data`);
  if (!res.ok) return fail(res);
  return ok(await res.json());
}

export async function createCard(auth: DomoAuth, pageId: string, body: unknown): Promise<DomoResult> {
  const res = await auth.fetch(`/api/content/v3/cards/kpi?pageId=${pageId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  if (!res.ok) return fail(res);
  return ok(await res.json());
}

export async function updateCard(auth: DomoAuth, cardId: string, body: unknown): Promise<DomoResult> {
  const res = await auth.fetch(`/api/content/v3/cards/kpi/${cardId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  if (!res.ok) return fail(res);
  return ok(await res.json());
}
