import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LayoutManager, type LayoutMetrics } from '../../src/ui/layout-manager';

describe('LayoutManager', () => {
  let container: HTMLDivElement;
  let target: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    target = document.createElement('div');
    document.body.appendChild(container);
    document.body.appendChild(target);
  });

  afterEach(() => {
    container.remove();
    target.remove();
  });

  it('initializes with default metrics for 3x3 grid', () => {
    const lm = new LayoutManager(container, target, { gridSize: 3 });
    const metrics = lm.getMetrics();

    expect(metrics.gridSize).toBe(3);
    expect(metrics.boardSize).toBeGreaterThan(0);
    expect(metrics.tileSize).toBeGreaterThan(0);
    expect(metrics.gap).toBeGreaterThan(0);
    expect(metrics.padding).toBeGreaterThan(0);
    expect(metrics.fontSize).toBeGreaterThan(0);

    lm.destroy();
  });

  it('updates CSS custom properties on target element', () => {
    const lm = new LayoutManager(container, target, { gridSize: 3 });
    const metrics = lm.getMetrics();

    expect(target.style.getPropertyValue('--board-size')).toBe(`${metrics.boardSize}px`);
    expect(target.style.getPropertyValue('--tile-size')).toBe(`${metrics.tileSize}px`);
    expect(target.style.getPropertyValue('--font-size')).toBe(`${metrics.fontSize}px`);
    expect(target.style.getPropertyValue('--tile-font-size')).toBe(`${metrics.fontSize}px`);
    expect(target.style.getPropertyValue('--tile-gap')).toBe(`${metrics.gap}px`);
    expect(target.style.getPropertyValue('--tile-padding')).toBe(`${metrics.padding}px`);

    lm.destroy();
  });

  it('recalculates cleanly when grid size changes', () => {
    let notifiedMetrics: LayoutMetrics | null = null;
    const lm = new LayoutManager(container, target, {
      gridSize: 3,
      onLayoutChange: (m) => {
        notifiedMetrics = m;
      },
    });

    lm.setGridSize(4);
    const metrics4 = lm.getMetrics();
    expect(metrics4.gridSize).toBe(4);
    expect((notifiedMetrics as LayoutMetrics | null)?.gridSize).toBe(4);

    lm.setGridSize(5);
    const metrics5 = lm.getMetrics();
    expect(metrics5.gridSize).toBe(5);

    lm.destroy();
  });

  it('does not reset board or game state when recalculating', () => {
    const lm = new LayoutManager(container, target, { gridSize: 3 });
    const initial = lm.getMetrics();

    const recalculated = lm.recalculate();
    expect(recalculated.boardSize).toBe(initial.boardSize);
    expect(recalculated.tileSize).toBe(initial.tileSize);

    lm.destroy();
  });
});
