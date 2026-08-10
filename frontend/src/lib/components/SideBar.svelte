<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { browseURL, tagURL, historyURL, userURL, aboutURL } from '$lib/routes';

	import Icon from 'mdi-svelte';
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
					<Icon path={mdiBookshelf} />&nbsp;Browse items
				</button>
			</li>
			<li class="list-row">
				<button onclick={() => goto(tagURL(page.url.origin))}>
					<Icon path={mdiTagMultiple} />&nbsp;Tag list
				</button>
			</li>

			<li class="list-row">
				<button onclick={() => goto(historyURL(page.url.origin))}>
					<Icon path={mdiHistory} />&nbsp;History
				</button>
			</li>
			<li class="list-row">
				<button onclick={() => goto(userURL(page.url.origin))}>
					<Icon path={mdiAccount} />User
				</button>
			</li>
			<li class="list-row">
				<button onclick={() => goto(aboutURL(page.url.origin))}>
					<Icon path={mdiInformation} />About
				</button>
			</li>
		</ul>
	</ul>
</div>
