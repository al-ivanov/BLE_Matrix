<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import type { BluetoothTerminal } from '$lib/BluetoothTerminal';
	import { getContext } from 'svelte';
	import Select from 'svelte-select';

	const bluetoothTerminal = getContext<BluetoothTerminal>('bluetoothTerminal');

	let modes = [
		{value: '2', label: 'Снег'},
		{value: '3', label: 'Мячик скачет из угла в угол'},
		{value: '4', label: '3 маленьких шарика скачут'},
		{value: '5', label: 'Радуга'},
		{value: '6', label: 'Радуга по диагонали'},
		{value: '7', label: 'Огонь'},
		{value: '8', label: 'Матрица'},
		{value: '9', label: 'Звездопад'},
		{value: '10', label: 'Огоньки'},
	];

	let mode = modes[0];

	async function handleSelectMode({ detail }) {
		await bluetoothTerminal.send(`$${detail.value}`);
	}

	let effects = [
		{value: '0', label: 'Без эффекта'},
		{value: '1', label: 'Дыхание (будет ярче или тусклее от времени)'},
		{value: '2', label: 'Цвестастый мод'},
		{value: '3', label: 'Радуга мод'},
	];

	let effect = effects[0];

	async function handleSelectEffect({ detail }) {
		await bluetoothTerminal.send("`"+detail.value);
	}
</script>

<svelte:head>
	<title>Главная</title>
</svelte:head>

<section>
	<div class="block">
		<caption class="w-full block text-cyan-50">Выбери тип режима (вне бегущего текста и эквалайзера)</caption>
		<Select items={modes} value={mode} on:select={handleSelectMode}></Select>
	</div>
	<div class="block">
		<caption class="w-full block text-cyan-50">Выбери тип эффекта (можно наложить на режим)</caption>
		<Select items={effects} value={effect} on:select={handleSelectEffect}></Select>
	</div>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 1;
	}

	.block {
		display: flex;
    	flex-direction: column;
		margin: 10px 0;
	}
</style>
