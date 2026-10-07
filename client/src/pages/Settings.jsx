import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeading from '../components/PageHeading.jsx';
import { useApp } from '../context/AppContext.jsx';

export default function Settings() {
  const { user, updateProfile, signOut } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState(user.name);
  const [city, setCity] = useState(user.city);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function save(event) {
    event.preventDefault();
    setSaving(true); setMessage(''); setError('');
    try { await updateProfile({ name, city }); setMessage('Your details have been saved.'); }
    catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  }

  function handleSignOut() {
    signOut();
    navigate('/');
  }

  return <div className="page-content settings-page">
    <PageHeading title="Your account" />
    <form className="form-card profile-form" onSubmit={save}>
      <label className="form-field"><span>Your name</span><input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={60} /></label>
      <label className="form-field"><span>Email address</span><input value={user.email} disabled /></label>
      <label className="form-field"><span>City where you live now</span><input value={city} onChange={(event) => setCity(event.target.value)} required minLength={2} maxLength={80} /></label>
      {error && <p className="form-error" role="alert">{error}</p>}{message && <p className="form-success" role="status">{message}</p>}
      <div className="form-actions"><button className="button button-primary" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button></div>
    </form>
    <section className="account-signout">
      <button type="button" className="button button-secondary" onClick={handleSignOut}>Sign out</button>
    </section>
  </div>;
}
