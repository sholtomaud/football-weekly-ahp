import { BaseComponent } from '../../core/base-component.ts';
import { Router } from '../../core/router/router.ts';
import { ahpState } from '../../core/ahp/state.ts';
import type { AHPResult, AlternativeRank, CriterionRank } from '../../core/ahp/ahp.ts';
import styles from './results-page.css?inline';
import arsenalCrest from '../../assets/crests/arsenal-crest.svg?raw';
import spursCrest from '../../assets/crests/spurs-crest.svg?raw';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getOutcomeVisual(key: string): { crest: string; color: string } {
  if (key.includes('arsenal')) return { crest: arsenalCrest, color: '#ef0107' };
  if (key.includes('spurs') || key.includes('tottenham')) return { crest: spursCrest, color: '#132257' };
  return { 
    crest: `<svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="38" fill="#6CABDD"/></svg>`, 
    color: '#6CABDD' 
  };
}

function getCrTheme(cr: number): { color: string; label: string; description: string } {
  if (cr < 0.1) {
    return {
      color: '#00b04f',
      label: 'Consistent ✓',
      description: 'Your preferences are highly consistent — a reliable AHP result.',
    };
  }
  if (cr < 0.2) {
    return {
      color: '#f5c518',
      label: 'Acceptable ≈',
      description: 'Slight inconsistency detected. Result is still meaningful.',
    };
  }
  return {
    color: '#ef0107',
    label: 'Inconsistent ✗',
    description: 'High inconsistency — consider retaking the analysis for a clearer picture.',
  };
}

function renderAlternativeBar(alt: AlternativeRank, maxScore: number): string {
  const visual = getOutcomeVisual(alt.key);
  const fillPct = Math.round((alt.score / (maxScore || 1)) * 100);

  return `
    <div class="alt-bar ${alt.rank === 1 ? 'alt-bar--winner' : ''}">
      <div class="alt-bar-header">
        <div class="alt-crest">${visual.crest}</div>
        <div class="alt-info">
          <span class="alt-rank">#${alt.rank}</span>
          <span class="alt-name">${alt.name}</span>
        </div>
        <span class="alt-score">${(alt.score * 100).toFixed(1)}%</span>
      </div>
      <div class="alt-track">
        <div class="alt-fill" data-target-width="${fillPct}"
             style="width:0%; background:${visual.color};"></div>
      </div>
    </div>`;
}

function renderCriterionRow(c: CriterionRank, index: number): string {
  const barWidth = Math.round(c.weight * 200);
  return `
    <tr class="cr-row" style="animation-delay:${index * 60}ms">
      <td class="cr-rank">#${c.rank}</td>
      <td class="cr-label">${c.label}</td>
      <td class="cr-weight-cell">
        <div class="cr-mini-bar" role="presentation">
          <div class="cr-mini-fill" style="width:${barWidth}%"></div>
        </div>
        <span class="cr-weight-val">${(c.weight * 100).toFixed(1)}%</span>
      </td>
    </tr>`;
}

function buildResultsHtml(result: AHPResult): string {
  const winner = result.rankedAlternatives[0];
  const visual = getOutcomeVisual(winner?.key ?? '');
  const winnerColor = visual.color;
  const maxScore = result.rankedAlternatives[0]?.score ?? 1;
  const cr = getCrTheme(result.consistencyRatio);

  return `
<div class="results">
  <section class="verdict-section">
    <div class="verdict-bg" style="background: radial-gradient(ellipse at 50% 0%, ${winnerColor}33 0%, transparent 70%);"></div>
    <div class="verdict-inner">
      <div class="verdict-badges">
        <div class="verdict-badge">Your Seasonal Priority</div>
        <div class="saved-badge">✓ Saved to history</div>
      </div>
      <div class="verdict-crest">${visual.crest}</div>
      <h1 class="verdict-title">
        ${result.preferred === 'equal' ? "It's a Dead Heat" : winner?.name ?? ''}
      </h1>
      <p class="verdict-sub">
        OVP Score: <strong>${((winner?.score ?? 0) * 100).toFixed(1)}%</strong>
        &nbsp;·&nbsp; Confidence: <strong>${result.confidencePercent}%</strong>
      </p>
    </div>
  </section>

  <div class="results-body">

    <section class="section-card">
      <h2 class="section-heading">Overall Vector of Priority (OVP)</h2>
      <p class="section-desc">
        Relative importance of each outcome based on your fixture preferences.
      </p>
      <div class="alt-bars">
        ${result.rankedAlternatives.map((a) => renderAlternativeBar(a, maxScore)).join('')}
      </div>
    </section>

    <section class="section-card">
      <h2 class="section-heading">Preference Narrative</h2>
      <p class="section-desc">
        Which way are you leaning?
      </p>
      <div class="intensity-entry">
        <span class="intensity-label">Primary Focus</span>
        <p class="intensity-text">
          You are primarily focused on <strong>${result.rankedAlternatives[0].name}</strong>.
        </p>
      </div>
    </section>

    <section class="section-card">
      <h2 class="section-heading">Fixture Importance Ranking</h2>
      <p class="section-desc">
        Which remaining matches carried the most weight in shaping your overall preference.
      </p>
      <table class="cr-table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Match</th>
            <th scope="col">Weight</th>
          </tr>
        </thead>
        <tbody>
          ${result.rankedCriteria.map((c, i) => renderCriterionRow(c, i)).join('')}
        </tbody>
      </table>
    </section>

    <section class="section-card">
      <h2 class="section-heading">Consistency Analysis</h2>
      <p class="section-desc">
        The Consistency Ratio (CR) measures whether your pairwise preferences are logically
        coherent. CR &lt; 0.1 is ideal.
      </p>
      <div class="cr-card" style="border-color:${cr.color}; box-shadow: 0 0 24px ${cr.color}30;">
        <div class="cr-value" style="color:${cr.color}">${result.consistencyRatio.toFixed(3)}</div>
        <div class="cr-badge" style="background:${cr.color}20; color:${cr.color}; border-color:${cr.color}40;">
          ${cr.label}
        </div>
        <p class="cr-desc">${cr.description}</p>
      </div>
    </section>

    <div class="result-actions">
      <button id="retake-btn" class="btn btn--ghost">↺ Retake Analysis</button>
      <button id="history-btn" class="btn btn--history">📋 View All Results</button>
      <button id="about-btn" class="btn btn--outline">About AHP →</button>
    </div>

  </div>
</div>`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export class ResultsComponent extends BaseComponent {
  static tagName = 'results-page';

  constructor() {
    // Pass empty HTML — content is dynamically generated from AHP result.
    // CSS is imported from results-page.css above.
    super('', styles);
  }

  connectedCallback() {
    // Redirect to home if analysis has not been completed
    if (!ahpState.completed || !ahpState.result) {
      Router.getInstance().navigate('/');
      return;
    }

    this.shadowRoot!.innerHTML = `<style>${styles}</style>${buildResultsHtml(ahpState.result)}`;
    this.attachResultListeners();
    this.animateBars();
  }

  private attachResultListeners(): void {
    this.shadowRoot?.getElementById('retake-btn')?.addEventListener('click', () => {
      ahpState.reset();
      Router.getInstance().navigate('/analysis');
    });

    this.shadowRoot?.getElementById('history-btn')?.addEventListener('click', () => {
      Router.getInstance().navigate('/history');
    });

    this.shadowRoot?.getElementById('about-btn')?.addEventListener('click', () => {
      Router.getInstance().navigate('/about');
    });
  }

  private animateBars(): void {
    // Trigger CSS transition on OVP bars after first paint
    requestAnimationFrame(() => {
      this.shadowRoot?.querySelectorAll<HTMLElement>('.alt-fill').forEach((el) => {
        const target = el.dataset['targetWidth'] ?? '0';
        el.style.width = `${target}%`;
      });
    });
  }
}

if (!customElements.get(ResultsComponent.tagName)) {
  customElements.define(ResultsComponent.tagName, ResultsComponent);
}
