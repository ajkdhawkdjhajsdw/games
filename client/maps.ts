import type { MapInfo } from './types';
import previews from '../public/assets/map-previews.json';
const titles = [
  ['Open Water', 'Открытая вода'], ['Twin Channels', 'Два канала'], ['The Gatehouse', 'У ворот'],
  ['Clockwise Basin', 'Круговой бассейн'], ['The Spillway', 'Водосброс'], ['Single File', 'По одному'],
  ['Beacon Fork', 'Развилка у маяка'], ['Ferry Crossing', 'У переправы'], ['One-Way Cut', 'Односторонний проход'], ['Harbor Knot', 'Узел гавани'],
];
const hints = [
  ['Different berths can keep the harbor moving.', 'Разные причалы помогают гавани двигаться.'],
  ['Look beyond the closest berth.', 'Посмотрите дальше ближайшего причала.'],
  ['A node can clear as another boat leaves.', 'Узел освобождается, когда другое судно уходит.'],
  ['Follow the arrows; a larger loop can move together.', 'Следуйте стрелкам: большой круг может двигаться вместе.'],
  ['Some routes are easier to leave than to return to.', 'По некоторым маршрутам легче уйти, чем вернуться.'],
  ['Leaving space can be a productive move.', 'Освободить место — тоже полезный ход.'],
  ['A flexible boat can make room for a constrained one.', 'Судно с выбором пути может уступить другому.'],
  ['More choices call for a clearer signal.', 'Больше вариантов — важнее ясный сигнал.'],
  ['Check the next exit before you enter.', 'Проверьте следующий выход, прежде чем войти.'],
  ['Coordinate the junction and the berth.', 'Согласуйте путь через узел и причал.'],
];
export const maps: MapInfo[] = titles.map(([en, ru], i) => ({ id: `M${String(i + 1).padStart(2, '0')}`, title: { en, ru }, hint: { en: hints[i][0], ru: hints[i][1] } }));
export const mapPreviews = previews;
