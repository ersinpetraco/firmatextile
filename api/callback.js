// Completes the GitHub OAuth flow and hands the token back to the CMS popup.
export default async function handler(req, res) {
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
  const clientSecret = process.env.OAUTH_GITHUB_CLIENT_SECRET;
  const { code } = req.query;

  function postResult(status, payload) {
    const message = `authorization:github:${status}:${JSON.stringify(payload)}`;
    res.setHeader("Content-Type", "text/html");
    res.end(`<!DOCTYPE html><html><body><script>
(function () {
  function receive(e) {
    window.removeEventListener("message", receive, false);
    window.opener && window.opener.postMessage(${JSON.stringify(message)}, e.origin);
    window.close();
  }
  window.addEventListener("message", receive, false);
  window.opener && window.opener.postMessage("authorizing:github", "*");
})();
</script><p>You can close this window.</p></body></html>`);
  }

  if (!clientId || !clientSecret) {
    postResult("error", { message: "Missing OAuth environment variables on the server." });
    return;
  }
  if (!code) {
    postResult("error", { message: "No authorization code returned by GitHub." });
    return;
  }

  try {
    const r = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    const data = await r.json();
    if (data.error || !data.access_token) {
      postResult("error", { message: data.error_description || data.error || "Token exchange failed." });
      return;
    }
    postResult("success", { token: data.access_token, provider: "github" });
  } catch (err) {
    postResult("error", { message: String(err) });
  }
}
