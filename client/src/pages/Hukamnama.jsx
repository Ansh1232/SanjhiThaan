import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api.js';

function formatFallbackDate(date) {
  if (!date) return 'PREVIOUS DAY';
  return `PREVIOUS DAY · ${new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(Date.UTC(date.year, date.month - 1, date.date)))}`;
}

export default function Hukamnama() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    apiRequest('/hukamnama/today')
      .then((data) => { if (active) setResult(data); })
      .catch(() => { if (active) setError('Hukamnama could not be loaded. Please try again.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refreshKey]);

  const shabads = result?.shabads || [];
  const verses = shabads.flatMap((shabad) => shabad.verses || []);
  const info = shabads[0]?.shabadInfo;
  const gregorianDate = result?.date?.gregorian;

  return (
    <div className="page-content hukamnama-page">
      <section className="hukam-card hukam-page-card">
        <div className="hukam-topline">
          <div className="hukam-heading-group">
            <h1 className="hukam-heading">Hukamnama Sahib</h1>
            <p className="hukam-label" lang="pa">ਧੁਰ ਕੀ ਬਾਣੀ ਆਈ ॥ ਤਿਨਿ ਸਗਲੀ ਚਿੰਤ ਮਿਟਾਈ ॥</p>
          </div>
          <span className="hukam-date">{result?.isPreviousDayFallback ? formatFallbackDate(gregorianDate) : 'DAILY HUKAMNAMA'}</span>
        </div>

        {loading ? (
          <div className="hukam-state">Loading today's Hukamnama…</div>
        ) : error ? (
          <div className="hukam-state hukam-error"><div><strong>{error}</strong><button type="button" onClick={() => { setLoading(true); setError(''); setRefreshKey((value) => value + 1); }}>Try again</button></div></div>
        ) : verses.length ? (
          <div className="hukam-result">
            <div className="hukam-meta">{info?.raag?.unicode || 'Sri Guru Granth Sahib Ji'}{info?.writer?.english ? ` · ${info.writer.english}` : ''}{info?.pageNo ? ` · Ang ${info.pageNo}` : ''}</div>
            <div className="hukam-verses">
              {verses.map((item) => (
                <article className="hukam-verse" key={item.verseId}>
                  <p lang="pa">{item.verse?.unicode || item.verse?.gurmukhi}</p>
                  {item.translation?.en?.bdb && <span>{item.translation.en.bdb}</span>}
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="hukam-state">Today's Hukamnama is not available right now.</div>
        )}
      </section>
    </div>
  );
}