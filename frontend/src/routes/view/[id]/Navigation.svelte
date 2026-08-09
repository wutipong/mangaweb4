<script lang="ts">
	import Icon from 'mdi-svelte';
	import { mdiChevronLeft, mdiChevronRight, mdiPageFirst, mdiPageLast } from '@mdi/js';

	let {
		length,
		current = $bindable(0),
		show = $bindable(true),
		onMovedToPage = (_i: number) => {},
		onPrevious = () => {},
		onNext = () => {}
	} = $props();
</script>

<div
	class="bg-base-100 fixed bottom-0 h-50 w-full transition-all duration-200 ease-in motion-reduce:transition-none motion-reduce:duration-0"
	class:opacity-0={!show}
	class:opacity-100={show}
	class:visible={show}
	class:invisible={!show}
>
	<div class="mx-auto max-w-5xl p-3">
		<h3 class="text-lg font-bold">Move to page</h3>
		<div class="mt-4 flex flex-row">
			<button
				class="btn flex-none"
				onclick={() => {
					onMovedToPage(0);
				}}
			>
				<Icon path={mdiPageFirst} />
			</button>
			<button
				class="btn flex-none"
				onclick={() => {
					onPrevious();
				}}
			>
				<Icon path={mdiChevronLeft} />
			</button>
			<input
				type="range"
				class="range mx-2 flex-1 place-self-center"
				min="0"
				max={length}
				bind:value={current}
				onchange={(e: Event) => onMovedToPage((e.target as HTMLInputElement).value)}
			/>
			<button
				class="btn flex-none"
				onclick={() => {
					onNext();
				}}
			>
				<Icon path={mdiChevronRight} />
			</button>
			<button
				class="btn flex-none"
				onclick={() => {
					onMovedToPage(length - 1);
				}}
			>
				<Icon path={mdiPageLast} />
			</button>
		</div>
		<p class="mt-2">
			{current + 1} of {length}
		</p>
	</div>
</div>
