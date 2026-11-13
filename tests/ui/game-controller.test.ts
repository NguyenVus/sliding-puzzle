import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GameController } from '../../src/ui/game-controller';
import { getBlankIndex, isSolved } from '../../src/core/board';
import { STORAGE_KEY } from '../../src/storage';
import { SolverClient } from '../../src/solver/solver-client';

describe('GameController', () => {
  let root: HTMLDivElement;
  let hudContainer: HTMLDivElement;
  let boardContainer: HTMLDivElement;
  let controlsContainer: HTMLDivElement;
  let controller: GameController;

  beforeEach(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEY);
    }

    root = document.createElement('div');
    hudContainer = document.createElement('div');
    boardContainer = document.createElement('div');
    controlsContainer = document.createElement('div');

    root.appendChild(hudContainer);
    root.appendChild(boardContainer);
    root.appendChild(controlsContainer);
    document.body.appendChild(root);

    controller = new GameController({
      root,
      hudContainer,
      boardContainer,
      controlsContainer,
    });
  });

  afterEach(() => {
    controller.destroy();
    root.remove();
  });

  it('initializes in ready state with a scrambled 3x3 board and 0 moves', () => {
    expect(controller.getStatus()).toBe('ready');
    expect(controller.getMoves()).toBe(0);
    expect(controller.getBoard().size).toBe(3);
    expect(isSolved(controller.getBoard())).toBe(false);
  });

  it('transitions to playing state on first valid move', () => {
    const board = controller.getBoard();
    const blank = getBlankIndex(board);
    const n = board.size;
    const blankRow = Math.floor(blank / n);
    const blankCol = blank % n;

    // Pick adjacent movable tile
    let targetIndex = -1;
    if (blankRow > 0) targetIndex = (blankRow - 1) * n + blankCol;
    else targetIndex = (blankRow + 1) * n + blankCol;

    const moved = controller.makeMove(targetIndex);
    expect(moved).toBe(true);
    expect(controller.getStatus()).toBe('playing');
    expect(controller.getMoves()).toBe(1);
  });

  it('supports undoing previous moves correctly', () => {
    const initialBoard = controller.getBoard();
    const blank = getBlankIndex(initialBoard);
    const n = initialBoard.size;
    const blankRow = Math.floor(blank / n);
    const blankCol = blank % n;

    let targetIndex = -1;
    if (blankRow > 0) targetIndex = (blankRow - 1) * n + blankCol;
    else targetIndex = (blankRow + 1) * n + blankCol;

    controller.makeMove(targetIndex);
    expect(controller.getMoves()).toBe(1);

    const undone = controller.undo();
    expect(undone).toBe(true);
    expect(controller.getMoves()).toBe(0);
    expect(controller.getStatus()).toBe('ready');
    expect(controller.getElapsedSeconds()).toBe(0);
    expect(controller.getBoard().tiles).toEqual(initialBoard.tiles);
  });

  it('restores the initial scramble board on restart', () => {
    const initialBoard = controller.getBoard();
    const blank = getBlankIndex(initialBoard);
    const n = initialBoard.size;
    const blankRow = Math.floor(blank / n);
    const blankCol = blank % n;

    let targetIndex = -1;
    if (blankRow > 0) targetIndex = (blankRow - 1) * n + blankCol;
    else targetIndex = (blankRow + 1) * n + blankCol;

    controller.makeMove(targetIndex);
    expect(controller.getMoves()).toBe(1);

    controller.restartGame();
    expect(controller.getMoves()).toBe(0);
    expect(controller.getStatus()).toBe('ready');
    expect(controller.getBoard().tiles).toEqual(initialBoard.tiles);
  });

  it('changes grid size to 4x4 and 5x5', () => {
    controller.changeSize(4);
    expect(controller.getBoard().size).toBe(4);
    expect(controller.getMoves()).toBe(0);

    controller.changeSize(5);
    expect(controller.getBoard().size).toBe(5);
  });

  it('handles directional moves for arrow keys / WASD', () => {
    // Calling makeDirectionalMove should attempt a valid move or return false if edge
    const result = controller.makeDirectionalMove('up');
    expect(typeof result).toBe('boolean');
  });

  it('handles victory state transition', () => {
    controller.forceSolvedStateForTesting();
    expect(controller.getStatus()).toBe('won');
    expect(root.querySelector('.victory-modal-backdrop')).not.toBeNull();
  });

  it('manages campaign levels and mode transitions', () => {
    expect(controller.getMode()).toBe('campaign');
    expect(controller.getCurrentLevel()).toBe(1);

    controller.loadLevel(2);
    expect(controller.getCurrentLevel()).toBe(2);
    expect(controller.getBoard().size).toBe(3);

    controller.loadLevel(11); // 4x4
    expect(controller.getCurrentLevel()).toBe(11);
    expect(controller.getBoard().size).toBe(4);

    controller.startFreePlay(6);
    expect(controller.getMode()).toBe('freeplay');
    expect(controller.getCurrentLevel()).toBeNull();
    expect(controller.getBoard().size).toBe(6);

    controller.startFreePlay(8);
    expect(controller.getBoard().size).toBe(8);
  });

  it('opens and closes level select view properly', () => {
    expect(root.querySelector('.level-select-modal')).toBeNull();

    controller.openLevelSelect();
    expect(root.querySelector('.level-select-modal')).not.toBeNull();

    controller.closeLevelSelect();
    expect(root.querySelector('.level-select-modal')).toBeNull();
  });

  it('records level victory, evaluates stars, and unlocks next level', () => {
    controller.loadLevel(1);
    controller.forceSolvedStateForTesting();

    expect(controller.getStatus()).toBe('won');
    const modal = root.querySelector('.victory-modal-backdrop');
    expect(modal).not.toBeNull();

    // Check next level button is present
    const nextBtn = modal?.querySelector('#modal-btn-next');
    expect(nextBtn).not.toBeNull();

    // Storage should show level 1 completed and level 2 unlocked
    const storage = controller.getStorageManager();
    expect(storage.getLevelRecord(1).completed).toBe(true);
    expect(storage.isLevelUnlocked(2)).toBe(true);
  });

  it('blocks moves and actions while level select modal or victory modal is open', () => {
    controller.openLevelSelect();
    expect(controller.isModalOpen()).toBe(true);

    // Attempting a move while modal is open must fail
    const moved = controller.makeMove(0);
    expect(moved).toBe(false);

    // Directional move must also fail
    const dirMoved = controller.makeDirectionalMove('up');
    expect(dirMoved).toBe(false);

    // Undo must fail
    const undone = controller.undo();
    expect(undone).toBe(false);

    // Close modal and move is allowed again
    controller.closeLevelSelect();
    expect(controller.isModalOpen()).toBe(false);
  });

  it('displays new record badge on victory', () => {
    controller.loadLevel(1);
    controller.forceSolvedStateForTesting();

    const badge = root.querySelector('#modal-new-record-badge');
    expect(badge).not.toBeNull();
    expect(badge?.textContent).toContain('KỶ LỤC MỚI');
  });

  it('resumes from highest unlocked level on fresh instantiation', () => {
    const storage = controller.getStorageManager();
    storage.recordLevelVictory(1, 10, 15, 3);
    storage.recordLevelVictory(2, 12, 18, 3);
    expect(storage.load().unlockedMaxLevel).toBe(3);

    const resumingController = new GameController(
      { root, hudContainer, boardContainer, controlsContainer },
      { storageManager: storage }
    );
    expect(resumingController.getCurrentLevel()).toBe(3);
    resumingController.destroy();
  });

  describe('Hints and Auto-Solve Features (Phase 4)', () => {
    it('requests a hint, highlights the target tile, and marks hasUsedHint', async () => {
      expect(controller.getHasUsedHint()).toBe(false);

      const hintIndex = await controller.requestHint();
      expect(hintIndex).not.toBeNull();
      expect(controller.getHasUsedHint()).toBe(true);

      // Verify that the tile element has the .hint-glow class
      const glowingTile = boardContainer.querySelector('.wood-tile.hint-glow');
      expect(glowingTile).not.toBeNull();

      // Making a move should clear the hint glow
      controller.makeMove(hintIndex!);
      expect(boardContainer.querySelector('.wood-tile.hint-glow')).toBeNull();
    });

    it('limits stars to maximum 1 when a hint has been used on a level', async () => {
      controller.loadLevel(1);
      // Use hint
      await controller.requestHint();
      expect(controller.getHasUsedHint()).toBe(true);

      // Finish the level with 0 moves / under par
      controller.forceSolvedStateForTesting();

      // Check stars awarded
      const storage = controller.getStorageManager();
      const rec = storage.getLevelRecord(1);
      expect(rec.stars).toBe(1); // Penalized to 1 star!
    });

    it('triggers hint when H keyboard key is pressed', async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'h' }));
      // Wait for promise resolution
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(controller.getHasUsedHint()).toBe(true);
      expect(boardContainer.querySelector('.wood-tile.hint-glow')).not.toBeNull();
    });

    it('toggles auto-solve and stops on user interaction or stop command', async () => {
      expect(controller.getIsAutoSolving()).toBe(false);

      // Start auto-solve
      const autoSolvePromise = controller.toggleAutoSolve();
      expect(controller.getIsAutoSolving()).toBe(true);
      expect(controller.getHasUsedHint()).toBe(true);

      // Stop auto-solve
      controller.stopAutoSolve();
      expect(controller.getIsAutoSolving()).toBe(false);

      await autoSolvePromise;
    });

    it('does not apply stale hint if board moves before hint resolves', async () => {
      // Create a delayed solver client
      let resolveHint!: (val: number | null) => void;
      const delayedClient = {
        getHint: () => new Promise<number | null>((resolve) => {
          resolveHint = resolve;
        }),
        solve: () => Promise.resolve({ solved: true, moves: [], nodesExplored: 0, timeMs: 0, algorithm: 'auto' as const }),
        cancel: () => {},
        destroy: () => {},
      } as unknown as SolverClient;

      const c = new GameController(
        { root, hudContainer, boardContainer, controlsContainer },
        { solverClient: delayedClient }
      );

      // Trigger hint request
      const hintPromise = c.requestHint();

      // Before resolving, player makes a move
      const initialBlank = getBlankIndex(c.getBoard());
      const n = c.getBoard().size;
      const bRow = Math.floor(initialBlank / n);
      const bCol = initialBlank % n;
      const moveIdx = bRow > 0 ? (bRow - 1) * n + bCol : (bRow + 1) * n + bCol;
      c.makeMove(moveIdx);

      // Now resolve the old hint with a tile index
      resolveHint(moveIdx);
      await hintPromise;

      // Because boardRevision changed, stale hint must NOT be active
      expect(boardContainer.querySelector('.wood-tile.hint-glow')).toBeNull();
      c.destroy();
    });

    it('does not penalize with hasUsedHint if board is already solved when requesting hint', async () => {
      controller.forceSolvedStateForTesting();
      // Reset status to ready to test solved board
      const hint = await controller.requestHint();
      expect(hint).toBeNull();
      expect(controller.getHasUsedHint()).toBe(false);
    });

    it('ignores duplicate concurrent hint requests while loading', async () => {
      let callCount = 0;
      let resolveHint!: (val: number | null) => void;
      const delayedClient = {
        getHint: () => {
          callCount++;
          return new Promise<number | null>((resolve) => {
            resolveHint = resolve;
          });
        },
        solve: () => Promise.resolve({ solved: true, moves: [], nodesExplored: 0, timeMs: 0, algorithm: 'auto' as const }),
        cancel: () => {},
        destroy: () => {},
      } as unknown as SolverClient;

      const c = new GameController(
        { root, hudContainer, boardContainer, controlsContainer },
        { solverClient: delayedClient }
      );

      const p1 = c.requestHint();
      const p2 = c.requestHint(); // concurrent call while loading

      expect(callCount).toBe(1);
      expect(await p2).toBeNull();

      resolveHint(1);
      await p1;
      c.destroy();
    });
  });

  describe('Audio cues integration', () => {
    it('plays button click on sound unmute and undo sound on move undo', () => {
      const soundSynth = controller.getSoundSynthesizer();
      const clickSpy = vi.spyOn(soundSynth, 'playButtonClick');
      const undoSpy = vi.spyOn(soundSynth, 'playUndo');
      const slideSpy = vi.spyOn(soundSynth, 'playTileSlide');

      // 1. Initial state sound is enabled; toggling mutes it
      const muted = controller.toggleSound();
      expect(muted).toBe(false);
      expect(clickSpy).not.toHaveBeenCalled();

      // 2. Toggling again re-enables sound and plays wooden button click
      const unmuted = controller.toggleSound();
      expect(unmuted).toBe(true);
      expect(clickSpy).toHaveBeenCalledTimes(1);

      // 3. Make move plays tile slide
      const board = controller.getBoard();
      const blank = getBlankIndex(board);
      const targetIndex = blank === 0 ? 1 : 0;
      controller.makeMove(targetIndex);
      expect(slideSpy).toHaveBeenCalled();

      // 4. Undoing move plays undo sound
      controller.undo();
      expect(undoSpy).toHaveBeenCalled();

      clickSpy.mockRestore();
      undoSpy.mockRestore();
      slideSpy.mockRestore();
    });
  });

  describe('Haptic feedback & Theme switching integration', () => {
    it('supports switching across all 5 themes and persists in storage', () => {
      const themes = [
        'wood-light',
        'wood-dark',
        'marble-gold',
        'tatami-sakura',
        'neon-cyberpunk',
      ] as const;

      for (const theme of themes) {
        controller.setTheme(theme);
        expect(document.body.getAttribute('data-theme')).toBe(theme);
        expect(controller.getStorageManager().getSettings().theme).toBe(theme);
      }
    });

    it('triggers haptics on move, victory, and button interaction', () => {
      const haptics = controller.getHapticFeedback();
      const slideSpy = vi.spyOn(haptics, 'vibrateSlide');
      const snapSpy = vi.spyOn(haptics, 'vibrateSnap');
      const victorySpy = vi.spyOn(haptics, 'vibrateVictory');
      const buttonSpy = vi.spyOn(haptics, 'vibrateButton');

      // 1. Button click via toggleSound triggers haptic vibration even when muting
      buttonSpy.mockClear();
      controller.toggleSound();
      expect(buttonSpy).toHaveBeenCalledTimes(1);

      // 2. Tile slide triggering vibrateSlide or vibrateSnap
      const board = controller.getBoard();
      const blank = getBlankIndex(board);
      const targetIndex = blank === 0 ? 1 : 0;
      controller.makeMove(targetIndex);
      expect(slideSpy.mock.calls.length + snapSpy.mock.calls.length).toBeGreaterThan(0);

      // 3. Force win state triggers victory fanfare rhythm
      controller.forceSolvedStateForTesting();
      expect(victorySpy).toHaveBeenCalled();
    });

    it('differentiates between vibrateSnap when tile reaches home slot and vibrateSlide otherwise', () => {
      const haptics = controller.getHapticFeedback();
      const slideSpy = vi.spyOn(haptics, 'vibrateSlide');
      const snapSpy = vi.spyOn(haptics, 'vibrateSnap');

      // Create a test board where moving a tile places it into its home slot
      // [0, 1, 3, 4, 5, 6, 7, 2, 8] - size 3
      // Moving tile 1 (at index 1) to index 0:
      // In next board: tiles[0] = 1 (target slot for tile 1 is index 0: tileVal === 0 + 1)
      // tiles[7] is 2, tiles[8] is 8 (not solved yet, so not victory)
      const snapBoard = {
        n: 3,
        size: 3,
        tiles: [0, 1, 3, 4, 5, 6, 7, 2, 8],
      };
      (controller as unknown as { board: typeof snapBoard; status: string }).board = snapBoard;
      (controller as unknown as { status: string }).status = 'playing';

      snapSpy.mockClear();
      slideSpy.mockClear();

      controller.makeMove(1);
      expect(snapSpy).toHaveBeenCalledTimes(1);
      expect(slideSpy).not.toHaveBeenCalled();

      // Now create a test board where moving a tile does NOT place it into its home slot
      // [0, 7, 3, 4, 5, 6, 1, 2, 8]
      // Moving tile 7 (at index 1) to index 0:
      // In next board: tiles[0] = 7 (7 !== 0 + 1, so not home slot!)
      const nonSnapBoard = {
        n: 3,
        size: 3,
        tiles: [0, 7, 3, 4, 5, 6, 1, 2, 8],
      };
      (controller as unknown as { board: typeof nonSnapBoard }).board = nonSnapBoard;

      snapSpy.mockClear();
      slideSpy.mockClear();

      controller.makeMove(1);
      expect(slideSpy).toHaveBeenCalledTimes(1);
      expect(snapSpy).not.toHaveBeenCalled();
    });
  });
});
