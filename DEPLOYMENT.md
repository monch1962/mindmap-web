# Deployment Guide

This guide explains how to deploy the Mind Map Web application to GitHub Pages and other platforms.

## Deployment Options

### 1. GitHub Pages (Recommended)

The project is configured for automatic deployment to GitHub Pages via GitHub Actions.

#### Automatic Deployment

- Push to `main` branch triggers automatic deployment
- Manual deployment via GitHub Actions UI
- Deployed to: `https://[username].github.io/mindmap-web/`

#### Manual Deployment

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Deploy using gh-pages
npm run deploy
```

### 2. GitHub Actions Workflows

Three workflows are configured for automated builds and releases:

#### 1. Build Artifacts Workflow (`/.github/workflows/build-artifacts.yml`)

- **Triggers**: Every push to `main` branch
- **Jobs**:
  - Lint code with ESLint
  - Run all tests with coverage
  - Build production bundle
  - Create versioned artifacts (ZIP and TAR.GZ)
  - Upload artifacts to GitHub Actions
- **Artifacts**:
  - `mindmap-web-latest-{commit}.zip` and `.tar.gz`
  - `mindmap-web-v{version}.zip` and `.tar.gz`
  - `quick-test.html` for easy deployment testing

#### 2. Create Release Workflow (`/.github/workflows/create-release.yml`)

- **Triggers**: When pushing tags starting with `v` (e.g., `v1.0.2`)
- **Creates**: Proper GitHub Releases with:
  - Production build archives
  - Source code archives
  - Release notes
  - All artifacts downloadable from "Releases" page

#### 3. Build and Release Workflow (`/.github/workflows/build-and-release.yml`)

- **Comprehensive workflow**: Combines testing, building, and artifact creation
- **Optional deployment**: Can deploy to GitHub Pages
- **Quality gates**: Ensures tests pass before creating artifacts

#### Downloading Build Artifacts:

1. **Go to GitHub Actions**: Navigate to the "Actions" tab in your repository
2. **Select latest workflow**: Click on the most recent "Build Artifacts" workflow run
3. **Download artifacts**: Scroll to the "Artifacts" section and download `mindmap-web-artifacts`
4. **Extract and use**: The archive contains production-ready builds in multiple formats

#### Creating Versioned Releases:

```bash
# Update version in package.json if needed
# Create and push a tag
git tag v1.0.2
git push origin v1.0.2
```

## Build Configuration

### Vite Configuration

- Single-file output (`vite-plugin-singlefile`)
- PWA support (`vite-plugin-pwa`)
- Bundle visualization (`rollup-plugin-visualizer`)
- Target: `esnext` for modern browsers

### Build Output

- Single HTML file: `dist/index.html` (~650KB, gzipped: ~190KB)
- PWA manifest and service worker
- Bundle stats: `dist/stats.html`

## PWA Features

The application includes Progressive Web App capabilities:

- Installable on mobile/desktop
- Offline support via service worker
- Manifest with app icons
- Theme color: `#3b82f6`

## Custom Domain

To use a custom domain:

1. Create `CNAME` file in `public/` directory:

   ```
   yourdomain.com
   ```

2. Configure DNS settings with your domain provider

3. Update GitHub Pages settings in repository settings

## Environment Variables

No environment variables required for basic deployment. The application is self-contained.

## Performance Optimization

- Single-file build reduces HTTP requests
- Assets inlined for faster loading
- Gzip compression enabled
- Target: modern browsers only

## Testing Deployment Locally

```bash
# Build the project
npm run build

# Preview locally
npm run preview

# Check bundle size
ls -lh dist/index.html
```

## Troubleshooting

### Build Issues

- Ensure Node.js 22+ is installed
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npx tsc --noEmit`

### Deployment Issues

- Verify GitHub Pages is enabled in repository settings
- Check GitHub Actions logs for errors
- Ensure `dist/` directory contains `index.html`

### PWA Issues

- Clear browser cache and service workers
- Verify `manifest.json` is accessible
- Check console for service worker errors

## Security Considerations

- No API keys or secrets in client-side code
- Content Security Policy configured via Vite
- Input sanitization for user content
- HTTPS required for PWA features

## Monitoring

- Bundle size tracked in CI
- Test coverage reported to Codecov
- GitHub Pages deployment status
- Service worker registration status

## Maintenance

Regular maintenance tasks:

1. Update dependencies: `npm update`
2. Run tests: `npm run test:run`
3. Check coverage: `npm run test:coverage`
4. Verify build: `npm run build`
5. Test deployment: `npm run preview`
