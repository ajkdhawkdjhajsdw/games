import { mapPreviews } from './maps';
import { useId } from 'react';

export function MapPreview({ mapId }: { mapId: string }) {
  const graph = mapPreviews.find(map => map.mapId === mapId)!;
  const markerId = useId();
  return <svg className="map-topology" viewBox="0 0 600 470" aria-hidden="true">
    <defs><marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10Z" fill="#f7ecd1" /></marker></defs>
    {graph.edges.map(({ from, to }) => {
      const a = graph.nodes.find(node => node.id === from)!;
      const b = graph.nodes.find(node => node.id === to)!;
      const dx = (b.x - a.x) * 600, dy = (b.y - a.y) * 470, length = Math.hypot(dx, dy);
      return <line key={`${from}-${to}`} x1={a.x * 600 + dx / length * 12} y1={a.y * 470 + dy / length * 12} x2={b.x * 600 - dx / length * 16} y2={b.y * 470 - dy / length * 16} stroke="#f7ecd1" strokeWidth="3" markerEnd={`url(#${markerId})`} />;
    })}
    {graph.nodes.map(node => <circle key={node.id} cx={node.x * 600} cy={node.y * 470} r={node.type === 'berth' ? 15 : 11} fill={node.type === 'berth' ? '#e6bd78' : '#f7ecd1'} stroke="#214c50" strokeWidth="4" />)}
  </svg>;
}
