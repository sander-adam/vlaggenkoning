export function formatInwoners(n: number): string {
  if (n >= 1_000_000_000) {
    const v = n / 1_000_000_000;
    return `${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)} miljard`;
  }
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `${v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(1)} miljoen`;
  }
  if (n >= 1_000) {
    return `${Math.round(n / 1_000).toLocaleString("nl-NL")} duizend`;
  }
  return n.toLocaleString("nl-NL");
}
