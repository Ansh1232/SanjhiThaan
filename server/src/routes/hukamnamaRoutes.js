import { Router } from 'express';

const router = Router();

function indiaDateParts(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: 'numeric', day: 'numeric',
  }).formatToParts(date);
  return Object.fromEntries(parts.filter((part) => part.type !== 'literal').map(({ type, value }) => [type, value]));
}

function previousDate({ year, month, day }) {
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day) - 1));
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

async function fetchHukamnama({ year, month, day }) {
  const sourceUrl = `https://api.banidb.com/v2/hukamnamas/${year}/${month}/${day}`;
  const response = await fetch(sourceUrl, { signal: AbortSignal.timeout(10000) });
  const data = await response.json();
  return { sourceUrl, response, data };
}

router.get('/today', async (req, res) => {
  const requestedDate = indiaDateParts(new Date());

  try {
    let result = await fetchHukamnama(requestedDate);
    let isPreviousDayFallback = false;

    if (result.response.status === 404 || result.data.error) {
      result = await fetchHukamnama(previousDate(requestedDate));
      isPreviousDayFallback = true;
    }

    if (!result.response.ok || result.data.error) {
      console.error('Hukamnama source returned an unsuccessful response:', result.response.status);
      return res.status(result.response.status === 404 ? 404 : 502).json({ message: 'The Hukamnama source is temporarily unavailable.' });
    }

    res.json({
      source: 'BaniDB',
      sourceUrl: result.sourceUrl,
      date: result.data.date,
      isPreviousDayFallback,
      shabads: result.data.shabads,
    });
  } catch (error) {
    console.error('Hukamnama source request failed:', error.message);
    res.status(502).json({ message: 'Unable to load today’s Hukamnama right now.' });
  }
});

export default router;
