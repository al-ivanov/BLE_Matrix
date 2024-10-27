<script lang="ts">
	import { getContext } from 'svelte';
	import type { BluetoothTerminal } from './BluetoothTerminal';

	const bluetoothTerminal = getContext<BluetoothTerminal>('bluetoothTerminal');

	let logs: {type?: string, message: string}[] = [];

	function logToTerminal(message: string, type = ''){
		console.log('logs', logs);
		logs.push({type, message});
		logs = logs;
	};

	bluetoothTerminal.receive = function(data) {
		console.log('data', data);
		logToTerminal(data, 'in');
	};


	// Override default log method to output messages to the terminal and console.
	bluetoothTerminal._log = function(...messages) {
		// We can't use `super._log()` here.
		messages.forEach((message) => {
			logToTerminal(message);
			console.log(message); // eslint-disable-line no-console
		});
	};
	
	let inputValue = '';

	const send = (data) => {
		bluetoothTerminal.send(data)
			.then(() => logToTerminal(data, 'out'))
			.catch((error) => logToTerminal(error));
	};

	function handleSumbit(event) {
		event.preventDefault();

		send(inputValue);

		inputValue = '';
	}
</script>

<div class="terminal">
	{#each logs as log (log.message)}
	<!-- {#each logs as { type, message }, i} -->
		<li>
			<div class="{log.type}">
				{log.message}
			</div>
		</li>
	{/each}
</div>
<form id="send-form" class="send-form" on:submit={handleSumbit}>

	<input 
		id="input" 
		type="text" 
		aria-label="Input" 
		autocomplete="off" 
		placeholder="Type something to send..."
		bind:value={inputValue}
	>

	<button type="submit" aria-label="Send">
		<i class="material-icons">send</i>
	</button>
</form>

<style>
	.terminal {
		border: 1px solid rgba(0, 0, 0, 0.12);
		border-width: 1px 0;
		flex-grow: 1;
		overflow: auto;
		padding: 4px 0;
	}
</style>
