import PageHeading from '../components/PageHeading.jsx';
import SessionCard from '../components/SessionCard.jsx';
import { useApp } from '../context/AppContext.jsx';

export default function Sessions() {
  const { user, sangat, toggleAttendance } = useApp();
  const visibleSessions = sangat.filter((listing) => listing.city === user.city);

  return (
    <div className="page-content sessions-page">
      <PageHeading title={`Find sangat in ${user.city}`} />
      <div className="results-heading">{visibleSessions.length} {visibleSessions.length === 1 ? 'programme' : 'programmes'}</div>
      {visibleSessions.length ? (
        <div className="session-list">
          {visibleSessions.map((listing) => <SessionCard key={listing.id} session={listing} onRsvp={toggleAttendance} />)}
        </div>
      ) : <p className="plain-empty-state">No sangat listings for this city yet.</p>}
    </div>
  );
}
