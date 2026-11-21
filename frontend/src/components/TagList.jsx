export default function TagList({ items, tone = 'neutral' }) {
  const list = Array.isArray(items) ? items : String(items || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!list.length) return <span className="muted">None found</span>;
  return (
    <div className="tags">
      {list.map((t, i) => (
        <span key={`${t}-${i}`} className={`tag tag-${tone}`}>
          {t}
        </span>
      ))}
    </div>
  );
}
