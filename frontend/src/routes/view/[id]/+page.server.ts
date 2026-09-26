import type { PageServerLoad } from './$types';
import variables from '$lib/variables.server';
import { GrpcTransport } from '@protobuf-ts/grpc-transport';
import { ChannelCredentials } from '@grpc/grpc-js';
import { MangaClient } from '$lib/grpc/manga.client';
import { getViewOptions } from '$lib/view_options.server';

export const prerender = false;
export const ssr = false;

export const load: PageServerLoad = async ({ request, cookies, params, locals }) => {
	const { id } = params;
	const idNo = parseInt(id);

	const transport = new GrpcTransport({
		host: variables().apiBasePath,
		channelCredentials: ChannelCredentials.createInsecure()
	});

	const client = new MangaClient(transport);

	const call = await client.detail({
		id: idNo,
		user: locals.user.email
	});

	const options = getViewOptions(cookies);

	return {
		request: call.request,
		response: call.response,
		options: options
	};
};
