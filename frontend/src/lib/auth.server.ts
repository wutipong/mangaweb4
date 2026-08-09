import { betterAuth } from 'better-auth';
import { Pool } from 'pg';
import { env } from '$env/dynamic/private';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { genericOAuth } from 'better-auth/plugins';
import { apiKey } from '@better-auth/api-key';
import 'dotenv/config';

export const auth = betterAuth({
	database: new Pool({
		connectionString: env.MANGAWEB_DB,
		options: "-c search_path=auth"
	}),
	plugins: [
		sveltekitCookies(getRequestEvent),
		apiKey({
			rateLimit: { enabled: false }
		}),
		genericOAuth({
			config: [
				{
					providerId: env.OIDC_PROVIDER_ID ?? '',
					clientId: env.OIDC_CLIENT ?? '',
					clientSecret: env.OIDC_SECRET,
					issuer: env.OIDC_ISSUER,
					tokenUrl: env.OIDC_TOKEN,
					requireIssuerValidation: false,
					authorizationUrl: env.OIDC_AUTHORIZE,
					scopes: ["openid", "email", "profile"],
					// discoveryUrl: env.OIDC_DISCOVERY_URL ?? ''
					// ... other config options
				}
				// Add more providers as needed
			]
		})
	]
});
