import type { Board } from '../core/types';
import { solvePuzzle, getNextHintTile } from './solver';
import type {
  SolverAlgorithm,
  SolverResult,
  SolverWorkerRequest,
  SolverWorkerResponse,
} from './types';

interface PendingRequest {
  resolve: (res: SolverWorkerResponse) => void;
  reject: (err: Error) => void;
  timerId: number | null;
}

export interface SolverClientOptions {
  workerFactory?: () => Worker;
}

export class SolverClient {
  private worker: Worker | null = null;
  private pendingRequests = new Map<string, PendingRequest>();
  private requestCounter = 0;
  private readonly workerFactory?: () => Worker;
  private readonly hasWorkerSupport: boolean;

  constructor(options: SolverClientOptions = {}) {
    this.workerFactory = options.workerFactory;
    this.hasWorkerSupport =
      typeof window !== 'undefined' && typeof window.Worker !== 'undefined';
  }

  private getWorker(): Worker | null {
    if (!this.hasWorkerSupport) {
      return null;
    }

    if (!this.worker) {
      try {
        if (this.workerFactory) {
          this.worker = this.workerFactory();
        } else {
          this.worker = new Worker(
            new URL('./solver.worker.ts', import.meta.url),
            { type: 'module' }
          );
        }

        this.worker.onmessage = (event: MessageEvent<SolverWorkerResponse>) => {
          this.handleWorkerMessage(event.data);
        };

        this.worker.onerror = (err) => {
          console.warn('[SolverClient] Worker error:', err);
          this.rejectAllPending(new Error('Worker encountered an error'));
        };
      } catch (e) {
        console.warn('[SolverClient] Failed to instantiate worker, falling back to main thread:', e);
        this.worker = null;
      }
    }

    return this.worker;
  }

  private handleWorkerMessage(data: SolverWorkerResponse): void {
    const pending = this.pendingRequests.get(data.id);
    if (!pending) return;

    if (pending.timerId !== null) {
      clearTimeout(pending.timerId);
    }
    this.pendingRequests.delete(data.id);

    if (data.error) {
      pending.reject(new Error(data.error));
    } else {
      pending.resolve(data);
    }
  }

  private rejectAllPending(reason: Error): void {
    for (const [, pending] of this.pendingRequests) {
      if (pending.timerId !== null) {
        clearTimeout(pending.timerId);
      }
      pending.reject(reason);
    }
    this.pendingRequests.clear();
  }

  /**
   * Requests a full solve solution for the board.
   */
  public async solve(
    board: Board,
    options: {
      timeoutMs?: number;
      algorithm?: SolverAlgorithm;
      weight?: number;
    } = {}
  ): Promise<SolverResult> {
    const timeoutMs = options.timeoutMs ?? 10000;
    const worker = this.getWorker();

    if (!worker) {
      // Direct in-thread calculation fallback
      return solvePuzzle(board, {
        timeoutMs,
        algorithm: options.algorithm,
        weight: options.weight,
      });
    }

    const id = `solve_${++this.requestCounter}_${Date.now()}`;
    const req: SolverWorkerRequest = {
      id,
      type: 'solve',
      size: board.size,
      tiles: [...board.tiles],
      algorithm: options.algorithm,
      timeoutMs,
      weight: options.weight,
    };

    return new Promise<SolverResult>((resolve, reject) => {
      const timerId = window.setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Solver timed out after ${timeoutMs}ms`));
      }, timeoutMs + 1000);

      this.pendingRequests.set(id, {
        resolve: (res) => {
          resolve({
            solved: res.success,
            moves: res.moves,
            nodesExplored: res.nodesExplored,
            timeMs: res.timeMs,
            algorithm: res.algorithm,
          });
        },
        reject,
        timerId,
      });

      worker.postMessage(req);
    });
  }

  /**
   * Requests the next optimal or near-optimal hint tile index.
   */
  public async getHint(
    board: Board,
    options: {
      timeoutMs?: number;
      algorithm?: SolverAlgorithm;
    } = {}
  ): Promise<number | null> {
    const timeoutMs = options.timeoutMs ?? 3000;
    const worker = this.getWorker();

    if (!worker) {
      // Direct in-thread calculation fallback
      return getNextHintTile(board, {
        timeoutMs,
        algorithm: options.algorithm,
      });
    }

    const id = `hint_${++this.requestCounter}_${Date.now()}`;
    const req: SolverWorkerRequest = {
      id,
      type: 'hint',
      size: board.size,
      tiles: [...board.tiles],
      algorithm: options.algorithm,
      timeoutMs,
    };

    return new Promise<number | null>((resolve) => {
      const timerId = window.setTimeout(() => {
        this.pendingRequests.delete(id);
        // On timeout, fallback to greedy next tile
        try {
          const fallbackHint = getNextHintTile(board, { timeoutMs: 200 });
          resolve(fallbackHint);
        } catch {
          resolve(null);
        }
      }, timeoutMs + 500);

      this.pendingRequests.set(id, {
        resolve: (res) => {
          resolve(res.hintTileIndex ?? (res.moves.length > 0 ? res.moves[0] : null));
        },
        reject: () => {
          // Fallback on error
          const fallbackHint = getNextHintTile(board, { timeoutMs: 200 });
          resolve(fallbackHint);
        },
        timerId,
      });

      worker.postMessage(req);
    });
  }

  /**
   * Cancels any active solving tasks by terminating the current worker.
   */
  public cancel(): void {
    if (this.worker) {
      this.rejectAllPending(new Error('Solver task cancelled'));
      this.worker.terminate();
      this.worker = null;
    }
  }

  /**
   * Destroys client and terminates any background worker.
   */
  public destroy(): void {
    this.cancel();
  }
}

export const defaultSolverClient = new SolverClient();
