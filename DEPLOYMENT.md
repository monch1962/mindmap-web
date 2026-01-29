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

Two workflows are configured:

#### CI Workflow (`/.github/workflows/ci.yml`)

- Runs on: push to `main`, `develop` branches and pull requests
- Jobs:
  - Lint and test
  - TypeScript compilation
  - Test coverage with Codecov integration
  - Build verification

#### Deployment Workflow (`/.github/workflows/deploy.yml`)

- Runs on: push to `main` branch
- Deploys to GitHub Pages automatically
- Includes PWA configuration
- Single-file build for optimal performance

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
