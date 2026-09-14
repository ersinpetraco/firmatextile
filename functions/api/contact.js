// Cloudflare Pages Function: delivers contact form enquiries to info@firmatextile.com through Resend.
// Requires env var RESEND_API_KEY. Optional: CONTACT_TO, CONTACT_FROM.
const LIMITS = { name: 120, company: 160, email: 200, message: 5000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

export async function onRequestPost({ request, env }) {
  if (!env.RESEND_API_KEY) return json({ ok: false, error: "not_configured" }, 500);

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
  const subject = `Website enquiry: ${oneLine(name)}${company ? ` (${oneLine(company)})` : ""}`;
  const text = [
    `Name: ${name}`,
    `Company: ${company || "-"}`,
    `Email: ${email}`,
    "",
    message,
    "",
    "Sent from the contact form on www.firmatextile.com. Reply to this email to answer the sender directly.",
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env.CONTACT_FROM || "Firma Textile website <website@firmatextile.com>",
      to: [env.CONTACT_TO || "info@firmatextile.com"],
      reply_to: email,
      subject,
      text,
    }),
  });

  if (!res.ok) {
    console.log("contact: Resend error", res.status, await res.text());
    return json({ ok: false, error: "send_failed" }, 502);
  }
  return json({ ok: true });
}
