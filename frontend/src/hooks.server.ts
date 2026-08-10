import { error, redirect, type Handle, type ServerInit } from '@sveltejs/kit';
import logger from '$lib/logger';
import { setLogger } from '@grpc/grpc-js/build/src/logging';
import { env } from '$env/dynamic/private';
import auth from '$lib/auth.server';
import { sequence } from '@sveltejs/kit/hooks';
import { dev, building } from "$app/environment";
import { getMigrations } from "better-auth/db/migration";

// 1. Safe, deferred migrations. Runs strictly inside init() when the container starts.
export const init: ServerInit = async () => {
	logger.level = env.LOG_LEVEL ?? 'info';
	setLogger(logger);

	if (!dev && !building) {
		try {
			const { runMigrations: execute } = await getMigrations(auth().options);
			await execute();
			console.log("Better Auth database migrations applied.");
		} catch (e) {
			console.error("Better Auth migration failed:", e);
			process.exit(1); 
		}
	}
};

// 2. Route-isolated Auth Handler (completely skips global `svelteKitHandler`)
const handleBetterAuth: Handle = async ({ event, resolve }) => {
	// Directly intercept auth endpoints without executing broken global checks
	if (event.url.pathname.startsWith('/api/auth')) {
		return auth().handler(event.request);
	}

	// Fetch current session safely from Better Auth for standard pages
	try {
		const session = await auth().api.getSession({ headers: event.request.headers });
		if (session) {  
			event.locals.session = session.session;
			event.locals.user = session.user;
		}
	} catch (e) {
		console.error("Failed to fetch session:", e);
		event.locals.session = null;
		event.locals.user = null;
	}

	return resolve(event);
};

// 4. Session Validation and Guarding Middleware
const handleSession: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/login')) {
		return resolve(event);
	}

	const session = event.locals.session;

	if (session == null) {
		throw redirect(307, "/login");
	}

	if (Date.now() > new Date(session.expiresAt).getTime()) {
		throw redirect(307, "/login");
	}

	return resolve(event);
};

export const handle = sequence(handleBetterAuth, handleSession);
