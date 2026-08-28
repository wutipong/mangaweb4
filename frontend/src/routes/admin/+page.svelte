<script lang="ts">
	import { page } from '$app/state';
	import Container from '$lib/components/Container.svelte';
	import Content from '$lib/components/Content.svelte';
	import NavBar from '$lib/components/NavBar.svelte';
	import SideBar from '$lib/components/SideBar.svelte';
	import type { ApiKey } from '@better-auth/api-key';

	import Icon from 'mdi-svelte';
	import { mdiAlert, mdiKeyPlus, mdiKeyRemove, mdiPlayCircle } from '@mdi/js';
	import { authClient } from '$lib/auth';
	import { onMount } from 'svelte';
	import Toast from '$lib/components/Toast.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';

	let showMenu = $state(false);

	let apiKeys: Omit<ApiKey, 'key'>[] = $state([]);
	let apiKeyModal: HTMLDialogElement;
	let apiNewKey = $state('');

	let toast: Toast;
	let confirm: ConfirmDialog;

	let { data } = $props();

	onMount(async () => {
		const keys = await authClient.apiKey.list();
		if (keys.data) {
			apiKeys = keys.data.apiKeys;
		}
	});

	async function addNewApiKey() {
		const { data, error } = await authClient.apiKey.create({});
		if (error) {
			toast.add(`unable to add new api key: ${error.statusText}`, 'error');
			return;
		}
		if (data) {
			apiNewKey = data.key;
			await navigator.clipboard.writeText(data.key);
			apiKeyModal.showModal();
		}

		const keys = await authClient.apiKey.list();
		if (keys.data) {
			apiKeys = keys.data.apiKeys;
		}
	}

	async function deleteApiKey(id: string) {
		const { error } = await authClient.apiKey.delete({ keyId: id });
		if (error) {
			toast.add(`unable to delete api key: ${error.statusText}`, 'error');
			return;
		}

		const keys = await authClient.apiKey.list();
		if (keys.data) {
			apiKeys = keys.data.apiKeys;
		}
	}

	function confirmUpdateLibrary() {
		confirm.show(
			'Update library',
			'The library will be updated. This will take sometime. Do you still wants to perform?',
			updateLibrary
		);
	}

	async function updateLibrary() {
		const url = new URL('/api/maintenance/update_library', page.url.origin);
		await fetch(url);

		toast.add('Updating the library in progress. Please refresh after a few minutes.', 'info');
	}

	function confirmPurgeCache() {
		confirm.show(
			'Purge cache',
			'Cache will be purged. This will take sometime. Do you still wants to perform?',
			purgeCache
		);
	}

	async function purgeCache() {
		const url = new URL('/api/maintenance/purge_cache', page.url.origin);
		await fetch(url);
		toast.add('Purging cache in progress. Please refresh after a few minutes.', 'info');
	}

	function confirmPopulateTags() {
		confirm.show(
			'Repopulate tags',
			'Tags list will be updated. This will take sometime. Do you still wants to perform?',
			populateTags
		);
	}

	async function populateTags() {
		const url = new URL('/api/maintenance/populate_tags', page.url.origin);
		await fetch(url);
		toast.add('Re-populate tags in progress. Please refresh after a few minutes.', 'info');
	}
</script>

<svelte:head>
	<title>Administration: Mangaweb 4</title>
</svelte:head>

<Container bind:showMenu>
	<Content>
		<NavBar bind:showMenu><div class="text-xl">Administration</div></NavBar>
		<div class="prose container mx-auto mt-4 max-w-5xl">
			<div class="mt-4">
				<h2>Maintenance</h2>

				<table class="table-zebra table-pin-rows table">
					<thead>
						<tr>
							<th>Operations</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td class="align-middle"> Update library </td>
							<td>
								<button class="btn btn-warning" onclick={() => confirmUpdateLibrary()}>
									<Icon path={mdiPlayCircle} />&nbsp;Run
								</button>
							</td>
						</tr>
						<tr>
							<td class="align-middle"> Repopulate tags </td>
							<td>
								<button class="btn btn-warning" onclick={() => confirmPopulateTags()}>
									<Icon path={mdiPlayCircle} />&nbsp;Run
								</button>
							</td>
						</tr>
						<tr>
							<td class="align-middle"> Purge caches </td>
							<td>
								<button class="btn btn-warning" onclick={() => confirmPurgeCache()}>
									<Icon path={mdiPlayCircle} />&nbsp;Run
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<hr />
			<h2>API Key</h2>
			<div class="border-base-300 rounded-box h-96 overflow-x-auto border">
				<table class="table-zebra table-pin-rows table">
					<thead>
						<tr>
							<th>Key</th>
							<th>Created At</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
						{#each apiKeys as apiKey}
							<tr>
								<td>{apiKey.start}...</td>
								<td>{apiKey.createdAt.toLocaleString()}</td>
								<td>
									<button class="btn btn-sm btn-secondary" onclick={() => deleteApiKey(apiKey.id)}>
										<Icon path={mdiKeyRemove} />Delete
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
					<tfoot>
						<tr>
							<th></th>
							<th></th>
							<th>
								<button class="btn btn-sm btn-primary" onclick={() => addNewApiKey()}>
									<Icon path={mdiKeyPlus} />Add
								</button>
							</th>
						</tr>
					</tfoot>
				</table>
			</div>
			<hr />
		</div>
	</Content>
	<SideBar bind:showMenu user={data.user} />
</Container>

<dialog class="modal" bind:this={apiKeyModal}>
	<div class="modal-box">
		<h3 class="text-lg font-bold">New key added</h3>
		<div role="alert" class="alert alert-warning py-4">
			<Icon path={mdiAlert} />
			<span>
				Warning: This API key will not be visible again! The key has been copied to the clipboard.
			</span>
		</div>
		<p class="py-4 font-mono text-wrap break-all">{apiNewKey}</p>
		<div class="modal-action">
			<form method="dialog">
				<!-- if there is a button in form, it will close the modal -->
				<button class="btn">Close</button>
			</form>
		</div>
	</div>
</dialog>

<ConfirmDialog bind:this={confirm} />

<Toast bind:this={toast} />
