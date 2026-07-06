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
			// Fetch the already-canonical extensionless path (Workers assets'
			// default html_handling redirects "/200.html" -> "/200"; requesting
			// "/200.html" directly just returns that redirect, which we'd
			// otherwise forward straight to the browser instead of content).
			let response = await env.ASSETS.fetch(new Request(new URL('/200', url), request));
			if (response.status >= 300 && response.status < 400) {
				const location = response.headers.get('Location');
				if (location) {
					response = await env.ASSETS.fetch(new Request(new URL(location, url), request));
				}
			}
			// "200.html" is Netlify's/adapter-static's naming convention for
			// "serve this SPA shell with a real 200," regardless of what status
			// the underlying asset lookup produced.
			return new Response(response.body, { headers: response.headers, status: 200 });
		}
		return env.ASSETS.fetch(request);
	}
};
