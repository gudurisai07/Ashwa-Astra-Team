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
  const [activeCategory, setActiveCategory] = useState('ALL');

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

  const handleQuickFilter = (cat, queryParam, value) => {
    setActiveCategory(cat);
    if (cat === 'ALL') {
      setFilters({ q: '', skill: '', maxExperience: '' });
    } else {
      setFilters({ ...filters, [queryParam]: value });
    }
  };

  return (
    <>
      {/* HEADER SECTION */}
      <div className="page-head" style={{ marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.85rem' }}>
            <span>{isRecruiter ? '💼 Recruiter Job Management' : '🔍 Naukri-Style Job Discovery'}</span>
          </h1>
          <p className="muted" style={{ fontSize: '0.95rem' }}>
            {isRecruiter
              ? 'Track performance and manage candidate applications for your open positions.'
              : 'Browse high-impact technical opportunities with instant AI match compatibility and verified recruiter badges.'}
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

      {/* NAUKRI-INSPIRED QUICK CATEGORY PILLS */}
      {!isRecruiter && (
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Quick Trends:</span>
          <button
            onClick={() => handleQuickFilter('ALL')}
            style={{
              background: activeCategory === 'ALL' ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.04)',
              border: activeCategory === 'ALL' ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
              color: activeCategory === 'ALL' ? '#38bdf8' : '#cbd5e1',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            All Roles
          </button>
          <button
            onClick={() => handleQuickFilter('REMOTE', 'q', 'Remote')}
            style={{
              background: activeCategory === 'REMOTE' ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.04)',
              border: activeCategory === 'REMOTE' ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
              color: activeCategory === 'REMOTE' ? '#38bdf8' : '#cbd5e1',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            🌐 Remote Work
          </button>
          <button
            onClick={() => handleQuickFilter('JAVA', 'skill', 'Java')}
            style={{
              background: activeCategory === 'JAVA' ? 'rgba(168, 85, 247, 0.18)' : 'rgba(255, 255, 255, 0.04)',
              border: activeCategory === 'JAVA' ? '1px solid rgba(168, 85, 247, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
              color: activeCategory === 'JAVA' ? '#c084fc' : '#cbd5e1',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ☕ Java & Spring Boot
          </button>
          <button
            onClick={() => handleQuickFilter('REACT', 'skill', 'React')}
            style={{
              background: activeCategory === 'REACT' ? 'rgba(168, 85, 247, 0.18)' : 'rgba(255, 255, 255, 0.04)',
              border: activeCategory === 'REACT' ? '1px solid rgba(168, 85, 247, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
              color: activeCategory === 'REACT' ? '#c084fc' : '#cbd5e1',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ⚛️ React Frontend
          </button>
          <button
            onClick={() => handleQuickFilter('FRESHER', 'maxExperience', '1')}
            style={{
              background: activeCategory === 'FRESHER' ? 'rgba(34, 197, 94, 0.18)' : 'rgba(255, 255, 255, 0.04)',
              border: activeCategory === 'FRESHER' ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
              color: activeCategory === 'FRESHER' ? '#4ade80' : '#cbd5e1',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            🎓 Freshers / 0-1 yrs
          </button>
        </div>
      )}

      {/* SEARCH & FILTER BAR */}
      {!isRecruiter && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr)) auto',
            gap: '1rem',
            marginBottom: '2rem',
            padding: '1.25rem',
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '1.25rem',
            alignItems: 'end'
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 500 }}>
              Designation, Company or City
            </label>
            <input
              className="input"
              style={{ width: '100%', background: 'rgba(2, 6, 23, 0.6)' }}
              placeholder="e.g. Full Stack Developer, TCS, Hyderabad..."
              value={filters.q}
              onChange={set('q')}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 500 }}>
              Primary Skillset
            </label>
            <input
              className="input"
              style={{ width: '100%', background: 'rgba(2, 6, 23, 0.6)' }}
              placeholder="e.g. Java, React, SQL..."
              value={filters.skill}
              onChange={set('skill')}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 500 }}>
              Max Experience (Years)
            </label>
            <input
              className="input"
              style={{ width: '100%', background: 'rgba(2, 6, 23, 0.6)' }}
              type="number"
              min="0"
              placeholder="e.g. 2, 5..."
              value={filters.maxExperience}
              onChange={set('maxExperience')}
            />
          </div>
          <div>
            <button
              onClick={() => { setFilters({ q: '', skill: '', maxExperience: '' }); setActiveCategory('ALL'); }}
              className="btn btn-ghost"
              style={{ padding: '0.65rem 1rem', fontSize: '0.85rem' }}
            >
              Reset
            </button>
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
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Link
                    to={`/match/${j.id}`}
                    className="btn btn-sm"
                    style={{
                      background: 'rgba(56, 189, 248, 0.12)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      color: '#38bdf8',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      padding: '0.45rem 0.85rem'
                    }}
                  >
                    ⚡ AI Match
                  </Link>
                  <Link
                    className="btn btn-sm btn-primary"
                    to={`/jobs/${j.id}`}
                    style={{
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.9) 0%, rgba(99, 102, 241, 0.9) 100%)',
                      border: '1px solid rgba(168, 85, 247, 0.4)',
                      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)',
                      padding: '0.45rem 1.15rem',
                      borderRadius: '0.65rem',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                  >
                    Apply Now →
                  </Link>
                </div>
              )}
            </JobCard>
          ))}
        </div>
      )}
    </>
  );
}
