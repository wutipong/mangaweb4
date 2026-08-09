<script lang="ts">
	import {
		mdiHeart,
		mdiTagHeart,
		mdiAlertDecagram,
		mdiBookOpenVariant,
		mdiCheck,
		mdiBookOpenPageVariant,
		mdiBookshelf,
		mdiAlertBox,
		mdiMinusBox
	} from '@mdi/js';

	import Icon from 'mdi-svelte';
	import { goto } from '$app/navigation';

	interface Props {
		favorite?: boolean;
		isRead?: boolean;
		favoriteTag?: boolean;
		id?: string | number;
		name?: string;
		pageCount?: number;
		itemCount?: number;
		linkUrl?: string | URL;
		imageUrl?: string | URL;
		accessTime?: number | boolean | string | Date;
		dummy?: boolean;
		currentPage?: number;
	}

	let {
		favorite = false,
		isRead = true,
		favoriteTag = false,
		id = '',
		name = '',
		pageCount = 0,
		itemCount = 0,
		linkUrl = '',
		imageUrl = '',
		accessTime = false,
		dummy = false,
		currentPage = 0
	}: Props = $props();

	let borderCls = $derived.by(() => {
		if (!isRead) {
			return 'border border-2 border-yellow-500';
		} else if (favorite) {
			return 'border border-2 border-pink-500';
		} else if (favoriteTag) {
			return 'border border-2 border-purple-500';
		} else {
			return '';
		}
	});

	let img: HTMLImageElement | undefined = $state();
	let imageLoadErr = $state(false);
	let imageLoad = $state(false);

	function onImageError() {
		imageLoadErr = true;
	}

	function onImageLoad() {
		imageLoad = true;
	}

	let progressPercent = $derived(((currentPage ?? 0) / (pageCount ?? 1)) * 100);
	const READ_THRESHOLD = 95; // 5%
</script>

<div
	class="{borderCls} card card-border bg-base-100 h-full overflow-hidden border-2 shadow-xl md:overflow-visible"
	id={id.toString()}
>
	{#if dummy}
		<div class="mt-0 mb-0 h-full">
			<div aria-label={name} class="flex aspect-[1/1.414] items-center justify-center">
				<Icon path={mdiMinusBox} color="gray" size="10" />
			</div>
		</div>
		<div class="card-body">
			<div class="h-32">
				<div>
					<button
						class="link link-hover"
						onclick={() => {
							if (!dummy && linkUrl) goto(linkUrl);
						}}
					>
						<div class="h-full w-full">
							{name}
						</div>
					</button>
				</div>
			</div>
			{#if accessTime == true}
				<div class="divider"></div>
				<div class="h-[2em] overflow-hidden"></div>
			{/if}
		</div>
	{:else}
		<div class="mt-0 mb-0">
			<a href={linkUrl?.toString()} aria-label={name}>
				<div class="flex aspect-[1/1.414] items-center justify-center">
					{#if imageLoadErr}
						<Icon path={mdiAlertBox} size="10" color="oklch(85.2% 0.199 91.936)" />
					{:else if !imageLoad}
						<div class="absolute inset-1/2 place-self-center">
							<span class="loading loading-bars loading-xl mx-auto my-auto"></span>
						</div>
					{/if}
					<img
						bind:this={img}
						class="h-full w-full rounded-t-[5px] object-cover object-[25%_top]"
						class:hidden={imageLoadErr}
						alt={name}
						loading="lazy"
						src={imageUrl.toString()}
						onerror={() => onImageError()}
						onload={() => onImageLoad()}
					/>
				</div>
			</a>

			<div class="absolute top-4 -right-2 grid grid-cols-1 place-items-end gap-2">
				{#if favorite}
					<div class="badge border-pink-800 bg-pink-200 fill-pink-400 p-2 text-pink-800">
						<Icon path={mdiHeart} /> Favorite
					</div>
				{/if}

				{#if favoriteTag}
					<div class="badge border-purple-800 bg-purple-200 fill-purple-400 p-2 text-purple-800">
						<Icon path={mdiTagHeart} /> Favorite Tag
					</div>
				{/if}

				{#if !isRead}
					<div class="badge border-yellow-800 bg-yellow-200 fill-yellow-400 p-2 text-yellow-800">
						<Icon path={mdiAlertDecagram} /> New
					</div>
				{:else if pageCount != 0}
					<div
						class="badge border-emerald-800 bg-emerald-200 fill-emerald-400 p-2 text-emerald-800"
					>
						{#if progressPercent < READ_THRESHOLD}
							<Icon path={mdiBookOpenVariant} />
							{Math.round(progressPercent)}%
						{:else}
							<Icon path={mdiCheck} /> Read
						{/if}
					</div>
				{/if}
				{#if pageCount}
					<div class="badge border-blue-800 bg-blue-200 fill-blue-400 p-2 text-blue-800">
						<Icon path={mdiBookOpenPageVariant} />
						{pageCount}p
					</div>
				{/if}
				{#if itemCount}
					<div class="badge border-blue-800 bg-blue-200 p-2 text-blue-800">
						<Icon path={mdiBookshelf} />
						{itemCount}
					</div>
				{/if}
			</div>
		</div>
		<div class="card-body">
			<div class="tooltip">
				<div class="tooltip-content">
					{name}
				</div>
				<div class="h-32 overflow-hidden">
					<div>
						<button
							class="link link-hover"
							onclick={() => {
								if (!dummy && linkUrl) goto(linkUrl);
							}}
						>
							<div class="h-full w-full">
								{name}
							</div>
						</button>
					</div>
				</div>
			</div>
			{#if typeof accessTime != 'boolean'}
				<div class="divider">Access time</div>
				<div class="h-[2em] overflow-hidden">
					{Intl.DateTimeFormat('en', {
						year: 'numeric',
						month: 'long',
						day: 'numeric',
						hour: 'numeric',
						minute: 'numeric',
						second: 'numeric',
						timeZoneName: 'short'
					}).format(new Date(accessTime))}
				</div>
			{/if}
		</div>
	{/if}
</div>
