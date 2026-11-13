import type { Board } from '../core/types';
import { isSolved, getBlankIndex } from '../core/board';
import { calculateCombinedHeuristic } from './heuristic';
import type { SolverOptions, SolverResult } from './types';

interface PathNode {
  tile: number;
  parent: PathNode | null;
}

interface SearchNode {
  tiles: number[];
  blank: number;
  g: number;
  h: number;
  f: number;
  path: PathNode | null;
}

function reconstructMoves(node: PathNode | null): number[] {
  const moves: number[] = [];
  let curr = node;
  while (curr !== null) {
    moves.push(curr.tile);
    curr = curr.parent;
  }
  return moves.reverse();
}

class FastMinHeap {
  private readonly data: SearchNode[] = [];

  public push(node: SearchNode): void {
    this.data.push(node);
    this.bubbleUp(this.data.length - 1);
  }

  public pop(): SearchNode | null {
    if (this.data.length === 0) return null;
    const top = this.data[0];
    const bottom = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = bottom;
      this.sinkDown(0);
    }
    return top;
  }

  public get size(): number {
    return this.data.length;
  }

  private isBetter(a: SearchNode, b: SearchNode): boolean {
    if (a.f !== b.f) {
      return a.f < b.f;
    }
    // Tie-break: prefer state with lower heuristic (closer to target)
    return a.h < b.h;
  }

  private bubbleUp(idx: number): void {
    while (idx > 0) {
      const parentIdx = (idx - 1) >> 1;
      if (this.isBetter(this.data[idx], this.data[parentIdx])) {
        const temp = this.data[idx];
        this.data[idx] = this.data[parentIdx];
        this.data[parentIdx] = temp;
        idx = parentIdx;
      } else {
        break;
      }
    }
  }

  private sinkDown(idx: number): void {
    const length = this.data.length;
    while (true) {
      let smallest = idx;
      const left = (idx << 1) + 1;
      const right = (idx << 1) + 2;

      if (left < length && this.isBetter(this.data[left], this.data[smallest])) {
        smallest = left;
      }
      if (right < length && this.isBetter(this.data[right], this.data[smallest])) {
        smallest = right;
      }
      if (smallest !== idx) {
        const temp = this.data[idx];
        this.data[idx] = this.data[smallest];
        this.data[smallest] = temp;
        idx = smallest;
      } else {
        break;
      }
    }
  }
}

/**
 * Solves sliding puzzle using Weighted A* (W-A*) with admissible Manhattan + Linear Conflict heuristic.
 * Offers extremely high speed and near-optimal paths for boards 3x3 to 8x8.
 */
export function solveFast(board: Board, options: SolverOptions = {}): SolverResult {
  const startTime = performance.now();
  const size = board.size;
  const timeoutMs = options.timeoutMs ?? 5000;
  const maxNodes = options.maxNodes ?? 150_000;
  const defaultWeight =
    size >= 8 ? 8.0 : size >= 7 ? 7.0 : size >= 6 ? 6.0 : size >= 5 ? 4.5 : 3.5;
  const weight = options.weight ?? defaultWeight;
  const signal = options.signal;

  if (isSolved(board)) {
    return {
      solved: true,
      moves: [],
      nodesExplored: 0,
      timeMs: performance.now() - startTime,
      algorithm: 'fast',
    };
  }

  const initialTiles = [...board.tiles];
  const initialBlank = getBlankIndex(board);
  const initialH = calculateCombinedHeuristic(size, initialTiles);
  const startKey = String.fromCharCode(...initialTiles);

  const heap = new FastMinHeap();
  const visited = new Map<string, number>();

  const startNode: SearchNode = {
    tiles: initialTiles,
    blank: initialBlank,
    g: 0,
    h: initialH,
    f: weight * initialH,
    path: null,
  };

  heap.push(startNode);
  visited.set(startKey, 0);

  let bestNode: SearchNode = startNode;
  let nodesExplored = 0;

  while (heap.size > 0 && nodesExplored < maxNodes) {
    if (signal?.aborted) {
      break;
    }

    if ((nodesExplored & 511) === 0) {
      if (performance.now() - startTime > timeoutMs) {
        break;
      }
    }

    const current = heap.pop()!;
    nodesExplored++;

    if (current.h === 0) {
      return {
        solved: true,
        moves: reconstructMoves(current.path),
        nodesExplored,
        timeMs: performance.now() - startTime,
        algorithm: 'fast',
      };
    }

    if (current.h < bestNode.h) {
      bestNode = current;
    }

    const { tiles, blank, g, path } = current;
    const blankRow = Math.floor(blank / size);
    const blankCol = blank % size;

    const neighbors: number[] = [];
    if (blankRow > 0) neighbors.push((blankRow - 1) * size + blankCol);
    if (blankRow < size - 1) neighbors.push((blankRow + 1) * size + blankCol);
    if (blankCol > 0) neighbors.push(blankRow * size + (blankCol - 1));
    if (blankCol < size - 1) neighbors.push(blankRow * size + (blankCol + 1));

    for (let i = 0; i < neighbors.length; i++) {
      const nextTile = neighbors[i];
      const nextTiles = [...tiles];
      nextTiles[blank] = nextTiles[nextTile];
      nextTiles[nextTile] = 0;

      const key = String.fromCharCode(...nextTiles);
      const nextG = g + 1;
      const prevG = visited.get(key);
      if (prevG !== undefined && prevG <= nextG) {
        continue;
      }
      visited.set(key, nextG);

      const h = calculateCombinedHeuristic(size, nextTiles);
      const f = nextG + weight * h;

      heap.push({
        tiles: nextTiles,
        blank: nextTile,
        g: nextG,
        h,
        f,
        path: {
          tile: nextTile,
          parent: path,
        },
      });
    }
  }

  // If time expired or nodes exhausted before full resolution,
  // return best path towards minimal heuristic node found
  return {
    solved: false,
    moves: reconstructMoves(bestNode.path),
    nodesExplored,
    timeMs: performance.now() - startTime,
    algorithm: 'fast',
  };
}
