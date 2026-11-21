import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { recruiterAnalytics } from '../api/applicationApi';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import Loader from '../components/Loader';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import useAsync from '../hooks/useAsync';

const COLORS = { Pending: '#f59e0b', Shortlisted: '#22c55e', Rejected: '#ef4444' };

export default function RecruiterDashboard() {
  const { data: d, loading, error, reload } = useAsync(recruiterAnalytics, []);
  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={reload} />;

  const pie = [
    { name: 'Pending', value: d.pending },
    { name: 'Shortlisted', value: d.shortlisted },
    { name: 'Rejected', value: d.rejected },
  ].filter((x) => x.value > 0);

  return (
    <>
      <div className="page-head">
        <div><h1>📊 Recruitment Overview</h1><p className="muted">Your jobs and applicants.</p></div>
        <Link to="/jobs/new" className="btn btn-primary">➕ Post a Job</Link>
      </div>
      <div className="stats">
        <StatCard label="Posted jobs" value={d.totalJobs} />
        <StatCard label="Applications" value={d.totalApplications} tone="violet" />
        <StatCard label="Pending" value={d.pending} tone="amber" />
        <StatCard label="Shortlisted" value={d.shortlisted} tone="green" />
        <StatCard label="Rejected" value={d.rejected} tone="red" />
      </div>

      <div className="two-col">
        <section className="card">
          <h3>Application status</h3>
          {!pie.length ? <EmptyState title="No applications yet" /> : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {pie.map((e) => <Cell key={e.name} fill={COLORS[e.name]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </section>
        <section className="card">
          <h3>Applications per job</h3>
          {!d.applicationsPerJob.length ? <EmptyState title="No jobs yet" /> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={d.applicationsPerJob}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.2)" />
                <XAxis dataKey="title" tick={{ fill: '#94a3b8', fontSize: 11 }} interval={0} tickFormatter={(t) => (t.length > 14 ? `${t.slice(0, 13)}…` : t)} />
                <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="applications" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </section>
      </div>

      <section className="card">
        <div className="between"><h3>Recent applicants</h3><Link to="/applications">View all</Link></div>
        {!d.recentApplicants.length ? <EmptyState title="No applicants yet" text="Applicants appear here once candidates apply to your jobs." /> : (
          <ul className="list">
            {d.recentApplicants.map((a) => (
              <li key={a.applicationId}>
                <div><strong>{a.candidateName}</strong><div className="muted small">{a.jobTitle}</div></div>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
