// Factory functions for creating test user data
import type { User, Comment } from '../../types'

/**
 * Create a test user
 */
export const createUser = (overrides?: Partial<User>): User => {
  const id = overrides?.id || `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', '#EF476F']
  const colorIndex = Math.floor(Math.random() * colors.length)

  return {
    id,
    name: 'Test User',
    color: colors[colorIndex],
    ...overrides,
  }
}

/**
 * Create a test comment
 */
export const createComment = (overrides?: Partial<Comment>): Comment => {
  const id = overrides?.id || `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  return {
    id,
    nodeId: 'test-node-1',
    author: 'Test User',
    authorColor: '#FF6B6B',
    content: 'This is a test comment',
    timestamp: Date.now(),
    resolved: false,
    ...overrides,
  }
}

/**
 * Create multiple test users
 */
export const createUserList = (count = 3): User[] => {
  const users: User[] = []

  for (let i = 0; i < count; i++) {
    users.push(
      createUser({
        id: `user-${i + 1}`,
        name: `User ${i + 1}`,
        color: ['#FF6B6B', '#4ECDC4', '#FFD166'][i % 3],
      })
    )
  }

  return users
}

/**
 * Create multiple test comments
 */
export const createCommentList = (count = 5, nodeId = 'test-node-1'): Comment[] => {
  const comments: Comment[] = []
  const authors = ['User 1', 'User 2', 'User 3']
  const authorColors = ['#FF6B6B', '#4ECDC4', '#FFD166']

  for (let i = 0; i < count; i++) {
    const authorIndex = i % 3
    comments.push(
      createComment({
        id: `comment-${i + 1}`,
        nodeId,
        author: authors[authorIndex],
        authorColor: authorColors[authorIndex],
        content: `Test comment ${i + 1} for node ${nodeId}`,
        timestamp: Date.now() - (count - i) * 3600000, // Staggered timestamps
        resolved: i % 3 === 0, // Every 3rd comment is resolved
      })
    )
  }

  return comments
}

/**
 * Create a comment thread (simple version since Comment doesn't have replies)
 */
export const createCommentThread = (): Comment[] => {
  return [
    createComment({
      id: 'comment-parent',
      content: 'This is the parent comment',
      author: 'User 1',
      authorColor: '#FF6B6B',
      timestamp: Date.now() - 3600000, // 1 hour ago
    }),
    createComment({
      id: 'comment-reply-1',
      content: 'This is a reply to the parent comment',
      author: 'User 2',
      authorColor: '#4ECDC4',
      timestamp: Date.now() - 1800000, // 30 minutes ago
    }),
    createComment({
      id: 'comment-reply-2',
      content: 'Another reply with more details',
      author: 'User 3',
      authorColor: '#FFD166',
      timestamp: Date.now() - 900000, // 15 minutes ago
    }),
  ]
}

/**
 * Create test collaboration session data
 */
export const createCollaborationSession = (userCount = 3) => {
  const users = createUserList(userCount)
  const activeUsers = users.map(user => ({
    ...user,
    cursorPosition: { x: Math.random() * 1000, y: Math.random() * 800 },
    selectedNodeId: `node-${Math.floor(Math.random() * 5) + 1}`,
    lastAction: Date.now() - Math.random() * 60000, // Within last minute
  }))

  return {
    users: activeUsers,
    sessionId: `session-${Date.now()}`,
    startedAt: Date.now() - 3600000, // 1 hour ago
    isActive: true,
    permissions: {
      canEdit: true,
      canComment: true,
      canExport: true,
      canInvite: true,
    },
  }
}

/**
 * Create test presence data for real-time collaboration
 */
export const createPresenceData = (userCount = 3) => {
  const presence = []

  for (let i = 0; i < userCount; i++) {
    presence.push({
      userId: `user-${i + 1}`,
      name: `User ${i + 1}`,
      color: ['#FF6B6B', '#4ECDC4', '#FFD166'][i % 3],
      online: true,
      cursor: {
        x: Math.random() * 1000,
        y: Math.random() * 800,
        timestamp: Date.now(),
      },
      selection: {
        nodeIds: [`node-${Math.floor(Math.random() * 5) + 1}`],
        timestamp: Date.now() - Math.random() * 30000,
      },
      lastActive: Date.now() - Math.random() * 60000,
    })
  }

  return presence
}
