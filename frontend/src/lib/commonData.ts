const modes = {
	Text: '$0',
	Eq: '$1',
};

const commands = {
	GetConfig: '&!',

	Bridgest: '^',
	GetButtonCounter: '?',
	ChangeMod: '$',

	AutoChangePatterns: '!',
	Amplitude: '@',
};

const routes = {
	mainPage: '/',
	text: 'text',
	equalizer: 'equalizer',
	terminal: 'terminal',
};

export { commands, modes, routes };
