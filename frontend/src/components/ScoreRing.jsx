export default function ScoreRing({ value = 0, label = 'Score' }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  const r = 52;
  const c = 2 * Math.PI * r;
  const tone = v >= 75 ? 'var(--lime)' : v >= 50 ? 'var(--amber)' : 'var(--red)';
  const glow = v >= 75 ? 'rgba(163,230,53,.4)' : v >= 50 ? 'rgba(245,158,11,.4)' : 'rgba(239,68,68,.4)';
  return (
    <div className="ring" role="img" aria-label={`${label}: ${v} out of 100`}>
      <svg viewBox="0 0 120 120" width="150" height="150">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(148,163,184,.12)" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={r} fill="none" stroke={tone} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${(v / 100) * c} ${c}`} transform="rotate(-90 60 60)"
          filter="url(#glow)" style={{transition:'stroke-dasharray .6s ease'}}
        />
        <text x="60" y="58" textAnchor="middle" className="ring-text" style={{fontSize:28,fontWeight:800,fill:'var(--text)'}}>{v}</text>
        <text x="60" y="76" textAnchor="middle" style={{fontSize:10,fill:'var(--muted)',fontFamily:'inherit'}}>/100</text>
      </svg>
      <div className="ring-label" style={{color: tone}}>{label}</div>
    </div>
  );
}
