/* global React, LSL */
const { useState: useStateAd, useEffect: useEffectAd, useReducer: useReducerAd } = React;

function CoachAdminPage() {
  const [authed, setAuthed] = useStateAd(false);
  const [pass, setPass] = useStateAd('');
  const [perr, setPerr] = useStateAd(false);
  const [tab, setTab] = useStateAd('avail');
  const [, force] = useReducerAd((x) => x + 1, 0);
  useEffectAd(() => { if (window.lucide) window.lucide.createIcons(); });

  const tryAuth = (e) => {
    e.preventDefault();
    if (pass === LSL.getPass()) { setAuthed(true); setPerr(false); }
    else setPerr(true);
  };

  if (!authed) {
    return (
      <div className="lsl-adminpage">
        <form className="lsl-admin lsl-admin--login" onSubmit={tryAuth}>
          <div className="lsl-admin__lock"><i data-lucide="lock"></i></div>
          <h1 className="lsl-h3" style={{ margin: '0 0 6px', textAlign: 'center' }}>Coach Login</h1>
          <p className="lsl-body lsl-body--sm" style={{ marginTop: 0, textAlign: 'center', color: 'var(--fg3)' }}>LakeShore Legends — private booking dashboard.</p>
          <input className={'lsl-input' + (perr ? ' is-error' : '')} type="password" value={pass}
            onChange={(e) => setPass(e.target.value)} placeholder="Passcode" autoFocus style={{ textAlign: 'center' }} />
          {perr && <span className="lsl-err" style={{ textAlign: 'center' }}>Incorrect passcode</span>}
          <button type="submit" className="lsl-btn lsl-btn--primary" style={{ width: '100%', marginTop: 14 }}>Unlock</button>
        </form>
      </div>
    );
  }

  return (
    <div className="lsl-adminpage">
      <div className="lsl-admin lsl-admin--page">
        <div className="lsl-admin__head">
          <img src="assets/badge-crest.png" alt="" style={{ height: 40 }} />
          <h1 className="lsl-h3" style={{ margin: 0 }}>Coach Dashboard</h1>
          <span className="lsl-pill lsl-pill--sky">Coach Gio</span>
          <a className="lsl-admin__exit" href="training.html"><i data-lucide="external-link"></i> View site</a>
        </div>
        <div className="lsl-admin__tabs">
          {[['avail', 'Availability'], ['types', 'Sessions & Links'], ['locs', 'Locations'], ['books', 'Bookings'], ['set', 'Settings']].map(([k, l]) => (
            <button key={k} className={tab === k ? 'is-active' : ''} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
        <div className="lsl-admin__body">
          {tab === 'avail' && <AvailTab force={force} />}
          {tab === 'types' && <TypesTab force={force} />}
          {tab === 'locs' && <LocsTab force={force} />}
          {tab === 'books' && <BooksTab force={force} />}
          {tab === 'set' && <SettingsTab force={force} />}
        </div>
      </div>
    </div>
  );
}

/* ---------- Availability ---------- */
function AvailTab({ force }) {
  const locs = LSL.getLocs();
  const [date, setDate] = useStateAd('');
  const [time, setTime] = useStateAd('');
  const [locId, setLocId] = useStateAd(locs[0] ? locs[0].id : '');
  useEffectAd(() => { if (window.lucide) window.lucide.createIcons(); });

  const add = () => {
    if (!date || !time || !locId) return;
    LSL.setSlots([...LSL.getSlots(), { id: LSL.uid(), date, time, locId, status: 'open' }]);
    setDate(''); setTime(''); force();
  };
  const del = (id) => { LSL.setSlots(LSL.getSlots().filter((s) => s.id !== id)); force(); };
  const slots = LSL.getSlots().slice().sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  return (
    <div>
      <p className="lsl-body lsl-body--sm" style={{ marginTop: 0, color: 'var(--fg3)' }}>Add openings as they come up. Booked times drop off the public list automatically.</p>
      <div className="lsl-admin__addrow">
        <div><label>Date</label><input className="lsl-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div><label>Time</label><input className="lsl-input" type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div>
        <div><label>Location</label>
          <select className="lsl-select" value={locId} onChange={(e) => setLocId(e.target.value)}>
            {locs.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select></div>
        <button className="lsl-btn lsl-btn--primary lsl-btn--sm" onClick={add}><i data-lucide="plus"></i> Add opening</button>
      </div>
      <div className="lsl-admin__list">
        {slots.length === 0 && <p className="lsl-body lsl-body--sm" style={{ color: 'var(--fg3)' }}>No openings yet. Add your first above.</p>}
        {slots.map((s) => {
          const l = LSL.locById(s.locId);
          return (
            <div className="lsl-admin__item" key={s.id}>
              <div className="lsl-admin__itemmain"><strong>{LSL.fmtDate(s.date)}</strong> · {LSL.fmtTime(s.time)} · {l.name}</div>
              <span className={'lsl-pill ' + (s.status === 'booked' ? 'lsl-pill--orange' : 'lsl-pill--outline')}>{s.status === 'booked' ? 'Booked' : 'Open'}</span>
              <button className="lsl-admin__del" onClick={() => del(s.id)} aria-label="Delete"><i data-lucide="trash-2"></i></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Sessions & Stripe links ---------- */
function TypesTab({ force }) {
  const types = LSL.getTypes();
  useEffectAd(() => { if (window.lucide) window.lucide.createIcons(); });
  const upd = (id, k, v) => { LSL.setTypes(LSL.getTypes().map((t) => t.id === id ? { ...t, [k]: v } : t)); force(); };
  const del = (id) => { LSL.setTypes(LSL.getTypes().filter((t) => t.id !== id)); force(); };
  const add = () => { LSL.setTypes([...LSL.getTypes(), { id: LSL.uid(), name: 'New Session', size: '1-on-1', group: false, duration: 60, price: null, payLink: '' }]); force(); };
  return (
    <div>
      <p className="lsl-body lsl-body--sm" style={{ marginTop: 0, color: 'var(--fg3)' }}>
        Each session forwards to its Stripe Payment Link after the family submits the form. Edit prices in Stripe — the checkout page always shows the live price.
      </p>
      {types.map((t) => (
        <div className="lsl-admin__card" key={t.id}>
          <div className="lsl-field lsl-field--row">
            <div><label>Name</label><input className="lsl-input" value={t.name} onChange={(e) => upd(t.id, 'name', e.target.value)} /></div>
            <div style={{ maxWidth: 130 }}><label>Format</label><input className="lsl-input" value={t.size} onChange={(e) => upd(t.id, 'size', e.target.value)} placeholder="1-on-1" /></div>
            <div style={{ maxWidth: 110 }}><label>Minutes</label><input className="lsl-input" type="number" value={t.duration} onChange={(e) => upd(t.id, 'duration', +e.target.value)} /></div>
          </div>
          <div className="lsl-field" style={{ marginBottom: 8 }}>
            <label>Stripe Payment Link</label>
            <input className="lsl-input" value={t.payLink} onChange={(e) => upd(t.id, 'payLink', e.target.value)} placeholder="https://buy.stripe.com/..." />
          </div>
          <button className="lsl-admin__del lsl-admin__del--text" onClick={() => del(t.id)}><i data-lucide="trash-2"></i> Remove</button>
        </div>
      ))}
      <button className="lsl-btn lsl-btn--ghost lsl-btn--sm" onClick={add}><i data-lucide="plus"></i> Add session type</button>
    </div>
  );
}

/* ---------- Locations ---------- */
function LocsTab({ force }) {
  const locs = LSL.getLocs();
  useEffectAd(() => { if (window.lucide) window.lucide.createIcons(); });
  const upd = (id, k, v) => { LSL.setLocs(LSL.getLocs().map((l) => l.id === id ? { ...l, [k]: v } : l)); force(); };
  const del = (id) => { LSL.setLocs(LSL.getLocs().filter((l) => l.id !== id)); force(); };
  const add = () => { LSL.setLocs([...LSL.getLocs(), { id: LSL.uid(), name: '', city: '' }]); force(); };
  return (
    <div>
      <p className="lsl-body lsl-body--sm" style={{ marginTop: 0, color: 'var(--fg3)' }}>Use general areas/towns. Exact address can be shared privately once a booking is confirmed.</p>
      {locs.map((l) => (
        <div className="lsl-admin__card" key={l.id}>
          <div className="lsl-field" style={{ marginBottom: 8 }}>
            <label>Area / Town</label><input className="lsl-input" value={l.name} onChange={(e) => upd(l.id, 'name', e.target.value)} placeholder="Park Ridge, IL" />
          </div>
          <button className="lsl-admin__del lsl-admin__del--text" onClick={() => del(l.id)}><i data-lucide="trash-2"></i> Remove</button>
        </div>
      ))}
      <button className="lsl-btn lsl-btn--ghost lsl-btn--sm" onClick={add}><i data-lucide="plus"></i> Add location</button>
    </div>
  );
}

/* ---------- Bookings ---------- */
function BooksTab({ force }) {
  const books = LSL.getBooks().slice().sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  useEffectAd(() => { if (window.lucide) window.lucide.createIcons(); });
  const cancel = (bk) => {
    LSL.setBooks(LSL.getBooks().filter((b) => b.id !== bk.id));
    LSL.setSlots(LSL.getSlots().map((s) => s.id === bk.slotId ? { ...s, status: 'open', bookingId: undefined } : s));
    force();
  };
  if (books.length === 0) return <p className="lsl-body lsl-body--sm" style={{ color: 'var(--fg3)' }}>No bookings yet. They'll appear here as families reserve openings.</p>;
  const DOWN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return (
    <div className="lsl-admin__list">
      {books.map((bk) => {
        const req = bk.mode === 'request';
        const t = LSL.typeById(bk.typeId); const l = LSL.locById(bk.locId);
        return (
          <div className="lsl-admin__booking" key={bk.id}>
            <div className="lsl-admin__bookhead">
              <strong>{bk.athlete}</strong>
              {req
                ? <span className="lsl-pill lsl-pill--outline">Request · {DOWN[bk.dow]}s · {LSL.fmtTime(bk.reqTime)}</span>
                : <span className="lsl-pill lsl-pill--sky">{LSL.fmtDate(bk.date)} · {LSL.fmtTime(bk.time)}</span>}
            </div>
            <div className="lsl-admin__bookmeta">
              {req
                ? <>{bk.serviceName} · {bk.players} players</>
                : <>{bk.serviceName || t.name} · {l.name}</>}<br />
              Parent: {bk.parent} · {bk.email}{bk.phone ? ' · ' + bk.phone : ''}<br />
              {bk.age ? 'Age/Grade: ' + bk.age + ' · ' : ''}{bk.focus ? 'Focus: ' + bk.focus : ''}
              {bk.notes ? <><br />Notes: {bk.notes}</> : null}
            </div>
            <div className="lsl-admin__bookactions">
              {!req && <button className="lsl-btn lsl-btn--ghost lsl-btn--sm" onClick={() => LSL.downloadICS(bk)}><i data-lucide="calendar-plus"></i> .ics</button>}
              <button className="lsl-admin__del lsl-admin__del--text" onClick={() => cancel(bk)}><i data-lucide="x"></i> {req ? 'Remove request' : 'Cancel & reopen'}</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Settings ---------- */
function SettingsTab({ force }) {
  const [np, setNp] = useStateAd('');
  const [w3, setW3] = useStateAd(LSL.getWeb3Key());
  const [savedMsg, setSavedMsg] = useStateAd('');
  useEffectAd(() => { if (window.lucide) window.lucide.createIcons(); });
  const flash = (m) => { setSavedMsg(m); setTimeout(() => setSavedMsg(''), 2200); };
  const savePass = () => { if (np.trim()) { LSL.setPass(np.trim()); setNp(''); flash('Passcode updated.'); } };
  const saveW3 = () => { LSL.setWeb3Key(w3.trim()); flash('Web3Forms key saved.'); };
  return (
    <div>
      <div className="lsl-admin__card">
        <div className="lsl-field" style={{ marginBottom: 8 }}>
          <label>Web3Forms Access Key</label>
          <input className="lsl-input" value={w3} onChange={(e) => setW3(e.target.value)} placeholder="paste your web3forms access key" />
        </div>
        <p className="lsl-body lsl-body--sm" style={{ marginTop: 0, color: 'var(--fg3)' }}>
          Get a free key at web3forms.com. With it set, every booking emails you the full player &amp; parent details before the family is sent to Stripe.
        </p>
        <button className="lsl-btn lsl-btn--primary lsl-btn--sm" onClick={saveW3}>Save key</button>
      </div>
      <div className="lsl-admin__card">
        <div className="lsl-field" style={{ marginBottom: 8 }}>
          <label>Change passcode</label>
          <input className="lsl-input" value={np} onChange={(e) => setNp(e.target.value)} placeholder="New passcode" />
        </div>
        <button className="lsl-btn lsl-btn--primary lsl-btn--sm" onClick={savePass}>Save passcode</button>
      </div>
      {savedMsg && <p className="lsl-err" style={{ color: 'var(--success)' }}>{savedMsg}</p>}
      <div className="lsl-bknote" style={{ marginTop: 6 }}>
        <i data-lucide="info"></i>
        <span>Availability, bookings, and settings save to <strong>this browser only</strong>. For live multi-device booking and automatic calendar sync, this connects to a backend in a developer handoff.</span>
      </div>
    </div>
  );
}

Object.assign(window, { CoachAdminPage });
