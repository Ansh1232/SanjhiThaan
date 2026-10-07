import { useCallback, useEffect, useState } from 'react';
import PageHeading from '../components/PageHeading.jsx';
import { useApp } from '../context/AppContext.jsx';
import { apiRequest } from '../lib/api.js';

const emptyListing = { name: '', gurudwara: '', address: '', city: '', schedule: '', type: 'Diwan', description: '' };

export default function Admin() {
  const { token, user } = useApp();
  const [users, setUsers] = useState([]);
  const [listing, setListing] = useState(emptyListing);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      const data = await apiRequest('/admin/users', { token });
      setUsers(data.users);
    } catch (loadError) {
      setError(loadError.message);
    }
  }, [token]);
  useEffect(() => { loadUsers(); }, [loadUsers]);

  function updateListing(event) { setListing((current) => ({ ...current, [event.target.name]: event.target.value })); }

  async function submitListing(event) {
    event.preventDefault(); setBusy(true); setNotice(''); setError('');
    try {
      await apiRequest('/sangat', { method: 'POST', token, body: listing });
      setListing(emptyListing); setNotice('Programme added.');
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function toggleAdmin(target) {
    setNotice(''); setError('');
    try {
      const { user: updated } = await apiRequest(`/admin/users/${target.id}`, { method: 'PATCH', token, body: { isAdmin: !target.isAdmin } });
      setUsers((current) => current.map((item) => item.id === updated.id ? updated : item));
      setNotice(`${updated.name} ${updated.isAdmin ? 'is now an administrator' : 'is no longer an administrator'}.`);
    } catch (e) { setError(e.message); }
  }

  return <div className="page-content admin-page">
    <PageHeading title="Manage sangat" />
    {(error || notice) && <div className={error ? 'admin-message admin-error' : 'admin-message admin-success'} role={error ? 'alert' : 'status'}>{error || notice}</div>}
    <section className="admin-section">
      <div className="admin-section-heading"><div><h2>Add a programme</h2></div></div>
      <form className="admin-listing-form" onSubmit={submitListing}>
        <label className="form-field"><span>Programme name</span><input name="name" value={listing.name} onChange={updateListing} required maxLength={100} /></label>
        <label className="form-field"><span>Gurudwara name</span><input name="gurudwara" value={listing.gurudwara} onChange={updateListing} required maxLength={120} /></label>
        <label className="form-field"><span>Address</span><input name="address" value={listing.address} onChange={updateListing} required maxLength={200} /></label>
        <label className="form-field"><span>City</span><input name="city" value={listing.city} onChange={updateListing} required maxLength={80} /></label>
        <label className="form-field"><span>Day and time</span><input name="schedule" value={listing.schedule} onChange={updateListing} placeholder="Every Sunday, 9:00 AM" required maxLength={160} /></label>
        <label className="form-field"><span>Kind of programme</span><select name="type" value={listing.type} onChange={updateListing}>{['Diwan', 'Kirtan', 'Path', 'Simran', 'Katha'].map((type) => <option key={type}>{type}</option>)}</select></label>
        <label className="form-field admin-description"><span>What happens at this programme?</span><textarea name="description" value={listing.description} onChange={updateListing} rows="3" required maxLength={500} /></label>
        <button className="button button-primary" disabled={busy}>{busy ? 'Saving…' : 'Add programme'}</button>
      </form>
    </section>
    <section className="admin-section user-management">
      <div className="admin-section-heading"><div><h2>Manage accounts</h2></div></div>
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Name</th><th>Email</th><th>City</th><th>Administrator</th></tr></thead><tbody>{users.map((account) => <tr key={account.id}>
        <td>{account.name}</td>
        <td>{account.email}{account.id === user.id && <small className="self-label">You</small>}</td>
        <td>{account.city}</td>
        <td><button className={`button button-small ${account.isAdmin ? 'button-remove-admin' : 'button-make-admin'}`} disabled={account.id === user.id} onClick={() => toggleAdmin(account)}>{account.isAdmin ? 'Remove admin' : 'Make admin'}</button></td>
      </tr>)}</tbody></table></div>
    </section>
  </div>;
}
