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
        <div className="brand"><span className="brand-mark">S</span> SmartHire <span className="brand-ai">AI</span></div>
        <div className="row">
          {user ? (
            <Link className="btn btn-primary" to={dash}>Open dashboard</Link>
          ) : (
            <>
              <Link className="btn btn-ghost" to="/login">Log in</Link>
              <Link className="btn btn-primary" to="/register">Get started</Link>
            </>
          )}
        </div>
      </header>
      <section className="hero">
        <span className="pill">AI-powered recruitment</span>
        <h1>Hire smarter. Get hired faster.</h1>
        <p>
          SmartHire AI uses Gemini to analyse resumes, match candidates to roles and prepare interviews.
          AI supports decisions; people make them.
        </p>
        <div className="row center">
          <Link className="btn btn-primary btn-lg" to={dash}>{user ? 'Go to dashboard' : 'Create free account'}</Link>
          <Link className="btn btn-ghost btn-lg" to="/jobs">Browse jobs</Link>
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
