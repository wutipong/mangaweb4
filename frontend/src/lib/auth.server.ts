import { betterAuth } from 'better-auth';
import { Pool } from 'pg';
import { env } from '$env/dynamic/private';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { genericOAuth } from 'better-auth/plugins';
import { apiKey } from '@better-auth/api-key';
import 'dotenv/config';

// 1. Establish build-time fallbacks to prevent SvelteKit compiler crashes
const isBuild = typeof process !== 'undefined' && process.env.NODE_ENV === 'production' && !env.BETTER_AUTH_URL;

const baseURL = env.BETTER_AUTH_URL || 'http://localhost:5173';
const secret = env.BETTER_AUTH_SECRET || 'placeholder_secret_for_build_step_only';
const dbConnectionString = env.MANGAWEB_DB || 'postgresql://localhost:5432/placeholder';

// 2. Initialize statically so Better Auth's plugin tree constructs safely
export const auth = betterAuth({
	secret: secret,
	baseURL: baseURL, 
	database: new Pool({
		connectionString: dbConnectionString,
		options: '-c search_path=auth'
	}),
	plugins: [
		sveltekitCookies(getRequestEvent),
		apiKey({
			rateLimit: { enabled: false }
		}),
		genericOAuth({
			config: [
				{
					// Provide fallback strings instead of undefined or short-circuiting empty strings
					providerId: env.OIDC_PROVIDER_ID || 'placeholder-provider',
					clientId: env.OIDC_CLIENT || 'placeholder-client',
					clientSecret: env.OIDC_SECRET || 'placeholder-secret',
					issuer: env.OIDC_ISSUER || 'https://placeholder-issuer.com',
					tokenUrl: env.OIDC_TOKEN || 'https://placeholder-issuer.com',
					authorizationUrl: env.OIDC_AUTHORIZE || 'https://placeholder-issuer.com',
					requireIssuerValidation: false,
					scopes: ['openid', 'email', 'profile']
				}
			]
		})
	]
});

// Keeps backward compatibility with your factory imports if needed elsewhere
export default () => auth;
