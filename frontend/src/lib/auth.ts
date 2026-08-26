import { createAuthClient } from 'better-auth/svelte';
import { apiKeyClient } from '@better-auth/api-key/client';

export const authClient = createAuthClient({
	/** The base URL of the server (optional if you're using the same domain) */
	// baseURL: "http://localhost:3000"

	plugins: [apiKeyClient()]
});
