# ClawGPT Privacy Policy

**Last updated:** February 3, 2026

ClawGPT is an open-source chat client for OpenClaw. This privacy policy explains how the app handles your data.

## Summary

- Your chat messages are stored **locally on your device**
- When using Remote Access, messages are **end-to-end encrypted** - we cannot read them
- We do **not** collect analytics or track you
- We do **not** sell your data to anyone

## Data Collection

### What We Store Locally (On Your Device)

- **Chat history** - Your conversations are stored in your device's local storage (IndexedDB/localStorage)
- **Connection settings** - Gateway URL, authentication token, session preferences
- **Relay pairing info** - Room ID and encryption keys for Remote Access feature

This data never leaves your device except when you explicitly send messages or use Remote Access.

### What Passes Through Our Relay Server

When you use the **Remote Access** feature to connect your phone to your desktop:

- Messages are **end-to-end encrypted** using X25519 key exchange and XSalsa20-Poly1305 encryption
- The relay server (`clawgpt-relay.fly.dev`) only sees encrypted data - it cannot read your messages
- The relay server does not log message contents
- Connection metadata (room IDs, timestamps) may be temporarily stored for routing purposes
- Relay rooms are automatically deleted after 7 days of inactivity

### What We Do NOT Collect

- No analytics or usage tracking
- No device identifiers
- No location data
- No advertising IDs
- No personal information

## Camera Permission

The app requests camera permission **solely** for scanning QR codes to set up connections. We do not:
- Store photos or images
- Access your camera for any other purpose
- Send camera data to any server

## Third-Party Services

### OpenClaw Gateway

ClawGPT connects to an OpenClaw gateway (either self-hosted or provided by a third party). Your messages are sent to this gateway for AI processing. The gateway's privacy practices are determined by whoever operates it - typically yourself if self-hosted.

### AI Providers

The OpenClaw gateway may forward your messages to AI providers (such as Anthropic, OpenAI, or others) for generating responses. These providers have their own privacy policies. When self-hosting, you control which providers are used.

## Data Security

- All Remote Access connections use end-to-end encryption
- Encryption keys are generated fresh for each session (forward secrecy)
- Verification words are displayed to confirm secure connections
- Local data is stored using standard browser/WebView storage mechanisms

## Data Retention

- **Local data**: Stored until you delete it or clear app data
- **Relay server**: Connection data deleted after 7 days of inactivity; no message content is ever stored

## Your Rights

You can:
- **Export** your chat history from the app settings
- **Delete** your data by clearing the app's storage or uninstalling
- **Disconnect** from the relay at any time by closing the app

## Children's Privacy

ClawGPT is not directed at children under 13. We do not knowingly collect data from children.

## Changes to This Policy

We may update this policy occasionally. Changes will be reflected in the "Last updated" date above and in the app's repository.

## Open Source

ClawGPT is open source. You can review exactly what the app does:
- App repository: https://github.com/craihub/clawgpt-app
- Relay server: https://github.com/craihub/clawgpt-relay

## Contact

For privacy questions or concerns, please open an issue on GitHub:
https://github.com/craihub/clawgpt-app/issues

---

*This privacy policy applies to the ClawGPT mobile application.*
