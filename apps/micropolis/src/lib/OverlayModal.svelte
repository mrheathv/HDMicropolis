<script lang="ts">
	import { onMount } from 'svelte';
	import { overlayState } from '$lib/OverlayState.svelte';
	import type { OverlayMapId } from '$lib/wasm/overlayMaps';

	const open = $derived(overlayState.open);
	const active = $derived(overlayState.active);

	// Labels lifted verbatim from the classic "Zoom" overlay menu
	// (documentation/openlaszlo/resources/data/strings_en-US.xml).
	const OPTIONS: Array<{ id: OverlayMapId | 'none'; label: string }> = [
		{ id: 'none', label: 'All Zones' },
		{ id: 'population', label: 'Population Density' },
		{ id: 'rateOfGrowth', label: 'Rate of Growth' },
		{ id: 'traffic', label: 'Traffic Density' },
		{ id: 'pollution', label: 'Pollution Density' },
		{ id: 'crime', label: 'Crime Rate' },
		{ id: 'landValue', label: 'Land Value' },
		{ id: 'power', label: 'Power Connectivity' }
	];

	function close() {
		overlayState.close();
	}

	function choose(id: OverlayMapId | 'none') {
		overlayState.select(id);
	}

	onMount(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (!open) return;
			if (event.key === 'Escape') {
				event.preventDefault();
				event.stopImmediatePropagation();
				close();
			}
		};
		window.addEventListener('keydown', onKeyDown, true);
		return () => window.removeEventListener('keydown', onKeyDown, true);
	});
</script>

{#if open}
	<div class="overlay-backdrop" role="presentation" onclick={close}></div>
	<div class="overlay-modal" role="dialog" aria-labelledby="overlay-title" aria-modal="true">
		<header class="overlay-header">
			<h2 id="overlay-title">Zoom</h2>
			<button type="button" class="overlay-close" onclick={close} aria-label="Close">×</button>
		</header>

		<div class="overlay-body">
			{#each OPTIONS as option (option.id)}
				<button
					type="button"
					class="overlay-option"
					class:active={active === option.id}
					onclick={() => choose(option.id)}
				>
					{option.label}
				</button>
			{/each}
		</div>
	</div>
{/if}

<style>
	.overlay-backdrop {
		position: fixed;
		inset: 0;
		z-index: 45;
		background: rgba(0, 0, 0, 0.5);
	}

	.overlay-modal {
		position: fixed;
		z-index: 46;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: min(18rem, 90vw);
		max-height: min(80vh, 30rem);
		display: flex;
		flex-direction: column;
		padding: 0;
		background: rgba(8, 12, 20, 0.97);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 10px;
		color: #eef2ff;
		font-size: 0.82rem;
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
	}

	.overlay-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.85rem 1rem 0.65rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	h2 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
	}

	.overlay-close {
		width: 1.75rem;
		height: 1.75rem;
		padding: 0;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 6px;
		background: rgba(255, 255, 255, 0.08);
		color: inherit;
		font-size: 1.1rem;
		line-height: 1;
		cursor: pointer;
	}

	.overlay-body {
		overflow: auto;
		padding: 0.6rem;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.overlay-option {
		padding: 0.5rem 0.7rem;
		border-radius: 6px;
		border: 1px solid rgba(255, 255, 255, 0.15);
		background: rgba(255, 255, 255, 0.06);
		color: inherit;
		cursor: pointer;
		font: inherit;
		text-align: left;
	}

	.overlay-option:hover {
		background: rgba(255, 255, 255, 0.14);
	}

	.overlay-option.active {
		border-color: rgba(140, 180, 255, 0.7);
		background: rgba(80, 140, 255, 0.25);
		font-weight: 600;
	}
</style>
