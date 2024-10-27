<script lang="ts">
	import Header from '$lib/header/Header.svelte';
	import Footer from '$lib/Footer.svelte';
	import '../app.css';

	import { setContext } from 'svelte';

	import { bridgest, defaultDeviceName, deviceName } from '$lib/stores';
	import { terminal as bluetoothTerminal } from '$lib/terminal';
	import { isProd } from '$lib/env';

	setContext('bluetoothTerminal', bluetoothTerminal);

	let lightValue: number = 100;

	async function handleChangeBridgest({ currentTarget }: Event & { currentTarget: EventTarget & HTMLInputElement;}) {
		lightValue = Number(currentTarget.value);
		await bluetoothTerminal.send(`^${currentTarget.value}`);
	}

	let deviceNameLabel: string;

	deviceName.subscribe(value => {
		deviceNameLabel = value;
	});

	bridgest.subscribe(value => {
		lightValue = value;
	});
</script>

<Header bluetoothTerminal={bluetoothTerminal}/>

{#if deviceNameLabel === defaultDeviceName && isProd}
	<div class="disabled-notify">
		<span class="text-2xl text-slate-50">
			Нет подключеного устройства
		</span>
	</div>
{/if}

<main class:blur="{deviceNameLabel === defaultDeviceName && isProd}">
	<div class="bridgest">
		<label 
			for="volume" 
			class="text-2xl text-slate-50">
			Яркость 
			<span class="text-sm text-slate-50"> {lightValue} </span>
		</label>
		<input
			on:change={handleChangeBridgest}
			type="range" 
			id="volume" 
			name="volume"
			bind:value={lightValue}
			min="2" 
			max="255"
		>
	  </div>
	<slot/>
</main>

<Footer />

<style>
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100vw;
		margin: 0 auto;
		box-sizing: border-box;
		 /* 69 высота футера и 58 высота шапки + 3 пикселя на всякий случай */
		padding-bottom: 130px;
		padding-top: 0px;
    	height: inherit;
	}

	main.blur {
		opacity: 0.5;
		pointer-events: none;
	}
	
	.disabled-notify {
		position: absolute;
		padding: 50% 0;
		text-align: center;
		width: 100%;
	}

	.disabled-notify span {
		text-shadow: 2px 2px 10px #000000;
	}

	.bridgest {
		display: flex;
    	flex-direction: column;
		margin: 10px 0;
		zoom: 1.1;
	}
</style>
