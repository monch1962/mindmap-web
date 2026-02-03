import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TemplatesPanel from './TemplatesPanel'
import type { Template } from '../utils/mindmapTemplates'

// Mock the templates module
vi.mock('../utils/mindmapTemplates', () => ({
  templates: [
    {
      id: 'swot-analysis',
      name: 'SWOT Analysis',
      description: 'Analyze Strengths, Weaknesses, Opportunities, and Threats',
      category: 'business',
      icon: '🎯',
      tree: vi.fn(() => ({
        id: 'tpl-1',
        content: 'SWOT Analysis',
        children: [
          {
            id: 'tpl-2',
            content: '💪 Strengths',
            children: [
              { id: 'tpl-3', content: 'Internal Strength 1', children: [] },
              { id: 'tpl-4', content: 'Internal Strength 2', children: [] },
            ],
          },
        ],
      })),
    },
    {
      id: 'project-planning',
      name: 'Project Planning',
      description: 'Plan your project with phases, milestones, and tasks',
      category: 'project-management',
      icon: '📋',
      tree: vi.fn(() => ({
        id: 'tpl-5',
        content: 'Project Name',
        children: [
          {
            id: 'tpl-6',
            content: '🎯 Objectives',
            children: [{ id: 'tpl-7', content: 'Define SMART goals', children: [] }],
          },
        ],
      })),
    },
    {
      id: 'brainstorming',
      name: 'Brainstorming Session',
      description: 'Capture and organize creative ideas',
      category: 'brainstorming',
      icon: '💡',
      tree: vi.fn(() => ({
        id: 'tpl-8',
        content: 'Brainstorming Topic',
        children: [
          {
            id: 'tpl-9',
            content: '💡 Ideas',
            children: [{ id: 'tpl-10', content: 'Idea 1', children: [] }],
          },
        ],
      })),
    },
    {
      id: 'weekly-planner',
      name: 'Weekly Planner',
      description: 'Organize your week with goals and daily tasks',
      category: 'personal',
      icon: '📅',
      tree: vi.fn(() => ({
        id: 'tpl-11',
        content: 'Week of [Date]',
        children: [
          {
            id: 'tpl-12',
            content: '📋 Monday',
            children: [{ id: 'tpl-13', content: 'Priority Task 1', children: [] }],
          },
        ],
      })),
    },
  ],
  getTemplatesByCategory: vi.fn((category: string) => {
    const templates = [
      {
        id: 'swot-analysis',
        name: 'SWOT Analysis',
        description: 'Analyze Strengths, Weaknesses, Opportunities, and Threats',
        category: 'business',
        icon: '🎯',
        tree: vi.fn(() => ({ id: 'tpl-1', content: 'SWOT Analysis', children: [] })),
      },
      {
        id: 'project-planning',
        name: 'Project Planning',
        description: 'Plan your project with phases, milestones, and tasks',
        category: 'project-management',
        icon: '📋',
        tree: vi.fn(() => ({ id: 'tpl-5', content: 'Project Name', children: [] })),
      },
      {
        id: 'brainstorming',
        name: 'Brainstorming Session',
        description: 'Capture and organize creative ideas',
        category: 'brainstorming',
        icon: '💡',
        tree: vi.fn(() => ({ id: 'tpl-8', content: 'Brainstorming Topic', children: [] })),
      },
      {
        id: 'weekly-planner',
        name: 'Weekly Planner',
        description: 'Organize your week with goals and daily tasks',
        category: 'personal',
        icon: '📅',
        tree: vi.fn(() => ({ id: 'tpl-11', content: 'Week of [Date]', children: [] })),
      },
    ]
    return category === 'all' ? templates : templates.filter(t => t.category === category)
  }),
}))

// Import the mocked module
import * as templatesModule from '../utils/mindmapTemplates'

describe('TemplatesPanel', () => {
  const mockOnClose = vi.fn()
  const mockOnApplyTemplate = vi.fn()

  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    onApplyTemplate: mockOnApplyTemplate,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock implementations
    vi.mocked(templatesModule.getTemplatesByCategory).mockImplementation(
      (category: Template['category'] | 'all') => {
        const templates: Template[] = [
          {
            id: 'swot-analysis',
            name: 'SWOT Analysis',
            description: 'Analyze Strengths, Weaknesses, Opportunities, and Threats',
            category: 'business',
            icon: '🎯',
            tree: vi.fn(() => ({ id: 'tpl-1', content: 'SWOT Analysis', children: [] })),
          },
          {
            id: 'project-planning',
            name: 'Project Planning',
            description: 'Plan your project with phases, milestones, and tasks',
            category: 'project-management',
            icon: '📋',
            tree: vi.fn(() => ({ id: 'tpl-5', content: 'Project Name', children: [] })),
          },
          {
            id: 'brainstorming',
            name: 'Brainstorming Session',
            description: 'Capture and organize creative ideas',
            category: 'brainstorming',
            icon: '💡',
            tree: vi.fn(() => ({ id: 'tpl-8', content: 'Brainstorming Topic', children: [] })),
          },
          {
            id: 'weekly-planner',
            name: 'Weekly Planner',
            description: 'Organize your week with goals and daily tasks',
            category: 'personal',
            icon: '📅',
            tree: vi.fn(() => ({ id: 'tpl-11', content: 'Week of [Date]', children: [] })),
          },
        ] as Template[]
        return category === 'all' ? templates : templates.filter(t => t.category === category)
      }
    )
  })

  describe('basic rendering', () => {
    it('renders null when not visible', () => {
      const { container } = render(<TemplatesPanel {...defaultProps} visible={false} />)
      expect(container.firstChild).toBeNull()
    })

    it('renders dialog with title when visible', () => {
      render(<TemplatesPanel {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'templates-panel-title')
      expect(screen.getByText('Mind Map Templates')).toBeInTheDocument()
      expect(
        screen.getByText('Start with a pre-built template for faster mind mapping')
      ).toBeInTheDocument()
    })

    it('renders close button with proper ARIA label', () => {
      render(<TemplatesPanel {...defaultProps} />)

      const closeButton = screen.getByRole('button', { name: /close templates panel/i })
      expect(closeButton).toBeInTheDocument()
      expect(closeButton).toHaveTextContent('×')
    })
  })

  describe('search and filter functionality', () => {
    it('renders search input with proper ARIA labels', () => {
      render(<TemplatesPanel {...defaultProps} />)

      const searchInput = screen.getByRole('textbox', {
        name: /search templates by name or description/i,
      })
      expect(searchInput).toBeInTheDocument()
      expect(searchInput).toHaveAttribute('placeholder', '🔍 Search templates...')
      expect(searchInput).toHaveAttribute('aria-label', 'Search templates by name or description')
    })

    it('renders category filter buttons with proper ARIA labels', () => {
      render(<TemplatesPanel {...defaultProps} />)

      const categoryGroup = screen.getByRole('group', { name: /filter templates by category/i })
      expect(categoryGroup).toBeInTheDocument()

      // Check all category buttons
      expect(screen.getByRole('button', { name: /📚 all templates/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /💼 business/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /🎓 education/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /👤 personal/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /📋 project management/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /💡 brainstorming/i })).toBeInTheDocument()
    })

    it('filters templates when category is selected', async () => {
      render(<TemplatesPanel {...defaultProps} />)

      // Initially "All Templates" should be selected
      const allButton = screen.getByRole('button', { name: /📚 all templates/i })
      expect(allButton).toHaveAttribute('aria-pressed', 'true')

      // Click business category
      const businessButton = screen.getByRole('button', { name: /💼 business/i })
      fireEvent.click(businessButton)

      // Business button should now be pressed
      expect(businessButton).toHaveAttribute('aria-pressed', 'true')
      expect(allButton).toHaveAttribute('aria-pressed', 'false')

      // Verify getTemplatesByCategory was called
      expect(templatesModule.getTemplatesByCategory).toHaveBeenCalledWith('business')
    })

    it('filters templates when search query is entered', async () => {
      render(<TemplatesPanel {...defaultProps} />)

      const searchInput = screen.getByRole('textbox', {
        name: /search templates by name or description/i,
      })

      // Type "SWOT" in search
      await userEvent.type(searchInput, 'SWOT')

      // Should show only SWOT template
      expect(screen.getByText('SWOT Analysis')).toBeInTheDocument()
      expect(screen.queryByText('Project Planning')).not.toBeInTheDocument()
    })

    it('shows no results message when no templates match search', async () => {
      render(<TemplatesPanel {...defaultProps} />)

      const searchInput = screen.getByRole('textbox', {
        name: /search templates by name or description/i,
      })

      // Type something that doesn't match any template
      await userEvent.type(searchInput, 'nonexistent template')

      // Should show no results message
      const statusElements = screen.getAllByRole('status')
      expect(statusElements).toHaveLength(2) // One for no results, one for footer stats

      // Find the no results status by its content
      const noResultsStatus = statusElements.find(el =>
        el.textContent?.includes('No templates found')
      )
      expect(noResultsStatus).toBeInTheDocument()
      expect(screen.getByText('No templates found')).toBeInTheDocument()
      expect(screen.getByText('Try a different search term or category')).toBeInTheDocument()
    })
  })

  describe('templates grid', () => {
    it('renders templates grid with proper ARIA labels', () => {
      render(<TemplatesPanel {...defaultProps} />)

      const grid = screen.getByRole('grid', { name: /templates available/i })
      expect(grid).toBeInTheDocument()

      // Should have gridcells for each template
      const gridCells = screen.getAllByRole('gridcell')
      expect(gridCells.length).toBeGreaterThan(0)

      // Check first template
      const firstCell = gridCells[0]
      expect(firstCell).toHaveAttribute('aria-label', expect.stringMatching(/SWOT Analysis:.*/))
    })

    it('renders template cards with correct information', () => {
      render(<TemplatesPanel {...defaultProps} />)

      // Check SWOT template
      expect(screen.getByText('SWOT Analysis')).toBeInTheDocument()
      expect(
        screen.getByText('Analyze Strengths, Weaknesses, Opportunities, and Threats')
      ).toBeInTheDocument()
      expect(screen.getByText('Business')).toBeInTheDocument()
      expect(screen.getByText('🎯')).toBeInTheDocument()

      // Check Project Planning template
      expect(screen.getByText('Project Planning')).toBeInTheDocument()
      expect(
        screen.getByText('Plan your project with phases, milestones, and tasks')
      ).toBeInTheDocument()
      expect(screen.getByText('Project Management')).toBeInTheDocument()
      // There are multiple 📋 elements (header and template), check that at least one exists
      const clipboardIcons = screen.getAllByText('📋')
      expect(clipboardIcons.length).toBeGreaterThan(0)
    })

    it('renders template action buttons', () => {
      render(<TemplatesPanel {...defaultProps} />)

      // Check for "Use Template" buttons
      const useButtons = screen.getAllByRole('button', { name: /use .* template/i })
      expect(useButtons.length).toBeGreaterThan(0)

      // Check for "Preview" buttons
      const previewButtons = screen.getAllByRole('button', { name: /preview .* template/i })
      expect(previewButtons.length).toBeGreaterThan(0)
    })
  })

  describe('template interaction', () => {
    it('calls onApplyTemplate when "Use Template" button is clicked', () => {
      render(<TemplatesPanel {...defaultProps} />)

      const useButton = screen.getByRole('button', { name: /use swot analysis template/i })
      fireEvent.click(useButton)

      expect(mockOnApplyTemplate).toHaveBeenCalledTimes(1)
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('opens preview modal when "Preview" button is clicked', () => {
      render(<TemplatesPanel {...defaultProps} />)

      const previewButton = screen.getByRole('button', { name: /preview swot analysis template/i })
      fireEvent.click(previewButton)

      // Preview modal should appear - there will be 2 dialogs (main panel + preview)
      const dialogs = screen.getAllByRole('dialog')
      expect(dialogs).toHaveLength(2)

      // Find preview dialog by checking for template preview content
      // There are multiple "SWOT Analysis" elements, check that at least one exists
      const swotElements = screen.getAllByText('SWOT Analysis')
      expect(swotElements.length).toBeGreaterThan(1) // At least 2 (grid + preview)

      // Check for description in preview modal - there are multiple
      const descriptionElements = screen.getAllByText(
        'Analyze Strengths, Weaknesses, Opportunities, and Threats'
      )
      expect(descriptionElements.length).toBeGreaterThan(1)
    })

    it('closes preview modal when close button is clicked', () => {
      render(<TemplatesPanel {...defaultProps} />)

      // Open preview
      const previewButton = screen.getByRole('button', { name: /preview swot analysis template/i })
      fireEvent.click(previewButton)

      // Close preview
      const closePreviewButton = screen.getByRole('button', { name: /close template preview/i })
      fireEvent.click(closePreviewButton)

      // Preview modal should be gone - only 1 dialog (main panel) should remain
      const dialogs = screen.getAllByRole('dialog')
      expect(dialogs).toHaveLength(1)
    })

    it('applies template from preview modal', () => {
      render(<TemplatesPanel {...defaultProps} />)

      // Open preview
      const previewButton = screen.getByRole('button', { name: /preview swot analysis template/i })
      fireEvent.click(previewButton)

      // Apply from preview - there are 2 buttons with same aria-label
      const applyButtons = screen.getAllByRole('button', { name: /use swot analysis template/i })
      expect(applyButtons).toHaveLength(2)
      // Click the second one (in preview modal)
      fireEvent.click(applyButtons[1])

      expect(mockOnApplyTemplate).toHaveBeenCalledTimes(1)
      expect(mockOnClose).toHaveBeenCalledTimes(1)
      // Preview modal should close
      expect(screen.queryByRole('dialog', { name: /template preview/i })).not.toBeInTheDocument()
    })
  })

  describe('footer statistics', () => {
    it('renders template count statistics', () => {
      render(<TemplatesPanel {...defaultProps} />)

      // There should be at least 1 status element (footer)
      const statusElements = screen.getAllByRole('status')
      expect(statusElements.length).toBeGreaterThan(0)

      // Check that template count text exists in the footer
      // The footer text is: "Showing X of X templates"
      const footerText = screen.getByText(/showing.*of.*templates/i)
      expect(footerText).toBeInTheDocument()

      // Verify it contains numbers
      expect(footerText.textContent).toMatch(/\d+.*of.*\d+.*templates/i)
    })

    it('renders keyboard shortcut hint', () => {
      render(<TemplatesPanel {...defaultProps} />)

      // Text is broken across elements, check for parts
      expect(screen.getByText(/press/i)).toBeInTheDocument()
      expect(screen.getByText('Esc')).toBeInTheDocument()
      expect(screen.getByText(/to close/i)).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has proper ARIA attributes for dialog', () => {
      render(<TemplatesPanel {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'templates-panel-title')
    })

    it('has proper ARIA attributes for search', () => {
      render(<TemplatesPanel {...defaultProps} />)

      const searchRegion = screen.getByRole('search', { name: /search and filter templates/i })
      expect(searchRegion).toBeInTheDocument()

      const searchInput = screen.getByRole('textbox', {
        name: /search templates by name or description/i,
      })
      expect(searchInput).toHaveAttribute('aria-label', 'Search templates by name or description')
    })

    it('has proper ARIA attributes for category filters', () => {
      render(<TemplatesPanel {...defaultProps} />)

      const categoryGroup = screen.getByRole('group', { name: /filter templates by category/i })
      expect(categoryGroup).toBeInTheDocument()

      const categoryButtons = screen.getAllByRole('button', { name: /(📚|💼|🎓|👤|📋|💡)/i })
      categoryButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-pressed')
      })
    })

    it('has proper ARIA attributes for templates grid', () => {
      render(<TemplatesPanel {...defaultProps} />)

      const grid = screen.getByRole('grid', { name: /templates available/i })
      expect(grid).toBeInTheDocument()

      const gridCells = screen.getAllByRole('gridcell')
      gridCells.forEach(cell => {
        expect(cell).toHaveAttribute('aria-label')
      })
    })

    it('has proper ARIA attributes for no results message', () => {
      render(<TemplatesPanel {...defaultProps} />)

      // Search for something that doesn't exist
      const searchInput = screen.getByRole('textbox', {
        name: /search templates by name or description/i,
      })
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

      // There are multiple status elements
      const statusElements = screen.getAllByRole('status')
      expect(statusElements).toHaveLength(2)

      // Find the no results status by checking for aria-live attribute
      const noResultsStatus = statusElements.find(
        el =>
          el.getAttribute('aria-live') === 'polite' &&
          el.textContent?.includes('No templates found')
      )
      expect(noResultsStatus).toBeInTheDocument()
      expect(noResultsStatus).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('keyboard navigation', () => {
    it('calls onClose when Escape key is pressed', () => {
      render(<TemplatesPanel {...defaultProps} />)

      // Press Escape key
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('does not call onClose when other keys are pressed', () => {
      render(<TemplatesPanel {...defaultProps} />)

      // Press Enter key
      fireEvent.keyDown(document, { key: 'Enter', code: 'Enter' })

      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  describe('mouse interactions', () => {
    it('applies hover effects to template cards', () => {
      render(<TemplatesPanel {...defaultProps} />)

      const gridCells = screen.getAllByRole('gridcell')
      const firstCell = gridCells[0]

      // Trigger mouse enter
      fireEvent.mouseEnter(firstCell)
      expect(firstCell.style.transform).toBe('translateY(-4px)')
      expect(firstCell.style.boxShadow).toBe('0 8px 20px rgba(0,0,0,0.15)')

      // Trigger mouse leave
      fireEvent.mouseLeave(firstCell)
      expect(firstCell.style.transform).toBe('translateY(0)')
      expect(firstCell.style.boxShadow).toBe('0 1px 3px rgba(0,0,0,0.1)')
    })

    it('applies hover effects to action buttons', () => {
      render(<TemplatesPanel {...defaultProps} />)

      const useButtons = screen.getAllByRole('button', { name: /use .* template/i })
      const firstUseButton = useButtons[0]

      // Trigger mouse enter
      fireEvent.mouseEnter(firstUseButton)
      expect(firstUseButton.style.background).toBe('rgb(90, 103, 216)') // #5a67d8

      // Trigger mouse leave
      fireEvent.mouseLeave(firstUseButton)
      expect(firstUseButton.style.background).toBe('rgb(102, 126, 234)') // #667eea
    })
  })
})
