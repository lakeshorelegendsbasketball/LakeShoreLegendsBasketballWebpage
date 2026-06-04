/* global React, SectionHead, LSL */
const { useState: useStateBk, useEffect: useEffectBk } = React;

const LSL_POLICY = [
  'Cancellations made within 48 hours of a session are subject to a 50% retainer.',
  'Cancellations made more than 48 hours in advance receive a 100% refund.',
  'Training session times and availability are subject to change.',
];

const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const pad2 = (n) => String(n).padStart(2, '0');
const isoOf = (dt) => dt.getFullYear() + '-' + pad2(dt.getMonth() + 1) + '-' + pad2(dt.getDate());

/* Three public services. "dated" services use the posted-opening calendar and
   forward to Stripe. The "request" service collects a day-of-week + time
   preference and emails the coach + family — no payment. */
const SERVICES = [
  { key: '1on1', name: '1-on-1 Private Training Session', icon: 'user', meta: 'One athlete · 60 min', mode: 'dated', typeId: 'p1',
    payLink: 'https://buy.stripe.com/00w9AM0rxcFigGc4M10Jq01' },
  { key: 'small', name: 'Small Group Training Session', icon: 'users', meta: 'Bring your own group', mode: 'request' },
  { key: 'class', name: 'Group Basketball Classes', icon: 'graduation-cap', meta: 'Open enrollment', mode: 'soon' },
];

const REQ_TIMES = (() => {
  const out = [];
  for (let h = 8; h <= 20; h++) for (const m of ['00', '30']) out.push(pad2(h) + ':' + m);
  return out;
})();

async function notifyCoach(rec) {
  const key = LSL.getWeb3Key();
  if (!key) return;
  const loc = rec.mode !== 'request' ? LSL.locById(rec.locId) : {};
  let subject, message;
  if (rec.mode === 'request') {
    subject = 'New Group Request — ' + rec.athlete;
    message = [
      'Group Request: ' + rec.athlete,
      rec.serviceName + ' · ' + rec.players + ' players',
      DOW[rec.dow] + 's · ' + LSL.fmtTime(rec.reqTime),
      'Parent: ' + rec.parent,
      rec.email + (rec.phone ? ' · ' + rec.phone : ''),
      rec.age ? 'Age/Grade: ' + rec.age : '',
      rec.focus ? 'Focus: ' + rec.focus : '',
      rec.notes ? 'Notes: ' + rec.notes : '',
    ].filter(Boolean).join('\n');
  } else {
    subject = 'New Booking — ' + rec.athlete + ' · ' + LSL.fmtDate(rec.date);
    message = [
      'New Booking: ' + rec.athlete,
      rec.serviceName,
      LSL.fmtDate(rec.date) + ' · ' + LSL.fmtTime(rec.time),
      loc.name || '',
      'Parent: ' + rec.parent,
      rec.email + (rec.phone ? ' · ' + rec.phone : ''),
      rec.age ? 'Age/Grade: ' + rec.age : '',
      rec.focus ? 'Focus: ' + rec.focus : '',
      rec.notes ? 'Notes: ' + rec.notes : '',
    ].filter(Boolean).join('\n');
  }
  try {
    await fetch('https://api.web3forms.com/submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ access_key: key, subject, message, from_name: 'LakeShore Legends Booking', replyto: rec.email, cc: '2244259490@tmomail.net' }),
    });
  } catch (e) { /* non-blocking */ }
}

function PrivateBooking() {
  const [service, setService] = useStateBk(null);
  const [players, setPlayers] = useStateBk(null);
  const [offset, setOffset] = useStateBk(0);
  const [date, setDate] = useStateBk(null);
  const [dow, setDow] = useStateBk(null);
  const [slotId, setSlotId] = useStateBk(null);
  const [reqTime, setReqTime] = useStateBk('');
  const [formOpen, setFormOpen] = useStateBk(false);

  useEffectBk(() => { if (window.lucide) window.lucide.createIcons(); });

  const todayIso = isoOf(new Date());
  const openSlots = LSL.getSlots().filter((s) => s.status === 'open' && s.date >= todayIso);
  const openDates = new Set(openSlots.map((s) => s.date));

  const pickService = (s) => {
    setService(s); setPlayers(null); setDate(null); setDow(null); setSlotId(null); setReqTime(''); setOffset(0);
  };
  const pickDate = (iso) => { setDate(iso); setSlotId(null); };
  const pickDow = (d) => { setDow(d); setReqTime(''); };

  const daySlots = date ? openSlots.filter((s) => s.date === date).sort((a, b) => a.time.localeCompare(b.time)) : [];
  const byLoc = {};
  daySlots.forEach((s) => { (byLoc[s.locId] = byLoc[s.locId] || []).push(s); });

  const isReq = service && service.mode === 'request';
  const isSoon = service && service.mode === 'soon';
  const col2Head = isReq ? 'Select a Day' : 'Select a Date';
  const col3Head = isReq ? 'Request a Time' : 'Available Times';

  // build descriptor for the form
  let desc = null;
  if (isReq && dow != null && reqTime) desc = { mode: 'request', serviceName: service.name, players, dow, reqTime };
  else if (service && !isReq && slotId) desc = { mode: 'dated', serviceName: service.name, typeId: service.typeId, payLink: service.payLink, slotId };

  return (
    <section className="lsl-section lsl-section--cream" id="book" style={{ paddingTop: '44px' }}>
      <div className="lsl-wrap">
        <SectionHead center wide eyebrow="Private Training"
          title="Book a Session With Coach Gio"
          sub="Check out our availability and book the date and time that works for you." />

        <div className="lsl-sched">
          {/* COLUMN 1 — services */}
          <div className="lsl-sched__col">
            <div className="lsl-sched__head">Service Offerings</div>
            <div className="lsl-svclist">
              {SERVICES.map((s) => (
                <React.Fragment key={s.key}>
                  <button className={'lsl-svc' + (service && service.key === s.key ? ' is-sel' : '')} onClick={() => pickService(s)}>
                    <span className="lsl-svc__ico"><i data-lucide={s.icon}></i></span>
                    <span className="lsl-svc__body">
                      <span className="lsl-svc__name">{s.name}</span>
                      <span className="lsl-svc__meta">{s.meta}</span>
                    </span>
                    <i data-lucide="chevron-right" className="lsl-svc__chev"></i>
                  </button>
                  {s.key === 'small' && service && service.key === 'small' && (
                    <div className="lsl-svcsub">
                      <div className="lsl-svcsub__q">How many players do you have in your group?</div>
                      <div className="lsl-svcsub__opts">
                        {['2', '3', '4', '5', '6+'].map((n) => (
                          <button key={n} className={'lsl-countchip' + (players === n ? ' is-sel' : '')}
                            onClick={() => { setPlayers(n); setDow(null); setReqTime(''); }}>{n}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* COLUMN 2 — calendar or day-of-week */}
          <div className="lsl-sched__col lsl-sched__col--border">
            <div className="lsl-sched__head">{col2Head}</div>
            {!service && <div className="lsl-sched__ph"><i data-lucide="arrow-left"></i> Choose a service to begin.</div>}
            {isSoon && (
              <div className="lsl-soon">
                <i data-lucide="clock"></i>
                <div className="lsl-soon__title">Coming Soon!</div>
                <p className="lsl-soon__sub">Group basketball classes are launching soon. Check back for dates and times.</p>
              </div>
            )}
            {service && !isReq && !isSoon && (
              <Calendar offset={offset} onOffset={setOffset} openDates={openDates} selected={date} onPick={pickDate} todayIso={todayIso} />
            )}
            {isReq && !players && <div className="lsl-sched__ph">Select your group size first.</div>}
            {isReq && players && (
              <div className="lsl-dows">
                {DOW.map((d, i) => (
                  <button key={d} className={'lsl-dow' + (dow === i ? ' is-sel' : '')} onClick={() => pickDow(i)}>
                    <span className="lsl-dow__d">{d}</span>
                    <i data-lucide="chevron-right"></i>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* COLUMN 3 — times */}
          <div className="lsl-sched__col lsl-sched__col--border">
            <div className="lsl-sched__head">{col3Head}</div>

            {/* dated times */}
            {isSoon && <div className="lsl-sched__ph">Stay tuned — enrollment opens soon.</div>}
            {service && !isReq && !isSoon && !date && <div className="lsl-sched__ph">Pick a date with a dot to see open times.</div>}
            {service && !isReq && !isSoon && date && (
              <div>
                <div className="lsl-times__day">{LSL.fmtDateLong(date)}</div>
                {daySlots.length === 0 && <p className="lsl-body lsl-body--sm" style={{ color: 'var(--fg3)' }}>No open times this day.</p>}
                {Object.keys(byLoc).map((lid) => (
                  <div className="lsl-times__group" key={lid}>
                    <div className="lsl-times__loc"><i data-lucide="map-pin"></i>{LSL.locById(lid).name}</div>
                    <div className="lsl-times__row">
                      {byLoc[lid].map((s) => (
                        <button key={s.id} className={'lsl-time' + (slotId === s.id ? ' is-sel' : '')} onClick={() => setSlotId(s.id)}>
                          {LSL.fmtTime(s.time)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* request time */}
            {isReq && (dow == null) && <div className="lsl-sched__ph">{players ? 'Pick a day of the week first.' : 'Choose group size and a day.'}</div>}
            {isReq && (dow != null) && (
              <div>
                <div className="lsl-times__day">{DOW[dow]}s</div>
                <label className="lsl-times__lbl">What time works best?</label>
                <select className="lsl-select" value={reqTime} onChange={(e) => setReqTime(e.target.value)}>
                  <option value="">Select a preferred time…</option>
                  {REQ_TIMES.map((t) => <option key={t} value={t}>{LSL.fmtTime(t)}</option>)}
                </select>
                <p className="lsl-body lsl-body--sm" style={{ color: 'var(--fg3)', marginTop: 10 }}>
                  This is a request — Coach Gio will confirm the time by email.
                </p>
              </div>
            )}

            {desc && (
              <button className="lsl-btn lsl-btn--primary lsl-times__req" onClick={() => setFormOpen(true)}>
                <i data-lucide="calendar-check"></i> Request Booking
              </button>
            )}
          </div>
        </div>

        <p className="lsl-bookpolicy">
          <i data-lucide="info"></i>
          <span>{LSL_POLICY.map((line, i) => <React.Fragment key={i}>{line}{i < LSL_POLICY.length - 1 && <br />}</React.Fragment>)}</span>
        </p>
      </div>
      {formOpen && desc && (
        <BookingForm desc={desc} onClose={() => setFormOpen(false)}
          onBooked={() => { setSlotId(null); setDate(null); setReqTime(''); setDow(null); }} />
      )}
    </section>
  );
}

function Calendar({ offset, onOffset, openDates, selected, onPick, todayIso }) {
  useEffectBk(() => { if (window.lucide) window.lucide.createIcons(); });
  const today = new Date();
  const base = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const y = base.getFullYear(), m = base.getMonth();
  const firstDow = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  const monthName = base.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const dows = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="lsl-cal">
      <div className="lsl-cal__nav">
        <button onClick={() => onOffset(Math.max(0, offset - 1))} disabled={offset <= 0} aria-label="Previous month"><i data-lucide="chevron-left"></i></button>
        <span className="lsl-cal__month">{monthName}</span>
        <button onClick={() => onOffset(offset + 1)} aria-label="Next month"><i data-lucide="chevron-right"></i></button>
      </div>
      <div className="lsl-cal__dows">{dows.map((d) => <span key={d}>{d}</span>)}</div>
      <div className="lsl-cal__grid">
        {cells.map((d, i) => {
          if (d === null) return <span key={'b' + i} className="lsl-cal__cell is-empty"></span>;
          const iso = y + '-' + pad2(m + 1) + '-' + pad2(d);
          const hasOpen = openDates.has(iso);
          const isPast = iso < todayIso;
          const can = hasOpen && !isPast;
          return (
            <button key={iso} disabled={!can}
              className={'lsl-cal__cell' + (can ? ' is-open' : '') + (selected === iso ? ' is-sel' : '')}
              onClick={() => can && onPick(iso)}>
              {d}
              {can && <span className="lsl-cal__dot"></span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BookingForm({ desc, onClose, onBooked }) {
  const [form, setForm] = useStateBk({ parent: '', athlete: '', age: '', email: '', phone: '', focus: '', notes: '' });
  const [extras, setExtras] = useStateBk([]);
  const [errs, setErrs] = useStateBk({});
  const [busy, setBusy] = useStateBk(false);
  const [result, setResult] = useStateBk(null);

  const addExtra = () => setExtras([...extras, { parent: '', athlete: '', email: '', phone: '' }]);
  const removeExtra = (i) => setExtras(extras.filter((_, idx) => idx !== i));
  const setExtra = (i, k) => (e) => setExtras(extras.map((ex, idx) => idx === i ? { ...ex, [k]: e.target.value } : ex));

  useEffectBk(() => { if (window.lucide) window.lucide.createIcons(); }, [result]);
  useEffectBk(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const isReq = desc.mode === 'request';
  const payLink = desc.payLink || null;
  const slot = isReq ? {} : (LSL.getSlots().find((s) => s.id === desc.slotId) || {});
  const loc = isReq ? {} : LSL.locById(slot.locId);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function validate() {
    const e = {};
    if (!form.parent.trim()) e.parent = 'Required';
    if (!form.athlete.trim()) e.athlete = 'Required';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = 'Enter a valid email';
    setErrs(e);
    return Object.keys(e).length === 0;
  }

  async function submit(e) {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    if (!isReq && payLink) window.open(payLink, '_blank');
    let rec;
    if (isReq) {
      rec = { id: LSL.uid(), mode: 'request', serviceName: desc.serviceName, players: desc.players, dow: desc.dow, reqTime: desc.reqTime,
        parent: form.parent, athlete: form.athlete, age: form.age, email: form.email, phone: form.phone,
        focus: form.focus, notes: form.notes, extras, created: new Date().toISOString(), status: 'requested' };
      LSL.setBooks([...LSL.getBooks(), rec]);
    } else {
      const slots = LSL.getSlots();
      const sIdx = slots.findIndex((s) => s.id === desc.slotId);
      if (sIdx < 0 || slots[sIdx].status !== 'open') { setBusy(false); setErrs({ form: 'Sorry — that opening was just taken. Please pick another time.' }); return; }
      rec = { id: LSL.uid(), mode: 'dated', typeId: desc.typeId, serviceName: desc.serviceName, slotId: desc.slotId,
        date: slots[sIdx].date, time: slots[sIdx].time, locId: slots[sIdx].locId,
        parent: form.parent, athlete: form.athlete, age: form.age, email: form.email, phone: form.phone,
        focus: form.focus, notes: form.notes, created: new Date().toISOString(), status: 'awaiting_payment' };
      slots[sIdx] = { ...slots[sIdx], status: 'booked', bookingId: rec.id };
      LSL.setSlots(slots);
      LSL.setBooks([...LSL.getBooks(), rec]);
    }
    await notifyCoach(rec);
    setBusy(false);
    setResult(rec);
    if (onBooked) onBooked();
  }


  return (
    <div className="lsl-lightbox" onClick={onClose}>
      <div className="lsl-bkmodal" onClick={(e) => e.stopPropagation()}>
        <button className="lsl-lightbox__close" onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: 16, right: 16 }}>
          <i data-lucide="x"></i>
        </button>

        {!result ? (
          <form className="lsl-bkbody" onSubmit={submit}>
            <h3 className="lsl-h3" style={{ marginTop: 0, marginBottom: 4 }}>Request Booking</h3>
            <div className="lsl-bksummary">
              <span><i data-lucide="dumbbell"></i>{desc.serviceName}</span>
              {isReq ? <>
                <span><i data-lucide="users"></i>{desc.players} players</span>
                <span><i data-lucide="calendar"></i>{DOW[desc.dow]}s</span>
                <span><i data-lucide="clock"></i>{LSL.fmtTime(desc.reqTime)}</span>
              </> : <>
                <span><i data-lucide="calendar"></i>{LSL.fmtDateLong(slot.date)}</span>
                <span><i data-lucide="clock"></i>{LSL.fmtTime(slot.time)}</span>
                <span><i data-lucide="map-pin"></i>{loc.name}</span>
              </>}
            </div>
            <div className="lsl-field lsl-field--row">
              <div><label>Parent / Guardian Name <span className="req">*</span></label>
                <input className={'lsl-input' + (errs.parent ? ' is-error' : '')} value={form.parent} onChange={set('parent')} placeholder="Jane Smith" />
                {errs.parent && <span className="lsl-err">{errs.parent}</span>}</div>
              <div><label>Athlete Name <span className="req">*</span></label>
                <input className={'lsl-input' + (errs.athlete ? ' is-error' : '')} value={form.athlete} onChange={set('athlete')} placeholder="Alex Smith" />
                {errs.athlete && <span className="lsl-err">{errs.athlete}</span>}</div>
            </div>
            <div className="lsl-field lsl-field--row">
              <div><label>Email <span className="req">*</span></label>
                <input className={'lsl-input' + (errs.email ? ' is-error' : '')} type="email" value={form.email} onChange={set('email')} placeholder="you@email.com" />
                {errs.email && <span className="lsl-err">{errs.email}</span>}</div>
              <div><label>Phone</label>
                <input className="lsl-input" value={form.phone} onChange={set('phone')} placeholder="(555) 555-5555" /></div>
            </div>
            <div className="lsl-field lsl-field--row">
              <div><label>Athlete Age / Grade</label>
                <input className="lsl-input" value={form.age} onChange={set('age')} placeholder="7th grade" /></div>
              <div><label>Focus Areas / Goals</label>
                <input className="lsl-input" value={form.focus} onChange={set('focus')} placeholder="Shooting, ball handling" /></div>
            </div>
            <div className="lsl-field">
              <label>Additional Notes</label>
              <textarea className="lsl-textarea" value={form.notes} onChange={set('notes')} placeholder="Anything Coach Gio should know" style={{ minHeight: 76 }}></textarea>
            </div>
            {isReq && (
              <div className="lsl-extras">
                {extras.map((ex, i) => (
                  <div className="lsl-extra" key={i}>
                    <div className="lsl-extra__head">
                      <span>Participant {i + 2}</span>
                      <button type="button" className="lsl-extra__remove" onClick={() => removeExtra(i)} aria-label="Remove">
                        <i data-lucide="x"></i>
                      </button>
                    </div>
                    <div className="lsl-field lsl-field--row">
                      <div><label>Parent / Guardian Name</label>
                        <input className="lsl-input" value={ex.parent} onChange={setExtra(i, 'parent')} placeholder="Jane Smith" /></div>
                      <div><label>Athlete Name</label>
                        <input className="lsl-input" value={ex.athlete} onChange={setExtra(i, 'athlete')} placeholder="Alex Smith" /></div>
                    </div>
                    <div className="lsl-field lsl-field--row">
                      <div><label>Email</label>
                        <input className="lsl-input" type="email" value={ex.email} onChange={setExtra(i, 'email')} placeholder="you@email.com" /></div>
                      <div><label>Phone</label>
                        <input className="lsl-input" value={ex.phone} onChange={setExtra(i, 'phone')} placeholder="(555) 555-5555" /></div>
                    </div>
                  </div>
                ))}
                <button type="button" className="lsl-btn lsl-btn--ghost lsl-btn--sm lsl-extras__add" onClick={addExtra}>
                  <i data-lucide="user-plus"></i> Add Another Participant
                </button>
              </div>
            )}
            <div className="lsl-bknote" style={{ marginBottom: 14 }}>
              <i data-lucide={isReq ? 'mail' : 'shield-check'}></i>
              {isReq
                ? <span>This sends a <strong>class request</strong> to Coach Gio. You'll get a confirmation email — no payment is taken now.</span>
                : <span>After you submit, you'll be taken to <strong>Stripe</strong> to pay securely and lock in your spot. Stripe emails your receipt.</span>}
            </div>
            <p className="lsl-bkpolicy--modal">{LSL_POLICY.map((line, i) => <React.Fragment key={i}>{line}{i < LSL_POLICY.length - 1 && <br />}</React.Fragment>)}</p>
            {errs.form && <p className="lsl-err">{errs.form}</p>}
            <button type="submit" className="lsl-btn lsl-btn--primary" disabled={busy} style={{ width: '100%' }}>
              <i data-lucide={isReq ? 'send' : 'arrow-right'}></i>
              {busy ? ' Submitting…' : (isReq ? ' Submit Request' : ' Reserve & Continue to Payment')}
            </button>
          </form>
        ) : result.mode === 'request' ? (
          <div className="lsl-bkbody lsl-bkdone">
            <div className="lsl-formsuccess__ico"><i data-lucide="check"></i></div>
            <h3 className="lsl-h3">Request received!</h3>
            <p className="lsl-body lsl-body--sm" style={{ marginTop: 0 }}>
              {result.serviceName} · {result.players} players · {DOW[result.dow]}s around {LSL.fmtTime(result.reqTime)}.<br />
              Coach Gio will reach out to <strong>{result.email}</strong> to confirm your class.
            </p>
            <div className="lsl-bkdone__row">
              <button className="lsl-btn lsl-btn--primary lsl-btn--sm" onClick={onClose}>Done</button>
            </div>
          </div>
        ) : (
          <div className="lsl-bkbody lsl-bkdone">
            <div className="lsl-formsuccess__ico"><i data-lucide="check"></i></div>
            <h3 className="lsl-h3">Spot reserved — one last step</h3>
            <p className="lsl-body lsl-body--sm" style={{ marginTop: 0 }}>
              {result.serviceName} · {LSL.fmtDateLong(result.date)} · {LSL.fmtTime(result.time)} at {LSL.locById(result.locId).name}.<br />
              {payLink ? 'Stripe payment opened in a new tab.' : ''}
            </p>
            {payLink
              ? <a className="lsl-btn lsl-btn--primary" href={payLink} target="_blank" rel="noopener" style={{ marginBottom: 12 }}><i data-lucide="credit-card"></i> Complete Payment Now</a>
              : <div className="lsl-bknote"><i data-lucide="info"></i><span>Coach Gio will email a secure Stripe payment link to {result.email} shortly.</span></div>}
            <div className="lsl-bkdone__row">
              <button className="lsl-btn lsl-btn--ghost lsl-btn--sm" onClick={() => LSL.downloadICS(result)}><i data-lucide="calendar-plus"></i> Add to calendar</button>
            </div>
            <p className="lsl-body lsl-body--sm" style={{ color: 'var(--fg3)', marginBottom: 0 }}>Your spot is held. It's confirmed once payment is complete.</p>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { PrivateBooking, BookingForm, Calendar });
