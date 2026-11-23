import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { improveResume, latestImprovement, getResumeText, saveResumeText, chatEditResume } from '../api/aiApi';
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
  const [activeTab, setActiveTab] = useState('editor'); // 'suggestions' or 'editor'

  // Editor and AI Chat state
  const [resumeText, setResumeText] = useState('');
  const [loadingText, setLoadingText] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatBusy, setChatBusy] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am your Gemini Resume Copilot. Ask me to rewrite your summary, add missing tech keywords, quantify achievements, or enhance any section!'
    }
  ]);

  const r = fresh || stored.data;

  // Load resume text for editor
  useEffect(() => {
    let mounted = true;
    setLoadingText(true);
    getResumeText()
      .then((txt) => {
        if (mounted && txt) setResumeText(txt);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoadingText(false);
      });
    return () => { mounted = false; };
  }, []);

  const run = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await improveResume();
      setFresh(res);
      setActiveTab('suggestions');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const handleSaveText = async () => {
    setSaving(true);
    setSaveSuccess('');
    setError('');
    try {
      await saveResumeText(resumeText);
      setSaveSuccess('Resume text updated successfully!');
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleSendChat = async (promptOverride) => {
    const msg = (promptOverride || chatInput).trim();
    if (!msg || chatBusy) return;

    const newHistory = [...chatMessages, { role: 'user', text: msg }];
    setChatMessages(newHistory);
    if (!promptOverride) setChatInput('');
    setChatBusy(true);

    try {
      const data = await chatEditResume(msg, resumeText);
      const replyText = data.reply || "I've reviewed your request and generated optimized resume content.";
      const suggested = data.suggestedText || "";
      setChatMessages([
        ...newHistory,
        {
          role: 'assistant',
          text: replyText,
          suggestedText: suggested,
          changesSummary: data.changesSummary
        }
      ]);
    } catch (e) {
      setChatMessages([
        ...newHistory,
        { role: 'assistant', text: 'Sorry, I encountered an issue updating the resume. Please try again.' }
      ]);
    } finally {
      setChatBusy(false);
    }
  };

  const handleApplySuggestion = (textToApply) => {
    if (!textToApply) return;
    setResumeText(textToApply);
    setSaveSuccess('AI content applied to editor! Click Save when done.');
    setTimeout(() => setSaveSuccess(''), 4000);
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>✨ AI Resume Copilot & Improvement</h1>
          <p className="muted">Live interactive resume editor, AI chat assistant, and ATS optimization suggestions.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <RunBar onRun={run} busy={busy} label="improvement" hasResult={Boolean(r)} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('editor')}
          style={{
            background: activeTab === 'editor' ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
            color: activeTab === 'editor' ? '#c084fc' : '#94a3b8',
            border: activeTab === 'editor' ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid transparent',
            padding: '0.6rem 1.2rem',
            borderRadius: '0.75rem',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          📝 Live Editor & AI Chat
        </button>
        <button
          onClick={() => setActiveTab('suggestions')}
          style={{
            background: activeTab === 'suggestions' ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
            color: activeTab === 'suggestions' ? '#c084fc' : '#94a3b8',
            border: activeTab === 'suggestions' ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid transparent',
            padding: '0.6rem 1.2rem',
            borderRadius: '0.75rem',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ✨ ATS Analysis & Rewrites {r && '✓'}
        </button>
      </div>

      <ErrorMessage message={error} />
      {saveSuccess && (
        <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.4)', color: '#4ade80', padding: '0.75rem 1.25rem', borderRadius: '0.75rem', marginBottom: '1rem' }}>
          {saveSuccess}
        </div>
      )}

      {/* TAB 1: RESUME EDITOR & AI CHAT */}
      {activeTab === 'editor' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Left Column: Editor */}
          <div className="card" style={{ padding: '1.5rem', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f8fafc' }}>Resume Text Editor</h3>
                <span className="muted small">Changes will update your stored profile resume text.</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => navigator.clipboard.writeText(resumeText)}
                  className="btn btn-sm btn-ghost"
                  title="Copy to clipboard"
                >
                  📋 Copy
                </button>
                <button
                  onClick={handleSaveText}
                  disabled={saving || loadingText}
                  className="btn btn-sm btn-primary"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', borderColor: '#8b5cf6' }}
                >
                  {saving ? 'Saving…' : '💾 Save Changes'}
                </button>
              </div>
            </div>

            {loadingText ? (
              <Loader label="Loading resume text…" />
            ) : (
              <div>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste or type your resume content here..."
                  rows={20}
                  style={{
                    width: '100%',
                    fontFamily: 'monospace, Consolas, sans-serif',
                    fontSize: '0.9rem',
                    lineHeight: '1.5',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    background: 'rgba(2, 6, 23, 0.7)',
                    color: '#e2e8f0',
                    border: '1px solid rgba(255,255,255,0.1)',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', color: '#64748b', fontSize: '0.8rem' }}>
                  <span>{resumeText.split(/\s+/).filter(Boolean).length} words</span>
                  <span>{resumeText.length} characters</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: AI Chatbot Copilot */}
          <div className="card" style={{ padding: '1.5rem', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(16px)', border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: '1rem', display: 'flex', flexDirection: 'column', height: '620px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.8rem' }}>
              <span style={{ fontSize: '1.4rem' }}>🤖</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>Gemini AI Copilot</h3>
                <span className="muted small">Instruct the AI to rewrite or enhance your resume</span>
              </div>
            </div>

            {/* Quick action chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.8rem' }}>
              <button
                onClick={() => handleSendChat("Rewrite my professional summary to be more impactful and senior-level")}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', fontSize: '0.75rem', padding: '0.3rem 0.6rem', borderRadius: '0.5rem', cursor: 'pointer' }}
              >
                ⚡ Polish Summary
              </button>
              <button
                onClick={() => handleSendChat("Add key in-demand cloud, DevOps, and backend skills")}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', fontSize: '0.75rem', padding: '0.3rem 0.6rem', borderRadius: '0.5rem', cursor: 'pointer' }}
              >
                🎯 Add ATS Keywords
              </button>
              <button
                onClick={() => handleSendChat("Quantify my experience bullet points with metrics and percentages")}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', fontSize: '0.75rem', padding: '0.3rem 0.6rem', borderRadius: '0.5rem', cursor: 'pointer' }}
              >
                📈 Quantify Metrics
              </button>
            </div>

            {/* Chat Messages */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.3rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {chatMessages.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '90%',
                    background: m.role === 'user' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(30, 41, 59, 0.8)',
                    color: '#f8fafc',
                    padding: '0.8rem 1rem',
                    borderRadius: m.role === 'user' ? '1rem 1rem 0.2rem 1rem' : '1rem 1rem 1rem 0.2rem',
                    border: '1px solid rgba(255,255,255,0.08)',
                    fontSize: '0.88rem'
                  }}
                >
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{m.text}</p>
                  {m.changesSummary && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#a7f3d0' }}>
                      💡 {m.changesSummary}
                    </div>
                  )}
                  {m.suggestedText && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <button
                        onClick={() => handleApplySuggestion(m.suggestedText)}
                        style={{
                          background: 'rgba(34, 197, 94, 0.2)',
                          border: '1px solid rgba(34, 197, 94, 0.5)',
                          color: '#4ade80',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          fontSize: '0.78rem',
                          fontWeight: 600
                        }}
                      >
                        ✅ Apply To Resume Editor
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {chatBusy && (
                <div style={{ alignSelf: 'flex-start', background: 'rgba(30, 41, 59, 0.8)', padding: '0.6rem 1rem', borderRadius: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                  Thinking & optimizing with Gemini...
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.8rem' }}>
              <input
                className="input"
                style={{ flex: 1, padding: '0.6rem 0.9rem', fontSize: '0.9rem' }}
                placeholder="Ask Gemini to edit or improve (e.g. 'Add React hooks experience')..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              />
              <button
                onClick={() => handleSendChat()}
                disabled={chatBusy || !chatInput.trim()}
                className="btn btn-primary"
                style={{ padding: '0.6rem 1.1rem', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORIGINAL ATS SUGGESTIONS & BEFORE/AFTER */}
      {activeTab === 'suggestions' && (
        stored.loading ? <Loader /> : !r ? (
          <div className="empty">
            <h3>No suggestions yet</h3>
            <p>Click "Run improvement" above or upload a resume on your <Link to="/candidate">dashboard</Link>.</p>
          </div>
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
        )
      )}
    </>
  );
}
