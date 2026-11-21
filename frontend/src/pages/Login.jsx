import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { errorMessage } from '../api/axios';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const u = await login(form.email, form.password);
      navigate(location.state?.from || (u.role === 'RECRUITER' ? '/recruiter' : '/candidate'), { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Login failed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit} style={{animation:'fadeIn .4s ease'}}>
        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:'1rem'}}>
          <Link to="/" className="brand" style={{justifyContent:'center',fontSize:'1.3rem'}}>
            <span className="brand-mark" style={{width:40,height:40,fontSize:'1.2rem',borderRadius:12}}>S</span>
            SmartHire <span className="brand-ai">AI</span>
          </Link>
          <p className="muted small" style={{marginTop:'.4rem'}}>AI-powered recruitment platform</p>
        </div>

        <h2 style={{textAlign:'center',marginBottom:'.2rem'}}>Welcome back 👋</h2>
        <p className="muted center-text small" style={{marginTop:0}}>Sign in to your account</p>

        <div className="gradient-divider" />

        <ErrorMessage message={error} />
        <label>Email address
          <input className="input" type="email" required autoComplete="email" value={form.email}
                 onChange={(e) => setForm({ ...form, email: e.target.value })}
                 placeholder="you@example.com" />
        </label>
        <label>Password
          <input className="input" type="password" required autoComplete="current-password" value={form.password}
                 onChange={(e) => setForm({ ...form, password: e.target.value })}
                 placeholder="Enter your password" />
        </label>
        <button className="btn btn-primary btn-block btn-lg" disabled={busy} style={{marginTop:'.5rem'}}>
          {busy ? '⏳ Signing in…' : '🚀 Log in'}
        </button>
        <p className="muted center-text" style={{fontSize:'.88rem'}}>
          New here? <Link to="/register" style={{color:'var(--purple2)',fontWeight:600}}>Create a free account →</Link>
        </p>
      </form>
    </div>
  );
}
