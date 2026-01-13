# Mobile Testing Guide

This document provides comprehensive guidance on testing the Mind Map Web Application on mobile devices, including touch gestures, responsive design, performance, and device-specific considerations.

## Table of Contents

- [Testing Strategy](#testing-strategy)
- [Device Testing](#device-testing)
- [Touch Gesture Testing](#touch-gesture-testing)
- [Responsive Design Testing](#responsive-design-testing)
- [Performance Testing](#performance-testing)
- [PWA Testing](#pwa-testing)
- [Browser DevTools](#browser-devtools)
- [Common Mobile Issues](#common-mobile-issues)
- [Automated Testing](#automated-testing)

---

## Testing Strategy

### Testing Pyramid for Mobile

```
           ┌──────────────┐
           │  Real Device │  10% - Final validation
           │    Testing   │
           ├──────────────┤
           │   Browser    │  30% - Touch emulation
           │  DevTools    │
           ├──────────────┤
           │   Unit &     │  60% - Core logic
           │ Integration  │
           └──────────────┘
```

### Testing Priority

1. **Critical Path Testing** - Core workflows (create, edit, export)
2. **Touch Interactions** - Gestures, pinch-to-zoom, drag
3. **Responsive Layout** - Different screen sizes
4. **Performance** - Load time, animations, memory
5. **PWA Features** - Offline mode, installability

---

## Device Testing

### Recommended Devices

#### Primary Testing Devices

| Device             | Screen Size | OS          | Browser | Priority |
| ------------------ | ----------- | ----------- | ------- | -------- |
| iPhone 12/13/14    | 390x844     | iOS 16+     | Safari  | High     |
| iPhone SE          | 375x667     | iOS 15+     | Safari  | Medium   |
| Samsung Galaxy S21 | 360x800     | Android 12+ | Chrome  | High     |
| Pixel 6            | 412x915     | Android 12+ | Chrome  | High     |
| iPad               | 768x1024    | iPadOS 15+  | Safari  | Medium   |
| iPad Pro 11"       | 834x1194    | iPadOS 15+  | Safari  | Low      |

#### Budget Devices

| Device        | Screen Size | OS          | Browser | Priority |
| ------------- | ----------- | ----------- | ------- | -------- |
| Moto G Power  | 360x720     | Android 11+ | Chrome  | Low      |
| Redmi Note 10 | 393x851     | Android 11+ | Chrome  | Low      |

### Testing Checklist

#### Before Each Testing Session

- [ ] Clear browser cache and cookies
- [ ] Close background apps
- [ ] Ensure device is charged (> 50%)
- [ ] Enable Airplane/Developer mode
- [ ] Connect to reliable Wi-Fi
- [ ] Update browser to latest version

#### Critical User Workflows

1. **Create Mind Map**
   - [ ] Launch app
   - [ ] Create root node
   - [ ] Add child nodes via UI
   - [ ] Edit node content
   - [ ] Save mind map

2. **Edit and Reorganize**
   - [ ] Select nodes
   - [ ] Drag nodes to reorganize
   - [ ] Zoom in/out
   - [ ] Pan canvas
   - [ ] Use undo/redo

3. **Export**
   - [ ] Open export menu
   - [ ] Select format
   - [ ] Download file
   - [ ] Verify file content

4. **Offline Mode**
   - [ ] Load mind map online
   - [ ] Enable airplane mode
   - [ ] Continue editing
   - [ ] Verify data persistence
   - [ ] Reconnect and sync

---

## Touch Gesture Testing

### Supported Gestures

#### 1. Tap (Single Touch)

**Purpose**: Select nodes, open panels, trigger buttons

**Test Cases**:

```tsx
// Test: Tap node to select
it('should select node on tap', () => {
  const node = screen.getByTestId('node-1')
  fireEvent.touchStart(node, { touches: [{ clientX: 100, clientY: 100 }] })
  fireEvent.touchEnd(node)

  expect(node).toHaveClass('selected')
})

// Test: Tap button to open panel
it('should open search panel on tap', () => {
  const button = screen.getByLabelText('Open search')
  fireEvent.click(button)

  expect(screen.getByRole('dialog', { name: 'Search' })).toBeInTheDocument()
})
```

**Manual Testing**:

1. Tap various nodes - should select with visual feedback
2. Tap buttons - should trigger action immediately
3. Tap panel toggles - should open/close panels

---

#### 2. Double Tap

**Purpose**: Edit node content, zoom in

**Test Cases**:

```tsx
// Test: Double tap to edit
it('should edit node on double tap', () => {
  const node = screen.getByTestId('node-1')

  fireEvent.touchStart(node, { touches: [{ clientX: 100, clientY: 100 }] })
  fireEvent.touchEnd(node)
  fireEvent.touchStart(node, { touches: [{ clientX: 100, clientY: 100 }] })
  fireEvent.touchEnd(node)

  expect(screen.getByRole('textbox', { name: 'Edit node' })).toHaveFocus()
})
```

**Manual Testing**:

1. Double tap node - should enter edit mode
2. Double tap canvas - should zoom in at tap location

---

#### 3. Pinch to Zoom

**Purpose**: Zoom in/out of canvas

**Test Cases**:

```tsx
// Test: Pinch to zoom in
it('should zoom in on pinch', () => {
  const canvas = screen.getByTestId('mindmap-canvas')

  const initialScale = getCurrentZoom()

  // Simulate pinch gesture
  fireEvent.touchStart(canvas, {
    touches: [
      { clientX: 100, clientY: 100 },
      { clientX: 200, clientY: 200 },
    ],
  })

  fireEvent.touchMove(canvas, {
    touches: [
      { clientX: 80, clientY: 80 }, // Move fingers apart
      { clientX: 220, clientY: 220 },
    ],
  })

  fireEvent.touchEnd(canvas)

  const finalScale = getCurrentZoom()
  expect(finalScale).toBeGreaterThan(initialScale)
})
```

**Manual Testing**:

1. Pinch fingers apart - should zoom in
2. Pinch fingers together - should zoom out
3. Zoom should center between touch points
4. Smooth animation, no jank

---

#### 4. Drag/Pan

**Purpose**: Move canvas, drag nodes

**Test Cases**:

```tsx
// Test: Drag to pan canvas
it('should pan canvas on drag', () => {
  const canvas = screen.getByTestId('mindmap-canvas')

  const initialPosition = getCanvasPosition()

  fireEvent.touchStart(canvas, {
    touches: [{ clientX: 100, clientY: 100 }],
  })

  fireEvent.touchMove(canvas, {
    touches: [{ clientX: 200, clientY: 200 }], // Drag right/down
  })

  fireEvent.touchEnd(canvas)

  const finalPosition = getCanvasPosition()
  expect(finalPosition.x).not.toBe(initialPosition.x)
  expect(finalPosition.y).not.toBe(initialPosition.y)
})

// Test: Drag node to reorganize
it('should move node on drag', () => {
  const node = screen.getByTestId('node-1')
  const initialPosition = getNodePosition(node)

  fireEvent.touchStart(node, {
    touches: [{ clientX: 100, clientY: 100 }],
  })

  fireEvent.touchMove(node, {
    touches: [{ clientX: 150, clientY: 150 }], // Drag to new position
  })

  fireEvent.touchEnd(node)

  const finalPosition = getNodePosition(node)
  expect(finalPosition.x).toBeGreaterThan(initialPosition.x)
})
```

**Manual Testing**:

1. Touch and drag canvas - should pan smoothly
2. Touch and drag node - should move node
3. Visual feedback during drag (highlight, shadow)
4. Snap to parent/child when dragging near other nodes

---

#### 5. Long Press

**Purpose**: Show context menu, select multiple nodes

**Test Cases**:

```tsx
// Test: Long press to show context menu
it('should show context menu on long press', () => {
  const node = screen.getByTestId('node-1')

  fireEvent.touchStart(node, {
    touches: [{ clientX: 100, clientY: 100 }],
  })

  // Wait 500ms for long press
  await waitFor(() => {}, { timeout: 500 })

  fireEvent.touchEnd(node)

  expect(screen.getByRole('menu', { name: 'Node actions' })).toBeInTheDocument()
})
```

**Manual Testing**:

1. Long press node - should show context menu
2. Menu appears after 500ms delay
3. Visual feedback (highlight) during long press
4. Tap elsewhere to dismiss menu

---

### Gesture Testing Checklist

```markdown
## Single Touch

- [ ] Tap selects nodes
- [ ] Double tap edits node
- [ ] Long press shows menu
- [ ] Tap opens/closes panels
- [ ] Tap buttons work reliably

## Multi-Touch

- [ ] Pinch to zoom works
- [ ] Pinch zoom is smooth
- [ ] Zoom centers correctly
- [ ] Two-finger pan works
- [ ] Rotation gestures (if supported)

## Drag

- [ ] Single finger drag pans canvas
- [ ] Node drag moves node
- [ ] Visual feedback during drag
- [ ] Drag ends cleanly on touch end
- [ ] No stuck drag states

## Performance

- [ ] Gestures respond within 50ms
- [ ] No delayed touch feedback
- [ ] Smooth animations (60fps)
- [ ] No jank during gestures
```

---

## Responsive Design Testing

### Breakpoints

```css
/* Mobile First Approach */

/* Extra Small (phones) */
@media (max-width: 375px) {
  /* iPhone SE, small Android phones */
}

/* Small (large phones) */
@media (min-width: 376px) and (max-width: 767px) {
  /* iPhone 12/13/14, Samsung Galaxy */
}

/* Medium (tablets) */
@media (min-width: 768px) and (max-width: 1023px) {
  /* iPad, Android tablets */
}

/* Large (desktops) */
@media (min-width: 1024px) {
  /* Desktop, laptop */
}
```

### Testing Viewports

#### Viewport Testing Matrix

| Viewport | Width  | Height | Device        | Test Focus        |
| -------- | ------ | ------ | ------------- | ----------------- |
| XS       | 320px  | 568px  | iPhone 5      | Minimum width     |
| S        | 375px  | 667px  | iPhone SE     | Small phones      |
| M        | 390px  | 844px  | iPhone 12     | Standard phones   |
| L        | 414px  | 896px  | iPhone 11 Max | Large phones      |
| XL       | 768px  | 1024px | iPad          | Tablets portrait  |
| XXL      | 1024px | 768px  | iPad Pro      | Tablets landscape |

### Layout Testing

#### 1. Navigation

```tsx
// Test: Mobile toolbar visible on small screens
it('should show mobile toolbar on small screens', () => {
  // Mock window.innerWidth
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 375,
  })

  render(<MindMapCanvas />)

  expect(screen.getByTestId('mobile-toolbar')).toBeVisible()
  expect(screen.getByTestId('desktop-toolbar')).not.toBeVisible()
})

// Test: Desktop toolbar visible on large screens
it('should show desktop toolbar on large screens', () => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1024,
  })

  render(<MindMapCanvas />)

  expect(screen.getByTestId('desktop-toolbar')).toBeVisible()
  expect(screen.getByTestId('mobile-toolbar')).not.toBeVisible()
})
```

#### 2. Panels and Modals

```tsx
// Test: Panels are full-screen on mobile
it('should render panels as full-screen on mobile', () => {
  Object.defineProperty(window, 'innerWidth', { value: 375 })

  const { container } = render(<MetadataPanel visible nodeId="node-1" />)

  const panel = container.querySelector('[role="dialog"]')
  expect(panel).toHaveStyle({
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    width: '100%',
    height: '100%',
  })
})

// Test: Panels are sidebar on desktop
it('should render panels as sidebar on desktop', () => {
  Object.defineProperty(window, 'innerWidth', { value: 1024 })

  const { container } = render(<MetadataPanel visible nodeId="node-1" />)

  const panel = container.querySelector('[role="dialog"]')
  expect(panel).toHaveStyle({
    width: '400px',
    maxWidth: '90vw',
  })
})
```

#### 3. Text Sizing

```tsx
// Test: Text is readable on mobile
it('should use appropriate font size on mobile', () => {
  Object.defineProperty(window, 'innerWidth', { value: 375 })

  render(<MindMapCanvas />)

  const nodes = screen.getAllByRole('button', { name: /node/i })
  nodes.forEach(node => {
    const fontSize = window.getComputedStyle(node).fontSize
    expect(parseInt(fontSize)).toBeGreaterThanOrEqual(14) // Min 14px
  })
})
```

---

### Touch Target Testing

#### Minimum Touch Target Size

**WCAG 2.1 AAA**: At least 44x44 CSS pixels

```tsx
// Test: Touch targets meet minimum size
it('should have adequate touch target sizes', () => {
  render(<MindMapCanvas />)

  const buttons = screen.getAllByRole('button')

  buttons.forEach(button => {
    const styles = window.getComputedStyle(button)
    const width = parseInt(styles.width)
    const height = parseInt(styles.height)

    expect(width).toBeGreaterThanOrEqual(44)
    expect(height).toBeGreaterThanOrEqual(44)
  })
})
```

**Manual Testing**:

1. Can buttons be easily tapped without zooming?
2. Are buttons spaced to prevent accidental taps?
3. Do touch targets provide visual feedback?

---

## Performance Testing

### Mobile Performance Metrics

#### Key Performance Indicators

| Metric                         | Target  | Acceptable | Poor    |
| ------------------------------ | ------- | ---------- | ------- |
| First Contentful Paint (FCP)   | < 1.5s  | < 2.5s     | > 2.5s  |
| Largest Contentful Paint (LCP) | < 2.5s  | < 4.0s     | > 4.0s  |
| Time to Interactive (TTI)      | < 3.5s  | < 7.0s     | > 7.0s  |
| Total Blocking Time (TBT)      | < 200ms | < 600ms    | > 600ms |
| Cumulative Layout Shift (CLS)  | < 0.1   | < 0.25     | > 0.25  |
| First Input Delay (FID)        | < 100ms | < 300ms    | > 300ms |

#### Memory Usage

| Device         | Target  | Acceptable | Poor    |
| -------------- | ------- | ---------- | ------- |
| Low-end phone  | < 100MB | < 150MB    | > 150MB |
| High-end phone | < 150MB | < 200MB    | > 200MB |
| Tablet         | < 200MB | < 300MB    | > 300MB |

### Performance Testing Tools

#### 1. Chrome DevTools (Performance)

```bash
# Open Chrome DevTools on Android
1. Enable USB debugging on Android device
2. Connect device to computer via USB
3. chrome://inspect on desktop
4. Configure port forwarding
5. Inspect device Chrome instance
6. Record performance trace
```

**Key Metrics to Check**:

- Frame rate (should be 60fps)
- Main thread work
- JavaScript execution time
- Layout and paint timing

#### 2. Lighthouse (Mobile)

```bash
# Run Lighthouse on mobile device
npx lighthouse https://localhost:5173 \
  --emulated-form-factor=mobile \
  --throttling-method=devtools \
  --only-categories=performance,accessibility,best-practices
```

**Target Scores**:

- Performance: > 90
- Accessibility: 100
- Best Practices: > 90

#### 3. WebPageTest (Real Mobile Devices)

```bash
# Test on real devices
https://www.webpagetest.org/
- Location: US - iOS (iPhone 13)
- Connection: 4G
- Tests: 9 runs
- Repeat View: First View Only
```

---

### Mobile Performance Optimization

#### 1. Reduce Main Thread Work

```tsx
// ❌ Bad: Synchronous heavy computation
const handleClick = () => {
  const result = heavyComputation(data) // Blocks main thread
  setResult(result)
}

// ✅ Good: Offload to Web Worker or use time slicing
const handleClick = () => {
  requestIdleCallback(() => {
    const result = heavyComputation(data)
    setResult(result)
  })
}
```

#### 2. Debounce Touch Events

```tsx
// Debounce rapid touch events
const handleTouch = useMemo(
  () =>
    debounce((event: TouchEvent) => {
      handleGesture(event)
    }, 16), // 60fps
  []
)
```

#### 3. Use Passive Event Listeners

```tsx
// ✅ Good: Passive listeners improve scroll performance
useEffect(() => {
  element.addEventListener('touchstart', handleTouch, { passive: true })
  return () => element.removeEventListener('touchstart', handleTouch)
}, [])
```

#### 4. Optimize Images

```tsx
// Serve appropriate sizes for mobile
const iconSize = window.innerWidth < 768 ? 16 : 24

;<Icon size={iconSize} src={iconSrc} />
```

---

## PWA Testing

### Installability Testing

#### Test Checklist

- [ ] Add to Home Screen prompt appears
- [ ] App installs successfully
- [ ] App launches from home screen
- [ ] App runs in standalone mode
- [ ] App has correct name and icon
- [ ] App has splash screen

#### Test Manifest

```json
// public/manifest.json
{
  "name": "Mind Map",
  "short_name": "MindMap",
  "description": "Interactive mind mapping tool",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#667eea",
  "orientation": "any",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

#### Test Installability in Chrome DevTools

```bash
1. Open DevTools > Application
2. Check "Manifest" tab - no errors
3. Check "Service Workers" tab - registered and active
4. Check "Storage" - verify IndexedDB
```

---

### Offline Testing

#### Offline Test Cases

1. **Load App Online, Then Go Offline**

```tsx
it('should work offline after loading', async () => {
  // Load app online
  render(<MindMapCanvas />)
  await waitFor(() => expect(screen.getByTestId('mindmap-canvas')).toBeVisible())

  // Go offline
  navigator.onLine = false
  window.dispatchEvent(new Event('offline'))

  // App should still work
  fireEvent.click(screen.getByText('Add Node'))
  expect(screen.getByText('New Node')).toBeInTheDocument()
})
```

2. **Offline App Launch**

```bash
# Test offline launch
1. Load app once while online
2. Enable airplane mode
3. Close and reopen browser
4. Navigate to localhost:5173
5. App should load from cache
```

3. **Offline Sync**

```tsx
it('should sync data when back online', async () => {
  // Go offline
  navigator.onLine = false
  window.dispatchEvent(new Event('offline'))

  // Make changes
  render(<MindMapCanvas />)
  fireEvent.change(screen.getByPlaceholderText('Node content'), {
    target: { value: 'Offline edit' },
  })

  // Go back online
  navigator.onLine = true
  window.dispatchEvent(new Event('online'))

  // Verify sync happened
  await waitFor(() => {
    expect(getStoredData()).toContain('Offline edit')
  })
})
```

#### Offline Testing Checklist

- [ ] App loads offline
- [ ] Can create nodes offline
- [ ] Can edit nodes offline
- [ ] Can save data offline (localStorage/IndexedDB)
- [ ] Changes sync when back online
- [ ] App shows "offline" indicator
- [ ] No network errors in console

---

## Browser DevTools

### Chrome Remote Debugging (Android)

```bash
# Setup
1. Enable USB debugging on Android device
   Settings > About Phone > Tap Build Number 7 times
   Settings > Developer Options > USB Debugging

2. Connect device to computer via USB

3. On desktop Chrome, navigate to:
   chrome://inspect

4. Click "Configure" and add port 5173

5. On device, open Chrome and go to localhost:5173

6. On desktop, click "Inspect" under device name

# Now you can use desktop DevTools to debug mobile!
```

### Safari Web Inspector (iOS)

```bash
# Setup
1. Connect iPhone to Mac via USB

2. On iPhone, enable Web Inspector:
   Settings > Safari > Advanced > Web Inspector

3. On Mac, enable Safari Developer menu:
   Safari > Preferences > Advanced > Show Develop menu

4. On iPhone, open Safari and go to localhost:5173

5. On Mac, Safari > Develop > [iPhone Name] > localhost:5173

# Now you can use Safari Web Inspector!
```

### Firefox Remote Debugging

```bash
# Setup
1. Install Firefox on Android device

2. Enable remote debugging:
   Firefox Settings > Advanced > Remote debugging via USB

3. On desktop Firefox:
   about:debugging
   Click "This Firefox"
   Click "Enable USB debugging"

4. Connect device and authorize

5. Click "Connect" to device
```

---

## Common Mobile Issues

### Issue 1: 300ms Click Delay

**Symptom**: Noticeable delay between tap and action

**Solution**: Use touch events or touch-action CSS

```tsx
// ✅ Good: Remove 300ms delay
const style = {
  touchAction: 'manipulation', // Disables double-tap zoom
}
```

---

### Issue 2: Accidental Zoom on Double Tap

**Symptom**: Page zooms in when tapping buttons quickly

**Solution**: Prevent default touch behavior

```tsx
useEffect(() => {
  const preventZoom = (e: TouchEvent) => {
    if (e.touches.length > 1) {
      e.preventDefault()
    }
  }

  document.addEventListener('touchmove', preventZoom, { passive: false })
  return () => document.removeEventListener('touchmove', preventZoom)
}, [])
```

---

### Issue 3: Fixed Position Elements Jitter on Scroll

**Symptom**: Toolbar/background jitters during scroll

**Solution**: Use `position: fixed` with hardware acceleration

```css
.toolbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  transform: translateZ(0); /* Force GPU acceleration */
  will-change: transform;
}
```

---

### Issue 4: Virtual Keyboard Overlays Input

**Symptom**: Keyboard covers input field on focus

**Solution**: Scroll input into view when focused

```tsx
useEffect(() => {
  const input = inputRef.current
  if (!input) return

  const handleFocus = () => {
    setTimeout(() => {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 300) // Wait for keyboard animation
  }

  input.addEventListener('focus', handleFocus)
  return () => input.removeEventListener('focus', handleFocus)
}, [])
```

---

### Issue 5: Pull-to-Refresh Interferes with App

**Symptom**: Pulling down refreshes page instead of panning canvas

**Solution**: Disable pull-to-refresh

```css
html,
body {
  overscroll-behavior: none; /* Disable pull-to-refresh */
}

.canvas {
  overscroll-behavior: contain; /* Contain scroll to canvas */
}
```

---

## Automated Testing

### Automated Mobile Testing Tools

#### 1. BrowserStack or Sauce Labs

```bash
# Test on real device cloud
npm install -g browserstack-local

browserstack-local --key <API_KEY> --local-identifier "test"

# Run tests
npm run test:mobile
```

#### 2. Appium (Native Mobile Testing)

```javascript
// wdio.conf.js
exports.config = {
  capabilities: [
    {
      platformName: 'Android',
      'appium:deviceName': 'Pixel 6',
      'appium:browserName': 'Chrome',
      'appium:automationName': 'UiAutomator2',
    },
  ],
}
```

#### 3. Cypress Mobile Testing

```tsx
// cypress/support/mobile.ts
Cypress.Commands.add('mobileTap', { prevSubject: 'element' }, subject => {
  cy.wrap(subject).then($el => {
    const rect = $el[0].getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2

    cy.touch(x, y)
  })
})

// Usage
cy.get('[data-testid="node-1"]').mobileTap()
```

---

### Continuous Integration for Mobile

```yaml
# .github/workflows/mobile-test.yml
name: Mobile Tests

on: [push, pull_request]

jobs:
  mobile-test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run mobile viewport tests
        run: npm run test:mobile

      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun --collect.mobileSettings.emulatedFormFactor=mobile
```

---

## Testing Checklist Summary

### Pre-Release Checklist

```markdown
## Functionality

- [ ] All critical workflows work on mobile
- [ ] Touch gestures respond correctly
- [ ] No stuck or broken states
- [ ] Export/import works

## Performance

- [ ] Lighthouse score > 90
- [ ] 60fps during interactions
- [ ] Load time < 3.5s
- [ ] Memory usage stable

## Responsive Design

- [ ] Layout works on all breakpoints
- [ ] Text is readable without zoom
- [ ] Touch targets meet WCAG AAA (44x44)
- [ ] No horizontal scroll
- [ ] Panels are usable on mobile

## PWA

- [ ] App installs correctly
- [ ] Offline mode works
- [ ] Splash screen appears
- [ ] App icon displays correctly

## Accessibility

- [ ] All features accessible via touch
- [ ] Focus is visible
- [ ] Screen reader works (VoiceOver/TalkBack)
- [ ] Sufficient color contrast

## Browser Compatibility

- [ ] Works on iOS Safari
- [ ] Works on Android Chrome
- [ ] Works on Samsung Internet
- [ ] Works on Firefox Mobile
```

---

For mobile testing questions or to report issues, please open an issue on GitHub with:

- Device model and OS version
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/videos if applicable
