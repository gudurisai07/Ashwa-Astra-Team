import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apply } from '../api/applicationApi';
import { errorMessage } from '../api/axios';
import { getJob } from '../api/jobApi';
import ErrorMessage from '../components/ErrorMessage';
import Loader from '../components/Loader';
import TagList from '../components/TagList';
import { useAuth } from '../context/AuthContext';
import useAsync from '../hooks/useAsync';

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: job, loading, error } = useAsync(() => getJob(id), [id]);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;
  if (!job) return null;

  const submit = async () => {
    setBusy(true);
    setMsg({ type: '', text: '' });
    try {
      await apply(job.id, note);
      setMsg({ type: 'ok', text: 'Application submitted. You can track it under My Applications.' });
    } catch (e) {
      setMsg({ type: 'error', text: errorMessage(e) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{job.title}</h1>
          <p className="muted">{job.companyName} · {job.location} · {job.employmentType}</p>
        </div>
        <span className={`badge badge-${job.status.toLowerCase()}`}>{job.status.toLowerCase()}</span>
      </div>
      <div className="two-col">
        <section className="card">
          <h3>About the role</h3>
          <p className="prewrap">{job.description}</p>
          <h3>Required skills</h3>
          <TagList items={job.requiredSkills} tone="blue" />
          <p className="muted">Experience: {job.experience}+ years {job.salaryRange ? `· Salary: ${job.salaryRange}` : ''}</p>
        </section>
        <aside className="card">
          {user.role === 'CANDIDATE' ? (
            <>
              <h3>Apply</h3>
              <textarea className="input" rows="4" maxLength={1000} placeholder="Optional note to the recruiter" value={note} onChange={(e) => setNote(e.target.value)} />
              {msg.text && <div className={`alert ${msg.type === 'ok' ? 'alert-ok' : 'alert-error'}`}>{msg.text}</div>}
              <button className="btn btn-primary btn-block" disabled={busy || job.status !== 'ACTIVE'} onClick={submit}>
                {job.status !== 'ACTIVE' ? 'Closed' : busy ? 'Submitting…' : 'Apply with my resume'}
              </button>
              <p className="muted small">A PDF resume must be uploaded first (Dashboard).</p>
              <div className="stack">
                <Link className="btn btn-ghost btn-block" to={`/job-matching?jobId=${job.id}`}>AI match for this job</Link>
                <Link className="btn btn-ghost btn-block" to={`/interview-prep?jobId=${job.id}`}>Interview preparation</Link>
              </div>
            </>
          ) : job.recruiterId === user.id ? (
            <>
              <h3>Manage</h3>
              <p className="muted">{job.applicationCount} applicants</p>
              <Link className="btn btn-primary btn-block" to={`/jobs/${job.id}/edit`}>Edit job</Link>
              <Link className="btn btn-ghost btn-block" to="/applications">View applicants</Link>
            </>
          ) : (
            <p className="muted">Viewing as recruiter.</p>
          )}
        </aside>
      </div>
    </>
  );
}
