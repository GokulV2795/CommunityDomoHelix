import type { CachedSession } from "./types.js";

/**
 * Exchange a ryuu refresh token for a Domo SID.
 *
 * Flow:
 *   1. POST /api/oauth2/token  → access_token
 *   2. GET  /api/oauth2/sid    → sid
 *
 * Returns a CachedSession with a 55-minute TTL (Domo tokens last ~60 min).
 */
export async function exchangeRefreshForSID(
  instance: string,
  refreshToken: string
): Promise<CachedSession> {
  // Step 1: Refresh token → access token
  const tokenRes = await fetch(`https://${instance}/api/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: "domo:internal:devstudio",
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!tokenRes.ok) {
    throw new Error(
      `Token exchange failed for ${instance}: ${tokenRes.status} ${await tokenRes.text()}`
    );
  }

  const { access_token } = (await tokenRes.json()) as { access_token: string };

  // Step 2: Access token → SID
  const sidRes = await fetch(`https://${instance}/api/oauth2/sid`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!sidRes.ok) {
    throw new Error(
      `SID exchange failed for ${instance}: ${sidRes.status} ${await sidRes.text()}`
    );
  }

  const { sid } = (await sidRes.json()) as { sid: string };

  return {
    sid,
    expiresAt: Date.now() + 55 * 60 * 1000, // 55-minute TTL
  };
}
