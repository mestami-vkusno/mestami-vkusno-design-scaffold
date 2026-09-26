export type IconShapeTag = 'path' | 'circle' | 'rect'

export interface IconShape {
  readonly tag: IconShapeTag
  readonly attrs: Readonly<Record<string, string | number>>
}

/** Контурные иконки 24×24. Штрих и скругления задаёт UiIcon. */
export const ICON_SHAPES = {
  heart: [{ tag: 'path', attrs: { d: 'M12 20s-7-4.4-9-9.2C1.6 7.3 3.7 4 7 4c2 0 3.7 1.2 5 3 1.3-1.8 3-3 5-3 3.3 0 5.4 3.3 4 6.8C19 15.6 12 20 12 20z' } }],
  search: [{ tag: 'circle', attrs: { cx: 11, cy: 11, r: 6.5 } }, { tag: 'path', attrs: { d: 'm16 16 4.5 4.5' } }],
  pin: [{ tag: 'path', attrs: { d: 'M12 21s-6.5-5.8-6.5-11a6.5 6.5 0 0 1 13 0c0 5.2-6.5 11-6.5 11z' } }, { tag: 'circle', attrs: { cx: 12, cy: 10, r: 2.3 } }],
  star: [{ tag: 'path', attrs: { d: 'm12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z' } }],
  'arrow-r': [{ tag: 'path', attrs: { d: 'M5 12h14M13 6l6 6-6 6' } }],
  'arrow-l': [{ tag: 'path', attrs: { d: 'M19 12H5M11 6l-6 6 6 6' } }],
  'chev-d': [{ tag: 'path', attrs: { d: 'm6 9 6 6 6-6' } }],
  'chev-r': [{ tag: 'path', attrs: { d: 'm9 6 6 6-6 6' } }],
  close: [{ tag: 'path', attrs: { d: 'M6 6l12 12M18 6 6 18' } }],
  check: [{ tag: 'path', attrs: { d: 'm5 12.5 4.5 4.5L19 7.5' } }],
  calendar: [{ tag: 'rect', attrs: { x: 3.5, y: 5, width: 17, height: 15.5, rx: 2.5 } }, { tag: 'path', attrs: { d: 'M3.5 10h17M8 3v4M16 3v4' } }],
  clock: [{ tag: 'circle', attrs: { cx: 12, cy: 12, r: 8.5 } }, { tag: 'path', attrs: { d: 'M12 7.5V12l3 2' } }],
  share: [{ tag: 'circle', attrs: { cx: 6, cy: 12, r: 2.5 } }, { tag: 'circle', attrs: { cx: 18, cy: 6, r: 2.5 } }, { tag: 'circle', attrs: { cx: 18, cy: 18, r: 2.5 } }, { tag: 'path', attrs: { d: 'm8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6' } }],
  bookmark: [{ tag: 'path', attrs: { d: 'M6.5 4h11v16.5L12 16.5l-5.5 4z' } }],
  user: [{ tag: 'circle', attrs: { cx: 12, cy: 8.5, r: 3.8 } }, { tag: 'path', attrs: { d: 'M4.5 20c.8-3.7 3.9-5.5 7.5-5.5s6.7 1.8 7.5 5.5' } }],
  home: [{ tag: 'path', attrs: { d: 'M4 11 12 4l8 7v9h-5.5v-5.5h-5V20H4z' } }],
  list: [{ tag: 'rect', attrs: { x: 4, y: 3.5, width: 16, height: 17, rx: 2.5 } }, { tag: 'path', attrs: { d: 'M8 8.5h8M8 12.5h8M8 16.5h5' } }],
  eye: [{ tag: 'path', attrs: { d: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z' } }, { tag: 'circle', attrs: { cx: 12, cy: 12, r: 2.8 } }],
  lock: [{ tag: 'rect', attrs: { x: 5, y: 10.5, width: 14, height: 10, rx: 2.5 } }, { tag: 'path', attrs: { d: 'M8 10.5V8a4 4 0 0 1 8 0v2.5' } }],
  shield: [{ tag: 'path', attrs: { d: 'M12 3.5 5 6v5.5c0 4.4 3 7.7 7 9 4-1.3 7-4.6 7-9V6z' } }, { tag: 'path', attrs: { d: 'm9 12 2.2 2.2L15.5 10' } }],
  crown: [{ tag: 'path', attrs: { d: 'm4 8 4.5 4L12 6l3.5 6L20 8l-1.5 10h-13z' } }],
  refresh: [{ tag: 'path', attrs: { d: 'M20 12a8 8 0 1 1-2.4-5.7M20 4v4.5h-4.5' } }],
  sparkle: [{ tag: 'path', attrs: { d: 'M12 3c.6 4.5 2.5 6.4 7 7-4.5.6-6.4 2.5-7 7-.6-4.5-2.5-6.4-7-7 4.5-.6 6.4-2.5 7-7z' } }],
  filter: [{ tag: 'path', attrs: { d: 'M4 7h10M18 7h2M4 17h2M10 17h10' } }, { tag: 'circle', attrs: { cx: 16, cy: 7, r: 2 } }, { tag: 'circle', attrs: { cx: 8, cy: 17, r: 2 } }],
  send: [{ tag: 'path', attrs: { d: 'M4 12 20 4l-4.5 16-3.5-6.5z' } }],
  external: [{ tag: 'path', attrs: { d: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5' } }],
  plane: [{ tag: 'path', attrs: { d: 'M3 12 21 4l-6 16-3-7z' } }],
  settings: [{ tag: 'circle', attrs: { cx: 12, cy: 12, r: 3 } }, { tag: 'path', attrs: { d: 'M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8' } }],
  logout: [{ tag: 'path', attrs: { d: 'M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l-4-4 4-4M6 12h10' } }],
  trash: [{ tag: 'path', attrs: { d: 'M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13' } }],
  bell: [{ tag: 'path', attrs: { d: 'M6 10.5a6 6 0 0 1 12 0c0 4.5 1.5 6 2 7H4c.5-1 2-2.5 2-7z' } }, { tag: 'path', attrs: { d: 'M10 20.5a2 2 0 0 0 4 0' } }],
  plus: [{ tag: 'path', attrs: { d: 'M12 5v14M5 12h14' } }],
  feed: [{ tag: 'rect', attrs: { x: 3.5, y: 4, width: 17, height: 7.5, rx: 2 } }, { tag: 'path', attrs: { d: 'M3.5 15.5h17M3.5 19.5h10' } }],
  edit: [{ tag: 'path', attrs: { d: 'M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z' } }],
  comment: [{ tag: 'path', attrs: { d: 'M5 4.5h14a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5h-8.5L7 20v-3.5H5A1.5 1.5 0 0 1 3.5 15V6A1.5 1.5 0 0 1 5 4.5z' } }],
  more: [{ tag: 'circle', attrs: { cx: 5.5, cy: 12, r: 1.1 } }, { tag: 'circle', attrs: { cx: 12, cy: 12, r: 1.1 } }, { tag: 'circle', attrs: { cx: 18.5, cy: 12, r: 1.1 } }],
  flag: [{ tag: 'path', attrs: { d: 'M6 21V4' } }, { tag: 'path', attrs: { d: 'M6 4.5h11.5l-2.5 4 2.5 4H6' } }],
  image: [{ tag: 'rect', attrs: { x: 3.5, y: 4.5, width: 17, height: 15, rx: 2.5 } }, { tag: 'circle', attrs: { cx: 9, cy: 10, r: 1.6 } }, { tag: 'path', attrs: { d: 'm4 17 4.6-4.2 3.9 3.3 3.1-2.6 4.9 4' } }],
  alert: [{ tag: 'path', attrs: { d: 'M10.3 4.6 2.9 17.5a2 2 0 0 0 1.7 3h14.8a2 2 0 0 0 1.7-3L13.7 4.6a2 2 0 0 0-3.4 0z' } }, { tag: 'path', attrs: { d: 'M12 9.5v4.2M12 17h.01' } }],
  info: [{ tag: 'circle', attrs: { cx: 12, cy: 12, r: 8.5 } }, { tag: 'path', attrs: { d: 'M12 11v5.2M12 7.8h.01' } }],
  'wifi-off': [{ tag: 'path', attrs: { d: 'M4 4l16 16' } }, { tag: 'path', attrs: { d: 'M2.8 9.4A15 15 0 0 1 7.6 6.5M11.5 5.6c3.6.2 6.9 1.6 9.7 3.8' } }, { tag: 'path', attrs: { d: 'M6 13a10 10 0 0 1 3-2.1M14 11c1.6.5 3 1.3 4 2.2' } }, { tag: 'path', attrs: { d: 'M9 16.4a4.5 4.5 0 0 1 3.2-1.2M15 16.2a4.5 4.5 0 0 0-.5-.4' } }, { tag: 'path', attrs: { d: 'M12 19.5h.01' } }],
  'chev-u': [{ tag: 'path', attrs: { d: 'm6 15 6-6 6 6' } }],
  mail: [{ tag: 'rect', attrs: { x: 3.5, y: 5.5, width: 17, height: 13, rx: 2.5 } }, { tag: 'path', attrs: { d: 'm4 8 8 5.5L20 8' } }],
} as const satisfies Record<string, readonly IconShape[]>

export type IconName = keyof typeof ICON_SHAPES

export const ICON_NAMES = Object.keys(ICON_SHAPES) as IconName[]
