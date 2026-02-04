# Accessibility Checklist for Development

This checklist ensures all new features and components meet WCAG 2.1 AA accessibility standards. Use this checklist during development, code review, and testing phases.

## Quick Reference

### ✅ Must-Have (Level A)

- [ ] **Keyboard navigation**: All interactive elements keyboard-focusable
- [ ] **Focus indicators**: Visible focus for all interactive elements
- [ ] **Semantic HTML**: Proper HTML elements used (buttons, links, headings)
- [ ] **Alternative text**: Images have descriptive alt text
- [ ] **Form labels**: All form inputs have associated labels
- [ ] **Error identification**: Form errors clearly identified and described
- [ ] **Color not sole indicator**: Information not conveyed by color alone
- [ ] **Audio/video alternatives**: Captions and transcripts provided

### ✅ Should-Have (Level AA)

- [ ] **Color contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- [ ] **Text resizing**: Text can be resized up to 200% without loss of content
- [ ] **Consistent navigation**: Navigation consistent across pages
- [ ] **Multiple ways**: Multiple ways to find content (search, navigation, sitemap)
- [ ] **Headings and labels**: Descriptive headings and labels
- [ ] **Focus order**: Logical tab order
- [ ] **Language**: Page language specified
- [ ] **Consistent identification**: Components with same functionality identified consistently

### ✅ Nice-to-Have (Level AAA)

- [ ] **Sign language**: Sign language interpretation for prerecorded audio
- [ ] **Extended audio description**: Extended audio description for video
- [ ] **Low or no background audio**: Background audio can be turned off
- [ ] **Visual presentation**: Text blocks ≤ 80 characters wide
- [ ] **No timing**: No time limits on content
- [ ] **Interruptions**: Interruptions can be postponed or suppressed
- [ ] **Re-authentication**: Re-authentication does not cause data loss
- [ ] **Three flashes**: Content does not flash more than three times per second

## Component Development Checklist

### 1. **Before Implementation**

- [ ] Review existing similar components for accessibility patterns
- [ ] Check if component needs ARIA attributes
- [ ] Determine keyboard interaction patterns
- [ ] Plan focus management for dynamic content

### 2. **During Implementation**

- [ ] Use semantic HTML elements (`<button>`, `<a>`, `<nav>`, etc.)
- [ ] Add appropriate ARIA attributes when needed
- [ ] Implement keyboard navigation
- [ ] Ensure focus management for modals and dialogs
- [ ] Add proper labels and descriptions
- [ ] Test color contrast ratios
- [ ] Verify text alternatives for images/icons

### 3. **After Implementation**

- [ ] Run automated accessibility tests (`npm run test:accessibility`)
- [ ] Test with keyboard only (no mouse)
- [ ] Test with screen reader (NVDA, VoiceOver, or JAWS)
- [ ] Verify color contrast meets WCAG 2.1 AA standards
- [ ] Test with browser zoom (200%)
- [ ] Validate ARIA attributes using browser dev tools

## Specific Component Guidelines

### **Buttons & Interactive Elements**

- [ ] Use `<button>` element for buttons
- [ ] Add `aria-label` if text is insufficient
- [ ] Ensure `:focus` styles are visible
- [ ] Disabled buttons should have `aria-disabled="true"`
- [ ] Loading states should have `aria-busy="true"`

### **Forms & Inputs**

- [ ] Every input has associated `<label>`
- [ ] Use `aria-describedby` for help text
- [ ] Use `aria-invalid` for error states
- [ ] Provide clear error messages
- [ ] Group related inputs with `<fieldset>` and `<legend>`

### **Navigation**

- [ ] Use `<nav>` element for navigation regions
- [ ] Add `aria-current="page"` for current page
- [ ] Implement skip-to-content link
- [ ] Ensure logical tab order
- [ ] Mobile navigation accessible via keyboard

### **Modals & Dialogs**

- [ ] Use `<dialog>` element or `role="dialog"`
- [ ] Trap focus within modal
- [ ] Close with Escape key
- [ ] Return focus to triggering element
- [ ] Add `aria-modal="true"`
- [ ] Add `aria-labelledby` pointing to modal title

### **Tables**

- [ ] Use `<table>` with proper structure
- [ ] Add `<caption>` for table description
- [ ] Use `<th>` with `scope` attribute
- [ ] Complex tables need `aria-describedby`

### **Images & Icons**

- [ ] Decorative images: `alt=""`
- [ ] Informative images: descriptive `alt` text
- [ ] Functional images: `alt` describes function
- [ ] Icons used as buttons need `aria-label`
- [ ] SVG icons should have `role="img"` and `aria-label`

### **Dynamic Content**

- [ ] Use `aria-live` for important updates
- [ ] `aria-live="polite"` for non-critical updates
- [ ] `aria-live="assertive"` for critical updates
- [ ] Update `aria-busy` during loading
- [ ] Announce changes to screen readers

## Color & Contrast Requirements

### **Text Contrast Ratios**

- **Normal text (≤ 18pt)**: 4.5:1 minimum
- **Large text (≥ 18pt or ≥ 14pt bold)**: 3:1 minimum
- **UI components**: 3:1 minimum
- **Graphics**: 3:1 minimum for essential information

### **Color Usage**

- [ ] Color not sole indicator of information
- [ ] Links have non-color indicators (underline)
- [ ] Form errors have text descriptions
- [ ] Status indicators have text labels
- [ ] Test with color blindness simulators

## Keyboard Navigation

### **Standard Navigation**

- **Tab**: Move forward through interactive elements
- **Shift+Tab**: Move backward through interactive elements
- **Enter/Space**: Activate buttons/links
- **Arrow keys**: Navigate within components (menus, lists, etc.)
- **Escape**: Close modals/dialogs
- **Home/End**: Jump to start/end of lists

### **Component-Specific Patterns**

- **Dropdowns**: Arrow keys navigate, Enter selects
- **Radio groups**: Arrow keys navigate between options
- **Tabs**: Arrow keys navigate, Enter/space activates
- **Date pickers**: Arrow keys navigate calendar
- **Autocomplete**: Arrow keys navigate suggestions

## Screen Reader Testing

### **Common Screen Readers**

- **Windows**: NVDA (free), JAWS (commercial)
- **macOS**: VoiceOver (built-in)
- **iOS**: VoiceOver (built-in)
- **Android**: TalkBack (built-in)

### **Testing Checklist**

- [ ] Page title announced correctly
- [ ] Landmarks identified (`<main>`, `<nav>`, etc.)
- [ ] Headings announced in logical order
- [ ] Links and buttons announced with purpose
- [ ] Form labels announced with inputs
- [ ] Images have appropriate alt text
- [ ] Dynamic content announced appropriately
- [ ] No "click here" or vague link text

## Automated Testing Integration

### **Running Accessibility Tests**

```bash
# Run all accessibility tests
npm run test:accessibility

# Run specific accessibility test file
npm run test:run -- src/components/__tests__/accessibility.test.tsx

# Generate accessibility report
node scripts/generate-accessibility-report.js
```

### **Test Coverage Requirements**

- [ ] All components have accessibility tests
- [ ] Color contrast tests for all themes
- [ ] Keyboard navigation tests
- [ ] Screen reader announcement tests
- [ ] Focus management tests for dynamic components

## Code Review Checklist

### **HTML/JSX Review**

- [ ] Semantic elements used appropriately
- [ ] ARIA attributes used correctly
- [ ] No `role` on semantic elements
- [ ] `tabindex` used appropriately (0 for focusable, -1 for programmatic)
- [ ] No `tabindex` values > 0

### **CSS Review**

- [ ] Sufficient color contrast
- [ ] Focus styles visible
- [ ] No `outline: none` without alternative
- [ ] Text can be resized to 200%
- [ ] Responsive design works at all zoom levels

### **JavaScript Review**

- [ ] Keyboard event handlers
- [ ] Focus management for dynamic content
- [ ] ARIA attribute updates
- [ ] No mouse-only interactions
- [ ] Screen reader announcements

## Common Accessibility Issues & Solutions

### **Issue: Missing form labels**

**Solution**: Always use `<label>` with `htmlFor` or wrap input in label

### **Issue: Low color contrast**

**Solution**: Use contrast checking tools, adjust colors to meet 4.5:1 ratio

### **Issue: Keyboard traps**

**Solution**: Implement focus trapping for modals, ensure Escape key works

### **Issue: Missing focus indicators**

**Solution**: Add visible `:focus` styles, never remove outline without alternative

### **Issue: Dynamic content not announced**

**Solution**: Use `aria-live` regions for important updates

### **Issue: Images without alt text**

**Solution**: Add `alt` attributes, use empty string for decorative images

## Tools & Resources

### **Testing Tools**

- **axe DevTools**: Browser extension for accessibility testing
- **WAVE**: Web accessibility evaluation tool
- **Color Contrast Analyzer**: Check color contrast ratios
- **Lighthouse**: Built-in Chrome dev tool for accessibility audits

### **Development Tools**

- **ESLint jsx-a11y**: Accessibility linting rules
- **axe-core**: Automated accessibility testing library
- **react-axe**: React integration for axe-core

### **Color Resources**

- **WebAIM Color Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Color Oracle**: Color blindness simulator
- **Coolors Contrast Checker**: https://coolors.co/contrast-checker

## Compliance Documentation

### **WCAG 2.1 AA Success Criteria**

This checklist covers all Level A and Level AA success criteria from WCAG 2.1:

**Perceivable**

- 1.1.1 Non-text Content
- 1.2.1 Audio-only and Video-only (Prerecorded)
- 1.2.2 Captions (Prerecorded)
- 1.2.3 Audio Description or Media Alternative (Prerecorded)
- 1.3.1 Info and Relationships
- 1.3.2 Meaningful Sequence
- 1.3.3 Sensory Characteristics
- 1.4.1 Use of Color
- 1.4.2 Audio Control
- 1.4.3 Contrast (Minimum)
- 1.4.4 Resize text
- 1.4.5 Images of Text
- 1.4.10 Reflow
- 1.4.11 Non-text Contrast
- 1.4.12 Text Spacing
- 1.4.13 Content on Hover or Focus

**Operable**

- 2.1.1 Keyboard
- 2.1.2 No Keyboard Trap
- 2.1.4 Character Key Shortcuts
- 2.2.1 Timing Adjustable
- 2.2.2 Pause, Stop, Hide
- 2.3.1 Three Flashes or Below Threshold
- 2.4.1 Bypass Blocks
- 2.4.2 Page Titled
- 2.4.3 Focus Order
- 2.4.4 Link Purpose (In Context)
- 2.4.5 Multiple Ways
- 2.4.6 Headings and Labels
- 2.4.7 Focus Visible
- 2.5.1 Pointer Gestures
- 2.5.2 Pointer Cancellation
- 2.5.3 Label in Name
- 2.5.4 Motion Actuation

**Understandable**

- 3.1.1 Language of Page
- 3.1.2 Language of Parts
- 3.2.1 On Focus
- 3.2.2 On Input
- 3.2.3 Consistent Navigation
- 3.2.4 Consistent Identification
- 3.3.1 Error Identification
- 3.3.2 Labels or Instructions
- 3.3.3 Error Suggestion
- 3.3.4 Error Prevention (Legal, Financial, Data)

**Robust**

- 4.1.1 Parsing
- 4.1.2 Name, Role, Value
- 4.1.3 Status Messages

## Version History

- **v1.0.0** (2026-02-04): Initial accessibility checklist created
- Based on WCAG 2.1 AA standards
- Integrated with project's existing accessibility testing infrastructure

---

**Remember**: Accessibility is not a feature to be added later—it's a fundamental requirement that should be integrated into every stage of development.
