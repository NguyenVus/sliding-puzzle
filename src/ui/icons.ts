/**
 * Professional Studio Game Vector SVG Icon System
 * Minimalist Precision Line Art style (stroke-width: 2, currentColor, fill: none)
 */

export type IconName =
  | 'hint'
  | 'undo'
  | 'restart'
  | 'auto-solve'
  | 'shuffle'
  | 'menu'
  | 'volume-on'
  | 'volume-off'
  | 'preview'
  | 'haptic'
  | 'settings'
  | 'levels'
  | 'freeplay'
  | 'picture'
  | 'guide'
  | 'close'
  | 'chevron-right'
  | 'check'
  | 'trophy'
  | 'wand'
  | 'pause'
  | 'play'
  | 'lock'
  | 'star'
  | 'folder'
  | 'palette'
  | 'trash'
  | 'sparkles'
  | 'paw'
  | 'mountain'
  | 'rocket'
  | 'grid'
  | 'target'
  | 'hand'
  | 'keyboard';

export interface IconOptions {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

const ICON_PATHS: Record<IconName, string> = {
  // 1. Hint: Sleek minimalist bulb with radiant filament
  hint: `<path d="M12 2v1"/><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>`,

  // 2. Undo: Classic reverse dynamic curve arrow
  undo: `<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>`,

  // 3. Restart: Circular continuous loop arrow
  restart: `<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><polyline points="21 3 21 8 16 8"/>`,

  // 4. Auto-solve: Fast-forward magic auto-play with motion rays
  'auto-solve': `<polygon points="5 3 17 12 5 21 5 3"/><line x1="20" y1="4" x2="20" y2="20"/><path d="M10 9l3 3-3 3"/>`,

  // 5. Shuffle: International dual crossing arrows
  shuffle: `<polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>`,

  // 6. Menu: Minimalist 3 rounded horizontal lines
  menu: `<line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/>`,

  // 7. Volume On: Speaker with crisp soundwaves
  'volume-on': `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>`,

  // 8. Volume Off: Speaker with mute cross
  'volume-off': `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>`,

  // 9. Preview: Gallery art frame with mountain and sun
  preview: `<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>`,

  // 10. Haptic: iOS-style dynamic haptic vibration lines
  haptic: `<path d="M12 2v20"/><path d="M8 7v10"/><path d="M16 7v10"/><path d="M4 10v4"/><path d="M20 10v4"/>`,

  // 11. Settings: Ultra-precise mechanical gear
  settings: `<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>`,

  // 12. Levels: Trophy of achievement
  levels: `<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>`,

  // 13. Freeplay: Flat 3D isometric dice with pips
  freeplay: `<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/><circle cx="16" cy="8" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="8" cy="16" r="1.5" fill="currentColor"/><circle cx="16" cy="16" r="1.5" fill="currentColor"/>`,

  // 14. Picture: Art gallery landscape canvas
  picture: `<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>`,

  // 15. Guide: Open study book
  guide: `<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>`,

  // 16. Close: Crisp X mark
  close: `<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`,

  // 17. Chevron Right: Sleek navigation arrow
  'chevron-right': `<polyline points="9 18 15 12 9 6"/>`,

  // 18. Check: Confirmation checkmark
  check: `<polyline points="20 6 9 17 4 12"/>`,

  // 19. Trophy: Victory cup
  trophy: `<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>`,

  // 20. Wand: Magic spark wand
  wand: `<path d="M15 4l-2.5 5.5L7 12l5.5 2.5L15 20l2.5-5.5L23 12l-5.5-2.5z"/><path d="M6 3L4.5 6 1.5 7.5 4.5 9 6 12 7.5 9 10.5 7.5 7.5 6z"/>`,

  // 21. Pause: Dual vertical bars
  pause: `<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>`,

  // 22. Play: Solid-contoured play arrow
  play: `<polygon points="5 3 19 12 5 21 5 3"/>`,

  // 23. Lock: Secure padlock
  lock: `<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>`,

  // 24. Star: Award star
  star: `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`,

  // 25. Folder: File upload folder
  folder: `<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>`,

  // 26. Palette: Painter's color palette
  palette: `<circle cx="13.5" cy="6.5" r=".75" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".75" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".75" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".75" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>`,

  // 27. Trash: Clean recycle bin
  trash: `<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>`,

  // 28. Sparkles: Dual radiant stars
  sparkles: `<path d="M12 3l1.91 5.09L19 10l-5.09 1.91L12 17l-1.91-5.09L5 10l5.09-1.91z"/><path d="M19 15l.95 2.05L22 18l-2.05.95L19 21l-.95-2.05L16 18l2.05-.95z"/>`,

  // 29. Paw: Animal paw print
  paw: `<circle cx="12" cy="16" r="3.5"/><circle cx="6.5" cy="11.5" r="2"/><circle cx="10" cy="7.5" r="2"/><circle cx="14" cy="7.5" r="2"/><circle cx="17.5" cy="11.5" r="2"/>`,

  // 30. Mountain: Nature mountains
  mountain: `<path d="M8 3l4 8 5-5 5 10H2L8 3z"/>`,

  // 31. Rocket: Space shuttle exploration
  rocket: `<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>`,

  // 32. Grid: 2x2 grid / numbered tiles
  grid: `<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>`,

  // 33. Target: Precision target concentric circles
  target: `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>`,

  // 34. Hand: Tap / gesture hand
  hand: `<path d="M18 11V6a2 2 0 0 0-4 0v4"/><path d="M14 10V4a2 2 0 0 0-4 0v7"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.83L7 15"/>`,

  // 35. Keyboard: Hardware keyboard keys
  keyboard: `<rect x="2" y="4" width="20" height="16" rx="2" ry="2"/><line x1="6" y1="8" x2="6" y2="8"/><line x1="10" y1="8" x2="10" y2="8"/><line x1="14" y1="8" x2="14" y2="8"/><line x1="18" y1="8" x2="18" y2="8"/><line x1="6" y1="12" x2="6" y2="12"/><line x1="10" y1="12" x2="10" y2="12"/><line x1="14" y1="12" x2="14" y2="12"/><line x1="18" y1="12" x2="18" y2="12"/><line x1="7" y1="16" x2="17" y2="16"/>`,
};

/**
 * Renders an SVG icon string in Minimalist Precision Line Art style.
 */
export function renderIcon(name: IconName, options: IconOptions = {}): string {
  const size = options.size ?? 20;
  const strokeWidth = options.strokeWidth ?? 2;
  const extraClass = options.className ? ` ${options.className}` : '';
  const innerPaths = ICON_PATHS[name] ?? ICON_PATHS['settings'];

  return `<svg class="game-icon icon-${name}${extraClass}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${innerPaths}</svg>`;
}
