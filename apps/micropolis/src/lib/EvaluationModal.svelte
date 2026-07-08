<script lang="ts">
	import { onMount } from 'svelte';
	import { micropolisReactive } from '$lib/MicropolisReactive.svelte';
	import { evaluationState } from '$lib/EvaluationState.svelte';

	const open = $derived(evaluationState.open);

	// Labels/order lifted from the classic evaluation view
	// (documentation/openlaszlo/classes/evaluationview.lzx).
	const CATEGORY_LABELS = ['Village', 'Town', 'City', 'Capital', 'Metropolis', 'Megalopolis'];
	const LEVEL_LABELS = ['Easy', 'Medium', 'Hard'];
	const PROBLEM_LABELS = ['Crime', 'Pollution', 'Housing', 'Taxes', 'Traffic', 'Unemployment', 'Fire'];

	interface ProblemEntry {
		label: string;
		percent: number;
	}

	interface Snapshot {
		population: number;
		migration: number;
		assessedValue: number;
		category: string;
		gameLevel: string;
		currentScore: number;
		annualChange: number;
		approve: number;
		problems: ProblemEntry[];
	}

	const snapshot = $derived.by((): Snapshot | null => {
		if (!open) return null;
		void micropolisReactive.evaluationRevision;
		const m = micropolisReactive.attachedSimulator?.micropolis;
		const scalars = micropolisReactive.peek.scalars();
		if (!m || !scalars) return null;

		// countProblems/getProblemNumber/getProblemVotes are a newer binding than
		// the rest of this snapshot's fields -- degrade to an empty list rather
		// than breaking the whole report if an older engine build is loaded.
		const problems: ProblemEntry[] = [];
		try {
			const count = m.countProblems();
			for (let i = 0; i < count; i++) {
				const num = m.getProblemNumber(i);
				if (num < 0 || num >= PROBLEM_LABELS.length) continue;
				problems.push({ label: PROBLEM_LABELS[num], percent: m.getProblemVotes(i) });
			}
		} catch {
			/* older engine build without the problem-list bindings */
		}

		return {
			population: scalars.cityPop,
			migration: m.cityPopDelta,
			assessedValue: m.cityAssessedValue,
			category: CATEGORY_LABELS[scalars.cityClass] ?? 'Village',
			gameLevel: LEVEL_LABELS[scalars.gameLevel] ?? 'Easy',
			currentScore: scalars.cityScore,
			annualChange: m.cityScoreDelta,
			approve: scalars.cityYes,
			problems
		};
	});

	function close() {
		evaluationState.close();
	}

	function formatSigned(value: number): string {
		return value > 0 ? `+${value}` : `${value}`;
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

{#if open && snapshot}
	<div class="eval-backdrop" role="presentation" onclick={close}></div>
	<div class="eval-modal" role="dialog" aria-labelledby="eval-title" aria-modal="true">
		<header class="eval-header">
			<h2 id="eval-title">City Evaluation</h2>
			<button type="button" class="eval-close" onclick={close} aria-label="Close">×</button>
		</header>

		<div class="eval-body">
			<div class="eval-grid">
				<div class="eval-stat">
					<span class="eval-label">Population</span>
					<span class="eval-value">{snapshot.population.toLocaleString()}</span>
				</div>
				<div class="eval-stat">
					<span class="eval-label">Migration</span>
					<span class="eval-value">{formatSigned(snapshot.migration)}</span>
				</div>
				<div class="eval-stat">
					<span class="eval-label">City Value</span>
					<span class="eval-value">${snapshot.assessedValue.toLocaleString()}</span>
				</div>
				<div class="eval-stat">
					<span class="eval-label">Category</span>
					<span class="eval-value">{snapshot.category}</span>
				</div>
				<div class="eval-stat">
					<span class="eval-label">Game Level</span>
					<span class="eval-value">{snapshot.gameLevel}</span>
				</div>
				<div class="eval-stat">
					<span class="eval-label">Current Score</span>
					<span class="eval-value">{snapshot.currentScore}</span>
				</div>
				<div class="eval-stat">
					<span class="eval-label">Annual Change</span>
					<span class="eval-value">{formatSigned(snapshot.annualChange)}</span>
				</div>
			</div>

			<div class="eval-section">
				<span class="eval-label">Popularity</span>
				<div class="eval-popularity">
					<span class="approve">Approve: {snapshot.approve}%</span>
					<span class="disapprove">Disapprove: {100 - snapshot.approve}%</span>
				</div>
			</div>

			<div class="eval-section">
				<span class="eval-label">Top Problems</span>
				{#if snapshot.problems.length === 0}
					<p class="eval-noproblems">None reported.</p>
				{:else}
					<ul class="eval-problems">
						{#each snapshot.problems as problem (problem.label)}
							<li><span>{problem.label}</span><span>{problem.percent}%</span></li>
						{/each}
					</ul>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.eval-backdrop {
		position: fixed;
		inset: 0;
		z-index: 45;
		background: rgba(0, 0, 0, 0.5);
	}

	.eval-modal {
		position: fixed;
		z-index: 46;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: min(24rem, 92vw);
		max-height: min(85vh, 36rem);
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

	.eval-header {
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

	.eval-close {
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

	.eval-body {
		overflow: auto;
		padding: 0.85rem 1rem 1rem;
	}

	.eval-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.6rem 0.9rem;
		margin-bottom: 0.9rem;
	}

	.eval-stat {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.eval-label {
		font-size: 0.68rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: #9aa4c8;
	}

	.eval-value {
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		color: #eef2ff;
	}

	.eval-section {
		margin-top: 0.9rem;
		padding-top: 0.7rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}

	.eval-popularity {
		display: flex;
		justify-content: space-between;
		margin-top: 0.3rem;
		font-weight: 600;
	}

	.approve {
		color: #9cf59c;
	}

	.disapprove {
		color: #ff8080;
	}

	.eval-noproblems {
		margin: 0.3rem 0 0;
		opacity: 0.7;
	}

	.eval-problems {
		list-style: none;
		margin: 0.3rem 0 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.eval-problems li {
		display: flex;
		justify-content: space-between;
		padding: 0.3rem 0.5rem;
		border-radius: 5px;
		background: rgba(255, 255, 255, 0.05);
		font-weight: 600;
	}

	.eval-problems li span:last-child {
		color: #ffc840;
	}
</style>
