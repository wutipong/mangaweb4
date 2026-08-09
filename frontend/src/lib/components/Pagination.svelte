<script lang="ts">
	import { page } from '$app/state';
	import { Icon } from 'svelte-icon';
	import { mdiPageFirst, mdiPageLast, mdiDotsVertical } from '@mdi/js';
	import { goto } from '$app/navigation';
	import PaginationDialog from './PaginationDialog.svelte';

	interface Props {
		currentPage?: number;
		totalPage?: number;
		pageToShow?: number;
	}

	let { currentPage = 0, totalPage = 1, pageToShow = 5 }: Props = $props();

	let first = $derived.by(() => Math.max(0, currentPage - Math.floor(pageToShow / 2)));
	let last = $derived.by(() => Math.min(totalPage - 1, first + pageToShow - 1));

	let pageNumbers: number[] = $derived.by(() =>
		Array.from({ length: last - first + 1 }, (_, i) => first + i)
	);

	let customInput: PaginationDialog;

	function createLink(i: number): URL {
		let url = new URL(page.url);
		url.searchParams.set('page', i.toString());

		return url;
	}
</script>

<div class="fixed inset-x-1/2 bottom-10 hidden md:flex">
	<div class="join -translate-x-1/2 shadow-xl">
		<button class="join-item btn" onclick={() => goto(createLink(0))}>
			<Icon data={mdiPageFirst} />
		</button>

		{#each pageNumbers as i (i)}
			<button
				class="join-item btn"
				class:btn-active={currentPage == i}
				class:btn-primary={currentPage == i}
				onclick={() => goto(createLink(i))}
			>
				{i}
			</button>
		{/each}

		<button class="join-item btn" onclick={() => customInput.showModal()}>
			<Icon data={mdiDotsVertical} />
		</button>

		<button class="join-item btn" onclick={() => goto(createLink(totalPage - 1).toString())}>
			<Icon data={mdiPageLast} />
		</button>
	</div>
</div>

<PaginationDialog bind:this={customInput} {currentPage} {totalPage} {createLink} />
