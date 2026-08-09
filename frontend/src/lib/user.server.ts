
import type { Cookies } from '@sveltejs/kit';
import {auth} from '$lib/auth.server'

export async function getUser(request: Request, cookies: Cookies): Promise<string> {
	const session = await auth.api.getSession({headers: request.headers})

	return (session?.user.email as string) ?? '';
}

export async function getUserDetail(
	request: Request,
	cookies: Cookies
): Promise<{ email: string; name: string; }> {
	const session = await auth.api.getSession({headers: request.headers})

	return {
		email: (session?.user.email as string) ?? '',
		name: (session?.user.name as string) ?? ''
	};
}
