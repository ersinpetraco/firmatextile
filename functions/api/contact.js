// Cloudflare Pages Function: delivers contact form enquiries to info@firmatextile.com through the Zoho Mail API.
// Requires env vars ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN (Self Client on the EU data centre,
// scopes ZohoMail.messages.CREATE and ZohoMail.accounts.READ).
// Optional: CONTACT_TO, CONTACT_FROM, ZOHO_ACCOUNTS_HOST, ZOHO_MAIL_HOST.
const LIMITS = { name: 120, company: 160, email: 200, message: 5000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Access tokens last an hour and the account id never changes, so both are kept for the life of the
// isolate rather than re-fetched on every enquiry. Neither holds visitor data.
let tokenCache = { token: null, expiresAt: 0 };
let accountCache = null;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

async function getAccessToken(env) {
  const now = Date.now();
  if (tokenCache.token && now < tokenCache.expiresAt) return tokenCache.token;

  const host = env.ZOHO_ACCOUNTS_HOST || "accounts.zoho.eu";
  const res = await fetch(`https://${host}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: env.ZOHO_REFRESH_TOKEN,
      client_id: env.ZOHO_CLIENT_ID,
      client_secret: env.ZOHO_CLIENT_SECRET,
      grant_type: "refresh_token",
    }),
  });

  // Zoho answers 200 with an "error" key when the refresh token is revoked or the client is wrong.
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.access_token) {
    throw new Error(`token refresh failed (${res.status}): ${data?.error || "no access_token"}`);
  }

  tokenCache = {
    token: data.access_token,
    expiresAt: now + (Number(data.expires_in) || 3600) * 1000 - 60_000,
  };
  return tokenCache.token;
}

async function getAccount(env, token, preferred) {
  if (accountCache) return accountCache;

  const host = env.ZOHO_MAIL_HOST || "mail.zoho.eu";
  const res = await fetch(`https://${host}/api/accounts`, {
    headers: { Authorization: `Zoho-oauthtoken ${token}` },
  });
  const data = await res.json().catch(() => null);
  const accounts = Array.isArray(data?.data) ? data.data : [];
  if (!res.ok || !accounts.length) {
    throw new Error(`account lookup failed (${res.status}): ${data?.status?.description || "no accounts"}`);
  }

  const sendable = (a) => (a.sendMailDetails || []).map((d) => String(d.fromAddress || "")).filter(Boolean);
  const eq = (a, b) => a.toLowerCase() === String(b).toLowerCase();

  // Zoho rejects a fromAddress the authenticated account is not allowed to send as, so prefer the
  // configured address only when the account actually owns it and otherwise fall back to the address
  // it does own. Better a sender that is not info@ than an enquiry that never arrives.
  const match = accounts.find((a) => sendable(a).some((x) => eq(x, preferred)));
  const account = match || accounts[0];
  const fromAddress = match ? preferred : sendable(account)[0];
  if (!fromAddress) throw new Error("account has no sendable from address");
  if (!match) console.log(`contact: ${preferred} not sendable, using ${fromAddress}`);

  accountCache = { accountId: String(account.accountId), fromAddress };
  return accountCache;
}

async function sendMail(env, token, accountId, payload) {
  const host = env.ZOHO_MAIL_HOST || "mail.zoho.eu";
  const res = await fetch(`https://${host}/api/accounts/${accountId}/messages`, {
    method: "POST",
    headers: { Authorization: `Zoho-oauthtoken ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => null);
  const ok = res.ok && Number(data?.status?.code ?? 200) === 200;
  return { ok, status: res.status, detail: data?.status?.description || data?.data?.moreInfo || "" };
}

export async function onRequestPost({ request, env }) {
  if (!env.ZOHO_CLIENT_ID || !env.ZOHO_CLIENT_SECRET || !env.ZOHO_REFRESH_TOKEN) {
    return json({ ok: false, error: "not_configured" }, 500);
  }

  let form;
  try {
    form = await request.json();
  } catch {
    return json({ ok: false, error: "bad_request" }, 400);
  }
  const field = (k) => String(form?.[k] ?? "").trim();
  const name = field("name");
  const company = field("company");
  const email = field("email");
  const message = field("message");

  // Hidden field that only bots fill in: report success so they do not retry.
  if (field("website")) return json({ ok: true });

  if (!name || !message || !EMAIL_RE.test(email) || form.consent !== true) {
    return json({ ok: false, error: "invalid" }, 400);
  }
  if (Object.entries({ name, company, email, message }).some(([k, v]) => v.length > LIMITS[k])) {
    return json({ ok: false, error: "too_long" }, 400);
  }

  const oneLine = (s) => s.replace(/[\r\n]+/g, " ");
  const from = env.CONTACT_FROM || "info@firmatextile.com";
  const to = env.CONTACT_TO || "info@firmatextile.com";
  const subject = `Website enquiry: ${oneLine(name)}${company ? ` (${oneLine(company)})` : ""}`;
  const text = [
    `Reply to: ${email}`,
    `Name: ${name}`,
    `Company: ${company || "-"}`,
    "",
    message,
    "",
    `Sent from the contact form on www.firmatextile.com. Answer ${email} directly.`,
  ].join("\n");

  try {
    const token = await getAccessToken(env);
    const { accountId, fromAddress } = await getAccount(env, token, from);
    const payload = {
      fromAddress,
      toAddress: to,
      subject,
      content: text,
      mailFormat: "plaintext",
      askReceipt: "no",
      replyTo: email,
    };

    let sent = await sendMail(env, token, accountId, payload);
    if (!sent.ok && sent.status === 400) {
      // replyTo is not in Zoho's documented parameter list; if it is what the API objects to, send
      // without it rather than lose the enquiry. The address is in the body either way. Only a 400 is
      // retried, so a timeout or a 5xx after Zoho already queued the mail cannot send it twice.
      const { replyTo, ...withoutReplyTo } = payload;
      sent = await sendMail(env, token, accountId, withoutReplyTo);
    }
    if (!sent.ok) {
      console.log("contact: Zoho send failed", sent.status, sent.detail);
      return json({ ok: false, error: "send_failed" }, 502);
    }
  } catch (err) {
    // A revoked refresh token or a stale cached account id lands here; clear the caches so the next
    // attempt starts clean, and let the form fall back to the visitor's own mail app.
    tokenCache = { token: null, expiresAt: 0 };
    accountCache = null;
    console.log("contact: Zoho error", err.message);
    return json({ ok: false, error: "send_failed" }, 502);
  }

  return json({ ok: true });
}
