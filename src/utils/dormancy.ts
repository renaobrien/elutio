export function getMonthsSinceMoved(dateString: string): number {
  const lastMoved = new Date(dateString).getTime();
  const now = Date.now();
  const diffMs = now - lastMoved;
  const months = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
  return months;
}

export function getDormancyTier(dateString: string): 'active' | 'stale' | 'entropy' {
  const months = getMonthsSinceMoved(dateString);
  if (months < 8) return 'active';
  if (months < 12) return 'stale';
  return 'entropy';
}

export function isDormant(dateString: string): boolean {
  return getDormancyTier(dateString) === 'entropy';
}

export const DORMANCY_THRESHOLDS = {
  active: 8 * 30 * 24 * 60 * 60 * 1000,
  stale: 12 * 30 * 24 * 60 * 60 * 1000,
};
