<script lang="ts">
	let { children } = $props();

	// TODO(virtual-cursor): PointerGrabToggle + pointer store → CursorLayer on map routes.
	//   DESIGN: virtual-cursor-layer.md §7; map-compositing-and-measurement.md §3.2
	//   CursorLayer coordinates WebGPU plugins + conditional DOM (not cursor pixels in DOM).
</script>

<svelte:head>
	<link rel="icon" href="/favicon.png" />
</svelte:head>

<div class="app-container">
	<main class="content-area">
		{@render children()}
	</main>
</div>

<style>
	.app-container {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		min-height: 100dvh;
		overflow: hidden;
	}

	.content-area {
		flex-grow: 1;
		overflow: hidden;
		padding: 0;
		margin: 0;
		min-height: 0;
		height: 100vh;
		height: 100dvh;
		background-color: #1a2030;
		display: flex;
		flex-direction: column;
	}

	:global(body) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
		overflow: hidden;
	}
	:global(*, *::before, *::after) {
		box-sizing: inherit;
	}
</style>
