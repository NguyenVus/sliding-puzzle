export type SolverAlgorithm = 'ida-star' | 'fast' | 'auto';

export interface SolverOptions {
  timeoutMs?: number;
  maxNodes?: number;
  maxDepth?: number;
  weight?: number;
  algorithm?: SolverAlgorithm;
  signal?: AbortSignal;
}

export interface SolverResult {
  solved: boolean;
  moves: number[];
  nodesExplored: number;
  timeMs: number;
  algorithm: SolverAlgorithm;
}

export interface SolverWorkerRequest {
  id: string;
  type: 'solve' | 'hint';
  size: number;
  tiles: number[];
  algorithm?: SolverAlgorithm;
  timeoutMs?: number;
  weight?: number;
}

export interface SolverWorkerResponse {
  id: string;
  type: 'solve' | 'hint';
  success: boolean;
  moves: number[];
  hintTileIndex?: number | null;
  nodesExplored: number;
  timeMs: number;
  algorithm: SolverAlgorithm;
  error?: string;
}
