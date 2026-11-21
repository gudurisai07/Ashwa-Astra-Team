import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { errorMessage } from '../api/axios';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'CANDIDATE', companyName: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [avatar, setAvatar] = useState(null);       // File object
  const [avatarPreview, setAvatarPreview] = useState(null); // Data URL for preview
  const fileRef = useRef();
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return; }
    if (file.size > 2 * 1024 * 1024) { setError('Image must be under 2 MB.'); return; }
    setError('');
    setAvatar(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    setBusy(true);
    try {
      const payload = new FormData();
      payload.append('fullName', form.fullName);
      payload.append('email', form.email);
      payload.append('password', form.password);
      payload.append('role', form.role);
      if (form.role === 'RECRUITER') payload.append('companyName', form.companyName || '');
      if (avatar) payload.append('profileImage', avatar);

      // Fall back to JSON if backend doesn't yet support multipart on /auth/register
      let u;
      try {
        u = await register(payload, true); // pass flag to use multipart
      } catch {
        u = await register({ ...form, companyName: form.role === 'RECRUITER' ? form.companyName : null });
      }
      navigate(u.role === 'RECRUITER' ? '/recruiter' : '/candidate', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Registration failed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={submit}>
        <Link to="/" className="brand"><span className="brand-mark">S</span> SmartHire <span className="brand-ai">AI</span></Link>
        <h2>Create your account</h2>
        <ErrorMessage message={error} />

        {/* Profile photo */}
        {form.role === 'CANDIDATE' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem' }}>
            <div
              onClick={() => fileRef.current.click()}
              style={{
                width: 90, height: 90, borderRadius: '50%',
                background: avatarPreview ? `url(${avatarPreview}) center/cover` : 'var(--color-surface, #1e293b)',
                border: '2px dashed var(--color-primary, #6366f1)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, color: 'var(--color-muted, #94a3b8)',
                overflow: 'hidden', flexShrink: 0,
              }}
              title="Click to upload profile photo"
            >
              {!avatarPreview && '📷'}
            </div>
            <span style={{ fontSize: 12, color: 'var(--color-muted, #94a3b8)', marginTop: 6 }}>
              {avatarPreview ? 'Click to change photo' : 'Add profile photo (optional)'}
            </span>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatar} />
          </div>
        )}

        <div className="segmented" role="radiogroup" aria-label="Account type">
          {['CANDIDATE', 'RECRUITER'].map((r) => (
            <button type="button" key={r} role="radio" aria-checked={form.role === r}
                    className={form.role === r ? 'seg active' : 'seg'} onClick={() => setForm({ ...form, role: r })}>
              {r === 'CANDIDATE' ? 'I am a candidate' : 'I am a recruiter'}
            </button>
          ))}
        </div>
        <label>Full name<input className="input" required value={form.fullName} onChange={set('fullName')} /></label>
        <label>Email<input className="input" type="email" required value={form.email} onChange={set('email')} /></label>
        <label>Password (min 8 characters)
          <input className="input" type="password" required minLength={8} value={form.password} onChange={set('password')} />
        </label>
        {form.role === 'RECRUITER' && (
          <label>Company name<input className="input" value={form.companyName} onChange={set('companyName')} /></label>
        )}
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
        <p className="muted center-text">Already registered? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  );
}
