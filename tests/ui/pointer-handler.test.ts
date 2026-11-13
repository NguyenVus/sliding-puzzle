import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PointerHandler, type SwipeDirection } from '../../src/ui/input/pointer-handler';

describe('PointerHandler', () => {
  let target: HTMLDivElement;
  let handler: PointerHandler;
  let tapCb: (index: number, tileValue: number) => void;
  let swipeCb: (
    direction: SwipeDirection,
    startIndex: number | null,
    tileValue: number | null
  ) => void;

  beforeEach(() => {
    target = document.createElement('div');
    document.body.appendChild(target);

    tapCb = vi.fn();
    swipeCb = vi.fn();

    handler = new PointerHandler(target, {
      getTileSize: () => 100,
      getGridSize: () => 3,
      onTap: tapCb,
      onSwipe: swipeCb,
    });
  });

  afterEach(() => {
    handler.destroy();
    target.remove();
  });

  it('sets non-scrolling touch styles on the target element', () => {
    expect(target.style.touchAction).toBe('none');
    expect(target.style.overscrollBehavior).toBe('none');
  });

  it('detects tap gesture when pointer movement is below threshold', () => {
    const tileBtn = document.createElement('button');
    tileBtn.dataset.index = '4';
    tileBtn.dataset.tile = '5';
    target.appendChild(tileBtn);

    tileBtn.dispatchEvent(
      new PointerEvent('pointerdown', {
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        bubbles: true,
      })
    );

    target.dispatchEvent(
      new PointerEvent('pointerup', {
        clientX: 105,
        clientY: 102,
        pointerId: 1,
        bubbles: true,
      })
    );

    expect(tapCb).toHaveBeenCalledWith(4, 5);
    expect(swipeCb).not.toHaveBeenCalled();
  });

  it('detects horizontal swipe right when movement exceeds threshold', () => {
    const tileBtn = document.createElement('button');
    tileBtn.dataset.index = '1';
    tileBtn.dataset.tile = '2';
    target.appendChild(tileBtn);

    // tileSize is 100, threshold is 25px
    tileBtn.dispatchEvent(
      new PointerEvent('pointerdown', {
        clientX: 100,
        clientY: 100,
        pointerId: 2,
        bubbles: true,
      })
    );

    target.dispatchEvent(
      new PointerEvent('pointerup', {
        clientX: 150, // +50px right
        clientY: 105,
        pointerId: 2,
        bubbles: true,
      })
    );

    expect(swipeCb).toHaveBeenCalledWith('right', 1, 2);
    expect(tapCb).not.toHaveBeenCalled();
  });

  it('detects vertical swipe up when movement exceeds threshold', () => {
    const tileBtn = document.createElement('button');
    tileBtn.dataset.index = '7';
    tileBtn.dataset.tile = '8';
    target.appendChild(tileBtn);

    tileBtn.dispatchEvent(
      new PointerEvent('pointerdown', {
        clientX: 100,
        clientY: 200,
        pointerId: 3,
        bubbles: true,
      })
    );

    target.dispatchEvent(
      new PointerEvent('pointerup', {
        clientX: 102,
        clientY: 140, // -60px up
        pointerId: 3,
        bubbles: true,
      })
    );

    expect(swipeCb).toHaveBeenCalledWith('up', 7, 8);
    expect(tapCb).not.toHaveBeenCalled();
  });
});
