import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import brandIcon from '../assets/icon.png';
import { useApp } from '../context/AppContext.jsx';
import { apiRequest } from '../lib/api.js';

export default function AuthPage({ mode }) {
  const isSignup = mode === 'signup';
  const navigate = useNavigate();
  const { signIn } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', city: '' });

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    const body = isSignup
      ? { name: form.name.trim(), email: form.email.trim(), password: form.password, city: form.city.trim() }
      : { email: form.email.trim(), password: form.password };

    try {
      const result = await apiRequest(`/auth/${mode}`, { method: 'POST', body });
      signIn(result);
      navigate('/');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-column">
        <div className="auth-logo" aria-label="Saadh Sangat">
          <img src={brandIcon} alt="" />
          <span>Saadh Sangat</span>
        </div>
        <h1>{isSignup ? 'Create account' : 'Sign in'}</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          {isSignup && <label className="form-field"><span>Your name</span><input name="name" value={form.name} onChange={updateField} autoComplete="name" required maxLength={60} /></label>}
          <label className="form-field"><span>Email</span><input type="email" name="email" value={form.email} onChange={updateField} autoComplete="email" required /></label>
          <label className="form-field"><span>Password</span><input type="password" name="password" value={form.password} onChange={updateField} autoComplete={isSignup ? 'new-password' : 'current-password'} minLength={isSignup ? 8 : 1} required /></label>
          {isSignup && <label className="form-field"><span>City where you live now</span><input name="city" value={form.city} onChange={updateField} autoComplete="address-level2" required minLength={2} maxLength={80} /></label>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" className="button button-primary auth-submit" disabled={submitting}>{submitting ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}</button>
        </form>
        <p className="auth-switch">{isSignup ? 'Already have an account?' : 'New to Saadh Sangat?'} <Link to={isSignup ? '/login' : '/signup'}>{isSignup ? 'Sign in' : 'Create account'}</Link></p>
      </div>
    </main>
  );
}
