import { describe, it, expect } from 'vitest';
import { renderIcon, type IconName } from '../../src/ui/icons';

describe('Vector SVG Icon System (icons.ts)', () => {
  const REQUIRED_ICONS: IconName[] = [
    'hint',
    'undo',
    'restart',
    'auto-solve',
    'shuffle',
    'menu',
    'volume-on',
    'volume-off',
    'preview',
    'haptic',
    'settings',
    'levels',
    'freeplay',
    'picture',
    'guide',
    'close',
    'chevron-right',
    'check',
    'trophy',
    'wand',
  ];

  it('renders valid SVG strings for all 20 required studio icons', () => {
    for (const name of REQUIRED_ICONS) {
      const svg = renderIcon(name);
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('viewBox="0 0 24 24"');
      expect(svg).toContain('fill="none"');
      expect(svg).toContain('stroke="currentColor"');
      expect(svg).toContain('stroke-linecap="round"');
      expect(svg).toContain('stroke-linejoin="round"');
      expect(svg).toContain(`icon-${name}`);
      expect(svg).toContain('class="game-icon');
    }
  });

  it('applies default size 20 and stroke-width 2 when no options are provided', () => {
    const svg = renderIcon('hint');
    expect(svg).toContain('width="20"');
    expect(svg).toContain('height="20"');
    expect(svg).toContain('stroke-width="2"');
  });

  it('respects custom size, className, and strokeWidth options', () => {
    const svg = renderIcon('auto-solve', {
      size: 28,
      className: 'custom-solve-glow',
      strokeWidth: 1.75,
    });

    expect(svg).toContain('width="28"');
    expect(svg).toContain('height="28"');
    expect(svg).toContain('stroke-width="1.75"');
    expect(svg).toContain('custom-solve-glow');
    expect(svg).toContain('game-icon icon-auto-solve custom-solve-glow');
  });

  it('gracefully falls back to default icon when unknown name is given', () => {
    // @ts-expect-error test unknown icon name
    const svg = renderIcon('unknown-test-icon');
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('game-icon icon-unknown-test-icon');
  });
});
