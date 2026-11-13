import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { KeyboardHandler } from '../../src/ui/input/keyboard-handler';
import type { SwipeDirection } from '../../src/ui/input/pointer-handler';

describe('KeyboardHandler', () => {
  let handler: KeyboardHandler;
  let directionCb: (direction: SwipeDirection) => void;
  let undoCb: () => void;
  let restartCb: () => void;
  let escapeCb: () => void;

  beforeEach(() => {
    directionCb = vi.fn();
    undoCb = vi.fn();
    restartCb = vi.fn();
    escapeCb = vi.fn();

    handler = new KeyboardHandler({
      onDirectionMove: directionCb,
      onUndo: undoCb,
      onRestart: restartCb,
      onEscape: escapeCb,
    });
  });

  afterEach(() => {
    handler.destroy();
  });

  it('triggers directional move for Arrow keys', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp', key: 'ArrowUp' }));
    expect(directionCb).toHaveBeenCalledWith('up');

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown', key: 'ArrowDown' }));
    expect(directionCb).toHaveBeenCalledWith('down');

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft', key: 'ArrowLeft' }));
    expect(directionCb).toHaveBeenCalledWith('left');

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight', key: 'ArrowRight' }));
    expect(directionCb).toHaveBeenCalledWith('right');
  });

  it('triggers directional move for WASD keys', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW', key: 'w' }));
    expect(directionCb).toHaveBeenCalledWith('up');

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyS', key: 's' }));
    expect(directionCb).toHaveBeenCalledWith('down');

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA', key: 'a' }));
    expect(directionCb).toHaveBeenCalledWith('left');

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD', key: 'd' }));
    expect(directionCb).toHaveBeenCalledWith('right');
  });

  it('triggers undo on Z key', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyZ', key: 'z' }));
    expect(undoCb).toHaveBeenCalled();
  });

  it('triggers restart on R key', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyR', key: 'r' }));
    expect(restartCb).toHaveBeenCalled();
  });

  it('triggers escape on Escape key', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', key: 'Escape' }));
    expect(escapeCb).toHaveBeenCalled();
  });

  it('ignores keystrokes when typing into an input', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    input.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW', key: 'w', bubbles: true }));
    expect(directionCb).not.toHaveBeenCalled();

    input.remove();
  });
});
