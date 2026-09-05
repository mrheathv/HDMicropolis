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
	<div class="mp-backdrop budget-backdrop" role="presentation" onclick={dismiss}></div>
	<div class="mp-window budget-modal" role="dialog" aria-labelledby="budget-title" aria-modal="true">
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
			<button type="button" class="mp-button" onclick={dismiss}>Later</button>
			<button type="button" class="mp-button primary" onclick={accept}>Accept budget</button>
		</div>
	</div>
{/if}

<style>
	.budget-backdrop {
		z-index: 40;
	}
	.budget-modal {
		position: fixed;
		z-index: 41;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: min(22rem, 92vw);
		padding: 1rem 1.1rem;
		font-size: 0.85rem;
	}
	h2 {
		margin: 0 0 0.5rem;
		font-size: 1rem;
	}
	.budget-copy {
		margin: 0 0 0.75rem;
		color: var(--mp-muted-text);
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
		border-top: 2px solid var(--mp-shadow);
		box-shadow: inset 0 1px 0 var(--mp-face-light);
	}
	.fund-lines-unavailable {
		margin: 0.75rem 0 1rem;
		padding-top: 0.75rem;
		border-top: 2px solid var(--mp-shadow);
		box-shadow: inset 0 1px 0 var(--mp-face-light);
		color: var(--mp-muted-text);
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
		color: var(--mp-money);
	}
	.fund-line input[type='range'] {
		width: 100%;
		accent-color: var(--mp-accent);
	}
	.budget-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}
	.budget-actions button {
		padding: 0.35rem 0.75rem;
	}
	.primary {
		font-weight: 700;
	}
</style>
