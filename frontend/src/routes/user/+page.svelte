<script lang="ts">
	import { goto } from '$app/navigation';
	import Container from '$lib/components/Container.svelte';
	import Content from '$lib/components/Content.svelte';
	import NavBar from '$lib/components/NavBar.svelte';
	import SideBar from '$lib/components/SideBar.svelte';
	import md5 from 'md5';
	import Icon from 'mdi-svelte';
	import { mdiLogout } from '@mdi/js';
	import { authClient } from '$lib/auth';

	let { data } = $props();
	let showMenu = $state(false);

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
					<img
						class="mt-0"
						alt="user avartar"
						src="https://www.gravatar.com/avatar/{md5(data.user.email)}"
					/>
				</div>
			</div>

			<h2 class="mt-4">{data.user.name}</h2>
			<p><b>Email</b> {data.user.email}</p>

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
								{data.userId}
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
								{data.readItemCount} / {data.backend.itemCount}
							</td>
						</tr>
						<tr>
							<td class="align-middle"> # Favorite items </td>
							<td>
								{data.favoriteItemCount} / {data.backend.itemCount}
							</td>
						</tr>
						<tr>
							<td class="align-middle"> # Favorite tags </td>
							<td>
								{data.favoriteTagCount} / {data.backend.tagCount}
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</Content>
	<SideBar bind:showMenu user={data.user} />
</Container>
