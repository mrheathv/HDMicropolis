<script lang="ts">
	import { onMount } from 'svelte';
	import { disasterState } from '$lib/DisasterState.svelte';
	import { micropolisReactive } from '$lib/MicropolisReactive.svelte';

	const open = $derived(disasterState.open);

	// Labels lifted verbatim from the classic "Disasters" menu
	// (documentation/openlaszlo/resources/data/strings_en-US.xml).
	const DISASTERS = [
		{ label: 'Monster', trigger: () => micropolisReactive.poke.makeMonster() },
		{ label: 'Fire', trigger: () => micropolisReactive.poke.makeFire() },
		{ label: 'Flood', trigger: () => micropolisReactive.poke.makeFlood() },
		{ label: 'Meltdown', trigger: () => micropolisReactive.poke.makeMeltdown() },
		{ label: 'Tornado', trigger: () => micropolisReactive.poke.makeTornado() },
		{ label: 'Earthquake', trigger: () => micropolisReactive.poke.makeEarthquake() }
	];

	function close() {
		disasterState.close();
	}

	function unleash(trigger: () => void) {
		trigger();
		close();
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
	<div class="disaster-backdrop" role="presentation" onclick={close}></div>
	<div class="disaster-modal" role="dialog" aria-labelledby="disaster-title" aria-modal="true">
		<header class="disaster-header">
			<h2 id="disaster-title">Disasters</h2>
			<button type="button" class="disaster-close" onclick={close} aria-label="Close">×</button>
		</header>

		<div class="disaster-body">
			{#each DISASTERS as disaster (disaster.label)}
				<button type="button" class="disaster-option" onclick={() => unleash(disaster.trigger)}>
					{disaster.label}
				</button>
			{/each}
		</div>
	</div>
{/if}

<style>
	.disaster-backdrop {
		position: fixed;
		inset: 0;
		z-index: 45;
		background: rgba(0, 0, 0, 0.5);
	}

	.disaster-modal {
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

	.disaster-header {
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

	.disaster-close {
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

	.disaster-body {
		overflow: auto;
		padding: 0.6rem;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.disaster-option {
		padding: 0.5rem 0.7rem;
		border-radius: 6px;
		border: 1px solid rgba(255, 100, 100, 0.3);
		background: rgba(200, 60, 60, 0.12);
		color: inherit;
		cursor: pointer;
		font: inherit;
		font-weight: 600;
		text-align: left;
	}

	.disaster-option:hover {
		background: rgba(220, 70, 70, 0.28);
		border-color: rgba(255, 120, 120, 0.6);
	}
</style>
