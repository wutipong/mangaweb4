<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Content from '$lib/components/Content.svelte';
	import NavBar from '$lib/components/NavBar.svelte';
	import { authClient } from '$lib/auth';
	import { redirect } from '@sveltejs/kit';

	async function logOut() {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					redirect(307, '/login');
				}
			}
		});
	}
</script>

<svelte:head>
	<title>MangaWeb 4 Logout</title>
</svelte:head>

<Container>
	<Content>
		<NavBar><div class="text-xl">Logout</div></NavBar>
		<div class="prose container mx-auto mt-4 max-w-5xl">
			You have signed out of the system. To sign back in, please click <a href="/login">login</a>
		</div>
	</Content>
</Container>
