// Cloudflare Workers Static Assets entry point. The whole site is now a
// single client-hydrated route (the game itself, at "/" -- see
// src/routes/+page.ts `prerender = false` and svelte.config.js `fallback:
// '200.html'`), so there is no literal HTML file for "/" or any client-side
// path the app might route to. Try real assets first (JS/CSS/WASM/images
// all exist as literal files and should be served directly); only fall back
// to the SPA shell on a genuine miss.
//
// wrangler.jsonc sets assets.html_handling: "none", so asset lookups here
// are always exact-path matches with no automatic .html-stripping redirects
// to worry about (an earlier version of this file tried to work around
// those redirects and produced a genuine redirect loop instead).
export default {
	async fetch(request, env) {
		const response = await env.ASSETS.fetch(request);
		if (response.status !== 404) {
			return response;
		}

		const shellResponse = await env.ASSETS.fetch(new Request(new URL('/200.html', request.url), request));
		// "200.html" is Netlify's/adapter-static's naming convention for "serve
		// this SPA shell with a real 200," regardless of what status the
		// underlying asset lookup produced.
		return new Response(shellResponse.body, { headers: shellResponse.headers, status: 200 });
	}
};
