import { useApp } from '../context/AppContext.jsx';

export default function SessionCard({ session, onRsvp }) {
  const { user, token } = useApp();
  return (
    <article className={`session-card${compact ? ' compact' : ''}`}>
      <div className="session-main">
        <h2>{session.name}</h2>
        {session.description && <p className="session-description">{session.description}</p>}
        <div className="session-meta">
          <span>{session.schedule}</span>
          <span>{session.type}</span>
        </div>
        <div className="session-card-bottom">
          <span className="host-name">At {session.gurudwara}</span>
          <button
            type="button"
            className={`button button-small ${session.isAttending ? 'button-joined' : 'button-outline'}`}
            onClick={() => user && token && onRsvp(session.id)}
          >
            {session.isAttending ? 'Attending' : "I'll attend"}
          </button>
        </div>
      </div>
    </article>
  );
}
