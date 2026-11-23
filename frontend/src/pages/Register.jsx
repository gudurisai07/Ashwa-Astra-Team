import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { uploadProfileImage } from '../api/authApi';
import { errorMessage } from '../api/axios';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'CANDIDATE', companyName: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const fileRef = useRef();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  // 100% Strong Password Verification Rules
  const passwordCriteria = useMemo(() => {
    const p = form.password || '';
    return {
      hasLength: p.length >= 8,
      hasUpper: /[A-Z]/.test(p),
      hasLower: /[a-z]/.test(p),
      hasNumber: /[0-9]/.test(p),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p),
    };
  }, [form.password]);

  const scoreCount = Object.values(passwordCriteria).filter(Boolean).length;
  const strengthPercent = Math.round((scoreCount / 5) * 100);
  const isPassword100Percent = strengthPercent === 100;

  const handleAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5 MB.');
      return;
    }
    setError('');

    // Local Preview
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);

    // Upload to Cloudinary immediately
    setUploadingImg(true);
    try {
      const res = await uploadProfileImage(file);
      if (res?.url) {
        setProfileImageUrl(res.url);
      }
    } catch (err) {
      // Local fallback preview will still work
      console.warn('Image upload deferred to submission or using preview');
    } finally {
      setUploadingImg(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isPassword100Percent) {
      setError('Please meet all 5 password requirements to reach 100% password verification.');
      return;
    }

    setBusy(true);
    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        companyName: form.role === 'RECRUITER' ? (form.companyName || '').trim() : null,
        profileImageUrl: profileImageUrl || (avatarPreview ? avatarPreview : null),
      };

      const u = await register(payload);
      navigate(u.role === 'RECRUITER' ? '/recruiter' : '/candidate', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Registration failed. Check details and try again.'));
    } finally {
      setBusy(false);
    }
  };

  const getMeterColor = () => {
    if (strengthPercent === 100) return '#10b981'; // Emerald
    if (strengthPercent >= 60) return '#f59e0b';  // Amber
    return '#ef4444'; // Red
  };

  const getMeterLabel = () => {
    if (strengthPercent === 100) return '100% Verified Strong Password ✅';
    if (strengthPercent >= 80) return '80% Good — Almost there';
    if (strengthPercent >= 60) return '60% Moderate — Needs more diversity';
    if (strengthPercent >= 40) return '40% Weak';
    if (strengthPercent > 0) return '20% Very Weak';
    return '0% Enter password';
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit} style={{ maxWidth: '480px' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '.5rem' }}>
          <Link to="/" className="brand" style={{ justifyContent: 'center', fontSize: '1.3rem' }}>
            <span className="brand-mark" style={{ width: 40, height: 40, fontSize: '1.2rem', borderRadius: 12 }}>S</span>
            SmartHire <span className="brand-ai">AI</span>
          </Link>
        </div>
        <h2 style={{ textAlign: 'center', margin: '0.2rem 0' }}>Create your account ✨</h2>
        <p className="muted center-text small" style={{ marginTop: 0 }}>Join the AI-powered hiring platform</p>
        <div className="gradient-divider" />
        <ErrorMessage message={error} />

        {/* Role Switcher */}
        <div className="segmented" role="radiogroup" aria-label="Account type" style={{ marginBottom: '1.25rem' }}>
          {['CANDIDATE', 'RECRUITER'].map((r) => (
            <button
              type="button"
              key={r}
              role="radio"
              aria-checked={form.role === r}
              className={form.role === r ? 'seg active' : 'seg'}
              onClick={() => setForm({ ...form, role: r })}
            >
              {r === 'CANDIDATE' ? '👤 I am a candidate' : '🏢 I am a recruiter'}
            </button>
          ))}
        </div>

        {/* Profile / Company Logo Image Upload (Supported for BOTH Candidate & Recruiter) */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          marginBottom: '1.25rem', padding: '1rem',
          background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(168, 85, 247, 0.3)',
          borderRadius: '1rem'
        }}>
          <div
            onClick={() => fileRef.current.click()}
            style={{
              width: 82, height: 82, borderRadius: form.role === 'RECRUITER' ? '18px' : '50%',
              background: avatarPreview ? `url(${avatarPreview}) center/cover` : 'rgba(15, 23, 42, 0.6)',
              border: '2px solid rgba(168, 85, 247, 0.5)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 30, color: '#94a3b8',
              overflow: 'hidden', flexShrink: 0,
              boxShadow: '0 4px 16px rgba(124, 58, 237, 0.25)',
              position: 'relative'
            }}
            title={form.role === 'RECRUITER' ? 'Upload Company Logo / Photo' : 'Upload Profile Photo'}
          >
            {!avatarPreview && (form.role === 'RECRUITER' ? '🏢' : '📷')}
            {uploadingImg && (
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700
              }}>
                Uploading…
              </div>
            )}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#c084fc', marginTop: 8, fontWeight: 600 }}>
            {avatarPreview
              ? (uploadingImg ? '☁️ Uploading to Cloudinary…' : '✓ Image ready (click to change)')
              : form.role === 'RECRUITER' ? '🏢 Add company logo / photo (Cloudinary)' : '📷 Add profile photo (Cloudinary)'}
          </span>
          <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>
            Stores securely on Cloudinary CDN
          </span>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatar} />
        </div>

        <label>
          Full name
          <input className="input" required value={form.fullName} onChange={set('fullName')} placeholder="e.g. Sai Kumar" />
        </label>

        {form.role === 'RECRUITER' && (
          <label>
            Company name
            <input className="input" required value={form.companyName} onChange={set('companyName')} placeholder="e.g. Northwind Tech Ltd." />
          </label>
        )}

        <label>
          Email address
          <input className="input" type="email" required value={form.email} onChange={set('email')} placeholder="you@example.com" />
        </label>

        {/* 100% Verifying Password Section */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Password (100% Verification Required)</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: getMeterColor() }}>
              {strengthPercent}%
            </span>
          </label>
          <input
            className="input"
            type="password"
            required
            value={form.password}
            onChange={set('password')}
            placeholder="e.g. Smart@2026Hire"
            style={{
              borderColor: isPassword100Percent ? 'rgba(16, 185, 129, 0.6)' : undefined,
              boxShadow: isPassword100Percent ? '0 0 10px rgba(16, 185, 129, 0.25)' : undefined
            }}
          />

          {/* Progress Bar */}
          <div style={{
            height: '6px', width: '100%', background: 'rgba(255,255,255,0.08)',
            borderRadius: '9999px', marginTop: '0.5rem', overflow: 'hidden'
          }}>
            <div style={{
              height: '100%', width: `${strengthPercent}%`,
              background: `linear-gradient(90deg, ${getMeterColor()}, ${strengthPercent === 100 ? '#38bdf8' : getMeterColor()})`,
              transition: 'width 0.3s ease, background 0.3s ease'
            }} />
          </div>

          <div style={{ fontSize: '0.76rem', color: getMeterColor(), marginTop: '0.35rem', fontWeight: 600 }}>
            {getMeterLabel()}
          </div>

          {/* 5-Rule Checklist */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem',
            marginTop: '0.65rem', padding: '0.75rem',
            background: 'rgba(15, 23, 42, 0.4)', borderRadius: '0.65rem',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div style={{ fontSize: '0.74rem', color: passwordCriteria.hasLength ? '#4ade80' : '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>{passwordCriteria.hasLength ? '✓' : '○'}</span> Minimum 8 characters
            </div>
            <div style={{ fontSize: '0.74rem', color: passwordCriteria.hasUpper ? '#4ade80' : '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>{passwordCriteria.hasUpper ? '✓' : '○'}</span> Capital letter (A-Z)
            </div>
            <div style={{ fontSize: '0.74rem', color: passwordCriteria.hasLower ? '#4ade80' : '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>{passwordCriteria.hasLower ? '✓' : '○'}</span> Small letter (a-z)
            </div>
            <div style={{ fontSize: '0.74rem', color: passwordCriteria.hasNumber ? '#4ade80' : '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>{passwordCriteria.hasNumber ? '✓' : '○'}</span> Number (0-9)
            </div>
            <div style={{ fontSize: '0.74rem', color: passwordCriteria.hasSpecial ? '#4ade80' : '#64748b', gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>{passwordCriteria.hasSpecial ? '✓' : '○'}</span> Special symbol (!@#$%^&*...)
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          className="btn btn-primary btn-block btn-lg"
          disabled={busy || !isPassword100Percent}
          style={{
            marginTop: '.5rem',
            opacity: isPassword100Percent ? 1 : 0.6,
            cursor: isPassword100Percent ? 'pointer' : 'not-allowed',
            background: isPassword100Percent
              ? 'linear-gradient(135deg, #10b981 0%, #6366f1 100%)'
              : 'rgba(255,255,255,0.08)'
          }}
        >
          {busy
            ? '⏳ Creating account…'
            : isPassword100Percent
              ? '🚀 Create Account (Verified 100%)'
              : '🔒 100% Password Verification Required'}
        </button>

        <p className="muted center-text" style={{ fontSize: '.88rem', marginTop: '1rem' }}>
          Already registered? <Link to="/login" style={{ color: 'var(--purple2)', fontWeight: 600 }}>Log in →</Link>
        </p>
      </form>
    </div>
  );
}
