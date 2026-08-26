import { GrpcTransport } from '@protobuf-ts/grpc-transport';
import type { RequestHandler } from './$types';
import { ChannelCredentials } from '@grpc/grpc-js';
import { MangaClient } from '$lib/grpc/manga.client';
import variables from '$lib/variables.server';
import { MAX_STREAM_OBJECT_SIZE } from '$lib/constants';
import { error } from '@sveltejs/kit';
import { ImageQuality } from '$lib/grpc/types';
import { $enum } from 'ts-enum-util';

export const GET: RequestHandler = async ({ request, cookies, url, locals }) => {
	const transport = new GrpcTransport({
		host: variables().apiBasePath,
		channelCredentials: ChannelCredentials.createInsecure()
	});

	const client = new MangaClient(transport);
	const index = parseInt(url.searchParams.get('i') ?? '') || 0;
	const user = locals.user;
	const id = parseInt(url.searchParams.get('id') ?? '');
	if (id == 0 || Number.isNaN(id)) {
		error(404);
	}
	const quality = $enum(ImageQuality).getValueOrDefault(
		url.searchParams.get('quality'),
		ImageQuality.HIGH
	);

	const stream = client.pageImageStream({ id: id, user, index, quality });

	let filename = '';
	let contentType = '';

	const sink = new Bun.ArrayBufferSink();
	sink.start({ asUint8Array: true });

	for await (const message of stream.responses) {
		if (filename == '') {
			filename = message.filename;
			contentType = message.contentType;
		}

		sink.write(message.data);
	}

	let data = sink.end();
	return new Response(data, {
		headers: {
			'content-type': contentType,
			'content-disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
			'content-length': `${data.byteLength}`
		}
	});
};
