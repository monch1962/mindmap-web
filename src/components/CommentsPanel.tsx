import { useState, useRef, useEffect } from 'react'

interface Comment {
  id: string
  nodeId: string
  author: string
  authorColor: string
  content: string
  timestamp: number
  resolved: boolean
}

interface CommentsPanelProps {
  visible: boolean
  onClose: () => void
  nodeId: string | null
  nodeLabel: string
  comments: Comment[]
  onAddComment: (content: string) => void
  onResolveComment: (commentId: string) => void
  onDeleteComment: (commentId: string) => void
}

export default function CommentsPanel({
  visible,
  onClose,
  nodeId,
  nodeLabel,
  comments,
  onAddComment,
  onResolveComment,
  onDeleteComment,
}: CommentsPanelProps) {
  const [newComment, setNewComment] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments])

  if (!visible) return null

  const nodeComments = comments.filter(c => c.nodeId === nodeId)
  const unresolvedCount = nodeComments.filter(c => !c.resolved).length

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    onAddComment(newComment)
    setNewComment('')
  }

  return (
    <div
      role="region"
      aria-labelledby="comments-panel-title"
      style={{
        position: 'fixed',
        right: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '350px',
        maxHeight: '70vh',
        background: 'white',
        border: '1px solid #d1d5db',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '12px 12px 0 0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>💬</span>
          <div>
            <h2
              id="comments-panel-title"
              style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}
            >
              Comments
            </h2>
            {unresolvedCount > 0 && (
              <span
                style={{ fontSize: '11px', opacity: 0.9 }}
                aria-label={`${unresolvedCount} unresolved comments`}
              >
                {unresolvedCount} unresolved
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close comments panel"
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
          }}
        >
          ×
        </button>
      </div>

      {/* Node Info */}
      {nodeId && (
        <div
          style={{
            padding: '12px 16px',
            background: '#f9fafb',
            borderBottom: '1px solid #e5e7eb',
            fontSize: '12px',
          }}
        >
          <strong>Node:</strong> {nodeLabel}
        </div>
      )}

      {/* Comments List */}
      <div
        role="list"
        aria-label={`Comments for ${nodeLabel || 'selected node'}`}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {!nodeId ? (
          <div
            role="status"
            style={{
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '14px',
              padding: '24px',
            }}
          >
            Select a node to view comments
          </div>
        ) : nodeComments.length === 0 ? (
          <div
            role="status"
            style={{
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '14px',
              padding: '24px',
            }}
          >
            No comments yet. Be the first to comment!
          </div>
        ) : (
          nodeComments.map(comment => (
            <div
              key={comment.id}
              role="listitem"
              aria-label={`Comment by ${comment.author}: ${comment.content.slice(0, 50)}${comment.content.length > 50 ? '...' : ''}${comment.resolved ? ', resolved' : ''}`}
              style={{
                padding: '12px',
                background: comment.resolved ? '#f0fdf4' : '#f9fafb',
                border: `1px solid ${comment.resolved ? '#86efac' : '#e5e7eb'}`,
                borderRadius: '8px',
                opacity: comment.resolved ? 0.7 : 1,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: comment.authorColor,
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {comment.author.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{comment.author}</span>
                  {comment.resolved && (
                    <span
                      style={{
                        fontSize: '10px',
                        background: '#86efac',
                        color: '#166534',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      ✓ Resolved
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '10px', color: '#6b7280' }}>
                  {new Date(comment.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: '13px',
                  color: '#374151',
                  lineHeight: '1.4',
                }}
              >
                {comment.content}
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                {!comment.resolved && (
                  <button
                    onClick={() => onResolveComment(comment.id)}
                    aria-label={`Resolve comment from ${comment.author}`}
                    style={{
                      padding: '4px 8px',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '10px',
                    }}
                  >
                    Resolve
                  </button>
                )}
                <button
                  onClick={() => onDeleteComment(comment.id)}
                  aria-label={`Delete comment from ${comment.author}`}
                  style={{
                    padding: '4px 8px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '10px',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Add Comment Form */}
      {nodeId && (
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '12px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            gap: '8px',
          }}
        >
          <label htmlFor="comment-input" style={{ display: 'none' }}>
            Add a comment
          </label>
          <input
            id="comment-input"
            type="text"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            aria-label="Add a new comment"
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '13px',
            }}
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            aria-label={!newComment.trim() ? 'Enter comment text to submit' : 'Submit comment'}
            style={{
              padding: '8px 16px',
              background: newComment.trim() ? '#8b5cf6' : '#d1d5db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: newComment.trim() ? 'pointer' : 'not-allowed',
              fontSize: '13px',
              fontWeight: 'bold',
              opacity: newComment.trim() ? 1 : 0.5,
            }}
          >
            Send
          </button>
        </form>
      )}
    </div>
  )
}
