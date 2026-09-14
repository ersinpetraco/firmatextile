// Cloudflare Pages Function: completes the GitHub OAuth flow and hands the token back to the CMS popup.
export async function onRequest({ request, env }) {
  const clientId = env.OAUTH_GITHUB_CLIENT_ID;
  const clientSecret = env.OAUTH_GITHUB_CLIENT_SECRET;
  const code = new URL(request.url).searchParams.get("code");

  function postResult(status, payload) {
    const message = `authorization:github:${status}:${JSON.stringify(payload)}`;
    const html = `<!DOCTYPE html><html><body><script>
(function () {
  function receive(e) {
    window.removeEventListener("message", receive, false);
    window.opener && window.opener.postMessage(${JSON.stringify(message)}, e.origin);
    window.close();
  }
  window.addEventListener("message", receive, false);
  window.opener && window.opener.postMessage("authorizing:github", "*");
})();
</script><p>You can close this window.</p></body></html>`;
    return new Response(html, { headers: { "Content-Type": "text/html" } });
  }

  if (!clientId || !clientSecret) {
    return postResult("error", { message: "Missing OAuth environment variables on the server." });
  }
  if (!code) {
    return postResult("error", { message: "No authorization code returned by GitHub." });
  }

  try {
    const r = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", "User-Agent": "firmatextile-cms" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    const data = await r.json();
    if (data.error || !data.access_token) {
      return postResult("error", { message: data.error_description || data.error || "Token exchange failed." });
    }
    return postResult("success", { token: data.access_token, provider: "github" });
  } catch (err) {
    return postResult("error", { message: String(err) });
  }
}
