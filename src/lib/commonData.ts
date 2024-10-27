const modes = {
    Text: '$0',
    Eq: '$1',
}

const commands = {
    // full command
    GetConfig: '&!',

    //fist part command
    Bridgest: '^',
    GetButtonCounter: '?',
    ChangeMod: '$',

    //fist part command for Equlizer
    AutoChangePatterns: '!',
    Amplitude: '@',
}

const routes = {
    mainPage: '/',
    text: 'text',
    equalizer: 'equalizer',
    terminal: 'terminal',
}

export {
    commands,
    modes,
    routes
}