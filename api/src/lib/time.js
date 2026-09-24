/* Time-zone helpers. All scheduling data is stored as local wall-clock
   date + time in the program time zone; these helpers convert to and from
   real instants using Intl, so daylight-saving transitions are handled by
   the platform's tz database rather than fixed offsets. */

const pad2 = (n) => String(n).padStart(2, '0');

export const toMins = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
export const fromMins = (m) => pad2(Math.floor(m / 60)) + ':' + pad2(m % 60);

export function addDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}
export function dow(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}
export function daysBetween(a, b) {
  const pa = a.split('-').map(Number), pb = b.split('-').map(Number);
  return Math.round((Date.UTC(pb[0], pb[1] - 1, pb[2]) - Date.UTC(pa[0], pa[1] - 1, pa[2])) / 86400000);
}

const fmtCache = new Map();
function partsFormatter(tz) {
  if (!fmtCache.has(tz)) {
    fmtCache.set(tz, new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
    }));
  }
  return fmtCache.get(tz);
}

/** Local {date, time, mins} for an instant in the given zone. */
export function zoned(instant, tz) {
  const p = {};
  for (const { type, value } of partsFormatter(tz).formatToParts(instant)) p[type] = value;
  const date = p.year + '-' + p.month + '-' + p.day;
  const time = p.hour + ':' + p.minute;
  return { date, time, mins: toMins(time) };
}

function offsetMinutes(instant, tz) {
  const p = {};
  for (const { type, value } of partsFormatter(tz).formatToParts(instant)) p[type] = value;
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return Math.round((asUtc - instant.getTime()) / 60000);
}

/** Instant for a local wall-clock date/time. Nonexistent times (spring-forward
    gap) resolve forward; ambiguous times (fall-back) resolve to the first. */
export function localToInstant(date, time, tz) {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  let off = offsetMinutes(new Date(guess), tz);
  let inst = guess - off * 60000;
  const off2 = offsetMinutes(new Date(inst), tz);
  if (off2 !== off) inst = guess - off2 * 60000;
  return new Date(inst);
}

export function tzAbbrev(date, time, tz) {
  const inst = localToInstant(date, time, tz);
  const s = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'short' }).formatToParts(inst);
  return (s.find((x) => x.type === 'timeZoneName') || {}).value || tz;
}

export function fmtDateLong(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}
export function fmtTime(t) {
  let [h, mn] = t.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return h + ':' + pad2(mn) + ' ' + ap;
}
