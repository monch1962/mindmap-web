interface User {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
  selectedNodeId?: string;
}

interface PresenceIndicatorProps {
  users: User[];
  currentUser: User;
}

export default function PresenceIndicator({
  users,
  currentUser,
}: PresenceIndicatorProps) {
  const otherUsers = users.filter((u) => u.id !== currentUser.id);

  if (otherUsers.length === 0) return null;

  return (
    <>
      {/* User Cursors */}
      {otherUsers.map(
        (user) =>
          user.cursor && (
            <div
              key={user.id}
              style={{
                position: 'fixed',
                left: user.cursor.x,
                top: user.cursor.y,
                pointerEvents: 'none',
                zIndex: 9999,
                transition: 'all 0.1s ease-out',
              }}
            >
              {/* Cursor */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19138L11.7841 12.3673H5.65376Z"
                  fill={user.color}
                  stroke="white"
                  strokeWidth="1"
                />
              </svg>
              {/* Name Tag */}
              <div
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '16px',
                  background: user.color,
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                {user.name}
              </div>
            </div>
          )
      )}

      {/* User List */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          padding: '12px',
          zIndex: 1000,
          minWidth: '200px',
        }}
      >
        <h3
          style={{
            margin: '0 0 8px 0',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#374151',
          }}
        >
          👥 Online ({users.length})
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {users.map((user) => (
            <div
              key={user.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: user.color,
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              />
              <span style={{ flex: 1 }}>{user.name}</span>
              {user.id === currentUser.id && (
                <span
                  style={{
                    fontSize: '10px',
                    color: '#6b7280',
                    fontStyle: 'italic',
                  }}
                >
                  (you)
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pulse Animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.2);
          }
        }
      `}</style>
    </>
  );
}
