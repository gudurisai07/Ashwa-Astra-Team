import { useState } from 'react';
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
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    setBusy(true);
    try {
      const u = await register({ ...form, companyName: form.role === 'RECRUITER' ? form.companyName : null });
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
