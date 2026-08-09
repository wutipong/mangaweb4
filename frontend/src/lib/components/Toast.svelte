<script lang="ts">
	import { Icon } from 'svelte-icon';
	import { mdiInformationOutline, mdiCheck, mdiAlertCircleOutline, mdiAlertCircle } from '@mdi/js';

	let messages: {
		body: string;
		type: 'info' | 'success' | 'warning' | 'error';
	}[] = $state([]);

	export function add(body: string, type: 'info' | 'success' | 'warning' | 'error') {
		messages.push({ body, type });

		setTimeout(() => messages.shift(), 5_000);
	}
</script>

<div class="toast z-20">
	{#each messages as m, _index (_index)}
		<div
			class="alert"
			class:alert-info={m.type == 'info'}
			class:alert-success={m.type == 'success'}
			class:alert-warning={m.type == 'warning'}
			class:alert-error={m.type == 'error'}
		>
			{#if m.type == 'info'}
				<Icon data={mdiInformationOutline} />
			{:else if m.type == 'success'}
				<Icon data={mdiCheck} />
			{:else if m.type == 'warning'}
				<Icon data={mdiAlertCircleOutline} />
			{:else if m.type == 'error'}
				<Icon data={mdiAlertCircle} />
			{/if}
			<span>{m.body}</span>
		</div>
	{/each}
</div>
