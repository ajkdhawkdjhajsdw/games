import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { test } from 'node:test';
import catalog from '../client/catalog.json';
import { translate } from '../client/i18n';
import { MapPreview } from '../client/MapPreview';
import { mapPreviews } from '../client/maps';

test('localized action labels are player copy, not protocol table prose', () => {
  assert.equal(translate('en', 'move.commit'), 'Commit move');
  assert.equal(translate('ru', 'move.commit'), 'Подтвердить ход');
  assert.equal(translate('en', 'room.ready'), 'Ready');
  assert.equal(translate('ru', 'room.start'), 'Начать смену');
  assert.deepEqual(Object.keys(catalog.en).sort(), Object.keys(catalog.ru).sort());
  for (const [key, value] of Object.entries(catalog.ru)) {
    assert.match(value, /[А-Яа-яЁё]/u, `${key} must have Russian copy`);
    assert.doesNotMatch(value, /Atomically|Idempotent|Owner-private|#[0-9A-F]{6}/);
  }
});

test('map cards render exact public graph nodes and edges for each map', () => {
  for (const map of mapPreviews) {
    const markup = renderToStaticMarkup(createElement(MapPreview, { mapId: map.mapId }));
    assert.equal((markup.match(/<circle /g) || []).length, 9);
    assert.equal((markup.match(/<line /g) || []).length, map.edges.length);
    assert.doesNotMatch(markup, /validBerths|preferredBerth|witness|deckFamily/);
  }
});

test('time announcements use English and Russian plural categories without changing stable IDs', () => {
  assert.equal(translate('en', 'hud.seconds', { count: 1 }), '1 second left');
  assert.equal(translate('en', 'hud.seconds', { count: 2 }), '2 seconds left');
  for (const [count, unit] of [[1, 'секунда'], [2, 'секунды'], [5, 'секунд'], [11, 'секунд'], [21, 'секунда']] as const) {
    assert(translate('ru', 'hud.seconds', { count }).endsWith(unit));
  }
  assert.equal(translate('ru', 'move.selected', { node: 'J1' }), 'Выбрано: J1');
});

test('referenced static media and license paths exist', () => {
  const source = readFileSync('client/App.tsx', 'utf8');
  for (const [, path] of source.matchAll(/(?:src|href)="(\/(?:assets|licenses)\/[^"$]+)"/g)) {
    assert(existsSync(`public${path}`), path);
  }
  for (const cue of ['commit', 'select-node', 'select-wait', 'congestion', 'delivery', 'round-open', 'shift-success', 'shift-incomplete', 'lantern-loop', 'harbor-water']) {
    assert(existsSync(`public/assets/audio/${cue}.mp3`), cue);
  }
});
