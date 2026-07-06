// Cloudflare Workers Static Assets entry point. The whole site is now a
// single client-hydrated route (the game itself, at "/" -- see
// src/routes/+page.ts `prerender = false` and svelte.config.js `fallback:
// '200.html'`), so there is no literal HTML file for "/" or any client-side
// path the app might route to. Try real assets first (JS/CSS/WASM/images
// all exist as literal files and should be served directly); only fall back
// to the SPA shell on a genuine miss.
export default {
	async fetch(request, env) {
		const response = await env.ASSETS.fetch(request);
		if (response.status !== 404) {
			return response;
		}

		// Fetch the already-canonical extensionless path (Workers assets'
		// default html_handling redirects "/200.html" -> "/200"; requesting
		// "/200.html" directly just returns that redirect instead of content).
		const url = new URL(request.url);
		let shellResponse = await env.ASSETS.fetch(new Request(new URL('/200', url), request));
		if (shellResponse.status >= 300 && shellResponse.status < 400) {
			const location = shellResponse.headers.get('Location');
			if (location) {
				shellResponse = await env.ASSETS.fetch(new Request(new URL(location, url), request));
			}
		}
		// "200.html" is Netlify's/adapter-static's naming convention for "serve
		// this SPA shell with a real 200," regardless of what status the
		// underlying asset lookup produced.
		return new Response(shellResponse.body, { headers: shellResponse.headers, status: 200 });
	}
};
