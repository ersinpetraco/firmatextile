// Cloudflare Pages Function: starts the GitHub OAuth flow for the CMS login.
// Requires env vars: OAUTH_GITHUB_CLIENT_ID, OAUTH_GITHUB_CLIENT_SECRET
export function onRequest({ request, env }) {
  const clientId = env.OAUTH_GITHUB_CLIENT_ID;
  if (!clientId) {
    return new Response("Missing OAUTH_GITHUB_CLIENT_ID environment variable.", { status: 500 });
  }
  const { origin } = new URL(request.url);
  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${origin}/api/callback`,
    scope: "repo,user",
    state,
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: `https://github.com/login/oauth/authorize?${params.toString()}`,
      "Set-Cookie": `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });
}
