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
import type { SessionRecord } from './history.ts';

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

  /**
   * Rehydrate state from a past session record.
   */
  loadFromSession(record: SessionRecord): void {
    this.completed = true;
    this.result = record.result;
    
    // Sync the engine so "Retake" uses the correct starting point
    this.engine.setMatches(REMAINING_MATCHES);
    record.sliderValues.forEach((val, idx) => {
      this.engine.setSliderValue(idx, val);
    });
  }
}

export const ahpState = AHPState.getInstance();
