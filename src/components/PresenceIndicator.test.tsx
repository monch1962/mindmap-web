import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PresenceIndicator from './PresenceIndicator'

describe('PresenceIndicator', () => {
  const mockCurrentUser = {
    id: 'user-1',
    name: 'Current User',
    color: '#3b82f6',
  }

  const mockOtherUser = {
    id: 'user-2',
    name: 'Other User',
    color: '#ef4444',
    cursor: { x: 100, y: 200 },
  }

  const mockOtherUserWithoutCursor = {
    id: 'user-3',
    name: 'User Without Cursor',
    color: '#10b981',
  }

  describe('when there are no other users', () => {
    it('should return null when only current user is present', () => {
      const users = [mockCurrentUser]
      const { container } = render(
        <PresenceIndicator users={users} currentUser={mockCurrentUser} />
      )

      expect(container.firstChild).toBeNull()
    })

    it('should return null when users array is empty', () => {
      const users: Array<{
        id: string
        name: string
        color: string
        cursor?: { x: number; y: number }
        selectedNodeId?: string
      }> = []
      const { container } = render(
        <PresenceIndicator users={users} currentUser={mockCurrentUser} />
      )

      expect(container.firstChild).toBeNull()
    })
  })

  describe('when there are other users', () => {
    it('should render the presence indicator', () => {
      const users = [mockCurrentUser, mockOtherUser]
      render(<PresenceIndicator users={users} currentUser={mockCurrentUser} />)

      expect(screen.getByRole('region')).toBeInTheDocument()
      expect(screen.getByLabelText('Online users')).toBeInTheDocument()
    })

    it('should render title with user count', () => {
      const users = [mockCurrentUser, mockOtherUser]
      render(<PresenceIndicator users={users} currentUser={mockCurrentUser} />)

      expect(screen.getByText('👥 Online (2)')).toBeInTheDocument()
    })

    it('should render all users in the list', () => {
      const users = [mockCurrentUser, mockOtherUser, mockOtherUserWithoutCursor]
      render(<PresenceIndicator users={users} currentUser={mockCurrentUser} />)

      // Check user list items (not cursor name tags)
      const listItems = screen.getAllByRole('listitem')
      expect(listItems).toHaveLength(3)

      // Check each user appears in the list
      const userNames = listItems.map(item => item.textContent)
      expect(userNames).toContain('Current User(you)')
      expect(userNames).toContain('Other User')
      expect(userNames).toContain('User Without Cursor')
    })

    it('should mark current user with "(you)" label', () => {
      const users = [mockCurrentUser, mockOtherUser]
      render(<PresenceIndicator users={users} currentUser={mockCurrentUser} />)

      const currentUserElement = screen.getByText('Current User')
      expect(currentUserElement).toBeInTheDocument()
      expect(screen.getByText('(you)')).toBeInTheDocument()
    })

    it('should not mark other users with "(you)" label', () => {
      const users = [mockCurrentUser, mockOtherUser]
      render(<PresenceIndicator users={users} currentUser={mockCurrentUser} />)

      // Find the list item for Other User (not cursor name tag)
      const otherUserListItem = screen.getByLabelText('Other User')
      expect(otherUserListItem).toBeInTheDocument()
      expect(otherUserListItem.textContent).not.toContain('(you)')
    })
  })

  describe('user cursors', () => {
    it('should render cursor for users with cursor position', () => {
      const users = [mockCurrentUser, mockOtherUser]
      render(<PresenceIndicator users={users} currentUser={mockCurrentUser} />)

      const cursor = screen.getByLabelText("Other User's cursor")
      expect(cursor).toBeInTheDocument()
      expect(cursor).toHaveStyle({
        position: 'fixed',
        left: '100px',
        top: '200px',
        pointerEvents: 'none',
        zIndex: '9999',
      })
    })

    it('should not render cursor for users without cursor position', () => {
      const users = [mockCurrentUser, mockOtherUserWithoutCursor]
      render(<PresenceIndicator users={users} currentUser={mockCurrentUser} />)

      expect(screen.queryByLabelText("User Without Cursor's cursor")).not.toBeInTheDocument()
    })

    it('should not render cursor for current user', () => {
      const currentUserWithCursor = {
        ...mockCurrentUser,
        cursor: { x: 50, y: 50 },
      }
      const users = [currentUserWithCursor, mockOtherUser]
      render(<PresenceIndicator users={users} currentUser={currentUserWithCursor} />)

      expect(screen.queryByLabelText("Current User's cursor")).not.toBeInTheDocument()
      expect(screen.getByLabelText("Other User's cursor")).toBeInTheDocument()
    })

    it('should render cursor with user color', () => {
      const users = [mockCurrentUser, mockOtherUser]
      render(<PresenceIndicator users={users} currentUser={mockCurrentUser} />)

      const cursor = screen.getByLabelText("Other User's cursor")
      const svg = cursor.querySelector('svg')
      expect(svg).toBeInTheDocument()
      const path = svg?.querySelector('path')
      expect(path).toHaveAttribute('fill', '#ef4444')
    })

    it('should render name tag with cursor', () => {
      const users = [mockCurrentUser, mockOtherUser]
      render(<PresenceIndicator users={users} currentUser={mockCurrentUser} />)

      // Find the cursor name tag (not the list item)
      const cursor = screen.getByLabelText("Other User's cursor")
      const nameTag = cursor.querySelector('div[style*="position: absolute"]')
      expect(nameTag).toBeInTheDocument()
      expect(nameTag).toHaveTextContent('Other User')

      // Use getComputedStyle for reliable color checking
      const style = getComputedStyle(nameTag as HTMLElement)
      expect(style.backgroundColor).toBe('rgb(239, 68, 68)')
      expect(style.color).toBe('rgb(255, 255, 255)')
    })
  })

  describe('user list styling', () => {
    it('should have proper styling for the user list region', () => {
      const users = [mockCurrentUser, mockOtherUser]
      render(<PresenceIndicator users={users} currentUser={mockCurrentUser} />)

      const region = screen.getByRole('region')
      // Use getComputedStyle for more reliable style checking
      const style = getComputedStyle(region)
      expect(style.position).toBe('fixed')
      expect(style.top).toBe('20px')
      expect(style.right).toBe('20px')
      expect(style.backgroundColor).toBe('rgb(255, 255, 255)')
      expect(style.borderWidth).toBe('1px')
      expect(style.borderStyle).toBe('solid')
      expect(style.borderRadius).toBe('8px')
      expect(style.minWidth).toBe('200px')
    })

    it('should render user status indicators with colors', () => {
      const users = [mockCurrentUser, mockOtherUser]
      render(<PresenceIndicator users={users} currentUser={mockCurrentUser} />)

      const statusIndicators = screen.getAllByRole('listitem')
      expect(statusIndicators).toHaveLength(2)

      // Check that each list item has a status indicator
      statusIndicators.forEach(item => {
        const statusDot = item.querySelector('div[aria-hidden="true"]')
        expect(statusDot).toBeInTheDocument()
        expect(statusDot).toHaveStyle({
          width: '8px',
          height: '8px',
          borderRadius: '50%',
        })
      })
    })

    it('should apply pulse animation to status indicators', () => {
      const users = [mockCurrentUser, mockOtherUser]
      render(<PresenceIndicator users={users} currentUser={mockCurrentUser} />)

      const statusDot = screen.getAllByRole('listitem')[0].querySelector('div[aria-hidden="true"]')
      expect(statusDot).toHaveStyle({
        animation: 'pulse 2s ease-in-out infinite',
      })
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA attributes for region', () => {
      const users = [mockCurrentUser, mockOtherUser]
      render(<PresenceIndicator users={users} currentUser={mockCurrentUser} />)

      const region = screen.getByRole('region')
      expect(region).toHaveAttribute('aria-labelledby', 'presence-title')
    })

    it('should have proper heading structure', () => {
      const users = [mockCurrentUser, mockOtherUser]
      render(<PresenceIndicator users={users} currentUser={mockCurrentUser} />)

      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveTextContent('👥 Online (2)')
      expect(heading).toHaveAttribute('id', 'presence-title')
    })

    it('should have proper list structure', () => {
      const users = [mockCurrentUser, mockOtherUser]
      render(<PresenceIndicator users={users} currentUser={mockCurrentUser} />)

      const list = screen.getByRole('list')
      expect(list).toHaveAttribute('aria-label', 'Online users')

      const listItems = screen.getAllByRole('listitem')
      expect(listItems).toHaveLength(2)

      // Check first item (current user)
      expect(listItems[0]).toHaveAttribute('aria-label', 'Current User (you)')
      // Check second item (other user)
      expect(listItems[1]).toHaveAttribute('aria-label', 'Other User')
    })

    it('should have proper aria-label for cursors', () => {
      const users = [mockCurrentUser, mockOtherUser]
      render(<PresenceIndicator users={users} currentUser={mockCurrentUser} />)

      const cursor = screen.getByLabelText("Other User's cursor")
      expect(cursor).toHaveAttribute('role', 'img')
      expect(cursor).toHaveAttribute('aria-label', "Other User's cursor")
    })

    it('should hide SVG from screen readers', () => {
      const users = [mockCurrentUser, mockOtherUser]
      render(<PresenceIndicator users={users} currentUser={mockCurrentUser} />)

      const cursor = screen.getByLabelText("Other User's cursor")
      const svg = cursor.querySelector('svg')
      expect(svg).toHaveAttribute('aria-hidden', 'true')
    })

    it('should hide status dots from screen readers', () => {
      const users = [mockCurrentUser, mockOtherUser]
      render(<PresenceIndicator users={users} currentUser={mockCurrentUser} />)

      const statusDots = screen
        .getAllByRole('listitem')
        .map(item => item.querySelector('div[aria-hidden="true"]'))
      statusDots.forEach(dot => {
        expect(dot).toHaveAttribute('aria-hidden', 'true')
      })
    })
  })

  describe('edge cases', () => {
    it('should handle multiple users with cursors', () => {
      const userWithCursor1 = {
        id: 'user-2',
        name: 'User 2',
        color: '#ef4444',
        cursor: { x: 100, y: 200 },
      }
      const userWithCursor2 = {
        id: 'user-3',
        name: 'User 3',
        color: '#10b981',
        cursor: { x: 300, y: 400 },
      }
      const users = [mockCurrentUser, userWithCursor1, userWithCursor2]
      render(<PresenceIndicator users={users} currentUser={mockCurrentUser} />)

      expect(screen.getByLabelText("User 2's cursor")).toBeInTheDocument()
      expect(screen.getByLabelText("User 3's cursor")).toBeInTheDocument()
      expect(screen.getByText('👥 Online (3)')).toBeInTheDocument()
    })

    it('should handle users with selectedNodeId (ignored in rendering)', () => {
      const userWithSelection = {
        id: 'user-2',
        name: 'User with Selection',
        color: '#ef4444',
        cursor: { x: 100, y: 200 },
        selectedNodeId: 'node-123',
      }
      const users = [mockCurrentUser, userWithSelection]
      render(<PresenceIndicator users={users} currentUser={mockCurrentUser} />)

      // Should still render normally even with selectedNodeId
      expect(screen.getByLabelText("User with Selection's cursor")).toBeInTheDocument()
      expect(screen.getByLabelText('User with Selection')).toBeInTheDocument()
    })

    it('should handle users array with duplicate IDs (should not happen but defensive)', () => {
      const duplicateUser = { ...mockOtherUser }
      const users = [mockCurrentUser, mockOtherUser, duplicateUser]
      render(<PresenceIndicator users={users} currentUser={mockCurrentUser} />)

      // React will warn about duplicate keys but should still render
      // With duplicate IDs, we get 4 elements: 2 cursor name tags + 2 list items
      expect(screen.getAllByText('Other User')).toHaveLength(4)
    })

    it('should handle users with long names', () => {
      const userWithLongName = {
        id: 'user-2',
        name: 'User With A Very Long Name That Might Overflow',
        color: '#ef4444',
        cursor: { x: 100, y: 200 },
      }
      const users = [mockCurrentUser, userWithLongName]
      render(<PresenceIndicator users={users} currentUser={mockCurrentUser} />)

      // Find the cursor name tag (not the list item)
      const cursor = screen.getByLabelText(
        "User With A Very Long Name That Might Overflow's cursor"
      )
      const nameTag = cursor.querySelector('div[style*="position: absolute"]')
      expect(nameTag).toBeInTheDocument()
      expect(nameTag).toHaveTextContent('User With A Very Long Name That Might Overflow')
      expect(nameTag).toHaveStyle({
        whiteSpace: 'nowrap',
      })
    })

    it('should handle cursor positions at screen edges', () => {
      const userAtEdge = {
        id: 'user-2',
        name: 'Edge User',
        color: '#ef4444',
        cursor: { x: 0, y: 0 },
      }
      const users = [mockCurrentUser, userAtEdge]
      render(<PresenceIndicator users={users} currentUser={mockCurrentUser} />)

      const cursor = screen.getByLabelText("Edge User's cursor")
      expect(cursor).toHaveStyle({
        left: '0px',
        top: '0px',
      })
    })

    it('should handle negative cursor positions', () => {
      const userNegative = {
        id: 'user-2',
        name: 'Negative User',
        color: '#ef4444',
        cursor: { x: -100, y: -200 },
      }
      const users = [mockCurrentUser, userNegative]
      render(<PresenceIndicator users={users} currentUser={mockCurrentUser} />)

      const cursor = screen.getByLabelText("Negative User's cursor")
      expect(cursor).toHaveStyle({
        left: '-100px',
        top: '-200px',
      })
    })
  })

  describe('animation styles', () => {
    it('should include pulse animation styles', () => {
      const users = [mockCurrentUser, mockOtherUser]
      render(<PresenceIndicator users={users} currentUser={mockCurrentUser} />)

      // Check that animation styles are included in the document
      const styleElement = document.querySelector('style')
      expect(styleElement).toBeInTheDocument()
      expect(styleElement?.textContent).toContain('@keyframes pulse')
      expect(styleElement?.textContent).toContain('opacity: 1')
      expect(styleElement?.textContent).toContain('transform: scale(1)')
      expect(styleElement?.textContent).toContain('opacity: 0.7')
      expect(styleElement?.textContent).toContain('transform: scale(1.2)')
    })

    it('should apply transition to cursors', () => {
      const users = [mockCurrentUser, mockOtherUser]
      render(<PresenceIndicator users={users} currentUser={mockCurrentUser} />)

      const cursor = screen.getByLabelText("Other User's cursor")
      expect(cursor).toHaveStyle({
        transition: 'all 0.1s ease-out',
      })
    })
  })

  describe('performance considerations', () => {
    it('should filter out current user from cursor rendering', () => {
      const currentUserWithCursor = {
        ...mockCurrentUser,
        cursor: { x: 50, y: 50 },
      }
      const users = [currentUserWithCursor, mockOtherUser]
      render(<PresenceIndicator users={users} currentUser={currentUserWithCursor} />)

      // Should only render cursor for other user, not current user
      expect(screen.queryByLabelText("Current User's cursor")).not.toBeInTheDocument()
      expect(screen.getByLabelText("Other User's cursor")).toBeInTheDocument()
    })

    it('should only render cursors for users with cursor data', () => {
      const users = [mockCurrentUser, mockOtherUser, mockOtherUserWithoutCursor]
      render(<PresenceIndicator users={users} currentUser={mockCurrentUser} />)

      // Should only render cursor for user with cursor data
      expect(screen.getByLabelText("Other User's cursor")).toBeInTheDocument()
      expect(screen.queryByLabelText("User Without Cursor's cursor")).not.toBeInTheDocument()
    })
  })
})
