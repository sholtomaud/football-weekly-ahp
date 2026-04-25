/**
 * AHP Engine — Football Weekly Pairwise Analysis
 *
 * For each remaining EPL match (criterion), the user rates:
 *   "Who do you want to WIN this match?"
 *
 * The engine maps match-level preferences to season-level alternatives:
 *   A) Spurs Get Relegated
 *   B) Arsenal Win the Premier League Title
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Match {
  id: string;
  label: string;
  gameweek: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeColor: string;
  awayColor: string;
  
  // Season outcome beneficiaries
  helpsArsenalTitle:   'home' | 'away' | 'neither';
  helpsCityTitle:      'home' | 'away' | 'neither';
  helpsSpursRelegated: 'home' | 'away' | 'neither';
  helpsSpursSurvive:   'home' | 'away' | 'neither';
  
  // Context shown in analysis card
  arsenalTitleContext:   string;
  cityTitleContext:      string;
  spursRelegatedContext: string;
  spursSurviveContext:   string;
}

export interface AlternativeRank {
  name: string;
  key: 'arsenal-title' | 'city-title' | 'spurs-relegated' | 'spurs-survive';
  score: number;        // 0–1 normalised priority (support)
  rank: number;
}

export interface CriterionRank {
  matchId: string;
  label: string;
  weight: number;  // 0–1 normalised importance
  rank: number;
}

export interface AHPResult {
  preferred: 'arsenal-title' | 'city-title' | 'spurs-relegated' | 'spurs-survive' | 'equal';
  rankedAlternatives: AlternativeRank[];
  rankedCriteria: CriterionRank[];
  consistencyRatio: number;
  confidencePercent: number;
}

// ---------------------------------------------------------------------------
// Saaty scale — continuous linear interpolation
// sliderToSaaty(0) = 1 (equal), sliderToSaaty(±4) = 9 (extreme)
// ---------------------------------------------------------------------------

export function sliderToSaaty(v: number): number {
  return 1 + 2 * Math.abs(v);  // linear: 0→1, 1→3, 2→5, 3→7, 4→9
}

/**
 * Human-readable label for the current slider position.
 * negative v → prefer home team; positive → prefer away team.
 */
export function getSliderLabel(v: number, homeTeam: string, awayTeam: string): string {
  const abs = Math.abs(v);
  if (abs < 0.15) return 'No preference — equally weighted';
  const team = v < 0 ? homeTeam : awayTeam;
  if (abs < 1.5) return `Slightly want ${team} to win`;
  if (abs < 2.5) return `Want ${team} to win`;
  if (abs < 3.5) return `Strongly want ${team} to win`;
  return `Extremely want ${team} to win`;
}

// ---------------------------------------------------------------------------
// Saaty Random Consistency Index (n = 1..10)
// ---------------------------------------------------------------------------
const RI: number[] = [0, 0, 0, 0.58, 0.90, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49];

// ---------------------------------------------------------------------------
// AHP Engine
// ---------------------------------------------------------------------------

export class AHPEngine {
  private matches: Match[] = [];
  // v[i] ∈ [-4, 4] step 0.1: negative = want home, positive = want away
  private sliderValues: number[] = [];

  setMatches(matches: Match[]): void {
    this.matches = matches;
    this.sliderValues = new Array(matches.length).fill(0);
  }

  getMatches(): Match[] {
    return [...this.matches];
  }

  setSliderValue(index: number, value: number): void {
    if (index >= 0 && index < this.sliderValues.length) {
      this.sliderValues[index] = Math.max(-4, Math.min(4, value));
    }
  }

  getSliderValue(index: number): number {
    return this.sliderValues[index] ?? 0;
  }

  getAllSliderValues(): number[] {
    return [...this.sliderValues];
  }

  /**
   * Build criteria importance weights via AHP eigenvector method.
   * Pairwise matrix A[i][j] = saaty_i / saaty_j (always consistent).
   */
  private computeCriteriaWeights(): { weights: number[]; cr: number } {
    const n = this.matches.length;
    if (n === 0) return { weights: [], cr: 0 };

    const saaty = this.sliderValues.map(sliderToSaaty);

    // Pairwise matrix
    const matrix: number[][] = Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => saaty[i] / saaty[j])
    );

    // Geometric-mean eigenvector approximation
    const geoMeans = matrix.map((row) =>
      Math.pow(row.reduce((p, v) => p * v, 1), 1 / n)
    );
    const geoSum = geoMeans.reduce((s, v) => s + v, 0);
    const weights = geoMeans.map((g) => g / geoSum);

    // Consistency ratio
    const Aw = matrix.map((row) =>
      row.reduce((s, v, j) => s + v * weights[j], 0)
    );
    const lambdaMax = Aw.reduce((s, v, i) => s + v / weights[i], 0) / n;
    const ci = n > 1 ? (lambdaMax - n) / (n - 1) : 0;
    const ri = RI[n] ?? 1.49;
    const cr = ri > 0 ? Math.max(0, ci / ri) : 0;

    return { weights, cr };
  }

  /**
   * For each match-slider value, compute normalised alternative scores for all 4 outcomes.
   */
  private computeAltScores(): Array<Record<string, number>> {
    return this.sliderValues.map((v, i) => {
      const match = this.matches[i];
      const homeIntensity = Math.max(0, -v) / 4;
      const awayIntensity = Math.max(0, v) / 4;

      const score = (beneficiary: 'home' | 'away' | 'neither') => {
        if (beneficiary === 'home') return homeIntensity;
        if (beneficiary === 'away') return awayIntensity;
        return 0;
      };

      return {
        'arsenal-title':   score(match.helpsArsenalTitle),
        'city-title':      score(match.helpsCityTitle),
        'spurs-relegated': score(match.helpsSpursRelegated),
        'spurs-survive':   score(match.helpsSpursSurvive),
      };
    });
  }

  compute(): AHPResult {
    const n = this.matches.length;
    if (n === 0) {
      return { preferred: 'equal', rankedAlternatives: [], rankedCriteria: [], consistencyRatio: 0, confidencePercent: 0 };
    }

    const { weights, cr } = this.computeCriteriaWeights();
    const altScores = this.computeAltScores();

    const sums: Record<string, number> = {
      'arsenal-title': 0, 'city-title': 0, 'spurs-relegated': 0, 'spurs-survive': 0
    };

    for (let i = 0; i < n; i++) {
      for (const key in sums) {
        sums[key] += weights[i] * altScores[i][key];
      }
    }

    const total = Object.values(sums).reduce((a, b) => a + b, 0) || 1;
    const alternatives: AlternativeRank[] = [
      { name: 'Arsenal Win the Title',   key: 'arsenal-title',   score: sums['arsenal-title'] / total, rank: 0 },
      { name: 'Man City Win the Title',  key: 'city-title',      score: sums['city-title'] / total,    rank: 0 },
      { name: 'West Ham Stay Up',        key: 'spurs-relegated', score: sums['spurs-relegated'] / total, rank: 0 },
      { name: 'Tottenham Survive',       key: 'spurs-survive',   score: sums['spurs-survive'] / total,   rank: 0 },
    ].sort((a,b) => b.score - a.score);

    alternatives.forEach((a, i) => a.rank = i + 1);

    const winner = alternatives[0];
    const runnerUp = alternatives[1];
    const preferred = winner.score > runnerUp.score + 0.001 ? winner.key as any : 'equal';
    const confidencePercent = Math.min(Math.round((winner.score - runnerUp.score) * 200), 100);

    return { 
      preferred, 
      rankedAlternatives: alternatives, 
      rankedCriteria: this.matches
        .map((m, i) => ({ matchId: m.id, label: m.label, weight: weights[i], rank: 0 }))
        .sort((a,b) => b.weight - a.weight)
        .map((c, i) => ({ ...c, rank: i + 1 })),
      consistencyRatio: cr,
      confidencePercent 
    };
  }
}
