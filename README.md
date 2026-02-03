# ClawGPT Mobile App

A ChatGPT-like mobile app for OpenClaw. Connect to your personal AI from anywhere.

## Features

- Clean, familiar ChatGPT-style interface
- Connect to your home OpenClaw gateway
- Works on mobile data (via relay)
- Dark mode
- Voice input
- Search across all chats

## Building

### Prerequisites

- Node.js 20+
- Android SDK (for local builds)
- Java 17+

### Local Development

```bash
npm install
npm run sync
npm run open:android  # Opens in Android Studio
```

### Building APKs

Debug build:
```bash
npm run build
```

Release build:
```bash
npm run build:release
```

APKs will be in `android/app/build/outputs/apk/`

### GitHub Actions

The repository includes a GitHub Actions workflow that automatically builds APKs on push. Download artifacts from the Actions tab.

## License

MIT
