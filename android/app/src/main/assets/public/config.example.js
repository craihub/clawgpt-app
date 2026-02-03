// ClawGPT Configuration (Optional)
// Copy this file to config.js and fill in your values.
// config.js is gitignored - your token won't be committed.
//
// SECURITY: Only use on localhost. If exposed to network,
// anyone viewing source can see your token.

window.CLAWGPT_CONFIG = {
  // OpenClaw Gateway WebSocket URL
  gatewayUrl: 'ws://localhost:18789',
  
  // Your OpenClaw auth token (from gateway config)
  authToken: 'your-token-here',
  
  // Session key to use
  sessionKey: 'main',
  
  // Optional: default theme (true = dark, false = light)
  darkMode: true
};
