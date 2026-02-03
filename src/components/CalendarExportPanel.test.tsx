import { render, screen, fireEvent } from '@testing-library/react'
import CalendarExportPanel from './CalendarExportPanel'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { MindMapTree } from '../types'

// Mock the calendar export utilities
vi.mock('../utils/calendarExport', () => ({
  exportToICS: vi.fn(),
  exportToCSV: vi.fn(),
  openInGoogleCalendar: vi.fn(),
  exportAllToGoogleCalendar: vi.fn(),
  generateTaskSummary: vi.fn(() => ({
    total: 10,
    completed: 6,
    pending: 3,
    overdue: 1,
    upcoming: 2,
  })),
  generateCalendarHeatmap: vi.fn(() => [
    { date: '2024-01-01', count: 2 },
    { date: '2024-01-02', count: 0 },
    { date: '2024-01-03', count: 5 },
    { date: '2024-01-04', count: 1 },
  ]),
}))

// Mock BasePanel
vi.mock('./common/BasePanel', () => ({
  default: ({ children, visible }: { children: React.ReactNode; visible: boolean }) => {
    if (!visible) return null
    return <div data-testid="base-panel">{children}</div>
  },
}))

// Import the mocked module
import * as calendarExport from '../utils/calendarExport'

describe('CalendarExportPanel', () => {
  const mockTree: MindMapTree = {
    id: 'root',
    content: 'Root Node',
    children: [],
    position: { x: 0, y: 0 },
  }

  const defaultProps = {
    visible: true,
    onClose: vi.fn(),
    tree: mockTree,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock implementations
    vi.mocked(calendarExport.generateTaskSummary).mockReturnValue({
      total: 10,
      completed: 6,
      pending: 3,
      overdue: 1,
      upcoming: 2,
    })
    vi.mocked(calendarExport.generateCalendarHeatmap).mockReturnValue([
      { date: '2024-01-01', count: 2 },
      { date: '2024-01-02', count: 0 },
      { date: '2024-01-03', count: 5 },
      { date: '2024-01-04', count: 1 },
    ])
  })

  describe('basic rendering', () => {
    it('renders null when not visible', () => {
      const { container } = render(<CalendarExportPanel {...defaultProps} visible={false} />)
      expect(container.firstChild).toBeNull()
    })

    it('renders panel with title when visible', () => {
      render(<CalendarExportPanel {...defaultProps} />)

      expect(screen.getByTestId('base-panel')).toBeInTheDocument()
      expect(screen.getByText('📅')).toBeInTheDocument()
      expect(screen.getByText('Calendar Export')).toBeInTheDocument()
    })

    it('renders without tree', () => {
      render(<CalendarExportPanel {...defaultProps} tree={null} />)

      expect(screen.getByTestId('base-panel')).toBeInTheDocument()
      expect(screen.getByText('Calendar Export')).toBeInTheDocument()
    })
  })

  describe('task summary section', () => {
    it('renders task summary title', () => {
      render(<CalendarExportPanel {...defaultProps} />)

      expect(screen.getByText('Task Summary')).toBeInTheDocument()
      expect(screen.getByRole('region', { name: /task summary/i })).toBeInTheDocument()
    })

    it('renders task statistics with correct values', () => {
      render(<CalendarExportPanel {...defaultProps} />)

      // Check total tasks
      expect(screen.getByText('10')).toBeInTheDocument()
      expect(screen.getByText('Total Tasks')).toBeInTheDocument()

      // Check completed tasks
      expect(screen.getByText('6')).toBeInTheDocument()
      expect(screen.getByText('Completed')).toBeInTheDocument()

      // Check pending tasks
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('Pending')).toBeInTheDocument()

      // Check overdue tasks
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('Overdue')).toBeInTheDocument()
    })

    it('renders progress bar with correct percentage', () => {
      render(<CalendarExportPanel {...defaultProps} />)

      // 6 completed out of 10 total = 60%
      expect(screen.getByText('60%')).toBeInTheDocument()
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '60')
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemin', '0')
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '100')
    })

    it('handles zero total tasks', () => {
      vi.mocked(calendarExport.generateTaskSummary).mockReturnValueOnce({
        total: 0,
        completed: 0,
        pending: 0,
        overdue: 0,
        upcoming: 0,
      })

      render(<CalendarExportPanel {...defaultProps} />)

      expect(screen.getByText('0%')).toBeInTheDocument()
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
    })
  })

  describe('export options section', () => {
    it('renders export options title', () => {
      render(<CalendarExportPanel {...defaultProps} />)

      expect(screen.getByText('Export Options')).toBeInTheDocument()
      expect(screen.getByRole('group', { name: /export options/i })).toBeInTheDocument()
    })

    it('renders ICS export button', () => {
      render(<CalendarExportPanel {...defaultProps} />)

      const icsButton = screen.getByRole('button', { name: /download ics file/i })
      expect(icsButton).toBeInTheDocument()
      expect(icsButton).toHaveTextContent('📥 Download ICS File (iCalendar)')
    })

    it('renders CSV export button', () => {
      render(<CalendarExportPanel {...defaultProps} />)

      const csvButton = screen.getByRole('button', { name: /export as csv/i })
      expect(csvButton).toBeInTheDocument()
      expect(csvButton).toHaveTextContent('📊 Export as CSV')
    })

    it('renders Google Calendar buttons', () => {
      render(<CalendarExportPanel {...defaultProps} />)

      const firstTaskButton = screen.getByRole('button', {
        name: /open first task in google calendar/i,
      })
      expect(firstTaskButton).toBeInTheDocument()
      expect(firstTaskButton).toHaveTextContent('📆 Open in Google Calendar (First Task)')

      const allTasksButton = screen.getByRole('button', {
        name: /export all tasks to google calendar/i,
      })
      expect(allTasksButton).toBeInTheDocument()
      expect(allTasksButton).toHaveTextContent('📅 Export All to Google Calendar')
    })
  })

  describe('export functionality', () => {
    it('calls exportToICS when ICS button is clicked', () => {
      render(<CalendarExportPanel {...defaultProps} />)

      const icsButton = screen.getByRole('button', { name: /download ics file/i })
      fireEvent.click(icsButton)

      expect(vi.mocked(calendarExport.exportToICS)).toHaveBeenCalledTimes(1)
      expect(vi.mocked(calendarExport.exportToICS)).toHaveBeenCalledWith(
        mockTree,
        'mindmap-tasks.ics'
      )
    })

    it('calls exportToCSV when CSV button is clicked', () => {
      render(<CalendarExportPanel {...defaultProps} />)

      const csvButton = screen.getByRole('button', { name: /export as csv/i })
      fireEvent.click(csvButton)

      expect(vi.mocked(calendarExport.exportToCSV)).toHaveBeenCalledTimes(1)
      expect(vi.mocked(calendarExport.exportToCSV)).toHaveBeenCalledWith(
        mockTree,
        'mindmap-tasks.csv'
      )
    })

    it('calls openInGoogleCalendar when first task button is clicked', () => {
      render(<CalendarExportPanel {...defaultProps} />)

      const googleButton = screen.getByRole('button', {
        name: /open first task in google calendar/i,
      })
      fireEvent.click(googleButton)

      expect(vi.mocked(calendarExport.openInGoogleCalendar)).toHaveBeenCalledTimes(1)
      expect(vi.mocked(calendarExport.openInGoogleCalendar)).toHaveBeenCalledWith(mockTree)
    })

    it('calls exportAllToGoogleCalendar when all tasks button is clicked', () => {
      render(<CalendarExportPanel {...defaultProps} />)

      const allTasksButton = screen.getByRole('button', {
        name: /export all tasks to google calendar/i,
      })
      fireEvent.click(allTasksButton)

      expect(vi.mocked(calendarExport.exportAllToGoogleCalendar)).toHaveBeenCalledTimes(1)
      expect(vi.mocked(calendarExport.exportAllToGoogleCalendar)).toHaveBeenCalledWith(mockTree)
    })

    it('does not call export functions when tree is null', () => {
      render(<CalendarExportPanel {...defaultProps} tree={null} />)

      const icsButton = screen.getByRole('button', { name: /download ics file/i })
      fireEvent.click(icsButton)

      expect(vi.mocked(calendarExport.exportToICS)).not.toHaveBeenCalled()
    })
  })

  describe('activity calendar section', () => {
    it('renders activity calendar when heatmap has data', () => {
      render(<CalendarExportPanel {...defaultProps} />)

      expect(screen.getByText('Activity Calendar')).toBeInTheDocument()
      expect(screen.getByRole('grid')).toBeInTheDocument()
      expect(screen.getByRole('legend')).toBeInTheDocument()
    })

    it('renders heatmap grid cells', () => {
      render(<CalendarExportPanel {...defaultProps} />)

      const gridCells = screen.getAllByRole('gridcell')
      expect(gridCells).toHaveLength(4) // 4 days in mock heatmap

      // Check first cell has correct attributes
      expect(gridCells[0]).toHaveAttribute('title', '2024-01-01: 2 tasks')
      expect(gridCells[0]).toHaveAttribute('aria-label', '2024-01-01: 2 tasks')
    })

    it('does not render activity calendar when heatmap is empty', () => {
      vi.mocked(calendarExport.generateCalendarHeatmap).mockReturnValueOnce([])

      render(<CalendarExportPanel {...defaultProps} />)

      expect(screen.queryByText('Activity Calendar')).not.toBeInTheDocument()
      expect(screen.queryByRole('grid')).not.toBeInTheDocument()
    })

    it('renders activity intensity legend', () => {
      render(<CalendarExportPanel {...defaultProps} />)

      const legend = screen.getByRole('legend', { name: /activity intensity legend/i })
      expect(legend).toBeInTheDocument()
      expect(screen.getByText('Less')).toBeInTheDocument()
      expect(screen.getByText('More')).toBeInTheDocument()
    })
  })

  describe('help text section', () => {
    it('renders help text with tip', () => {
      render(<CalendarExportPanel {...defaultProps} />)

      expect(screen.getByText('Tip:')).toBeInTheDocument()
      expect(screen.getByText(/Add due dates to nodes using metadata/)).toBeInTheDocument()
      expect(screen.getByText(/Tasks are detected from checkbox nodes/)).toBeInTheDocument()
      expect(screen.getByRole('region', { name: /calendar help/i })).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has proper ARIA attributes for task summary', () => {
      render(<CalendarExportPanel {...defaultProps} />)

      const taskSummary = screen.getByRole('region', { name: /task summary/i })
      expect(taskSummary).toBeInTheDocument()

      const taskStats = screen.getByRole('group', { name: /task statistics/i })
      expect(taskStats).toBeInTheDocument()
    })

    it('has proper ARIA attributes for export options', () => {
      render(<CalendarExportPanel {...defaultProps} />)

      const exportOptions = screen.getByRole('group', { name: /export options/i })
      expect(exportOptions).toBeInTheDocument()

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label')
      })
    })

    it('has proper ARIA attributes for activity calendar', () => {
      render(<CalendarExportPanel {...defaultProps} />)

      const activityCalendar = screen.getByRole('region', { name: /activity calendar/i })
      expect(activityCalendar).toBeInTheDocument()

      const grid = screen.getByRole('grid', { name: /activity calendar showing/i })
      expect(grid).toBeInTheDocument()
    })
  })

  describe('interaction', () => {
    it('handles mouse hover on heatmap cells', () => {
      render(<CalendarExportPanel {...defaultProps} />)

      const gridCells = screen.getAllByRole('gridcell')
      const firstCell = gridCells[0]

      // Trigger mouse enter
      fireEvent.mouseEnter(firstCell)
      expect(firstCell.style.transform).toBe('scale(1.2)')

      // Trigger mouse leave
      fireEvent.mouseLeave(firstCell)
      expect(firstCell.style.transform).toBe('scale(1)')
    })
  })
})
