import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiError } from './api';
import { Board } from './Board';
import { Icon } from './Icon';
import { translate } from './i18n';
import { maps } from './maps';
import { MapPreview } from './MapPreview';
import { telegramApp } from './telegram';
import type { Locale, Room, Signal } from './types';

type Settings = { locale: Locale; sound: boolean; music: boolean; ambience: boolean; reducedMotion: boolean; list: boolean; largeText: boolean };
type Session = { user: { id: string; name: string } | null; devAuthEnabled?: boolean };
const initialSettings = (): Settings => {
  const defaults: Settings = { locale: navigator.language.startsWith('ru') ? 'ru' : 'en', sound: false, music: false, ambience: false, reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches, list: false, largeText: false };
  try { return { ...defaults, ...JSON.parse(localStorage.getItem('qh-settings') || '{}') }; } catch { return defaults; }
};

export function App() {
  const [settings, setSettings] = useState(initialSettings);
  const [path, setPath] = useState(location.pathname);
  const [session, setSession] = useState<Session | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [mapId, setMapId] = useState('M01');
  const [bots, setBots] = useState(1);
  const [capacity, setCapacity] = useState(3);
  const [untimed, setUntimed] = useState(false);
  const [allMaps, setAllMaps] = useState(false);
  const [selected, setSelected] = useState('WAIT');
  const [signalKind, setSignalKind] = useState<Signal['kind'] | null>(null);
  const [invite, setInvite] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [offline, setOffline] = useState(false);
  const [modal, setModal] = useState<'leave' | 'report' | 'privacy' | 'licenses' | 'rules' | null>(null);
  const [reportCategory, setReportCategory] = useState('technical');
  const [lessonAnswer, setLessonAnswer] = useState<boolean | null>(null);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [clock, setClock] = useState(Date.now());
  const [small, setSmall] = useState(innerWidth < 360);
  const received = useRef({ server: Date.now(), local: performance.now() });
  const roomRef = useRef(room);
  const sequence = useRef(0);
  const acknowledged = useRef('');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const t = useCallback((key: string, args?: Record<string, string | number>) => translate(settings.locale, key, args), [settings.locale]);
  const currentMap = maps.find(m => m.id === (room && path.startsWith('/rooms/') ? room.mapId : mapId)) || maps[0];
  const isRoom = path.startsWith('/rooms/');
  const live = isRoom && room && !['LOBBY', 'ENDED', 'CLOSED', 'ABORTED'].includes(room.phase);
  const locale = settings.locale;

  function navigate(next: string) {
    history.pushState({}, '', next);
    setPath(next.split('?')[0]);
    setError(''); setNotice(''); setModal(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => setSettings(old => ({ ...old, [key]: value }));
  const explain = useCallback((e: unknown) => {
    const code = e instanceof ApiError ? e.code : 'NETWORK';
    const keys: Record<string, string> = { AUTH_REQUIRED: 'auth.expired', ROOM_UNAVAILABLE: 'room.unavailable', NOT_MEMBER: 'room.unavailable', INVITE_EXPIRED: 'room.expired', ROOM_FULL: 'room.full', ROOM_IN_PROGRESS: 'room.inProgress', ROUND_CLOSED: 'move.closed', PHASE_CLOSED: 'move.closed', STALE_ROUND: 'move.closed', ALREADY_COMMITTED: 'move.committed', STALE_CONTROL: 'network.otherTab', INVALID_DESTINATION: 'move.notAdjacent', NETWORK: 'network.offline', SERVICE_RECOVERING: 'network.recovery' };
    setError(t(keys[code] || 'error.generic'));
  }, [t]);
  const acceptRoom = useCallback((next: Room) => {
    const old = roomRef.current;
    if (old && old.id === next.id && old.scenarioId === next.scenarioId && next.revision < old.revision) return;
    if (!old || old.scenarioId !== next.scenarioId || old.round !== next.round) {
      setSelected(next.owner?.destination || 'WAIT');
      setSignalKind(null); sequence.current = next.owner?.seq || 0;
    }
    sequence.current = Math.max(sequence.current, next.owner?.seq || 0);
    received.current = { server: next.serverNow || Date.now(), local: performance.now() };
    roomRef.current = next; setRoom(next); setOffline(false);
  }, []);

  useEffect(() => {
    localStorage.setItem('qh-settings', JSON.stringify(settings));
    document.documentElement.lang = settings.locale;
    document.documentElement.classList.toggle('reduced-motion', settings.reducedMotion);
    document.documentElement.classList.toggle('large-text', settings.largeText);
  }, [settings]);
  useEffect(() => {
    const pop = () => { setPath(location.pathname); setModal(null); };
    const resize = () => setSmall(innerWidth < 360);
    window.addEventListener('popstate', pop); window.addEventListener('resize', resize);
    const timer = setInterval(() => setClock(received.current.server + performance.now() - received.current.local), 200);
    return () => { window.removeEventListener('popstate', pop); window.removeEventListener('resize', resize); clearInterval(timer); };
  }, []);
  useEffect(() => {
    const tg = telegramApp();
    tg?.ready(); tg?.expand();
    api<Session>('/session').then(async current => {
      if (!current.user && tg?.initData) return api<Session>('/auth/telegram', { initData: tg.initData });
      return current;
    }).then(setSession).catch(() => setSession({ user: null }));
  }, []);
  useEffect(() => {
    if (!isRoom || !session?.user) return;
    const id = path.split('/')[2];
    let cancelled = false, timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try { const response = await api<{ room: Room }>(`/rooms/${id}`); if (!cancelled) acceptRoom(response.room); }
      catch (e) { if (!cancelled) { setOffline(true); explain(e); } }
      if (!cancelled) timer = setTimeout(poll, document.hidden ? 4000 : 800);
    };
    void poll();
    const resume = () => { if (!document.hidden) { clearTimeout(timer); void poll(); } };
    document.addEventListener('visibilitychange', resume);
    return () => { cancelled = true; clearTimeout(timer); document.removeEventListener('visibilitychange', resume); };
  }, [isRoom, path, session?.user, acceptRoom, explain]);
  useEffect(() => {
    if (path === '/mastery' && session?.user) api<Record<string, unknown>>('/profile').then(setProfile).catch(explain);
  }, [path, session?.user, explain]);
  useEffect(() => {
    if (modal && dialogRef.current && !dialogRef.current.open) dialogRef.current.showModal();
    if (!modal && dialogRef.current?.open) dialogRef.current.close();
  }, [modal]);

  async function ensureSession() {
    if (session?.user) return true;
    const current = session || await api<Session>('/session');
    const tg = telegramApp();
    if (tg?.initData) { setSession(await api<Session>('/auth/telegram', { initData: tg.initData })); return true; }
    if (current.devAuthEnabled) { setSession(await api<Session>('/auth/dev', {})); return true; }
    setError(t('launch.telegram')); return false;
  }
  function sound(cue: string) {
    if (!settings.sound || document.hidden) return;
    const audio = new Audio(`/assets/audio/${cue}.mp3`);
    audio.volume = 0.4;
    void audio.play().catch(() => setNotice(t('settings.audioUnavailable')));
  }
  useEffect(() => {
    const tracks = [
      ...(settings.music ? [new Audio('/assets/audio/lantern-loop.mp3')] : []),
      ...(settings.ambience ? [new Audio('/assets/audio/harbor-water.mp3')] : []),
    ];
    for (const track of tracks) { track.loop = true; track.volume = 0.15; }
    const resume = () => {
      for (const track of tracks) {
        if (document.hidden) track.pause();
        else void track.play().catch(() => {});
      }
    };
    resume();
    document.addEventListener('visibilitychange', resume);
    document.addEventListener('pointerdown', resume);
    document.addEventListener('keydown', resume);
    return () => {
      tracks.forEach(track => { track.pause(); track.removeAttribute('src'); track.load(); });
      document.removeEventListener('visibilitychange', resume);
      document.removeEventListener('pointerdown', resume);
      document.removeEventListener('keydown', resume);
    };
  }, [settings.music, settings.ambience]);
  const audioState = useRef<Room | null>(null);
  useEffect(() => {
    const old = audioState.current;
    audioState.current = room;
    if (!room || !old || room.scenarioId !== old.scenarioId) return;
    if (room.phase === 'ENDED' && old.phase !== 'ENDED') sound(room.result?.outcome === 'SUCCESS' ? 'shift-success' : 'shift-incomplete');
    else if (room.congestion > old.congestion) sound('congestion');
    else if (room.deliveries > old.deliveries) sound('delivery');
    else if (room.phase === 'PLANNING' && old.phase !== 'PLANNING') sound('round-open');
  }, [room]);
  async function chooseMove(destination: string) {
    const response = await command('move.choose', { destination });
    if (response) { setSelected(response.room.owner.destination || 'WAIT'); sound(destination === 'WAIT' ? 'select-wait' : 'select-node'); }
  }
  async function command(type: string, payload: Record<string, unknown> = {}) {
    const current = roomRef.current;
    if (!current) return;
    setBusy(true); setError('');
    try {
      const aliases: Record<string, string> = { 'start.ack': 'ack', 'room.rotateInvite': 'invite', 'room.rematch': 'rematch', 'room.botConsent': 'allowBot' };
      if (type === 'room.botConsent') payload = { allowBot: payload.enabled };
      if (type === 'room.rematch') payload = { nextHarbor: payload.nextMap === true };
      const response = await api<{ room: Room; inviteToken?: string }>(`/rooms/${current.id}/commands`, {
        protocolVersion: 1, commandId: crypto.randomUUID(), type: aliases[type] || type, scenarioId: current.scenarioId,
        round: current.round, controlEpoch: current.owner.controlEpoch, seatCommandSeq: ++sequence.current,
        revision: current.revision, configVersion: current.configVersion, ...payload,
      });
      if (response.room) acceptRoom(response.room);
      if (response.inviteToken) setInvite(makeInvite(response.inviteToken));
      if (type === 'move.commit') sound('commit');
      return response;
    } catch (e) { explain(e); } finally { setBusy(false); }
  }
  useEffect(() => {
    if (room?.phase === 'STARTING' && room.scenarioId && acknowledged.current !== room.scenarioId) {
      acknowledged.current = room.scenarioId;
      void command('start.ack');
    } else if (room?.phase === 'LOBBY') acknowledged.current = '';
  }, [room?.phase, room?.scenarioId]);
  function makeInvite(token: string) { return `${location.origin}/join?token=${encodeURIComponent(token)}`; }
  async function createRoom(practice: boolean, learning = false) {
    setBusy(true); setError('');
    try {
      if (!await ensureSession()) return;
      const response = await api<{ room: Room; inviteToken?: string }>('/rooms', { mapId, capacity: practice ? (learning || untimed ? 2 : bots + 1) : capacity, bots: practice ? (learning || untimed ? 1 : bots) : 0, untimed: practice && (learning || untimed) });
      acceptRoom(response.room);
      if (response.inviteToken) setInvite(makeInvite(response.inviteToken));
      navigate(`/rooms/${response.room.id}`);
    } catch (e) { explain(e); } finally { setBusy(false); }
  }
  async function joinRoom() {
    setBusy(true); setError('');
    try {
      if (!await ensureSession()) return;
      const token = new URLSearchParams(location.search).get('token');
      const response = await api<{ room: Room }>('/join', { token });
      acceptRoom(response.room); navigate(`/rooms/${response.room.id}`);
    } catch (e) { explain(e); } finally { setBusy(false); }
  }
  async function copy(text: string, success: string) {
    try { await navigator.clipboard.writeText(text); setNotice(t(success)); }
    catch { setNotice(text); }
  }
  const mark = <img src="/assets/brand/harbor-mark.png" alt="" className="brand-mark" />;
  const pill = (icon: string, text: string) => <span className="meta-item"><Icon name={icon} size={17} />{t(text)}</span>;
  const mapCards = (selection: boolean, limit = 10) => <div className={`map-grid ${selection ? 'selectable' : ''}`}>
    {maps.slice(0, limit).map((map, i) => <button className={`map-card ${selection && mapId === map.id ? 'active' : ''}`} key={map.id} onClick={() => { setMapId(map.id); if (!selection) navigate('/practice'); }} aria-pressed={selection ? mapId === map.id : undefined}>
      <div className="map-picture" style={{ backgroundImage: `url(/assets/maps/${map.id}.webp)` }}><MapPreview mapId={map.id} /><span className="map-number">{String(i + 1).padStart(2, '0')}</span>{selection && mapId === map.id && <span className="map-check"><Icon name="check" size={16} /></span>}</div>
      <div className="map-card-copy"><h3>{map.title[locale]}</h3><span>{map.hint[locale]}</span>{!selection && <Icon name="arrow" size={18} />}</div>
    </button>)}
  </div>;
  const howSteps = <div className="how-grid">{[['card', 'parcel'], ['signal', 'flag'], ['move', 'waves']].map(([key, icon], i) => <article className="how-item" key={key}><div className="how-icon"><Icon name={icon} size={26} /></div><span className="step-number">0{i + 1}</span><h3>{t(`how.${key}`)}</h3><p>{t(`how.${key}Text`)}</p></article>)}</div>;
  const errorBanner = error && <div className="notice error" role="alert"><Icon name="help" /><span>{error}</span><button className="icon-btn" onClick={() => setError('')} aria-label={t('common.close')}><Icon name="close" size={16} /></button></div>;
  const ownSignal = room?.players.find(p => p.seat === room.owner.seat)?.signal;
  const countdown = room?.deadlineAt ? Math.ceil(Math.max(0, room.deadlineAt - clock) / 1000) : null;
  const locked = !room || room.phase !== 'PLANNING' || room.owner.committed || !room.owner.canControl || offline || busy || (!room.untimed && countdown === 0);
  const roster = room && <div className="crew-roster">{room.players.map(player => <div className="crew-member" key={player.seat}><span className={`seat-avatar seat-${player.seat}`}>{player.seat}</span><div><strong>{player.seat === room.owner.seat ? t('room.you') : player.bot ? `${t('bot.label')} ${player.seat}` : player.name}</strong><small>{player.bot ? t('bot.label') : player.seat === room.hostSeat ? t('room.host') : t('mode.humanOnly')}</small></div><span className={`crew-status ${player.committed || player.ready ? 'is-ready' : ''}`}>{player.committed || player.ready ? <Icon name="check" size={17} /> : <span className={`status-dot ${player.connected ? 'connected' : ''}`} />}</span></div>)}</div>;

  return <div className="app-shell">
    <header className={`site-header ${live ? 'compact-header' : ''}`}>
      <button className="brand" onClick={() => live ? setModal('leave') : navigate('/')} aria-label={t('brand.title')}>{mark}<span>{t('brand.title')}<small>{locale === 'en' ? 'A LITTLE COOPERATION GOES A LONG WAY' : 'ВМЕСТЕ ПУТЬ СТАНОВИТСЯ ЛЕГЧЕ'}</small></span></button>
      <nav className="desktop-nav" aria-label={t('nav.harbor')}><button className={path === '/' ? 'active' : ''} onClick={() => live ? setModal('leave') : navigate('/')}>{t('nav.harbor')}</button><button className={path === '/learn' ? 'active' : ''} onClick={() => live ? setModal('rules') : navigate('/learn')}>{t('nav.learn')}</button><button className={path === '/mastery' ? 'active' : ''} onClick={() => live ? setModal('rules') : navigate('/mastery')}>{t('nav.logbook')}</button></nav>
      <div className="header-tools"><button className="icon-btn sound-toggle" onClick={() => updateSetting('sound', !settings.sound)} aria-label={t(settings.sound ? 'settings.soundOn' : 'settings.soundOff')} title={t(settings.sound ? 'settings.soundOn' : 'settings.soundOff')}><Icon name={settings.sound ? 'volume' : 'mute'} /></button><button className="language-btn" onClick={() => updateSetting('locale', locale === 'en' ? 'ru' : 'en')} aria-label={t('settings.language')}>{locale.toUpperCase()}<span>⌄</span></button><button className="icon-btn" onClick={() => live ? setModal('rules') : navigate('/settings')} aria-label={t(live ? 'nav.learn' : 'settings.title')}><Icon name={live ? 'help' : 'settings'} /></button></div>
    </header>

    <main id="main" className={isRoom ? 'game-main' : ''}>
      {!isRoom && errorBanner}
      {notice && <div className="notice success" role="status"><Icon name="check" size={18} /><span>{notice}</span><button className="icon-btn" onClick={() => setNotice('')} aria-label={t('common.close')}><Icon name="close" size={16} /></button></div>}

      {path === '/' && <>
        <section className="hero">
          <div className="hero-copy"><span className="eyebrow"><span className="tiny-rule" />{t('hero.eyebrow')}</span><h1>{t('hero.title')}<br /><em>{t('hero.title2')}</em></h1><p>{t('hero.description')}</p><div className="hero-actions"><button className="btn primary" onClick={() => navigate('/friends')}><Icon name="people" />{t('home.friends')}<Icon name="arrow" /></button><button className="btn ghost" onClick={() => navigate('/practice')}>{t('home.practice')}<Icon name="arrow" size={17} /></button></div><div className="hero-footnote"><Icon name="lock" size={14} />{t('hero.footnote')}</div></div>
          <div className="hero-art"><img src="/assets/harbor-key-art.webp" alt={t('brand.tagline')} fetchPriority="high" /><div className="art-caption"><span className="caption-line" /><Icon name="anchor" size={17} /><span>{t('hero.stamp')}</span><span className="caption-line" /></div><div className="art-note"><span className="live-dot" />{t('berth.B1')} · {t('berth.B2')} · {t('berth.B3')}</div></div>
        </section>
        <div className="hero-meta">{pill('people', 'meta.players')}<i />{pill('clock', 'meta.time')}<i />{pill('lock', 'meta.private')}<button onClick={() => navigate('/learn')}>{t('home.learn')}<Icon name="arrow" size={16} /></button></div>
        <section className="home-section"><div className="section-heading"><div><span className="eyebrow dark">{locale === 'en' ? 'A PLACE FOR EVERY CREW' : 'МЕСТО ДЛЯ КАЖДОЙ КОМАНДЫ'}</span><h2>{t('home.harbors')}</h2><p>{t('home.harborsDescription')}</p></div><button className="text-link" onClick={() => setAllMaps(!allMaps)}>{t(allMaps ? 'home.fewerMaps' : 'home.allMaps')}<Icon name="arrow" size={18} /></button></div>{mapCards(false, allMaps ? 10 : 3)}</section>
        <section className="how-section"><div className="section-heading"><div><span className="eyebrow dark">{locale === 'en' ? 'THE ART OF A LITTLE UNDERSTANDING' : 'ИСКУССТВО ПОНИМАТЬ ДРУГ ДРУГА'}</span><h2>{t('home.how')}</h2><p>{t('home.howDescription')}</p></div><button className="round-link" onClick={() => navigate('/learn')} aria-label={t('home.learn')}><Icon name="arrow" /></button></div>{howSteps}</section>
      </>}

      {(path === '/practice' || path === '/friends') && <section className="setup-page page-enter">
        <button className="back-link" onClick={() => navigate('/')}><Icon name="back" size={17} />{t('common.back')}</button>
        <div className="page-heading"><span className="eyebrow dark">{t(path === '/practice' ? 'mode.practice' : 'meta.private')}</span><h1>{t(path === '/practice' ? 'practice.title' : 'friends.title')}</h1><p>{t(path === '/practice' ? 'practice.description' : 'friends.description')}</p></div>
        <div className="setup-layout"><div className="setup-map"><h2>{t('map.choose')}</h2>{mapCards(true)}</div><aside className="setup-options paper-card">
          <img className="setup-emblem" src="/assets/brand/harbor-mark.png" alt="" />
          <h2>{currentMap.title[locale]}</h2><p className="map-hint">{currentMap.hint[locale]}</p>
          {path === '/practice' ? <><label className="field-label">{t('practice.crew')}</label><div className="choice-stack">{[1, 2, 3].map(n => <button key={n} className={`choice ${bots === n ? 'chosen' : ''}`} disabled={untimed && n !== 1} onClick={() => setBots(n)}><Icon name="people" size={18} /><span>{t(`practice.${['one', 'two', 'three'][n - 1]}`)}</span><span className="radio-dot" /></button>)}</div><label className="field-label">{t('practice.timing')}</label><button className={`choice detailed ${!untimed ? 'chosen' : ''}`} onClick={() => setUntimed(false)}><Icon name="clock" /><span><strong>{t('practice.standard')}</strong><small>{t('practice.standardText')}</small></span><span className="radio-dot" /></button><button className={`choice detailed ${untimed ? 'chosen' : ''}`} onClick={() => { setUntimed(true); setBots(1); }}><Icon name="waves" /><span><strong>{t('mode.untimed')}</strong><small>{t('practice.untimedText')}</small></span><span className="radio-dot" /></button></> : <><label className="field-label">{t('friends.capacity')}</label><div className="segmented">{[2, 3, 4].map(n => <button key={n} className={capacity === n ? 'active' : ''} onClick={() => setCapacity(n)}><Icon name="people" size={17} />{n}</button>)}</div><p className="muted small-copy">{t('room.shareText')}</p></>}
          <button className="btn primary full-width" disabled={busy} onClick={() => createRoom(path === '/practice')}>{busy ? t('loading.harbor') : t(path === '/practice' ? 'practice.start' : 'friends.create')}<Icon name="arrow" /></button><p className="option-footnote"><Icon name="lock" size={13} />{t('shop.unavailable')}</p>
        </aside></div>
      </section>}

      {path === '/join' && <section className="center-page paper-card"><img className="setup-emblem" src="/assets/brand/harbor-mark.png" alt="" /><span className="eyebrow dark">{t('meta.private')}</span><h1>{t('room.title')}</h1><p>{t('room.shareText')}</p><button className="btn primary" disabled={busy} onClick={joinRoom}>{busy ? t('common.loading') : t('home.friends')}<Icon name="arrow" /></button><button className="btn text" onClick={() => navigate('/practice')}>{t('home.practice')}</button></section>}

      {isRoom && !room && <div className="center-page"><Icon name="anchor" size={45} /><h2>{t('loading.harbor')}</h2>{errorBanner}</div>}
      {isRoom && room && <>
        <div className="game-heading"><button className="back-link" onClick={() => setModal('leave')}><Icon name="back" size={17} />{t('nav.harbor')}</button><div className="mode-badge"><span className="live-dot" />{t(room.untimed ? 'mode.untimed' : room.mode === 'HUMAN_ONLY' ? 'mode.humanOnly' : 'mode.mixed')}</div><button className="text-link" onClick={() => setModal('report')}><Icon name="flag" size={15} />{t('safety.report')}</button></div>
        {errorBanner}
        {room.phase === 'LOBBY' && <section className="lobby-layout page-enter"><div className="lobby-map"><div className="page-heading"><span className="eyebrow dark">{room.mapId} · {t('room.waiting')}</span><h1>{currentMap.title[locale]}</h1><p>{currentMap.hint[locale]}</p></div><div className="lobby-art" style={{ backgroundImage: `url(/assets/harbor-key-art.webp)` }}><div className="lobby-art-label"><Icon name="anchor" />{t('room.readyText')}</div></div><div className="room-goal"><Icon name="parcel" /><span>{t('help.goal')}</span></div></div><aside className="paper-card lobby-panel"><span className="eyebrow dark">{t('room.title')}</span><h2>{t('friends.title')}</h2>{roster}{Array.from({ length: Math.max(0, room.capacity - room.players.length) }, (_, i) => <div className="empty-seat" key={i}><span>+</span>{t('room.empty')}</div>)}
          {!room.players.some(p => p.bot) && <div className="invite-box"><p>{t('room.shareText')}</p>{invite ? <><input readOnly value={invite} aria-label={t('room.copy')} /><button className="btn secondary full-width" onClick={() => copy(invite, 'room.copied')}><Icon name="copy" size={16} />{t('room.copy')}</button></> : <button className="btn secondary full-width" onClick={() => command('room.rotateInvite')} disabled={busy || room.owner.seat !== room.hostSeat}>{t('room.rotate')}</button>}{invite && room.owner.seat === room.hostSeat && <button className="text-link" disabled={busy} onClick={() => command('room.rotateInvite')}>{t('room.rotate')}</button>}</div>}
          <label className="toggle-line compact"><span>{t('bot.consent')}</span><input type="checkbox" checked={room.owner.botConsent || false} onChange={e => command('room.botConsent', { enabled: e.target.checked })} /></label>
          <button className={`btn ${room.players.find(p => p.seat === room.owner.seat)?.ready ? 'secondary' : 'primary'} full-width`} disabled={busy} onClick={() => command('room.ready', { ready: !room.players.find(p => p.seat === room.owner.seat)?.ready })}><Icon name="check" />{t(room.players.find(p => p.seat === room.owner.seat)?.ready ? 'room.notReady' : 'room.ready')}</button>
          {room.owner.seat === room.hostSeat && <button className="btn primary full-width" disabled={busy || room.players.length < 2 || room.players.some(p => !p.bot && !p.ready)} onClick={() => command('room.start')}>{t('room.start')}<Icon name="arrow" /></button>}
          <p className="option-footnote">{t(room.players.length < 2 ? 'room.waitingPlayer' : 'room.waitingReady')}</p>
        </aside></section>}

        {!['LOBBY', 'ENDED', 'CLOSED', 'ABORTED'].includes(room.phase) && <section className="play-section page-enter">
          <div className="play-title"><div><span className="eyebrow dark">{room.mapId} · {t('game.crew')}</span><h1>{currentMap.title[locale]}</h1></div><div className="view-switch"><button className={!settings.list && !small && !settings.largeText ? 'active' : ''} onClick={() => updateSetting('list', false)} aria-label={t('settings.chart')}><Icon name="chart" /></button><button className={settings.list || small || settings.largeText ? 'active' : ''} onClick={() => updateSetting('list', true)} aria-label={t('settings.nodeList')}><Icon name="list" /></button></div></div>
          <div className="status-rail"><div><span>{t('game.round')}</span><strong>{room.round || 1}<small>/ 8</small></strong></div><div><span><Icon name="parcel" size={14} />{t('game.deliveries')}</span><strong>{room.deliveries}<small>/ 6</small></strong><div className="counter-pips">{Array.from({ length: 6 }, (_, i) => <i className={i < room.deliveries ? 'filled' : ''} key={i} />)}</div></div><div><span><Icon name="waves" size={14} />{t('game.congestion')}</span><strong>{room.congestion}<small>/ 5</small></strong><div className="counter-pips congestion">{Array.from({ length: 5 }, (_, i) => <i className={i < room.congestion ? 'filled' : ''} key={i} />)}</div></div><div className={`timer ${countdown !== null && countdown <= 5 ? 'low' : ''}`} role="timer" aria-label={room.untimed ? t('game.untimed') : countdown === null ? t('room.starting') : t('hud.seconds', { count: countdown })}><Icon name="clock" size={22} /><div><strong>{room.untimed ? '∞' : countdown === null ? '—' : `${countdown}s`}</strong><span>{t(room.untimed ? 'game.untimed' : 'game.time')}</span></div></div></div>
          {room.phase === 'STARTING' && <div className="phase-banner" role="status">{t('room.starting')}</div>}
          {['RESOLVING', 'INTERMISSION'].includes(room.phase) && <div className="phase-banner" role="status">{t('round.resolving')} · {t('hud.deliveries', { count: room.deliveries, target: 6 })}</div>}
          <div className="game-grid"><div className="board-column"><Board room={room} selected={selected} select={id => { void chooseMove(id); }} signalKind={signalKind} sendSignal={id => { void command('signal.set', { signal: { kind: signalKind, node: id } }).then(result => { if (result) { sound(`signal-${signalKind?.toLowerCase()}`); setSignalKind(null); } }); }} list={settings.list || small || settings.largeText} t={t} locked={locked} /><div className="board-roster">{roster}</div><div className="map-note"><Icon name="help" size={19} /><p><strong>{t('map.hint')}</strong>{currentMap.hint[locale]}</p></div></div>
            <aside className="controls-column"><div className="private-card"><div className="private-label"><span><Icon name="lock" size={13} />{t('job.private')}</span><span className={`seat-avatar seat-${room.owner.seat}`}>{room.owner.seat}</span></div><div className="parcel-heading"><div><span className="eyebrow dark">{t('game.parcel')}</span><h2>{t('job.valid')}</h2></div><img src={`/assets/cargo/${room.owner.job?.cargo || 'tea'}.webp`} alt="" /></div><div className="destination-pair">{room.owner.job?.valid.map((id, i) => <div key={id} className={`destination ${room.owner.job?.preferred === id ? 'preferred' : ''}`}><span className="destination-id">{id}</span><strong>{t(`berth.${id}`)}</strong>{room.owner.job?.preferred === id ? <span className="bonus"><Icon name="star" size={13} />+5</span> : <Icon name="check" size={15} />}{i === 0 && <span className="or-divider">{t('game.or')}</span>}</div>)}</div><p>{t('job.optionalBonus')}</p></div>
              <div className="signal-panel"><div className="panel-label"><h3>{t('game.signal')}</h3><span>01</span></div><div className="signal-buttons">{(['NEED', 'YIELD', 'READY'] as const).map(kind => <button className={signalKind === kind ? 'active' : ''} disabled={locked} onClick={() => setSignalKind(signalKind === kind ? null : kind)} key={kind} title={t(`signal.${kind}`)}><span className={`signal-shape ${kind.toLowerCase()}`} />{locale === 'en' ? kind === 'NEED' ? 'Need' : kind === 'YIELD' ? 'Yield' : 'Ready' : kind === 'NEED' ? 'Нужно' : kind === 'YIELD' ? 'Уступлю' : 'Готовы'}</button>)}</div><p className="signal-explanation">{signalKind ? t('signal.chooseNode', { signal: t(`signal.${signalKind}`) }) : ownSignal ? `${t(`signal.${ownSignal.kind}`)} · ${ownSignal.node}` : t('signal.disclaimer')}</p>{ownSignal && !locked && <button className="text-link" onClick={() => command('signal.set', { signal: null })}>{t('signal.clear')}</button>}</div>
              <div className="move-panel"><div className="panel-label"><h3>{t('game.yourRoute')}</h3><Icon name="lock" size={15} /></div><div className="selected-move"><Icon name={selected === 'WAIT' ? 'anchor' : 'arrow'} size={22} /><span>{selected === 'WAIT' ? t('move.waitSelected') : t('move.selected', { node: selected })}</span>{selected !== 'WAIT' && !locked && <button className="text-link" onClick={() => { void chooseMove('WAIT'); }}>{t('move.wait')}</button>}</div><p className="muted small-copy">{selected === 'WAIT' ? t('game.waitHelp') : t('help.private')}</p></div>
              {!room.owner.canControl && <button className="btn secondary full-width" disabled={busy} onClick={() => command('control.reclaim')}>{t('bot.reclaim')}</button>}
              <div className="commit-area"><button className={`btn primary full-width ${room.owner.committed ? 'committed' : ''}`} disabled={locked} onClick={() => command('move.commit', { destination: selected, signal: ownSignal || null })}><Icon name={room.owner.committed ? 'check' : 'anchor'} />{busy ? t('move.sending') : room.owner.committed ? t('move.committed') : t(selected === 'WAIT' ? 'move.commitWait' : 'move.commit')}</button><span className="commit-note"><span className={`status-dot ${offline ? '' : 'connected'}`} />{t(offline ? 'network.offline' : room.owner.committed ? 'move.committed' : 'home.premise')}</span></div>
            </aside></div>
          <div className="sr-only" aria-live="polite">{t('hud.round', { round: room.round, limit: 8 })}. {t('hud.deliveries', { count: room.deliveries, target: 6 })}. {t('hud.congestion', { count: room.congestion, limit: 5 })}.</div>
        </section>}

        {['ENDED', 'CLOSED', 'ABORTED'].includes(room.phase) && <section className="result-page page-enter"><div className="result-art"><img src="/assets/harbor-key-art.webp" alt="" /><div className="result-medallion"><Icon name={room.result?.outcome === 'SUCCESS' ? 'check' : 'anchor'} size={36} /></div></div><div className="result-copy"><span className="eyebrow dark">{currentMap.title[locale]} · {t('room.title')}</span><h1>{t(room.phase !== 'ENDED' ? 'result.notCompleted' : room.result?.outcome === 'SUCCESS' ? 'result.success' : room.result?.reason === 'CONGESTION_LIMIT' ? 'result.congestion' : 'result.roundLimit')}</h1><p>{room.result && room.result.congestion >= 5 && room.result.deliveries >= 6 ? t('result.precedence') : t('home.howDescription')}</p>{room.result && <><div className="team-score"><span>{t('result.score')}</span><strong>{room.result.score}</strong><span>{t(room.untimed ? 'mode.unranked' : room.mode === 'HUMAN_ONLY' ? 'mode.humanOnly' : 'mode.mixed')}</span></div><div className="score-breakdown"><div><span>{t('result.deliveryPoints')}</span><strong>{room.result.deliveries} × 20 <b>{room.result.deliveries * 20}</b></strong></div><div><span>{t('result.preferencePoints')}</span><strong>{room.result.preferredDeliveries} × 5 <b>{room.result.preferredDeliveries * 5}</b></strong></div><div><span>{t('result.congestionDeduction')}</span><strong>{room.result.congestion} × −4 <b>−{room.result.congestion * 4}</b></strong></div></div></>}
          {room.history?.length > 0 && <details className="timeline"><summary>{t('result.timeline')}</summary>{room.history.map(h => <div key={h.round}><span>{t('hud.round', { round: h.round, limit: 8 })}</span><span>{t('hud.deliveries', { count: h.deliveries, target: 6 })} · {t('hud.congestion', { count: h.congestion, limit: 5 })}</span>{h.conflicts?.map(n => <small key={n}>{t('round.contested', { node: n })}</small>)}</div>)}</details>}
          <div className="result-actions"><button className="btn primary" disabled={busy} onClick={() => command('room.rematch')}>{t('result.rematch')}<Icon name="arrow" /></button><button className="btn secondary" disabled={busy} onClick={() => command('room.rematch', { nextMap: true })}>{t('result.nextMap')}</button></div>{room.result && <button className="text-link" onClick={() => copy(`${t('brand.title')} · ${currentMap.title[locale]}\n${t('result.score')}: ${room.result!.score}\n${t('hud.deliveries', { count: room.result!.deliveries, target: 6 })} · ${t('hud.congestion', { count: room.result!.congestion, limit: 5 })}\n${t(room.untimed ? 'mode.unranked' : room.mode === 'HUMAN_ONLY' ? 'mode.humanOnly' : 'mode.mixed')}`, 'result.shared')}><Icon name="copy" size={16} />{t('result.share')}</button>}<button className="btn text" onClick={() => navigate('/')}>{t('result.back')}</button>
        </div></section>}
      </>}

      {path === '/learn' && <section className="learn-page page-enter"><button className="back-link" onClick={() => navigate('/')}><Icon name="back" size={17} />{t('common.back')}</button><div className="page-heading"><span className="eyebrow dark">{t('home.learn')}</span><h1>{t('learn.title')}</h1><p>{t('help.goal')}</p></div>{howSteps}<div className="lesson-grid"><article className="paper-card"><span className="eyebrow dark">{locale === 'en' ? 'THE WATER MOVES AT ONCE' : 'ВСЕ ДВИЖУТСЯ ОДНОВРЕМЕННО'}</span><h2>{t('home.how')}</h2><p>{t('help.conflict')}</p><div className="rule-diagram"><span className="seat-avatar seat-A">A</span><Icon name="arrow" /><span className="diagram-node">J1</span><Icon name="back" /><span className="seat-avatar seat-B">B</span></div><p className="rule-caption">{t('round.contested', { node: 'J1' })} · +1</p><p>{t('help.private')}</p></article><article className="paper-card comprehension"><Icon name="help" size={30} /><h2>{t('learn.question')}</h2><div className="choice-stack"><button className={`choice ${lessonAnswer === false ? 'chosen' : ''}`} onClick={() => setLessonAnswer(false)}>{t('learn.yes')}</button><button className={`choice ${lessonAnswer === true ? 'chosen' : ''}`} onClick={() => setLessonAnswer(true)}>{t('learn.no')}</button></div>{lessonAnswer !== null && <p role="status" className="answer-feedback">{t(lessonAnswer ? 'learn.correct' : 'learn.wrong')}</p>}<button className="btn primary full-width" disabled={busy} onClick={() => createRoom(true, true)}>{busy ? t('common.loading') : t('learn.start')}<Icon name="arrow" /></button><p className="option-footnote">{t('practice.untimedText')}</p></article></div></section>}

      {path === '/settings' && <section className="settings-page page-enter"><button className="back-link" onClick={() => navigate('/')}><Icon name="back" size={17} />{t('common.back')}</button><div className="page-heading"><span className="eyebrow dark">{t('brand.title')}</span><h1>{t('settings.title')}</h1><p>{t('settings.description')}</p></div><div className="settings-grid"><article className="paper-card"><h2><Icon name="settings" />{t('settings.display')}</h2><label className="setting-row"><span>{t('settings.language')}</span><select value={locale} onChange={e => updateSetting('locale', e.target.value as Locale)}><option value="en">English</option><option value="ru">Русский</option></select></label>{(['reducedMotion', 'list', 'largeText'] as const).map(key => <label className="toggle-line" key={key}><span>{t(`settings.${key === 'list' ? 'nodeList' : key}`)}</span><input type="checkbox" checked={settings[key]} onChange={e => updateSetting(key, e.target.checked)} /></label>)}</article><article className="paper-card"><h2><Icon name="volume" />{t('settings.audio')}</h2>{(['sound', 'music', 'ambience'] as const).map(key => <label className="toggle-line" key={key}><span>{t(`settings.${key === 'sound' ? settings.sound ? 'soundOn' : 'soundOff' : key}`)}</span><input type="checkbox" checked={settings[key]} onChange={e => updateSetting(key, e.target.checked)} /></label>)}<p className="muted small-copy">{t('shop.unavailable')}</p></article></div><div className="settings-links"><button className="text-link" onClick={() => setModal('privacy')}>{t('common.privacy')}<Icon name="arrow" size={16} /></button><button className="text-link" onClick={() => setModal('licenses')}>{t('common.licenses')}<Icon name="arrow" size={16} /></button><button className="text-link" onClick={() => navigate('/learn')}>{t('home.learn')}<Icon name="arrow" size={16} /></button></div></section>}

      {path === '/mastery' && <section className="logbook-page page-enter"><button className="back-link" onClick={() => navigate('/')}><Icon name="back" size={17} />{t('common.back')}</button><div className="page-heading"><span className="eyebrow dark">{t('nav.logbook')}</span><h1>{t('logbook.title')}</h1><p>{t('logbook.description')}</p></div><div className="mastery-grid">{[['first', 1], ['familiar', 5], ['keeper', 10]].map(([key, count]) => <article className="mastery-card" key={key}><div className="mastery-stamp"><Icon name={key === 'keeper' ? 'anchor' : key === 'familiar' ? 'waves' : 'star'} size={42} /></div><span className="eyebrow dark">{count} · {t('logbook.distinct')}</span><h2>{t(`logbook.${key}`)}</h2></article>)}</div><div className="logbook-empty paper-card"><Icon name="book" size={35} /><h2>{t('logbook.empty')}</h2><p>{t('logbook.emptyText')}</p>{profile && <div className="mastery-counts"><span>{t('mode.humanOnly')}: {Number((profile.mastery as Record<string, unknown>)?.humanOnly || 0)}</span><span>{t('mode.practice')}: {Number((profile.mastery as Record<string, unknown>)?.practice || 0)}</span></div>}<button className="btn primary" onClick={() => navigate('/practice')}>{t('home.practice')}<Icon name="arrow" /></button></div></section>}
    </main>

    {!live && <footer className="site-footer"><div className="footer-brand"><Icon name="anchor" size={21} /><span>{t('brand.title')}<small>{t('footer.copy')}</small></span></div><div><button onClick={() => setModal('privacy')}>{t('common.privacy')}</button><button onClick={() => setModal('licenses')}>{t('common.licenses')}</button><button onClick={() => navigate('/learn')}>{t('nav.learn')}</button></div><span className="footer-note">{t('hero.stamp')}</span></footer>}
    {session?.devAuthEnabled && !live && <div className="development-note"><span className="status-dot" /><strong>{t('dev.label')}</strong><span>{t('dev.description')}</span></div>}

    <dialog ref={dialogRef} className="modal" onCancel={() => setModal(null)} onClick={e => { if (e.target === dialogRef.current) setModal(null); }}><button className="modal-close icon-btn" onClick={() => setModal(null)} aria-label={t('common.close')}><Icon name="close" /></button>
      {modal === 'leave' && <><Icon name="anchor" size={32} /><h2>{t('safety.leave')}</h2><p>{t('safety.leaveExplain')}</p><div className="choice-stack"><button className="btn primary" disabled={busy} onClick={async () => { const response = await command('room.leave', { allowBot: true }); if (response) navigate('/'); }}>{t('safety.leaveBot')}</button><button className="btn secondary" disabled={busy} onClick={async () => { const response = await command('room.leave', { allowBot: false }); if (response) navigate('/'); }}>{t('safety.leaveNoBot')}</button><button className="btn text" onClick={() => setModal(null)}>{t('common.cancel')}</button></div></>}
      {modal === 'report' && <><Icon name="flag" size={30} /><h2>{t('safety.title')}</h2><label className="field-label" htmlFor="report-category">{t('safety.category')}</label><select id="report-category" value={reportCategory} onChange={e => setReportCategory(e.target.value)}>{['technical', 'name', 'harassment', 'other'].map(c => <option key={c} value={c}>{t(`safety.${c}`)}</option>)}</select><p>{t('safety.noPrivate')}</p><button className="btn primary full-width" disabled={busy} onClick={async () => { const response = await command('safety.report', { category: reportCategory }); if (response) { setModal(null); setNotice(t('safety.reportSent')); } }}>{t('safety.submit')}</button>{room?.players.filter(p => !p.bot && p.seat !== room.owner.seat).map(p => <button className="btn secondary full-width" key={p.seat} disabled={busy} onClick={async () => { const response = await command('safety.block', { seat: p.seat, allowBot: false }); if (response) navigate('/'); }}>{t('safety.block')} · {p.seat}</button>)}</>}
      {modal === 'privacy' && <><Icon name="lock" size={30} /><h2>{t('privacy.title')}</h2><p>{t('privacy.text')}</p></>}
      {modal === 'licenses' && <><Icon name="book" size={30} /><h2>{t('common.licenses')}</h2><p>{t('licenses.text')}</p><a className="text-link" href="/licenses/Golos-Text-OFL.txt" target="_blank" rel="noreferrer">Golos Text · SIL OFL <Icon name="arrow" size={16} /></a></>}
      {modal === 'rules' && <><Icon name="book" size={30} /><h2>{t('help.title')}</h2><p><strong>{t('help.goal')}</strong></p><p>{t('help.conflict')}</p><p>{t('help.private')}</p><p>{t('help.score')}</p><label className="toggle-line"><span>{t('settings.reducedMotion')}</span><input type="checkbox" checked={settings.reducedMotion} onChange={e => updateSetting('reducedMotion', e.target.checked)} /></label><label className="toggle-line"><span>{t('settings.nodeList')}</span><input type="checkbox" checked={settings.list} onChange={e => updateSetting('list', e.target.checked)} /></label></>}
    </dialog>
  </div>;
}
