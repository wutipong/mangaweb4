<script lang="ts">
	import { Icon } from 'svelte-icon';
	import logo from '$lib/assets/logo.svg?raw';
	import { mdiMenu, mdiArrowLeft, mdiReload } from '@mdi/js';
	import { MediaQuery } from 'svelte/reactivity';
	import { page } from '$app/state';
	let {
		children = undefined,
		showMenu = $bindable(),
		show = $bindable(true),
		hasmenu = true,
		rootPage = false
	} = $props();

	const isBrowser = new MediaQuery('display-mode: browser');
</script>

<div
	class="navbar bg-base-100 sticky top-0 z-2 shadow-sm transition-all duration-200 motion-reduce:transition-none"
	class:opacity-0={!show}
	class:opacity-100={show}
	class:visible={show}
	class:invisible={!show}
>
	<div class="mx-auto flex w-full max-w-5xl">
		{#if !isBrowser.current}
			<div class="flex-none place-self-center">
				<button class="btn btn-ghost" class:btn-disabled={rootPage} onclick={() => history.back()}>
					<Icon data={mdiArrowLeft} />
				</button>
			</div>

			<div class="flex-none place-self-center">
				<button class="btn btn-ghost" onclick={() => location.reload()}>
					<Icon data={mdiReload} />
				</button>
			</div>
		{/if}

		<div class="flex-none place-self-center">
			<a class="flex-none" href={page.url.origin.toString()}>
				<Icon data={logo} width="128px" height="48px" />
			</a>
		</div>
		<div class="flex-1 grow place-self-center overflow-hidden">
			{@render children?.()}
		</div>
		<div class="flex-none place-self-center">
			{#if hasmenu}
				<button class="btn btn-square btn-ghost" onclick={() => (showMenu = true)}>
					<Icon data={mdiMenu} class="fill-slate-400 stroke-slate-800" />
				</button>
			{/if}
		</div>
	</div>
</div>
