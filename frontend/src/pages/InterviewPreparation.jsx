import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { interviewQuestions, latestInterview } from '../api/aiApi';
import { errorMessage } from '../api/axios';
import { Block, Disclaimer, RunBar } from '../components/AiBits';
import ErrorMessage from '../components/ErrorMessage';
import JobPicker from '../components/JobPicker';

function QuestionGroup({ title, items }) {
  return (
    <Block title={title}>
      {(items || []).map((q, i) => (
        <details key={i} className="qa">
          <summary>{i + 1}. {q.question}</summary>
          <p className="prewrap muted">{q.guidance}</p>
        </details>
      ))}
    </Block>
  );
}

export default function InterviewPreparation() {
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
    latestInterview(jobId).then((r) => alive && setResult(r)).catch(() => {});
    return () => { alive = false; };
  }, [jobId]);

  const run = async () => {
    setBusy(true);
    setError('');
    try {
      setResult(await interviewQuestions(jobId));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="page-head"><div><h1>Interview Preparation</h1><p className="muted">Questions tailored to the job and your skills.</p></div></div>
      <div className="card row wrap">
        <div className="grow"><JobPicker value={jobId} onChange={(v) => setParams(v ? { jobId: v } : {})} /></div>
        {jobId && <RunBar onRun={run} busy={busy} label="generator" hasResult={Boolean(result)} />}
      </div>
      <ErrorMessage message={error} />
      {result && (
        <>
          <QuestionGroup title="Technical questions" items={result.technical} />
          <QuestionGroup title="HR questions" items={result.hr} />
          <QuestionGroup title="Situation-based questions" items={result.situational} />
          <Disclaimer result={result} />
        </>
      )}
    </>
  );
}
