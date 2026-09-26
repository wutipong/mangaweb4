import { GrpcTransport } from '@protobuf-ts/grpc-transport';
import type { RequestHandler } from './$types';
import { ChannelCredentials } from '@grpc/grpc-js';
import { MangaClient } from '$lib/grpc/manga.client';
import variables from '$lib/variables.server';
import logger from '$lib/logger';

export const GET: RequestHandler = async ({ request, locals }) => {
	const transport = new GrpcTransport({
		host: variables().apiBasePath,
		channelCredentials: ChannelCredentials.createInsecure()
	});

	const client = new MangaClient(transport);
	const url = new URL(request.url);

	const id = parseInt(url.searchParams.get('id') ?? '') ?? 0;
	const user = locals.user;
	const page = Number.parseInt(url.searchParams.get('page') ?? '') ?? 0;

	logger.debug({ id: id, user: user.email, page }, 'set progress parameter');

	const { response } = await client.setProgress({ id: id, user, page });

	return new Response(JSON.stringify(response));
};
