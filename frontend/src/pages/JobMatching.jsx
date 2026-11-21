import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { latestMatch, matchJob } from '../api/aiApi';
import { errorMessage } from '../api/axios';
import { Block, BulletList, Disclaimer, RunBar, Skills } from '../components/AiBits';
import ErrorMessage from '../components/ErrorMessage';
import JobPicker from '../components/JobPicker';
import ScoreRing from '../components/ScoreRing';

export default function JobMatching() {
  const [params, setParams] = useSearchParams();
  const jobId = params.get('jobId') || '';
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setResult(null);
    setError('');
    if (!jobId) return;
    let alive = true;
    latestMatch(jobId).then((r) => alive && setResult(r)).catch(() => {});
    return () => { alive = false; };
  }, [jobId]);

  const run = async () => {
    setBusy(true);
    setError('');
    try {
      setResult(await matchJob(jobId));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const b = result?.scoreBreakdown;
  return (
    <>
      <div className="page-head"><div><h1>🎯 AI Job Matching</h1><p className="muted">Compare your real resume with a real job posting.</p></div></div>
      <div className="card row wrap">
        <div className="grow"><JobPicker value={jobId} onChange={(v) => setParams(v ? { jobId: v } : {})} /></div>
        {jobId && <RunBar onRun={run} busy={busy} label="match" hasResult={Boolean(result)} />}
      </div>
      <ErrorMessage message={error} />
      {result && (
        <>
          <div className="two-col">
            <Block title={`Match for ${result.jobTitle || 'job'}`}>
              <ScoreRing value={result.matchPercentage} label="Match %" />
              {b && (
                <ul className="bullets">
                  <li>Required skills: {b.requiredSkills}/50</li>
                  <li>Experience: {b.experience}/30</li>
                  <li>Education &amp; domain: {b.educationAndDomain}/10</li>
                  <li>Responsibilities fit: {b.responsibilitiesFit}/10</li>
                  <li>Exact skill keywords found in resume: {result.keywordCoveragePercent}%</li>
                </ul>
              )}
            </Block>
            <Block title="Suitability"><p className="prewrap">{result.suitabilityExplanation}</p></Block>
          </div>
          <div className="two-col">
            <Skills title="Matching skills" items={result.matchingSkills} tone="green" />
            <Skills title="Missing skills" items={result.missingSkills} tone="red" />
          </div>
          <div className="two-col">
            <Block title="Relevant experience"><BulletList items={result.relevantExperience} /></Block>
            <Block title="How to improve"><BulletList items={result.improvementSuggestions} /></Block>
          </div>
          <Disclaimer result={result} />
        </>
      )}
    </>
  );
}
