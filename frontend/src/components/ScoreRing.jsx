export default function ScoreRing({ value = 0, label = 'Score' }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  const r = 52;
  const c = 2 * Math.PI * r;
  const tone = v >= 75 ? 'var(--green)' : v >= 50 ? 'var(--amber)' : 'var(--red)';
  return (
    <div className="ring" role="img" aria-label={`${label}: ${v} out of 100`}>
      <svg viewBox="0 0 120 120" width="140" height="140">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(148,163,184,.18)" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={r} fill="none" stroke={tone} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${(v / 100) * c} ${c}`} transform="rotate(-90 60 60)"
        />
        <text x="60" y="64" textAnchor="middle" className="ring-text">{v}</text>
      </svg>
      <div className="ring-label">{label}</div>
    </div>
  );
}
