import { BaseComponent } from '../../core/base-component.ts';
import { Router } from '../../core/router/router.ts';
import { ahpState } from '../../core/ahp/state.ts';
import {
  loadSessions,
  clearSessions,
  deleteSession,
  formatRelativeTime,
} from '../../core/ahp/history.ts';
import type { SessionRecord } from '../../core/ahp/history.ts';
import rawTemplate from './history-page.html?raw';
import styles from './history-page.css?inline';
import arsenalCrest from '../../assets/crests/arsenal-crest.svg?raw';
import spursCrest from '../../assets/crests/spurs-crest.svg?raw';

function getCrColor(cr: number): string {
  if (cr < 0.1) return '#00b04f';
  if (cr < 0.2) return '#f5c518';
  return '#ef0107';
}

function getCrLabel(cr: number): string {
  if (cr < 0.1) return 'Consistent';
  if (cr < 0.2) return 'Acceptable';
  return 'Inconsistent';
}

function getOutcomeVisual(key: string): { crest: string; color: string; class: string } {
  if (key.includes('arsenal')) return { crest: arsenalCrest, color: '#ef0107', class: 'session-card--arsenal' };
  if (key.includes('city'))    return { crest: `<svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="38" fill="#6CABDD"/></svg>`, color: '#6CABDD', class: 'session-card--city' };
  if (key.includes('spurs') || key.includes('tottenham')) return { crest: spursCrest, color: '#132257', class: 'session-card--spurs' };
  return { crest: '', color: '#333', class: 'session-card--equal' };
}

function renderSessionCard(record: SessionRecord, index: number): string {
  const { result, timestamp, matchCount, id } = record;
  const winner = result.rankedAlternatives[0];
  const visual = getOutcomeVisual(winner?.key ?? '');
  const crest = visual.crest;
  const cardClass = visual.class;

  const relTime = formatRelativeTime(timestamp);
  const absDate = new Date(timestamp).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const crColor = getCrColor(result.consistencyRatio);
  const crLabel = getCrLabel(result.consistencyRatio);

  const ovpBars = result.rankedAlternatives.map((alt) => {
    const visual = getOutcomeVisual(alt.key);
    const pct = Math.round(alt.score * 100);
    return `
      <div class="ovp-row">
        <span class="ovp-team">${alt.name.split(' ')[0]}</span>
        <div class="ovp-track">
          <div class="ovp-fill" style="width:${pct}%; background:${visual.color};"></div>
        </div>
        <span class="ovp-pct">${pct}%</span>
      </div>`;
  }).join('');

  return `
    <div class="session-card ${cardClass}" role="listitem"
         style="animation-delay:${index * 60}ms" data-session-id="${id}">
      <div class="card-top">
        <div class="card-winner">
          <div class="winner-crest">${crest}</div>
          <div class="winner-info">
            <span class="winner-label">🏆 Most Preferred</span>
            <span class="winner-name">${result.preferred === 'equal' ? "Dead Heat" : winner?.name ?? '—'}</span>
          </div>
        </div>
        <div class="card-meta">
          <span class="meta-time">${relTime}</span>
          <span class="meta-date">${absDate}</span>
          <button class="card-delete" data-delete-id="${id}" title="Delete this session"
                  aria-label="Delete session from ${relTime}">✕</button>
        </div>
      </div>

      <div class="ovp-bars">${ovpBars}</div>

      <div class="card-footer">
        <div class="footer-cr" title="Consistency Ratio: ${result.consistencyRatio.toFixed(3)}">
          <span class="cr-indicator" style="background:${crColor};"></span>
          <span>${crLabel} (CR ${result.consistencyRatio.toFixed(2)})</span>
        </div>
        <span class="footer-matches">${matchCount} matches rated</span>
      </div>
    </div>`;
}

export class HistoryComponent extends BaseComponent {
  static tagName = 'history-page';

  constructor() {
    super(rawTemplate, styles);
  }

  init() {
    this.renderSessions();

    // "Start New Analysis" top button
    this.shadowRoot?.getElementById('new-analysis-btn')?.addEventListener('click', () => {
      ahpState.reset();
      Router.getInstance().navigate('/analysis');
    });

    // Empty state start button
    this.shadowRoot?.getElementById('empty-start-btn')?.addEventListener('click', () => {
      ahpState.reset();
      Router.getInstance().navigate('/analysis');
    });

    // Clear all
    this.shadowRoot?.getElementById('clear-history-btn')?.addEventListener('click', () => {
      if (window.confirm('Clear all analysis history? This cannot be undone.')) {
        clearSessions();
        this.renderSessions();
      }
    });
  }

  private renderSessions(): void {
    const list     = this.shadowRoot?.getElementById('sessions-list');
    const empty    = this.shadowRoot?.getElementById('empty-state');
    if (!list || !empty) return;

    const sessions = loadSessions();

    if (sessions.length === 0) {
      list.innerHTML  = '';
      empty.removeAttribute('hidden');
    } else {
      empty.setAttribute('hidden', '');
      list.innerHTML  = sessions.map((s, i) => renderSessionCard(s, i)).join('');
      this.attachDeleteListeners();
      this.attachCardListeners();
    }
  }

  private attachCardListeners(): void {
    this.shadowRoot?.querySelectorAll<HTMLElement>('.session-card').forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.dataset['sessionId'];
        if (id) {
          this.viewSession(id);
        }
      });
    });
  }

  private viewSession(id: string): void {
    const sessions = loadSessions();
    const session = sessions.find((s) => s.id === id);
    if (session) {
      ahpState.loadFromSession(session);
      Router.getInstance().navigate('/results');
    }
  }

  private attachDeleteListeners(): void {
    this.shadowRoot?.querySelectorAll<HTMLButtonElement>('[data-delete-id]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset['deleteId'];
        if (id) {
          deleteSession(id);
          this.renderSessions();
        }
      });
    });
  }
}

if (!customElements.get(HistoryComponent.tagName)) {
  customElements.define(HistoryComponent.tagName, HistoryComponent);
}
