# flytothatfile

🚀 **flytothatfile** is a VS Code extension that lets you quickly navigate between files by clicking special comments in your code.

## Features

✨ Click on `// flyto C:\path\file.js:30` comments to instantly open the specified file at the given line number.
✨ Supports JavaScript and TypeScript files.
✨ Adds text decorations (highlights) to `flyto` comments for better visibility.
✨ CodeLens support to display clickable ✈️ icons.

## Installation

1. Install **flytothatfile** from the VS Code Marketplace.
2. Restart VS Code if needed.
3. Start using `// flyto C:\your\file.js:lineNumber` comments to navigate easily!

## Usage

1. Add a comment in your JavaScript or TypeScript file like this:
   ```js
   // flyto C:\Users\example\project\file.js:25
   ```
2. Click on the highlighted comment or ✈️ icon.
3. The file will open at the specified line number.

## Requirements

- Visual Studio Code v1.97.0 or later.
- Works on Windows (support for other OSes planned in future updates).

## Extension Settings

This extension currently has no configurable settings, but future versions may include customization options.

## Known Issues

- If a file is already open, clicking a `flyto` comment resets the cursor to the specified line instead of keeping it at the current position. (Planned fix in future update.)

## Release Notes

### v0.0.1
- Initial release with basic functionality.
- Supports JavaScript and TypeScript.
- Clickable `flyto` comments and CodeLens icons.
- Opens files at the specified line number.

## Contributing

Want to improve **flytothatfile**? Feel free to contribute!

1. Fork the [GitHub repository](https://github.com/negativeInteger/flytothatfile).
2. Create a feature branch.
3. Submit a pull request.

## License

MIT License - Free to use and modify.

**Enjoy coding with flytothatfile! ✈️**

