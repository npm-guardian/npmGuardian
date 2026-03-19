"use client";

import { useMemo } from 'react';
import ReactFlow, { Background, Controls, Edge, Node, Position } from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes: Node[] = [
  { id: '1', position: { x: 250, y: 50 }, data: { label: 'express@4.18.2' }, 
    style: { background: '#27272a', color: 'white', border: '1px solid #3f3f46', borderRadius: '8px' },
    sourcePosition: Position.Bottom, targetPosition: Position.Top
  },
  { id: '2', position: { x: 100, y: 150 }, data: { label: 'accepts@1.3.8' },
    style: { background: '#27272a', color: 'white', border: '1px solid #3f3f46', borderRadius: '8px' },
    sourcePosition: Position.Bottom, targetPosition: Position.Top
  },
  { id: '3', position: { x: 400, y: 150 }, data: { label: 'body-parser@1.20.1' },
    style: { background: '#27272a', color: 'white', border: '1px solid #3f3f46', borderRadius: '8px' },
    sourcePosition: Position.Bottom, targetPosition: Position.Top
  },
  { id: '4', position: { x: 400, y: 250 }, data: { label: '🚨 suspicious-utils@1.0.2' },
    style: { background: '#7f1d1d', color: '#fca5a5', border: '2px solid #ef4444', borderRadius: '8px', fontWeight: 'bold' },
    sourcePosition: Position.Bottom, targetPosition: Position.Top
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: false, style: { stroke: '#52525b' } },
  { id: 'e1-3', source: '1', target: '3', animated: false, style: { stroke: '#52525b' } },
  { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#ef4444' } }, // Red animated link
];

export default function DependencyGraph() {
  const nodes = useMemo(() => initialNodes, []);
  const edges = useMemo(() => initialEdges, []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow 
        nodes={nodes} 
        edges={edges}
        fitView
        className="bg-zinc-950"
      >
        <Background color="#3f3f46" gap={16} />
        <Controls className="fill-white bg-zinc-800 border-zinc-700" />
      </ReactFlow>
    </div>
  );
}
