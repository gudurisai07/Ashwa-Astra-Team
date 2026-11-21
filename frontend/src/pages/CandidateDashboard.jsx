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

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Hello, {user.fullName.split(' ')[0]}</h1>
          <p className="muted">Your job search at a glance.</p>
        </div>
        <Link to="/jobs" className="btn btn-primary">Browse jobs</Link>
      </div>

      <ErrorMessage message={stats.error} onRetry={stats.reload} />
      <div className="stats">
        <StatCard label="Applications" value={s?.totalApplications} />
        <StatCard label="Pending" value={s?.pending} tone="amber" />
        <StatCard label="Shortlisted" value={s?.shortlisted} tone="green" />
        <StatCard label="Resume score" value={s?.latestResumeScore ?? '–'} tone="violet" hint={s?.latestResumeScore == null ? 'Run the analyzer' : 'out of 100'} />
      </div>

      <div className="two-col">
        <section className="card">
          <div className="between"><h3>My profile</h3>{!editing && <button className="btn btn-sm btn-ghost" onClick={startEdit}>Edit</button>}</div>
          {profile.loading ? <Loader /> : profile.error ? <ErrorMessage message={profile.error} onRetry={profile.reload} /> : editing ? (
            <form className="form-grid" onSubmit={save}>
              <ErrorMessage message={msg} />
              <label>Headline<input className="input" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} /></label>
              <label>Location<input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></label>
              <label>Phone<input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
              <label>Experience (yrs)<input className="input" type="number" min="0" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} /></label>
              <label className="span-2">Skills (comma separated)<input className="input" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} /></label>
              <div className="span-2 row"><button className="btn btn-primary">Save</button><button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button></div>
            </form>
          ) : (
            <div className="profile">
              <div className="avatar lg">{p?.fullName?.[0]}</div>
              <div>
                <h3>{p?.fullName}</h3>
                <p className="muted">{p?.headline || 'Add a headline'} · {p?.location || 'Add location'}</p>
                <p className="small">{p?.email}{p?.phone ? ` · ${p.phone}` : ''}</p>
                <p className="small">Experience: {p?.experienceYears ?? 0} yrs · Skills: {p?.skills || 'not set'}</p>
              </div>
            </div>
          )}
        </section>

        <section className="card">
          <h3>Resume</h3>
          {p?.hasResume ? (
            <p>
              <strong>{p.resumeFileName}</strong>
              <span className="muted small"> · {Math.round((p.resumeSizeBytes || 0) / 1024)} KB · {p.resumeTextLength} characters extracted</span>
            </p>
          ) : (
            <p className="muted">No resume yet. Upload a PDF to unlock AI analysis and applications.</p>
          )}
          <div className="row">
            <ResumeUpload onUploaded={refreshAll} />
            {p?.hasResume && <button className="btn btn-ghost" onClick={() => downloadResume(p.candidateId, p.resumeFileName).catch((e) => setMsg(errorMessage(e)))}>Download</button>}
          </div>
          <div className="row wrap">
            <Link className="btn btn-sm btn-ghost" to="/resume-analyzer">Analyze</Link>
            <Link className="btn btn-sm btn-ghost" to="/resume-improvement">Improve</Link>
          </div>
        </section>
      </div>

      <div className="two-col">
        <section className="card">
          <h3>Applied jobs</h3>
          {apps.loading ? <Loader /> : apps.error ? <ErrorMessage message={apps.error} /> : !apps.data?.length ? (
            <EmptyState title="No applications yet" text="Find a role and apply with your resume." />
          ) : (
            <ul className="list">
              {apps.data.slice(0, 6).map((a) => (
                <li key={a.id}>
                  <div><Link to={`/jobs/${a.jobId}`}>{a.jobTitle}</Link><div className="muted small">{a.companyName}</div></div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card">
          <h3>Recent AI job matches</h3>
          {!s?.recentMatches?.length ? <EmptyState title="No matches yet" text="Open Job Matching to compare your resume with a role." /> : (
            <ul className="list">
              {s.recentMatches.map((m, i) => (
                <li key={i}><Link to={`/job-matching?jobId=${m.jobId}`}>{m.jobTitle}</Link><strong>{m.matchPercentage}%</strong></li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <h2>Available jobs</h2>
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
