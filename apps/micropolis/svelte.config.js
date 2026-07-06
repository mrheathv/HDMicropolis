import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */

const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			// default options are shown. On some platforms
			// these options are set automatically — see the documentation
			pages: 'build', // This should be the folder where your built files will reside
			assets: 'build', // This should be the folder where your built files will reside
			// SPA fallback: the whole site is one non-prerendered route (the game
			// itself, live WASM/canvas), served from this shell and hydrated
			// client-side. Named index.html (not Netlify's 200.html convention)
			// so Cloudflare Workers' built-in
			// assets.not_found_handling: "single-page-application" can serve it
			// directly -- no custom Worker script needed for routing.
			fallback: 'index.html',
			precompress: false,
			strict: true
		}),
		prerender: {
			// Content is migrated; keep missing in-page anchors a warning (legacy deep
			// links evolve), but fail on real broken page links so regressions surface.
			handleMissingId: 'warn'
		}
	}
};

export default config;
