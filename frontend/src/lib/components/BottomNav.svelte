<script lang="ts">
	import { Icon } from 'svelte-icon';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	import { mdiArrowUpBox, mdiPageNext, mdiChevronLeft, mdiChevronRight } from '@mdi/js';

	const moveUpIcon = mdiArrowUpBox;
	const pageIcon = mdiPageNext;
	const previousPageIcon = mdiChevronLeft;
	const nextPageIcon = mdiChevronRight;

	import PaginationDialog from './PaginationDialog.svelte';

	function moveToTop() {
		location.hash = '#top';
		location.hash = '';
	}

	interface Props {
		currentPage?: number;
		totalPage?: number;
	}

	let { currentPage = 0, totalPage = 1 }: Props = $props();

	function createLink(i: number): URL {
		let url = new URL(page.url);
		url.searchParams.set('page', i.toString());

		return url;
	}

	let customInput: PaginationDialog;
</script>

<div class="fixed inset-x-1/2 bottom-10 md:hidden">
	<div class="join bg-base-100 -translate-x-1/2 shadow-xl">
		<button class="join-item btn" onclick={() => customInput.showModal()}>
			<Icon data={pageIcon} class="fill-slate-400 stroke-slate-800" /> Page
		</button>

		<button
			class="join-item btn hidden flex-none sm:block"
			class:btn-disabled={currentPage - 1 < 0}
			onclick={() => goto(createLink(currentPage - 1))}
		>
			<Icon data={previousPageIcon} />
		</button>

		<button class="join-item btn btn-active btn-primary">{currentPage}</button>

		<button
			class="join-item btn hidden flex-none sm:block"
			class:btn-disabled={currentPage + 1 > totalPage - 1}
			onclick={() => goto(createLink(currentPage + 1))}
		>
			<Icon data={nextPageIcon} />
		</button>

		<button class="join-item btn" onclick={moveToTop}>
			<Icon data={moveUpIcon} class="fill-slate-400 stroke-slate-800" />
			Top
		</button>
	</div>
</div>

<PaginationDialog bind:this={customInput} {currentPage} {totalPage} {createLink} />
