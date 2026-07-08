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
	<div class="cityhall-backdrop" role="presentation" onclick={close}></div>
	<div class="cityhall-modal" role="dialog" aria-labelledby="cityhall-title" aria-modal="true">
		<header class="cityhall-header">
			<h2 id="cityhall-title">City Hall</h2>
			<button type="button" class="cityhall-close" onclick={close} aria-label="Close City Hall">×</button>
		</header>

		<div class="cityhall-body">
			<section class="cityhall-section">
				<label class="cityhall-label" for="tax-rate">
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
				<span class="cityhall-label">Difficulty</span>
				<div class="difficulty-buttons">
					{#each DIFFICULTY_LABELS as label, level}
						<button
							type="button"
							class="difficulty-button"
							class:active={gameLevel === level}
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
		</div>
	</div>
{/if}

<style>
	.cityhall-backdrop {
		position: fixed;
		inset: 0;
		z-index: 45;
		background: rgba(0, 0, 0, 0.5);
	}

	.cityhall-modal {
		position: fixed;
		z-index: 46;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: min(22rem, 92vw);
		padding: 0;
		background: rgba(8, 12, 20, 0.97);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 10px;
		color: #eef2ff;
		font-size: 0.82rem;
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
	}

	.cityhall-header {
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

	.cityhall-close {
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

	.cityhall-body {
		padding: 0.85rem 1rem 1rem;
	}

	.cityhall-section + .cityhall-section {
		margin-top: 1rem;
	}

	.cityhall-label {
		display: flex;
		justify-content: space-between;
		font-weight: 600;
		margin-bottom: 0.4rem;
	}

	.cityhall-value {
		font-variant-numeric: tabular-nums;
		color: #9cf59c;
	}

	input[type='range'] {
		width: 100%;
	}

	.difficulty-buttons {
		display: flex;
		gap: 0.4rem;
	}

	.difficulty-button {
		flex: 1;
		padding: 0.35rem 0.5rem;
		border-radius: 6px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		background: rgba(255, 255, 255, 0.08);
		color: inherit;
		cursor: pointer;
		font: inherit;
	}

	.difficulty-button.active {
		background: rgba(80, 140, 255, 0.45);
		border-color: rgba(140, 180, 255, 0.6);
	}

	.auto-budget {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
</style>
