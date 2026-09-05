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
	<div class="mp-backdrop disaster-backdrop" role="presentation" onclick={close}></div>
	<div class="mp-window disaster-modal" role="dialog" aria-labelledby="disaster-title" aria-modal="true">
		<header class="mp-window-header disaster-header">
			<h2 id="disaster-title">Disasters</h2>
			<button type="button" class="mp-window-close" onclick={close} aria-label="Close">×</button>
		</header>

		<div class="mp-window-body disaster-body">
			{#each DISASTERS as disaster (disaster.label)}
				<button type="button" class="mp-button mp-danger disaster-option" onclick={() => unleash(disaster.trigger)}>
					{disaster.label}
				</button>
			{/each}
		</div>
	</div>
{/if}

<style>
	.disaster-backdrop {
		z-index: 45;
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
		font-size: 0.82rem;
	}

	.disaster-header {
		padding: 0.5rem 0.6rem;
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
		font-weight: 700;
		text-align: left;
	}
</style>
