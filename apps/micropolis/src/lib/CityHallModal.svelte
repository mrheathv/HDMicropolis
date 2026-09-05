<script lang="ts">
	import { onMount } from 'svelte';
	import { micropolisReactive } from '$lib/MicropolisReactive.svelte';
	import { cityHallState } from '$lib/CityHallState.svelte';

	const open = $derived(cityHallState.open);
	const taxRate = $derived(micropolisReactive.cityTax);
	const gameLevel = $derived(micropolisReactive.gameLevel);

	const DIFFICULTY_LABELS = ['Easy', 'Medium', 'Hard'];

	function close() {
		cityHallState.close();
	}

	function onTaxInput(event: Event) {
		const rate = Number((event.target as HTMLInputElement).value);
		micropolisReactive.poke.setCityTax(rate);
	}

	function setDifficulty(level: number) {
		const eng = micropolisReactive.wasmModule;
		if (!eng) return;
		const value = [eng.GameLevel.LEVEL_EASY, eng.GameLevel.LEVEL_MEDIUM, eng.GameLevel.LEVEL_HARD][level];
		micropolisReactive.poke.setGameLevel(value);
	}

	function toggleAutoBudget(event: Event) {
		const checked = (event.target as HTMLInputElement).checked;
		micropolisReactive.poke.setAutoBudget(checked);
	}

	function toggleAutoBulldoze(event: Event) {
		const checked = (event.target as HTMLInputElement).checked;
		micropolisReactive.poke.setAutoBulldoze(checked);
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
	<div class="mp-backdrop cityhall-backdrop" role="presentation" onclick={close}></div>
	<div class="mp-window cityhall-modal" role="dialog" aria-labelledby="cityhall-title" aria-modal="true">
		<header class="mp-window-header cityhall-header">
			<h2 id="cityhall-title">City Hall</h2>
			<button type="button" class="mp-window-close" onclick={close} aria-label="Close City Hall">×</button>
		</header>

		<div class="mp-window-body cityhall-body">
			<section class="cityhall-section">
				<label class="mp-label cityhall-label" for="tax-rate">
					Property tax rate <span class="cityhall-value">{taxRate}%</span>
				</label>
				<input
					id="tax-rate"
					type="range"
					min="0"
					max="20"
					step="1"
					value={taxRate}
					oninput={onTaxInput}
				/>
			</section>

			<section class="cityhall-section">
				<span class="mp-label">Difficulty</span>
				<div class="difficulty-buttons">
					{#each DIFFICULTY_LABELS as label, level}
						<button
							type="button"
							class="mp-button difficulty-button"
							class:mp-selected={gameLevel === level}
							onclick={() => setDifficulty(level)}
						>
							{label}
						</button>
					{/each}
				</div>
			</section>

			<section class="cityhall-section">
				<label class="auto-budget">
					<input
						type="checkbox"
						checked={micropolisReactive.autoBudget}
						onchange={toggleAutoBudget}
					/>
					Auto-budget (engine manages department funding)
				</label>
			</section>

			<section class="cityhall-section">
				<label class="auto-budget">
					<input
						type="checkbox"
						checked={micropolisReactive.autoBulldoze}
						onchange={toggleAutoBulldoze}
					/>
					Auto Bulldoze (clear trees/rubble automatically, for a fee)
				</label>
			</section>
		</div>
	</div>
{/if}

<style>
	.cityhall-backdrop {
		z-index: 45;
	}

	.cityhall-modal {
		position: fixed;
		z-index: 46;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: min(22rem, 92vw);
		font-size: 0.82rem;
	}

	.cityhall-header {
		padding: 0.5rem 0.6rem;
	}

	.cityhall-body {
		padding: 0.85rem 1rem 1rem;
	}

	.cityhall-section + .cityhall-section {
		margin-top: 1rem;
	}

	.cityhall-label {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.4rem;
	}

	.cityhall-value {
		font-variant-numeric: tabular-nums;
		color: var(--mp-money);
	}

	input[type='range'] {
		width: 100%;
		accent-color: var(--mp-accent);
	}

	.difficulty-buttons {
		display: flex;
		gap: 0.4rem;
	}

	.difficulty-button {
		flex: 1;
		padding: 0.35rem 0.5rem;
	}

	.auto-budget {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
</style>
