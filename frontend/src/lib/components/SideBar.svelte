<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { browseURL, tagURL, historyURL, userURL, aboutURL } from '$lib/routes';

	import { Icon } from 'svelte-icon';
	import { mdiBookshelf, mdiTagMultiple, mdiHistory, mdiAccount, mdiInformation } from '@mdi/js';

	let { children = undefined, showMenu = $bindable() } = $props();
</script>

<div class="drawer-side z-3">
	<div
		class="drawer-overlay"
		role="none"
		onkeydown={() => (showMenu = false)}
		onclick={() => (showMenu = false)}
	></div>
	<ul class="menu bg-base-200 text-base-content min-h-full w-80 p-4">
		{@render children?.()}

		<ul class="list">
			<li class="list-row text-xl">Navigation</li>

			<li class="list-row">
				<button onclick={() => goto(browseURL(page.url.origin))}>
					<Icon data={mdiBookshelf} class="fill-slate-400 stroke-slate-800" />&nbsp;Browse items
				</button>
			</li>
			<li class="list-row">
				<button onclick={() => goto(tagURL(page.url.origin))}>
					<Icon data={mdiTagMultiple} class="fill-slate-400 stroke-slate-800" />&nbsp;Tag list
				</button>
			</li>

			<li class="list-row">
				<button onclick={() => goto(historyURL(page.url.origin))}>
					<Icon data={mdiHistory} class="fill-slate-400 stroke-slate-800" />&nbsp;History
				</button>
			</li>
			<li class="list-row">
				<button onclick={() => goto(userURL(page.url.origin))}>
					<Icon data={mdiAccount} class="fill-slate-400 stroke-slate-800" />User
				</button>
			</li>
			<li class="list-row">
				<button onclick={() => goto(aboutURL(page.url.origin))}>
					<Icon data={mdiInformation} class="fill-slate-400 stroke-slate-800" />About
				</button>
			</li>
		</ul>
	</ul>
</div>
