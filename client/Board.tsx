import { useState } from 'react';
import { Icon } from './Icon';
import type { Room, Signal } from './types';

type T = (key: string, args?: Record<string, string | number>) => string;
export function Board({ room, selected, select, signalKind, sendSignal, list, t, locked }: {
  room: Room; selected: string; select: (id: string) => void; signalKind: Signal['kind'] | null;
  sendSignal: (id: string) => void; list: boolean; t: T; locked: boolean;
}) {
  const [inspected, inspect] = useState<string | null>(null);
  const nodes = room.graph.nodes;
  const legal = room.owner.legalMoves || [];
  const own = room.players.find(p => p.seat === room.owner.seat);
  const name = (id: string) => id.startsWith('B') ? `${id} · ${t(`berth.${id}`)}` : id.startsWith('E') ? `${id} · ${t('game.entry')}` : id;
  const click = (id: string) => {
    inspect(id);
    if (locked) return;
    if (signalKind && (!id.startsWith('E') || id === `E${room.owner.seat}`)) sendSignal(id);
    else if (!signalKind && legal.includes(id)) select(id);
  };
  const position = (id: string) => nodes.find(n => n.id === id)!;
  const title = (id: string) => {
    const occupant = room.players.find(p => p.node === id);
    return `${name(id)}. ${occupant ? `${occupant.seat}${occupant.bot ? ` · ${t('bot.label')}` : ''}` : t('game.empty')}. ${t('game.outgoing')}: ${room.graph.edges.filter(e => e.from === id).map(e => e.to).join(', ') || '—'}`;
  };
  const badges = (id: string) => room.players.filter(p => p.signal?.node === id).map(p => <span className={`signal-badge ${p.signal!.kind.toLowerCase()}`} key={p.seat} title={t(`signal.${p.signal!.kind}`)}>{p.seat} {p.signal!.kind === 'NEED' ? '△' : p.signal!.kind === 'YIELD' ? '○' : '◇'}</span>);
  if (list) return <div className="node-list">
    <div className="list-location"><Icon name="anchor" /><span>{t('room.you')}: <strong>{own?.node || '—'}</strong></span></div>
    {[...nodes].sort((a, b) => {
      const rank = (id: string) => id === `E${room.owner.seat}` ? 0 : id.startsWith('E') ? 1 : id.startsWith('J') ? 2 : 3;
      return rank(a.id) - rank(b.id) || a.id.localeCompare(b.id);
    }).map(node => <div className={`node-row ${selected === node.id ? 'selected' : ''}`} key={node.id}>
      <div><strong>{name(node.id)}</strong><p>{room.players.filter(p => p.node === node.id).map(p => `${p.seat} · ${p.bot ? t('bot.label') : p.name}`).join(', ') || t('game.empty')}</p><small>{t('game.outgoing')}: {room.graph.edges.filter(e => e.from === node.id).map(e => e.to).join(', ') || '—'}</small><div>{badges(node.id)}</div></div>
      {signalKind && (!node.id.startsWith('E') || node.id === `E${room.owner.seat}`) ? <button disabled={locked} className="btn small" onClick={() => click(node.id)}>{t(`signal.${signalKind}`)} · {node.id}</button> : legal.includes(node.id) ? <button disabled={locked} className="btn small" onClick={() => click(node.id)}>{t('game.select', { node: node.id })}</button> : null}
    </div>)}
  </div>;
  return <>
    <div className={`harbor-chart ${signalKind ? 'signal-targeting' : ''}`} style={{ backgroundImage: `url(/assets/maps/${room.mapId}.webp)` }}>
      <div className="chart-topline"><span><span className="live-dot" />{t('game.chart')}</span><span>{t('game.routes')} <Icon name="arrow" size={13} /></span></div>
      <div className="chart-canvas">
        <svg className="waterways" viewBox="0 0 600 470" preserveAspectRatio="none" aria-hidden="true">
          <defs><marker id="direction" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="currentColor" strokeWidth="1.7" /></marker></defs>
          {room.graph.edges.map(({ from, to }) => {
            const a = position(from), b = position(to);
            if (!a || !b) return null;
            const ax = a.x * 600, ay = a.y * 470, bx = b.x * 600, by = b.y * 470;
            const d = Math.hypot(bx - ax, by - ay), ux = (bx - ax) / d, uy = (by - ay) / d;
            const reciprocal = room.graph.edges.some(e => e.from === to && e.to === from);
            const bend = reciprocal ? 28 : 0;
            const sx = ax + ux * 29, sy = ay + uy * 29, ex = bx - ux * 31, ey = by - uy * 31;
            const path = `M${sx},${sy} Q${(ax + bx) / 2 - uy * bend},${(ay + by) / 2 + ux * bend} ${ex},${ey}`;
            return <path key={`${from}-${to}`} d={path} markerEnd="url(#direction)" className={`${from === own?.node && legal.includes(to) ? 'legal-route' : ''} ${from === own?.node && to === selected ? 'chosen-route' : ''}`} />;
          })}
        </svg>
        {nodes.map(node => {
          const occupant = room.players.find(p => p.node === node.id);
          const possible = legal.includes(node.id);
          const signalAllowed = !node.id.startsWith('E') || node.id === `E${room.owner.seat}`;
          return <div className={`chart-node-wrap ${node.type}`} style={{ left: `${node.x * 100}%`, top: `${node.y * 100}%` }} key={node.id}>
            {node.type === 'berth' && <img className="berth-illustration" src={`/assets/berths/${node.id}.webp`} alt="" />}
            <button className={`chart-node ${node.type} ${possible && !locked ? 'legal' : ''} ${selected === node.id ? 'selected' : ''} ${signalKind && signalAllowed && !locked ? 'signal-legal' : ''} ${occupant ? 'occupied' : ''}`} aria-label={title(node.id)} aria-pressed={selected === node.id} onClick={() => click(node.id)}>
              {occupant ? <><img className="boat-image" src={`/assets/ships/${occupant.seat}.webp`} alt="" /><span className={`boat-letter seat-${occupant.seat}`}>{occupant.seat}</span></> : <span>{node.type === 'entry' ? node.id.slice(1) : node.id}</span>}
            </button>
            <span className="node-caption">{node.type === 'berth' ? `${node.id} · ${t(`berth.${node.id}`)}` : occupant ? `${node.id}${occupant.bot ? ` · ${t('bot.label')}` : ''}` : node.type === 'entry' ? node.id : ''}</span>
            <div className="node-signals">{badges(node.id)}</div>
          </div>;
        })}
      </div>
      <div className="chart-footnote"><Icon name="waves" size={17} /><span>{t('signal.disclaimer')}</span></div>
    </div>
    {inspected && <div className="node-inspection"><span>{title(inspected)}{legal.includes(inspected) && room.players.some(p => p.node === inspected) ? ` · ${t('move.occupied')}` : ''}{inspected.startsWith('B') && !room.owner.job?.valid.includes(inspected) ? ` · ${t('move.wrongBerth')}` : ''}</span><button className="icon-btn" onClick={() => inspect(null)} aria-label={t('common.close')}><Icon name="close" size={16} /></button></div>}
  </>;
}
