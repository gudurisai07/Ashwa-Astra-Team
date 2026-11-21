import { useState } from 'react';
import { Link } from 'react-router-dom';
import { downloadResume, myApplications, recruiterApplications, updateStatus } from '../api/applicationApi';
import { errorMessage } from '../api/axios';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import TagList from '../components/TagList';
import { useAuth } from '../context/AuthContext';
import useAsync from '../hooks/useAsync';

export default function Applications() {
  const { user } = useAuth();
  const isRecruiter = user.role === 'RECRUITER';
  const { data, loading, error, reload, setData } = useAsync(isRecruiter ? recruiterApplications : myApplications, [isRecruiter]);
  const [filter, setFilter] = useState('ALL');
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const change = async (id, status) => {
    setBusyId(id);
    setActionError('');
    try {
      const updated = await updateStatus(id, status);
      setData((list) => list.map((a) => (a.id === id ? updated : a)));
    } catch (e) {
      setActionError(errorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  const download = (a) => downloadResume(a.candidateId, `${a.candidateName}-resume.pdf`).catch((e) => setActionError(errorMessage(e)));

  if (loading) return <Loader />;
  const rows = (data || []).filter((a) => filter === 'ALL' || a.status === filter);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{isRecruiter ? 'Applicants' : 'My applications'}</h1>
          <p className="muted">{isRecruiter ? 'Review applicants for your jobs. Status changes are always your decision.' : 'Track every application and its status.'}</p>
        </div>
        <select className="input input-auto" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by status">
          <option value="ALL">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="SHORTLISTED">Shortlisted</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>
      <ErrorMessage message={error || actionError} onRetry={reload} />
      {!rows.length ? (
        <EmptyState title="No applications" text={isRecruiter ? 'Nothing here yet.' : 'Browse jobs and apply to get started.'}
          action={!isRecruiter && <Link className="btn btn-primary" to="/jobs">Browse jobs</Link>} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                {isRecruiter && <th>Candidate</th>}
                <th>Job</th>
                {isRecruiter && <th>Skills</th>}
                <th>Applied</th>
                <th>Status</th>
                {isRecruiter && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id}>
                  {isRecruiter && (
                    <td><strong>{a.candidateName}</strong><div className="muted small">{a.candidateEmail}</div></td>
                  )}
                  <td><Link to={`/jobs/${a.jobId}`}>{a.jobTitle}</Link><div className="muted small">{a.companyName}</div></td>
                  {isRecruiter && <td><TagList items={a.candidateSkills} /></td>}
                  <td className="small">{new Date(a.appliedAt).toLocaleDateString()}</td>
                  <td><StatusBadge status={a.status} /></td>
                  {isRecruiter && (
                    <td>
                      <div className="row wrap">
                        <button className="btn btn-sm btn-ok" disabled={busyId === a.id || a.status === 'SHORTLISTED'} onClick={() => change(a.id, 'SHORTLISTED')}>Shortlist</button>
                        <button className="btn btn-sm btn-danger" disabled={busyId === a.id || a.status === 'REJECTED'} onClick={() => change(a.id, 'REJECTED')}>Reject</button>
                        {a.status !== 'PENDING' && <button className="btn btn-sm btn-ghost" disabled={busyId === a.id} onClick={() => change(a.id, 'PENDING')}>Reset</button>}
                        {a.hasResume && <button className="btn btn-sm btn-ghost" onClick={() => download(a)}>Resume</button>}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
