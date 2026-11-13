import { createBoard } from '../core/board';
import { solvePuzzle, getNextHintTile } from './solver';
import type { SolverWorkerRequest, SolverWorkerResponse } from './types';

// Web Worker message listener
self.onmessage = (event: MessageEvent<SolverWorkerRequest>) => {
  const req = event.data;
  if (!req || !req.id) return;

  try {
    const board = createBoard(req.size, req.tiles);

    if (req.type === 'hint') {
      const hintTile = getNextHintTile(board, {
        timeoutMs: req.timeoutMs ?? 3000,
        algorithm: req.algorithm,
        weight: req.weight,
      });

      const response: SolverWorkerResponse = {
        id: req.id,
        type: 'hint',
        success: true,
        moves: hintTile !== null ? [hintTile] : [],
        hintTileIndex: hintTile,
        nodesExplored: 0,
        timeMs: 0,
        algorithm: req.algorithm ?? 'auto',
      };
      self.postMessage(response);
      return;
    }

    // Default: 'solve'
    const result = solvePuzzle(board, {
      timeoutMs: req.timeoutMs ?? 10000,
      algorithm: req.algorithm,
      weight: req.weight,
    });

    const response: SolverWorkerResponse = {
      id: req.id,
      type: 'solve',
      success: result.solved,
      moves: result.moves,
      hintTileIndex: result.moves.length > 0 ? result.moves[0] : null,
      nodesExplored: result.nodesExplored,
      timeMs: result.timeMs,
      algorithm: result.algorithm,
    };
    self.postMessage(response);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const response: SolverWorkerResponse = {
      id: req.id,
      type: req.type,
      success: false,
      moves: [],
      hintTileIndex: null,
      nodesExplored: 0,
      timeMs: 0,
      algorithm: req.algorithm ?? 'auto',
      error: errorMsg,
    };
    self.postMessage(response);
  }
};
