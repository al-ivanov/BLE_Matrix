import { writable } from 'svelte/store';

const defaultDeviceName = 'kepi';

const deviceName = writable(defaultDeviceName);

const bridgest = writable(100);

const mode = writable(0);

const amplitude = writable(60);

const buttonCounter = writable(0);

const autoChangePatterns = writable(false);

export {
    defaultDeviceName,
    deviceName,
    bridgest,
    mode,
    amplitude,
    buttonCounter,
    autoChangePatterns,
}