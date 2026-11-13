import { describe, it, expect } from 'vitest';
import { createBoard, createSolved, isSolved, moveTile } from '../../src/core/board';
import { getNextHintTile, solvePuzzle } from '../../src/solver/solver';
import { SolverClient } from '../../src/solver/solver-client';

describe('Solver Client & High-Level Solver (src/solver/)', () => {
  it('getNextHintTile returns null for an already solved board', () => {
    const solved = createSolved(3);
    const hint = getNextHintTile(solved);
    expect(hint).toBeNull();
  });

  it('getNextHintTile returns the immediate winning move on a 1-move board', () => {
    const board = createBoard(3, [1, 2, 3, 4, 5, 6, 7, 0, 8]);
    const hint = getNextHintTile(board);
    expect(hint).toBe(8);

    const next = moveTile(board, hint!);
    expect(isSolved(next)).toBe(true);
  });

  it('solvePuzzle uses IDA* for 3x3 and returns optimal path', () => {
    const board = createBoard(3, [1, 2, 3, 4, 5, 6, 0, 7, 8]);
    const result = solvePuzzle(board);

    expect(result.solved).toBe(true);
    expect(result.moves).toHaveLength(2);
    expect(result.algorithm).toBe('ida-star');
  });

  it('SolverClient operates cleanly with in-thread fallback in happy-dom', async () => {
    const client = new SolverClient();
    const board = createBoard(3, [1, 2, 3, 4, 5, 6, 7, 0, 8]);

    const hint = await client.getHint(board);
    expect(hint).toBe(8);

    const solveRes = await client.solve(board);
    expect(solveRes.solved).toBe(true);
    expect(solveRes.moves).toEqual([8]);

    client.cancel();
    client.destroy();
  });

  it('SolverClient communicates with Worker and handles cancellation cleanly', async () => {
    let messageReceived: unknown = null;
    let terminated = false;

    // Mock Worker
    const mockWorker = {
      onmessage: null as ((ev: MessageEvent) => void) | null,
      onerror: null as ((ev: ErrorEvent) => void) | null,
      postMessage: (data: unknown) => {
        messageReceived = data;
      },
      terminate: () => {
        terminated = true;
      },
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    } as unknown as Worker;

    // Force worker support in test
    (window as unknown as { Worker: typeof Worker }).Worker = class {} as unknown as typeof Worker;

    const client = new SolverClient({
      workerFactory: () => mockWorker,
    });

    const board = createBoard(3, [1, 2, 3, 4, 5, 6, 7, 0, 8]);
    const hintPromise = client.getHint(board);

    expect(messageReceived).not.toBeNull();

    // Cancel while pending
    client.cancel();
    expect(terminated).toBe(true);

    const hintResult = await hintPromise;
    expect(hintResult).toBeNull(); // Cancelled request resolves to null without running fallback

    client.destroy();
    delete (window as unknown as { Worker?: unknown }).Worker;
  });
});
