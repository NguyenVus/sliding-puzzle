import type { Board } from '../core/types';
import {
  createSolved,
  getBlankIndex,
  isSolved,
  moveTile,
} from '../core/board';
import { scrambleBoard } from '../core/scramble';

import { LayoutManager } from './layout-manager';
import { BoardView } from './components/board-view';
import { HudView, type GameMode } from './components/hud-view';
import { ModalView } from './components/modal-view';
import { LevelSelectView } from './components/level-select-view';
import { PointerHandler, type SwipeDirection } from './input/pointer-handler';
import { KeyboardHandler } from './input/keyboard-handler';

import { getLevel, createLevelBoard } from '../levels/level-manager';
import { evaluateStars } from '../levels/star-evaluator';
import { StorageManager, defaultStorage } from '../storage/storage-manager';

export type GameStatus = 'ready' | 'playing' | 'won';

export interface GameControllerElements {
  root: HTMLElement;
  hudContainer: HTMLElement;
  boardContainer: HTMLElement;
  controlsContainer: HTMLElement;
}

export interface GameControllerOptions {
  storageManager?: StorageManager;
  initialMode?: GameMode;
  initialLevel?: number;
  initialSize?: number;
}

export class GameController {
  private readonly elements: GameControllerElements;
  private readonly storageManager: StorageManager;
  private layoutManager!: LayoutManager;
  private boardView!: BoardView;
  private hudView!: HudView;
  private modalView!: ModalView;
  private levelSelectView!: LevelSelectView;
  private pointerHandler!: PointerHandler;
  private keyboardHandler!: KeyboardHandler;

  private mode: GameMode = 'campaign';
  private currentLevelId: number = 1;
  private size = 3;
  private board!: Board;
  private initialScrambledBoard!: Board;
  private history: Board[] = [];
  private moves = 0;
  private elapsedSeconds = 0;
  private timerIntervalId: number | null = null;
  private timerStartTime = 0;
  private status: GameStatus = 'ready';

  constructor(
    elements: GameControllerElements,
    options: GameControllerOptions = {}
  ) {
    this.elements = elements;
    this.storageManager = options.storageManager ?? defaultStorage;
    this.mode = options.initialMode ?? 'campaign';
    const savedData = this.storageManager.load();
    this.currentLevelId =
      options.initialLevel ?? Math.min(30, Math.max(1, savedData.unlockedMaxLevel));
    this.size =
      options.initialSize ??
      (this.mode === 'campaign' ? (getLevel(this.currentLevelId)?.size ?? 3) : 3);

    this.init();
  }

  private init(): void {
    // 1. Initialize Views & Managers
    this.layoutManager = new LayoutManager(
      this.elements.boardContainer,
      this.elements.root,
      {
        gridSize: this.size,
        onLayoutChange: (metrics) => {
          this.boardView?.updateMetrics(metrics);
        },
      }
    );

    this.boardView = new BoardView(this.elements.boardContainer, {
      onTileClick: (index) => {
        this.makeMove(index);
      },
    });

    this.hudView = new HudView(
      this.elements.hudContainer,
      this.elements.controlsContainer,
      {
        mode: this.mode,
        currentSize: this.size,
        onUndo: () => this.undo(),
        onRestart: () => this.restartGame(),
        onScramble: () => this.startNewGame(),
        onSizeChange: (size) => this.changeSize(size),
        onOpenLevelSelect: () => this.openLevelSelect(),
        onSwitchMode: (nextMode) => this.setMode(nextMode),
      }
    );

    this.modalView = new ModalView(this.elements.root, {
      onRestart: () => this.restartGame(),
      onNewGame: () => this.startNewGame(),
      onNextLevel: (nextLevelId) => this.loadLevel(nextLevelId),
      onOpenLevelSelect: () => this.openLevelSelect(),
      onClose: () => this.modalView.close(),
    });

    this.levelSelectView = new LevelSelectView(this.elements.root, {
      onSelectLevel: (lvlId) => this.loadLevel(lvlId),
      onSwitchToFreePlay: () => this.startFreePlay(this.size),
      onClose: () => {
        this.levelSelectView.close();
        if (this.status === 'playing') {
          this.startTimer();
        }
      },
    });

    // 2. Initialize Input Handlers
    this.pointerHandler = new PointerHandler(this.boardView.container, {
      getTileSize: () => this.layoutManager.getMetrics().tileSize,
      getGridSize: () => this.size,
      onTap: (index) => {
        this.boardView.notifyActionHandled();
        this.makeMove(index);
      },
      onSwipe: (direction, startIndex) => {
        this.boardView.notifyActionHandled();
        this.handleSwipe(direction, startIndex);
      },
    });

    this.keyboardHandler = new KeyboardHandler({
      onDirectionMove: (direction) => {
        this.makeDirectionalMove(direction);
      },
      onUndo: () => this.undo(),
      onRestart: () => this.restartGame(),
      onEscape: () => {
        if (this.modalView.isOpen()) {
          this.modalView.close();
        } else if (this.levelSelectView.isOpen()) {
          this.levelSelectView.close();
        }
      },
    });

    // 3. Start first game: default to Level 1 in campaign mode
    if (this.mode === 'campaign') {
      this.loadLevel(this.currentLevelId);
    } else {
      this.startFreePlay(this.size);
    }
  }

  /**
   * Loads and starts a campaign level (1-30).
   */
  public loadLevel(levelId: number): void {
    const config = getLevel(levelId);
    if (!config) {
      console.warn(`Invalid level ${levelId}`);
      return;
    }

    this.mode = 'campaign';
    this.currentLevelId = levelId;
    this.size = config.size;

    this.layoutManager.setGridSize(this.size);
    this.hudView.setMode('campaign', config);

    this.stopTimer();
    this.elapsedSeconds = 0;
    this.moves = 0;
    this.history = [];
    this.status = 'ready';
    this.modalView.close();
    this.levelSelectView.close();

    // Deterministic level scramble
    const levelBoard = createLevelBoard(levelId);
    this.board = levelBoard;
    this.initialScrambledBoard = levelBoard;

    this.boardView.render(this.board, { animate: false });
    this.hudView.setMoves(0);
    this.hudView.setTime(0);
    this.hudView.setCanUndo(false);
  }

  /**
   * Starts Free Play mode with given grid size (3x3 to 8x8).
   */
  public startFreePlay(size: number = 3): void {
    const validSize = Math.max(3, Math.min(8, size));
    this.mode = 'freeplay';
    this.size = validSize;

    this.layoutManager.setGridSize(this.size);
    this.hudView.setMode('freeplay', undefined, this.size);

    this.stopTimer();
    this.elapsedSeconds = 0;
    this.moves = 0;
    this.history = [];
    this.status = 'ready';
    this.modalView.close();
    this.levelSelectView.close();

    // Random solvable scramble
    const scrambleSteps = Math.max(120, this.size * this.size * 6);
    let scrambled = scrambleBoard(this.size, scrambleSteps);
    while (isSolved(scrambled)) {
      scrambled = scrambleBoard(this.size, scrambleSteps);
    }

    this.board = scrambled;
    this.initialScrambledBoard = scrambled;

    this.boardView.render(this.board, { animate: false });
    this.hudView.setMoves(0);
    this.hudView.setTime(0);
    this.hudView.setCanUndo(false);
  }

  /**
   * Starts a brand new game with a freshly scrambled board.
   * If newSize is provided, switches to Free Play with that size.
   */
  public startNewGame(newSize?: number): void {
    if (newSize !== undefined && newSize >= 2) {
      this.startFreePlay(newSize);
      return;
    }

    if (this.mode === 'campaign') {
      this.restartGame();
    } else {
      this.startFreePlay(this.size);
    }
  }

  /**
   * Restarts the current game to its initial scramble state.
   */
  public restartGame(): void {
    if (this.levelSelectView && this.levelSelectView.isOpen()) {
      return;
    }
    this.stopTimer();
    this.elapsedSeconds = 0;
    this.moves = 0;
    this.history = [];
    this.status = 'ready';
    this.modalView.close();

    this.board = this.initialScrambledBoard;
    this.boardView.render(this.board, { animate: false });
    this.hudView.setMoves(0);
    this.hudView.setTime(0);
    this.hudView.setCanUndo(false);
  }

  /**
   * Changes the grid size (3-8) in Free Play mode.
   */
  public changeSize(newSize: number): void {
    if (newSize >= 3 && newSize <= 8) {
      this.startFreePlay(newSize);
    }
  }

  /**
   * Switches game mode between 'campaign' and 'freeplay'.
   */
  public setMode(mode: GameMode): void {
    if (mode === 'campaign') {
      this.loadLevel(this.currentLevelId);
    } else {
      this.startFreePlay(this.size);
    }
  }

  public getMode(): GameMode {
    return this.mode;
  }

  public getCurrentLevel(): number | null {
    return this.mode === 'campaign' ? this.currentLevelId : null;
  }

  public isModalOpen(): boolean {
    return Boolean(
      (this.levelSelectView && this.levelSelectView.isOpen()) ||
      (this.modalView && this.modalView.isOpen())
    );
  }

  public openLevelSelect(): void {
    if (this.status === 'playing') {
      this.stopTimer();
    }
    const records = this.storageManager.getAllLevelRecords();
    this.levelSelectView.show({
      records,
      currentLevelId: this.currentLevelId,
      currentMode: this.mode,
    });
  }

  public closeLevelSelect(): void {
    this.levelSelectView.close();
    if (this.status === 'playing') {
      this.startTimer();
    }
  }

  public getStorageManager(): StorageManager {
    return this.storageManager;
  }

  /**
   * Executes a move on the tile at index.
   */
  public makeMove(index: number): boolean {
    if (this.status === 'won' || this.isModalOpen()) {
      return false;
    }

    const nextBoard = moveTile(this.board, index);
    if (nextBoard === this.board) {
      return false; // Invalid move
    }

    // Start timer on first move
    if (this.status === 'ready') {
      this.status = 'playing';
      this.startTimer();
    }

    // Record previous state for Undo
    this.history.push(this.board);
    this.board = nextBoard;
    this.moves += 1;

    // Animate move
    this.boardView.render(this.board, { animate: true });
    this.hudView.setMoves(this.moves);
    this.hudView.setCanUndo(true);

    // Check win condition
    if (isSolved(this.board)) {
      this.handleVictory();
    }

    return true;
  }

  /**
   * Handles directional sliding (Keyboard Arrow / WASD or direct swipe).
   */
  public makeDirectionalMove(direction: SwipeDirection): boolean {
    if (this.status === 'won' || this.isModalOpen()) return false;

    const blankIndex = getBlankIndex(this.board);
    if (blankIndex === -1) return false;

    const blankRow = Math.floor(blankIndex / this.size);
    const blankCol = blankIndex % this.size;

    let targetRow = blankRow;
    let targetCol = blankCol;

    switch (direction) {
      case 'up':
        targetRow = blankRow + 1;
        break;
      case 'down':
        targetRow = blankRow - 1;
        break;
      case 'left':
        targetCol = blankCol + 1;
        break;
      case 'right':
        targetCol = blankCol - 1;
        break;
    }

    if (
      targetRow >= 0 &&
      targetRow < this.size &&
      targetCol >= 0 &&
      targetCol < this.size
    ) {
      const targetIndex = targetRow * this.size + targetCol;
      return this.makeMove(targetIndex);
    }

    return false;
  }

  /**
   * Handles pointer swipe gestures with smart target alignment.
   */
  private handleSwipe(
    direction: SwipeDirection,
    startIndex: number | null
  ): void {
    if (startIndex !== null && startIndex >= 0 && startIndex < this.board.tiles.length) {
      const blankIndex = getBlankIndex(this.board);
      const blankRow = Math.floor(blankIndex / this.size);
      const blankCol = blankIndex % this.size;
      const tileRow = Math.floor(startIndex / this.size);
      const tileCol = startIndex % this.size;

      let aligned = false;
      if (tileRow === blankRow) {
        if (blankCol < tileCol && direction === 'left') aligned = true;
        if (blankCol > tileCol && direction === 'right') aligned = true;
      } else if (tileCol === blankCol) {
        if (blankRow < tileRow && direction === 'up') aligned = true;
        if (blankRow > tileRow && direction === 'down') aligned = true;
      }

      if (aligned) {
        this.makeMove(startIndex);
        return;
      }
    }

    this.makeDirectionalMove(direction);
  }

  /**
   * Undoes the last move.
   */
  public undo(): boolean {
    if (this.isModalOpen() || this.history.length === 0) {
      return false;
    }

    if (this.status === 'won') {
      this.modalView.close();
      this.status = 'playing';
      this.startTimer();
    }

    const previousBoard = this.history.pop()!;
    this.board = previousBoard;
    if (this.moves > 0) {
      this.moves -= 1;
    }

    // If completely reverted back to initial state, reset to ready status
    if (this.history.length === 0 && this.moves === 0) {
      this.status = 'ready';
      this.stopTimer();
      this.elapsedSeconds = 0;
      this.hudView.setTime(0);
    }

    this.boardView.render(this.board, { animate: true });
    this.hudView.setMoves(this.moves);
    this.hudView.setCanUndo(this.history.length > 0);

    return true;
  }

  private handleVictory(): void {
    this.status = 'won';
    this.stopTimer();

    const mins = Math.floor(this.elapsedSeconds / 60);
    const secs = this.elapsedSeconds % 60;
    const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    if (this.mode === 'campaign') {
      const config = getLevel(this.currentLevelId)!;
      const evalResult = evaluateStars(this.moves, this.elapsedSeconds, config);
      const saveResult = this.storageManager.recordLevelVictory(
        this.currentLevelId,
        this.moves,
        this.elapsedSeconds,
        evalResult.stars
      );

      this.modalView.showVictory({
        moves: this.moves,
        timeFormatted,
        size: this.size,
        mode: 'campaign',
        levelId: this.currentLevelId,
        stars: evalResult.stars,
        parMoves: config.parMoves,
        targetTimeSec: config.targetTimeSec,
        isNewRecord: saveResult.isNewRecord,
        unlockedNext: saveResult.unlockedNext,
        nextLevelId: saveResult.nextLevelId,
      });
    } else {
      const isNew = this.storageManager.recordFreePlayVictory(
        this.size,
        this.moves,
        this.elapsedSeconds
      );

      this.modalView.showVictory({
        moves: this.moves,
        timeFormatted,
        size: this.size,
        mode: 'freeplay',
        isNewRecord: isNew,
      });
    }
  }

  private startTimer(): void {
    this.stopTimer();
    this.timerStartTime = Date.now() - this.elapsedSeconds * 1000;

    this.timerIntervalId = window.setInterval(() => {
      this.elapsedSeconds = Math.floor((Date.now() - this.timerStartTime) / 1000);
      this.hudView.setTime(this.elapsedSeconds);
    }, 250);
  }

  private stopTimer(): void {
    if (this.timerIntervalId !== null) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
  }

  public getBoard(): Board {
    return this.board;
  }

  public getMoves(): number {
    return this.moves;
  }

  public getStatus(): GameStatus {
    return this.status;
  }

  public getElapsedSeconds(): number {
    return this.elapsedSeconds;
  }

  /**
   * For automated testing / verification of win state.
   */
  public forceSolvedStateForTesting(): void {
    this.board = createSolved(this.size);
    this.boardView.render(this.board, { animate: false });
    this.handleVictory();
  }

  public destroy(): void {
    this.stopTimer();
    this.layoutManager.destroy();
    this.pointerHandler.destroy();
    this.keyboardHandler.destroy();
    this.modalView.close();
    this.levelSelectView.close();
  }
}
