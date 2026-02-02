import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CommentsPanel from './CommentsPanel'

// Mock data for testing
const mockComments = [
  {
    id: 'comment-1',
    nodeId: 'node-1',
    author: 'Alice',
    authorColor: '#3b82f6',
    content: 'This is a test comment',
    timestamp: Date.now() - 3600000, // 1 hour ago
    resolved: false,
  },
  {
    id: 'comment-2',
    nodeId: 'node-1',
    author: 'Bob',
    authorColor: '#ef4444',
    content: 'Another comment here',
    timestamp: Date.now() - 1800000, // 30 minutes ago
    resolved: true,
  },
  {
    id: 'comment-3',
    nodeId: 'node-2',
    author: 'Charlie',
    authorColor: '#10b981',
    content: 'Comment on different node',
    timestamp: Date.now() - 900000, // 15 minutes ago
    resolved: false,
  },
]

describe('CommentsPanel', () => {
  const mockOnClose = vi.fn()
  const mockOnAddComment = vi.fn()
  const mockOnResolveComment = vi.fn()
  const mockOnDeleteComment = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when not visible', () => {
    it('should not render anything when visible is false', () => {
      const { container } = render(
        <CommentsPanel
          visible={false}
          onClose={mockOnClose}
          nodeId="node-1"
          nodeLabel="Test Node"
          comments={mockComments}
          onAddComment={mockOnAddComment}
          onResolveComment={mockOnResolveComment}
          onDeleteComment={mockOnDeleteComment}
        />
      )

      expect(container.firstChild).toBeNull()
    })
  })

  describe('when visible', () => {
    it('should render the panel with title when visible is true', () => {
      render(
        <CommentsPanel
          visible={true}
          onClose={mockOnClose}
          nodeId="node-1"
          nodeLabel="Test Node"
          comments={mockComments}
          onAddComment={mockOnAddComment}
          onResolveComment={mockOnResolveComment}
          onDeleteComment={mockOnDeleteComment}
        />
      )

      expect(screen.getByRole('region')).toBeInTheDocument()
      expect(screen.getByText('Comments')).toBeInTheDocument()
      expect(screen.getByLabelText('Close comments panel')).toBeInTheDocument()
    })

    it('should display node information when nodeId is provided', () => {
      render(
        <CommentsPanel
          visible={true}
          onClose={mockOnClose}
          nodeId="node-1"
          nodeLabel="Test Node Label"
          comments={mockComments}
          onAddComment={mockOnAddComment}
          onResolveComment={mockOnResolveComment}
          onDeleteComment={mockOnDeleteComment}
        />
      )

      // The text is split: <strong>Node:</strong> Test Node Label
      expect(
        screen.getByText((content, element) => {
          return element?.textContent === 'Node: Test Node Label'
        })
      ).toBeInTheDocument()
    })

    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <CommentsPanel
          visible={true}
          onClose={mockOnClose}
          nodeId="node-1"
          nodeLabel="Test Node"
          comments={mockComments}
          onAddComment={mockOnAddComment}
          onResolveComment={mockOnResolveComment}
          onDeleteComment={mockOnDeleteComment}
        />
      )

      const closeButton = screen.getByLabelText('Close comments panel')
      await user.click(closeButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should display unresolved count when there are unresolved comments', () => {
      render(
        <CommentsPanel
          visible={true}
          onClose={mockOnClose}
          nodeId="node-1"
          nodeLabel="Test Node"
          comments={mockComments}
          onAddComment={mockOnAddComment}
          onResolveComment={mockOnResolveComment}
          onDeleteComment={mockOnDeleteComment}
        />
      )

      // Only one unresolved comment for node-1 (comment-1)
      expect(screen.getByText('1 unresolved')).toBeInTheDocument()
    })

    it('should not display unresolved count when all comments are resolved', () => {
      const resolvedComments = mockComments.map(comment => ({
        ...comment,
        resolved: true,
      }))

      render(
        <CommentsPanel
          visible={true}
          onClose={mockOnClose}
          nodeId="node-1"
          nodeLabel="Test Node"
          comments={resolvedComments}
          onAddComment={mockOnAddComment}
          onResolveComment={mockOnResolveComment}
          onDeleteComment={mockOnDeleteComment}
        />
      )

      expect(screen.queryByText(/unresolved/)).not.toBeInTheDocument()
    })
  })

  describe('when no node is selected', () => {
    it('should show message to select a node when nodeId is null', () => {
      render(
        <CommentsPanel
          visible={true}
          onClose={mockOnClose}
          nodeId={null}
          nodeLabel=""
          comments={mockComments}
          onAddComment={mockOnAddComment}
          onResolveComment={mockOnResolveComment}
          onDeleteComment={mockOnDeleteComment}
        />
      )

      expect(screen.getByText('Select a node to view comments')).toBeInTheDocument()
      // The list is still rendered but contains the status message
      expect(screen.getByRole('list')).toBeInTheDocument()
      expect(screen.queryByLabelText('Add a new comment')).not.toBeInTheDocument()
    })
  })

  describe('when node has no comments', () => {
    it('should show empty state message when node has no comments', () => {
      render(
        <CommentsPanel
          visible={true}
          onClose={mockOnClose}
          nodeId="node-3"
          nodeLabel="Empty Node"
          comments={mockComments}
          onAddComment={mockOnAddComment}
          onResolveComment={mockOnResolveComment}
          onDeleteComment={mockOnDeleteComment}
        />
      )

      expect(screen.getByText('No comments yet. Be the first to comment!')).toBeInTheDocument()
    })
  })

  describe('when node has comments', () => {
    it('should display comments for the selected node', () => {
      render(
        <CommentsPanel
          visible={true}
          onClose={mockOnClose}
          nodeId="node-1"
          nodeLabel="Test Node"
          comments={mockComments}
          onAddComment={mockOnAddComment}
          onResolveComment={mockOnResolveComment}
          onDeleteComment={mockOnDeleteComment}
        />
      )

      // Should show 2 comments for node-1
      const listItems = screen.getAllByRole('listitem')
      expect(listItems).toHaveLength(2)

      expect(screen.getByText('This is a test comment')).toBeInTheDocument()
      expect(screen.getByText('Another comment here')).toBeInTheDocument()
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('Bob')).toBeInTheDocument()
    })

    it('should show resolved status for resolved comments', () => {
      render(
        <CommentsPanel
          visible={true}
          onClose={mockOnClose}
          nodeId="node-1"
          nodeLabel="Test Node"
          comments={mockComments}
          onAddComment={mockOnAddComment}
          onResolveComment={mockOnResolveComment}
          onDeleteComment={mockOnDeleteComment}
        />
      )

      expect(screen.getByText('✓ Resolved')).toBeInTheDocument()
    })

    it('should call onResolveComment when resolve button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <CommentsPanel
          visible={true}
          onClose={mockOnClose}
          nodeId="node-1"
          nodeLabel="Test Node"
          comments={mockComments}
          onAddComment={mockOnAddComment}
          onResolveComment={mockOnResolveComment}
          onDeleteComment={mockOnDeleteComment}
        />
      )

      const resolveButtons = screen.getAllByText('Resolve')
      expect(resolveButtons).toHaveLength(1) // Only one unresolved comment

      await user.click(resolveButtons[0])
      expect(mockOnResolveComment).toHaveBeenCalledWith('comment-1')
    })

    it('should call onDeleteComment when delete button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <CommentsPanel
          visible={true}
          onClose={mockOnClose}
          nodeId="node-1"
          nodeLabel="Test Node"
          comments={mockComments}
          onAddComment={mockOnAddComment}
          onResolveComment={mockOnResolveComment}
          onDeleteComment={mockOnDeleteComment}
        />
      )

      const deleteButtons = screen.getAllByText('Delete')
      expect(deleteButtons).toHaveLength(2) // Both comments have delete buttons

      await user.click(deleteButtons[0])
      expect(mockOnDeleteComment).toHaveBeenCalledWith('comment-1')
    })

    it('should not show resolve button for already resolved comments', () => {
      render(
        <CommentsPanel
          visible={true}
          onClose={mockOnClose}
          nodeId="node-1"
          nodeLabel="Test Node"
          comments={mockComments}
          onAddComment={mockOnAddComment}
          onResolveComment={mockOnResolveComment}
          onDeleteComment={mockOnDeleteComment}
        />
      )

      const resolveButtons = screen.getAllByText('Resolve')
      expect(resolveButtons).toHaveLength(1) // Only one unresolved comment
    })
  })

  describe('comment form', () => {
    it('should render comment form when nodeId is provided', () => {
      render(
        <CommentsPanel
          visible={true}
          onClose={mockOnClose}
          nodeId="node-1"
          nodeLabel="Test Node"
          comments={mockComments}
          onAddComment={mockOnAddComment}
          onResolveComment={mockOnResolveComment}
          onDeleteComment={mockOnDeleteComment}
        />
      )

      expect(screen.getByLabelText('Add a new comment')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Add a comment...')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /enter comment text to submit/i })
      ).toBeInTheDocument()
    })

    it('should update input value when typing', async () => {
      const user = userEvent.setup()
      render(
        <CommentsPanel
          visible={true}
          onClose={mockOnClose}
          nodeId="node-1"
          nodeLabel="Test Node"
          comments={mockComments}
          onAddComment={mockOnAddComment}
          onResolveComment={mockOnResolveComment}
          onDeleteComment={mockOnDeleteComment}
        />
      )

      const input = screen.getByLabelText('Add a new comment')
      await user.type(input, 'New comment text')

      expect(input).toHaveValue('New comment text')
    })

    it('should call onAddComment with input value when form is submitted', async () => {
      const user = userEvent.setup()
      render(
        <CommentsPanel
          visible={true}
          onClose={mockOnClose}
          nodeId="node-1"
          nodeLabel="Test Node"
          comments={mockComments}
          onAddComment={mockOnAddComment}
          onResolveComment={mockOnResolveComment}
          onDeleteComment={mockOnDeleteComment}
        />
      )

      const input = screen.getByLabelText('Add a new comment')
      const submitButton = screen.getByRole('button', { name: /enter comment text to submit/i })

      await user.type(input, 'New comment text')
      await user.click(submitButton)

      expect(mockOnAddComment).toHaveBeenCalledWith('New comment text')
      expect(input).toHaveValue('') // Should be cleared after submit
    })

    it('should not call onAddComment when submitting empty comment', async () => {
      const user = userEvent.setup()
      render(
        <CommentsPanel
          visible={true}
          onClose={mockOnClose}
          nodeId="node-1"
          nodeLabel="Test Node"
          comments={mockComments}
          onAddComment={mockOnAddComment}
          onResolveComment={mockOnResolveComment}
          onDeleteComment={mockOnDeleteComment}
        />
      )

      const submitButton = screen.getByRole('button', { name: /enter comment text to submit/i })
      await user.click(submitButton)

      expect(mockOnAddComment).not.toHaveBeenCalled()
    })

    it('should disable submit button when input is empty', () => {
      render(
        <CommentsPanel
          visible={true}
          onClose={mockOnClose}
          nodeId="node-1"
          nodeLabel="Test Node"
          comments={mockComments}
          onAddComment={mockOnAddComment}
          onResolveComment={mockOnResolveComment}
          onDeleteComment={mockOnDeleteComment}
        />
      )

      const submitButton = screen.getByRole('button', { name: /enter comment text to submit/i })
      expect(submitButton).toBeDisabled()
      expect(submitButton).toHaveStyle({ opacity: '0.5' })
    })

    it('should enable submit button when input has text', async () => {
      const user = userEvent.setup()
      render(
        <CommentsPanel
          visible={true}
          onClose={mockOnClose}
          nodeId="node-1"
          nodeLabel="Test Node"
          comments={mockComments}
          onAddComment={mockOnAddComment}
          onResolveComment={mockOnResolveComment}
          onDeleteComment={mockOnDeleteComment}
        />
      )

      const input = screen.getByLabelText('Add a new comment')
      const submitButton = screen.getByRole('button', { name: /enter comment text to submit/i })

      expect(submitButton).toBeDisabled()

      await user.type(input, 'Text')
      expect(submitButton).toBeEnabled()
      expect(submitButton).toHaveStyle({ opacity: '1' })
    })

    it('should clear input after successful submission', async () => {
      const user = userEvent.setup()
      render(
        <CommentsPanel
          visible={true}
          onClose={mockOnClose}
          nodeId="node-1"
          nodeLabel="Test Node"
          comments={mockComments}
          onAddComment={mockOnAddComment}
          onResolveComment={mockOnResolveComment}
          onDeleteComment={mockOnDeleteComment}
        />
      )

      const input = screen.getByLabelText('Add a new comment')
      const submitButton = screen.getByRole('button', { name: /enter comment text to submit/i })

      await user.type(input, 'New comment')
      await user.click(submitButton)

      expect(input).toHaveValue('')
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <CommentsPanel
          visible={true}
          onClose={mockOnClose}
          nodeId="node-1"
          nodeLabel="Test Node"
          comments={mockComments}
          onAddComment={mockOnAddComment}
          onResolveComment={mockOnResolveComment}
          onDeleteComment={mockOnDeleteComment}
        />
      )

      expect(screen.getByRole('region')).toHaveAttribute('aria-labelledby', 'comments-panel-title')
      expect(screen.getByRole('list')).toHaveAttribute('aria-label', 'Comments for Test Node')
      expect(screen.getAllByRole('listitem')).toHaveLength(2)
    })

    it('should have proper labels for interactive elements', () => {
      render(
        <CommentsPanel
          visible={true}
          onClose={mockOnClose}
          nodeId="node-1"
          nodeLabel="Test Node"
          comments={mockComments}
          onAddComment={mockOnAddComment}
          onResolveComment={mockOnResolveComment}
          onDeleteComment={mockOnDeleteComment}
        />
      )

      expect(screen.getByLabelText('Close comments panel')).toBeInTheDocument()
      expect(screen.getByLabelText('Add a new comment')).toBeInTheDocument()
      expect(screen.getByLabelText('Resolve comment from Alice')).toBeInTheDocument()
      expect(screen.getByLabelText('Delete comment from Alice')).toBeInTheDocument()
      expect(screen.getByLabelText('Delete comment from Bob')).toBeInTheDocument()
    })
  })

  describe('scrolling behavior', () => {
    it('should scroll to bottom when comments change', async () => {
      const scrollIntoViewMock = vi.fn()
      window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock

      const { rerender } = render(
        <CommentsPanel
          visible={true}
          onClose={mockOnClose}
          nodeId="node-1"
          nodeLabel="Test Node"
          comments={[]}
          onAddComment={mockOnAddComment}
          onResolveComment={mockOnResolveComment}
          onDeleteComment={mockOnDeleteComment}
        />
      )

      // Initial render with empty comments
      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' })

      scrollIntoViewMock.mockClear()

      // Rerender with comments
      rerender(
        <CommentsPanel
          visible={true}
          onClose={mockOnClose}
          nodeId="node-1"
          nodeLabel="Test Node"
          comments={mockComments}
          onAddComment={mockOnAddComment}
          onResolveComment={mockOnResolveComment}
          onDeleteComment={mockOnDeleteComment}
        />
      )

      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' })
    })
  })
})
