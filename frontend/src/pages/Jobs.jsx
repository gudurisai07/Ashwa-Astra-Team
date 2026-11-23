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
  const isRecruiter = user?.role === 'RECRUITER';
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
      <div className="page-head" style={{ marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span>{isRecruiter ? '💼 Manage Job Postings' : '🔍 Discover Dream Roles'}</span>
          </h1>
          <p className="muted">
            {isRecruiter
              ? 'Track performance and manage candidate applications for your open positions.'
              : 'Browse high-impact opportunities matched to your technical skillset.'}
          </p>
        </div>
        {isRecruiter && (
          <Link
            to="/jobs/new"
            className="btn btn-primary"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
              border: 'none',
              boxShadow: '0 4px 16px rgba(168, 85, 247, 0.35)',
              padding: '0.65rem 1.4rem'
            }}
          >
            + Post New Job
          </Link>
        )}
      </div>

      {!isRecruiter && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
            padding: '1.25rem',
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '1rem'
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 500 }}>
              Search Keywords
            </label>
            <input
              className="input"
              style={{ width: '100%', background: 'rgba(2, 6, 23, 0.6)' }}
              placeholder="Title, company, or location..."
              value={filters.q}
              onChange={set('q')}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 500 }}>
              Required Skill
            </label>
            <input
              className="input"
              style={{ width: '100%', background: 'rgba(2, 6, 23, 0.6)' }}
              placeholder="e.g. React, Spring Boot, Java..."
              value={filters.skill}
              onChange={set('skill')}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 500 }}>
              Experience Level
            </label>
            <input
              className="input"
              style={{ width: '100%', background: 'rgba(2, 6, 23, 0.6)' }}
              type="number"
              min="0"
              placeholder="Max years required..."
              value={filters.maxExperience}
              onChange={set('maxExperience')}
            />
          </div>
        </div>
      )}

      <ErrorMessage message={error || actionError} onRetry={reload} />

      {loading ? (
        <Loader label="Curating opportunities…" />
      ) : !jobs?.length ? (
        <EmptyState
          title="No jobs found"
          text={isRecruiter ? 'Post your first job to start receiving applications.' : 'Try adjusting your search criteria or skill keywords.'}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {jobs.map((j) => (
            <JobCard key={j.id} job={j}>
              {isRecruiter ? (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Link
                    className="btn btn-sm"
                    to={`/jobs/${j.id}/edit`}
                    style={{ background: 'rgba(255,255,255,0.06)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    Edit
                  </Link>
                  {j.status === 'ACTIVE' && (
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => close(j.id)}
                      style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                    >
                      Close
                    </button>
                  )}
                </div>
              ) : (
                <Link
                  className="btn btn-sm btn-primary"
                  to={`/jobs/${j.id}`}
                  style={{
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8) 0%, rgba(99, 102, 241, 0.9) 100%)',
                    border: '1px solid rgba(168, 85, 247, 0.4)',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)',
                    padding: '0.45rem 1.15rem',
                    borderRadius: '0.65rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.25)';
                  }}
                >
                  View Details →
                </Link>
              )}
            </JobCard>
          ))}
        </div>
      )}
    </>
  );
}
