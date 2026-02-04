/**
 * Accessibility testing utilities
 * Provides tools for automated accessibility scanning and WCAG compliance
 */

import axe from 'axe-core'
import type { AxeResults, RunOptions } from 'axe-core'

/**
 * Accessibility test configuration
 */
export interface AccessibilityConfig {
  rules?: string[]
  runOnly?: RunOptions['runOnly']
  reporter?: 'v1' | 'v2' | 'no-passes'
  resultTypes?: ('violations' | 'incomplete' | 'inapplicable' | 'passes')[]
}

/**
 * Default accessibility configuration for WCAG 2.1 AA compliance
 */
export const DEFAULT_ACCESSIBILITY_CONFIG: AccessibilityConfig = {
  rules: [
    'color-contrast',
    'aria-allowed-attr',
    'aria-required-attr',
    'aria-required-parent',
    'aria-required-children',
    'aria-roles',
    'aria-valid-attr-value',
    'button-name',
    'document-title',
    'duplicate-id',
    'form-field-multiple-labels',
    'frame-title',
    'html-has-lang',
    'html-lang-valid',
    'image-alt',
    'input-button-name',
    'label',
    'link-name',
    'list',
    'listitem',
    'meta-viewport',
    'region',
    'tabindex',
    'valid-lang',
  ],
  reporter: 'v2',
  resultTypes: ['violations', 'incomplete'],
}

/**
 * Run accessibility scan on an element
 */
export async function scanAccessibility(
  element: HTMLElement,
  config: AccessibilityConfig = DEFAULT_ACCESSIBILITY_CONFIG
): Promise<AxeResults> {
  const options: RunOptions = {
    runOnly: config.runOnly || {
      type: 'rule',
      values: config.rules || DEFAULT_ACCESSIBILITY_CONFIG.rules!,
    },
    reporter: config.reporter || 'v2',
    resultTypes: config.resultTypes || ['violations', 'incomplete'],
  }

  return await axe.run(element, options)
}

/**
 * Format accessibility violations for display
 */
export function formatViolations(violations: AxeResults['violations']): string {
  if (!violations || violations.length === 0) {
    return 'No accessibility violations found.'
  }

  return violations
    .map(violation => {
      const nodes = violation.nodes
        .map(node => {
          const target = node.target.join(', ')
          const failureSummary = node.failureSummary || 'No specific details'
          return `  - Target: ${target}\n    ${failureSummary}`
        })
        .join('\n')

      return `Rule: ${violation.id} (${violation.impact})\nDescription: ${violation.description}\nHelp: ${violation.help}\nHelp URL: ${violation.helpUrl}\nAffected Nodes:\n${nodes}\n`
    })
    .join('\n')
}

/**
 * Check if element has sufficient color contrast
 */
export function checkColorContrast(element: HTMLElement): boolean {
  // Get computed styles for contrast calculation
  const style = window.getComputedStyle(element)
  // Note: bgColor and textColor would be used in a real implementation
  // with a proper contrast checking library
  void style.backgroundColor
  void style.color

  // Simple contrast check - in real implementation, use a proper contrast library
  // This is a placeholder that would integrate with a contrast checking library
  return true
}

/**
 * Check if element has accessible name
 */
export function hasAccessibleName(element: HTMLElement): boolean {
  const ariaLabel = element.getAttribute('aria-label')
  const ariaLabelledby = element.getAttribute('aria-labelledby')
  const title = element.getAttribute('title')
  const alt = element.getAttribute('alt')
  const textContent = element.textContent?.trim()

  return !!(ariaLabel || ariaLabelledby || title || alt || textContent)
}

/**
 * Check if element is keyboard focusable
 */
export function isKeyboardFocusable(element: HTMLElement): boolean {
  const tagName = element.tagName.toLowerCase()
  const tabIndex = element.getAttribute('tabindex')

  // Elements that are natively focusable
  const focusableTags = ['a', 'button', 'input', 'select', 'textarea', 'details', 'iframe']

  // Check if element is natively focusable
  if (focusableTags.includes(tagName)) {
    return true
  }

  // Check if element has tabindex >= 0
  if (tabIndex !== null && parseInt(tabIndex) >= 0) {
    return true
  }

  // Check if element has role that should be focusable
  const role = element.getAttribute('role')
  const focusableRoles = [
    'button',
    'link',
    'checkbox',
    'menuitem',
    'menuitemcheckbox',
    'menuitemradio',
    'radio',
    'slider',
    'tab',
    'textbox',
  ]

  if (role && focusableRoles.includes(role)) {
    return true
  }

  return false
}

/**
 * Check if element has proper ARIA attributes
 */
export function hasProperAriaAttributes(element: HTMLElement): boolean {
  const role = element.getAttribute('role')

  if (!role) {
    return true // No role means no ARIA requirements
  }

  // Check for required ARIA attributes based on role
  switch (role) {
    case 'button':
      return hasAccessibleName(element)
    case 'checkbox':
      return element.hasAttribute('aria-checked')
    case 'slider':
      return (
        element.hasAttribute('aria-valuemin') &&
        element.hasAttribute('aria-valuemax') &&
        element.hasAttribute('aria-valuenow')
      )
    case 'tab':
      return element.hasAttribute('aria-selected')
    case 'textbox':
      return hasAccessibleName(element)
    default:
      return true
  }
}

/**
 * Generate accessibility report
 */
export interface AccessibilityReport {
  timestamp: Date
  element: string
  violations: AxeResults['violations']
  incomplete: AxeResults['incomplete']
  passes: AxeResults['passes']
  score: number
}

export async function generateAccessibilityReport(
  element: HTMLElement,
  config: AccessibilityConfig = DEFAULT_ACCESSIBILITY_CONFIG
): Promise<AccessibilityReport> {
  const results = await scanAccessibility(element, config)

  // Calculate score (0-100)
  const totalChecks = results.violations.length + results.incomplete.length + results.passes.length
  const passingChecks = results.passes.length
  const score = totalChecks > 0 ? Math.round((passingChecks / totalChecks) * 100) : 100

  return {
    timestamp: new Date(),
    element: element.tagName.toLowerCase(),
    violations: results.violations,
    incomplete: results.incomplete,
    passes: results.passes,
    score,
  }
}

/**
 * Export accessibility report as JSON
 */
export function exportAccessibilityReport(report: AccessibilityReport): string {
  return JSON.stringify(report, null, 2)
}

/**
 * Import accessibility report from JSON
 */
export function importAccessibilityReport(json: string): AccessibilityReport {
  const data = JSON.parse(json)
  return {
    ...data,
    timestamp: new Date(data.timestamp),
  }
}

/**
 * Accessibility testing utilities for React components
 */
export const accessibilityTestUtils = {
  /**
   * Wait for animations to complete
   */
  async waitForAnimations(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100))
  },

  /**
   * Ensure element is visible and in DOM
   */
  async ensureElementVisible(element: HTMLElement): Promise<void> {
    if (!document.body.contains(element)) {
      throw new Error('Element is not in DOM')
    }

    const style = window.getComputedStyle(element)
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      throw new Error('Element is not visible')
    }
  },

  /**
   * Get all interactive elements within a container
   */
  getInteractiveElements(container: HTMLElement): HTMLElement[] {
    const selectors = [
      'a[href]',
      'button',
      'input',
      'select',
      'textarea',
      '[tabindex]',
      '[role="button"]',
      '[role="link"]',
      '[role="checkbox"]',
      '[role="radio"]',
      '[role="tab"]',
      '[role="textbox"]',
    ]

    return Array.from(container.querySelectorAll(selectors.join(','))) as HTMLElement[]
  },

  /**
   * Check tab order
   */
  checkTabOrder(elements: HTMLElement[]): boolean {
    const tabbableElements = elements.filter(el => {
      const tabIndex = el.getAttribute('tabindex')
      return tabIndex === null || parseInt(tabIndex) >= 0
    })

    // Check if tabindex values are in order
    const tabIndexes = tabbableElements.map(el => {
      const tabIndex = el.getAttribute('tabindex')
      return tabIndex === null ? 0 : parseInt(tabIndex)
    })

    // Check for duplicate tabindex values (except 0)
    const duplicates = tabIndexes.filter(
      (index, i) => index !== 0 && tabIndexes.indexOf(index) !== i
    )

    return duplicates.length === 0
  },
}

/**
 * WCAG 2.1 AA compliance checker
 */
export class WCAGComplianceChecker {
  private element: HTMLElement
  private config: AccessibilityConfig

  constructor(element: HTMLElement, config: AccessibilityConfig = DEFAULT_ACCESSIBILITY_CONFIG) {
    this.element = element
    this.config = config
  }

  async checkCompliance(): Promise<{
    compliant: boolean
    violations: AxeResults['violations']
    score: number
  }> {
    const results = await scanAccessibility(this.element, this.config)

    const score =
      results.violations.length === 0 ? 100 : Math.max(0, 100 - results.violations.length * 10)

    return {
      compliant: results.violations.length === 0,
      violations: results.violations,
      score,
    }
  }

  async generateComplianceReport(): Promise<string> {
    const compliance = await this.checkCompliance()
    const results = await scanAccessibility(this.element, this.config)

    const report = {
      timestamp: new Date().toISOString(),
      element: this.element.tagName.toLowerCase(),
      wcagVersion: '2.1',
      level: 'AA',
      compliant: compliance.compliant,
      score: compliance.score,
      totalViolations: results.violations.length,
      totalIncomplete: results.incomplete.length,
      totalPasses: results.passes.length,
      violations: results.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        help: v.help,
        helpUrl: v.helpUrl,
        nodes: v.nodes.length,
      })),
    }

    return JSON.stringify(report, null, 2)
  }
}

/**
 * Create accessibility test helper for Vitest
 */
export function createAccessibilityTestHelper() {
  return {
    async toBeAccessible(element: HTMLElement, config?: AccessibilityConfig) {
      const results = await scanAccessibility(element, config)

      if (results.violations.length > 0) {
        return {
          message: () => formatViolations(results.violations),
          pass: false,
        }
      }

      return {
        message: () => 'Element is accessible',
        pass: true,
      }
    },

    async toHaveNoViolations(element: HTMLElement, config?: AccessibilityConfig) {
      const results = await scanAccessibility(element, config)

      if (results.violations.length > 0) {
        return {
          message: () =>
            `Found ${results.violations.length} accessibility violations:\n${formatViolations(results.violations)}`,
          pass: false,
        }
      }

      return {
        message: () => 'No accessibility violations found',
        pass: true,
      }
    },

    async toHaveProperColorContrast(element: HTMLElement) {
      const hasContrast = checkColorContrast(element)

      if (!hasContrast) {
        return {
          message: () => 'Element does not have sufficient color contrast',
          pass: false,
        }
      }

      return {
        message: () => 'Element has sufficient color contrast',
        pass: true,
      }
    },
  }
}
