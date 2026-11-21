import { listJobs } from '../api/jobApi';
import useAsync from '../hooks/useAsync';
import ErrorMessage from './ErrorMessage';
import Loader from './Loader';

export default function JobPicker({ value, onChange }) {
  const { data: jobs, loading, error } = useAsync(() => listJobs(), []);
  if (loading) return <Loader label="Loading jobs…" />;
  if (error) return <ErrorMessage message={error} />;
  return (
    <select className="input" value={value || ''} onChange={(e) => onChange(e.target.value)} aria-label="Select a job">
      <option value="">Select a job…</option>
      {(jobs || []).map((j) => (
        <option key={j.id} value={j.id}>
          {j.title} - {j.companyName}
        </option>
      ))}
    </select>
  );
}
