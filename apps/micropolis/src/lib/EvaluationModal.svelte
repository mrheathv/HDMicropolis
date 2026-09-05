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
	<div class="mp-backdrop eval-backdrop" role="presentation" onclick={close}></div>
	<div class="mp-window eval-modal" role="dialog" aria-labelledby="eval-title" aria-modal="true">
		<header class="mp-window-header eval-header">
			<h2 id="eval-title">City Evaluation</h2>
			<button type="button" class="mp-window-close" onclick={close} aria-label="Close">×</button>
		</header>

		<div class="mp-window-body eval-body">
			<div class="eval-grid">
				<div class="eval-stat">
					<span class="mp-label">Population</span>
					<span class="eval-value">{snapshot.population.toLocaleString()}</span>
				</div>
				<div class="eval-stat">
					<span class="mp-label">Migration</span>
					<span class="eval-value">{formatSigned(snapshot.migration)}</span>
				</div>
				<div class="eval-stat">
					<span class="mp-label">City Value</span>
					<span class="eval-value">${snapshot.assessedValue.toLocaleString()}</span>
				</div>
				<div class="eval-stat">
					<span class="mp-label">Category</span>
					<span class="eval-value">{snapshot.category}</span>
				</div>
				<div class="eval-stat">
					<span class="mp-label">Game Level</span>
					<span class="eval-value">{snapshot.gameLevel}</span>
				</div>
				<div class="eval-stat">
					<span class="mp-label">Current Score</span>
					<span class="eval-value">{snapshot.currentScore}</span>
				</div>
				<div class="eval-stat">
					<span class="mp-label">Annual Change</span>
					<span class="eval-value">{formatSigned(snapshot.annualChange)}</span>
				</div>
			</div>

			<div class="eval-section">
				<span class="mp-label">Popularity</span>
				<div class="eval-popularity">
					<span class="approve">Approve: {snapshot.approve}%</span>
					<span class="disapprove">Disapprove: {100 - snapshot.approve}%</span>
				</div>
			</div>

			<div class="eval-section">
				<span class="mp-label">Top Problems</span>
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
		z-index: 45;
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
		font-size: 0.82rem;
	}

	.eval-header {
		padding: 0.5rem 0.6rem;
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

	.eval-value {
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		color: var(--mp-text);
	}

	.eval-section {
		margin-top: 0.9rem;
		padding-top: 0.7rem;
		border-top: 2px solid var(--mp-shadow);
		box-shadow: inset 0 1px 0 var(--mp-face-light);
	}

	.eval-popularity {
		display: flex;
		justify-content: space-between;
		margin-top: 0.3rem;
		font-weight: 700;
	}

	.approve {
		color: var(--mp-money);
	}

	.disapprove {
		color: var(--mp-danger);
	}

	.eval-noproblems {
		margin: 0.3rem 0 0;
		color: var(--mp-muted-text);
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
		font-weight: 700;
		background: var(--mp-face-light);
		border: 1px solid var(--mp-shadow);
	}

	.eval-problems li span:last-child {
		color: var(--mp-warn-text);
	}
</style>
