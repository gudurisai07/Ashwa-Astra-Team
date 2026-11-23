import { Suspense, lazy, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ThreeBackground = lazy(() => import('../components/ThreeBackground'));

const features = [
  {
    icon: '🤖',
    title: 'AI Resume Analyzer',
    desc: 'Get a structured ATS deep-dive of your real resume — skills, strengths, gaps, and a quality score powered by Gemini.',
    color: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.15)',
  },
  {
    icon: '🎯',
    title: 'Evidence-Based Job Match',
    desc: 'Match scores follow a transparent rubric: skills, experience, education, and responsibilities — no black box.',
    color: '#c084fc',
    glow: 'rgba(192, 132, 252, 0.15)',
  },
  {
    icon: '🧠',
    title: 'Interview Preparation',
    desc: '15 tailored technical, HR, and situational questions with AI-generated answer guidance for each job you apply to.',
    color: '#4ade80',
    glow: 'rgba(74, 222, 128, 0.12)',
  },
  {
    icon: '📊',
    title: 'Recruiter Analytics',
    desc: 'Track applicants, shortlists, and hiring funnels from one clean, real-time dashboard. AI supports; humans decide.',
    color: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.12)',
  },
];

const stats = [
  { value: '10K+', label: 'Job Seekers' },
  { value: '95%', label: 'ATS Pass Rate' },
  { value: '500+', label: 'Companies' },
  { value: '2.5×', label: 'Interview Rate' },
];

export default function Home() {
  const { user } = useAuth();
  const dash = user ? (user.role === 'RECRUITER' ? '/recruiter' : '/candidate') : '/register';
  const [tick, setTick] = useState(0);

  // Typewriter titles
  const titles = ['Get Hired Faster.', 'Beat the ATS.', 'Land Your Dream Role.', 'Stand Out. Apply Smart.'];
  const currentTitle = titles[tick % titles.length];

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 3200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="landing">
      <Suspense fallback={null}>
        <ThreeBackground />
      </Suspense>

      {/* NAV */}
      <header className="landing-nav" style={{
        background: 'rgba(10, 15, 30, 0.7)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 2rem',
      }}>
        <div className="brand">
          <span className="brand-mark" style={{ width: 38, height: 38, fontSize: '1.1rem', borderRadius: 12, background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>S</span>
          SmartHire <span className="brand-ai">AI</span>
        </div>
        <div className="row">
          {user ? (
            <Link className="btn btn-primary" to={dash} style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', boxShadow: '0 4px 16px rgba(124,58,237,0.4)' }}>
              🚀 Open Dashboard
            </Link>
          ) : (
            <>
              <Link className="btn btn-ghost" to="/login" style={{ border: '1px solid rgba(255,255,255,0.12)' }}>Log in</Link>
              <Link className="btn btn-primary" to="/register" style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', boxShadow: '0 4px 16px rgba(124,58,237,0.4)' }}>
                Get started free →
              </Link>
            </>
          )}
        </div>
      </header>

      {/* HERO */}
      <section className="hero" style={{ padding: '7rem 2rem 5rem', textAlign: 'center', position: 'relative' }}>
        {/* Glow blobs */}
        <div style={{
          position: 'absolute', top: '20%', left: '15%',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '30%', right: '10%',
          width: '350px', height: '350px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none',
        }} />

        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <span style={{
            padding: '0.4rem 1rem', borderRadius: '9999px',
            background: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(168, 85, 247, 0.4)',
            color: '#c084fc', fontSize: '0.85rem', fontWeight: 600,
          }}>
            ⚡ Powered by Google Gemini 2.0 AI
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, lineHeight: 1.1,
          background: 'linear-gradient(135deg, #f8fafc 0%, #c084fc 50%, #38bdf8 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          margin: '0 0 0.5rem',
        }}>
          Hire Smarter.
        </h1>
        <h1 key={tick} style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1,
          color: '#94a3b8', margin: '0 0 1.5rem',
          animation: 'fadeSlideIn 0.5s ease',
        }}>
          {currentTitle}
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '580px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          SmartHire AI uses Gemini to analyse resumes, match candidates to roles and prepare you for interviews.
          AI supports decisions; <strong style={{ color: '#f8fafc' }}>people make them.</strong>
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to={dash} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.85rem 2rem', borderRadius: '0.9rem',
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            color: '#fff', fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
            boxShadow: '0 6px 24px rgba(124, 58, 237, 0.45)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(124,58,237,0.6)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,58,237,0.45)'; }}
          >
            {user ? '🚀 Go to Dashboard' : '✨ Create Free Account'}
          </Link>
          <Link to="/jobs" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.85rem 2rem', borderRadius: '0.9rem',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
            color: '#f8fafc', fontWeight: 600, fontSize: '1rem', textDecoration: 'none',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(168,85,247,0.4)'; e.currentTarget.style.background = 'rgba(168,85,247,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
          >
            💼 Browse Jobs
          </Link>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap',
          marginTop: '3.5rem', paddingTop: '2.5rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          {stats.map(({ value, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.9rem', fontWeight: 800, background: 'linear-gradient(135deg, #c084fc, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {value}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '0.2rem', fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '0 2rem 5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            What SmartHire does for you
          </span>
          <h2 style={{ margin: '0.75rem 0 0', fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: 800, color: '#f8fafc' }}>
            Everything you need to get hired
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', maxWidth: '1100px', margin: '0 auto' }}>
          {features.map(({ icon, title, desc, color, glow }) => (
            <div key={title} style={{
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(20px)',
              border: `1px solid rgba(255,255,255,0.08)`,
              borderRadius: '1.25rem',
              padding: '1.75rem',
              transition: 'transform 0.25s, border-color 0.25s, box-shadow 0.25s',
              cursor: 'default',
              position: 'relative', overflow: 'hidden',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = `${color}40`;
              e.currentTarget.style.boxShadow = `0 12px 40px ${glow}`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{icon}</div>
              <h3 style={{ margin: '0 0 0.65rem', color: color, fontSize: '1.1rem', fontWeight: 700 }}>{title}</h3>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FOOTER */}
      {!user && (
        <section style={{
          margin: '0 2rem 4rem', padding: '3rem 2rem', textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(6, 182, 212, 0.08))',
          border: '1px solid rgba(168, 85, 247, 0.25)',
          borderRadius: '1.5rem',
          backdropFilter: 'blur(20px)',
        }}>
          <h2 style={{ margin: '0 0 0.75rem', fontSize: '2rem', fontWeight: 800, color: '#f8fafc' }}>
            Ready to land your dream job?
          </h2>
          <p style={{ color: '#94a3b8', margin: '0 0 2rem', fontSize: '1rem' }}>
            Join thousands of candidates who've boosted their ATS score and interview rate with SmartHire AI.
          </p>
          <Link to="/register" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.85rem 2.5rem', borderRadius: '0.9rem',
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            color: '#fff', fontWeight: 700, fontSize: '1.05rem', textDecoration: 'none',
            boxShadow: '0 6px 24px rgba(124, 58, 237, 0.45)',
          }}>
            ✨ Start for Free — No Credit Card
          </Link>
        </section>
      )}

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
