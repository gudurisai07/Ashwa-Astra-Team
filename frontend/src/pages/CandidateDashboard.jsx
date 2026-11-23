import { useState } from 'react';
import { Link } from 'react-router-dom';
import { candidateAnalytics, downloadResume, myApplications, myResume, updateProfile } from '../api/applicationApi';
import { errorMessage } from '../api/axios';
import { listJobs } from '../api/jobApi';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import JobCard from '../components/JobCard';
import Loader from '../components/Loader';
import ResumeUpload from '../components/ResumeUpload';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import useAsync from '../hooks/useAsync';

export default function CandidateDashboard() {
  const { user } = useAuth();
  const stats = useAsync(candidateAnalytics, []);
  const profile = useAsync(myResume, []);
  const apps = useAsync(myApplications, []);
  const jobs = useAsync(() => listJobs(), []);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState('');

  const p = profile.data;
  const s = stats.data;

  const startEdit = () => {
    setForm({ phone: p?.phone || '', headline: p?.headline || '', location: p?.location || '', experienceYears: p?.experienceYears ?? 0, skills: p?.skills || '' });
    setEditing(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const saved = await updateProfile({ ...form, experienceYears: Number(form.experienceYears) || 0 });
      profile.setData(saved);
      setEditing(false);
    } catch (err) {
      setMsg(errorMessage(err));
    }
  };

  const refreshAll = () => {
    profile.reload();
    stats.reload();
  };

  const firstName = user.fullName.split(' ')[0];
  const initials = user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <>
      {/* === HEADER === */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem',
        padding: '1.75rem 2rem',
        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.12), rgba(6, 182, 212, 0.06))',
        border: '1px solid rgba(168, 85, 247, 0.2)',
        borderRadius: '1.25rem',
        backdropFilter: 'blur(20px)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background gradient orb */}
        <div style={{
          position: 'absolute', top: '-40px', right: '-40px',
          width: '200px', height: '200px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Avatar */}
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', fontWeight: 800, color: '#fff',
            boxShadow: '0 4px 16px rgba(124, 58, 237, 0.4)',
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.1rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              Welcome back
            </div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, background: 'linear-gradient(135deg, #f8fafc, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {firstName} 👋
            </h1>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>Your AI-powered job search at a glance.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/resume-analyzer" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.65rem 1.2rem', borderRadius: '0.75rem',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
            color: '#94a3b8', fontWeight: 600, fontSize: '0.9rem',
            textDecoration: 'none', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(168,85,247,0.4)'; e.currentTarget.style.color = '#c084fc'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#94a3b8'; }}
          >
            🤖 Analyze Resume
          </Link>
          <Link to="/jobs" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.65rem 1.2rem', borderRadius: '0.75rem',
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            color: '#fff', fontWeight: 600, fontSize: '0.9rem',
            textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(124, 58, 237, 0.35)',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            💼 Browse Jobs
          </Link>
        </div>
      </div>

      {/* === STAT CARDS === */}
      <ErrorMessage message={stats.error} onRetry={stats.reload} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Applications" value={s?.totalApplications} tone="blue" />
        <StatCard label="Pending" value={s?.pending} tone="amber" />
        <StatCard label="Shortlisted" value={s?.shortlisted} tone="green" />
        <StatCard label="Resume Score" value={s?.latestResumeScore ?? '–'} tone="violet" hint={s?.latestResumeScore == null ? 'Run the analyzer' : 'out of 100'} />
        {s?.atsScore != null && <StatCard label="ATS Score" value={s.atsScore} tone="green" hint="ATS readiness" />}
      </div>

      {/* === PROFILE + RESUME === */}
      <div className="two-col" style={{ marginBottom: '2rem' }}>
        {/* Profile Card */}
        <section style={{
          background: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '1.25rem',
          padding: '1.5rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#f8fafc', fontWeight: 700 }}>👤 My Profile</h3>
            {!editing && (
              <button onClick={startEdit} style={{
                background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)',
                color: '#c084fc', padding: '0.3rem 0.8rem', borderRadius: '0.5rem',
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
              }}>✏️ Edit</button>
            )}
          </div>

          {profile.loading ? <Loader /> : profile.error ? <ErrorMessage message={profile.error} onRetry={profile.reload} /> : editing ? (
            <form className="form-grid" onSubmit={save}>
              <ErrorMessage message={msg} />
              <label>Headline<input className="input" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} /></label>
              <label>Location<input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></label>
              <label>Phone<input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
              <label>Experience (yrs)<input className="input" type="number" min="0" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} /></label>
              <label className="span-2">Skills (comma separated)<input className="input" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} /></label>
              <div className="span-2 row">
                <button className="btn btn-primary">Save</button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
                background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', fontWeight: 800, color: '#fff',
              }}>
                {p?.fullName?.[0] || '?'}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1rem' }}>{p?.fullName}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.2rem 0' }}>
                  {p?.headline || 'Add a headline'} · {p?.location || 'Add location'}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                  {p?.email}{p?.phone ? ` · ${p.phone}` : ''}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                  {p?.experienceYears ?? 0} yrs exp · {p?.skills ? (
                    <span style={{ color: '#38bdf8' }}>{p.skills.split(',').slice(0, 3).join(', ')}{p.skills.split(',').length > 3 ? '…' : ''}</span>
                  ) : 'No skills set'}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Resume Card */}
        <section style={{
          background: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '1.25rem',
          padding: '1.5rem',
        }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.05rem', color: '#f8fafc', fontWeight: 700 }}>📄 Resume</h3>

          {p?.hasResume ? (
            <div style={{
              background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)',
              borderRadius: '0.75rem', padding: '0.85rem 1rem', marginBottom: '1rem',
            }}>
              <div style={{ color: '#4ade80', fontWeight: 600, fontSize: '0.9rem' }}>✓ Resume uploaded</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                {p.resumeFileName} · {Math.round((p.resumeSizeBytes || 0) / 1024)} KB · {p.resumeTextLength} chars
              </div>
            </div>
          ) : (
            <div style={{
              background: 'rgba(251, 191, 36, 0.06)', border: '1px solid rgba(251, 191, 36, 0.2)',
              borderRadius: '0.75rem', padding: '0.85rem 1rem', marginBottom: '1rem',
              color: '#fbbf24', fontSize: '0.88rem',
            }}>
              ⚠️ No resume yet. Upload a PDF to unlock AI analysis.
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <ResumeUpload onUploaded={refreshAll} />
            {p?.hasResume && (
              <button onClick={() => downloadResume(p.candidateId, p.resumeFileName).catch((e) => setMsg(errorMessage(e)))}
                className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>⬇️ Download</button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            <Link className="btn btn-sm btn-ghost" to="/resume-analyzer" style={{ fontSize: '0.82rem' }}>⚡ Analyze</Link>
            <Link className="btn btn-sm btn-ghost" to="/improvement" style={{ fontSize: '0.82rem' }}>✨ Improve</Link>
          </div>
        </section>
      </div>

      {/* === APPLICATIONS + AI MATCHES === */}
      <div className="two-col" style={{ marginBottom: '2rem' }}>
        <section style={{
          background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1.25rem', padding: '1.5rem',
        }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.05rem', color: '#f8fafc', fontWeight: 700 }}>📋 Applied Jobs</h3>
          {apps.loading ? <Loader /> : apps.error ? <ErrorMessage message={apps.error} /> : !apps.data?.length ? (
            <EmptyState title="No applications yet" text="Find a role and apply with your resume." />
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {apps.data.slice(0, 6).map((a) => (
                <li key={a.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.65rem',
                }}>
                  <div>
                    <Link to={`/jobs/${a.jobId}`} style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>{a.jobTitle}</Link>
                    <div style={{ color: '#64748b', fontSize: '0.78rem' }}>{a.companyName}</div>
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section style={{
          background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1.25rem', padding: '1.5rem',
        }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.05rem', color: '#f8fafc', fontWeight: 700 }}>🤖 AI Job Matches</h3>
          {!s?.recentMatches?.length ? <EmptyState title="No matches yet" text="Open Job Matching to compare your resume with a role." /> : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {s.recentMatches.map((m, i) => (
                <li key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.65rem',
                }}>
                  <Link to={`/job-matching?jobId=${m.jobId}`} style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>{m.jobTitle}</Link>
                  <span style={{
                    padding: '0.2rem 0.65rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.82rem',
                    background: m.matchPercentage >= 80 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(251, 191, 36, 0.12)',
                    color: m.matchPercentage >= 80 ? '#4ade80' : '#fbbf24',
                    border: `1px solid ${m.matchPercentage >= 80 ? 'rgba(34,197,94,0.3)' : 'rgba(251,191,36,0.25)'}`,
                  }}>{m.matchPercentage}%</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* === AVAILABLE JOBS === */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#f8fafc', fontWeight: 700 }}>🔍 Available Jobs</h2>
        <Link to="/jobs" style={{
          color: '#38bdf8', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: '0.3rem',
        }}>View all →</Link>
      </div>

      {jobs.loading ? <Loader /> : jobs.error ? <ErrorMessage message={jobs.error} /> : !jobs.data?.length ? <EmptyState title="No open jobs" /> : (
        <div className="grid">
          {jobs.data.slice(0, 4).map((j) => (
            <JobCard key={j.id} job={j}><Link className="btn btn-sm btn-primary" to={`/jobs/${j.id}`}>View</Link></JobCard>
          ))}
        </div>
      )}
    </>
  );
}
