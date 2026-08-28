<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Content from '$lib/components/Content.svelte';
	import Viewer from './Viewer.svelte';
	import NavBar from '$lib/components/NavBar.svelte';
	import SideBar from '$lib/components/SideBar.svelte';
	import Toast from '$lib/components/Toast.svelte';

	import Navigation from './Navigation.svelte';
	import type { ViewOptions } from '$lib/view_options.server';
	import { MediaQuery } from 'svelte/reactivity';
	import { browseTagURL } from '$lib/routes';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import type { PageData } from './$types';
	import path from 'path-browserify';
	import { $enum as enumUtil } from 'ts-enum-util';
	import { ImageQuality } from '$lib/grpc/types';

	import Icon from 'mdi-svelte';
	import {
		mdiDownload,
		mdiDownloadBox,
		mdiTools,
		mdiInformationOutline,
		mdiTag,
		mdiImage,
		mdiHeart,
		mdiHeartOutline,
		mdiMotionPause,
		mdiSquareOpacity,
		mdiQualityHigh,
		mdiQualityLow,
		mdiSquareRounded
	} from '@mdi/js';
	import logger from '$lib/logger';

	let current = $state(0);
	let viewer: Viewer;
	let toast: Toast;

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let pageCount = $derived(data.response.pageCount);
	let tags = $derived(data.response.tags);
	let favorite = $derived(data.response.favorite);

	let showNavBar = $state(false);

	const prefersReducedMotion = new MediaQuery('prefers-reduced-motion');

	let options = $state((() => data.options)()); // use initial value
	let quality = $derived.by(() => options.quality ?? ImageQuality.HIGH);
	let disableAnimation = $derived.by(
		() => options.disableAnimation || prefersReducedMotion.current
	);

	function createImageUrls(id: number, pageCount: number): string[] {
		const url = new URL('/api/manga/page_image', page.url.origin);
		const output = [];
		const user = data.request.user;
		url.searchParams.append('id', id.toString());
		url.searchParams.append('user', user);
		url.searchParams.append('quality', enumUtil(ImageQuality).getKeyOrDefault(quality, 'HIGH'));

		for (let i = 0; i < pageCount; i++) {
			url.searchParams.set('i', i.toString());
			output.push(url.toString());
		}

		return output;
	}

	function downloadManga() {
		const url = new URL('/api/manga/download', page.url.origin);
		url.searchParams.set('id', data.request.id.toString());

		download(url.toString());
	}

	function downloadPage() {
		const url = new URL('/api/manga/page_image', page.url.origin);
		url.searchParams.set('id', data.request.id.toString());
		url.searchParams.set('i', current.toString());
		url.searchParams.append('quality', 'ORIGINAL');

		download(url.toString());
	}

	async function toggleFavorite() {
		const url = new URL('/api/manga/set_favorite', page.url.origin);
		url.searchParams.set('id', data.request.id.toString());
		url.searchParams.set('favorite', !favorite ? 'true' : 'false');

		const resp = await fetch(url, { method: 'GET' });
		const json = await resp.json();

		if (json.favorite) {
			toast.add('The current item is now your favorite.', 'success');
		} else {
			toast.add('The current item is no longer your favorite.', 'success');
		}

		favorite = json.favorite;
	}

	async function fixMetaData() {
		const url = new URL('/api/manga/repair', page.url.origin);
		url.searchParams.set('id', data.request.id.toString());

		const resp = await fetch(url);
		const json = await resp.json();

		if (json.isSuccess) {
			toast.add('The item metadata has been updated.', 'success');
			invalidateAll();
		} else {
			toast.add('The item metadata updates fails.', 'error');
		}
	}

	async function changeThumbnail() {
		const url = new URL(`/view/thumb_edit/${data.request.id}`, page.url.origin);
		url.searchParams.set('index', `${current}`);

		goto(url);
	}

	function download(url: string) {
		let link = document.createElement('a');
		link.setAttribute('download', '');
		link.href = url;
		document.body.appendChild(link);

		link.click();
		link.remove();
	}

	function onIndexChange(i: number) {
		current = i;

		const url = new URL('/api/manga/set_progress', page.url.origin);
		url.searchParams.set('page', `${current}`);
		url.searchParams.set('id', data.request.id.toString());

		try {
			fetch(url);
		} catch (err) {
			logger.error(err, 'error during update progress.');
		}
	}

	async function onUpdateOptions(o: ViewOptions) {
		const url = new URL('/api/view/set_options', page.url.origin);
		url.searchParams.set('disableAnimation', options.disableAnimation.toString());
		url.searchParams.set('grayscale', options.grayscale.toString());
		url.searchParams.set('quality', enumUtil(ImageQuality).getKeyOrDefault(o.quality, 'HIGH'));

		const resp = await fetch(url);
		const json = await resp.json();

		if (json.success) {
			options = o;
		}

		return json.success;
	}

	let showMenu = $state(false);
	let aboutDialog: HTMLDialogElement;
</script>

<svelte:head>
	<title>View: {data.response.name}</title>
</svelte:head>

<Container bind:showMenu>
	<Content>
		<NavBar bind:showMenu bind:show={showNavBar}>
			<div class="hidden text-xl md:inline">
				<div class=" whitespace-nowrap">{path.basename(data.response.name)}</div>
			</div>
		</NavBar>
		<div class="fixed inset-s-0 inset-e-0 top-0 bottom-0">
			<Viewer
				imageURLs={createImageUrls(data.request.id, data.response.pageCount)}
				{onIndexChange}
				bind:this={viewer}
				startIndex={data.response.currentPage}
				grayscale={options.grayscale}
				{disableAnimation}
				onTapped={() => (showNavBar = !showNavBar)}
				disabled={showNavBar}
			/>
		</div>

		<Navigation
			bind:show={showNavBar}
			bind:current
			length={pageCount}
			onNext={() => viewer.next()}
			onPrevious={() => viewer.previous()}
			onMovedToPage={(i: number) => viewer.moveToPage(i)}
		/>
	</Content>
	<SideBar bind:showMenu user={data.user}>
		<ul class="menu">
			<li class="text">
				<div class="tooltip tooltip-left" data-tip={data.response.name}>
					<div class="h-20 overflow-hidden">
						{data.response.name}
					</div>
				</div>
			</li>
			<li>
				<button
					onclick={() => {
						showMenu = false;
						aboutDialog.showModal();
					}}
				>
					<Icon path={mdiInformationOutline} /> Information
				</button>
			</li>
			<li>
				<button
					class="btn btn-soft"
					class:bg-pink-200={favorite}
					class:text-pink-800={favorite}
					class:fill-pink-400={favorite}
					onclick={() => toggleFavorite()}
				>
					{#if favorite}
						<Icon path={mdiHeart} /> Favorite
					{:else}
						<Icon path={mdiHeartOutline} /> Favorite
					{/if}
				</button>
			</li>

			<li class="menu-title">Tags</li>
			{#each tags as t (t.id)}
				<li>
					<button onclick={() => goto(browseTagURL(page.url, t.id))}>
						<Icon path={mdiTag} />
						{t.name}
					</button>
				</li>
			{/each}

			<li class="menu-title">Tools</li>
			<li>
				<button onclick={() => downloadPage()}>
					<Icon path={mdiDownloadBox} /> Download current page
				</button>
			</li>

			<li>
				<button onclick={() => downloadManga()}>
					<Icon path={mdiDownload} /> Download
				</button>
			</li>

			<li>
				<button onclick={() => changeThumbnail()}>
					<Icon path={mdiImage} /> Change thumbnail
				</button>
			</li>

			<li>
				<button onclick={() => fixMetaData()}>
					<Icon path={mdiTools} /> Fix item metadata
				</button>
			</li>

			<li class="menu-title">Read Options</li>
			<li
				class:menu-active={options.disableAnimation}
				class:menu-disabled={prefersReducedMotion.current}
			>
				<button
					disabled={prefersReducedMotion.current}
					onclick={async () => {
						let o = options;
						o.disableAnimation = !o.disableAnimation;
						onUpdateOptions(o);
					}}
				>
					<Icon path={mdiMotionPause} /> Reduce Motion
				</button>
			</li>
			<li class:menu-active={options.grayscale}>
				<button
					onclick={async () => {
						let o = options;
						o.grayscale = !o.grayscale;
						onUpdateOptions(o);
					}}
				>
					<Icon path={mdiSquareOpacity} /> Grayscale
				</button>
			</li>

			<li class="menu-title">Image Quality</li>
			<li class:menu-active={quality === ImageQuality.ORIGINAL}>
				<button
					onclick={async () => {
						let o = options;
						o.quality = ImageQuality.ORIGINAL;
						onUpdateOptions(o);
					}}
				>
					<Icon path={mdiSquareRounded} /> Original
				</button>
			</li>
			<li class:menu-active={quality === ImageQuality.HIGH}>
				<button
					onclick={async () => {
						let o = options;
						o.quality = ImageQuality.HIGH;
						onUpdateOptions(o);
					}}
				>
					<Icon path={mdiQualityHigh} /> High
				</button>
			</li>

			<li class:menu-active={quality === ImageQuality.LOW}>
				<button
					onclick={async () => {
						let o = options;
						o.quality = ImageQuality.LOW;
						onUpdateOptions(o);
					}}
				>
					<Icon path={mdiQualityLow} /> Low
				</button>
			</li>
		</ul>
	</SideBar>
</Container>

<dialog class="modal" bind:this={aboutDialog}>
	<div class="modal-box mx-auto w-full max-w-5xl">
		<h3 class="text-lg font-bold">Information</h3>
		<table class="table">
			<tbody>
				<tr>
					<th>Title</th>
					<td>{data.response.name}</td>
				</tr>
				<tr>
					<th>Tags</th>
					<td>{tags.map((t) => t.name).join(', ')}</td>
				</tr>
				<tr>
					<th>Page Count</th>
					<td>{pageCount}</td>
				</tr>
				<tr>
					<th>Favorite ?</th>
					<td>{favorite ? 'Yes' : 'No'}</td>
				</tr>
			</tbody>
		</table>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>

<Toast bind:this={toast} />
