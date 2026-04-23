/**
 * Shared AHP Analysis State
 *
 * Singleton persisted across SPA route changes.
 * analysis-page writes; results-page reads.
 */

import { AHPEngine } from './ahp.ts';
import type { AHPResult } from './ahp.ts';
import { REMAINING_MATCHES } from './matches-data.ts';
import { saveSession } from './history.ts';

class AHPState {
  private static _instance: AHPState;

  readonly engine: AHPEngine;
  currentStep: number = 0;
  completed: boolean = false;
  result: AHPResult | null = null;

  private constructor() {
    this.engine = new AHPEngine();
    this.engine.setMatches(REMAINING_MATCHES);
  }

  static getInstance(): AHPState {
    if (!AHPState._instance) {
      AHPState._instance = new AHPState();
    }
    return AHPState._instance;
  }

  get matches() {
    return REMAINING_MATCHES;
  }

  reset(): void {
    this.currentStep = 0;
    this.completed = false;
    this.result = null;
    this.engine.setMatches(REMAINING_MATCHES);
  }

  finalise(): AHPResult {
    this.result = this.engine.compute();
    this.completed = true;
    // Persist to localStorage history
    saveSession(this.engine.getAllSliderValues(), this.result);
    return this.result;
  }
}

export const ahpState = AHPState.getInstance();
