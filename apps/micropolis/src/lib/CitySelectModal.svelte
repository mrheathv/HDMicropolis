<script lang="ts">
	import { onMount } from 'svelte';
	import { micropolisReactive } from '$lib/MicropolisReactive.svelte';
	import { citySelectState } from '$lib/CitySelectState.svelte';

	const open = $derived(citySelectState.open);

	// Mirrors apps/micropolis/cli/city/scenario.js's ScenarioDefaults (kept as
	// plain data here rather than importing that module, which pulls in
	// node:path and isn't meant for the browser bundle).
	const SCENARIOS = [
		{ label: 'Dullsville', year: 1900, file: '/cities/scenario_dullsville.cty' },
		{ label: 'San Francisco', year: 1906, file: '/cities/scenario_san_francisco.cty' },
		{ label: 'Hamburg', year: 1944, file: '/cities/scenario_hamburg.cty' },
		{ label: 'Bern', year: 1965, file: '/cities/scenario_bern.cty' },
		{ label: 'Tokyo', year: 1957, file: '/cities/scenario_tokyo.cty' },
		{ label: 'Detroit', year: 1972, file: '/cities/scenario_detroit.cty' },
		{ label: 'Boston', year: 2010, file: '/cities/scenario_boston.cty' },
		{ label: 'Rio de Janeiro', year: 2047, file: '/cities/scenario_rio_de_janeiro.cty' }
	];

	const scenarioFiles = new Set(SCENARIOS.map((s) => s.file));

	function displayName(file: string): string {
		const base = file.replace(/^\/cities\//, '').replace(/\.cty$/, '');
		return base
			.split(/[_-]/)
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}

	const otherMaps = $derived(
		(micropolisReactive.attachedSimulator?.cityFileNames ?? [])
			.filter((file) => !scenarioFiles.has(file))
			.map((file) => ({ label: displayName(file), file }))
	);

	function close() {
		citySelectState.close();
	}

	function load(file: string) {
		micropolisReactive.poke.loadCity(file);
		close();
	}

	function randomCity() {
		micropolisReactive.poke.generateSomeRandomCity();
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
	<div class="cityselect-backdrop" role="presentation" onclick={close}></div>
	<div class="cityselect-modal" role="dialog" aria-labelledby="cityselect-title" aria-modal="true">
		<header class="cityselect-header">
			<h2 id="cityselect-title">Load a city</h2>
			<button type="button" class="cityselect-close" onclick={close} aria-label="Close">×</button>
		</header>

		<div class="cityselect-body">
			<button type="button" class="random-button" onclick={randomCity}>🎲 Random new city</button>

			<h3>Scenarios</h3>
			<div class="city-grid">
				{#each SCENARIOS as scenario (scenario.file)}
					<button type="button" class="city-button" onclick={() => load(scenario.file)}>
						<span class="city-name">{scenario.label}</span>
						<span class="city-year">{scenario.year}</span>
					</button>
				{/each}
			</div>

			<h3>Other maps</h3>
			<div class="city-grid">
				{#each otherMaps as map (map.file)}
					<button type="button" class="city-button" onclick={() => load(map.file)}>
						<span class="city-name">{map.label}</span>
					</button>
				{/each}
			</div>
		</div>
	</div>
{/if}

<style>
	.cityselect-backdrop {
		position: fixed;
		inset: 0;
		z-index: 45;
		background: rgba(0, 0, 0, 0.5);
	}

	.cityselect-modal {
		position: fixed;
		z-index: 46;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: min(26rem, 92vw);
		max-height: min(80vh, 34rem);
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

	.cityselect-header {
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

	.cityselect-close {
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

	.cityselect-body {
		overflow: auto;
		padding: 0.75rem 1rem 1rem;
	}

	h3 {
		margin: 0.85rem 0 0.4rem;
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #9cf59c;
	}

	h3:first-of-type {
		margin-top: 0.5rem;
	}

	.random-button {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border-radius: 6px;
		border: 1px solid rgba(140, 180, 255, 0.6);
		background: rgba(80, 140, 255, 0.3);
		color: inherit;
		cursor: pointer;
		font: inherit;
		font-weight: 600;
	}

	.city-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.4rem;
	}

	.city-button {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.1rem;
		padding: 0.4rem 0.6rem;
		border-radius: 6px;
		border: 1px solid rgba(255, 255, 255, 0.15);
		background: rgba(255, 255, 255, 0.06);
		color: inherit;
		cursor: pointer;
		font: inherit;
		text-align: left;
	}

	.city-button:hover {
		background: rgba(255, 255, 255, 0.14);
	}

	.city-name {
		font-weight: 600;
	}

	.city-year {
		font-size: 0.72rem;
		opacity: 0.7;
	}
</style>
