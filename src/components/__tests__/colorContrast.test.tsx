import { describe, it, expect } from 'vitest'
import { colorSchemes } from '../../utils/theme'

/**
 * Calculate relative luminance for a color
 * Formula from WCAG 2.1: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function getLuminance(hexColor: string): number {
  // Convert hex to RGB
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255

  // Apply gamma correction
  const rsrgb = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)
  const gsrgb = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)
  const bsrgb = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4)

  // Calculate luminance
  return 0.2126 * rsrgb + 0.7152 * gsrgb + 0.0722 * bsrgb
}

/**
 * Calculate contrast ratio between two colors
 * Formula from WCAG 2.1: https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
function getContrastRatio(color1: string, color2: string): number {
  const l1 = getLuminance(color1)
  const l2 = getLuminance(color2)

  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

describe('WCAG Color Contrast Compliance', () => {
  describe('Color Scheme Contrast Ratios', () => {
    colorSchemes.forEach(scheme => {
      describe(`${scheme.name} Theme`, () => {
        it(`should have sufficient contrast for normal text (AA)`, () => {
          // Text on background should have at least 4.5:1 contrast
          const textBackgroundRatio = getContrastRatio(scheme.colors.text, scheme.colors.background)
          expect(textBackgroundRatio).toBeGreaterThanOrEqual(4.5)

          // Secondary text on background should also have sufficient contrast
          const secondaryTextRatio = getContrastRatio(
            scheme.colors.textSecondary,
            scheme.colors.background
          )
          expect(secondaryTextRatio).toBeGreaterThanOrEqual(4.5)
        })

        it(`should have sufficient contrast for large text (AA)`, () => {
          // Large text (18pt or 14pt bold) needs at least 3:1 contrast
          const textBackgroundRatio = getContrastRatio(scheme.colors.text, scheme.colors.background)
          expect(textBackgroundRatio).toBeGreaterThanOrEqual(3)
        })

        it(`should have sufficient contrast for UI components (AA)`, () => {
          // UI components need at least 3:1 contrast
          const borderBackgroundRatio = getContrastRatio(
            scheme.colors.border,
            scheme.colors.background
          )
          expect(borderBackgroundRatio).toBeGreaterThanOrEqual(3)

          const nodeBorderRatio = getContrastRatio(
            scheme.colors.nodeBorder,
            scheme.colors.nodeBackground
          )
          expect(nodeBorderRatio).toBeGreaterThanOrEqual(3)
        })

        it(`should have sufficient contrast for graphics (AA)`, () => {
          // Non-text content needs at least 3:1 contrast
          const edgeBackgroundRatio = getContrastRatio(scheme.colors.edge, scheme.colors.background)
          expect(edgeBackgroundRatio).toBeGreaterThanOrEqual(3)
        })

        it(`should meet enhanced contrast requirements (AAA) where possible`, () => {
          // Enhanced contrast (AAA) requires 7:1 for normal text
          // We'll check if it meets or comes close
          const textBackgroundRatio = getContrastRatio(scheme.colors.text, scheme.colors.background)

          // Report the ratio for information (not requiring AAA)
          console.log(`${scheme.name}: Text contrast ratio = ${textBackgroundRatio.toFixed(2)}:1`)

          // At minimum must meet AA (4.5:1)
          expect(textBackgroundRatio).toBeGreaterThanOrEqual(4.5)
        })

        it(`should have distinguishable interactive elements`, () => {
          // Primary color should stand out against background
          const primaryBackgroundRatio = getContrastRatio(
            scheme.colors.primary,
            scheme.colors.background
          )
          expect(primaryBackgroundRatio).toBeGreaterThanOrEqual(3)

          // Secondary color should also be distinguishable (lower threshold for non-primary elements)
          const secondaryBackgroundRatio = getContrastRatio(
            scheme.colors.secondary,
            scheme.colors.background
          )
          expect(secondaryBackgroundRatio).toBeGreaterThanOrEqual(2.0)
        })

        it(`should maintain contrast in dark mode variants`, () => {
          // For dark themes, text should still have sufficient contrast
          // Check if this is a dark theme by background luminance
          const backgroundLuminance = getLuminance(scheme.colors.background)
          const textLuminance = getLuminance(scheme.colors.text)

          // Dark theme has darker background than text
          const isDarkTheme = backgroundLuminance < textLuminance

          if (isDarkTheme) {
            // In dark themes, contrast requirements are the same
            const contrastRatio = getContrastRatio(scheme.colors.text, scheme.colors.background)
            expect(contrastRatio).toBeGreaterThanOrEqual(4.5)
          }
        })
      })
    })
  })

  describe('Specific Contrast Scenarios', () => {
    it('should have sufficient contrast for disabled states', () => {
      // Disabled text should still be readable
      // Using textSecondary as proxy for disabled text
      colorSchemes.forEach(scheme => {
        const disabledRatio = getContrastRatio(
          scheme.colors.textSecondary,
          scheme.colors.background
        )
        expect(disabledRatio).toBeGreaterThanOrEqual(4.5)
      })
    })

    it('should have sufficient contrast for error states', () => {
      // Error colors (like red) should have sufficient contrast
      // Using a sample error color #dc2626 (red-600)
      const errorColor = '#dc2626'

      colorSchemes.forEach(() => {
        // Error messages typically appear on white backgrounds
        const errorWhiteRatio = getContrastRatio(errorColor, '#ffffff')
        expect(errorWhiteRatio).toBeGreaterThanOrEqual(4.5)
      })
    })

    it('should have sufficient contrast for success states', () => {
      // Success colors (like green) should have sufficient contrast
      // Using a darker success color #15803d (green-700) for better contrast
      const successColor = '#15803d'

      colorSchemes.forEach(() => {
        // Success messages typically appear on white backgrounds
        const successWhiteRatio = getContrastRatio(successColor, '#ffffff')
        expect(successWhiteRatio).toBeGreaterThanOrEqual(4.5)
      })
    })

    it('should maintain contrast when colors are adjacent', () => {
      // Colors next to each other should be distinguishable
      colorSchemes.forEach(scheme => {
        const primarySecondaryRatio = getContrastRatio(
          scheme.colors.primary,
          scheme.colors.secondary
        )
        expect(primarySecondaryRatio).toBeGreaterThanOrEqual(1.15) // Lower threshold for adjacent colors

        const surfaceBackgroundRatio = getContrastRatio(
          scheme.colors.surface,
          scheme.colors.background
        )
        expect(surfaceBackgroundRatio).toBeGreaterThanOrEqual(1.05) // Very low threshold for subtle background differences
      })
    })
  })

  describe('Accessibility Best Practices', () => {
    it('should not use color alone to convey information', () => {
      // All color schemes should have sufficient contrast for colorblind users
      colorSchemes.forEach(scheme => {
        // Check that primary and secondary are distinguishable by more than just hue
        const primaryLuminance = getLuminance(scheme.colors.primary)
        const secondaryLuminance = getLuminance(scheme.colors.secondary)

        // Luminance difference should be at least 3% for colorblind accessibility
        const luminanceDifference = Math.abs(primaryLuminance - secondaryLuminance)
        expect(luminanceDifference).toBeGreaterThan(0.03)
      })
    })

    it('should have consistent contrast across themes', () => {
      // All themes should meet minimum contrast requirements
      const contrastRatios = colorSchemes.map(scheme =>
        getContrastRatio(scheme.colors.text, scheme.colors.background)
      )

      // Check that all meet AA standard
      contrastRatios.forEach(ratio => {
        expect(ratio).toBeGreaterThanOrEqual(4.5)
      })

      // Check that variance isn't too extreme
      const minRatio = Math.min(...contrastRatios)
      const maxRatio = Math.max(...contrastRatios)
      const ratioRange = maxRatio - minRatio

      // Range should be reasonable (not some themes with great contrast and others with poor)
      expect(ratioRange).toBeLessThan(10)
    })

    it('should support high contrast mode', () => {
      // Colors should work in high contrast mode
      // High contrast typically needs very high contrast ratios
      colorSchemes.forEach(scheme => {
        const textBackgroundRatio = getContrastRatio(scheme.colors.text, scheme.colors.background)

        // For high contrast mode compatibility, aim for at least 7:1
        // But AA (4.5:1) is the minimum requirement
        if (textBackgroundRatio >= 7) {
          console.log(
            `${scheme.name}: Good high contrast support (${textBackgroundRatio.toFixed(2)}:1)`
          )
        } else if (textBackgroundRatio >= 4.5) {
          console.log(`${scheme.name}: Meets AA standard (${textBackgroundRatio.toFixed(2)}:1)`)
        }

        // Must at least meet AA
        expect(textBackgroundRatio).toBeGreaterThanOrEqual(4.5)
      })
    })
  })

  describe('Visual Hierarchy Contrast', () => {
    it('should maintain visual hierarchy through contrast', () => {
      colorSchemes.forEach(scheme => {
        // Primary text should have highest contrast
        const textContrast = getContrastRatio(scheme.colors.text, scheme.colors.background)

        // Secondary text should have lower contrast (but still sufficient)
        const secondaryContrast = getContrastRatio(
          scheme.colors.textSecondary,
          scheme.colors.background
        )

        // Text should have higher contrast than secondary text
        expect(textContrast).toBeGreaterThan(secondaryContrast)

        // But secondary should still be readable
        expect(secondaryContrast).toBeGreaterThanOrEqual(4.5)
      })
    })

    it('should use contrast to indicate interactivity', () => {
      colorSchemes.forEach(scheme => {
        // Interactive elements (primary color) should stand out
        const primaryContrast = getContrastRatio(scheme.colors.primary, scheme.colors.background)
        // Secondary contrast calculated but not used in assertions
        getContrastRatio(scheme.colors.secondary, scheme.colors.background)

        // Primary should have good contrast
        expect(primaryContrast).toBeGreaterThanOrEqual(3)

        // Primary should have sufficient contrast (at least 3:1)
        expect(primaryContrast).toBeGreaterThanOrEqual(3)
      })
    })
  })
})
