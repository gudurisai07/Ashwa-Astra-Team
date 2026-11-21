import { useRef, useState } from 'react';
import { uploadResume } from '../api/applicationApi';
import { errorMessage } from '../api/axios';
import ErrorMessage from './ErrorMessage';

const MAX = 5 * 1024 * 1024;

export default function ResumeUpload({ onUploaded }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    setError('');
    setOk('');
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) return setError('Only PDF files are supported.');
    if (file.size > MAX) return setError('File is too large. Maximum size is 5 MB.');
    setBusy(true);
    try {
      const res = await uploadResume(file);
      setOk(`Uploaded ${res.resumeFileName}`);
      onUploaded?.(res);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <input ref={input} type="file" accept="application/pdf,.pdf" hidden onChange={onFile} />
      <button className="btn btn-primary" disabled={busy} onClick={() => input.current?.click()}>
        {busy ? 'Uploading…' : 'Upload PDF resume'}
      </button>
      {ok && <span className="ok-text"> {ok}</span>}
      <ErrorMessage message={error} />
    </div>
  );
}
