// Cloudflare Workers Static Assets entry point (Workers, not Pages -- Pages'
// `_redirects` file convention isn't processed here, so the /play/* SPA
// fallback needs to be done explicitly in a fetch handler instead).
//
// /play/micropolis and /play/sims are intentionally not prerendered (they
// boot the WASM engine / hydrate client-side -- see src/routes/play/*/
// +page.server.ts `prerender = false` and svelte.config.js `fallback:
// '200.html'`), so there is no literal HTML file at those paths for the
// default asset server to find. Serve the SPA shell for them explicitly;
// everything else falls through to normal static asset serving (real 404s
// stay real 404s).
export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		if (url.pathname.startsWith('/play/')) {
			const shellRequest = new Request(new URL('/200.html', url), request);
			return env.ASSETS.fetch(shellRequest);
		}
		return env.ASSETS.fetch(request);
	}
};
