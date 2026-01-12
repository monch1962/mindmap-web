import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Panel,
  useReactFlow,
} from 'reactflow';
import type { Connection, OnConnect, Node } from 'reactflow';
import 'reactflow/dist/style.css';

import MindMapNode from './MindMapNode';
import MetadataPanel from './MetadataPanel';
import NotesPanel from './NotesPanel';
import CloudBackground from './CloudBackground';
import CrossLinkEdge from './CrossLinkEdge';
import type { MindMapNodeData, MindMapTree, NodeMetadata } from '../types';
import { flowToTree, treeToFlow, generateId } from '../utils/mindmapConverter';
import { parseJSON, stringifyJSON, parseFreeMind, toFreeMind, parseOPML, toOPML, parseMarkdown, toMarkdown, toD2 } from '../utils/formats';

const nodeTypes = {
  mindmap: MindMapNode,
};

const edgeTypes = {
  crosslink: CrossLinkEdge,
  default: CrossLinkEdge,
};

interface MindMapCanvasProps {
  initialData?: MindMapTree;
}

function MindMapCanvas({ initialData }: MindMapCanvasProps) {
  const { nodes: initialNodes, edges: initialEdges } = initialData
    ? treeToFlow(initialData)
    : { nodes: [], edges: [] };

  const [nodes, setNodes, onNodesChange] = useNodesState<MindMapNodeData>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [crossLinkMode, setCrossLinkMode] = useState(false);
  const [crossLinkSource, setCrossLinkSource] = useState<string | null>(null);

  const selectedNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null;
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const handleUpdateMetadata = (metadata: NodeMetadata) => {
    if (!selectedNodeId) return;

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
            },
          };
        }
        return node;
      })
    );
  };

  const handleUpdateIcon = (icon: string | null) => {
    if (!selectedNodeId) return;

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              icon: icon || undefined,
            },
          };
        }
        return node;
      })
    );
  };

  const handleUpdateCloud = (cloud: { color?: string } | null) => {
    if (!selectedNodeId) return;

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              cloud: cloud || undefined,
            },
          };
        }
        return node;
      })
    );
  };

  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        type: 'crosslink',
        data: { isCrossLink: crossLinkMode },
        style: crossLinkMode
          ? { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '5,5' }
          : undefined,
      };
      setEdges((eds) => addEdge(newEdge, eds));
      if (crossLinkMode) {
        setCrossLinkMode(false);
        setCrossLinkSource(null);
      }
    },
    [setEdges, crossLinkMode]
  );

  // Handle cross-link creation via node clicks
  const handleNodeClickForCrossLink = (nodeId: string) => {
    if (crossLinkMode) {
      if (crossLinkSource === null) {
        // First click - set as source
        setCrossLinkSource(nodeId);
      } else if (crossLinkSource !== nodeId) {
        // Second click - create cross-link
        const existingEdge = edges.find(
          (e) => e.source === crossLinkSource && e.target === nodeId
        );

        if (!existingEdge) {
          const newEdge = {
            id: `${crossLinkSource}-${nodeId}`,
            source: crossLinkSource,
            target: nodeId,
            type: 'crosslink' as const,
            data: { isCrossLink: true },
            style: { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '5,5' },
          };
          setEdges((eds) => [...eds, newEdge]);
        }

        // Reset cross-link mode
        setCrossLinkMode(false);
        setCrossLinkSource(null);
      }
    }
  };

  // Keyboard shortcuts for mind map operations
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not editing text
      if (document.activeElement?.classList.contains('node-content')) {
        return;
      }

      // Tab - Create child node
      if (event.key === 'Tab' && selectedNodeId) {
        event.preventDefault();
        createChildNode(selectedNodeId);
      }

      // Enter - Create sibling node
      if (event.key === 'Enter' && selectedNodeId) {
        event.preventDefault();
        createSiblingNode(selectedNodeId);
      }

      // Delete/Backspace - Delete node
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNodeId) {
        event.preventDefault();
        deleteNode(selectedNodeId);
      }

      // F2 - Edit node content
      if (event.key === 'F2' && selectedNodeId) {
        event.preventDefault();
        editNode(selectedNodeId);
      }

      // Space - Toggle collapse
      if (event.key === ' ' && selectedNodeId) {
        event.preventDefault();
        toggleCollapse(selectedNodeId);
      }

      // Ctrl + or = - Zoom in
      if (event.key === '=' || event.key === '+') {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          zoomIn();
        }
      }

      // Ctrl - or _ - Zoom out
      if (event.key === '-' || event.key === '_') {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          zoomOut();
        }
      }

      // Ctrl 0 - Fit view
      if (event.key === '0') {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          fitView();
        }
      }

      // Ctrl N - Toggle notes panel
      if (event.key === 'n' || event.key === 'N') {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          if (selectedNode) {
            setShowNotesPanel(!showNotesPanel);
          }
        }
      }

      // F3 - Toggle notes panel (when node selected)
      if (event.key === 'F3' && selectedNodeId) {
        event.preventDefault();
        setShowNotesPanel(!showNotesPanel);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, nodes, edges, zoomIn, zoomOut, fitView, showNotesPanel]);

  const createChildNode = (parentId: string) => {
    const parent = nodes.find((n) => n.id === parentId);
    if (!parent) return;

    const newNode: Node<MindMapNodeData> = {
      id: generateId(),
      type: 'mindmap',
      position: {
        x: parent.position.x + 250,
        y: parent.position.y + Math.random() * 50,
      },
      data: { label: 'New Node' },
    };

    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [
      ...eds,
      {
        id: `${parentId}-${newNode.id}`,
        source: parentId,
        target: newNode.id,
        type: 'smoothstep',
      },
    ]);
    setSelectedNodeId(newNode.id);
  };

  const createSiblingNode = (siblingId: string) => {
    const sibling = nodes.find((n) => n.id === siblingId);
    if (!sibling) return;

    // Find parent edge
    const parentEdge = edges.find((e) => e.target === siblingId);
    if (!parentEdge) {
      // Root node - create a new root sibling
      const newNode: Node<MindMapNodeData> = {
        id: generateId(),
        type: 'mindmap',
        position: {
          x: sibling.position.x,
          y: sibling.position.y + 100,
        },
        data: { label: 'New Node' },
      };
      setNodes((nds) => [...nds, newNode]);
      setSelectedNodeId(newNode.id);
      return;
    }

    const newNode: Node<MindMapNodeData> = {
      id: generateId(),
      type: 'mindmap',
      position: {
        x: sibling.position.x,
        y: sibling.position.y + 100,
      },
      data: { label: 'New Node' },
    };

    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [
      ...eds,
      {
        id: `${parentEdge.source}-${newNode.id}`,
        source: parentEdge.source,
        target: newNode.id,
        type: 'smoothstep',
      },
    ]);
    setSelectedNodeId(newNode.id);
  };

  const deleteNode = (nodeId: string) => {
    // Don't delete if it's the only node
    if (nodes.length === 1) return;

    // Find all descendants
    const descendants = new Set<string>([nodeId]);
    let added = true;

    while (added) {
      added = false;
      edges.forEach((edge) => {
        if (descendants.has(edge.source) && !descendants.has(edge.target)) {
          descendants.add(edge.target);
          added = true;
        }
      });
    }

    setNodes((nds) => nds.filter((n) => !descendants.has(n.id)));
    setEdges((eds) => eds.filter((e) => !descendants.has(e.source) && !descendants.has(e.target)));
    setSelectedNodeId(null);
  };

  const editNode = (nodeId: string) => {
    const nodeElement = document.querySelector(`[data-nodeid="${nodeId}"] .node-content`) as HTMLElement;
    if (nodeElement) {
      nodeElement.focus();
      // Select all text
      const range = document.createRange();
      range.selectNodeContents(nodeElement);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  };

  const toggleCollapse = (nodeId: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              collapsed: !node.data.collapsed,
            },
          };
        }
        return node;
      })
    );
  };

  const saveToFile = (format: 'json' | 'freemind' | 'opml' | 'markdown' | 'd2') => {
    const tree = flowToTree(nodes, edges);
    if (!tree) return;

    let content: string;
    let filename: string;
    let mimeType: string;

    switch (format) {
      case 'json':
        content = stringifyJSON(tree);
        filename = 'mindmap.json';
        mimeType = 'application/json';
        break;
      case 'freemind':
        content = toFreeMind(tree);
        filename = 'mindmap.mm';
        mimeType = 'application/xml';
        break;
      case 'opml':
        content = toOPML(tree);
        filename = 'mindmap.opml';
        mimeType = 'application/xml';
        break;
      case 'markdown':
        content = toMarkdown(tree);
        filename = 'mindmap.md';
        mimeType = 'text/markdown';
        break;
      case 'd2':
        content = toD2(tree);
        filename = 'mindmap.d2';
        mimeType = 'text/plain';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadFromFile = (format: 'json' | 'freemind' | 'opml' | 'markdown') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept =
      format === 'json'
        ? '.json'
        : format === 'freemind'
        ? '.mm'
        : format === 'opml'
        ? '.opml'
        : '.md';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();
      let tree: MindMapTree;

      try {
        switch (format) {
          case 'json':
            tree = parseJSON(text);
            break;
          case 'freemind':
            tree = parseFreeMind(text);
            break;
          case 'opml':
            tree = parseOPML(text);
            break;
          case 'markdown':
            tree = parseMarkdown(text);
            break;
        }

        const { nodes: newNodes, edges: newEdges } = treeToFlow(tree);
        setNodes(newNodes);
        setEdges(newEdges);
      } catch (error) {
        alert(`Error loading file: ${error}`);
      }
    };

    input.click();
  };

  const exportAsPNG = () => {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // For simplicity, we'll create an SVG first and then draw it to canvas
    // This is a basic implementation - a more robust solution would use html2canvas
    const svgElement = document.querySelector('.react-flow__viewport') as SVGElement;
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      // Download the image
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = 'mindmap.png';
      a.click();
    };

    img.src = url;
  };

  const exportAsSVG = () => {
    const svgElement = document.querySelector('.react-flow__viewport') as SVGElement;
    if (!svgElement) return;

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgElement);

    // Add namespaces
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+xmlns:xlink="http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
      source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }

    // Add XML declaration
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

    // Create blob and download
    const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mindmap.svg';
    a.click();
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={(_, node) => {
          if (crossLinkMode) {
            handleNodeClickForCrossLink(node.id);
          } else {
            setSelectedNodeId(node.id);
          }
        }}
        onPaneClick={() => {
          setSelectedNodeId(null);
          if (crossLinkMode) {
            setCrossLinkMode(false);
            setCrossLinkSource(null);
          }
        }}
        fitView
      >
        <Background />
        <CloudBackground nodes={nodes} />
        <Controls />
        <MiniMap />

        <Panel position="bottom-right" style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => zoomIn()}
            title="Zoom In (Ctrl +)"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'white',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            +
          </button>
          <button
            onClick={() => zoomOut()}
            title="Zoom Out (Ctrl -)"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'white',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            -
          </button>
          <button
            onClick={() => fitView()}
            title="Fit View (Ctrl 0)"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'white',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ⤢
          </button>
        </Panel>

        <Panel position="top-right" className="controls-panel">
          <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
            <button onClick={() => createChildNode(nodes[0]?.id || generateId())}>
              + New Root
            </button>
            <hr />
            <div>
              <strong>Save As:</strong>
            </div>
            <button onClick={() => saveToFile('json')}>JSON</button>
            <button onClick={() => saveToFile('freemind')}>FreeMind (.mm)</button>
            <button onClick={() => saveToFile('opml')}>OPML</button>
            <button onClick={() => saveToFile('markdown')}>Markdown</button>
            <button onClick={() => saveToFile('d2')}>D2</button>
            <hr />
            <div>
              <strong>Export As Image:</strong>
            </div>
            <button onClick={exportAsSVG}>SVG</button>
            <button onClick={exportAsPNG}>PNG</button>
            <hr />
            <div>
              <strong>Load From:</strong>
            </div>
            <button onClick={() => loadFromFile('json')}>JSON</button>
            <button onClick={() => loadFromFile('freemind')}>FreeMind (.mm)</button>
            <button onClick={() => loadFromFile('opml')}>OPML</button>
            <button onClick={() => loadFromFile('markdown')}>Markdown</button>
            <hr />
            <div>
              <strong>Cross-Links:</strong>
            </div>
            <button
              onClick={() => setCrossLinkMode(!crossLinkMode)}
              style={{
                background: crossLinkMode ? '#f59e0b' : '#f3f4f6',
                color: crossLinkMode ? 'white' : '#374151',
              }}
            >
              {crossLinkMode ? 'Cancel Link Mode' : 'Add Cross-Link'}
            </button>
            {crossLinkMode && (
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                {crossLinkSource
                  ? `Source selected. Click target node.`
                  : 'Click source node first.'}
              </div>
            )}
          </div>
        </Panel>

        <Panel position="bottom-left">
          <div style={{ fontSize: '12px', color: '#666' }}>
            <strong>Shortcuts:</strong><br />
            Tab - Create child<br />
            Enter - Create sibling<br />
            Delete - Remove node<br />
            F2 - Edit text<br />
            Space - Toggle collapse<br />
            <strong>Zoom:</strong> Ctrl +/-/0<br />
            <strong>Notes:</strong> F3 / Ctrl+N
            {selectedNodeId && (
              <button
                onClick={() => setShowNotesPanel(!showNotesPanel)}
                style={{
                  marginTop: '8px',
                  padding: '4px 8px',
                  background: showNotesPanel ? '#3b82f6' : '#f3f4f6',
                  color: showNotesPanel ? 'white' : '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                }}
              >
                {showNotesPanel ? 'Hide Notes' : 'Show Notes'}
              </button>
            )}
          </div>
        </Panel>

        <Panel position="top-left">
          <MetadataPanel
            nodeId={selectedNodeId}
            nodeLabel={selectedNode?.data.label || ''}
            metadata={selectedNode?.data.metadata}
            icon={selectedNode?.data.icon}
            cloud={selectedNode?.data.cloud}
            onUpdateMetadata={handleUpdateMetadata}
            onUpdateIcon={handleUpdateIcon}
            onUpdateCloud={handleUpdateCloud}
          />
        </Panel>
      </ReactFlow>

      {/* Notes Panel */}
      <NotesPanel
        visible={showNotesPanel}
        onClose={() => setShowNotesPanel(false)}
        notes={selectedNode?.data.metadata?.notes || ''}
        onSave={(notes) => {
          if (selectedNodeId) {
            handleUpdateMetadata({
              ...(selectedNode?.data.metadata || {}),
              notes: notes || undefined,
            });
          }
        }}
      />
    </div>
  );
}

export default function MindMapCanvasWrapper(props: MindMapCanvasProps) {
  return (
    <ReactFlowProvider>
      <MindMapCanvas {...props} />
    </ReactFlowProvider>
  );
}
