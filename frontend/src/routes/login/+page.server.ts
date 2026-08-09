import { env } from '$env/dynamic/private';
import { browseURL } from '$lib/routes';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	return {
		providerId: env.OIDC_PROVIDER_ID ?? '',
		callbackURL: browseURL(url).toString(),
		errorCallbackURL: '/error'
		// disableRedirect: true,
	};
};
