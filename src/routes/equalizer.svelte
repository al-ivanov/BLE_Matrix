<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import type { BluetoothTerminal } from '$lib/BluetoothTerminal';

	import { modes } from '$lib/commonData';
	import {
		defaultDeviceName,
		deviceName,
		amplitude,
		buttonCounter,
		autoChangePatterns,
	} from '$lib/stores';

	import { getContext } from 'svelte';
	import Select from 'svelte-select';

	const bluetoothTerminal = getContext<BluetoothTerminal>('bluetoothTerminal');

	async function sendMode() {
		try {
			await bluetoothTerminal.send(modes.Eq);
		} catch (error) {
			console.error(error)
		}
	};

	deviceName.subscribe((value) => {
		if (value !== defaultDeviceName) {
			sendMode();
		}
	});

	let items = [
		{value: '0', label: 'Радужные Бары'},
		{value: '1', label: 'Только верха'},
		{value: '2', label: 'Синии Бары'},
		{value: '3', label: 'От центра'},
		{value: '4', label: 'Переливающиеся бары'},
		{value: '5', label: 'Гераклит'},
	];

	let value = items[0];

	let automode = false;
	let eqSensitive = 60;
	let noise = 200;

	async function handleSelect({ detail }) {
		await bluetoothTerminal.send(`?${detail.value}`);
	}

	async function handleChangeEqSensitive({ target }) {
		eqSensitive = Number(target.value);
		await bluetoothTerminal.send(`@${target.value}`);
	}

	async function handleChangeNoise({ target }) {
		noise = Number(target.value);
		await bluetoothTerminal.send(`*${target.value}`);
	}

	async function handleChangeAutoMode() {
		await bluetoothTerminal.send(`!${automode ? 1 : 0}`);
	}

	let amplitudeFactors = [
		{value: '1', label: 'x1'},
		{value: '2', label: 'x10'},
		{value: '3', label: 'x100'},
		{value: '4', label: 'x1000'},
	];

	let amplitudeFactor = amplitudeFactors[0];

	async function handleSelectAmplitudeFactor({ detail }) {
		await bluetoothTerminal.send(`aF${detail.value}`);
	}

	let samplesList = [
		{value: '1', label: '256'},
		{value: '2', label: '512'},
		{value: '3', label: '1024'},
	];

	let samples = samplesList[0];

	async function handleSelectSamples({ detail }) {
		await bluetoothTerminal.send(`sA${detail.value}`);
	}

	let barsCount = [
		{value: '1', label: '8-ми полосный'},
		{value: '2', label: '16-ти полосный '},
	];

	let currentBarsCount = barsCount[0];

	async function handleSelectBarsCount({ detail }) {
		await bluetoothTerminal.send(`bB${detail.value}`);
	}

	amplitude.subscribe((value) => {
		eqSensitive = value;
	});

	buttonCounter.subscribe((buttonCounterValue) => {
		const newValue = items.find((item) => item.value === buttonCounterValue.toString());
		
		if (!newValue) {
			return;
		}
		
		value = newValue;
	});

	autoChangePatterns.subscribe((value) => {
		automode = value;
	});
</script>

<svelte:head>
	<title>Эквалайзер</title>
</svelte:head>

<section>
	<div class="block">
		<caption class="w-full block text-cyan-50">Выбери тип эквалайзера</caption>
		<Select {items} {value} on:select={handleSelect}></Select>
	</div>

	<div class="block">
		<label 
			for="happy"
			class="text-2xl text-slate-50"
		>
			Автоматическое переключение
		</label>
		<input 
			type="checkbox" 
			id="happy" 
			name="happy"
			bind:checked={automode}
			on:change={handleChangeAutoMode}
		>
	</div>

	<div class="block">
		<caption class="w-full block text-cyan-50">Обработка семплов</caption>
		<Select items={samplesList} value={samples} on:select={handleSelectSamples}></Select>
	</div>

	<div class="block">
		<caption class="w-full block text-cyan-50">Количество столбцов</caption>
		<Select items={barsCount} value={currentBarsCount} on:select={handleSelectBarsCount}></Select>
	</div>
	
	<div class="block">
		<caption class="w-full block text-cyan-50">Множитель чувствительности</caption>
		<Select items={amplitudeFactors} value={amplitudeFactor} on:select={handleSelectAmplitudeFactor}></Select>
	</div>

	<div class="block">
		<label 
			for="EqSensitive"
			class="text-2xl text-slate-50"
		>
			Фильтр шумов
		</label>
		<input
			on:change={handleChangeNoise}
			type="range" 
			id="noise" 
			name="noise"
			bind:value={noise}
			min="1" 
			max="999"
		>
	</div>

	<div class="block">
		<label 
			for="EqSensitive"
			class="text-2xl text-slate-50"
		>
			Чувствительность эквалайзера
		</label>
		<input
			on:change={handleChangeEqSensitive}
			type="range" 
			id="EqSensitive" 
			name="EqSensitive"
			bind:value={eqSensitive}
			min="1" 
			max="99"
		>
	</div>
</section>

<style>
	section {
		overflow: auto;
		margin-bottom: 12px;
	}
	.block {
		display: flex;
    	flex-direction: column;
		margin: 10px 0;
	}
</style>
