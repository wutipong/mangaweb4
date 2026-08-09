<script lang="ts">
	import Icon from 'mdi-svelte';
	import { mdiArrowUpBox } from '@mdi/js';

	function moveToTop() {
		location.hash = '#top';
		location.hash = '';
	}
</script>

<nav aria-label="Move to top navigation" class="fixed inset-e-5 bottom-10 hidden md:flex xl:end-30">
	<button class="btn shadow-xl" onclick={moveToTop}>
		<Icon path={mdiArrowUpBox}  />
		<span class="d-none d-sm-block">Top</span>
	</button>
</nav>
