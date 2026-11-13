import './style.css';
import { GameController } from './ui/game-controller';

// Initialize the game when DOM is ready
const root = document.querySelector<HTMLElement>('#app');
const hudContainer = document.querySelector<HTMLElement>('#hud-top');
const boardContainer = document.querySelector<HTMLElement>('#board-area');
const controlsContainer = document.querySelector<HTMLElement>('#hud-bottom');

if (!root || !hudContainer || !boardContainer || !controlsContainer) {
  throw new Error('Required DOM containers not found for Sliding Puzzle initialization');
}

const gameController = new GameController({
  root,
  hudContainer,
  boardContainer,
  controlsContainer,
});

// Expose controller on window for debugging & automated Playwright tests
declare global {
  interface Window {
    __slidingPuzzleController?: GameController;
  }
}

window.__slidingPuzzleController = gameController;
