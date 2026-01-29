import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SearchPanel from '../SearchPanel'

describe('SearchPanel', () => {
  const mockOnSearch = vi.fn()
  const mockOnNext = vi.fn()
  const mockOnPrevious = vi.fn()

  const defaultProps = {
    onSearch: mockOnSearch,
    onNext: mockOnNext,
    onPrevious: mockOnPrevious,
    resultCount: 0,
    currentResult: 0,
    availableIcons: ['yes', 'no', 'help'],
    availableClouds: ['cloud1', 'cloud2'],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when rendered', () => {
    it('should render the search panel with input and buttons', () => {
      render(<SearchPanel {...defaultProps} />)

      expect(screen.getByRole('search')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Search nodes... (Ctrl+F)')).toBeInTheDocument()
      expect(screen.getByText('Search')).toBeInTheDocument()
      expect(screen.getByText('Options')).toBeInTheDocument()
    })

    it('should have proper ARIA attributes', () => {
      render(<SearchPanel {...defaultProps} />)

      const searchRegion = screen.getByRole('search')
      expect(searchRegion).toHaveAttribute('aria-label', 'Search mind map (0 nodes)')
    })

    it('should show options button with filter count when filters are active', () => {
      const props = {
        ...defaultProps,
        resultCount: 5,
        currentResult: 2,
      }
      render(<SearchPanel {...props} />)

      expect(screen.getByText('Options')).toBeInTheDocument()
    })
  })

  describe('when performing a search', () => {
    it('should call onSearch when form is submitted', () => {
      render(<SearchPanel {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText('Search nodes... (Ctrl+F)')
      fireEvent.change(searchInput, { target: { value: 'test query' } })

      const searchButton = screen.getByText('Search')
      fireEvent.click(searchButton)

      expect(mockOnSearch).toHaveBeenCalledWith('test query', {
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
        searchInNotes: false,
      })
      expect(mockOnSearch).toHaveBeenCalledTimes(1)
    })

    it('should call onSearch when Enter is pressed in input', () => {
      render(<SearchPanel {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText('Search nodes... (Ctrl+F)')
      fireEvent.change(searchInput, { target: { value: 'test query' } })

      // Submit the form by pressing Enter in the input
      fireEvent.submit(searchInput.closest('form')!)

      expect(mockOnSearch).toHaveBeenCalledWith('test query', {
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
        searchInNotes: false,
      })
      expect(mockOnSearch).toHaveBeenCalledTimes(1)
    })

    it('should call onSearch with empty query when search button is clicked', () => {
      render(<SearchPanel {...defaultProps} />)

      const searchButton = screen.getByText('Search')
      fireEvent.click(searchButton)

      expect(mockOnSearch).toHaveBeenCalledWith('', {
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
        searchInNotes: false,
      })
      expect(mockOnSearch).toHaveBeenCalledTimes(1)
    })
  })

  describe('when navigating search results', () => {
    it('should show result navigation when there are results', () => {
      const props = {
        ...defaultProps,
        resultCount: 5,
        currentResult: 2,
      }
      render(<SearchPanel {...props} />)

      expect(screen.getByText('3 / 5')).toBeInTheDocument()
      expect(screen.getByText('↑ Previous')).toBeInTheDocument()
      expect(screen.getByText('↓ Next')).toBeInTheDocument()
    })

    it('should call onPrevious when previous button is clicked', () => {
      const props = {
        ...defaultProps,
        resultCount: 5,
        currentResult: 2,
      }
      render(<SearchPanel {...props} />)

      const previousButton = screen.getByText('↑ Previous')
      fireEvent.click(previousButton)

      expect(mockOnPrevious).toHaveBeenCalledTimes(1)
    })

    it('should call onNext when next button is clicked', () => {
      const props = {
        ...defaultProps,
        resultCount: 5,
        currentResult: 2,
      }
      render(<SearchPanel {...props} />)

      const nextButton = screen.getByText('↓ Next')
      fireEvent.click(nextButton)

      expect(mockOnNext).toHaveBeenCalledTimes(1)
    })

    it('should show no results message when query has no results', () => {
      const props = {
        ...defaultProps,
        resultCount: 0,
      }
      render(<SearchPanel {...props} />)

      const searchInput = screen.getByPlaceholderText('Search nodes... (Ctrl+F)')
      fireEvent.change(searchInput, { target: { value: 'test' } })

      const searchButton = screen.getByText('Search')
      fireEvent.click(searchButton)

      expect(screen.getByText('No results found')).toBeInTheDocument()
    })
  })

  describe('when toggling advanced options', () => {
    it('should show advanced options when options button is clicked', () => {
      render(<SearchPanel {...defaultProps} />)

      const optionsButton = screen.getByText('Options')
      fireEvent.click(optionsButton)

      expect(screen.getByText('TEXT OPTIONS')).toBeInTheDocument()
      expect(screen.getByText('FILTERS')).toBeInTheDocument()
      expect(screen.getByLabelText('Case sensitive search')).toBeInTheDocument()
      expect(screen.getByLabelText('Match whole words only')).toBeInTheDocument()
      expect(screen.getByLabelText('Use regular expressions')).toBeInTheDocument()
      expect(screen.getByLabelText('Include notes in search')).toBeInTheDocument()
    })

    it('should toggle text search options and re-search only when query exists', () => {
      render(<SearchPanel {...defaultProps} />)

      const optionsButton = screen.getByText('Options')
      fireEvent.click(optionsButton)

      const caseSensitiveCheckbox = screen.getByLabelText('Case sensitive search')
      fireEvent.click(caseSensitiveCheckbox)

      // Should NOT call onSearch because query is empty
      expect(mockOnSearch).not.toHaveBeenCalled()

      // Now set a query and toggle again
      const searchInput = screen.getByPlaceholderText('Search nodes... (Ctrl+F)')
      fireEvent.change(searchInput, { target: { value: 'test' } })
      fireEvent.click(caseSensitiveCheckbox) // Toggle back to false

      // Should call onSearch because query exists
      expect(mockOnSearch).toHaveBeenCalledWith('test', {
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
        searchInNotes: false,
      })
    })

    it('should re-search when text option is toggled with existing query', () => {
      render(<SearchPanel {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText('Search nodes... (Ctrl+F)')
      fireEvent.change(searchInput, { target: { value: 'test' } })

      const optionsButton = screen.getByText('Options')
      fireEvent.click(optionsButton)

      const caseSensitiveCheckbox = screen.getByLabelText('Case sensitive search')
      fireEvent.click(caseSensitiveCheckbox)

      expect(mockOnSearch).toHaveBeenCalledWith('test', {
        caseSensitive: true,
        wholeWord: false,
        useRegex: false,
        searchInNotes: false,
      })
    })
  })

  describe('when applying filters', () => {
    it('should show icon filter dropdown', () => {
      render(<SearchPanel {...defaultProps} />)

      const optionsButton = screen.getByText('Options')
      fireEvent.click(optionsButton)

      expect(screen.getByLabelText('Filter by icon')).toBeInTheDocument()
      expect(screen.getByText('Any icon')).toBeInTheDocument()
      expect(screen.getByText('yes')).toBeInTheDocument()
      expect(screen.getByText('no')).toBeInTheDocument()
      expect(screen.getByText('help')).toBeInTheDocument()
    })

    it('should show cloud filter dropdown', () => {
      render(<SearchPanel {...defaultProps} />)

      const optionsButton = screen.getByText('Options')
      fireEvent.click(optionsButton)

      expect(screen.getByLabelText('Filter by cloud')).toBeInTheDocument()
      expect(screen.getByText('Any cloud')).toBeInTheDocument()
      expect(screen.getByText('cloud1')).toBeInTheDocument()
      expect(screen.getByText('cloud2')).toBeInTheDocument()
    })

    it('should show date filter dropdown', () => {
      render(<SearchPanel {...defaultProps} />)

      const optionsButton = screen.getByText('Options')
      fireEvent.click(optionsButton)

      expect(screen.getByLabelText('Filter by date modified')).toBeInTheDocument()
      expect(screen.getByText('Any time')).toBeInTheDocument()
      expect(screen.getByText('Last hour')).toBeInTheDocument()
      expect(screen.getByText('Last 24 hours')).toBeInTheDocument()
      expect(screen.getByText('Last week')).toBeInTheDocument()
      expect(screen.getByText('Last month')).toBeInTheDocument()
    })

    it('should call onSearch when filter is changed', () => {
      render(<SearchPanel {...defaultProps} />)

      const optionsButton = screen.getByText('Options')
      fireEvent.click(optionsButton)

      const iconFilter = screen.getByLabelText('Filter by icon')
      fireEvent.change(iconFilter, { target: { value: 'yes' } })

      expect(mockOnSearch).toHaveBeenCalledWith('', {
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
        searchInNotes: false,
        filterIcon: 'yes',
      })
    })

    it('should show filter count badge when filters are active', () => {
      const props = {
        ...defaultProps,
        resultCount: 5,
        currentResult: 2,
      }
      render(<SearchPanel {...props} />)

      const optionsButton = screen.getByText('Options')
      fireEvent.click(optionsButton)

      const iconFilter = screen.getByLabelText('Filter by icon')
      fireEvent.change(iconFilter, { target: { value: 'yes' } })

      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('Options')).toHaveStyle('background: #3b82f6')
    })
  })

  describe('accessibility', () => {
    it('should update ARIA label with result count', () => {
      const props = {
        ...defaultProps,
        resultCount: 5,
      }
      render(<SearchPanel {...props} />)

      const searchRegion = screen.getByRole('search')
      expect(searchRegion).toHaveAttribute('aria-label', 'Search mind map (5 nodes)')
    })

    it('should announce no results with assertive ARIA live region', () => {
      const props = {
        ...defaultProps,
        resultCount: 0,
      }
      render(<SearchPanel {...props} />)

      const searchInput = screen.getByPlaceholderText('Search nodes... (Ctrl+F)')
      fireEvent.change(searchInput, { target: { value: 'test' } })

      const searchButton = screen.getByText('Search')
      fireEvent.click(searchButton)

      const alert = screen.getByRole('alert')
      expect(alert).toHaveAttribute('aria-live', 'assertive')
      expect(alert).toHaveTextContent('No results found')
    })

    it('should announce result position with polite ARIA live region', () => {
      const props = {
        ...defaultProps,
        resultCount: 5,
        currentResult: 2,
      }
      render(<SearchPanel {...props} />)

      const status = screen.getByRole('status')
      expect(status).toHaveAttribute('aria-live', 'polite')
      expect(status).toHaveAttribute('aria-atomic', 'true')
    })

    it('should have proper ARIA attributes for toggle button', () => {
      render(<SearchPanel {...defaultProps} />)

      const optionsButton = screen.getByText('Options')
      expect(optionsButton).toHaveAttribute('aria-expanded', 'false')
      expect(optionsButton).toHaveAttribute('aria-label', 'Search options collapsed')

      fireEvent.click(optionsButton)
      expect(optionsButton).toHaveAttribute('aria-expanded', 'true')
      expect(optionsButton).toHaveAttribute('aria-label', 'Search options expanded')
    })
  })

  describe('edge cases', () => {
    it('should handle empty availableIcons and availableClouds', () => {
      const props = {
        ...defaultProps,
        availableIcons: undefined,
        availableClouds: undefined,
      }
      render(<SearchPanel {...props} />)

      const optionsButton = screen.getByText('Options')
      fireEvent.click(optionsButton)

      expect(screen.getByLabelText('Filter by icon')).toBeInTheDocument()
      expect(screen.getByLabelText('Filter by cloud')).toBeInTheDocument()
    })

    it('should maintain filter state when re-searching', () => {
      render(<SearchPanel {...defaultProps} />)

      // Set up a filter
      const optionsButton = screen.getByText('Options')
      fireEvent.click(optionsButton)

      const iconFilter = screen.getByLabelText('Filter by icon')
      fireEvent.change(iconFilter, { target: { value: 'yes' } })

      // Perform a search
      const searchInput = screen.getByPlaceholderText('Search nodes... (Ctrl+F)')
      fireEvent.change(searchInput, { target: { value: 'test' } })
      fireEvent.click(screen.getByText('Search'))

      // Verify filter is still applied
      expect(mockOnSearch).toHaveBeenLastCalledWith('test', {
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
        searchInNotes: false,
        filterIcon: 'yes',
      })
    })
  })
})
