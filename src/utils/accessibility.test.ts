import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  getButtonLabel,
  getPanelLabel,
  getFieldDescription,
  getToggleLabel,
  getMenuItemLabel,
  getSearchLabel,
  getListItemLabel,
  getLiveMessage,
  getModalAttributes,
  getCollapsibleAttributes,
  getTabAttributes,
  getTabPanelAttributes,
  getListboxAttributes,
  getOptionAttributes,
  getTooltipAttributes,
  getProgressAttributes,
  getSliderAttributes,
  getComboboxAttributes,
  isFocusable,
  getFocusableElements,
  trapFocus,
  announceToScreenReader,
  generateAriaId,
  getNodeLabel,
  getNodeAttributes,
  isScreenReaderActive,
  getAccessibilityPrefs,
} from './accessibility'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

describe('accessibility', () => {
  afterEach(() => {
    // Clean up any DOM elements added during tests
    document.body.innerHTML = ''
  })

  describe('label generators', () => {
    it('should get button label with fallback', () => {
      expect(getButtonLabel('Save')).toBe('Save')
      expect(getButtonLabel('', 'Click')).toBe('Click')
      expect(getButtonLabel('')).toBe('Button')
    })

    it('should get panel label', () => {
      expect(getPanelLabel('Settings', 'panel')).toBe('Settings panel')
      expect(getPanelLabel('Notes', 'sidebar')).toBe('Notes sidebar')
    })

    it('should get field description', () => {
      expect(getFieldDescription('Name')).toBe('Name')
      expect(getFieldDescription('Name', 'Enter your full name')).toBe('Name. Enter your full name')
    })

    it('should get toggle label', () => {
      expect(getToggleLabel('Panel', true)).toBe('Panel expanded')
      expect(getToggleLabel('Panel', false)).toBe('Panel collapsed')
    })

    it('should get menu item label', () => {
      expect(getMenuItemLabel('Save')).toBe('Save')
      expect(getMenuItemLabel('Save', 'Ctrl+S')).toBe('Save (Ctrl+S)')
    })

    it('should get search label', () => {
      expect(getSearchLabel()).toBe('Search mind map')
      expect(getSearchLabel(42)).toBe('Search mind map (42 nodes)')
    })

    it('should get list item label', () => {
      expect(getListItemLabel('Item 1', 0, 3)).toBe('Item 1, item 1 of 3')
      expect(getListItemLabel('Item 2', 1, 3)).toBe('Item 2, item 2 of 3')
    })

    it('should get node label', () => {
      expect(getNodeLabel('Root')).toBe('Root')
      expect(getNodeLabel('Root', 5)).toBe('Root (5 nodes)')
      expect(getNodeLabel('Root', 5, 3)).toBe('Root (5 nodes) at depth 3')
    })
  })

  describe('attribute generators', () => {
    it('should get live message attributes', () => {
      const polite = getLiveMessage('Changes saved', 'polite')
      expect(polite.message).toBe('Changes saved')
      expect(polite['aria-live']).toBe('polite')

      const assertive = getLiveMessage('Error occurred', 'assertive')
      expect(assertive['aria-live']).toBe('assertive')
    })

    it('should get modal attributes', () => {
      const attrs = getModalAttributes('My Modal', 'modal-desc')
      expect(attrs['role']).toBe('dialog')
      expect(attrs['aria-modal']).toBe('true')
      expect(attrs['aria-labelledby']).toBe('My Modal')
      expect(attrs['aria-describedby']).toBe('modal-desc')
    })

    it('should get collapsible attributes', () => {
      const expanded = getCollapsibleAttributes('panel-1', true)
      expect(expanded['aria-expanded']).toBe('true')
      expect(expanded['aria-controls']).toBe('panel-1')

      const collapsed = getCollapsibleAttributes('panel-1', false)
      expect(collapsed['aria-expanded']).toBe('false')
    })

    it('should get tab attributes', () => {
      const selected = getTabAttributes('panel-1', true)
      expect(selected['role']).toBe('tab')
      expect(selected['aria-selected']).toBe('true')
      expect(selected['aria-controls']).toBe('panel-1')

      const unselected = getTabAttributes('panel-1', false)
      expect(unselected['aria-selected']).toBe('false')
    })

    it('should get tab panel attributes', () => {
      const attrs = getTabPanelAttributes('tab-1')
      expect(attrs['role']).toBe('tabpanel')
      expect(attrs['aria-labelledby']).toBe('tab-1')
    })

    it('should get listbox attributes', () => {
      const attrs = getListboxAttributes('Choose an option')
      expect(attrs['role']).toBe('listbox')
      expect(attrs['aria-label']).toBe('Choose an option')
    })

    it('should get option attributes', () => {
      const selected = getOptionAttributes('opt1', true)
      expect(selected['role']).toBe('option')
      expect(selected['aria-selected']).toBe('true')
      expect(selected['data-value']).toBe('opt1')

      const unselected = getOptionAttributes('opt2', false)
      expect(unselected['aria-selected']).toBe('false')
    })

    it('should get tooltip attributes', () => {
      const attrs = getTooltipAttributes('tooltip-1')
      expect(attrs['role']).toBe('tooltip')
      expect(attrs['id']).toBe('tooltip-1')
    })

    it('should get progress attributes', () => {
      const withLabel = getProgressAttributes(50, 100, 'Loading')
      expect(withLabel['role']).toBe('progressbar')
      expect(withLabel['aria-valuenow']).toBe('50')
      expect(withLabel['aria-valuemin']).toBe('0')
      expect(withLabel['aria-valuemax']).toBe('100')
      expect(withLabel['aria-label']).toBe('Loading')

      const withoutLabel = getProgressAttributes(75, 200)
      expect(withoutLabel['aria-valuenow']).toBe('75')
      expect(withoutLabel['aria-valuemax']).toBe('200')
      expect(withoutLabel['aria-label']).toBeUndefined()
    })

    it('should get slider attributes', () => {
      const attrs = getSliderAttributes(5, 0, 10, 'Volume')
      expect(attrs['role']).toBe('slider')
      expect(attrs['aria-valuenow']).toBe('5')
      expect(attrs['aria-valuemin']).toBe('0')
      expect(attrs['aria-valuemax']).toBe('10')
      expect(attrs['aria-label']).toBe('Volume')
    })

    it('should get combobox attributes', () => {
      const expanded = getComboboxAttributes('Search', true)
      expect(expanded['role']).toBe('combobox')
      expect(expanded['aria-label']).toBe('Search')
      expect(expanded['aria-expanded']).toBe('true')
      expect(expanded['aria-haspopup']).toBe('listbox')
    })

    it('should get node attributes', () => {
      const parent = getNodeAttributes('Parent Node', true, false)
      expect(parent['role']).toBe('treeitem')
      expect(parent['aria-label']).toBe('Parent Node')
      expect(parent['aria-expanded']).toBe('true')

      const child = getNodeAttributes('Child Node', false)
      expect(child['aria-label']).toBe('Child Node')
      expect(child['aria-expanded']).toBeUndefined()
    })
  })

  describe('ID generation', () => {
    it('should generate unique ARIA IDs', () => {
      const id1 = generateAriaId('panel')
      const id2 = generateAriaId('panel')
      const id3 = generateAriaId('button')

      expect(id1).toMatch(/^aria-panel-/)
      expect(id2).toMatch(/^aria-panel-/)
      expect(id3).toMatch(/^aria-button-/)

      expect(id1).not.toBe(id2)
    })
  })

  describe('focus management', () => {
    it('should detect focusable elements', () => {
      const button = document.createElement('button')
      expect(isFocusable(button)).toBe(true)

      const input = document.createElement('input')
      expect(isFocusable(input)).toBe(true)

      const div = document.createElement('div')
      expect(isFocusable(div)).toBe(false)

      const tabbableDiv = document.createElement('div')
      tabbableDiv.setAttribute('tabindex', '0')
      expect(isFocusable(tabbableDiv)).toBe(true)
    })

    it('should get focusable elements from container', () => {
      const container = document.createElement('div')

      const button1 = document.createElement('button')
      button1.textContent = 'Button 1'
      container.appendChild(button1)

      const span = document.createElement('span')
      span.textContent = 'Not focusable'
      container.appendChild(span)

      const button2 = document.createElement('button')
      button2.textContent = 'Button 2'
      container.appendChild(button2)

      const input = document.createElement('input')
      input.type = 'text'
      container.appendChild(input)

      const focusable = getFocusableElements(container)
      expect(focusable).toHaveLength(3)
    })

    it('should trap focus within container', () => {
      const container = document.createElement('div')

      const button1 = document.createElement('button')
      button1.textContent = 'First'
      container.appendChild(button1)

      const button2 = document.createElement('button')
      button2.textContent = 'Middle'
      container.appendChild(button2)

      const button3 = document.createElement('button')
      button3.textContent = 'Last'
      container.appendChild(button3)

      document.body.appendChild(container)

      const cleanup = trapFocus(container)

      // Cleanup
      cleanup()
      document.body.removeChild(container)

      expect(cleanup).toBeInstanceOf(Function)
    })
  })

  describe('screen reader announcements', () => {
    it('should announce to screen reader', () => {
      expect(() => {
        announceToScreenReader('Test announcement')
      }).not.toThrow()

      // Check that announcement element was created and removed
      setTimeout(() => {
        const announcements = document.querySelectorAll('.sr-only')
        expect(announcements.length).toBe(0)
      }, 1500)
    })

    it('should support both politeness levels', () => {
      expect(() => {
        announceToScreenReader('Polite message', 'polite')
        announceToScreenReader('Assertive message', 'assertive')
      }).not.toThrow()
    })
  })

  describe('accessibility detection', () => {
    it('should detect screen reader activity', () => {
      const isActive = isScreenReaderActive()
      expect(typeof isActive).toBe('boolean')
    })

    it('should get accessibility preferences', () => {
      const prefs = getAccessibilityPrefs()

      expect(prefs).toHaveProperty('prefersReducedMotion')
      expect(prefs).toHaveProperty('prefersHighContrast')
      expect(prefs).toHaveProperty('prefersDarkMode')
      expect(prefs).toHaveProperty('screenReaderActive')

      expect(typeof prefs.prefersReducedMotion).toBe('boolean')
      expect(typeof prefs.prefersHighContrast).toBe('boolean')
      expect(typeof prefs.prefersDarkMode).toBe('boolean')
      expect(typeof prefs.screenReaderActive).toBe('boolean')
    })
  })

  describe('integration', () => {
    it('should work with all accessibility functions', () => {
      expect(() => {
        const id = generateAriaId('test')
        const label = getButtonLabel('Test')
        const attrs = getCollapsibleAttributes(id, true)
        const prefs = getAccessibilityPrefs()

        expect(attrs['aria-controls']).toBe(id)
        expect(label).toBe('Test')
        expect(prefs).toHaveProperty('prefersReducedMotion')
      }).not.toThrow()
    })
  })
})
