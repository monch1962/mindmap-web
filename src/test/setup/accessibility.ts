/**
 * Accessibility testing configuration and utilities
 *
 * This module provides utilities for testing accessibility compliance
 * according to WCAG 2.1 AA standards.
 */

/**
 * Accessibility test configuration
 */
export const accessibilityConfig = {
  // WCAG 2.1 AA compliance checklist
  checklist: {
    // Perceivable
    colorContrast: true,
    imageAltText: true,
    videoCaptions: true,
    audioTranscripts: true,

    // Operable
    keyboardNavigation: true,
    focusIndicators: true,
    skipLinks: true,
    timingAdjustable: true,
    noKeyboardTraps: true,

    // Understandable
    readableContent: true,
    predictableNavigation: true,
    inputAssistance: true,
    errorIdentification: true,

    // Robust
    compatibleWithAssistiveTech: true,
    validHTML: true,
    properARIA: true,
  },
}

/**
 * Setup accessibility testing
 */
export const setupAccessibilityTesting = () => {
  // Setup will be enhanced when vitest-axe is installed
  console.log('Accessibility testing setup complete')
}

/**
 * Test a component for basic accessibility compliance
 *
 * @param container - The container element to test
 * @returns Basic accessibility check results
 */
export const testAccessibility = (container: HTMLElement) => {
  const results = {
    // Basic checks that can be done without axe-core
    hasTitle: !!container.querySelector('title') || !!document.title,
    hasLangAttribute: !!document.documentElement.getAttribute('lang'),
    hasMainLandmark: !!container.querySelector('main, [role="main"]'),
    hasNavigationLandmark: !!container.querySelector('nav, [role="navigation"]'),
    imagesWithAlt: Array.from(container.querySelectorAll('img')).filter(
      img => img.hasAttribute('alt') && img.getAttribute('alt') !== ''
    ).length,
    totalImages: container.querySelectorAll('img').length,
    buttonsWithText: Array.from(container.querySelectorAll('button')).filter(
      button => button.textContent?.trim() || button.getAttribute('aria-label')
    ).length,
    totalButtons: container.querySelectorAll('button').length,
    linksWithText: Array.from(container.querySelectorAll('a')).filter(
      link => link.textContent?.trim() || link.getAttribute('aria-label')
    ).length,
    totalLinks: container.querySelectorAll('a').length,
    formInputsWithLabels: Array.from(container.querySelectorAll('input, select, textarea')).filter(
      input => {
        const id = input.getAttribute('id')
        return id && container.querySelector(`label[for="${id}"]`)
      }
    ).length,
    totalFormInputs: container.querySelectorAll('input, select, textarea').length,
  }

  return results
}

/**
 * Common accessibility test patterns
 */
export const accessibilityPatterns = {
  /**
   * Test keyboard navigation
   */
  testKeyboardNavigation: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    return {
      focusableCount: focusableElements.length,
      elements: Array.from(focusableElements),
    }
  },

  /**
   * Test screen reader announcements
   */
  testScreenReaderAnnouncements: (container: HTMLElement) => {
    const liveRegions = container.querySelectorAll('[aria-live], [aria-atomic], [aria-relevant]')

    return {
      liveRegionCount: liveRegions.length,
      regions: Array.from(liveRegions),
    }
  },
}

/**
 * Accessibility test helpers for common UI patterns
 */
export const accessibilityHelpers = {
  /**
   * Test form accessibility
   */
  testFormAccessibility: (form: HTMLFormElement) => {
    const inputs = form.querySelectorAll('input, select, textarea')
    const errors = form.querySelectorAll('[role="alert"], .error, .invalid')

    return {
      inputCount: inputs.length,
      labeledInputs: Array.from(inputs).filter(input => {
        const id = input.getAttribute('id')
        return id && form.querySelector(`label[for="${id}"]`)
      }).length,
      errorCount: errors.length,
      hasSubmitButton: !!form.querySelector('button[type="submit"], input[type="submit"]'),
    }
  },

  /**
   * Test modal/dialog accessibility
   */
  testModalAccessibility: (modal: HTMLElement) => {
    return {
      hasRoleDialog: modal.getAttribute('role') === 'dialog',
      hasAriaLabel: !!modal.getAttribute('aria-label') || !!modal.getAttribute('aria-labelledby'),
      hasAriaDescribedBy: !!modal.getAttribute('aria-describedby'),
      trapFocus: modal.hasAttribute('data-focus-trap') || modal.classList.contains('focus-trap'),
      closeButton: modal.querySelector('button[aria-label*="close"], button[aria-label*="Close"]'),
    }
  },

  /**
   * Test navigation accessibility
   */
  testNavigationAccessibility: (nav: HTMLElement) => {
    const links = nav.querySelectorAll('a')
    const buttons = nav.querySelectorAll('button')

    return {
      linkCount: links.length,
      buttonCount: buttons.length,
      hasNavRole: nav.getAttribute('role') === 'navigation',
      hasAriaLabel: !!nav.getAttribute('aria-label'),
      currentPageLink: nav.querySelector('a[aria-current="page"]'),
    }
  },
}

export default {
  accessibilityConfig,
  setupAccessibilityTesting,
  testAccessibility,
  accessibilityPatterns,
  accessibilityHelpers,
}
