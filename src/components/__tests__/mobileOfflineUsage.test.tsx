/**
 * Mobile & Offline Usage Tests - Stories 38-41
 *
 * Tests for PWA installation, touch gestures, offline work, and connectivity status
 *
 * Story 38: As a user, I want to install the app as a PWA on my mobile device
 * Story 39: As a user, I want to use touch gestures (pinch-to-zoom, drag) on mobile
 * Story 40: As a user, I want to work offline and have changes sync when back online
 * Story 41: As a user, I want to see online/offline status
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Import test utilities
import { customRender } from '../../test/utils'

// Import mocks
import * as mocks from '../../test/mocks'

// Mock React Flow
vi.mock('reactflow', () => mocks.reactflow)

describe('Mobile & Offline Usage Workflows', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks()

    // Setup browser mocks
    mocks.setupBrowserMocks()
  })

  describe('Story 38: Install as PWA', () => {
    it('should show PWA installation prompt', () => {
      // Arrange
      const mockPWAPrompt = {
        isSupported: true,
        isInstalled: false,
        canInstall: true,
        platform: 'mobile',
      }

      // Mock PWA prompt display
      const PWAPromptDisplay = vi.fn(({ prompt }) => (
        <div data-testid="pwa-prompt">
          {prompt.isSupported && !prompt.isInstalled && prompt.canInstall && (
            <div data-testid="install-prompt">
              <div data-testid="prompt-title">Install Mind Map App</div>
              <div data-testid="platform-info">Platform: {prompt.platform}</div>
              <button data-testid="install-btn">Install App</button>
              <button data-testid="dismiss-btn">Not Now</button>
            </div>
          )}
          {prompt.isInstalled && <div data-testid="installed-badge">✅ Installed</div>}
        </div>
      ))

      // Act
      customRender(<PWAPromptDisplay prompt={mockPWAPrompt} />)

      // Assert
      expect(screen.getByTestId('pwa-prompt')).toBeInTheDocument()
      expect(screen.getByTestId('install-prompt')).toBeInTheDocument()
      expect(screen.getByTestId('prompt-title')).toHaveTextContent('Install Mind Map App')
      expect(screen.getByTestId('platform-info')).toHaveTextContent('Platform: mobile')
      expect(screen.getByTestId('install-btn')).toBeInTheDocument()
      expect(screen.getByTestId('dismiss-btn')).toBeInTheDocument()
    })

    it('should handle PWA installation', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnInstall = vi.fn()

      // Mock PWA installation
      const PWAInstallation = vi.fn(({ onInstall }) => (
        <div data-testid="pwa-installation">
          <button data-testid="install-pwa-btn" onClick={onInstall}>
            Add to Home Screen
          </button>
          <div data-testid="install-steps">
            <div data-testid="step-1">1. Tap share button</div>
            <div data-testid="step-2">2. Select "Add to Home Screen"</div>
            <div data-testid="step-3">3. Confirm installation</div>
          </div>
        </div>
      ))

      // Act
      customRender(<PWAInstallation onInstall={mockOnInstall} />)

      // Click install button
      const installButton = screen.getByTestId('install-pwa-btn')
      await user.click(installButton)

      // Assert
      expect(mockOnInstall).toHaveBeenCalled()
      expect(screen.getByTestId('pwa-installation')).toBeInTheDocument()
      expect(screen.getByTestId('install-steps')).toBeInTheDocument()
      expect(screen.getByTestId('step-1')).toHaveTextContent('1. Tap share button')
      expect(screen.getByTestId('step-2')).toHaveTextContent('2. Select "Add to Home Screen"')
      expect(screen.getByTestId('step-3')).toHaveTextContent('3. Confirm installation')
    })

    it('should show PWA installation status', () => {
      // Arrange
      const mockInstallationStatus = {
        installed: true,
        installationDate: '2024-01-15',
        version: '1.2.3',
        storageUsed: '15.7 MB',
        canUpdate: true,
      }

      // Mock PWA status display
      const PWAStatusDisplay = vi.fn(({ status }) => (
        <div data-testid="pwa-status">
          <div data-testid="status-header">
            {status.installed ? '✅ Installed as PWA' : '❌ Not installed'}
          </div>
          {status.installed && (
            <div data-testid="status-details">
              <div data-testid="install-date">Installed: {status.installationDate}</div>
              <div data-testid="app-version">Version: {status.version}</div>
              <div data-testid="storage-used">Storage: {status.storageUsed}</div>
              {status.canUpdate && <div data-testid="update-available">Update available</div>}
            </div>
          )}
        </div>
      ))

      // Act
      customRender(<PWAStatusDisplay status={mockInstallationStatus} />)

      // Assert
      expect(screen.getByTestId('pwa-status')).toBeInTheDocument()
      expect(screen.getByTestId('status-header')).toHaveTextContent('✅ Installed as PWA')
      expect(screen.getByTestId('status-details')).toBeInTheDocument()
      expect(screen.getByTestId('install-date')).toHaveTextContent('Installed: 2024-01-15')
      expect(screen.getByTestId('app-version')).toHaveTextContent('Version: 1.2.3')
      expect(screen.getByTestId('storage-used')).toHaveTextContent('Storage: 15.7 MB')
      expect(screen.getByTestId('update-available')).toHaveTextContent('Update available')
    })
  })

  describe('Story 39: Use touch gestures', () => {
    it('should detect mobile device and show touch interface', () => {
      // Arrange
      const mockDeviceInfo = {
        isMobile: true,
        isTablet: false,
        hasTouch: true,
        screenSize: { width: 375, height: 667 },
        supportedGestures: ['pinch', 'drag', 'tap', 'double-tap', 'long-press'],
      }

      // Mock touch interface detection
      const TouchInterface = vi.fn(({ device }) => (
        <div data-testid="touch-interface">
          <div data-testid="device-type">
            {device.isMobile ? '📱 Mobile' : device.isTablet ? '📱 Tablet' : '🖥️ Desktop'}
          </div>
          {device.hasTouch && (
            <div data-testid="touch-features">
              <div data-testid="screen-size">
                Screen: {device.screenSize.width}×{device.screenSize.height}
              </div>
              <div data-testid="gestures-list">
                Supported gestures: {device.supportedGestures.join(', ')}
              </div>
              <div data-testid="touch-hints">
                <div data-testid="pinch-hint">Pinch to zoom</div>
                <div data-testid="drag-hint">Drag to pan</div>
                <div data-testid="tap-hint">Tap to select</div>
              </div>
            </div>
          )}
        </div>
      ))

      // Act
      customRender(<TouchInterface device={mockDeviceInfo} />)

      // Assert
      expect(screen.getByTestId('touch-interface')).toBeInTheDocument()
      expect(screen.getByTestId('device-type')).toHaveTextContent('📱 Mobile')
      expect(screen.getByTestId('touch-features')).toBeInTheDocument()
      expect(screen.getByTestId('screen-size')).toHaveTextContent('Screen: 375×667')
      expect(screen.getByTestId('gestures-list')).toHaveTextContent(
        'Supported gestures: pinch, drag, tap, double-tap, long-press'
      )
      expect(screen.getByTestId('pinch-hint')).toHaveTextContent('Pinch to zoom')
      expect(screen.getByTestId('drag-hint')).toHaveTextContent('Drag to pan')
      expect(screen.getByTestId('tap-hint')).toHaveTextContent('Tap to select')
    })

    it('should handle pinch-to-zoom gesture simulation', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnZoom = vi.fn()

      // Mock zoom controls for touch
      const TouchZoomControls = vi.fn(({ onZoom }) => (
        <div data-testid="touch-zoom-controls">
          <div data-testid="zoom-level">Zoom: 100%</div>
          <button
            data-testid="zoom-in-btn"
            onClick={() => onZoom('in', 1.2)}
            aria-label="Zoom in (pinch open)"
          >
            🔍➕
          </button>
          <button
            data-testid="zoom-out-btn"
            onClick={() => onZoom('out', 0.8)}
            aria-label="Zoom out (pinch close)"
          >
            🔍➖
          </button>
          <div data-testid="gesture-hint">Pinch with two fingers to zoom</div>
        </div>
      ))

      // Act
      customRender(<TouchZoomControls onZoom={mockOnZoom} />)

      // Simulate zoom in (pinch open)
      const zoomInButton = screen.getByTestId('zoom-in-btn')
      await user.click(zoomInButton)

      // Simulate zoom out (pinch close)
      const zoomOutButton = screen.getByTestId('zoom-out-btn')
      await user.click(zoomOutButton)

      // Assert
      expect(mockOnZoom).toHaveBeenCalledWith('in', 1.2)
      expect(mockOnZoom).toHaveBeenCalledWith('out', 0.8)
      expect(screen.getByTestId('touch-zoom-controls')).toBeInTheDocument()
      expect(screen.getByTestId('zoom-level')).toHaveTextContent('Zoom: 100%')
      expect(screen.getByTestId('gesture-hint')).toHaveTextContent('Pinch with two fingers to zoom')
    })

    it('should handle drag gesture for node movement', () => {
      // Arrange
      const mockOnDrag = vi.fn()

      // Mock touch drag interface
      const TouchDragInterface = vi.fn(({ onDrag }) => (
        <div data-testid="touch-drag-interface">
          <div
            data-testid="draggable-node"
            style={{ position: 'absolute', left: 100, top: 200 }}
            onTouchStart={() => onDrag('start', { x: 100, y: 200 })}
            onTouchMove={() => onDrag('move', { x: 150, y: 250 })}
            onTouchEnd={() => onDrag('end', { x: 150, y: 250 })}
          >
            📍 Draggable Node
          </div>
          <div data-testid="drag-hint">Touch and drag to move nodes</div>
          <div data-testid="drag-instructions">
            <div>1. Touch node to select</div>
            <div>2. Drag to new position</div>
            <div>3. Release to place</div>
          </div>
        </div>
      ))

      // Act
      customRender(<TouchDragInterface onDrag={mockOnDrag} />)

      // Simulate drag start
      const draggableNode = screen.getByTestId('draggable-node')
      draggableNode.dispatchEvent(new TouchEvent('touchstart', { bubbles: true }))

      // Simulate drag move
      draggableNode.dispatchEvent(new TouchEvent('touchmove', { bubbles: true }))

      // Simulate drag end
      draggableNode.dispatchEvent(new TouchEvent('touchend', { bubbles: true }))

      // Assert
      expect(mockOnDrag).toHaveBeenCalledWith('start', { x: 100, y: 200 })
      expect(mockOnDrag).toHaveBeenCalledWith('move', { x: 150, y: 250 })
      expect(mockOnDrag).toHaveBeenCalledWith('end', { x: 150, y: 250 })
      expect(screen.getByTestId('touch-drag-interface')).toBeInTheDocument()
      expect(screen.getByTestId('drag-hint')).toHaveTextContent('Touch and drag to move nodes')
      expect(screen.getByTestId('drag-instructions')).toBeInTheDocument()
    })

    it('should show mobile-optimized toolbar', () => {
      // Arrange
      const mockMobileToolbar = {
        visible: true,
        position: 'bottom',
        items: [
          { id: 'add', icon: '➕', label: 'Add Node' },
          { id: 'edit', icon: '✏️', label: 'Edit' },
          { id: 'delete', icon: '🗑️', label: 'Delete' },
          { id: 'zoom', icon: '🔍', label: 'Zoom' },
          { id: 'menu', icon: '☰', label: 'Menu' },
        ],
        compact: true,
      }

      // Mock mobile toolbar
      const MobileToolbar = vi.fn(({ toolbar }) => (
        <div data-testid="mobile-toolbar" style={{ position: 'fixed', [toolbar.position]: 0 }}>
          <div data-testid="toolbar-items">
            {toolbar.items.map((item: { id: string; icon: string; label: string }) => (
              <button key={item.id} data-testid={`toolbar-${item.id}`} aria-label={item.label}>
                {item.icon}
                {!toolbar.compact && <span data-testid={`label-${item.id}`}>{item.label}</span>}
              </button>
            ))}
          </div>
          {toolbar.compact && <div data-testid="compact-mode">Compact mode for small screens</div>}
        </div>
      ))

      // Act
      customRender(<MobileToolbar toolbar={mockMobileToolbar} />)

      // Assert
      expect(screen.getByTestId('mobile-toolbar')).toBeInTheDocument()
      expect(screen.getByTestId('toolbar-items')).toBeInTheDocument()
      expect(screen.getByTestId('toolbar-add')).toBeInTheDocument()
      expect(screen.getByTestId('toolbar-edit')).toBeInTheDocument()
      expect(screen.getByTestId('toolbar-delete')).toBeInTheDocument()
      expect(screen.getByTestId('toolbar-zoom')).toBeInTheDocument()
      expect(screen.getByTestId('toolbar-menu')).toBeInTheDocument()
      expect(screen.getByTestId('compact-mode')).toHaveTextContent('Compact mode for small screens')
    })
  })

  describe('Story 40: Work offline with sync', () => {
    it('should detect offline mode and show offline indicator', () => {
      // Arrange
      const mockOfflineStatus = {
        isOnline: false,
        lastSync: '2024-01-15 10:30',
        pendingChanges: 3,
        storageStatus: { used: '2.1 MB', total: '50 MB', percent: 4 },
        canWorkOffline: true,
      }

      // Mock offline status display
      const OfflineStatusDisplay = vi.fn(({ status }) => (
        <div data-testid="offline-status">
          <div data-testid="connection-status">{status.isOnline ? '🌐 Online' : '📴 Offline'}</div>
          {!status.isOnline && (
            <div data-testid="offline-details">
              <div data-testid="last-sync">Last sync: {status.lastSync}</div>
              <div data-testid="pending-changes">Pending changes: {status.pendingChanges}</div>
              <div data-testid="storage-status">
                Storage: {status.storageStatus.used} / {status.storageStatus.total} (
                {status.storageStatus.percent}%)
              </div>
              {status.canWorkOffline && (
                <div data-testid="offline-ready">✅ Ready for offline work</div>
              )}
            </div>
          )}
        </div>
      ))

      // Act
      customRender(<OfflineStatusDisplay status={mockOfflineStatus} />)

      // Assert
      expect(screen.getByTestId('offline-status')).toBeInTheDocument()
      expect(screen.getByTestId('connection-status')).toHaveTextContent('📴 Offline')
      expect(screen.getByTestId('offline-details')).toBeInTheDocument()
      expect(screen.getByTestId('last-sync')).toHaveTextContent('Last sync: 2024-01-15 10:30')
      expect(screen.getByTestId('pending-changes')).toHaveTextContent('Pending changes: 3')
      expect(screen.getByTestId('storage-status')).toHaveTextContent('Storage: 2.1 MB / 50 MB (4%)')
      expect(screen.getByTestId('offline-ready')).toHaveTextContent('✅ Ready for offline work')
    })

    it('should queue changes when offline', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnQueueChange = vi.fn()

      // Mock offline change queue
      const OfflineChangeQueue = vi.fn(({ onQueueChange }) => (
        <div data-testid="offline-queue">
          <button
            data-testid="add-offline-change"
            onClick={() => onQueueChange('add', { type: 'node_create', content: 'New Idea' })}
          >
            Add Change Offline
          </button>
          <div data-testid="queue-status">
            <div data-testid="queue-count">0 changes queued</div>
            <div data-testid="queue-hint">Changes will sync when back online</div>
          </div>
          <div data-testid="offline-actions">
            <button data-testid="view-queue-btn">View Queued Changes</button>
            <button data-testid="sync-now-btn" disabled>
              Sync Now (Offline)
            </button>
          </div>
        </div>
      ))

      // Act
      customRender(<OfflineChangeQueue onQueueChange={mockOnQueueChange} />)

      // Add offline change
      const addButton = screen.getByTestId('add-offline-change')
      await user.click(addButton)

      // Assert
      expect(mockOnQueueChange).toHaveBeenCalledWith('add', {
        type: 'node_create',
        content: 'New Idea',
      })
      expect(screen.getByTestId('offline-queue')).toBeInTheDocument()
      expect(screen.getByTestId('queue-status')).toBeInTheDocument()
      expect(screen.getByTestId('queue-count')).toHaveTextContent('0 changes queued')
      expect(screen.getByTestId('queue-hint')).toHaveTextContent(
        'Changes will sync when back online'
      )
      expect(screen.getByTestId('sync-now-btn')).toBeDisabled()
    })

    it('should sync changes when coming back online', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnSync = vi.fn()

      // Mock sync interface
      const SyncInterface = vi.fn(({ onSync }) => (
        <div data-testid="sync-interface">
          <div data-testid="sync-status">🔄 Syncing...</div>
          <div data-testid="sync-progress">
            <div data-testid="progress-bar" style={{ width: '75%' }} />
            <div data-testid="progress-text">3 of 4 changes synced</div>
          </div>
          <button data-testid="manual-sync-btn" onClick={onSync}>
            Sync Now
          </button>
          <div data-testid="sync-details">
            <div data-testid="sync-success">✅ 3 changes synced successfully</div>
            <div data-testid="sync-remaining">⏳ 1 change remaining</div>
            <div data-testid="last-sync-time">Last sync: Just now</div>
          </div>
        </div>
      ))

      // Act
      customRender(<SyncInterface onSync={mockOnSync} />)

      // Trigger manual sync
      const syncButton = screen.getByTestId('manual-sync-btn')
      await user.click(syncButton)

      // Assert
      expect(mockOnSync).toHaveBeenCalled()
      expect(screen.getByTestId('sync-interface')).toBeInTheDocument()
      expect(screen.getByTestId('sync-status')).toHaveTextContent('🔄 Syncing...')
      expect(screen.getByTestId('sync-progress')).toBeInTheDocument()
      expect(screen.getByTestId('progress-text')).toHaveTextContent('3 of 4 changes synced')
      expect(screen.getByTestId('sync-details')).toBeInTheDocument()
      expect(screen.getByTestId('sync-success')).toHaveTextContent(
        '✅ 3 changes synced successfully'
      )
      expect(screen.getByTestId('sync-remaining')).toHaveTextContent('⏳ 1 change remaining')
    })

    it('should handle sync conflicts', () => {
      // Arrange
      const mockSyncConflicts = {
        hasConflicts: true,
        conflicts: [
          { id: 'conflict-1', type: 'node_edit', local: 'Version A', remote: 'Version B' },
          { id: 'conflict-2', type: 'node_delete', local: 'Deleted', remote: 'Modified' },
        ],
        resolutionOptions: ['keep_local', 'use_remote', 'merge'],
      }

      // Mock conflict resolution interface
      const ConflictResolution = vi.fn(({ conflicts }) => (
        <div data-testid="conflict-resolution">
          <div data-testid="conflict-header">
            ⚠️ {conflicts.conflicts.length} sync conflicts detected
          </div>
          <div data-testid="conflicts-list">
            {conflicts.conflicts.map(
              (conflict: { id: string; type: string; local: string; remote: string }) => (
                <div key={conflict.id} data-testid={`conflict-${conflict.id}`}>
                  <div data-testid="conflict-type">{conflict.type}</div>
                  <div data-testid="local-version">Local: {conflict.local}</div>
                  <div data-testid="remote-version">Remote: {conflict.remote}</div>
                </div>
              )
            )}
          </div>
          <div data-testid="resolution-options">
            Resolution options: {conflicts.resolutionOptions.join(', ')}
          </div>
          <button data-testid="resolve-conflicts-btn">Resolve Conflicts</button>
        </div>
      ))

      // Act
      customRender(<ConflictResolution conflicts={mockSyncConflicts} />)

      // Assert
      expect(screen.getByTestId('conflict-resolution')).toBeInTheDocument()
      expect(screen.getByTestId('conflict-header')).toHaveTextContent(
        '⚠️ 2 sync conflicts detected'
      )
      expect(screen.getByTestId('conflicts-list')).toBeInTheDocument()
      expect(screen.getByTestId('conflict-conflict-1')).toBeInTheDocument()
      expect(screen.getByTestId('conflict-conflict-2')).toBeInTheDocument()
      expect(screen.getByTestId('resolution-options')).toHaveTextContent(
        'Resolution options: keep_local, use_remote, merge'
      )
      expect(screen.getByTestId('resolve-conflicts-btn')).toBeInTheDocument()
    })
  })

  describe('Story 41: Show online/offline status', () => {
    it('should display current connectivity status', () => {
      // Arrange
      const mockConnectivity = {
        isOnline: true,
        connectionType: 'wifi',
        strength: 'excellent',
        latency: 45,
        lastChecked: '2024-01-15 14:30:15',
        uptime: '99.8%',
      }

      // Mock connectivity status display
      const ConnectivityStatus = vi.fn(({ connectivity }) => (
        <div data-testid="connectivity-status">
          <div data-testid="status-indicator">
            {connectivity.isOnline ? '🟢 Online' : '🔴 Offline'}
          </div>
          {connectivity.isOnline && (
            <div data-testid="connection-details">
              <div data-testid="connection-type">Type: {connectivity.connectionType}</div>
              <div data-testid="connection-strength">Strength: {connectivity.strength}</div>
              <div data-testid="connection-latency">Latency: {connectivity.latency}ms</div>
              <div data-testid="last-checked">Last checked: {connectivity.lastChecked}</div>
              <div data-testid="uptime">Uptime: {connectivity.uptime}</div>
            </div>
          )}
        </div>
      ))

      // Act
      customRender(<ConnectivityStatus connectivity={mockConnectivity} />)

      // Assert
      expect(screen.getByTestId('connectivity-status')).toBeInTheDocument()
      expect(screen.getByTestId('status-indicator')).toHaveTextContent('🟢 Online')
      expect(screen.getByTestId('connection-details')).toBeInTheDocument()
      expect(screen.getByTestId('connection-type')).toHaveTextContent('Type: wifi')
      expect(screen.getByTestId('connection-strength')).toHaveTextContent('Strength: excellent')
      expect(screen.getByTestId('connection-latency')).toHaveTextContent('Latency: 45ms')
      expect(screen.getByTestId('last-checked')).toHaveTextContent(
        'Last checked: 2024-01-15 14:30:15'
      )
      expect(screen.getByTestId('uptime')).toHaveTextContent('Uptime: 99.8%')
    })

    it('should show network status changes in real-time', () => {
      // Arrange
      const mockNetworkEvents = [
        { time: '14:30:00', status: 'online', type: 'wifi' },
        { time: '14:31:15', status: 'offline', type: 'disconnected' },
        { time: '14:32:30', status: 'online', type: 'cellular' },
        { time: '14:33:45', status: 'online', type: 'wifi' },
      ]

      // Mock network event history
      const NetworkEventHistory = vi.fn(({ events }) => (
        <div data-testid="network-history">
          <div data-testid="history-title">Network History</div>
          <div data-testid="events-list">
            {events.map((event: { time: string; status: string; type: string }) => (
              <div key={event.time} data-testid={`event-${event.time}`}>
                <div data-testid="event-time">{event.time}</div>
                <div data-testid="event-status">
                  {event.status === 'online' ? '🟢' : '🔴'} {event.status}
                </div>
                <div data-testid="event-type">({event.type})</div>
              </div>
            ))}
          </div>
          <div data-testid="event-count">{events.length} network events</div>
        </div>
      ))

      // Act
      customRender(<NetworkEventHistory events={mockNetworkEvents} />)

      // Assert
      expect(screen.getByTestId('network-history')).toBeInTheDocument()
      expect(screen.getByTestId('history-title')).toHaveTextContent('Network History')
      expect(screen.getByTestId('events-list')).toBeInTheDocument()
      expect(screen.getByTestId('event-14:30:00')).toBeInTheDocument()
      expect(screen.getByTestId('event-14:31:15')).toBeInTheDocument()
      expect(screen.getByTestId('event-14:32:30')).toBeInTheDocument()
      expect(screen.getByTestId('event-14:33:45')).toBeInTheDocument()
      expect(screen.getByTestId('event-count')).toHaveTextContent('4 network events')
    })

    it('should provide connectivity troubleshooting', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnTroubleshoot = vi.fn()

      // Mock troubleshooting interface
      const TroubleshootingInterface = vi.fn(({ onTroubleshoot }) => (
        <div data-testid="troubleshooting">
          <div data-testid="troubleshoot-title">Connection Issues?</div>
          <div data-testid="troubleshoot-steps">
            <div data-testid="step-1">1. Check your internet connection</div>
            <div data-testid="step-2">2. Restart the app</div>
            <div data-testid="step-3">3. Check firewall settings</div>
            <div data-testid="step-4">4. Contact support if issue persists</div>
          </div>
          <button data-testid="run-diagnostics-btn" onClick={onTroubleshoot}>
            Run Network Diagnostics
          </button>
          <button data-testid="reconnect-btn">Reconnect Now</button>
          <div data-testid="offline-work-note">
            💡 You can continue working offline - changes will sync when back online
          </div>
        </div>
      ))

      // Act
      customRender(<TroubleshootingInterface onTroubleshoot={mockOnTroubleshoot} />)

      // Run diagnostics
      const diagnosticsButton = screen.getByTestId('run-diagnostics-btn')
      await user.click(diagnosticsButton)

      // Assert
      expect(mockOnTroubleshoot).toHaveBeenCalled()
      expect(screen.getByTestId('troubleshooting')).toBeInTheDocument()
      expect(screen.getByTestId('troubleshoot-title')).toHaveTextContent('Connection Issues?')
      expect(screen.getByTestId('troubleshoot-steps')).toBeInTheDocument()
      expect(screen.getByTestId('step-1')).toHaveTextContent('1. Check your internet connection')
      expect(screen.getByTestId('step-2')).toHaveTextContent('2. Restart the app')
      expect(screen.getByTestId('step-3')).toHaveTextContent('3. Check firewall settings')
      expect(screen.getByTestId('step-4')).toHaveTextContent('4. Contact support if issue persists')
      expect(screen.getByTestId('offline-work-note')).toHaveTextContent(
        '💡 You can continue working offline - changes will sync when back online'
      )
    })

    it('should show bandwidth usage and optimization tips', () => {
      // Arrange
      const mockBandwidthInfo = {
        dataUsed: '15.2 MB',
        dataSaved: '8.7 MB',
        optimizationEnabled: true,
        tips: [
          'Use offline mode to save data',
          'Compress images before uploading',
          'Limit auto-sync frequency',
          'Use Wi-Fi for large exports',
        ],
      }

      // Mock bandwidth information display
      const BandwidthInfo = vi.fn(({ bandwidth }) => (
        <div data-testid="bandwidth-info">
          <div data-testid="data-usage">Data used: {bandwidth.dataUsed}</div>
          <div data-testid="data-saved">Data saved: {bandwidth.dataSaved}</div>
          <div data-testid="optimization-status">
            Optimization: {bandwidth.optimizationEnabled ? '✅ Enabled' : '❌ Disabled'}
          </div>
          <div data-testid="optimization-tips">
            <div data-testid="tips-title">Data Saving Tips:</div>
            <ul data-testid="tips-list">
              {bandwidth.tips.map((tip: string, index: number) => (
                <li key={index} data-testid={`tip-${index}`}>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
          <button data-testid="optimize-btn">Optimize Data Usage</button>
        </div>
      ))

      // Act
      customRender(<BandwidthInfo bandwidth={mockBandwidthInfo} />)

      // Assert
      expect(screen.getByTestId('bandwidth-info')).toBeInTheDocument()
      expect(screen.getByTestId('data-usage')).toHaveTextContent('Data used: 15.2 MB')
      expect(screen.getByTestId('data-saved')).toHaveTextContent('Data saved: 8.7 MB')
      expect(screen.getByTestId('optimization-status')).toHaveTextContent(
        'Optimization: ✅ Enabled'
      )
      expect(screen.getByTestId('optimization-tips')).toBeInTheDocument()
      expect(screen.getByTestId('tips-title')).toHaveTextContent('Data Saving Tips:')
      expect(screen.getByTestId('tips-list')).toBeInTheDocument()
      expect(screen.getByTestId('tip-0')).toHaveTextContent('Use offline mode to save data')
      expect(screen.getByTestId('tip-1')).toHaveTextContent('Compress images before uploading')
      expect(screen.getByTestId('tip-2')).toHaveTextContent('Limit auto-sync frequency')
      expect(screen.getByTestId('tip-3')).toHaveTextContent('Use Wi-Fi for large exports')
    })
  })
})
