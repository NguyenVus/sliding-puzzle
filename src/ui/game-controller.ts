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
import type { WoodTheme } from '../storage/types';
import { SolverClient, defaultSolverClient } from '../solver';
import { SoundSynthesizer } from '../audio';
import { PictureManager } from '../picture';
import { MenuModalView } from './components/menu-modal-view';
import { SettingsModalView } from './components/settings-modal-view';
import { HowToPlayModalView } from './components/how-to-play-modal-view';
import { PictureModalView } from './components/picture-modal-view';

export type GameStatus = 'ready' | 'playing' | 'won';

export interface GameControllerElements {
  root: HTMLElement;
  hudContainer: HTMLElement;
  boardContainer: HTMLElement;
  controlsContainer: HTMLElement;
}

export interface GameControllerOptions {
  storageManager?: StorageManager;
  solverClient?: SolverClient;
  soundSynthesizer?: SoundSynthesizer;
  pictureManager?: PictureManager;
  initialMode?: GameMode;
  initialLevel?: number;
  initialSize?: number;
}

export class GameController {
  private readonly elements: GameControllerElements;
  private readonly storageManager: StorageManager;
  private readonly solverClient: SolverClient;
  private readonly soundSynthesizer: SoundSynthesizer;
  private readonly pictureManager: PictureManager;
  private layoutManager!: LayoutManager;
  private boardView!: BoardView;
  private hudView!: HudView;
  private modalView!: ModalView;
  private levelSelectView!: LevelSelectView;
  private menuModalView!: MenuModalView;
  private settingsModalView!: SettingsModalView;
  private howToPlayModalView!: HowToPlayModalView;
  private pictureModalView!: PictureModalView;
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
  private hasUsedHint = false;
  private isAutoSolving = false;
  private isHintLoading = false;
  private autoSolveTimerId: number | null = null;
  private autoSolveMoves: number[] = [];
  private autoSolveSessionId = 0;
  private boardRevision = 0;

  constructor(
    elements: GameControllerElements,
    options: GameControllerOptions = {}
  ) {
    this.elements = elements;
    this.storageManager = options.storageManager ?? defaultStorage;
    this.solverClient = options.solverClient ?? defaultSolverClient;
    this.soundSynthesizer =
      options.soundSynthesizer ?? new SoundSynthesizer({ storageManager: this.storageManager });
    this.pictureManager =
      options.pictureManager ?? new PictureManager(this.storageManager);
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
    const userSettings = this.storageManager.getSettings();
    if (typeof document !== 'undefined' && document.body) {
      document.body.setAttribute('data-theme', userSettings.theme);
      document.body.setAttribute('data-animations', String(userSettings.animationEnabled));
    }

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
      pictureManager: this.pictureManager,
      animationEnabled: userSettings.animationEnabled,
      onTileClick: (index) => {
        if (this.isAutoSolving) {
          this.stopAutoSolve();
        }
        this.makeMove(index);
      },
    });

    this.hudView = new HudView(
      this.elements.hudContainer,
      this.elements.controlsContainer,
      {
        mode: this.mode,
        currentSize: this.size,
        soundEnabled: this.soundSynthesizer.isSoundEnabled(),
        isPictureMode: this.pictureManager.isEnabled(),
        onUndo: () => this.undo(),
        onRestart: () => {
          this.soundSynthesizer.playButtonClick();
          this.restartGame();
        },
        onScramble: () => {
          this.soundSynthesizer.playButtonClick();
          this.startNewGame();
        },
        onHint: () => {
          this.soundSynthesizer.playButtonClick();
          void this.requestHint();
        },
        onAutoSolve: () => {
          this.soundSynthesizer.playButtonClick();
          void this.toggleAutoSolve();
        },
        onSizeChange: (size) => {
          this.soundSynthesizer.playButtonClick();
          this.changeSize(size);
        },
        onOpenLevelSelect: () => {
          this.soundSynthesizer.playButtonClick();
          this.openLevelSelect();
        },
        onSwitchMode: (nextMode) => {
          this.soundSynthesizer.playButtonClick();
          this.setMode(nextMode);
        },
        onOpenMenu: () => {
          this.soundSynthesizer.playButtonClick();
          this.openMainMenu();
        },
        onToggleSound: () => this.toggleSound(),
        onOpenSettings: () => {
          this.soundSynthesizer.playButtonClick();
          this.openSettings();
        },
        onPreviewPicture: () => {
          this.soundSynthesizer.playButtonClick();
          this.openPicturePreview();
        },
      }
    );

    this.modalView = new ModalView(this.elements.root, {
      onRestart: () => {
        this.soundSynthesizer.playButtonClick();
        this.restartGame();
      },
      onNewGame: () => {
        this.soundSynthesizer.playButtonClick();
        this.startNewGame();
      },
      onNextLevel: (nextLevelId) => {
        this.soundSynthesizer.playButtonClick();
        this.loadLevel(nextLevelId);
      },
      onOpenLevelSelect: () => {
        this.soundSynthesizer.playButtonClick();
        this.openLevelSelect();
      },
      onClose: () => {
        this.soundSynthesizer.playButtonClick();
        this.modalView.close();
      },
    });

    this.levelSelectView = new LevelSelectView(this.elements.root, {
      onSelectLevel: (lvlId) => {
        this.soundSynthesizer.playButtonClick();
        this.loadLevel(lvlId);
      },
      onSwitchToFreePlay: () => {
        this.soundSynthesizer.playButtonClick();
        this.startFreePlay(this.size);
      },
      onClose: () => {
        this.soundSynthesizer.playButtonClick();
        this.levelSelectView.close();
        if (this.status === 'playing') {
          this.startTimer();
        }
      },
    });

    this.menuModalView = new MenuModalView(this.elements.root, {
      onSelectCampaign: () => {
        this.soundSynthesizer.playButtonClick();
        this.openLevelSelect();
      },
      onSelectFreePlay: () => {
        this.soundSynthesizer.playButtonClick();
        this.startFreePlay(this.size);
      },
      onSelectPictureMode: () => {
        this.soundSynthesizer.playButtonClick();
        this.openPictureSelector();
      },
      onOpenSettings: () => {
        this.soundSynthesizer.playButtonClick();
        this.openSettings();
      },
      onOpenHowToPlay: () => {
        this.soundSynthesizer.playButtonClick();
        this.openHowToPlay();
      },
      onClose: () => {
        this.soundSynthesizer.playButtonClick();
        if (this.status === 'playing') this.startTimer();
      },
    });

    this.settingsModalView = new SettingsModalView(this.elements.root, {
      storageManager: this.storageManager,
      onSoundChange: (enabled) => {
        this.soundSynthesizer.setSoundEnabled(enabled);
        this.hudView.setSoundEnabled(enabled);
        if (enabled) {
          this.soundSynthesizer.playButtonClick();
        }
      },
      onThemeChange: (theme) => {
        this.soundSynthesizer.playButtonClick();
        this.setTheme(theme);
      },
      onAnimationChange: (enabled) => {
        this.soundSynthesizer.playButtonClick();
        this.setAnimationEnabled(enabled);
      },
      onPictureModeChange: (enabled) => {
        this.soundSynthesizer.playButtonClick();
        this.setPictureMode(enabled);
      },
      onPictureNumbersChange: (enabled) => {
        this.soundSynthesizer.playButtonClick();
        this.pictureManager.setNumbersVisible(enabled);
        this.boardView.render(this.board, { animate: false });
      },
      onResetProgress: () => {
        this.soundSynthesizer.playButtonClick();
        this.storageManager.resetAll();
        this.loadLevel(1);
      },
      onClose: () => {
        this.soundSynthesizer.playButtonClick();
        if (this.status === 'playing') this.startTimer();
      },
    });

    this.howToPlayModalView = new HowToPlayModalView(this.elements.root, {
      onClose: () => {
        this.soundSynthesizer.playButtonClick();
        if (this.status === 'playing') this.startTimer();
      },
    });

    this.pictureModalView = new PictureModalView(this.elements.root, {
      pictureManager: this.pictureManager,
      gridSize: this.size,
      onSelectPreset: (presetId) => {
        this.soundSynthesizer.playButtonClick();
        this.pictureManager.selectPreset(presetId);
        this.setPictureMode(true);
      },
      onUploadCustom: (dataUrl) => {
        this.soundSynthesizer.playButtonClick();
        this.pictureManager.setCustomImage(dataUrl);
        this.setPictureMode(true);
      },
      onApply: () => {
        this.soundSynthesizer.playButtonClick();
        this.setPictureMode(true);
      },
      onDisablePictureMode: () => {
        this.soundSynthesizer.playButtonClick();
        this.setPictureMode(false);
      },
      onClose: () => {
        this.soundSynthesizer.playButtonClick();
        if (this.status === 'playing') this.startTimer();
      },
    });

    // 2. Initialize Input Handlers
    this.pointerHandler = new PointerHandler(this.boardView.container, {
      getTileSize: () => this.layoutManager.getMetrics().tileSize,
      getGridSize: () => this.size,
      onTap: (index) => {
        if (this.isAutoSolving) {
          this.stopAutoSolve();
        }
        this.boardView.notifyActionHandled();
        this.makeMove(index);
      },
      onSwipe: (direction, startIndex) => {
        if (this.isAutoSolving) {
          this.stopAutoSolve();
        }
        this.boardView.notifyActionHandled();
        this.handleSwipe(direction, startIndex);
      },
    });

    this.keyboardHandler = new KeyboardHandler({
      onDirectionMove: (direction) => {
        if (this.isAutoSolving) {
          this.stopAutoSolve();
        }
        this.makeDirectionalMove(direction);
      },
      onUndo: () => this.undo(),
      onRestart: () => {
        this.soundSynthesizer.playButtonClick();
        this.restartGame();
      },
      onHint: () => {
        this.soundSynthesizer.playButtonClick();
        void this.requestHint();
      },
      onEscape: () => {
        this.soundSynthesizer.playButtonClick();
        if (this.modalView.isOpen()) {
          this.modalView.close();
        } else if (this.levelSelectView.isOpen()) {
          this.closeLevelSelect();
        } else if (this.menuModalView.isOpen()) {
          this.menuModalView.close();
        } else if (this.settingsModalView.isOpen()) {
          this.settingsModalView.close();
        } else if (this.howToPlayModalView.isOpen()) {
          this.howToPlayModalView.close();
        } else if (this.pictureModalView.isOpen()) {
          this.pictureModalView.close();
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
    this.boardRevision += 1;

    this.stopAutoSolve();
    this.hasUsedHint = false;
    this.boardRevision += 1;
    this.boardView.clearHint();

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
    this.boardRevision += 1;

    this.stopAutoSolve();
    this.hasUsedHint = false;
    this.boardRevision += 1;
    this.boardView.clearHint();

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
    this.stopAutoSolve();
    this.hasUsedHint = false;
    this.boardRevision += 1;
    this.boardView.clearHint();

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
      (this.modalView && this.modalView.isOpen()) ||
      (this.menuModalView && this.menuModalView.isOpen()) ||
      (this.settingsModalView && this.settingsModalView.isOpen()) ||
      (this.howToPlayModalView && this.howToPlayModalView.isOpen()) ||
      (this.pictureModalView && this.pictureModalView.isOpen())
    );
  }

  public openMainMenu(): void {
    if (this.status === 'playing') {
      this.stopTimer();
    }
    this.menuModalView.show();
  }

  public openSettings(): void {
    if (this.status === 'playing') {
      this.stopTimer();
    }
    this.settingsModalView.show();
  }

  public openHowToPlay(): void {
    if (this.status === 'playing') {
      this.stopTimer();
    }
    this.howToPlayModalView.show();
  }

  public openPictureSelector(): void {
    if (this.status === 'playing') {
      this.stopTimer();
    }
    this.pictureModalView.showSelector(this.size);
  }

  public openPicturePreview(): void {
    if (this.status === 'playing') {
      this.stopTimer();
    }
    this.pictureModalView.showPreview(this.size);
  }

  public toggleSound(): boolean {
    const nextState = this.soundSynthesizer.toggleMute();
    this.hudView.setSoundEnabled(nextState);
    if (nextState) {
      this.soundSynthesizer.playButtonClick();
    }
    return nextState;
  }

  public setTheme(theme: WoodTheme): void {
    if (typeof document !== 'undefined' && document.body) {
      document.body.setAttribute('data-theme', theme);
    }
    this.storageManager.updateSettings({ theme });
  }

  public setAnimationEnabled(enabled: boolean): void {
    if (typeof document !== 'undefined' && document.body) {
      document.body.setAttribute('data-animations', String(enabled));
    }
    this.boardView.setAnimationEnabled(enabled);
    this.storageManager.updateSettings({ animationEnabled: enabled });
  }

  public setPictureMode(enabled: boolean): void {
    this.pictureManager.setEnabled(enabled);
    this.hudView.setPictureModeActive(enabled);
    this.boardView.render(this.board, { animate: false });
    this.storageManager.updateSettings({ pictureModeEnabled: enabled });
  }

  public getSoundSynthesizer(): SoundSynthesizer {
    return this.soundSynthesizer;
  }

  public getPictureManager(): PictureManager {
    return this.pictureManager;
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
    this.boardRevision += 1;
    this.history.push(this.board);
    this.board = nextBoard;
    this.moves += 1;
    this.boardView.clearHint();

    // Animate move
    this.boardView.render(this.board, { animate: true });
    this.hudView.setMoves(this.moves);
    this.hudView.setCanUndo(true);

    // Play tactile mechanical wood click sound
    this.soundSynthesizer.playTileSlide();

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
    this.boardRevision += 1;
    this.boardView.clearHint();
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
    this.soundSynthesizer.playUndo();

    return true;
  }

  private handleVictory(): void {
    this.status = 'won';
    this.stopTimer();
    this.stopAutoSolve();
    this.boardView.clearHint();

    // Play triumphant victory chime
    this.soundSynthesizer.playVictory();

    const mins = Math.floor(this.elapsedSeconds / 60);
    const secs = this.elapsedSeconds % 60;
    const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    if (this.mode === 'campaign') {
      const config = getLevel(this.currentLevelId)!;
      const evalResult = evaluateStars(
        this.moves,
        this.elapsedSeconds,
        config,
        this.hasUsedHint
      );
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

  public getHasUsedHint(): boolean {
    return this.hasUsedHint;
  }

  public getIsAutoSolving(): boolean {
    return this.isAutoSolving;
  }

  /**
   * Requests a hint from the solver client and highlights the recommended tile.
   * Marking hasUsedHint = true applies the 1-star maximum rating rule.
   */
  public async requestHint(): Promise<number | null> {
    if (
      this.status === 'won' ||
      this.isModalOpen() ||
      this.isAutoSolving ||
      this.isHintLoading ||
      isSolved(this.board)
    ) {
      return null;
    }

    const reqRevision = this.boardRevision;
    this.isHintLoading = true;
    this.hasUsedHint = true;
    this.hudView.setHintLoading(true);

    try {
      const hintTile = await this.solverClient.getHint(this.board);
      if (
        this.boardRevision === reqRevision &&
        (this.status === 'playing' || this.status === 'ready') &&
        !this.isModalOpen() &&
        hintTile !== null
      ) {
        this.boardView.setHintTile(hintTile);
      }
      return hintTile;
    } finally {
      this.isHintLoading = false;
      this.hudView.setHintLoading(false);
    }
  }

  /**
   * Toggles auto-solve mode on or off.
   */
  public async toggleAutoSolve(): Promise<void> {
    if (this.isAutoSolving) {
      this.stopAutoSolve();
    } else {
      await this.startAutoSolve();
    }
  }

  /**
   * Solves the board automatically and animates each step smoothly (~220ms/move).
   * Marking hasUsedHint = true applies the 1-star maximum rating rule.
   */
  public async startAutoSolve(): Promise<void> {
    if (this.status === 'won' || this.isModalOpen() || this.isAutoSolving) {
      return;
    }
    if (isSolved(this.board)) {
      return;
    }

    const sessionId = ++this.autoSolveSessionId;
    this.hasUsedHint = true;
    this.isAutoSolving = true;
    this.hudView.setAutoSolving(true);
    this.boardView.clearHint();

    try {
      const result = await this.solverClient.solve(this.board, {
        timeoutMs: 12000,
      });

      if (!this.isAutoSolving || this.autoSolveSessionId !== sessionId) {
        return;
      }

      if (result.moves.length === 0) {
        if (isSolved(this.board)) {
          this.handleVictory();
        } else {
          this.stopAutoSolve();
        }
        return;
      }

      this.autoSolveMoves = [...result.moves];
      this.stepAutoSolve(sessionId);
    } catch {
      if (this.autoSolveSessionId === sessionId) {
        this.stopAutoSolve();
      }
    }
  }

  private stepAutoSolve(sessionId: number): void {
    if (!this.isAutoSolving || this.autoSolveSessionId !== sessionId) {
      this.stopAutoSolve();
      return;
    }

    if (this.autoSolveMoves.length === 0) {
      if (isSolved(this.board)) {
        this.stopAutoSolve();
        if (this.status !== 'won') {
          this.handleVictory();
        }
        return;
      }
      // If previous batch exhausted but board not yet solved, continue solving
      void this.continueAutoSolve(sessionId);
      return;
    }

    const nextTileIndex = this.autoSolveMoves.shift()!;
    const success = this.makeMove(nextTileIndex);

    if (!success || this.status === 'won') {
      this.stopAutoSolve();
      return;
    }

    this.autoSolveTimerId = window.setTimeout(() => {
      this.stepAutoSolve(sessionId);
    }, 220);
  }

  private async continueAutoSolve(sessionId: number): Promise<void> {
    if (
      !this.isAutoSolving ||
      this.autoSolveSessionId !== sessionId ||
      isSolved(this.board) ||
      this.status === 'won'
    ) {
      this.stopAutoSolve();
      return;
    }

    try {
      const result = await this.solverClient.solve(this.board, {
        timeoutMs: 8000,
      });

      if (!this.isAutoSolving || this.autoSolveSessionId !== sessionId) {
        return;
      }

      if (result.moves.length === 0) {
        this.stopAutoSolve();
        return;
      }

      this.autoSolveMoves = [...result.moves];
      this.stepAutoSolve(sessionId);
    } catch {
      if (this.autoSolveSessionId === sessionId) {
        this.stopAutoSolve();
      }
    }
  }

  public stopAutoSolve(): void {
    this.autoSolveSessionId += 1;
    if (this.autoSolveTimerId !== null) {
      clearTimeout(this.autoSolveTimerId);
      this.autoSolveTimerId = null;
    }
    this.isAutoSolving = false;
    this.autoSolveMoves = [];
    this.hudView.setAutoSolving(false);
    this.solverClient.cancel();
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
    this.stopAutoSolve();
    this.solverClient.destroy();
    this.soundSynthesizer.destroy();
    this.stopTimer();
    this.layoutManager.destroy();
    this.pointerHandler.destroy();
    this.keyboardHandler.destroy();
    this.modalView.close();
    this.levelSelectView.close();
    this.menuModalView.close();
    this.settingsModalView.close();
    this.howToPlayModalView.close();
    this.pictureModalView.close();
  }
}
