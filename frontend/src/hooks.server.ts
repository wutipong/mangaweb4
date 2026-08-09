import type { Handle, ServerInit } from '@sveltejs/kit';
import logger from '$lib/logger';
import { setLogger } from '@grpc/grpc-js/build/src/logging';
import { env } from '$env/dynamic/private';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { auth } from '$lib/auth.server';
import { building } from '$app/environment';

export const handle: Handle = async ({ event, resolve }) => {
	return svelteKitHandler({ event, resolve, auth, building });
};

export const init: ServerInit = async () => {
	logger.level = env.LOG_LEVEL ?? 'info';
	setLogger(logger);
};
