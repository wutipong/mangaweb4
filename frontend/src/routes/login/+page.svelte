<script lang="ts">
	import { authClient } from '$lib/auth';
	import Container from '$lib/components/Container.svelte';
	import Content from '$lib/components/Content.svelte';
	import NavBar from '$lib/components/NavBar.svelte';

	var { data } = $props();
	$inspect(data);

	async function login() {
		authClient.signIn.oauth2(data);
	}
</script>

<svelte:head>
	<title>MangaWeb 4 Login</title>
</svelte:head>

<Container>
	<Content>
		<NavBar><div class="text-xl">Login</div></NavBar>
		<div class="prose container mx-auto mt-4 max-w-5xl">
			<h2>Login using OpenID Connect.</h2>

			<div>
				<button class="btn btn-primary w-full" onclick={() => login()}> Login </button>
			</div>
		</div>
	</Content>
</Container>
