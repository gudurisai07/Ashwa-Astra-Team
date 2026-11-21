import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { errorMessage } from '../api/axios';
import { createJob, getJob, updateJob } from '../api/jobApi';
import ErrorMessage from '../components/ErrorMessage';
import Loader from '../components/Loader';

const empty = {
  title: '', companyName: '', description: '', requiredSkills: '', experience: 0,
  salaryRange: '', location: '', employmentType: 'Full-time', status: 'ACTIVE',
};

export default function PostJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(Boolean(id));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getJob(id).then(setForm).catch((e) => setError(errorMessage(e))).finally(() => setLoading(false));
  }, [id]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const payload = { ...form, experience: Number(form.experience) || 0 };
    try {
      const saved = id ? await updateJob(id, payload) : await createJob(payload);
      navigate(`/jobs/${saved.id}`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <div className="page-head"><h1>{id ? '✏️ Edit Job' : '➕ Post a New Job'}</h1></div>
      <form className="card form-grid" onSubmit={submit}>
        <ErrorMessage message={error} />
        <label>Job title<input className="input" required maxLength={200} value={form.title} onChange={set('title')} /></label>
        <label>Company<input className="input" required maxLength={200} value={form.companyName} onChange={set('companyName')} /></label>
        <label>Location<input className="input" required value={form.location} onChange={set('location')} /></label>
        <label>Employment type
          <select className="input" value={form.employmentType} onChange={set('employmentType')}>
            {['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'].map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label>Experience (years)<input className="input" type="number" min="0" required value={form.experience} onChange={set('experience')} /></label>
        <label>Salary range<input className="input" placeholder="e.g. INR 8-12 LPA" value={form.salaryRange || ''} onChange={set('salaryRange')} /></label>
        <label className="span-2">Required skills (comma separated)
          <input className="input" required placeholder="Java, Spring Boot, React" value={form.requiredSkills} onChange={set('requiredSkills')} />
        </label>
        <label className="span-2">Description
          <textarea className="input" rows="7" required value={form.description} onChange={set('description')} />
        </label>
        {id && (
          <label>Status
            <select className="input" value={form.status} onChange={set('status')}>
              <option value="ACTIVE">Active</option>
              <option value="CLOSED">Closed</option>
            </select>
          </label>
        )}
        <div className="span-2 row">
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : id ? 'Save changes' : 'Publish job'}</button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </>
  );
}
