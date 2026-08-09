import variables from '$lib/variables.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, cookies }) => {
	return {logout_url: variables().oidc.logout}
};
