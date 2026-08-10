/* global React, SectionHead, LSL */
const { useState: useStateBk, useEffect: useEffectBk, useReducer: useReducerBk } = React;

const W3F_1ON1   = '57d5ddc7-7fef-4b25-b3c1-6d0ace6f4633';
const W3F_GROUP  = '26db51db-43e4-4bf9-90d5-fa4c7a647de2';
const W3F_REQTRN = '0202f9d6-795d-4dd1-ae8e-6b5fe7391d92';

const PAY_1ON1 = 'https://buy.stripe.com/00w9AM0rxcFigGc4M10Jq01';
const PAY_GROUP = {
  '2':  'https://buy.stripe.com/28E9AMcaf48Mdu03HX0Jq00',
  '3':  'https://buy.stripe.com/8x2dR20rx9t64XuguJ0Jq02',
  '4+': 'https://buy.stripe.com/14AcMYdejaxa89GemB0Jq03',
};

const LSL_POLICY = [
  'Cancellations made within 48 hours of a session are subject to a 50% retainer.',
  'Cancellations made more than 48 hours in advance receive a 100% refund.',
  'Training session times and availability are subject to change.',
];

const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const pad2 = (n) => String(n).padStart(2, '0');
const isoOf = (dt) => dt.getFullYear() + '-' + pad2(dt.getMonth() + 1) + '-' + pad2(dt.getDate());

async function notifyCoach(rec) {
  const isGroup = !!(rec.players);
  const key = rec.mode === 'request' ? W3F_GROUP : (isGroup ? W3F_GROUP : W3F_1ON1);
  const fromName = rec.mode === 'request' || isGroup ? 'LSL Small Group Booking Request' : 'LSL New 1-on-1 Booking';
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
      rec.serviceName + (rec.players ? ' · ' + rec.players + ' players' : ''),
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
      body: JSON.stringify({ access_key: key, subject, message, from_name: fromName, replyto: rec.email, cc: '2244259490@tmomail.net' }),
    });
  } catch (e) { /* non-blocking */ }
}

function PrivateBooking() {
  const [locFilter, setLocFilter] = useStateBk(null); // null = all
  const [offset, setOffset] = useStateBk(0);
  const [date, setDate] = useStateBk(null);
  const [slotId, setSlotId] = useStateBk(null);
  const [svcType, setSvcType] = useStateBk(null); // 'dated' | 'small'
  const [players, setPlayers] = useStateBk(null);
  const [formOpen, setFormOpen] = useStateBk(false);
  const [reqTrainOpen, setReqTrainOpen] = useStateBk(false);
  const [, forceSync] = useReducerBk((x) => x + 1, 0);

  useEffectBk(() => {
    const onSync = () => forceSync();
    window.addEventListener('lsl-synced', onSync);
    return () => window.removeEventListener('lsl-synced', onSync);
  }, []);
  useEffectBk(() => { if (window.lucide) window.lucide.createIcons(); });

  const todayIso = isoOf(new Date());
  const locs = LSL.getLocs();

  // Open dates filtered by selected location
  const openDates = new Set(
    LSL.getSlots()
      .filter((s) => s.status === 'open' && s.date >= todayIso && (!locFilter || s.locId === locFilter))
      .map((s) => s.date)
  );

  // Slots for selected date, filtered by location
  const daySlots = date
    ? LSL.getSlots()
        .filter((s) => s.date === date && (s.status === 'open' || s.status === 'booked') && (!locFilter || s.locId === locFilter))
        .sort((a, b) => a.time.localeCompare(b.time))
    : [];

  // Group by location
  const byLoc = {};
  daySlots.forEach((s) => { if (!byLoc[s.locId]) byLoc[s.locId] = []; byLoc[s.locId].push(s); });

  const pickLoc = (id) => { setLocFilter(id); setDate(null); setSlotId(null); setSvcType(null); setPlayers(null); setOffset(0); };
  const pickDate = (iso) => { setDate(iso); setSlotId(null); setSvcType(null); setPlayers(null); };
  const pickSlot = (id) => { setSlotId(id); setSvcType(null); setPlayers(null); };

  let desc = null;
  if (slotId && svcType === 'dated') {
    desc = { mode: 'dated', serviceName: '1-on-1 Private Training Session', typeId: 'p1', payLink: PAY_1ON1, slotId };
  } else if (slotId && svcType === 'small' && players) {
    desc = { mode: 'dated', serviceName: 'Small Group Training Session', typeId: 'sg' + players, payLink: PAY_GROUP[players], slotId, players };
  }

  const ReqFooter = () => (
    <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
      <p className="lsl-body lsl-body--sm" style={{ color: 'var(--fg2)', marginBottom: 12, textAlign: 'center', fontSize: '0.85em' }}>
        Don&rsquo;t see a date, time, or location you like?<br/>
        <span style={{ fontSize: '1.08em' }}>Reach out &mdash; Coach Gio can often make it work.</span>
      </p>
      <button className="lsl-btn lsl-btn--ghost lsl-btn--sm" style={{ width: '100%' }} onClick={() => setReqTrainOpen(true)}>
        <i data-lucide="mail"></i> Request Training
      </button>
    </div>
  );

  return (
    <section className="lsl-section lsl-section--cream" id="book" style={{ paddingTop: '44px' }}>
      <div className="lsl-wrap">
        <SectionHead center wide eyebrow="Private Training"
          title="Book a Session With Coach Gio"
          sub="Check out our availability and book the date and time that works for you." />

        {locs.length > 0 && (
          <div className="lsl-locfilter">
            <button className={'lsl-locchip' + (!locFilter ? ' is-sel' : '')} onClick={() => pickLoc(null)}>
              All Locations
            </button>
            {locs.map((loc) => (
              <button key={loc.id} className={'lsl-locchip' + (locFilter === loc.id ? ' is-sel' : '')} onClick={() => pickLoc(loc.id)}>
                <i data-lucide="map-pin"></i>{loc.name}
              </button>
            ))}
          </div>
        )}

        <div className="lsl-sched">
          {/* COLUMN 1 — calendar (all locations) */}
          <div className="lsl-sched__col">
            <div className="lsl-sched__head">Select a Date</div>
            <Calendar offset={offset} onOffset={setOffset} openDates={openDates} selected={date} onPick={pickDate} todayIso={todayIso} />
          </div>

          {/* COLUMN 2 — times grouped by location */}
          <div className="lsl-sched__col lsl-sched__col--border">
            <div className="lsl-sched__head">Available Times</div>
            {!date
              ? <div className="lsl-sched__ph">Pick a highlighted date to see open times.</div>
              : daySlots.length === 0
                ? <p className="lsl-body lsl-body--sm" style={{ color: 'var(--fg3)' }}>No open times on this day.</p>
                : Object.keys(byLoc).map((lid) => {
                    const loc = LSL.locById(lid);
                    return (
                      <div key={lid} style={{ marginBottom: 16 }}>
                        <div className="lsl-times__loc">{loc ? loc.name : lid}</div>
                        <div className="lsl-times__row">
                          {byLoc[lid].map((s) => (
                            <button key={s.id}
                              className={'lsl-time' + (s.status === 'booked' ? ' is-booked' : '') + (slotId === s.id ? ' is-sel' : '')}
                              disabled={s.status === 'booked'}
                              onClick={() => s.status === 'open' && pickSlot(s.id)}>
                              {LSL.fmtTime(s.time)}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })
            }
          </div>

          {/* COLUMN 3 — type of session */}
          <div className="lsl-sched__col lsl-sched__col--border">
            <div className="lsl-sched__head">Type of Session</div>
            {!slotId ? (
              <>
                <div className="lsl-sched__ph">Select a date and time to choose your session type.</div>
                <ReqFooter />
              </>
            ) : (
              <div>
                <div className="lsl-svclist">
                  <button className={'lsl-svc' + (svcType === 'dated' ? ' is-sel' : '')}
                    onClick={() => { setSvcType('dated'); setPlayers(null); }}>
                    <span className="lsl-svc__ico"><i data-lucide="user"></i></span>
                    <span className="lsl-svc__body">
                      <span className="lsl-svc__name">1-on-1 Private Training</span>
                      <span className="lsl-svc__meta">One athlete · 60 min</span>
                    </span>
                    <i data-lucide="chevron-right" className="lsl-svc__chev"></i>
                  </button>
                  <button className={'lsl-svc' + (svcType === 'small' ? ' is-sel' : '')}
                    onClick={() => { setSvcType('small'); setPlayers(null); }}>
                    <span className="lsl-svc__ico"><i data-lucide="users"></i></span>
                    <span className="lsl-svc__body">
                      <span className="lsl-svc__name">Small Group Training</span>
                      <span className="lsl-svc__meta">Bring your own group</span>
                    </span>
                    <i data-lucide="chevron-right" className="lsl-svc__chev"></i>
                  </button>
                </div>
                {svcType === 'small' && (
                  <div className="lsl-svcsub">
                    <div className="lsl-svcsub__q">How many players in your group?</div>
                    <div className="lsl-svcsub__opts">
                      {['2', '3', '4+'].map((n) => (
                        <button key={n} className={'lsl-countchip' + (players === n ? ' is-sel' : '')} onClick={() => setPlayers(n)}>{n}</button>
                      ))}
                    </div>
                  </div>
                )}
                {desc && (
                  <button className="lsl-btn lsl-btn--primary lsl-times__req" onClick={() => setFormOpen(true)}>
                    <i data-lucide="calendar-check"></i> Book Session
                  </button>
                )}
                <ReqFooter />
              </div>
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
          onBooked={() => { setSlotId(null); setDate(null); setSvcType(null); setPlayers(null); }} />
      )}
      {reqTrainOpen && <TrainingRequestForm onClose={() => setReqTrainOpen(false)} />}
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
  const [errs, setErrs] = useStateBk({});
  const [busy, setBusy] = useStateBk(false);
  const [result, setResult] = useStateBk(null);

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
        focus: form.focus, notes: form.notes, created: new Date().toISOString(), status: 'requested' };
      LSL.setBooks([...LSL.getBooks(), rec]);
    } else {
      const slots = LSL.getSlots();
      const sIdx = slots.findIndex((s) => s.id === desc.slotId);
      if (sIdx < 0 || slots[sIdx].status !== 'open') { setBusy(false); setErrs({ form: 'Sorry — that opening was just taken. Please pick another time.' }); return; }
      rec = { id: LSL.uid(), mode: 'dated', typeId: desc.typeId, serviceName: desc.serviceName, slotId: desc.slotId,
        date: slots[sIdx].date, time: slots[sIdx].time, locId: slots[sIdx].locId,
        players: desc.players || null,
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
            <h3 className="lsl-h3" style={{ marginTop: 0, marginBottom: 4 }}>Book Session</h3>
            <div className="lsl-bksummary">
              <span><i data-lucide="dumbbell"></i>{desc.serviceName}</span>
              {isReq ? <>
                <span><i data-lucide="users"></i>{desc.players} players</span>
                <span><i data-lucide="calendar"></i>{DOW[desc.dow]}s</span>
                <span><i data-lucide="clock"></i>{LSL.fmtTime(desc.reqTime)}</span>
              </> : <>
                {desc.players && <span><i data-lucide="users"></i>{desc.players} players</span>}
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
            <div className="lsl-bknote" style={{ marginBottom: 14 }}>
              <i data-lucide={isReq ? 'mail' : 'shield-check'}></i>
              {isReq
                ? <span>This sends a <strong>request</strong> to Coach Gio. You'll get a confirmation email — no payment is taken now.</span>
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
              {result.serviceName}{result.players ? ' · ' + result.players + ' players' : ''} · {LSL.fmtDateLong(result.date)} · {LSL.fmtTime(result.time)} at {LSL.locById(result.locId).name}.<br />
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

function TrainingRequestForm({ onClose }) {
  const [form, setForm] = useStateBk({ parent: '', athlete: '', email: '', phone: '', reqLocation: '', reqTime: '', reqDate: '', age: '', focus: '', notes: '' });
  const [errs, setErrs] = useStateBk({});
  const [busy, setBusy] = useStateBk(false);
  const [done, setDone] = useStateBk(false);

  useEffectBk(() => {
    if (window.lucide) window.lucide.createIcons();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [done]);

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
    const key = W3F_REQTRN;
    if (key) {
      const message = [
        'Training Request — ' + form.athlete,
        'Parent/Guardian: ' + form.parent,
        form.email + (form.phone ? ' · ' + form.phone : ''),
        form.reqLocation ? 'Requested Location: ' + form.reqLocation : '',
        form.reqDate ? 'Requested Date: ' + form.reqDate : '',
        form.reqTime ? 'Requested Time: ' + form.reqTime : '',
        form.age ? 'Age/Grade: ' + form.age : '',
        form.focus ? 'Focus Areas: ' + form.focus : '',
        form.notes ? 'Notes: ' + form.notes : '',
      ].filter(Boolean).join('\n');
      try {
        await fetch('https://api.web3forms.com/submit', {
          method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ access_key: key, subject: 'Training Request — ' + form.athlete, message, from_name: 'LSL Request Training', replyto: form.email, cc: '2244259490@tmomail.net' }),
        });
      } catch (_) { /* non-blocking */ }
    }
    setBusy(false);
    setDone(true);
  }

  return (
    <div className="lsl-lightbox" onClick={onClose}>
      <div className="lsl-bkmodal" onClick={(e) => e.stopPropagation()}>
        <button className="lsl-lightbox__close" onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: 16, right: 16 }}>
          <i data-lucide="x"></i>
        </button>
        {!done ? (
          <form className="lsl-bkbody" onSubmit={submit}>
            <h3 className="lsl-h3" style={{ marginTop: 0, marginBottom: 4 }}>Request Training</h3>
            <p className="lsl-body lsl-body--sm" style={{ color: 'var(--fg2)', marginTop: 0, marginBottom: 16 }}>
              Fill this out and Coach Gio will reach out to make it work.
            </p>
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
              <div><label>Requested Location</label>
                <input className="lsl-input" value={form.reqLocation} onChange={set('reqLocation')} placeholder="Park Ridge, Mundelein…" /></div>
              <div><label>Requested Time</label>
                <input className="lsl-input" value={form.reqTime} onChange={set('reqTime')} placeholder="e.g. 4:00 PM" /></div>
            </div>
            <div className="lsl-field lsl-field--row">
              <div><label>Requested Date</label>
                <input className="lsl-input" value={form.reqDate} onChange={set('reqDate')} placeholder="e.g. July 25" /></div>
              <div><label>Athlete Age / Grade</label>
                <input className="lsl-input" value={form.age} onChange={set('age')} placeholder="7th grade" /></div>
            </div>
            <div className="lsl-field">
              <label>Focus Areas / Goals</label>
              <input className="lsl-input" value={form.focus} onChange={set('focus')} placeholder="Shooting, ball handling, defense…" />
            </div>
            <div className="lsl-field">
              <label>Additional Notes</label>
              <textarea className="lsl-textarea" value={form.notes} onChange={set('notes')} placeholder="Anything Coach Gio should know" style={{ minHeight: 76 }}></textarea>
            </div>
            <button type="submit" className="lsl-btn lsl-btn--primary" disabled={busy} style={{ width: '100%' }}>
              <i data-lucide="send"></i>{busy ? ' Sending…' : ' Request Booking'}
            </button>
          </form>
        ) : (
          <div className="lsl-bkbody lsl-bkdone">
            <div className="lsl-formsuccess__ico"><i data-lucide="check"></i></div>
            <h3 className="lsl-h3">Request received!</h3>
            <p className="lsl-body lsl-body--sm" style={{ marginTop: 0 }}>
              Thank you, <strong>{form.athlete}</strong>! Coach Gio will reach out to <strong>{form.email}</strong> to confirm your training session.
            </p>
            <div className="lsl-bkdone__row">
              <button className="lsl-btn lsl-btn--primary lsl-btn--sm" onClick={onClose}>Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { PrivateBooking, BookingForm, Calendar, TrainingRequestForm });
