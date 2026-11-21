import { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ThreeBackground = lazy(() => import('../components/ThreeBackground'));

const features = [
  ['AI Resume Analyzer', 'Get a structured review of your real resume: skills, strengths, gaps and a quality score.'],
  ['Evidence-based Job Match', 'Match scores follow a transparent rubric: skills, experience, education and responsibilities.'],
  ['Interview Preparation', '15 tailored technical, HR and situational questions with answer guidance for each job.'],
  ['Recruiter Analytics', 'Track applicants, shortlists and hiring funnels from one clean dashboard.'],
];

export default function Home() {
  const { user } = useAuth();
  const dash = user ? (user.role === 'RECRUITER' ? '/recruiter' : '/candidate') : '/register';
  return (
    <div className="landing">
      <Suspense fallback={null}>
        <ThreeBackground />
      </Suspense>
      <header className="landing-nav">
        <div className="brand"><span className="brand-mark" style={{width:38,height:38,fontSize:'1.1rem',borderRadius:12}}>S</span> SmartHire <span className="brand-ai">AI</span></div>
        <div className="row">
          {user ? (
            <Link className="btn btn-primary" to={dash}>🚀 Open Dashboard</Link>
          ) : (
            <>
              <Link className="btn btn-ghost" to="/login">Log in</Link>
              <Link className="btn btn-primary" to="/register">Get started free →</Link>
            </>
          )}
        </div>
      </header>
      <section className="hero">
        <span className="pill">⚡ Powered by Google Gemini AI</span>
        <h1>Hire smarter.<br />Get hired faster.</h1>
        <p>
          SmartHire AI uses Gemini to analyse resumes, match candidates to roles and prepare you for interviews.
          AI supports decisions; people make them.
        </p>
        <div className="row center" style={{gap:'1rem'}}>
          <Link className="btn btn-primary btn-lg" to={dash}>{user ? '🚀 Go to Dashboard' : '✨ Create Free Account'}</Link>
          <Link className="btn btn-ghost btn-lg" to="/jobs">💼 Browse Jobs</Link>
        </div>
      </section>
      <section className="features">
        {features.map(([t, d]) => (
          <div className="card glass" key={t}>
            <h3>{t}</h3>
            <p className="muted">{d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
