# ORBIT

**A new way to interact with the web.**

ORBIT is an experimental, context-aware interaction layer for Chrome. It brings relevant actions closer to the thing you're working with through a unified radial interface, keyboard activation, and (later) configurable gestures.

## Project status

Early development. Version 0.3.0 adds a local Saved Passages Quick Panel to the selected-text radial interface.

1. Select text on a webpage.
2. Open ORBIT with `Alt + Shift + O`.
3. Choose **Copy**, **Search**, or **Save** from the radial interface.
4. Choose **More** to open the Saved Passages Quick Panel.
5. In the panel, search saved passages, copy them, open their source pages, or delete them.

Translate, Explain, and Define are visible previews and are not functional yet. The extension is an experimental prototype, not a feature-complete release.

## Principles

- **Context before commands:** show actions relevant to the current target.
- **Simple by default:** keep the interface compact; make customization optional.
- **One interaction language:** keyboard, mouse, and future gestures use the same command system.
- **Local-first:** core interactions should work without an account or AI service.
- **User control:** actions are explicit, permissions are limited, and AI features (if added) are opt-in.

## Development

ORBIT uses Chrome Extensions Manifest V3 with plain JavaScript, HTML, and CSS.

### Load the extension

1. Download or clone this repository.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode**.
4. Select **Load unpacked** and choose the repository folder containing `manifest.json`.

### Keyboard shortcut

The prototype requests `Alt + Shift + O`. Chrome lets you review or change extension shortcuts at `chrome://extensions/shortcuts`.

### Keyboard navigation

- Arrow keys move focus between available actions.
- Enter activates the focused action.
- Escape closes the radial menu.

### Limitations

- ORBIT cannot run on some Chrome-internal pages or other restricted browser surfaces.
- The initial prototype recognizes selected text only.
- The Quick Panel currently manages saved passages only; broader command search and customization are planned.
- Translate, Explain, and Define are placeholders.
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
    quick-panel.js
```

## Privacy

The prototype processes the current text selection locally. Saved passages are stored in Chrome local storage. Search opens a Google results page using the selected text. ORBIT does not send page content to its own server or use an AI service.

## License

All rights reserved. No license has been granted for reuse or redistribution.
