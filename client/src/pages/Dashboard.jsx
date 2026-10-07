import PageHeading from '../components/PageHeading.jsx';
import { useApp } from '../context/AppContext.jsx';

export default function Dashboard() {
  const { user, sangat, toggleAttendance } = useApp();
  const citySangat = sangat.filter((listing) => listing.city.toLowerCase() === user.city.toLowerCase());

  return (
    <div className="page-content dashboard-page">
      <PageHeading title={`Sangat in ${user.city}`} />
      {citySangat.length ? (
        <div className="dashboard-programme-list">
          {citySangat.slice(0, 2).map((listing) => (
            <article className="dashboard-programme-row" key={listing.id}>
              <div className="dashboard-programme-name">{listing.name}</div>
              <div className="dashboard-programme-gurdwara">{listing.gurudwara}</div>
              <div className="dashboard-programme-time">{listing.schedule}</div>
              <div className="dashboard-programme-type">{listing.type}</div>
              <button
                type="button"
                className={`button dashboard-attend${listing.isAttending ? ' is-attending' : ' button-primary'}`}
                onClick={() => toggleAttendance(listing.id)}
              >
                {listing.isAttending ? 'Attending' : "I'll attend"}
              </button>
            </article>
          ))}
        </div>
      ) : (
        <p className="dashboard-empty">No sangat programmes are listed in {user.city} yet.</p>
      )}
    </div>
  );
}
