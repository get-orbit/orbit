# ORBIT

**A new way to interact with the web.**

ORBIT is an experimental, context-aware interaction layer for Chrome. It brings relevant actions closer to the thing you're working with through a unified radial interface, keyboard activation, and (later) configurable gestures.

## Project status

Early development. The first prototype focuses on one vertical slice:

1. Select text on a webpage.
2. Open ORBIT with `Alt + Shift + O`.
3. Choose **Copy** from the radial interface.
4. ORBIT copies the selection and closes.

This is a prototype, not a feature-complete extension.

## Principles

- **Context before commands:** show actions relevant to the current target.
- **Simple by default:** keep the interface compact; make customization optional.
- **One interaction language:** keyboard, mouse, and future gestures use the same command system.
- **Local-first:** core interactions should work without an account or AI service.
- **User control:** actions are explicit, permissions are limited, and AI features (if added) are opt-in.

## Development

ORBIT uses Chrome Extensions Manifest V3 with plain JavaScript, HTML, and CSS.

### Load the extension

1. Clone or download this repository.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode**.
4. Select **Load unpacked** and choose the repository folder.

### Keyboard shortcut

The prototype requests `Alt + Shift + O`. Chrome lets you review or change extension shortcuts at `chrome://extensions/shortcuts`.

### Limitations

- ORBIT cannot run on some Chrome-internal pages or other restricted browser surfaces.
- The initial prototype recognizes selected text only.
- The first release is intended for local testing, not public distribution.

## Project structure

```text
manifest.json
src/
  background/
    service-worker.js
  content/
    content.js
  ui/
    radial.js
```

## Privacy

The prototype processes the current text selection locally. It does not send page content to a server or use an AI service.

## License

All rights reserved. No license has been granted for reuse or redistribution.
