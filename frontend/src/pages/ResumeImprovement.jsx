import { useState } from 'react';
import { Link } from 'react-router-dom';
import { improveResume, latestImprovement } from '../api/aiApi';
import { errorMessage } from '../api/axios';
import { Block, BulletList, Disclaimer, RunBar } from '../components/AiBits';
import ErrorMessage from '../components/ErrorMessage';
import Loader from '../components/Loader';
import TagList from '../components/TagList';
import useAsync from '../hooks/useAsync';

function Pair({ before, after, why }) {
  return (
    <div className="ba">
      <div><div className="ba-label">Before</div><p className="prewrap">{before}</p></div>
      <div><div className="ba-label ba-after">After</div><p className="prewrap">{after}</p></div>
      {why && <p className="muted small span-2">Why: {why}</p>}
    </div>
  );
}

export default function ResumeImprovement() {
  const stored = useAsync(latestImprovement, []);
  const [fresh, setFresh] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const r = fresh || stored.data;

  const run = async () => {
    setBusy(true);
    setError('');
    try {
      setFresh(await improveResume());
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <div><h1>Resume Improvement</h1><p className="muted">ATS-friendly rewrites based on your actual resume. Review every line before using it.</p></div>
        <RunBar onRun={run} busy={busy} label="improvement" hasResult={Boolean(r)} />
      </div>
      <ErrorMessage message={error} />
      {stored.loading ? <Loader /> : !r ? (
        <div className="empty"><h3>No suggestions yet</h3><p>Upload a resume on your <Link to="/candidate">dashboard</Link> and run the assistant.</p></div>
      ) : (
        <>
          <Block title="Improved professional summary"><p className="prewrap">{r.improvedSummary}</p></Block>
          <Block title="Improved experience descriptions">
            {(r.improvedExperience || []).map((x, i) => <Pair key={i} before={x.before} after={x.after} />)}
          </Block>
          <div className="two-col">
            <Block title="Better skill presentation">
              <p>{r.skillsPresentation?.recommendedLayout}</p>
              {(r.skillsPresentation?.groupedSkills || []).map((g, i) => (
                <div key={i}><strong>{g.category}</strong><TagList items={g.skills} tone="blue" /></div>
              ))}
            </Block>
            <Block title="ATS-friendly suggestions"><BulletList items={r.atsSuggestions} /></Block>
          </div>
          <Block title="Before and after examples">
            {(r.beforeAfterExamples || []).map((x, i) => <Pair key={i} before={x.before} after={x.after} why={x.why} />)}
          </Block>
          <Disclaimer result={r} />
        </>
      )}
    </>
  );
}
