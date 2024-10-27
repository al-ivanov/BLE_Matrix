<script lang="ts">
	import type { BluetoothTerminal } from "$lib/BluetoothTerminal";
	import { commands, modes, routes } from "$lib/commonData";	
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import {
		deviceName,
		defaultDeviceName,
		bridgest,
		mode,
		amplitude,
		buttonCounter,
		autoChangePatterns,
	} from "$lib/stores";

	export let bluetoothTerminal: BluetoothTerminal;

	let deviceNameLabel: string;

	deviceName.subscribe(value => {
		deviceNameLabel = value;
	});

	function setDeviceName(name: string) {
		deviceName.update(() => name);
	}

	function setBridgest(value: number) {
		bridgest.update(() => value);
	}

	function setMode(value: number) {
		mode.update(() => value);
	}

	function setAmplitude(value: number) {
		amplitude.update(() => value);
	}

	function setButtonCounter(value: number) {
		buttonCounter.update(() => value);
	}

	function setAutoChangePatterns(value: boolean) {
		autoChangePatterns.update(() => value);
	}

	async function handleConnect() {
		await bluetoothTerminal.connect();

		setDeviceName(bluetoothTerminal.getDeviceName() ? bluetoothTerminal.getDeviceName() : defaultDeviceName);
		setTimeout(async () => {
			try {
			await bluetoothTerminal.send(commands.GetConfig);
			} catch (error) {
				console.error(error);
			}
		}, 1000);
	}

	function handleDisconnect() {
		bluetoothTerminal.disconnect();
		setDeviceName(defaultDeviceName);
	}

	bluetoothTerminal.receive = function(data: string) {
		if (data.match(/^\W=\d+;/)) {
			data.split(';').forEach((paramString) => {
				const [paramName, paramValue] = paramString.split('=');
				const fullCommand = paramName+paramValue;

				switch (paramName) {
					case commands.Bridgest:
						setBridgest(Number(paramValue));

						break;
					case commands.ChangeMod:
						setMode(Number(paramValue));

						console.log('$page.url.pathname !== `/${routes.terminal}`', $page.url.pathname !== `/${routes.terminal}`);
						if ($page.url.pathname !== `/${routes.terminal}`) {
							let newRoute = '/';

							if (fullCommand === modes.Text) {
								newRoute += routes.text;
							} else if (fullCommand === modes.Eq) {
								newRoute += routes.equalizer;
							}
							
							console.log('newRoute', newRoute);
							goto(newRoute);
						}

						break;
					case commands.Amplitude:
						setAmplitude(Number(paramValue));

						break;
					case commands.GetButtonCounter:
						setButtonCounter(Number(paramValue));

						break;

					case commands.AutoChangePatterns:
						setAutoChangePatterns(paramValue === '1');

						break;
					default:
						break;
				}
			});
		}
	};
</script>

<header>
	<div class="corner text-white">
		{!!deviceNameLabel ? deviceNameLabel : defaultDeviceName}
	</div>
	

	<div class="corner">
		<div class="buttons">

			<button 
				on:click={handleConnect} 
				type="button" 
				aria-label="Connect"
			>
				<i class="material-icons">bluetooth_connected</i>
			</button>

			<button 
				on:click={handleDisconnect} 
				type="button" 
				aria-label="Disconnect"
			>
				<i class="material-icons">bluetooth_disabled</i>
			</button>

		</div>
	</div>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
		padding: 5px;
	}

	.corner {
		width: 6em;
		height: 3em;
	}

	.buttons {
		display: flex;
		justify-content: space-around;
	}

	.material-icons {
		color: #817be6;
	}
</style>
