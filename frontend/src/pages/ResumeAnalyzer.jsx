import { useState } from 'react';
import { Link } from 'react-router-dom';
import { analyzeResume, latestAnalysis } from '../api/aiApi';
import { errorMessage } from '../api/axios';
import { Block, BulletList, Disclaimer, RunBar, Skills } from '../components/AiBits';
import ErrorMessage from '../components/ErrorMessage';
import Loader from '../components/Loader';
import ScoreRing from '../components/ScoreRing';
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

  return (
    <>
      <div className="page-head">
        <div>
          <h1>🤖 AI Resume Analyzer</h1>
          <p className="muted">Gemini reviews the text of your uploaded resume.</p>
        </div>
        <RunBar onRun={run} busy={busy} label="analysis" hasResult={Boolean(r)} />
      </div>
      <ErrorMessage message={error} />
      {stored.loading ? <Loader /> : !r ? (
        <div className="empty">
          <div className="empty-icon">📄</div>
          <h3>No analysis yet</h3>
          <p>Upload a PDF resume on your <Link to="/candidate">dashboard</Link>, then run the analysis.</p>
        </div>
      ) : (
        <>
          {/* ATS Score Banner */}
          {r.atsReadinessScore != null && (
            <div className="card" style={{
              background:'linear-gradient(135deg,rgba(163,230,53,.12),rgba(6,182,212,.08))',
              border:'1px solid rgba(163,230,53,.3)',
              display:'flex',alignItems:'center',gap:'1.2rem',marginBottom:'1rem'
            }}>
              <span className="ats-badge" style={{fontSize:'1rem',padding:'.4rem 1rem'}}>
                <span className="ats-dot" />
                ATS Score: {r.atsReadinessScore}/100
              </span>
              <span className="muted small">
                {r.atsReadinessScore >= 80 ? '✅ Excellent ATS compatibility' :
                 r.atsReadinessScore >= 60 ? '⚠️ Good — some improvements possible' :
                 '❌ Needs improvement for ATS systems'}
              </span>
            </div>
          )}

          <div className="two-col">
            <Block title="📊 Resume Quality">
              <ScoreRing value={r.qualityScore} label="Quality score" />
              {r.scoreBreakdown && (
                <ul className="bullets">
                  {Object.entries(r.scoreBreakdown).map(([k, v]) => <li key={k}>{k}: {String(v)}</li>)}
                </ul>
              )}
            </Block>
            <Block title="📝 Summary"><p className="prewrap">{r.summary}</p></Block>
          </div>
          <div className="two-col">
            <Skills title="⚙️ Technical Skills" items={r.technicalSkills} tone="blue" />
            <Skills title="🤝 Soft Skills" items={r.softSkills} tone="violet" />
          </div>
          <div className="two-col">
            <Block title="🎓 Education"><BulletList items={r.education} /></Block>
            <Block title="💼 Experience"><BulletList items={r.experience} /></Block>
          </div>
          <div className="two-col">
            <Block title="💪 Strengths"><BulletList items={r.strengths} /></Block>
            <Skills title="🚫 Missing Skills" items={r.missingSkills} tone="red" />
          </div>
          <Block title="💡 Improvement Suggestions"><BulletList items={r.improvementSuggestions} /></Block>
          <Disclaimer result={r} />
        </>
      )}
    </>
  );
}
