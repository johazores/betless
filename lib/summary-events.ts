const SUMMARY_REFRESH_EVENT = 'betless:summary-refresh';

/** Ask the nav balances (locked balance + points) to refetch after a mutation. */
export function refreshSummary() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(SUMMARY_REFRESH_EVENT));
}

export function onSummaryRefresh(callback: () => void) {
  window.addEventListener(SUMMARY_REFRESH_EVENT, callback);
  return () => window.removeEventListener(SUMMARY_REFRESH_EVENT, callback);
}
