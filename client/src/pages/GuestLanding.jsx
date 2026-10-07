import { Link } from 'react-router-dom';
import brandIcon from '../assets/icon.png';
import sisGanjBackground from '../assets/Gurdwara-Sis-Ganj-Sahib-In-New-Delhi-India.webp';

export default function GuestLanding() {
  return (
    <main className="guest-landing" style={{ backgroundImage: `linear-gradient(90deg, #071521d9, #101b20a8 52%, #131910a6), url(${sisGanjBackground})` }}>
      <header className="guest-nav">
        <Link to="/" className="guest-brand" aria-label="Saadh Sangat home">
          <img src={brandIcon} alt="" />
          <span>Saadh Sangat</span>
        </Link>
        <nav aria-label="Main navigation">
          <Link to="/hukamnama">Hukamnama Sahib</Link>
          <Link to="/login" className="guest-sign-in">Sign in</Link>
        </nav>
      </header>

      <section className="guest-hero" aria-labelledby="guest-title">
        <h1 id="guest-title">Saadh Sang</h1>
        <p lang="pa">ਸਾਧ ਸੰਗਤਿ ਅਸਥਾਨ ਜਗਮਗ ਨੂਰ ਹੈ।</p>
        <div className="guest-actions">
          <Link to="/signup" className="guest-action-primary">Create account</Link>
          <Link to="/hukamnama" className="guest-action-secondary">Read Hukamnama Sahib</Link>
        </div>
      </section>
    </main>
  );
}
