// Cloudflare's built-in static-asset trailing-slash normalization issues a 307
// (temporary), which Google Search Console treats as unstable and refuses to
// index through ("Page with redirect: Failed"). This Worker runs first and
// issues a proper 301 (permanent) for the same normalization before the
// assets handler gets a chance to.
//
// It also enforces the canonical apex host (szimnau.dk, no "www."): without
// this, www.szimnau.dk serves the identical site as a second live host with
// no redirect, which Google Search Console indexes as duplicate content
// under the wrong host (confirmed 2026-09-10 via GSC's 404 report showing
// www + apex pairs for the same paths).
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname, hostname } = url;

    let changed = false;

    if (hostname.startsWith('www.')) {
      url.hostname = hostname.slice(4);
      changed = true;
    }

    // Any dot in the last path segment means a file (pagefind uses .pf_meta, .pf_index, .pf_fragment).
    const looksLikeFile = /\.[^/.]+$/.test(pathname);
    if (pathname !== '/' && !pathname.endsWith('/') && !looksLikeFile) {
      url.pathname = pathname + '/';
      changed = true;
    }

    if (changed) {
      return Response.redirect(url.toString(), 301);
    }

    return env.ASSETS.fetch(request);
  },
};
