import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const candidateLinks = [
  ['/candidate', 'Dashboard'],
  ['/jobs', 'Browse Jobs'],
  ['/applications', 'My Applications'],
  ['/resume-analyzer', 'Resume Analyzer'],
  ['/job-matching', 'Job Matching'],
  ['/interview-prep', 'Interview Prep'],
  ['/resume-improvement', 'Resume Improvement'],
];
const recruiterLinks = [
  ['/recruiter', 'Dashboard'],
  ['/jobs', 'Jobs'],
  ['/jobs/new', 'Post a Job'],
  ['/applications', 'Applicants'],
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const links = user?.role === 'RECRUITER' ? recruiterLinks : candidateLinks;

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <button className="menu-btn" aria-label="Toggle navigation" onClick={() => setOpen((o) => !o)}>
        ☰
      </button>
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <span className="brand-mark">S</span> SmartHire <span className="brand-ai">AI</span>
        </div>
        <nav onClick={() => setOpen(false)}>
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="user-chip">
            <div className="avatar">{user?.fullName?.[0]?.toUpperCase()}</div>
            <div>
              <div className="user-name">{user?.fullName}</div>
              <div className="user-role">{user?.role?.toLowerCase()}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-block" onClick={onLogout}>
            Log out
          </button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
