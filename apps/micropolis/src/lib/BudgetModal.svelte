<script lang="ts">
	import { micropolisReactive } from '$lib/MicropolisReactive.svelte';

	const open = $derived(micropolisReactive.budgetModalRequested);
	const autoBudget = $derived(micropolisReactive.autoBudget);

	interface FundLine {
		key: 'road' | 'police' | 'fire';
		label: string;
		requested: number;
		percent: number;
	}

	// Re-read whenever the modal opens or the engine recomputes the budget --
	// roadPercent/policePercent/firePercent are fractions (0..1) of roadFund/
	// policeFund/fireFund (the requested dollar amounts). Feature-detected:
	// degrades to an empty list (rather than crashing on `undefined.toLocaleString()`)
	// if an older engine build without these bindings is loaded.
	const fundLines = $derived.by((): FundLine[] => {
		void micropolisReactive.budgetRevision;
		const m = micropolisReactive.attachedSimulator?.micropolis;
		if (!m || !open || typeof m.roadFund !== 'number') return [];
		return [
			{ key: 'road', label: 'Road funding', requested: m.roadFund, percent: Math.round(m.roadPercent * 100) },
			{ key: 'police', label: 'Police funding', requested: m.policeFund, percent: Math.round(m.policePercent * 100) },
			{ key: 'fire', label: 'Fire funding', requested: m.fireFund, percent: Math.round(m.firePercent * 100) }
		];
	});

	function accept() {
		micropolisReactive.poke.doBudget();
	}

	function dismiss() {
		micropolisReactive.clearBudgetModalRequest();
	}

	function toggleAutoBudget(event: Event) {
		const checked = (event.target as HTMLInputElement).checked;
		micropolisReactive.poke.setAutoBudget(checked);
	}

	function onFundInput(key: FundLine['key'], event: Event) {
		const fraction = Number((event.target as HTMLInputElement).value) / 100;
		if (key === 'road') micropolisReactive.poke.setRoadPercent(fraction);
		else if (key === 'police') micropolisReactive.poke.setPolicePercent(fraction);
		else micropolisReactive.poke.setFirePercent(fraction);
	}
</script>

{#if open}
	<div class="budget-backdrop" role="presentation" onclick={dismiss}></div>
	<div class="budget-modal" role="dialog" aria-labelledby="budget-title" aria-modal="true">
		<h2 id="budget-title">City budget</h2>
		<p class="budget-copy">
			End-of-year budget review. Accept to apply the current budget plan and continue the simulation.
		</p>
		<label class="auto-budget">
			<input type="checkbox" checked={autoBudget} onchange={toggleAutoBudget} />
			Auto-budget (engine manages funding)
		</label>

		{#if !autoBudget}
			{#if fundLines.length > 0}
				<div class="fund-lines">
					{#each fundLines as line (line.key)}
						<div class="fund-line">
							<div class="fund-line-header">
								<span>{line.label}</span>
								<span class="fund-line-value">{line.percent}% of ${line.requested.toLocaleString()}</span>
							</div>
							<input
								type="range"
								min="0"
								max="100"
								step="1"
								value={line.percent}
								oninput={(e) => onFundInput(line.key, e)}
							/>
						</div>
					{/each}
				</div>
			{:else}
				<p class="fund-lines-unavailable">
					Manual funding controls need an updated engine build.
				</p>
			{/if}
		{/if}

		<div class="budget-actions">
			<button type="button" onclick={dismiss}>Later</button>
			<button type="button" class="primary" onclick={accept}>Accept budget</button>
		</div>
	</div>
{/if}

<style>
	.budget-backdrop {
		position: fixed;
		inset: 0;
		z-index: 40;
		background: rgba(0, 0, 0, 0.45);
	}
	.budget-modal {
		position: fixed;
		z-index: 41;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: min(22rem, 92vw);
		padding: 1rem 1.1rem;
		background: rgba(8, 12, 20, 0.96);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 10px;
		color: #eef2ff;
		font-size: 0.85rem;
	}
	h2 {
		margin: 0 0 0.5rem;
		font-size: 1rem;
	}
	.budget-copy {
		margin: 0 0 0.75rem;
		opacity: 0.9;
		line-height: 1.4;
	}
	.auto-budget {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		margin-bottom: 0.5rem;
	}
	.fund-lines {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		margin: 0.75rem 0 1rem;
		padding-top: 0.75rem;
		border-top: 1px solid rgba(255, 255, 255, 0.12);
	}
	.fund-lines-unavailable {
		margin: 0.75rem 0 1rem;
		padding-top: 0.75rem;
		border-top: 1px solid rgba(255, 255, 255, 0.12);
		opacity: 0.7;
		font-size: 0.8rem;
	}
	.fund-line-header {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		margin-bottom: 0.25rem;
		font-variant-numeric: tabular-nums;
	}
	.fund-line-value {
		color: #9cf59c;
	}
	.fund-line input[type='range'] {
		width: 100%;
	}
	.budget-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}
	button {
		padding: 0.35rem 0.75rem;
		border-radius: 6px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		background: rgba(255, 255, 255, 0.08);
		color: inherit;
		cursor: pointer;
	}
	button.primary {
		background: rgba(80, 140, 255, 0.45);
		border-color: rgba(140, 180, 255, 0.6);
	}
</style>
