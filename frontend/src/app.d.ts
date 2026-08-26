import 'vite-plugin-pwa/pwa-assets';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			session: typeof auth.$Infer.Session.session | undefined;
			user: typeof auth.$Infer.Session.user | undefined;
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
