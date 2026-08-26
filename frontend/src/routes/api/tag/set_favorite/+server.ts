import { GrpcTransport } from '@protobuf-ts/grpc-transport';
import type { RequestHandler } from './$types';
import { ChannelCredentials } from '@grpc/grpc-js';
import variables from '$lib/variables.server';
import { TagClient } from '$lib/grpc/tag.client';

export const GET: RequestHandler = async ({ request, locals }) => {
	const transport = new GrpcTransport({
		host: variables().apiBasePath,
		channelCredentials: ChannelCredentials.createInsecure()
	});

	const client = new TagClient(transport);
	const url = new URL(request.url);

	const user = locals.user;
	const favorite = url.searchParams.get('favorite')?.toLowerCase() == 'true';
	const id = parseInt(url.searchParams.get('id') ?? '');
	const { response } = await client.setFavorite({ id: id, user, favorite });

	return new Response(JSON.stringify(response));
};
