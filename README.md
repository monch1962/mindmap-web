# Mind Map Web Application

A modern, feature-rich mind mapping application built with React, TypeScript, and React Flow. Create, edit, and export mind maps with full FreeMind compatibility, AI-powered features, and real-time collaboration.

![Version](https://img.shields.io/badge/version-1.0.1-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Tests](https://img.shields.io/badge/tests-1555%20passing-success)
![Coverage](https://img.shields.io/badge/coverage-73.9%25-yellow)
![Build Status](https://img.shields.io/badge/build-passing-success)

## Features

### Core Functionality

- ✨ **Interactive Mind Map Canvas** - Create and edit mind maps with an intuitive drag-and-drop interface
- 💾 **Auto-Save** - Automatic saving to localStorage every 30 seconds
- ↩️ **Undo/Redo** - Full history tracking with visual history panel (50 states)
- 🔍 **Advanced Search** - Find nodes with filters (regex, case-sensitive, date ranges, tags, icons)
- 📝 **Rich Text Notes** - Add detailed formatted notes to any node with a full rich text editor
- 🎨 **Icons** - 60+ FreeMind-style icons with visual picker
- ☁️ **Clouds** - Visual grouping for related nodes with custom colors
- 🔗 **Cross-Links** - Connect any two nodes with advanced linking
- 📊 **Statistics** - Real-time statistics panel showing node counts, depth, and metrics

### AI-Powered Features

- 🤖 **AI Assistant** - Generate mind maps from text prompts using OpenAI (GPT-4) or Anthropic (Claude)
- 💡 **Idea Generation** - Get creative suggestions for selected nodes
- 📝 **Branch Summarization** - AI-powered summaries of mind map branches
- 🔒 **Privacy-First** - API keys stored locally, never sent to our servers

### Presentation & Visualization

- 🎯 **Presentation Mode** - Fullscreen slide-based presentations with speaker notes
- 🎨 **3D View** - Interactive 3D visualization with rotation and auto-rotate
- 📑 **Templates** - Pre-built mind map templates (project planning, SWOT analysis, brainstorming, etc.)
- 🌓 **Theme System** - Multiple built-in themes (light, dark, nature, ocean, sunset) with custom theme support

### Collaboration & Integration

- 👥 **Real-time Collaboration** - Multi-user editing with WebSocket support
- 💬 **Comments** - Collaborative commenting system for nodes
- 🔗 **Webhook Integration** - Trigger webhooks on node changes
- 📅 **Calendar Export** - Export mind maps to calendar formats (iCal)
- 📧 **Email Integration** - Send mind maps via email directly from the app

### Mobile & PWA

- 📱 **Mobile-Optimized** - Touch gestures (pinch-to-zoom, drag, pan)
- 📲 **PWA Support** - Install as desktop/mobile app with offline mode
- 🔄 **Offline Sync** - IndexedDB-based storage with background sync
- 📶 **Online/Offline Indicator** - Visual sync status indicator

### Import/Export Formats

- **JSON** - Native format with full feature support
- **FreeMind (.mm)** - Full compatibility with FreeMind mind maps
- **OPML** - Outline Processor Markup Language
- **Markdown** - Export as indented markdown lists
- **YAML** - Structured data format for developers
- **D2** - Declarative diagramming language
- **SVG** - Vector graphics export
- **PNG** - Raster image export
- **PDF** - PDF export for sharing and printing

## Documentation

📚 **Comprehensive Documentation Available**:

- **[API Documentation](docs/api.md)** - Complete API reference for all components, hooks, and utilities
- **[Architecture Overview](docs/architecture.md)** - System design, component hierarchy, and data flow
- **[Performance Guide](docs/performance.md)** - Optimization tips and best practices
- **[Mobile Testing Guide](docs/mobile-testing.md)** - Mobile device testing strategies
- **[Developer Onboarding](docs/onboarding.md)** - Get started contributing to the project
- **[Deployment Guide](DEPLOYMENT.md)** - Deployment options and configuration

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

### Deployment

```bash
npm run deploy
```

Deploys to GitHub Pages automatically. See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment options.

### Automated Builds & Artifacts

This project uses GitHub Actions to automatically build deployable artifacts on every push to the main branch.

#### 📦 Download Latest Build

1. **Go to GitHub Actions**: Navigate to the "Actions" tab in your repository
2. **Select latest workflow**: Click on the most recent "Build Artifacts" workflow run
3. **Download artifacts**: Scroll to the "Artifacts" section and download `mindmap-web-artifacts`
4. **Extract and use**: The archive contains production-ready builds in multiple formats

#### 🚀 Available Artifacts

Each build includes:

- **Versioned builds**: `mindmap-web-v{version}.zip` and `.tar.gz`
- **Latest build**: `mindmap-web-latest-{commit}.zip` and `.tar.gz`
- **Quick test page**: `quick-test.html` with download links

#### 🏷️ Create Versioned Release

To create a proper GitHub Release with versioned artifacts:

```bash
# Update version in package.json if needed
# Create and push a tag
git tag v1.0.2
git push origin v1.0.2
```

This will trigger the release workflow and create a GitHub Release with:

- Production build archives
- Source code archives
- Release notes
- All artifacts downloadable from the "Releases" page

#### ⚙️ Using the Build Artifacts

```bash
# Extract the archive
unzip mindmap-web-v1.0.1.zip

# Serve with Python (simplest)
cd mindmap-web-v1.0.1
python3 -m http.server 8000

# Or with Node.js
npx serve@latest -s . -p 8000

# Open in browser
open http://localhost:8000
```

The build is self-contained with all dependencies bundled, ready to deploy as a static website.

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

| Shortcut               | Action                |
| ---------------------- | --------------------- |
| `Tab`                  | Create child node     |
| `Enter`                | Create sibling node   |
| `Delete` / `Backspace` | Delete selected node  |
| `E`                    | Edit node text        |
| `Space`                | Toggle collapse state |
| `Shift + Click`        | Multi-select nodes    |
| `Ctrl + A`             | Select all nodes      |

### Navigation & View

| Shortcut | Action                |
| -------- | --------------------- |
| `Ctrl +` | Zoom in               |
| `Ctrl -` | Zoom out              |
| `Ctrl 0` | Fit view to all nodes |

### Search

| Shortcut           | Action                 |
| ------------------ | ---------------------- |
| `Ctrl + F`         | Open search panel      |
| `Ctrl + G`         | Next search result     |
| `Ctrl + Shift + G` | Previous search result |

### Editing

| Shortcut           | Action             |
| ------------------ | ------------------ |
| `Ctrl + Z`         | Undo               |
| `Ctrl + Y`         | Redo               |
| `Ctrl + Shift + Z` | Redo (alternative) |
| `Ctrl + S`         | Manual save        |

### Panels

| Shortcut           | Action                   |
| ------------------ | ------------------------ |
| `Ctrl + N`         | Toggle notes panel       |
| `Ctrl + H`         | Toggle save history      |
| `Ctrl + Shift + H` | Toggle undo/redo history |
| `Ctrl + I`         | Toggle statistics        |
| `Ctrl + Shift + A` | Toggle AI Assistant      |
| `Ctrl + Shift + C` | Toggle comments          |
| `Ctrl + Shift + W` | Toggle webhooks          |
| `Ctrl + Shift + D` | Toggle calendar          |
| `Ctrl + Shift + E` | Toggle email             |
| `Ctrl + Shift + P` | Toggle presentation mode |
| `Ctrl + Shift + 3` | Toggle 3D view           |
| `Ctrl + Shift + T` | Toggle templates         |
| `Ctrl + Shift + ;` | Toggle theme settings    |
| `Ctrl + Shift + L` | Toggle dark mode         |
| `?`                | Show keyboard shortcuts  |
| `Escape`           | Close panels             |

_For the complete keyboard shortcuts reference, see the [API Documentation](docs/api.md#keyboard-shortcuts-reference)._

## Usage Guide

### Creating a Mind Map

1. **Start Fresh** - The app opens with a blank canvas. Click the root node to begin.
2. **Add Child Nodes** - Select a node and press `Tab` or click "Add Root"
3. **Add Sibling Nodes** - Select a node and press `Enter`
4. **Edit Text** - Double-click any node or select it and press `E`
5. **Delete Nodes** - Select a node and press `Delete` or `Backspace`
6. **Use Templates** - Press `Ctrl + Shift + T` to use pre-built templates

### Organizing Your Mind Map

1. **Drag & Drop** - Drag nodes to reorganize the hierarchy
2. **Clouds** - Select a node, open Metadata Panel (`Ctrl + M`), choose a cloud color
3. **Icons** - Add visual icons from the Metadata Panel
4. **Rich Text Notes** - Press `Ctrl + N` to add detailed formatted notes
5. **Tags** - Add tags to nodes for filtering and organization

### AI-Powered Features

1. **Generate Mind Maps** - Press `Ctrl + Shift + A` to open AI Assistant
2. **Enter Your Topic** - Type a description or paste text
3. **Generate** - Click "Generate Mind Map" to create structure
4. **Get Ideas** - Select a node and click "Generate Ideas" for suggestions
5. **Summarize** - Click "Summarize Branch" to condense complex branches

### Presentation Mode

1. **Open Presentation** - Press `Ctrl + Shift + P`
2. **Navigate** - Use arrow keys, Space, or Enter to advance slides
3. **Speaker Notes** - Toggle notes display for reference
4. **Overview** - See all slides at a glance

### Advanced Search

1. **Open Search** - Press `Ctrl + F`
2. **Use Filters** - Enable regex, case-sensitive, or whole word matching
3. **Filter by Metadata** - Search by tags, icons, cloud colors, or creation date
4. **Navigate Results** - Use `Ctrl + G` / `Ctrl + Shift + G` to jump between results

### Collaboration

1. **Real-time Sync** - Changes sync automatically across devices (requires backend)
2. **Comments** - Press `Ctrl + Shift + C` to add comments to nodes
3. **Webhooks** - Press `Ctrl + Shift + W` to configure webhooks for automation
4. **Calendar Export** - Press `Ctrl + Shift + D` to export to calendar

### Exporting Your Mind Map

1. Click the export button in the top-right panel
2. Choose your preferred format:
   - **SVG/PNG** - For presentations and documents
   - **FreeMind (.mm)** - For compatibility with other tools
   - **JSON** - To save your work with all features intact
   - **Markdown/OPML/YAML/D2** - For developers and text-based workflows
3. The file will download automatically

## Project Structure

```
src/
├── components/               # React components
│   ├── MindMapCanvas.tsx          # Main canvas (1800+ lines)
│   ├── MindMapNode.tsx            # Custom node component
│   ├── MetadataPanel.tsx          # Node metadata editing
│   ├── NotesPanel.tsx             # Rich text notes
│   ├── SearchPanel.tsx            # Advanced search & filters
│   ├── IconPicker.tsx             # Icon selection modal
│   ├── AIAssistantPanel.tsx       # AI-powered features
│   ├── PresentationMode.tsx       # Presentation mode
│   ├── ThreeDView.tsx             # 3D visualization
│   ├── RichTextEditor.tsx         # Rich text editor
│   ├── CommentsPanel.tsx          # Collaborative comments
│   ├── WebhookIntegrationPanel.tsx # Webhook configuration
│   ├── CalendarExportPanel.tsx    # Calendar export
│   ├── EmailIntegrationPanel.tsx  # Email integration
│   ├── TemplatesPanel.tsx         # Template system
│   ├── ThemeSettingsPanel.tsx     # Theme customization
│   └── ...                        # Other components
├── hooks/                    # Custom React hooks
│   ├── useAutoSave.ts             # Auto-save to localStorage
│   ├── useUndoRedo.ts             # Undo/redo history (50 states)
│   ├── useKeyboardShortcuts.ts    # Global keyboard shortcuts
│   ├── useKeyboardNavigation.ts   # Focus trap for modals
│   ├── useFileOperations.ts       # Import/export handling
│   ├── useGestureNavigation.ts    # Touch gestures for mobile
│   ├── useOfflineSync.ts          # IndexedDB & service workers
│   └── ...                        # Other hooks
├── utils/                    # Utility functions
│   ├── mindmapConverter.ts        # Tree ↔ Flow conversion
│   ├── formats/                  # Import/export parsers
│   │   ├── jsonFormat.ts
│   │   ├── freemindFormat.ts
│   │   ├── opmlFormat.ts
│   │   ├── markdownFormat.ts
│   │   ├── yamlFormat.ts
│   │   └── d2Format.ts
│   ├── errorTracking.ts           # Error logging
│   ├── accessibility.ts           # ARIA utilities
│   ├── aiParser.ts                # AI response parsing
│   └── ...                        # Other utilities
├── types.ts                  # TypeScript type definitions
├── App.tsx                   # Root component
├── main.tsx                  # Application entry point
└── index.css                 # Global styles
```

**For detailed architecture information, see the [Architecture Overview](docs/architecture.md).**

## Development

### Quick Start for Developers

1. **Fork and clone** the repository
2. **Install dependencies**: `npm install`
3. **Start dev server**: `npm run dev`
4. **Run tests**: `npm run test`
5. **Make changes** following TDD principles
6. **Submit pull request** with tests

See the [Developer Onboarding Guide](docs/onboarding.md) for detailed setup instructions.

### Adding New Features

1. **Read the documentation** - Check [API docs](docs/api.md) and [Architecture overview](docs/architecture.md)
2. **Create a feature branch** - `git checkout -b feature/your-feature-name`
3. **Write tests first** - Follow TDD workflow (see Testing section below)
4. **Implement your changes** - With tests passing
5. **Run linting** - `npm run lint`
6. **Build** - `npm run build` to verify production build
7. **Commit and push** - With clear commit messages
8. **Create pull request** - Following the template

### Code Style

- **TypeScript** with strict mode enabled
- **Functional components** with hooks (no class components)
- **TDD workflow** with Vitest - write tests first!
- **ESLint** for code quality - run `npm run lint`
- **Prettier** for formatting (configured in ESLint)

**See [Developer Onboarding](docs/onboarding.md#code-style) for detailed style guidelines.**

### Testing

We follow **Test-Driven Development (TDD)**:

```bash
# Run tests in watch mode (recommended during development)
npm run test

# Run tests once
npm run test:run

# Run tests with UI (interactive)
npm run test:ui

# Generate coverage report
npm run test:coverage
```

**Test Files**: Located alongside source files with `.test.ts` or `.test.tsx` suffix

**Current Coverage**: 73.9% (1526 tests passing, 43 skipped)

**Target**: 90% coverage

**Recent Test Improvements**:

- ✅ **1555 tests passing** - Comprehensive test coverage across all components
- ✅ **73.9% statement coverage** - Significant improvement from 70.22%
- ✅ **All 50 user stories tested** - Complete coverage of core functionality
- ✅ **Cross-link functionality** - 8 comprehensive tests added
- ✅ **Bulk operations** - 12 edge case tests added
- ✅ **Comment system** - 11 tests for Ctrl+Shift+C functionality
- ✅ **Search functionality** - 15 tests for advanced search features
- ✅ **File operations** - Improved from 56.86% to 62.74% coverage
- ✅ **Gesture navigation** - Improved from 37.73% to 65.09% coverage
- ✅ **Panel management** - 19 tests for keyboard shortcuts and toggling
- ✅ **Edge case testing** - 12 tests for error handling and boundary conditions
- ✅ **Automated CI/CD** - GitHub Actions workflows for builds and releases

**See [Developer Onboarding](docs/onboarding.md#testing) for testing guidelines.**

## Browser Compatibility

### Desktop

- **Chrome/Edge**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support (14+)
- **Opera**: Full support

### Mobile

- **iOS Safari**: Full support (14+)
- **Chrome Mobile**: Full support
- **Samsung Internet**: Full support
- **Firefox Mobile**: Full support

**For mobile testing guidance, see the [Mobile Testing Guide](docs/mobile-testing.md).**

## Performance

### Current Metrics (v1.0.1)

- **Bundle Size**: 629 KB (184 KB gzipped)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Canvas Performance**: 60 FPS with < 100 nodes
- **Lighthouse Score**: 90+ (Performance, Accessibility, Best Practices)
- **Test Coverage**: 73.9% statements, 73.61% branches
- **Total Tests**: 1555 passing, 43 skipped
- **Build Automation**: GitHub Actions with automated releases

**For optimization tips, see the [Performance Guide](docs/performance.md).**

## Contributing

We welcome contributions! Please follow these guidelines:

### Getting Started

1. **Read the documentation**:
   - [Developer Onboarding Guide](docs/onboarding.md) - Setup and workflow
   - [API Documentation](docs/api.md) - Component and hook APIs
   - [Architecture Overview](docs/architecture.md) - System design

2. **Find a good first issue**:
   - Check GitHub issues with `good first issue` label
   - See [First Contribution Ideas](docs/onboarding.md#first-contribution-ideas) for suggestions

3. **Set up your development environment**:

   ```bash
   # Fork and clone
   git clone https://github.com/yourusername/mindmap-web.git
   cd mindmap-web

   # Install dependencies
   npm install

   # Run tests
   npm run test:run
   ```

### Making Changes

1. **Create a feature branch**:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Write tests first** (TDD):

   ```bash
   # Watch mode for development
   npm run test
   ```

3. **Implement your feature**:
   - Follow existing code style
   - Add tests for new functionality
   - Update documentation

4. **Verify your changes**:

   ```bash
   # Run tests
   npm run test:run

   # Run linter
   npm run lint

   # Build production bundle
   npm run build
   ```

5. **Commit with clear message**:

   ```bash
   git commit -m "Add: Feature description

   - Implemented feature X
   - Added tests for Y
   - Updated documentation"
   ```

6. **Push and create pull request**:
   ```bash
   git push origin feature/your-feature-name
   ```

### Pull Request Guidelines

- **Title**: Use clear, descriptive title (e.g., "Add: SVG export functionality")
- **Description**: Include what you changed and why
- **Tests**: All tests must pass
- **Documentation**: Update relevant docs
- **Style**: Code must pass linting

### Code Review Process

1. **Automated checks** - Tests and linting must pass
2. **Review** - Maintainers will review your code
3. **Feedback** - Address any requested changes
4. **Approval** - PR approved when ready
5. **Merge** - Squashed into main branch

**For detailed contribution guidelines, see the [Developer Onboarding Guide](docs/onboarding.md).**

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

### Built With

- **[React 19.2](https://react.dev/)** - UI framework with hooks
- **[TypeScript 5.8](https://www.typescriptlang.org/)** - Type safety
- **[Vite 7.2](https://vite.dev/)** - Build tool and dev server
- **[React Flow 11](https://reactflow.dev/)** - Mind map visualization
- **[Vitest](https://vitest.dev/)** - Testing framework

### Inspired By

- **[FreeMind](https://freemind.sourceforge.io/wiki/index.php/Main_Page)** - The original mind mapping software
- **[XMind](https://www.xmind.net/)** - Modern mind mapping UI patterns
- **[Miro](https://miro.com/)** - Infinite canvas collaboration

### Special Thanks

- All contributors who have helped build this project
- The React Flow team for the amazing canvas library
- The open-source community for tools and inspiration

---

## Documentation

- **[API Documentation](docs/api.md)** - Complete API reference
- **[Architecture Overview](docs/architecture.md)** - System design and patterns
- **[Performance Guide](docs/performance.md)** - Optimization tips
- **[Mobile Testing Guide](docs/mobile-testing.md)** - Mobile testing strategies
- **[Developer Onboarding](docs/onboarding.md)** - Get started contributing

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/mindmap-web/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/mindmap-web/discussions)
- **Documentation**: See [docs/](docs/) folder

---

**Made with ❤️ by the Mind Map Web community**
