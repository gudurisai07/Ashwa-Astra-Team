export default function StatCard({ label, value, tone = 'blue', hint }) {
  return (
    <div className={`stat stat-${tone}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value ?? '–'}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  );
}
