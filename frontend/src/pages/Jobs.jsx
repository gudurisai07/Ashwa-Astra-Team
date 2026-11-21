import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listJobs, myJobs, closeJob } from '../api/jobApi';
import { errorMessage } from '../api/axios';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import JobCard from '../components/JobCard';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import useAsync from '../hooks/useAsync';

export default function Jobs() {
  const { user } = useAuth();
  const isRecruiter = user.role === 'RECRUITER';
  const [filters, setFilters] = useState({ q: '', skill: '', maxExperience: '' });
  const [debounced, setDebounced] = useState(filters);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(filters), 300);
    return () => clearTimeout(t);
  }, [filters]);

  const { data: jobs, loading, error, reload } = useAsync(
    () => {
      if (isRecruiter) return myJobs();
      const params = {};
      if (debounced.q) params.q = debounced.q;
      if (debounced.skill) params.skill = debounced.skill;
      if (debounced.maxExperience !== '') params.maxExperience = debounced.maxExperience;
      return listJobs(params);
    },
    [debounced, isRecruiter]
  );

  const close = async (id) => {
    if (!window.confirm('Close this job? Candidates will no longer be able to apply.')) return;
    setActionError('');
    try {
      await closeJob(id);
      reload();
    } catch (e) {
      setActionError(errorMessage(e));
    }
  };

  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{isRecruiter ? 'Your jobs' : 'Browse jobs'}</h1>
          <p className="muted">{isRecruiter ? 'Manage the roles you have posted.' : 'Search roles and filter by skill or experience.'}</p>
        </div>
        {isRecruiter && <Link to="/jobs/new" className="btn btn-primary">Post a job</Link>}
      </div>

      {!isRecruiter && (
        <div className="filters">
          <input className="input" placeholder="Search title, company or location" value={filters.q} onChange={set('q')} />
          <input className="input" placeholder="Skill (e.g. React)" value={filters.skill} onChange={set('skill')} />
          <input className="input" type="number" min="0" placeholder="My experience (yrs)" value={filters.maxExperience} onChange={set('maxExperience')} />
        </div>
      )}

      <ErrorMessage message={error || actionError} onRetry={reload} />
      {loading ? (
        <Loader label="Loading jobs…" />
      ) : !jobs?.length ? (
        <EmptyState title="No jobs found" text={isRecruiter ? 'Post your first job to start receiving applications.' : 'Try different search terms or filters.'} />
      ) : (
        <div className="grid">
          {jobs.map((j) => (
            <JobCard key={j.id} job={j}>
              {isRecruiter ? (
                <div className="row">
                  <span className={`badge badge-${j.status.toLowerCase()}`}>{j.status.toLowerCase()}</span>
                  <span className="muted small">{j.applicationCount} applicants</span>
                  <Link className="btn btn-sm btn-ghost" to={`/jobs/${j.id}/edit`}>Edit</Link>
                  {j.status === 'ACTIVE' && <button className="btn btn-sm btn-danger" onClick={() => close(j.id)}>Close</button>}
                </div>
              ) : (
                <Link className="btn btn-sm btn-primary" to={`/jobs/${j.id}`}>View</Link>
              )}
            </JobCard>
          ))}
        </div>
      )}
    </>
  );
}
