import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import tailwindcss from '@tailwindcss/vite';
import customLogger from './logger';

const isDevContainer = process.env.IS_DEV_CONTAINER === 'true';

// Intercept server-side fetches safely using a Proxy
if (isDevContainer) {
	const originalFetch = globalThis.fetch;

	globalThis.fetch = new Proxy(originalFetch, {
		// 1. Properly forward standard function calls
		apply(target, thisArg, argArray) {
			let [input, init] = argArray;

			console.log('Intercepted fetch call:', input, init);
			if (
				(typeof input === 'string' && input.includes('.localhost')) ||
				(input instanceof URL && input.hostname.includes('.localhost'))
			) {
				const url = new URL(input);
				const originalHost = url.host; // e.g., "auth.localhost:8080"

				// Swap the hostname to point to the host machine gateway
				url.hostname = 'host.docker.internal';

				// Re-apply headers to preserve OIDC issuer check validation
				const headers = new Headers(init?.headers);
				headers.set('Host', originalHost);

				// Update the arguments list for the actual call
				argArray[0] = url.toString();
				argArray[1] = { ...init, headers };
			}

			console.log('Modified fetch call:', argArray[0], argArray[1]);
			return Reflect.apply(target, thisArg, argArray);
		},

		// 2. Critically important: Pass through 'preconnect' and other underlying methods
		get(target, prop, receiver) {
			const value = Reflect.get(target, prop, receiver);
			// Bind methods back to the original fetch so they execute in the right context
			return typeof value === 'function' ? value.bind(target) : value;
		}
	});
}

export default defineConfig(({ mode }) => {
	loadEnv(mode, process.cwd(), '');

	return {
		plugins: [
			tailwindcss(),
			sveltekit(),
			SvelteKitPWA({
				srcDir: './src',
				mode: 'development',
				// you don't need to do this if you're using generateSW strategy in your app
				//strategies: generateSW ? 'generateSW' : 'injectManifest',
				// you don't need to do this if you're using generateSW strategy in your app
				//filename: generateSW ? undefined : 'prompt-sw.ts',
				scope: '/',
				base: '/',
				selfDestroying: process.env.SELF_DESTROYING_SW === 'true',
				pwaAssets: {
					config: true
				},
				manifest: {
					short_name: 'MangaWeb 4',
					name: 'MangaWeb 4',
					start_url: '/',
					scope: '/',
					display: 'standalone',
					theme_color: '#ffffff',
					background_color: '#000000'
				},
				injectManifest: {
					globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,woff,woff2}']
				},
				workbox: {
					globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,woff,woff2}'],
					globIgnores: [
						'client/favicon.svg',
						'client/favicon.svg.gz',
						'client/favicon.svg.br',
						'client/favicon.afdesign'
					]
				},
				devOptions: {
					enabled: false,
					suppressWarnings: process.env.SUPPRESS_WARNING === 'true',
					type: 'module',
					navigateFallback: '/'
				},
				// if you have shared info in svelte config file put in a separate module and use it also here
				kit: {
					includeVersionFile: true
				}
			})
		],
		customLogger: customLogger,
		ssr: { noExternal: ['@popperjs/core'] },
		test: {
			include: ['src/**/*.{test,spec}.{js,ts}']
		},
		server: {
			allowedHosts: ['host.docker.internal']
		}
	};
});
