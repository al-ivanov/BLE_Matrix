// Command protocols for BLE device communication

export const modes = {
  Text: '$0',
  Eq: '$1',
};

export const commands = {
  // Full command requests
  GetConfig: '&!',
  
  // First part commands
  Bridgest: '^',
  GetButtonCounter: '?',
  ChangeMod: '$',
  
  // Equalizer first part commands
  AutoChangePatterns: '!',
  Amplitude: '@',
};

export const routes = {
  mainPage: '/',
  text: '/text',
  equalizer: '/equalizer',
  terminal: '/terminal',
};
