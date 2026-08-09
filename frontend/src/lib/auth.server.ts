import { betterAuth } from 'better-auth';
import { Pool } from 'pg';
import { env } from '$env/dynamic/private';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { genericOAuth } from 'better-auth/plugins';
import { apiKey } from '@better-auth/api-key';
import 'dotenv/config';

// Create a safe build-time / initial module load validation proxy
export const auth = betterAuth({
	// Use process.env as a fallback because $env/dynamic/private is sometimes blank during early module evaluation
	secret: env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET || 'placeholder_secret_for_build_step_only',
	baseURL: env.BETTER_AUTH_URL || process.env.BETTER_AUTH_URL || 'http://localhost:5173', 
	database: new Pool({
		connectionString: env.MANGAWEB_DB || process.env.MANGAWEB_DB || 'postgresql://localhost:5432/placeholder',
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

export default () => auth;
