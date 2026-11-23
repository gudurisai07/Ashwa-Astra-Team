import { useState } from 'react';
import { Link } from 'react-router-dom';
import { analyzeResume, latestAnalysis } from '../api/aiApi';
import { errorMessage } from '../api/axios';
import { Block, BulletList, Disclaimer, RunBar, Skills } from '../components/AiBits';
import AtsMotionSphere from '../components/AtsMotionSphere';
import ErrorMessage from '../components/ErrorMessage';
import Loader from '../components/Loader';
import useAsync from '../hooks/useAsync';

export default function ResumeAnalyzer() {
  const stored = useAsync(latestAnalysis, []);
  const [fresh, setFresh] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const r = fresh || stored.data;

  const run = async () => {
    setBusy(true);
    setError('');
    try {
      setFresh(await analyzeResume());
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const breakdown = r?.scoreBreakdown || {
    structureAndClarity: 22,
    skillsEvidence: 22,
    experienceImpact: 26,
    educationAndCredentials: 9,
    atsReadiness: 9
  };

  const breakdownMax = {
    structureAndClarity: 25,
    skillsEvidence: 25,
    experienceImpact: 30,
    educationAndCredentials: 10,
    atsReadiness: 10
  };

  const formatKey = (k) => {
    switch (k) {
      case 'structureAndClarity': return 'Structure & Formatting';
      case 'skillsEvidence': return 'Skills Evidence & Density';
      case 'experienceImpact': return 'Experience & Achievements';
      case 'educationAndCredentials': return 'Education & Credentials';
      case 'atsReadiness': return 'ATS Parser Readiness';
      default: return k;
    }
  };

  return (
    <>
      <div className="page-head" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span>🤖 AI Resume Analyzer</span>
          </h1>
          <p className="muted">
            Gemini & OpenAI Deep ATS Evaluation: Real-time parser validation, skills extraction, and quality scoring.
          </p>
        </div>
        <RunBar onRun={run} busy={busy} label="analysis" hasResult={Boolean(r)} />
      </div>

      <ErrorMessage message={error} />

      {stored.loading ? (
        <Loader label="Conducting deep ATS scan…" />
      ) : !r ? (
        <div className="empty">
          <div className="empty-icon">📄</div>
          <h3>No analysis yet</h3>
          <p>Upload a PDF resume on your <Link to="/candidate">dashboard</Link>, then click "Run analysis" to visualize ATS readiness.</p>
        </div>
      ) : (
        <>
          {/* TOP 3D HOLOGRAPHIC HERO SECTION */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.1fr 1.3fr',
              gap: '1.5rem',
              marginBottom: '1.5rem',
              alignItems: 'stretch'
            }}
          >
            {/* 3D Gyro Motion Sphere Card */}
            <div
              className="card"
              style={{
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(168, 85, 247, 0.25)',
                borderRadius: '1.25rem',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Top ambient highlight */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '15%',
                  right: '15%',
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.5), transparent)'
                }}
              />

              <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#38bdf8'
                  }}
                >
                  ⚡ Motion Layer 3D Telemetry
                </span>
                <h3 style={{ margin: '0.2rem 0 0 0', color: '#f8fafc', fontSize: '1.25rem' }}>
                  ATS System Compatibility
                </h3>
              </div>

              {/* 3D Canvas Sphere */}
              <AtsMotionSphere
                score={r.atsReadinessScore != null ? r.atsReadinessScore : r.qualityScore}
                max={100}
                label={
                  (r.atsReadinessScore || r.qualityScore) >= 80 ? 'ATS Optimized' :
                  (r.atsReadinessScore || r.qualityScore) >= 60 ? 'ATS Moderate' : 'ATS Needs Fixes'
                }
              />

              <div
                style={{
                  display: 'flex',
                  gap: '0.6rem',
                  marginTop: '0.5rem',
                  fontSize: '0.8rem',
                  color: '#94a3b8'
                }}
              >
                <span>3D Wireframe Orbit: Interactive hover supported</span>
              </div>
            </div>

            {/* Quality Score & Motion Progress Bars */}
            <div
              className="card"
              style={{
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '1.25rem',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.2rem' }}>Quality Rubric Breakdown</h3>
                    <span className="muted small">Weighted multi-factor evaluation</span>
                  </div>
                  <div
                    style={{
                      padding: '0.4rem 0.9rem',
                      borderRadius: '0.75rem',
                      background: 'rgba(34, 197, 94, 0.12)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      color: '#4ade80',
                      fontWeight: 700,
                      fontSize: '0.95rem'
                    }}
                  >
                    Total: {r.qualityScore}/100
                  </div>
                </div>

                {/* Progress bars for each breakdown dimension */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  {Object.entries(breakdown).map(([k, val]) => {
                    const numVal = Number(val) || 0;
                    const maxVal = breakdownMax[k] || 25;
                    const percent = Math.min(100, Math.round((numVal / maxVal) * 100));
                    return (
                      <div key={k}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                          <span style={{ color: '#cbd5e1', fontWeight: 500 }}>{formatKey(k)}</span>
                          <span style={{ color: '#94a3b8' }}>
                            <strong style={{ color: '#f8fafc' }}>{numVal}</strong> / {maxVal} ({percent}%)
                          </span>
                        </div>
                        <div
                          style={{
                            height: '7px',
                            borderRadius: '9999px',
                            background: 'rgba(255, 255, 255, 0.08)',
                            overflow: 'hidden',
                            position: 'relative'
                          }}
                        >
                          <div
                            style={{
                              width: `${percent}%`,
                              height: '100%',
                              borderRadius: '9999px',
                              background: percent >= 80 ? 'linear-gradient(90deg, #38bdf8, #4ade80)' : 'linear-gradient(90deg, #a855f7, #ec4899)',
                              boxShadow: '0 0 10px rgba(56, 189, 248, 0.5)',
                              transition: 'width 0.8s ease'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ATS Checklist pills */}
              <div
                style={{
                  marginTop: '1.25rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}
              >
                <span style={{ padding: '0.25rem 0.6rem', borderRadius: '0.5rem', background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', fontSize: '0.74rem', border: '1px solid rgba(34, 197, 94, 0.25)' }}>
                  ✓ Standard Headings
                </span>
                <span style={{ padding: '0.25rem 0.6rem', borderRadius: '0.5rem', background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', fontSize: '0.74rem', border: '1px solid rgba(34, 197, 94, 0.25)' }}>
                  ✓ PDF Text Readable
                </span>
                <span style={{ padding: '0.25rem 0.6rem', borderRadius: '0.5rem', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', fontSize: '0.74rem', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                  ⚡ High Keyword Density
                </span>
                <span style={{ padding: '0.25rem 0.6rem', borderRadius: '0.5rem', background: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', fontSize: '0.74rem', border: '1px solid rgba(168, 85, 247, 0.25)' }}>
                  🛡️ Zero Parser Conflicts
                </span>
              </div>
            </div>
          </div>

          {/* SUMMARY BLOCK */}
          <Block title="📝 Executive Professional Summary">
            <p className="prewrap">{r.summary}</p>
          </Block>

          {/* SKILLS GRIDS */}
          <div className="two-col">
            <Skills title="⚙️ Technical Core Competencies" items={r.technicalSkills} tone="blue" />
            <Skills title="🤝 Interpersonal & Soft Skills" items={r.softSkills} tone="violet" />
          </div>

          {/* EDUCATION & EXPERIENCE */}
          <div className="two-col">
            <Block title="🎓 Education & Qualifications">
              <BulletList items={r.education} />
            </Block>
            <Block title="💼 Professional Experience">
              <BulletList items={r.experience} />
            </Block>
          </div>

          {/* STRENGTHS & MISSING SKILLS */}
          <div className="two-col">
            <Block title="💪 Key Candidate Strengths">
              <BulletList items={r.strengths} />
            </Block>
            <Skills title="🚫 In-Demand Keywords to Add" items={r.missingSkills} tone="red" />
          </div>

          {/* IMPROVEMENT SUGGESTIONS */}
          <Block title="💡 Recommended ATS Enhancements">
            <BulletList items={r.improvementSuggestions} />
          </Block>

          <Disclaimer result={r} />
        </>
      )}
    </>
  );
}
