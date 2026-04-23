/**
 * AHP Scenario Tests — Expected Outcome Validation
 *
 * Slider conventions (v ∈ [-4, 4]):
 *   v < 0  → prefer HOME team to win
 *   v > 0  → prefer AWAY team to win
 *   v = 0  → no preference
 *
 * Real 2025-26 fixture map (19 matches):
 *   GW34:
 *    0  West Ham vs Everton              spurs: HOME(West Ham) [Safe → Rel ✓]
 *    1  Arsenal vs Newcastle             arsenal: HOME(Arsenal)
 *    2  Wolves vs Tottenham              spurs: HOME(Wolves) [Rel ✓]
 *   GW35:
 *    3  Brentford vs West Ham            spurs: AWAY(West Ham) [Safe → Rel ✓]
 *    4  Arsenal vs Fulham                arsenal: HOME(Arsenal)
 *    5  Aston Villa vs Tottenham         spurs: HOME(Aston Villa) [Rel ✓]
 *    6  Everton vs Man City              arsenal: HOME(Everton)
 *   GW36:
 *    7  Man City vs Brentford            arsenal: AWAY(Brentford)
 *    8  West Ham vs Arsenal ⚡           arsenal: AWAY(Arsenal), spurs: HOME(West Ham) — CONFLICT
 *    9  Tottenham vs Leeds               spurs: AWAY(Leeds) [Rel ✓]
 *   GW37:
 *   10  Bournemouth vs Man City          arsenal: HOME(Bournemouth)
 *   11  Arsenal vs Burnley               arsenal: HOME(Arsenal)
 *   12  Chelsea vs Tottenham             spurs: HOME(Chelsea) [Rel ✓]
 *   13  Newcastle vs West Ham            spurs: AWAY(West Ham) [Safe → Rel ✓]
 *   GW31 (Rescheduled):
 *   14  Man City vs Palace               arsenal: AWAY(Palace)
 *   GW38 — Final Day:
 *   15  Crystal Palace vs Arsenal        arsenal: AWAY(Arsenal)
 *   16  Man City vs Aston Villa          arsenal: AWAY(Aston Villa)
 *   17  Tottenham vs Everton             spurs: AWAY(Everton) [Rel ✓]
 *   18  West Ham vs Leeds                spurs: HOME(West Ham) [Safe → Rel ✓]
 *
 * ⚡ CONFLICT (match 5 — West Ham vs Arsenal):
 *   Sliding towards Arsenal (AWAY, positive) helps the title but costs West Ham points.
 *   Sliding towards West Ham (HOME, negative) keeps West Ham safe (helps relegation)
 *   but gives nothing to the Arsenal title.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AHPEngine } from '../src/core/ahp/ahp.ts';
import { REMAINING_MATCHES } from '../src/core/ahp/matches-data.ts';

// ── Helper ─────────────────────────────────────────────────────────────────

function runScenario(
  sliderValues: number[],
  descriptions: string[]
): ReturnType<AHPEngine['compute']> & { trace: string } {
  assert.equal(
    sliderValues.length,
    REMAINING_MATCHES.length,
    `Need exactly ${REMAINING_MATCHES.length} slider values, got ${sliderValues.length}`
  );

  const engine = new AHPEngine();
  engine.setMatches(REMAINING_MATCHES);
  sliderValues.forEach((v, i) => engine.setSliderValue(i, v));
  const result = engine.compute();

  const lines = ['', '  Scenario breakdown:'];
  REMAINING_MATCHES.forEach((m, i) => {
    const v = sliderValues[i];
    const desc = descriptions[i] ?? '—';
    const saaty = (1 + 2 * Math.abs(v)).toFixed(1);
    const helps = [];
    if (m.helpsArsenalTitle !== 'neither')   helps.push('A');
    if (m.helpsCityTitle !== 'neither')      helps.push('C');
    if (m.helpsSpursRelegated !== 'neither') helps.push('R');
    if (m.helpsSpursSurvive !== 'neither')   helps.push('S');
    const tags = helps.length > 0 ? ` [${helps.join('')}]` : '';

    lines.push(
      `  [${String(i).padStart(2)}] ${m.label.padEnd(38)} v=${String(v).padEnd(5)} (${saaty})${tags} → ${desc}`
    );
  });

  const a = result.rankedAlternatives.find(x => x.key === 'arsenal-title');
  const r = result.rankedAlternatives.find(x => x.key === 'spurs-relegated');
  const s = result.rankedAlternatives.find(x => x.key === 'spurs-survive');
  const c = result.rankedAlternatives.find(x => x.key === 'city-title');
  lines.push(
    `  Result: ${result.preferred} | ` +
    `Ars ${((a?.score ?? 0) * 100).toFixed(1)}% | ` +
    `City ${((c?.score ?? 0) * 100).toFixed(1)}% | ` +
    `Rel ${((r?.score ?? 0) * 100).toFixed(1)}% | ` +
    `Surv ${((s?.score ?? 0) * 100).toFixed(1)}% | ` +
    `CR ${result.consistencyRatio.toFixed(3)}`
  );

  return { ...result, trace: lines.join('\n') };
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('Scenario: Pure Arsenal Title preference', () => {
  /**
   * Want Arsenal to win all their matches AND Man City to drop points.
   * Spurs/West Ham matches = neutral (0).
   * Expected: arsenal-title, high confidence.
   */
  it('should return arsenal-title', () => {
    const sliders = [
       0,  //  0  West Ham vs Everton
      -4,  //  1  Arsenal vs Newcastle    → Arsenal
       0,  //  2  Wolves vs Tottenham
       0,  //  3  Brentford vs West Ham
      -4,  //  4  Arsenal vs Fulham       → Arsenal
       0,  //  5  Villa vs Tottenham
      -4,  //  6  Everton vs Man City     → beat City → Arsenal
       4,  //  7  Man City vs Brentford   → beat City → Arsenal
       4,  //  8  West Ham vs Arsenal ⚡ → Arsenal
       0,  //  9  Tottenham vs Leeds
      -4,  // 10  Bournemouth vs City     → beat City → Arsenal
      -4,  // 11  Arsenal vs Burnley      → Arsenal
       0,  // 12  Chelsea vs Tottenham
       0,  // 13  Newcastle vs West Ham
       4,  // 14  Man City vs Palace      → beat City → Arsenal
       4,  // 15  Palace vs Arsenal       → Arsenal
       4,  // 16  Man City vs Aston Villa → beat City → Arsenal
       0,  // 17  Tottenham vs Everton
       0,  // 18  West Ham vs Leeds
    ];
    const result = runScenario(sliders, [
      'Neutral',
      'Want Arsenal to win → Arsenal title ✓',
      'Neutral',
      'Want Everton to beat City → Arsenal title ✓',
      'Want Brentford to beat City → Arsenal title ✓',
      'Want Arsenal to win away ⚡ → Arsenal title ✓ (West Ham lose)',
      'Neutral',
      'Want Bournemouth to beat City → Arsenal title ✓',
      'Want Arsenal to win → Arsenal title ✓',
      'Neutral',
      'Neutral',
      'Want Arsenal to win Final Day → Arsenal title ✓',
      'Want Villa to beat City → Arsenal title ✓',
      'Neutral',
      'Neutral',
    ]);
    console.log(result.trace);
    assert.equal(result.preferred, 'arsenal-title');
  });

  it('should have very high confidence (>70%)', () => {
    const sliders = [0, -4, 0, 0, -4, 0, -4, 4, 4, 0, -4, -4, 0, 0, 4, 4, 4, 0, 0];
    const engine = new AHPEngine();
    engine.setMatches(REMAINING_MATCHES);
    sliders.forEach((v, i) => engine.setSliderValue(i, v));
    const result = engine.compute();
    assert.ok(result.confidencePercent > 70, `Expected >70% but got ${result.confidencePercent}%`);
  });
});

describe('Scenario: Pure Spurs Survive preference', () => {
  it('should return spurs-survive when maximizing spurs win/rival loss', () => {
    const sliders = [
       4,  //  0  West Ham vs Everton → want Everton win ✓ (West Ham drop pts)
       0,  //  1  Arsenal vs Newcastle 
       4,  //  2  Wolves vs Spurs     → want Spurs win ✓
      -4,  //  3  Brentford vs WHam   → want Brentford win ✓ (West Ham drop pts)
       0,  //  4  Arsenal vs Fulham
       4,  //  5  Villa vs Spurs      → want Spurs win ✓
       0,  //  6  Everton vs City
       0,  //  7  Man City vs Brentford
       4,  //  8  West Ham vs Arsenal → want Arsenal win ✓ (hurts West Ham pts)
      -4,  //  9  Spurs vs Leeds      → want Spurs win ✓
       0,  // 10  Bournemouth vs City
       0,  // 11  Arsenal vs Burnley
       4,  // 12  Chelsea vs Spurs    → want Spurs win ✓
      -4,  // 13  Newcastle vs WHam   → want Newcastle win ✓ (West Ham drop pts)
       0,  // 14  Man City vs Palace
       0,  // 15  Palace vs Arsenal
       0,  // 16  Man City vs Villa
      -4,  // 17  Spurs vs Everton    → want Spurs win ✓
       4,  // 18  West Ham vs Leeds   → want Leeds win ✓ (West Ham drop pts)
    ];
    const result = runScenario(sliders, Array(19).fill('Spurs survival focus'));
    console.log(result.trace);
    assert.equal(result.preferred, 'spurs-survive');
  });
});

describe('Scenario: Pure Spurs Relegated preference', () => {
  it('should return spurs-relegated', () => {
    const sliders = [
      -4,  //  0  West Ham vs Everton    → want WHU (HOME) to win → safe ✓
       0,  //  1  Arsenal vs Newcastle
      -4,  //  2  Wolves vs Tottenham     → want Wolves (HOME) to win → Spurs relegated ✓
      -4,  //  3  Brentford vs West Ham   → want WHU (AWAY) to win → safe ✓
       0,  //  4  Arsenal vs Fulham
      -4,  //  5  Villa vs Tottenham      — want Villa (HOME) to win → Spurs relegated ✓
       0,  //  6  Everton vs Man City
       0,  //  7  Man City vs Brentford
      -4,  //  8  West Ham vs Arsenal ⚡  — want West Ham (HOME) → keeps them safe → Spurs relegated ✓
       4,  //  9  Tottenham vs Leeds      — want Leeds (AWAY) → Spurs relegated ✓
       0,  // 10  Bournemouth vs Man City
       0,  // 11  Arsenal vs Burnley
      -4,  // 12  Chelsea vs Tottenham    — want Chelsea (HOME) → Spurs relegated ✓
       4,  // 13  Newcastle vs West Ham   — want West Ham (AWAY) to win → safe ✓
       0,  // 14  Man City vs Palace
       0,  // 15  Palace vs Arsenal
       0,  // 16  Man City vs Villa
       4,  // 17  Tottenham vs Everton    — want Everton (AWAY) → Spurs relegated ✓
      -4,  // 18  West Ham vs Leeds       — want West Ham (HOME) → safe ✓
    ];
    const result = runScenario(sliders, Array(19).fill('Relegation focus'));
    console.log(result.trace);
    assert.equal(result.preferred, 'spurs-relegated');
  });
});

describe('Scenario: All neutral (no preference)', () => {
  it('should return equal when all sliders are 0', () => {
    const sliders = Array(REMAINING_MATCHES.length).fill(0);
    const result = runScenario(sliders, sliders.map(() => 'No preference'));
    console.log(result.trace);
    assert.equal(result.preferred, 'equal');
  });
});

describe('Scenario: Balanced equal-magnitude → equal (mathematically correct)', () => {
  /**
   * When Arsenal-title matches and Spurs-relegated matches are rated at the
   * same absolute magnitude AND matched for count, the AHP produces exactly 50/50.
   *
   * Here we rate 8 Arsenal matches at magnitude 4 and 7 Spurs matches at 4 too
   * — but the conflict match (5) is the tiebreaker: sliding towards Arsenal (AWAY).
   * That means Arsenal-title gets an extra contribution via the conflict match.
   *
   * With 8 Arsenal "votes" vs 7 Spurs "votes" (all equal weight), Arsenal edges it.
   */
  it('conflict match tiebreaker: when all equal, the conflict match slides determine the winner', () => {
    // All non-conflict Arsenal matches + Spurs matches at same magnitude
    const arsenalFirstSliders = [
       0,  //  0  WHU vs EVE
      -4,  //  1  Arsenal vs Newcastle → Arsenal
       0,  //  2  Wolves–Spurs 
       0,  //  3  Brentford–WHU
      -4,  //  4  Arsenal vs Fulham    → Arsenal
       0,  //  5  Villa–Spurs
      -4,  //  6  Everton vs City      → Arsenal
       4,  //  7  City vs Brentford    → Arsenal
       4,  //  8  West Ham vs Arsenal ⚡ → Arsenal
       0,  //  9  Spurs–Leeds
      -4,  // 10  Bournemouth vs City  → Arsenal
      -4,  // 11  Arsenal vs Burnley   → Arsenal
       0,  // 12  Chelsea–Spurs
       0,  // 13  Newcastle–West Ham
       4,  // 14  Man City vs Palace   → Arsenal (away)
       4,  // 15  Palace vs Arsenal    → Arsenal
       4,  // 16  City vs Villa        → Arsenal
       0,  // 17  Spurs vs Everton
       0,  // 18  West Ham vs Leeds
    ];
    const engine = new AHPEngine();
    engine.setMatches(REMAINING_MATCHES);
    arsenalFirstSliders.forEach((v, i) => engine.setSliderValue(i, v));
    const result = engine.compute();
    console.log(`  Conflict → Arsenal: preferred=${result.preferred}, confidence=${result.confidencePercent}%`);
    assert.equal(result.preferred, 'arsenal-title',
      'Arsenal-facing conflict match breaks a potential tie in Arsenal\'s favour');
  });

  it('conflict match tiebreaker: sliding conflict towards West Ham tips the balance toward spurs', () => {
    const spursFirstSliders = [
      -4,  //  0  West Ham vs Everton → WHU safe 
       0,  //  1  Arsenal vs Newcastle 
      -4,  //  2  Wolves–Spurs         → Rel
      -4,  //  3  Brentford vs West Ham → WHU safe
       0,  //  4  Arsenal vs Fulham
      -4,  //  5  Villa–Spurs          → Rel
       0,  //  6  Everton vs City
       0,  //  7  City vs Brentford
      -4,  //  8  West Ham vs Arsenal ⚡ → Rel
       4,  //  9  Spurs–Leeds          → Rel
       0,  // 10  Bournemouth vs City
       0,  // 11  Arsenal vs Burnley
      -4,  // 12  Chelsea–Spurs        → Rel
       4,  // 13  Newcastle–West Ham   → Rel
       0,  // 14  Man City vs Palace
       0,  // 15  Palace vs Arsenal
       0,  // 16  City vs Villa
       4,  // 17  Spurs vs Everton     → Rel
      -4,  // 18  West Ham vs Leeds    → Rel
    ];
    const engine = new AHPEngine();
    engine.setMatches(REMAINING_MATCHES);
    spursFirstSliders.forEach((v, i) => engine.setSliderValue(i, v));
    const result = engine.compute();
    console.log(`  Conflict → West Ham: preferred=${result.preferred}, confidence=${result.confidencePercent}%`);
    assert.equal(result.preferred, 'spurs-relegated',
      'West Ham-facing conflict match breaks the tie in Spurs relegated\'s favour');
  });
});

describe('Scenario: Matches data integrity', () => {
  it('should have 19 matches (GW34–GW38 + Rescheduled)', () => {
    assert.equal(REMAINING_MATCHES.length, 19);
  });

  it('exactly one conflict match between Title and Relegated', () => {
    const conflicts = REMAINING_MATCHES.filter(
      m => m.helpsArsenalTitle !== 'neither' && m.helpsSpursRelegated !== 'neither'
    );
    assert.equal(conflicts.length, 1,
      `Expected 1 conflict match, found: ${conflicts.map(m => m.id).join(', ')}`);
    assert.equal(conflicts[0].id, 'gw36-west-ham-arsenal');
  });

  it('nine Arsenal-title matches (excl. conflict)', () => {
    const count = REMAINING_MATCHES.filter(
      m => m.helpsArsenalTitle !== 'neither' && (m.helpsSpursRelegated === 'neither' && m.helpsSpursSurvive === 'neither')
    ).length;
    assert.equal(count, 9,
      'Should have 9 pure Arsenal-title matches (conflict match counted separately)');
  });

  it('nine Spurs-relegated matches (excl. conflict)', () => {
    const count = REMAINING_MATCHES.filter(
      m => m.helpsSpursRelegated !== 'neither' && m.helpsArsenalTitle === 'neither'
    ).length;
    assert.equal(count, 9,
      'Should have 9 pure Spurs-relegated matches (conflict match counted separately)');
  });

  it('all matches have valid dates from Apr 2026 onward', () => {
    const cutoff = new Date('2026-04-25').getTime();
    for (const m of REMAINING_MATCHES) {
      const d = new Date(m.date).getTime();
      assert.ok(d >= cutoff, `${m.id}: date ${m.date} is before Apr 25 2026`);
    }
  });
});

describe('Scenario: Wrong direction (contradictory inputs)', () => {
  it('sliding toward Spurs WINNING their matches suppresses spurs-relegated score', () => {
    // Arsenal matches at full strength (positive), but SPURS matches at WRONG direction (home)
    const sliders = [
      -4,  //  0  West Ham vs Everton: want WHU safe → Rel
      -4,  //  1  Arsenal vs Newcastle: want Arsenal home → ✓ Arsenal title
      -4,  //  2  Wolves vs Spurs: want Wolves home → ✓ Spurs relegated
      -4,  //  3  Brentford vs WHam: want WHU safe → Rel
      -4,  //  4  Arsenal vs Fulham: want Arsenal home → ✓ Arsenal title
      -4,  //  5  Villa vs Spurs: want Villa home → ✓ Spurs relegated
      -4,  //  6  Everton vs City: want Everton home → ✓ Arsenal title
       4,  //  7  City vs Brentford: want Brentford away → ✓ Arsenal title
       4,  //  8  West Ham vs Arsenal: want Arsenal away → ✓ Arsenal title
      -4,  //  9  Spurs vs Leeds: want SPURS (HOME) to win → ✗ HURTS Rel
      -4,  // 10  Bournemouth vs City: want Bournemouth home → ✓ Arsenal title
      -4,  // 11  Arsenal vs Burnley: want Arsenal home → ✓ Arsenal title
      -4,  // 12  Chelsea vs Spurs: want SPURS to win (HOME!) → ✗ HURTS Rel
       4,  // 13  Newcastle vs WHam: want West Ham away → ✓ Rel
       4,  // 14  Man City vs Palace: want Palace away → ✓ Arsenal
       4,  // 15  Palace vs Arsenal: want Arsenal away → ✓ Arsenal title
       4,  // 16  City vs Villa: want Villa away → ✓ Arsenal title
      -4,  // 17  Spurs vs Everton: want SPURS (HOME) to win → ✗ HURTS Rel
       4,  // 18  West Ham vs Leeds: want Leeds (AWAY) → ✗ HURTS Rel
    ];
    const engine = new AHPEngine();
    engine.setMatches(REMAINING_MATCHES);
    sliders.forEach((v, i) => engine.setSliderValue(i, v));
    const result = engine.compute();
    console.log(`  Contradiction: preferred=${result.preferred}, confidence=${result.confidencePercent}%`);
    assert.equal(result.preferred, 'arsenal-title',
      'Arsenal consistently expressed → arsenal-title expected despite Spurs match contradictions');
    const spursAlt = result.rankedAlternatives.find(a => a.key === 'spurs-relegated');
    assert.ok(
      (spursAlt?.score ?? 1) < 0.4,
      `Spurs relegated score should be suppressed when many Spurs match sliders are wrong direction, got ${((spursAlt?.score ?? 0) * 100).toFixed(1)}%`
    );
  });
});
