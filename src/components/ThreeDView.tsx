import { useState, useEffect, useRef } from 'react';
import type { MindMapTree } from '../types';

interface ThreeDViewProps {
  visible: boolean;
  onClose: () => void;
  tree: MindMapTree | null;
}

interface Node3D {
  id: string;
  content: string;
  x: number;
  y: number;
  z: number;
  level: number;
  children?: Node3D[];
}

export default function ThreeDView({ visible, onClose, tree }: ThreeDViewProps) {
  const [nodes3D, setNodes3D] = useState<Node3D[]>([]);
  const [rotation, setRotation] = useState({ x: 20, y: -20 });
  const [zoom, setZoom] = useState(1);
  const [autoRotate, setAutoRotate] = useState(true);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isDraggingState, setIsDraggingState] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (tree) {
      const generatedNodes = generate3DNodes(tree);
      setNodes3D(generatedNodes);
    }
  }, [tree]);

  // Auto-rotate
  useEffect(() => {
    if (!autoRotate || !visible) return;

    const interval = setInterval(() => {
      setRotation(prev => ({
        x: prev.x,
        y: prev.y + 0.3,
      }));
    }, 16);

    return () => clearInterval(interval);
  }, [autoRotate, visible]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    setIsDraggingState(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    setAutoRotate(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;

    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;

    setRotation(prev => ({
      x: Math.max(-90, Math.min(90, prev.x + deltaY * 0.5)),
      y: prev.y + deltaX * 0.5,
    }));

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    setIsDraggingState(false);
  };

  // Zoom handlers
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(prev => Math.max(0.5, Math.min(3, prev - e.deltaY * 0.001)));
  };

  // Keyboard handlers
  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          setRotation(prev => ({ ...prev, y: prev.y - 10 }));
          break;
        case 'ArrowRight':
          setRotation(prev => ({ ...prev, y: prev.y + 10 }));
          break;
        case 'ArrowUp':
          setRotation(prev => ({ ...prev, x: Math.max(-90, prev.x - 10) }));
          break;
        case 'ArrowDown':
          setRotation(prev => ({ ...prev, x: Math.min(90, prev.x + 10) }));
          break;
        case '+':
        case '=':
          setZoom(prev => Math.min(3, prev + 0.1));
          break;
        case '-':
          setZoom(prev => Math.max(0.5, prev - 0.1));
          break;
        case 'r':
        case 'R':
          setAutoRotate(!autoRotate);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, autoRotate]);

  if (!visible || !tree) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at center, #1e1b4b 0%, #0f0f23 100%)',
        zIndex: 2000,
        overflow: 'hidden',
        cursor: isDraggingState ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* UI Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        {/* Top Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pointerEvents: 'auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: 'white' }}>
              🎨 3D View
            </h1>
            <span style={{ fontSize: '14px', opacity: 0.8, color: 'white' }}>
              {tree.content}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              style={{
                padding: '8px 12px',
                background: autoRotate ? 'rgba(102, 126, 234, 0.8)' : 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              {autoRotate ? '⏸️ Auto-Rotating' : '▶️ Auto-Rotate'}
            </button>

            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                background: 'rgba(239, 68, 68, 0.8)',
                border: 'none',
                color: 'white',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
            >
              Exit (Esc)
            </button>
          </div>
        </div>

        {/* Controls Help */}
        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.8)',
            pointerEvents: 'auto',
          }}
        >
          <strong>Controls:</strong> Drag to rotate • Scroll to zoom • Arrow keys to navigate •
          Press 'R' to toggle auto-rotate • Esc to exit
        </div>
      </div>

      {/* Zoom Indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          padding: '8px 12px',
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '6px',
          fontSize: '12px',
          color: 'white',
          zIndex: 10,
        }}
      >
        Zoom: {Math.round(zoom * 100)}%
      </div>

      {/* 3D Scene */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          perspective: '1000px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            transformStyle: 'preserve-3d',
            transform: `scale(${zoom}) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transition: 'transform 0.1s ease-out',
            position: 'relative',
            width: '800px',
            height: '800px',
          }}
        >
          {nodes3D.map(node => (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate3d(${node.x}px, ${node.y}px, ${node.z}px)`,
                transformStyle: 'preserve-3d',
                cursor: 'pointer',
              }}
            >
              {/* Connection Lines */}
              {node.children && node.children.map(child => (
                <div
                  key={child.id}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '2px',
                    height: Math.sqrt(
                      Math.pow(child.x - node.x, 2) +
                      Math.pow(child.y - node.y, 2) +
                      Math.pow(child.z - node.z, 2)
                    ),
                    background: 'linear-gradient(to bottom, rgba(102, 126, 234, 0.6), rgba(118, 75, 162, 0.6))',
                    transformOrigin: 'top center',
                    transform: `
                      rotateX(${Math.atan2(child.y - node.y, child.z - node.z) * 180 / Math.PI}deg)
                      rotateY(${Math.atan2(child.x - node.x, child.z - node.z) * 180 / Math.PI}deg)
                    `,
                  }}
                />
              ))}

              {/* Node Card */}
              <div
                style={{
                  padding: '12px 16px',
                  background: selectedNode === node.id
                    ? 'rgba(102, 126, 234, 0.9)'
                    : `rgba(30, 27, 75, ${0.9 - node.level * 0.1})`,
                  border: `2px solid ${selectedNode === node.id ? '#667eea' : 'rgba(102, 126, 234, 0.5)'}`,
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: `${Math.max(12, 18 - node.level * 2)}px`,
                  fontWeight: node.level === 0 ? 'bold' : 'normal',
                  boxShadow: `0 4px 20px rgba(102, 126, 234, ${0.3 - node.level * 0.05})`,
                  textAlign: 'center',
                  minWidth: '120px',
                  maxWidth: '200px',
                  transformStyle: 'preserve-3d',
                  transform: 'translateZ(20px)',
                  transition: 'all 0.3s',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateZ(40px) scale(1.1)';
                  e.currentTarget.style.background = 'rgba(102, 126, 234, 0.9)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateZ(20px) scale(1)';
                  if (selectedNode !== node.id) {
                    e.currentTarget.style.background = `rgba(30, 27, 75, ${0.9 - node.level * 0.1})`;
                  }
                }}
              >
                {node.content}
              </div>
            </div>
          ))}

          {/* Central Sphere */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, rgba(102, 126, 234, 0.2), transparent)',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>

      {/* Selected Node Info */}
      {selectedNode && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            padding: '16px',
            background: 'rgba(30, 27, 75, 0.95)',
            border: '1px solid rgba(102, 126, 234, 0.5)',
            borderRadius: '8px',
            color: 'white',
            maxWidth: '300px',
            zIndex: 10,
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
            {nodes3D.find(n => n.id === selectedNode)?.content}
          </div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>
            Level: {nodes3D.find(n => n.id === selectedNode)?.level}
          </div>
        </div>
      )}

      {/* Stats */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          right: '20px',
          transform: 'translateY(-50%)',
          padding: '16px',
          background: 'rgba(30, 27, 75, 0.8)',
          border: '1px solid rgba(102, 126, 234, 0.3)',
          borderRadius: '8px',
          color: 'white',
          fontSize: '12px',
          zIndex: 10,
        }}
      >
        <div style={{ marginBottom: '8px' }}>
          <strong>Stats</strong>
        </div>
        <div>Total Nodes: {nodes3D.length}</div>
        <div>Max Depth: {Math.max(...nodes3D.map(n => n.level))}</div>
        <div>Rotation X: {Math.round(rotation.x)}°</div>
        <div>Rotation Y: {Math.round(rotation.y % 360)}°</div>
      </div>
    </div>
  );
}

/**
 * Generate 3D nodes from mind map tree
 * Uses spherical distribution for better visualization
 */
function generate3DNodes(tree: MindMapTree): Node3D[] {
  const nodes: Node3D[] = [];

  const traverse = (
    node: MindMapTree,
    level: number = 0,
    angle: number = 0,
    parentX: number = 0,
    parentY: number = 0,
    parentZ: number = 0
  ) => {
    // Calculate position based on level and angle
    const radius = level * 150;
    const x = level === 0 ? 0 : parentX + Math.cos(angle) * radius;
    const y = level === 0 ? 0 : parentY + (Math.random() - 0.5) * 100;
    const z = level === 0 ? 0 : parentZ + Math.sin(angle) * radius;

    const node3D: Node3D = {
      id: node.id,
      content: node.content,
      x,
      y,
      z,
      level,
    };

    nodes.push(node3D);

    // Process children
    if (node.children && node.children.length > 0) {
      const angleStep = (2 * Math.PI) / node.children.length;

      node.children.forEach((child, index) => {
        const childAngle = angle + index * angleStep + (Math.random() - 0.5) * 0.5;
        traverse(
          child,
          level + 1,
          childAngle,
          x,
          y,
          z
        );
      });
    }

    return node3D;
  };

  traverse(tree);
  return nodes;
}
