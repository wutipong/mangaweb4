<script lang="ts">
	import Icon from 'mdi-svelte';
	import { mdiAlertCircle } from '@mdi/js';
	import logger from '$lib/logger';

	let { alt, src, grayscale = true, onLoaded = () => {} } = $props();

	let img: HTMLImageElement;
	let loading: 'lazy' | 'eager' = $state('lazy');
	let loaded = $state(false);
	let error = $state(false);
	let retry = 0;

	const MAX_RETRY = 10;

	export function forceLoad() {
		loading = 'eager';
	}

	function onImageError() {
		if (retry <= MAX_RETRY) {
			setTimeout(() => {
				let url = new URL(src);
				url.searchParams.append('retry', retry.toString());

				img.src = url.toString();
				retry++;
			}, 500);
		} else {
			error = true;
		}
	}

	function onImageLoad() {
		logger.debug(`img: ${alt} is loaded.`);

		if (!loaded) onLoaded();
		loaded = true;
	}
</script>

<div class="relative h-full w-full">
	<img
		class="absolute h-full max-h-full w-full max-w-full object-contain"
		class:grayscale
		{loading}
		{alt}
		src={src.toString()}
		onerror={() => onImageError()}
		onload={() => onImageLoad()}
		bind:this={img}
	/>
	{#if !loaded}
		<div class="absolute inset-1/2 place-self-center">
			<span class="loading loading-bars loading-xl mx-auto my-auto"></span>
		</div>
	{:else if error}
		<div class="absolute inset-1/2 place-self-center text-error">
			<Icon path={mdiAlertCircle} size="64"/>
		</div>
	{/if}
</div>
