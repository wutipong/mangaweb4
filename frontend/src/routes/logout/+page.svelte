<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import Content from '$lib/components/Content.svelte';
	import NavBar from '$lib/components/NavBar.svelte';
	import { authClient } from '$lib/auth';

	async function logOut() {
		await authClient.signOut();
	}
</script>

<svelte:head>
	<title>MangaWeb 4 Logout</title>
</svelte:head>

<Container>
	<Content>
		<NavBar><div class="text-xl">Logout</div></NavBar>
		<div class="prose container mx-auto mt-4 max-w-5xl">
			<button class="btn btn-wide btn-primary" onclick={async () => logOut()}>Logout</button>
		</div>
	</Content>
</Container>
