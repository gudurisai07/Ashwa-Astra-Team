import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { recruiterAnalytics } from '../api/applicationApi';
import { updateProfile, uploadProfileImage } from '../api/authApi';
import { errorMessage } from '../api/axios';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import Loader from '../components/Loader';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import useAsync from '../hooks/useAsync';

const COLORS = { Pending: '#f59e0b', Shortlisted: '#22c55e', Rejected: '#ef4444' };

export default function RecruiterDashboard() {
  const { user, updateUser } = useAuth();
  const { data: d, loading, error, reload } = useAsync(recruiterAnalytics, []);
  const [editingProfile, setEditingProfile] = useState(false);
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const logoInputRef = useRef();

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={reload} />;

  const pie = [
    { name: 'Pending', value: d.pending },
    { name: 'Shortlisted', value: d.shortlisted },
    { name: 'Rejected', value: d.rejected },
  ].filter((x) => x.value > 0);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setProfileErr('Please select an image file (PNG, JPG, WEBP).');
      return;
    }
    setProfileErr('');
    setProfileMsg('');
    setUploadingLogo(true);
    try {
      const res = await uploadProfileImage(file);
      if (res?.url) {
        await updateProfile({ profileImageUrl: res.url });
        updateUser({ profileImageUrl: res.url });
        setProfileMsg('Company logo / profile image updated via Cloudinary! ✓');
        setTimeout(() => setProfileMsg(''), 4000);
      }
    } catch (err) {
      setProfileErr(errorMessage(err, 'Failed to upload image.'));
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileErr('');
    setProfileMsg('');
    try {
      const res = await updateProfile({ fullName, companyName });
      updateUser({ fullName: res.fullName, companyName: res.companyName });
      setEditingProfile(false);
      setProfileMsg('Recruiter profile updated successfully! ✓');
      setTimeout(() => setProfileMsg(''), 4000);
    } catch (err) {
      setProfileErr(errorMessage(err, 'Could not update profile.'));
    }
  };

  const initials = (user?.fullName || 'Recruiter')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <>
      {/* Top Header */}
      <div className="page-head" style={{ marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span>📊 Recruitment Command Center</span>
          </h1>
          <p className="muted">Manage your talent pipeline, job postings, and applicant evaluations.</p>
        </div>
        <Link to="/jobs/new" className="btn btn-primary" style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
          boxShadow: '0 4px 16px rgba(124, 58, 237, 0.35)',
          padding: '0.65rem 1.4rem', fontWeight: 600, borderRadius: '0.75rem'
        }}>
          ➕ Post a New Job
        </Link>
      </div>

      {/* Recruiter & Company Profile Card with Cloudinary Image Upload */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.12), rgba(6, 182, 212, 0.06))',
        border: '1px solid rgba(168, 85, 247, 0.25)',
        borderRadius: '1.25rem',
        padding: '1.5rem 1.75rem',
        marginBottom: '2rem',
        backdropFilter: 'blur(20px)',
        position: 'relative'
      }}>
        {profileMsg && (
          <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.4)', color: '#4ade80', padding: '0.6rem 1rem', borderRadius: '0.6rem', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
            {profileMsg}
          </div>
        )}
        {profileErr && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171', padding: '0.6rem 1rem', borderRadius: '0.6rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {profileErr}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {/* Logo / Avatar with Cloudinary Uploader */}
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => logoInputRef.current.click()}
                style={{
                  width: '68px', height: '68px', borderRadius: '18px',
                  background: user?.profileImageUrl ? `url(${user.profileImageUrl}) center/cover` : 'linear-gradient(135deg, #7c3aed, #2563eb)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem', fontWeight: 800, color: '#fff',
                  border: '2px solid rgba(168, 85, 247, 0.5)',
                  cursor: 'pointer', overflow: 'hidden', flexShrink: 0,
                  boxShadow: '0 4px 16px rgba(124, 58, 237, 0.35)'
                }}
                title="Click to upload company logo or profile picture (Cloudinary)"
              >
                {!user?.profileImageUrl && (user?.companyName ? '🏢' : initials)}
                {uploadingLogo && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#38bdf8', fontWeight: 700 }}>
                    Uploading…
                  </div>
                )}
              </div>
              <button
                onClick={() => logoInputRef.current.click()}
                type="button"
                style={{
                  position: 'absolute', bottom: '-4px', right: '-4px',
                  background: '#6366f1', border: '2px solid #0f172a',
                  width: '24px', height: '24px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', color: '#fff', cursor: 'pointer'
                }}
                title="Change Photo"
              >
                📷
              </button>
              <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Recruiter Profile & Company
              </div>
              <h2 style={{ margin: '0.1rem 0 0.2rem', fontSize: '1.35rem', color: '#f8fafc', fontWeight: 800 }}>
                {user?.fullName || 'Recruiter'}
              </h2>
              <div style={{ color: '#94a3b8', fontSize: '0.88rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span>🏢 {user?.companyName || 'Set company name'}</span>
                <span>✉️ {user?.email}</span>
                <span style={{ color: '#38bdf8' }}>☁️ Cloudinary Enabled</span>
              </div>
            </div>
          </div>

          <div>
            {!editingProfile ? (
              <button
                onClick={() => setEditingProfile(true)}
                className="btn btn-sm btn-ghost"
                style={{ border: '1px solid rgba(255,255,255,0.15)', fontSize: '0.85rem' }}
              >
                ✏️ Edit Company Details
              </button>
            ) : null}
          </div>
        </div>

        {/* Inline Edit Form */}
        {editingProfile && (
          <form onSubmit={handleSaveProfile} style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <label>
                Full Name
                <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </label>
              <label>
                Company Name
                <input className="input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Acme Corporation" required />
              </label>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button type="submit" className="btn btn-sm btn-primary">Save Changes</button>
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => setEditingProfile(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>

      {/* Metric Stat Cards */}
      <div className="stats" style={{ marginBottom: '2rem' }}>
        <StatCard label="Posted Jobs" value={d.totalJobs} tone="blue" />
        <StatCard label="Total Applications" value={d.totalApplications} tone="violet" />
        <StatCard label="Pending Review" value={d.pending} tone="amber" />
        <StatCard label="Shortlisted" value={d.shortlisted} tone="green" />
        <StatCard label="Rejected" value={d.rejected} tone="red" />
      </div>

      {/* Analytics Charts */}
      <div className="two-col" style={{ marginBottom: '2rem' }}>
        <section className="card" style={{ background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(20px)', borderRadius: '1.25rem', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.05rem', color: '#f8fafc' }}>📈 Application Status Distribution</h3>
          {!pie.length ? <EmptyState title="No applications yet" text="Metrics will populate once candidates apply to your jobs." /> : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={4}>
                  {pie.map((e) => <Cell key={e.name} fill={COLORS[e.name]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </section>

        <section className="card" style={{ background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(20px)', borderRadius: '1.25rem', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.05rem', color: '#f8fafc' }}>📊 Applications per Job</h3>
          {!d.applicationsPerJob.length ? <EmptyState title="No jobs posted yet" text="Post a job to start receiving candidates." /> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={d.applicationsPerJob}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.15)" />
                <XAxis dataKey="title" tick={{ fill: '#94a3b8', fontSize: 11 }} interval={0} tickFormatter={(t) => (t.length > 14 ? `${t.slice(0, 13)}…` : t)} />
                <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="applications" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </section>
      </div>

      {/* Recent Applicants */}
      <section className="card" style={{ background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(20px)', borderRadius: '1.25rem', padding: '1.5rem' }}>
        <div className="between" style={{ marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#f8fafc' }}>👥 Recent Applicants</h3>
          <Link to="/applications" style={{ color: '#38bdf8', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none' }}>
            View all applicants →
          </Link>
        </div>
        {!d.recentApplicants.length ? <EmptyState title="No applicants yet" text="Applicants appear here once candidates apply to your jobs." /> : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {d.recentApplicants.map((a) => (
              <li key={a.applicationId} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem'
              }}>
                <div>
                  <strong style={{ color: '#f8fafc', fontSize: '0.95rem' }}>{a.candidateName}</strong>
                  <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '0.1rem' }}>{a.jobTitle}</div>
                </div>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
