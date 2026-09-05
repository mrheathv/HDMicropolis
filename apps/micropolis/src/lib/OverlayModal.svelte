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
	<div class="mp-backdrop overlay-backdrop" role="presentation" onclick={close}></div>
	<div class="mp-window overlay-modal" role="dialog" aria-labelledby="overlay-title" aria-modal="true">
		<header class="mp-window-header overlay-header">
			<h2 id="overlay-title">Zoom</h2>
			<button type="button" class="mp-window-close" onclick={close} aria-label="Close">×</button>
		</header>

		<div class="mp-window-body overlay-body">
			{#each OPTIONS as option (option.id)}
				<button
					type="button"
					class="mp-button overlay-option"
					class:mp-selected={active === option.id}
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
		z-index: 45;
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
		font-size: 0.82rem;
	}

	.overlay-header {
		padding: 0.5rem 0.6rem;
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
		text-align: left;
	}

	.overlay-option.mp-selected {
		font-weight: 700;
	}
</style>
