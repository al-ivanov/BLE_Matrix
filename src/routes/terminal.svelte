<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">	
	import Terminal from '$lib/Terminal.svelte';

</script>

<svelte:head>
	<title>Терминал</title>

</svelte:head>

<section>
	<Terminal/>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 1;
		height: calc(100vh - 100px);
	}
</style>
