<script lang="ts">
	import MicropolisView from '$lib/MicropolisView.svelte';
</script>

<svelte:head>
	<title>Micropolis</title>
	<meta name="description" content="Open source city simulation, based on the original SimCity Classic by Will Wright." />
</svelte:head>

<div class="micropolis-container">
	<MicropolisView />
</div>

<style>
	.micropolis-container {
		position: relative;
		width: 100%;
		height: 100%;
		flex: 1;
		min-height: 0;
		margin: 0;
		padding: 0;
		overflow: hidden;
	}
</style>
