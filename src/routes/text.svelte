<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import type { BluetoothTerminal } from '$lib/BluetoothTerminal';
	import { modes } from '$lib/commonData';
	import { defaultDeviceName, deviceName } from '$lib/stores';
	import { getContext, onMount } from 'svelte';
	import Select from 'svelte-select';

	const bluetoothTerminal = getContext<BluetoothTerminal>('bluetoothTerminal');
	let ref: HTMLInputElement|null = null;

	onMount(async () => {
		if (ref) {
			ref.focus(); 
		}
	});

	async function sendMode() {
		try {
			await bluetoothTerminal.send(modes.Text);
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
		{value: '0', label: 'Радуга меняющаяся'},
		{value: '1', label: 'Радуга статичная'},
		{value: '2', label: 'Royal Blue'},
		{value: '3', label: 'Яркий розовый'},
		{value: '4', label: 'Лайм'},
		{value: '5', label: 'Красный'},
		{value: '6', label: 'Белый'},
	];

	let inputValue = '';

	const send = async (data: string) => {
		await bluetoothTerminal.send(data);
	};

	let value = items[0];

	async function handleSelect({ detail }: { detail: {value: string} }) {
		await bluetoothTerminal.send(`?${detail.value}`);
	}

	let textSpeed = 70;

	async function handleChangeTextSpeed({ target }) {
		textSpeed = Number(target.value);
		await bluetoothTerminal.send(`#${target.value}`);
	}

	function handleSumbit(event: SubmitEvent) {
		event.preventDefault();

		send(inputValue);

		inputValue = '';
	}
</script>

<svelte:head>
	<title>Бегущая строка</title>
</svelte:head>

<section>
	<form
		id="send-form"
		class="send-form"
		on:submit={handleSumbit}
	>
		<div class="block">
			<caption class="w-full block text-cyan-50">
				Цвет текста
			</caption>
			<Select
				{items}
				{value}
				on:select={handleSelect}
			/>
		</div>
		<div class="block">
			<label 
				for="textSpeed"
				class="text-2xl text-slate-50"
			>
				Скорость текста
			</label>
			<input
				on:change={handleChangeTextSpeed}
				type="range"
				id="textSpeed"
				name="textSpeed"
				bind:value={textSpeed}
				min="35"
				max="255"
			>
		</div>
		<div class="block">
			<input
				id="input"
				type="text"
				aria-label="Input" 
				autocomplete="off" 
				placeholder="Текст"
				bind:this={ref}
				bind:value={inputValue}
				maxlength="40"
			>
			<button type="submit" aria-label="Send">
				<i class="material-icons">send</i>
				<span class="text-md font-bold text-white">
					отправить
				</span>
			</button>
		</div>
	</form>
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

	.material-icons {
		color: #817be6;
	}

	.send-form {
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	.send-form .block{
		display: flex;
		flex-direction: column;
		width: 100%;
		margin: 10px 0;
	}
	
	#input {
		flex: 1;
    	padding: 20px;
	}

	.send-form button {
		padding: 20px 20%;
		display: flex;
		align-items: center;
		justify-content: space-evenly;
		background: rgb(0 0 0 / 25%);
    	margin: 15px 0;
	}
</style>
