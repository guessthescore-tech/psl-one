/* ─── Share utilities ─────────────────────────────────────────────────────── */

function getOrigin(): string {
  if (typeof window === 'undefined') return '';
  return window.location.origin;
}

export function fixtureShareUrl(fixtureId: string): string {
  return `${getOrigin()}/matches/${fixtureId}`;
}

export function predictionShareUrl(fixtureId: string): string {
  return `${getOrigin()}/predictions/fixtures/${fixtureId}`;
}

export function challengeShareUrl(challengeId: string): string {
  return `${getOrigin()}/social-challenges/${challengeId}`;
}

export function whatsappShareUrl(text: string, url: string): string {
  const combined = encodeURIComponent(`${text}\n${url}`);
  return `https://wa.me/?text=${combined}`;
}

export function twitterShareUrl(text: string, url: string): string {
  return `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

export function predictionShareText(
  homeTeam: string,
  awayTeam: string,
  homeScore: number,
  awayScore: number,
): string {
  return `I predicted ${homeTeam} ${homeScore}–${awayScore} ${awayTeam} on PSL One. Points only · no real money.`;
}

export function fixtureShareText(homeTeam: string, awayTeam: string, kickoffAt: string): string {
  const date = new Date(kickoffAt).toLocaleDateString('en-ZA', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
  return `${homeTeam} vs ${awayTeam} — ${date}. Predict the score on PSL One!`;
}

export function challengeInviteText(homeTeam: string, awayTeam: string): string {
  return `I'm challenging you to predict ${homeTeam} vs ${awayTeam} on PSL One. Points only — no real money.`;
}

export function canNativeShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

export async function nativeShare(title: string, text: string, url: string): Promise<boolean> {
  if (!canNativeShare()) return false;
  try {
    await navigator.share({ title, text, url });
    return true;
  } catch {
    return false;
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Legacy fallback
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      return true;
    } catch {
      return false;
    }
  }
}
