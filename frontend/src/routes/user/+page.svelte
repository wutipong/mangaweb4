<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Container from '$lib/components/Container.svelte';
	import Content from '$lib/components/Content.svelte';
	import NavBar from '$lib/components/NavBar.svelte';
	import SideBar from '$lib/components/SideBar.svelte';
	import type { ApiKey } from '@better-auth/api-key';

	import md5 from 'md5';

	import Icon from 'mdi-svelte';
	import { mdiAlert, mdiKeyPlus, mdiKeyRemove, mdiLogout, mdiMinus, mdiPlus } from '@mdi/js';
	import { authClient } from '$lib/auth';
	import { onMount } from 'svelte';

	let { email, name } = page.data;
	let showMenu = $state(false);

	let apiKeys: Omit<ApiKey, 'key'>[] = $state([]);
	let apiKeyModal: HTMLDialogElement;
	let apiNewKey = $state('');

	onMount(async () => {
		const session = await authClient.getSession();
		if (!session.data) {
			console.log('session not found?');
			return;
		}

		const keys = await authClient.apiKey.list();
		if (keys.data) {
			apiKeys = keys.data.apiKeys;
		}
	});

	async function addNewApiKey() {
		const { data, error } = await authClient.apiKey.create({});
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
		const { data, error } = await authClient.apiKey.delete({ keyId: id });

		const keys = await authClient.apiKey.list();
		if (keys.data) {
			apiKeys = keys.data.apiKeys;
		}
	}

	async function logout() {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					goto('/login');
				}
			}
		});
	}
</script>

<svelte:head>
	<title>User: Mangaweb 4</title>
</svelte:head>

<Container bind:showMenu>
	<Content>
		<NavBar bind:showMenu><div class="text-xl">User</div></NavBar>
		<div class="prose container mx-auto mt-4 max-w-5xl">
			<div class="avatar">
				<div class="rounded-full">
					<img class="mt-0" alt="user avartar" src="https://www.gravatar.com/avatar/{md5(email)}" />
				</div>
			</div>

			<h2 class="mt-4">{name}</h2>
			<p><b>Email</b> {email}</p>

			<button class="btn btn-primary btn-wide mt-4" onclick={async () => await logout()}>
				<Icon path={mdiLogout} />&nbsp;Logout
			</button>
			<hr />
			<div class="mt-4 mb-4">
				<h2>Information</h2>
				<table class="table">
					<thead>
						<tr>
							<th colspan="2"> User details </th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td class="align-middle"> User ID </td>
							<td>
								{page.data.userId}
							</td>
						</tr>
					</tbody>

					<thead>
						<tr>
							<th colspan="2"> Reading statistic </th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td class="align-middle"> # Read items </td>
							<td>
								{page.data.readItemCount} / {page.data.backend.itemCount}
							</td>
						</tr>
						<tr>
							<td class="align-middle"> # Favorite items </td>
							<td>
								{page.data.favoriteItemCount} / {page.data.backend.itemCount}
							</td>
						</tr>
						<tr>
							<td class="align-middle"> # Favorite tags </td>
							<td>
								{page.data.favoriteTagCount} / {page.data.backend.tagCount}
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<hr />
			<h2>API Key</h2>
			<table>
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
								<button class="btn btn-sm" onclick={() => deleteApiKey(apiKey.id)}>
									<Icon path={mdiKeyRemove} />Delete
								</button>
							</td>
						</tr>
					{/each}
					<tr>
						<td></td>
						<td></td>
						<td>
							<button class="btn btn-sm btn-primary" onclick={() => addNewApiKey()}>
								<Icon path={mdiKeyPlus} />Add
							</button>
						</td>
					</tr>
				</tbody>
				<tfoot>
					<tr>
						<th>Key</th>
						<th>Created At</th>
						<th>Action</th>
					</tr>
				</tfoot>
			</table>
			<hr />
		</div>
	</Content>
	<SideBar bind:showMenu />
</Container>

<dialog class="modal" bind:this={apiKeyModal}>
	<div class="modal-box">
		<h3 class="text-lg font-bold">New key added</h3>
		<div role="alert" class="alert alert-warning py-4">
			<Icon path={mdiAlert} />
			<span
				>Warning: This API key will not be visible again! The key has been copied to the clipboard.</span
			>
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
