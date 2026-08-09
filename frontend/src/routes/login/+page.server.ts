import { env } from '$env/dynamic/private';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	return {
		providerId: env.OIDC_PROVIDER_ID ?? '',
		callbackURL: url.origin,
		errorCallbackURL: '/error'
	};
};
