import { BaseComponent } from '../../core/base-component.ts';
import { Router } from '../../core/router/router.ts';
import { ahpState } from '../../core/ahp/state.ts';
import { getSliderLabel } from '../../core/ahp/ahp.ts';
import styles from './analysis-page.css?inline';
import arsenalCrest from '../../assets/crests/arsenal-crest.svg?raw';
import spursCrest from '../../assets/crests/spurs-crest.svg?raw';

// ---------------------------------------------------------------------------
// Team badge renderer — SVG crests for Arsenal/Spurs; coloured initials otherwise
// ---------------------------------------------------------------------------

function teamBadge(name: string, color: string): string {
  if (name === 'Arsenal') return arsenalCrest;
  if (name === 'Tottenham Hotspur') return spursCrest;
  if (name === 'West Ham United') return `<svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="38" fill="#7A263A" stroke="#1BB1E7" stroke-width="2"/><text x="50%" y="55%" text-anchor="middle" fill="white" font-weight="900" font-size="20">WHU</text></svg>`;
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
  return `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="40" cy="40" r="38" fill="${color}" stroke="rgba(255,255,255,0.25)" stroke-width="1.5"/>
    <text x="40" y="47" text-anchor="middle" fill="#fff" font-size="22" font-weight="800"
          font-family="Inter, system-ui, sans-serif">${initials}</text>
  </svg>`;
}

// ---------------------------------------------------------------------------
// Outcome label — which team needs to win for each season goal
// ---------------------------------------------------------------------------

function beneficiaryTeam(
  match: { homeTeam: string; awayTeam: string },
  beneficiary: 'home' | 'away' | 'neither'
): string {
  if (beneficiary === 'home') return match.homeTeam;
  if (beneficiary === 'away') return match.awayTeam;
  return 'Neither team';
}

// ---------------------------------------------------------------------------
// Dynamic step HTML builder
// ---------------------------------------------------------------------------

function buildStepHtml(step: number, total: number): string {
  const match = ahpState.matches[step];
  const currentVal = ahpState.engine.getSliderValue(step);
  const progressPct = Math.round((step / total) * 100);
  const isFirst = step === 0;
  const isLast  = step === total - 1;

  const label = getSliderLabel(currentVal, match.homeTeam, match.awayTeam);

  const matchDate = new Date(match.date).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  // Determine which outcome strip is "activated" by current slider position
  const prefersHome = currentVal < -0.1;
  const prefersAway = currentVal > 0.1;

  const activeArsenalTitle   = (match.helpsArsenalTitle === 'home' && prefersHome) || (match.helpsArsenalTitle === 'away' && prefersAway);
  const activeCityTitle      = (match.helpsCityTitle === 'home' && prefersHome) || (match.helpsCityTitle === 'away' && prefersAway);
  const activeWestHamStayUp  = (match.helpsSpursRelegated === 'home' && prefersHome) || (match.helpsSpursRelegated === 'away' && prefersAway);
  const activeSpursSurvive   = (match.helpsSpursSurvive === 'home' && prefersHome) || (match.helpsSpursSurvive === 'away' && prefersAway);

  // What the current preference "helps"
  const helpsList = [];
  if (activeArsenalTitle)   helpsList.push('Arsenal Title');
  if (activeCityTitle)      helpsList.push('City Title');
  if (activeWestHamStayUp)  helpsList.push('West Ham Stay Up');
  if (activeSpursSurvive)   helpsList.push('Tottenham Survive');

  let helpsLabel = '';
  if (helpsList.length > 0) {
    helpsLabel = `→ Helps: ${helpsList.join(' & ')}`;
  } else if (Math.abs(currentVal) > 0.1) {
    helpsLabel = '→ No direct impact on seasonal outcomes';
  }

  return `
<div class="analysis">
  <!-- Progress bar -->
  <div class="progress-bar-wrap">
    <div class="progress-bar-inner">
      <div class="progress-meta">
        <span>Match ${step + 1} of ${total}</span>
        <span>${progressPct}%</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width:${progressPct}%"></div>
      </div>
    </div>
  </div>

  <!-- Card -->
  <div class="card-wrap">
    <div class="match-card">

      <!-- Match header -->
      <div class="match-header">
        <div class="match-meta">
          <span class="gw-badge">GW${match.gameweek}</span>
          <span class="match-date">${matchDate}</span>
        </div>
        <h1 class="match-title">${match.label}</h1>
        <p class="match-question">Who do you want to win this match?</p>
      </div>

      <!-- Season outcome context strips (Dynamic grid) -->
      <div class="outcome-strips-v4">
        <div class="outcome-strip-v4 ${activeArsenalTitle ? 'active' : ''}">
          <span class="strip-v4-label">Arsenal Title</span>
          <span class="strip-v4-val">${match.helpsArsenalTitle === 'neither' ? '—' : (match.helpsArsenalTitle === 'home' ? match.homeTeam : match.awayTeam)}</span>
        </div>
        <div class="outcome-strip-v4 ${activeCityTitle ? 'active' : ''}">
          <span class="strip-v4-label">City Title</span>
          <span class="strip-v4-val">${match.helpsCityTitle === 'neither' ? '—' : (match.helpsCityTitle === 'home' ? match.homeTeam : match.awayTeam)}</span>
        </div>
        <div class="outcome-strip-v4 ${activeWestHamStayUp ? 'active' : ''}">
          <span class="strip-v4-label">West Ham Stay Up</span>
          <span class="strip-v4-val">${match.helpsSpursRelegated === 'neither' ? '—' : (match.helpsSpursRelegated === 'home' ? match.homeTeam : match.awayTeam)}</span>
        </div>
        <div class="outcome-strip-v4 ${activeSpursSurvive ? 'active' : ''}">
          <span class="strip-v4-label">Spurs Survive</span>
          <span class="strip-v4-val">${match.helpsSpursSurvive === 'neither' ? '—' : (match.helpsSpursSurvive === 'home' ? match.homeTeam : match.awayTeam)}</span>
        </div>
      </div>

      <!-- Matchup + Slider -->
      <div class="matchup-section">
        <!-- Home team -->
        <div class="team-col team-col--home ${prefersHome ? 'preferred' : ''}">
          <div class="team-badge-wrap">${teamBadge(match.homeTeam, match.homeColor)}</div>
          <span class="team-name">${match.homeTeam}</span>
          <span class="team-role">Home</span>
        </div>

        <!-- Slider zone -->
        <div class="slider-zone">
          <div class="slider-axis-labels">
            <span class="axis-team">${match.homeTeam.split(' ')[0]} win</span>
            <span class="axis-center">Equal</span>
            <span class="axis-team">${match.awayTeam.split(' ').pop()} win</span>
          </div>
          <input
            type="range"
            id="pref-slider"
            class="pref-slider"
            min="-4" max="4" step="0.1"
            value="${currentVal}"
            aria-label="Who do you want to win? Slide left for ${match.homeTeam}, right for ${match.awayTeam}"
          />
          <div id="pref-label" class="pref-label" aria-live="polite">${label}</div>
          <div id="helps-label" class="helps-label ${helpsList.length > 0 ? 'helps-active' : 'helps-neutral'}">
            ${helpsLabel || 'Move the slider to see season impact'}
          </div>
        </div>

        <!-- Away team -->
        <div class="team-col team-col--away ${prefersAway ? 'preferred' : ''}">
          <div class="team-badge-wrap">${teamBadge(match.awayTeam, match.awayColor)}</div>
          <span class="team-name">${match.awayTeam}</span>
          <span class="team-role">Away</span>
        </div>
      </div>

      <!-- Navigation -->
      <div class="nav-actions">
        <button id="btn-back" class="btn btn--ghost" ${isFirst ? 'disabled aria-disabled="true"' : ''}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back
        </button>
        <button id="btn-next" class="btn btn--primary">
          ${isLast ? 'See My Results' : 'Next Match'}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>

    </div>
  </div>
</div>`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export class AnalysisComponent extends BaseComponent {
  static tagName = 'analysis-page';

  constructor() {
    super('', styles);
  }

  connectedCallback() {
    // super() already called attachShadow — do NOT call again
    this.renderStep();
  }

  private renderStep(): void {
    const step  = ahpState.currentStep;
    const total = ahpState.matches.length;
    const match = ahpState.matches[step];

    this.shadowRoot!.innerHTML = `<style>${styles}</style>${buildStepHtml(step, total)}`;
    
    // Set dynamic slider track colours
    const slider = this.shadowRoot!.getElementById('pref-slider') as HTMLElement;
    if (slider) {
      slider.style.setProperty('--home-color', match.homeColor);
      slider.style.setProperty('--home-color-faded', match.homeColor + 'aa');
      slider.style.setProperty('--away-color', match.awayColor);
      slider.style.setProperty('--away-color-faded', match.awayColor + 'aa');
    }

    this.attachListeners();
  }

  private attachListeners(): void {
    const root   = this.shadowRoot!;
    const slider = root.getElementById('pref-slider') as HTMLInputElement;
    const label  = root.getElementById('pref-label') as HTMLElement;
    const helps  = root.getElementById('helps-label') as HTMLElement;

    slider?.addEventListener('input', () => {
      const val   = parseFloat(slider.value);
      const step  = ahpState.currentStep;
      const match = ahpState.matches[step];
      ahpState.engine.setSliderValue(step, val);
      label.textContent = getSliderLabel(val, match.homeTeam, match.awayTeam);
      this.updateHighlights(val);
      this.updateHelpsLabel(val, helps);
    });

    root.getElementById('btn-back')?.addEventListener('click', () => {
      if (ahpState.currentStep > 0) {
        ahpState.currentStep--;
        this.animateTransition('back');
      }
    });

    root.getElementById('btn-next')?.addEventListener('click', () => {
      if (ahpState.currentStep === ahpState.matches.length - 1) {
        ahpState.finalise();
        Router.getInstance().navigate('/results');
      } else {
        ahpState.currentStep++;
        this.animateTransition('next');
      }
    });
  }

  private animateTransition(direction: 'next' | 'back'): void {
    const card = this.shadowRoot?.querySelector<HTMLElement>('.analysis');
    if (card) {
      card.style.transition = 'opacity 0.18s, transform 0.18s';
      card.style.opacity    = '0';
      card.style.transform  = direction === 'next' ? 'translateX(-24px)' : 'translateX(24px)';
    }
    setTimeout(() => this.renderStep(), 180);
  }

  private updateHighlights(val: number): void {
    const root = this.shadowRoot!;
    const step  = ahpState.currentStep;
    const match = ahpState.matches[step];

    const prefersHome = val < -0.1;
    const prefersAway = val > 0.1;

    root.querySelector('.team-col--home')?.classList.toggle('preferred', prefersHome);
    root.querySelector('.team-col--away')?.classList.toggle('preferred', prefersAway);

    const westHamActive = (match.helpsSpursRelegated === 'home' && prefersHome)
                     || (match.helpsSpursRelegated === 'away' && prefersAway);
    const arsenalActive = (match.helpsArsenalTitle === 'home' && prefersHome)
                       || (match.helpsArsenalTitle === 'away' && prefersAway);

    root.querySelector('.outcome-strip--spurs')?.classList.toggle('active', westHamActive);
    root.querySelector('.outcome-strip--arsenal')?.classList.toggle('active', arsenalActive);
  }

  private updateHelpsLabel(val: number, helps: HTMLElement | null): void {
    if (!helps) return;
    const step  = ahpState.currentStep;
    const match = ahpState.matches[step];

    const prefersHome = val < -0.1;
    const prefersAway = val > 0.1;
    
    const activeArsenalTitle  = (match.helpsArsenalTitle === 'home' && prefersHome) || (match.helpsArsenalTitle === 'away' && prefersAway);
    const activeCityTitle     = (match.helpsCityTitle === 'home' && prefersHome) || (match.helpsCityTitle === 'away' && prefersAway);
    const activeWestHamStayUp = (match.helpsSpursRelegated === 'home' && prefersHome) || (match.helpsSpursRelegated === 'away' && prefersAway);
    const activeSpursSurvive  = (match.helpsSpursSurvive === 'home' && prefersHome) || (match.helpsSpursSurvive === 'away' && prefersAway);

    const helpsList = [];
    if (activeArsenalTitle)   helpsList.push('Arsenal Title');
    if (activeCityTitle)      helpsList.push('City Title');
    if (activeWestHamStayUp)  helpsList.push('West Ham Stay Up');
    if (activeSpursSurvive)   helpsList.push('Tottenham Survive');

    helps.className = 'helps-label';

    if (!prefersHome && !prefersAway) {
      helps.textContent = 'Move the slider to express a preference';
      helps.classList.add('helps-neutral');
    } else if (helpsList.length > 0) {
      helps.textContent = `→ Helps: ${helpsList.join(' & ')}`;
      helps.classList.add('helps-active');
    } else {
      helps.textContent = '→ No direct impact on seasonal outcomes';
      helps.classList.add('helps-neutral');
    }

    // Also update the strip highlights
    const root = this.shadowRoot!;
    const strips = root.querySelectorAll('.outcome-strip-v4');
    strips[0]?.classList.toggle('active', activeArsenalTitle);
    strips[1]?.classList.toggle('active', activeCityTitle);
    strips[2]?.classList.toggle('active', activeWestHamStayUp);
    strips[3]?.classList.toggle('active', activeSpursSurvive);
  }
}

if (!customElements.get(AnalysisComponent.tagName)) {
  customElements.define(AnalysisComponent.tagName, AnalysisComponent);
}
