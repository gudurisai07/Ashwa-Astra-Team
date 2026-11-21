export default function StatusBadge({ status }) {
  const s = (status || '').toUpperCase();
  return <span className={`badge badge-${s.toLowerCase()}`}>{s.charAt(0) + s.slice(1).toLowerCase()}</span>;
}
