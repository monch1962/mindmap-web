# Mind Map Web Application

A modern, feature-rich mind mapping application built with React, TypeScript, and React Flow. Create, edit, and export mind maps with full FreeMind compatibility.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

### Core Functionality
- ✨ **Interactive Mind Map Canvas** - Create and edit mind maps with an intuitive drag-and-drop interface
- 💾 **Auto-Save** - Automatic saving to localStorage every 30 seconds
- ↩️ **Undo/Redo** - Full history tracking with Ctrl+Z/Ctrl+Y
- 🔍 **Search** - Find nodes by text content with F3 navigation
- 📝 **Notes Panel** - Add detailed notes to any node
- 🎨 **Icons** - 60+ FreeMind-style icons
- ☁️ **Clouds** - Visual grouping for related nodes
- 🔗 **Cross-Links** - Connect any two nodes with advanced linking
- 📤 **Export** - Save as JSON, FreeMind (.mm), OPML, Markdown, D2, SVG, or PNG

### Import/Export Formats
- **JSON** - Native format with full feature support
- **FreeMind (.mm)** - Full compatibility with FreeMind mind maps
- **OPML** - Outline Processor Markup Language
- **Markdown** - Export as indented markdown lists
- **D2** - Declarative diagramming language
- **SVG** - Vector graphics export
- **PNG** - Raster image export

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173/`

For network access:
```bash
npx vite --host 0.0.0.0
```

### Build

```bash
npm run build
```

Creates a single-file bundle in `dist/index.html` - self-contained with all assets embedded.

### Testing

```bash
# Run tests once
npm run test:run

# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Keyboard Shortcuts

### Node Operations
| Shortcut | Action |
|----------|--------|
| `Tab` | Create child node |
| `Enter` | Create sibling node |
| `Delete` / `Backspace` | Delete selected node |
| `F2` | Edit node text |
| `Space` | Toggle collapse state |

### Navigation & View
| Shortcut | Action |
|----------|--------|
| `Ctrl +` / `Ctrl -` | Zoom in/out |
| `Ctrl 0` | Fit view to all nodes |
| `Ctrl + F` | Open search panel |
| `F3` | Next search result |
| `Shift + F3` | Previous search result |
| `Escape` | Close panels |

### Editing
| Shortcut | Action |
|----------|--------|
| `Ctrl + Z` | Undo |
| `Ctrl + Y` / `Ctrl + Shift + Z` | Redo |
| `Ctrl + N` | Toggle notes panel (when node selected) |
| `F3` | Toggle notes panel |

## Usage Guide

### Creating a Mind Map

1. **Start Fresh** - The app opens with a blank canvas. Click the root node to begin.
2. **Add Child Nodes** - Select a node and press `Tab` or click "+ New Root"
3. **Add Sibling Nodes** - Select a node and press `Enter`
4. **Edit Text** - Double-click any node or select it and press `F2`
5. **Delete Nodes** - Select a node and press `Delete` or `Backspace`

### Organizing with Clouds

1. Select the node you want to group under
2. Open the Metadata Panel (top-left)
3. Choose a cloud color and click "Apply Cloud"
4. The cloud will visually group the node and its children

### Adding Cross-Links

1. Click "Add Cross-Link" in the controls panel (top-right)
2. Click the source node (first node to link)
3. Click the target node (second node to link)
4. A dashed orange line will connect the nodes

### Searching Nodes

1. Press `Ctrl + F` to open the search panel
2. Type your search query
3. Use `F3` / `Shift + F3` or the arrow buttons to navigate results
4. Matching nodes are automatically highlighted

### Exporting Your Mind Map

1. Click the export buttons in the top-right panel
2. Choose your preferred format
3. The file will download automatically

**Note:** Use SVG/PNG for presentations, FreeMind (.mm) for compatibility with other mind map tools, or JSON to save your work with all features intact.

## Project Structure

```
src/
├── components/          # React components
│   ├── MindMapCanvas.tsx    # Main canvas component
│   ├── MindMapNode.tsx       # Custom node component
│   ├── MetadataPanel.tsx     # Metadata editing panel
│   ├── NotesPanel.tsx        # Notes editing modal
│   ├── SearchPanel.tsx       # Search functionality
│   ├── IconPicker.tsx        # Icon selection modal
│   ├── CloudBackground.tsx   # Visual cloud rendering
│   └── CrossLinkEdge.tsx     # Custom edge for cross-links
├── hooks/               # Custom React hooks
│   ├── useAutoSave.ts        # Auto-save to localStorage
│   └── useUndoRedo.ts        # Undo/redo history management
├── utils/               # Utility functions
│   ├── mindmapConverter.ts   # Tree ↔ Flow conversion
│   ├── formats/             # Import/export parsers
│   │   ├── jsonFormat.ts
│   │   ├── freemindFormat.ts
│   │   ├── opmlFormat.ts
│   │   ├── markdownFormat.ts
│   │   └── d2Format.ts
│   └── icons.ts             # Icon definitions
└── types.ts             # TypeScript type definitions
```

## Development

### Adding New Features

1. Create a feature branch from `main`
2. Implement your changes with TDD (tests first)
3. Run tests: `npm run test:run`
4. Build: `npm run build`
5. Commit and push your branch
6. Create a pull request

### Code Style

- TypeScript with strict mode enabled
- Functional components with hooks
- TDD workflow with Vitest
- Pre-commit hooks enforce test passing

### Testing

Tests are located alongside source files:
- `src/utils/mindmapConverter.test.ts` - Conversion logic tests
- `src/utils/formats/freemindFormat.test.ts` - FreeMind format tests

Run tests before committing:
```bash
npm run test:run
```

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Opera: Full support

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Ensure all tests pass
5. Submit a pull request

## Acknowledgments

Built with:
- [React](https://react.dev/) - UI framework
- [React Flow](https://reactflow.dev/) - Mind map visualization
- [Vite](https://vite.dev/) - Build tool
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vitest](https://vitest.dev/) - Testing framework

Inspired by [FreeMind](https://freemind.sourceforge.io/wiki/index.php/Main_Page) - the original mind mapping software.
