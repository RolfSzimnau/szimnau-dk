// Cloudflare's built-in static-asset trailing-slash normalization issues a 307
// (temporary), which Google Search Console treats as unstable and refuses to
// index through ("Page with redirect: Failed"). This Worker runs first and
// issues a proper 301 (permanent) for the same normalization before the
// assets handler gets a chance to.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    const looksLikeFile = /\.[a-zA-Z0-9]+$/.test(pathname);
    if (pathname !== '/' && !pathname.endsWith('/') && !looksLikeFile) {
      url.pathname = pathname + '/';
      return Response.redirect(url.toString(), 301);
    }

    return env.ASSETS.fetch(request);
  },
};
