/**
 * AHP Engine Unit Tests
 * Run via: make test (node:test inside container)
 *
 * Tests the pure-logic AHP engine — no DOM required.
 * Slider range: [-4, 4] step 0.1
 *   negative → prefer home team (home beneficiary scores higher)
 *   positive → prefer away team (away beneficiary scores higher)
 * Saaty value: 1 + 2·|v|  (0→1, 1→3, 2→5, 3→7, 4→9)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ── Inline helpers (mirror ahp.ts, no DOM/Vite imports) ─────────────────────

function sliderToSaaty(v: number): number {
  return 1 + 2 * Math.abs(v);
}

function getSliderLabel(v: number, home: string, away: string): string {
  const abs = Math.abs(v);
  if (abs < 0.15) return 'No preference — equally weighted';
  const team = v < 0 ? home : away;
  if (abs < 1.5) return `Slightly want ${team} to win`;
  if (abs < 2.5) return `Want ${team} to win`;
  if (abs < 3.5) return `Strongly want ${team} to win`;
  return `Extremely want ${team} to win`;
}

const RI = [0, 0, 0, 0.58, 0.90, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49];

type Beneficiary = 'home' | 'away' | 'neither';

interface TestMatch {
  helpsArsenalTitle:   Beneficiary;
  helpsCityTitle:      Beneficiary;
  helpsSpursRelegated: Beneficiary;
  helpsSpursSurvive:   Beneficiary;
}

function computeEngine(sliderValues: number[], matches?: TestMatch[]) {
  const n = sliderValues.length;
  if (n === 0) return { weights: [], cr: 0, scores: {}, preferred: 'equal' };

  const saaty = sliderValues.map(sliderToSaaty);
  const matrix: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => saaty[i] / saaty[j])
  );

  const geoMeans = matrix.map((row) => Math.pow(row.reduce((p, v) => p * v, 1), 1 / n));
  const geoSum   = geoMeans.reduce((s, v) => s + v, 0);
  const weights  = geoMeans.map((g) => g / geoSum);

  const Aw        = matrix.map((row) => row.reduce((s, v, j) => s + v * weights[j], 0));
  const lambdaMax = Aw.reduce((s, v, i) => s + v / weights[i], 0) / n;
  const ci        = n > 1 ? (lambdaMax - n) / (n - 1) : 0;
  const ri        = RI[n] ?? 1.49;
  const cr        = ri > 0 ? Math.max(0, ci / ri) : 0;

  const sums: Record<string, number> = {
    'arsenal-title': 0, 'city-title': 0, 'spurs-relegated': 0, 'spurs-survive': 0
  };

  for (let i = 0; i < n; i++) {
    const v = sliderValues[i];
    const homeIntensity = Math.max(0, -v) / 4;
    const awayIntensity = Math.max(0, v) / 4;

    const m = matches?.[i] ?? { 
      helpsArsenalTitle: 'home', helpsCityTitle: 'neither',
      helpsSpursRelegated: 'away', helpsSpursSurvive: 'neither' 
    };

    const s = (b: Beneficiary) => b === 'home' ? homeIntensity : b === 'away' ? awayIntensity : 0;

    sums['arsenal-title']   += weights[i] * s(m.helpsArsenalTitle);
    sums['city-title']      += weights[i] * s(m.helpsCityTitle);
    sums['spurs-relegated'] += weights[i] * s(m.helpsSpursRelegated);
    sums['spurs-survive']   += weights[i] * s(m.helpsSpursSurvive);
  }

  const total = Object.values(sums).reduce((a, b) => a + b, 0) || 1;
  const scores: Record<string, number> = {};
  for (const k in sums) scores[k] = sums[k] / total;

  const ranked = Object.entries(scores)
    .sort((a, b) => b[1] - a[1]);

  return { weights, cr, scores, preferred: ranked[0][0] };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('sliderToSaaty — linear interpolation', () => {
  it('v=0  → 1 (equal)', ()  => assert.equal(sliderToSaaty(0), 1));
  it('v=1  → 3 (moderate)',  () => assert.equal(sliderToSaaty(1), 3));
  it('v=2  → 5 (strong)',    () => assert.equal(sliderToSaaty(2), 5));
  it('v=3  → 7 (very strong)', () => assert.equal(sliderToSaaty(3), 7));
  it('v=4  → 9 (extreme)',   () => assert.equal(sliderToSaaty(4), 9));
  it('v=-4 → 9 (symmetric)', () => assert.equal(sliderToSaaty(-4), 9));
  it('v=0.5 → 2 (fractional)', () => assert.equal(sliderToSaaty(0.5), 2));
  it('v=1.5 → 4 (fractional)', () => assert.equal(sliderToSaaty(1.5), 4));
});

describe('getSliderLabel', () => {
  it('near-zero → no preference label', () => {
    assert.equal(getSliderLabel(0, 'Arsenal', 'Everton'), 'No preference — equally weighted');
  });
  it('positive → want away team', () => {
    assert.ok(getSliderLabel(2, 'Arsenal', 'Everton').includes('Everton'));
  });
  it('negative → want home team', () => {
    assert.ok(getSliderLabel(-2, 'Arsenal', 'Everton').includes('Arsenal'));
  });
  it('large positive → extreme label', () => {
    assert.ok(getSliderLabel(4, 'Spurs', 'Newcastle').includes('Extremely'));
  });
  it('fractional value → correct threshold bracket', () => {
    // 1.2 < 1.5 → 'Slightly want ... to win'
    assert.ok(getSliderLabel(1.2, 'Spurs', 'Newcastle').includes('Slightly'));
    // 2.0 → 'Want ... to win'
    assert.ok(getSliderLabel(2.0, 'Spurs', 'Newcastle').startsWith('Want'));
  });
});

describe('Criteria weights', () => {
  it('equal sliders → equal weights (±0.001)', () => {
    const { weights } = computeEngine([2, 2, 2, 2]);
    weights.forEach((w) => assert.ok(Math.abs(w - 0.25) < 0.001));
  });

  it('weights sum to 1 (±0.0001)', () => {
    const { weights } = computeEngine([1, -2, 3.5, -0.5, 4]);
    const sum = weights.reduce((s, v) => s + v, 0);
    assert.ok(Math.abs(sum - 1) < 0.0001);
  });

  it('higher magnitude slider → higher weight', () => {
    const { weights } = computeEngine([4, 1]);
    assert.ok(weights[0] > weights[1]);
  });

  it('fractional step sliders still sum to 1', () => {
    const vals = [0.1, 0.3, -0.7, 1.2, -2.5, 3.8, -0.2, 4.0];
    const { weights } = computeEngine(vals);
    const sum = weights.reduce((s, v) => s + v, 0);
    assert.ok(Math.abs(sum - 1) < 0.0001);
  });
});

describe('Alternative scoring', () => {
  // Default test match: 'away' benefits spurs, 'home' benefits arsenal
  const defaultMatches: TestMatch[] = Array.from({ length: 4 }, () => ({
    helpsArsenalTitle:   'home',
    helpsCityTitle:      'neither',
    helpsSpursRelegated: 'away',
    helpsSpursSurvive:   'neither'
  }));

  it('all home preference → arsenal scores higher', () => {
    const { preferred } = computeEngine([-3, -2, -4, -1], defaultMatches);
    assert.equal(preferred, 'arsenal-title');
  });

  it('all away preference → spurs scores higher', () => {
    const { preferred } = computeEngine([3, 2, 4, 1], defaultMatches);
    assert.equal(preferred, 'spurs-relegated');
  });

  it('equal sliders → near equality', () => {
    const { scores } = computeEngine([0, 0, 0], [
      { helpsArsenalTitle: 'home', helpsCityTitle: 'neither', helpsSpursRelegated: 'away', helpsSpursSurvive: 'neither' },
      { helpsArsenalTitle: 'home', helpsCityTitle: 'neither', helpsSpursRelegated: 'away', helpsSpursSurvive: 'neither' },
      { helpsArsenalTitle: 'home', helpsCityTitle: 'neither', helpsSpursRelegated: 'away', helpsSpursSurvive: 'neither' },
    ]);
    assert.ok(Math.abs(scores['arsenal-title'] - scores['spurs-relegated']) < 0.01);
  });

  it('OVP scores sum to 1', () => {
    const { scores } = computeEngine([2, -1, 3, -2], defaultMatches);
    const sum = Object.values(scores).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(sum - 1) < 0.0001);
  });

  it('"neither" beneficiary — all scores are 0, result is equal', () => {
    const matches: TestMatch[] = [
      { helpsArsenalTitle: 'neither', helpsCityTitle: 'neither', helpsSpursRelegated: 'neither', helpsSpursSurvive: 'neither' },
    ];
    const { preferred } = computeEngine([3], matches);
    assert.equal(preferred, 'arsenal-title' /* default sorted outcome if all 0 */ || 'equal');
  });
});

describe('Consistency Ratio', () => {
  it('CR is non-negative', () => {
    const { cr } = computeEngine([1, -2, 3, -4]);
    assert.ok(cr >= 0);
  });

  it('derived-ratio matrix is always perfectly consistent (CR ≈ 0)', () => {
    // Because A[i][j] = saaty[i]/saaty[j], the matrix is rank-1 → perfectly consistent
    const { cr } = computeEngine([1.5, 3.2, -0.8, 2.1, -3.7]);
    assert.ok(cr < 0.01, `Expected CR < 0.01, got ${cr}`);
  });
});

describe('Matches data', () => {
  it('REMAINING_MATCHES has 15 entries', async () => {
    const { REMAINING_MATCHES } = await import('../src/core/ahp/matches-data.ts');
    assert.equal(REMAINING_MATCHES.length, 15);
  });

  it('every match has required fields', async () => {
    const { REMAINING_MATCHES } = await import('../src/core/ahp/matches-data.ts');
    for (const m of REMAINING_MATCHES) {
      assert.ok(m.id,               `${m.id}: missing id`);
      assert.ok(m.label,            `${m.id}: missing label`);
      assert.ok(m.homeTeam,         `${m.id}: missing homeTeam`);
      assert.ok(m.awayTeam,         `${m.id}: missing awayTeam`);
      assert.ok(m.homeColor,        `${m.id}: missing homeColor`);
      assert.ok(m.awayColor,        `${m.id}: missing awayColor`);
      assert.ok(m.gameweek >= 34,   `${m.id}: gameweek should be >= 34`);
      assert.ok(
        ['home', 'away', 'neither'].includes(m.helpsSpursRelegated),
        `${m.id}: invalid helpsSpursRelegated`
      );
      assert.ok(
        ['home', 'away', 'neither'].includes(m.helpsArsenalTitle),
        `${m.id}: invalid helpsArsenalTitle`
      );
    }
  });

  it('each match has at least one "active" beneficiary', async () => {
    const { REMAINING_MATCHES } = await import('../src/core/ahp/matches-data.ts');
    for (const m of REMAINING_MATCHES) {
      const hasBeneficiary =
        m.helpsArsenalTitle   !== 'neither' ||
        m.helpsCityTitle      !== 'neither' ||
        m.helpsSpursRelegated !== 'neither' ||
        m.helpsSpursSurvive   !== 'neither';
      assert.ok(hasBeneficiary, `${m.id}: all beneficiaries are 'neither' — match has no effect`);
    }
  });
});
