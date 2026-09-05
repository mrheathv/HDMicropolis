<script lang="ts">
	import { onMount } from 'svelte';
	import { micropolisReactive } from '$lib/MicropolisReactive.svelte';
	import { historyState } from '$lib/HistoryState.svelte';

	const open = $derived(historyState.open);

	// Series definitions/colors lifted from the classic history graph
	// (documentation/openlaszlo/classes/historyview.lzx).
	const SERIES = [
		{ type: 0, key: 'res', label: 'Residential', color: '#00ff00' },
		{ type: 1, key: 'com', label: 'Commercial', color: '#3860ff' },
		{ type: 2, key: 'ind', label: 'Industrial', color: '#ffff00' },
		{ type: 3, key: 'money', label: 'Money', color: '#008000' },
		{ type: 4, key: 'crime', label: 'Crime', color: '#ff0000' },
		{ type: 5, key: 'pollution', label: 'Pollution', color: '#a0d040' }
	] as const;

	type SeriesKey = (typeof SERIES)[number]['key'];

	const HISTORY_COUNT = 120;

	let visible = $state<Record<SeriesKey, boolean>>({
		res: true,
		com: true,
		ind: true,
		money: true,
		crime: true,
		pollution: true
	});
	let scale = $state<0 | 1>(0); // 0 = 10 years (short), 1 = 120 years (long)

	let canvasEl: HTMLCanvasElement | null = $state(null);

	function toggleSeries(key: SeriesKey) {
		visible = { ...visible, [key]: !visible[key] };
	}

	function readSeries(type: number): number[] {
		const m = micropolisReactive.attachedSimulator?.micropolis;
		if (!m) return new Array(HISTORY_COUNT).fill(0);
		// getHistory's C++ signature takes plain ints (historyType, historyScale),
		// not the wrapped embind enum objects -- HistoryType/HistoryScale's members
		// already line up numerically with SERIES' type indices and our 0/1 scale.
		const values: number[] = [];
		try {
			for (let i = 0; i < HISTORY_COUNT; i++) {
				values.push(m.getHistory(type, scale, i));
			}
		} catch {
			// Older engine build without the getHistory binding -- flat line rather than a crash.
			return new Array(HISTORY_COUNT).fill(0);
		}
		// Engine index 0 = most recent; reverse so the chart reads oldest (left) -> now (right).
		return values.reverse();
	}

	function seriesMax(values: number[]): number {
		let max = 0;
		for (const v of values) if (v > max) max = v;
		return Math.max(max, 1);
	}

	function draw() {
		if (!canvasEl) return;
		const ctx = canvasEl.getContext('2d');
		if (!ctx) return;
		const w = canvasEl.width;
		const h = canvasEl.height;

		ctx.clearRect(0, 0, w, h);
		ctx.fillStyle = '#ffffff';
		ctx.fillRect(0, 0, w, h);

		// Gridlines (quarters of the timeline).
		ctx.strokeStyle = '#a0a0a0';
		ctx.lineWidth = 1;
		for (let g = 0; g <= 4; g++) {
			const x = (g / 4) * w;
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, h);
			ctx.stroke();
		}

		const data = SERIES.map((s) => ({ ...s, values: readSeries(s.type) }));

		// Residential/Commercial/Industrial share one scale (their combined peak);
		// Money/Crime/Pollution are each scaled independently -- matches the classic graph.
		const rciMax = Math.max(
			seriesMax(data[0].values),
			seriesMax(data[1].values),
			seriesMax(data[2].values)
		);
		const maxByKey: Record<SeriesKey, number> = {
			res: rciMax,
			com: rciMax,
			ind: rciMax,
			money: seriesMax(data[3].values),
			crime: seriesMax(data[4].values),
			pollution: seriesMax(data[5].values)
		};

		for (const s of data) {
			if (!visible[s.key]) continue;
			const max = maxByKey[s.key];
			ctx.beginPath();
			ctx.strokeStyle = s.color;
			ctx.lineWidth = 2;
			s.values.forEach((v, i) => {
				const x = (i / (HISTORY_COUNT - 1)) * w;
				const y = h - (v / max) * (h - 6) - 3;
				if (i === 0) ctx.moveTo(x, y);
				else ctx.lineTo(x, y);
			});
			ctx.stroke();
		}

		ctx.strokeStyle = '#000000';
		ctx.lineWidth = 1;
		ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
	}

	$effect(() => {
		void open;
		void scale;
		void visible;
		void micropolisReactive.historyRevision;
		draw();
	});

	function close() {
		historyState.close();
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
	<div class="mp-backdrop history-backdrop" role="presentation" onclick={close}></div>
	<div class="mp-window history-modal" role="dialog" aria-labelledby="history-title" aria-modal="true">
		<header class="mp-window-header history-header">
			<h2 id="history-title">History Graphs</h2>
			<button type="button" class="mp-window-close" onclick={close} aria-label="Close">×</button>
		</header>

		<div class="mp-window-body history-body">
			<canvas bind:this={canvasEl} width="380" height="220" class="history-canvas mp-well"></canvas>

			<div class="history-side">
				<div class="history-legend">
					{#each SERIES as s (s.key)}
						<label class="history-item">
							<input
								type="checkbox"
								checked={visible[s.key]}
								onchange={() => toggleSeries(s.key)}
							/>
							<span class="history-swatch" style:background={s.color}></span>
							{s.label}
						</label>
					{/each}
				</div>

				<div class="history-scale">
					<label class="history-item">
						<input type="radio" name="history-scale" checked={scale === 0} onchange={() => (scale = 0)} />
						10 Years
					</label>
					<label class="history-item">
						<input type="radio" name="history-scale" checked={scale === 1} onchange={() => (scale = 1)} />
						120 Years
					</label>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.history-backdrop {
		z-index: 45;
	}

	.history-modal {
		position: fixed;
		z-index: 46;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: min(34rem, 94vw);
		font-size: 0.82rem;
	}

	.history-header {
		padding: 0.5rem 0.6rem;
	}

	.history-body {
		display: flex;
		gap: 0.85rem;
		padding: 0.85rem 1rem 1rem;
	}

	.history-canvas {
		flex: 0 0 auto;
		image-rendering: pixelated;
	}

	.history-side {
		flex: 1 1 auto;
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
		min-width: 8rem;
	}

	.history-legend,
	.history-scale {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.history-scale {
		padding-top: 0.75rem;
		border-top: 2px solid var(--mp-shadow);
		box-shadow: inset 0 1px 0 var(--mp-face-light);
	}

	.history-item {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		cursor: pointer;
		user-select: none;
	}

	.history-swatch {
		display: inline-block;
		width: 0.7rem;
		height: 0.7rem;
		border: 1px solid var(--mp-border);
	}
</style>
