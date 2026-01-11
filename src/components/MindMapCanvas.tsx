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
} from 'reactflow';
import type { Connection, OnConnect, Node } from 'reactflow';
import 'reactflow/dist/style.css';

import MindMapNode from './MindMapNode';
import MetadataPanel from './MetadataPanel';
import type { MindMapNodeData, MindMapTree, NodeMetadata } from '../types';
import { flowToTree, treeToFlow, generateId } from '../utils/mindmapConverter';
import { parseJSON, stringifyJSON, parseFreeMind, toFreeMind, parseOPML, toOPML, parseMarkdown, toMarkdown } from '../utils/formats';

const nodeTypes = {
  mindmap: MindMapNode,
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

  const selectedNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null;

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

  const onConnect: OnConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

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
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, nodes, edges]);

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

  const saveToFile = (format: 'json' | 'freemind' | 'opml' | 'markdown') => {
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

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        onPaneClick={() => setSelectedNodeId(null)}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />

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
            <hr />
            <div>
              <strong>Load From:</strong>
            </div>
            <button onClick={() => loadFromFile('json')}>JSON</button>
            <button onClick={() => loadFromFile('freemind')}>FreeMind (.mm)</button>
            <button onClick={() => loadFromFile('opml')}>OPML</button>
            <button onClick={() => loadFromFile('markdown')}>Markdown</button>
          </div>
        </Panel>

        <Panel position="bottom-left">
          <div style={{ fontSize: '12px', color: '#666' }}>
            <strong>Shortcuts:</strong><br />
            Tab - Create child<br />
            Enter - Create sibling<br />
            Delete - Remove node<br />
            F2 - Edit text<br />
            Space - Toggle collapse
          </div>
        </Panel>

        <Panel position="top-left">
          <MetadataPanel
            nodeId={selectedNodeId}
            nodeLabel={selectedNode?.data.label || ''}
            metadata={selectedNode?.data.metadata}
            onUpdateMetadata={handleUpdateMetadata}
          />
        </Panel>
      </ReactFlow>
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
