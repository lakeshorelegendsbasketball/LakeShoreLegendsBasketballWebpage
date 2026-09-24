/* global React, LSL */
/* Coach dashboard — Bookings tab, booking details, family drawer. */
(function () {
  const { useState, useEffect, useMemo } = React;
  const A = window.LSLA;
  const { Icon, Badge, StatusBadge, Dialog, Field, Seg, Expand } = A;

  const VIEWS = [['upcoming', 'Upcoming'], ['requests', 'Requests'], ['past', 'Past'], ['canceled', 'Canceled'], ['all', 'All']];
  const CLOSED = ['canceled', 'declined', 'expired'];
  const PAGE = 40;
  const METHODS = [['cash', 'Cash'], ['venmo', 'Venmo'], ['zelle', 'Zelle'], ['check', 'Check'], ['card', 'Card (in person)'], ['other', 'Other']];

  const endMins = (b) => { const [h, m] = b.time.split(':').map(Number); return h * 60 + m + (b.duration || 60); };
  function isPast(b, now) {
    if (!b.date) return false;
    if (b.date !== now.date) return b.date < now.date;
    const [h, m] = now.time.split(':').map(Number);
    return endMins(b) <= h * 60 + m;
  }
  function viewOf(b, now) {
    if (CLOSED.includes(b.status)) return 'canceled';
    if (b.status === 'requested') return 'requests';
    if (b.kind === 'dated' && isPast(b, now)) return 'past';
    return 'upcoming';
  }
  const requestLine = (b) => {
    const r = b.request || {};
    if (r.slot_id) return 'Requested ' + LSL.fmtDate(r.date) + ' · ' + LSL.fmtTime(r.time) + (r.location ? ' · ' + r.location : '');
    return ['Request', r.day || (r.dow != null ? ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'][r.dow] : null),
      r.time || (r.reqTime ? LSL.fmtTime(r.reqTime) : null), r.date, r.location].filter(Boolean).join(' · ');
  };

  function BooksTab() {
    const app = A.useApp();
    const q = A.useFetch('/api/admin/bookings', [app.version]);
    const [view, setView] = useState('upcoming');
    const [search, setSearch] = useState('');
    const [f, setF] = useState({ from: '', to: '', loc: '', type: '', coach: '', status: '', payment: '', attention: false });
    const [limit, setLimit] = useState(PAGE);
    const [dlg, setDlg] = useState(null);
    const toast = A.useToast();
    const data = q.data;
    const now = data ? data.now : { date: app.today, time: '00:00' };

    const all = data ? data.bookings : [];
    const counts = useMemo(() => {
      const c = { upcoming: 0, requests: 0, past: 0, canceled: 0, all: all.length, awaiting: 0, attention: 0 };
      all.forEach((b) => {
        c[viewOf(b, now)]++;
        if (b.status === 'awaiting_payment' && !isPast(b, now)) c.awaiting++;
        if (b.attention) c.attention++;
      });
      return c;
    }, [all, now]);

    const filtered = useMemo(() => {
      const s = search.trim().toLowerCase();
      let rows = all.filter((b) => (view === 'all' || viewOf(b, now) === view));
      if (s) rows = rows.filter((b) => [b.form.athlete, b.form.parent, b.form.email, b.form.phone, b.athlete.name, b.family.parent, b.family.email, b.id].some((x) => x && String(x).toLowerCase().includes(s)));
      if (f.from) rows = rows.filter((b) => (b.date || b.created_at.slice(0, 10)) >= f.from);
      if (f.to) rows = rows.filter((b) => (b.date || b.created_at.slice(0, 10)) <= f.to);
      if (f.loc) rows = rows.filter((b) => b.loc_id === f.loc || (b.request && b.request.loc_id === f.loc));
      if (f.type) rows = rows.filter((b) => b.type_id === f.type);
      if (f.coach) rows = rows.filter((b) => (b.coach_id || '') === f.coach);
      if (f.status) rows = rows.filter((b) => b.status === f.status);
      if (f.payment) rows = rows.filter((b) => b.payment_status === f.payment);
      if (f.attention) rows = rows.filter((b) => b.attention);
      const key = (b) => (b.date ? b.date + 'T' + b.time : b.created_at);
      if (view === 'upcoming' || view === 'requests') rows.sort((a, b) => (view === 'requests' ? a.created_at.localeCompare(b.created_at) : key(a).localeCompare(key(b))));
      else rows.sort((a, b) => key(b).localeCompare(key(a)));
      return rows;
    }, [all, view, search, f, now]);
    const activeFilters = Object.entries(f).filter(([, v]) => v).length;

    const exportCsv = async (kind) => {
      const stampName = 'lsl-' + kind + '-' + app.today + '.csv';
      if (kind === 'bookings') {
        A.downloadCsv(stampName, [['Booking ID', 'Status', 'Date', 'Time', 'Time zone', 'Service', 'Location', 'Athlete', 'Age/Grade', 'Parent', 'Email', 'Phone', 'Players', 'Payment', 'Attendance', ...(app.isDirector ? ['Net paid'] : []), 'Created'],
          ...filtered.map((b) => [b.id, A.BOOKING[b.status].label, b.date || '', b.time ? LSL.fmtTime(b.time) : '', b.date ? LSL.tzLabel(b.date, b.time) : '', b.snapshot.service_name, (b.snapshot.location || {}).name || (b.request || {}).location || '',
            b.form.athlete, b.form.age, b.form.parent, b.form.email, b.form.phone, b.players || '', A.PAYMENT[b.payment_status].label, A.ATTENDANCE[b.attendance].label,
            ...(app.isDirector ? [b.net_paid_cents == null ? '' : (b.net_paid_cents / 100).toFixed(2)] : []), b.created_at])]);
      } else if (kind === 'attendance') {
        A.downloadCsv(stampName, [['Date', 'Time', 'Athlete', 'Service', 'Location', 'Attendance', 'Booking status'],
          ...filtered.filter((b) => b.kind === 'dated').map((b) => [b.date, LSL.fmtTime(b.time), b.form.athlete, b.snapshot.service_name, (b.snapshot.location || {}).name || '', A.ATTENDANCE[b.attendance].label, A.BOOKING[b.status].label])]);
      } else {
        try {
          const r = await A.api('GET', '/api/admin/payments');
          const ids = new Set(filtered.map((b) => b.id));
          A.downloadCsv(stampName, [['Recorded', 'Paid on', 'Booking ID', 'Athlete', 'Session date', 'Source', 'Type', 'Amount', 'Method', 'Status', 'Stripe checkout', 'Note'],
            ...r.payments.filter((p) => !p.booking_id || ids.has(p.booking_id)).map((p) => [p.created_at, p.paid_on || '', p.booking_id || (p.family_package_id ? 'package ' + p.family_package_id : ''), p.form.athlete || '', p.date || '',
              p.source, p.kind, (p.amount_cents / 100).toFixed(2), p.method || '', p.status, p.stripe_session_id || '', p.note || ''])]);
        } catch (e) { toast(e.message, 'err'); }
      }
    };

    if (q.loading && !data) return <div>{[1, 2, 3].map((i) => <div key={i} className="lsl-a-skel" />)}</div>;
    if (q.error && !data) return <A.ErrorState error={q.error} onRetry={q.reload} />;

    const Stat = ({ n, label, onClick, alert }) => (
      <button className={'lsl-a-stat lsl-a-stat--btn' + (alert && n ? ' is-alert' : '')} onClick={onClick}><b>{n}</b><span>{label}</span></button>
    );

    return (
      <div>
        <div className="lsl-a-counts">
          <Stat n={counts.upcoming} label="Upcoming" onClick={() => { setView('upcoming'); setF({ ...f, status: '', attention: false }); }} />
          <Stat n={counts.requests} label="Pending requests" alert onClick={() => setView('requests')} />
          <Stat n={counts.awaiting} label="Awaiting payment" alert onClick={() => { setView('upcoming'); setF({ ...f, status: 'awaiting_payment' }); }} />
          {counts.attention > 0 && <Stat n={counts.attention} label="Needs attention" alert onClick={() => { setView('all'); setF({ ...f, attention: true }); }} />}
        </div>
        <div className="lsl-a-subtabs" role="tablist" aria-label="Booking views">
          {VIEWS.map(([k, l]) => <button key={k} role="tab" aria-selected={view === k} onClick={() => { setView(k); setLimit(PAGE); }}>{l}<span className="lsl-a-count">{counts[k]}</span></button>)}
        </div>
        <div className="lsl-a-searchrow">
          <div className="lsl-a-search">
            <Icon name="search" />
            <input className="lsl-input" type="search" placeholder="Search athlete, parent, email, phone" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search bookings" />
          </div>
          <button className="lsl-a-iconbtn" onClick={q.reload} aria-label="Refresh bookings" title="Refresh"><Icon name={q.loading ? 'loader-circle' : 'refresh-cw'} className={q.loading ? 'lsl-a-spin' : ''} /></button>
        </div>
        <Expand title={'Filters' + (activeFilters ? ' (' + activeFilters + ' on)' : '')} icon="sliders-horizontal">
          <div className="lsl-a-grid">
            <Field label="From"><input className="lsl-input" type="date" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} /></Field>
            <Field label="To"><input className="lsl-input" type="date" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} /></Field>
            <Field label="Location"><select className="lsl-select" value={f.loc} onChange={(e) => setF({ ...f, loc: e.target.value })}><option value="">Any</option>{app.locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select></Field>
            <Field label="Session type"><select className="lsl-select" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}><option value="">Any</option>{app.types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></Field>
            {app.coaches.length > 1 && app.isDirector && <Field label="Coach"><select className="lsl-select" value={f.coach} onChange={(e) => setF({ ...f, coach: e.target.value })}><option value="">Any</option>{app.coaches.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>}
            <Field label="Booking status"><select className="lsl-select" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}><option value="">Any</option>{Object.entries(A.BOOKING).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></Field>
            <Field label="Payment status"><select className="lsl-select" value={f.payment} onChange={(e) => setF({ ...f, payment: e.target.value })}><option value="">Any</option>{Object.entries(A.PAYMENT).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></Field>
          </div>
          <div className="lsl-a-row" style={{ marginTop: 10 }}>
            <label className="lsl-a-check"><input type="checkbox" checked={f.attention} onChange={(e) => setF({ ...f, attention: e.target.checked })} /> Only bookings that need attention</label>
            <span className="lsl-a-spacer" />
            {activeFilters > 0 && <button className="lsl-a-linkbtn" onClick={() => setF({ from: '', to: '', loc: '', type: '', coach: '', status: '', payment: '', attention: false })}>Clear filters</button>}
          </div>
        </Expand>
        <Expand title="Export CSV" icon="download">
          <p className="lsl-a-muted lsl-a-small" style={{ marginTop: 0 }}>Exports what's currently shown ({A.plural(filtered.length, 'booking')}).</p>
          <div className="lsl-a-row">
            <button className="lsl-btn lsl-btn--ghost lsl-btn--xs" onClick={() => exportCsv('bookings')}><Icon name="file-spreadsheet" /> Bookings</button>
            <button className="lsl-btn lsl-btn--ghost lsl-btn--xs" onClick={() => exportCsv('attendance')}><Icon name="user-check" /> Attendance</button>
            {app.isDirector && <button className="lsl-btn lsl-btn--ghost lsl-btn--xs" onClick={() => exportCsv('payments')}><Icon name="receipt" /> Payment records</button>}
          </div>
        </Expand>
        <div style={{ height: 12 }} />
        {filtered.length === 0 ? (
          <A.Empty icon={view === 'requests' ? 'inbox' : 'calendar'}>
            {all.length === 0 ? 'No bookings yet. They\'ll appear here as families reserve openings.' : search || activeFilters ? 'No bookings match your search or filters.' : 'Nothing in ' + VIEWS.find((v) => v[0] === view)[1].toLowerCase() + ' right now.'}
          </A.Empty>
        ) : (
          <div className="lsl-admin__list">
            {filtered.slice(0, limit).map((b) => <BookingCard key={b.id} b={b} now={now} onAction={(kind) => setDlg({ kind, b })} />)}
          </div>
        )}
        {filtered.length > limit && <div className="lsl-a-more"><button className="lsl-btn lsl-btn--ghost lsl-btn--sm" onClick={() => setLimit(limit + PAGE)}>Show more ({filtered.length - limit} left)</button></div>}
        {dlg && dlg.kind === 'cancel' && <CancelDialog b={dlg.b} onClose={() => setDlg(null)} onDone={app.changed} />}
        {dlg && dlg.kind === 'approve' && <ApproveDialog b={dlg.b} onClose={() => setDlg(null)} onDone={app.changed} />}
        {dlg && dlg.kind === 'offer' && <OfferDialog b={dlg.b} onClose={() => setDlg(null)} onDone={app.changed} />}
        {dlg && dlg.kind === 'decline' && <DeclineDialog b={dlg.b} onClose={() => setDlg(null)} onDone={app.changed} />}
      </div>
    );
  }

  function BookingCard({ b, now, onAction }) {
    const app = A.useApp();
    const req = b.status === 'requested';
    const closed = CLOSED.includes(b.status);
    const past = isPast(b, now);
    const loc = (b.snapshot.location || {}).name;
    return (
      <div className={'lsl-admin__booking' + (b.attention ? ' is-attn' : '') + (closed ? ' is-closed' : '')}>
        <div className="lsl-admin__bookhead">
          <button className="lsl-a-athbtn" onClick={() => app.openBooking(b.id)} aria-label={'Open booking for ' + b.form.athlete}>{b.form.athlete}</button>
          {req
            ? <span className="lsl-pill lsl-pill--outline">{requestLine(b)}</span>
            : b.date ? <span className="lsl-pill lsl-pill--sky">{LSL.fmtDate(b.date)} · {LSL.fmtTime(b.time)} {LSL.tzLabel(b.date, b.time)}</span> : null}
        </div>
        <div className="lsl-admin__bookmeta">
          {b.snapshot.service_name}{b.players ? ' · ' + b.players + ' players' : ''}{loc ? ' · ' + loc : ''}{b.coach_id && app.coaches.length > 1 ? ' · ' + (app.coachName(b.coach_id) || '') : ''}<br />
          Parent: {b.form.parent} · {b.form.email}{b.form.phone ? ' · ' + b.form.phone : ''}<br />
          {[b.form.age && 'Age/Grade: ' + b.form.age, b.form.focus && 'Focus: ' + b.form.focus].filter(Boolean).join(' · ')}
          {b.form.notes ? <><br />Notes: {b.form.notes}</> : null}
        </div>
        <div className="lsl-a-badges">
          <StatusBadge kind="booking" value={b.status} />
          <StatusBadge kind="payment" value={b.payment_status} />
          {b.kind === 'dated' && (past || b.attendance !== 'not_recorded') && <StatusBadge kind="attendance" value={b.attendance} />}
          {b.status === 'awaiting_payment' && b.hold_expires_at && <Badge tone="warn" icon="timer">Hold until {LSL.fmtInstant(b.hold_expires_at)}</Badge>}
          {b.legacy && <Badge tone="muted" icon="archive" title="Imported from the previous booking system">Imported</Badge>}
          {b.failed_notices > 0 && <Badge tone="danger" icon="mail-x">Email failed</Badge>}
        </div>
        {b.attention && <div className="lsl-a-attn" role="note"><Icon name="triangle-alert" />{b.attention}</div>}
        <div className="lsl-admin__bookactions">
          <button className="lsl-btn lsl-btn--ghost lsl-btn--sm" onClick={() => app.openBooking(b.id)}><Icon name="panel-right-open" /> Details</button>
          {req && <>
            <button className="lsl-btn lsl-btn--ghost lsl-btn--sm" onClick={() => onAction('approve')}><Icon name="check" /> Approve</button>
            <button className="lsl-btn lsl-btn--ghost lsl-btn--sm" onClick={() => onAction('offer')}><Icon name="calendar-clock" /> Offer a time</button>
            <button className="lsl-admin__del lsl-admin__del--text" onClick={() => onAction('decline')}><Icon name="x" /> Decline</button>
          </>}
          {!req && b.date && <button className="lsl-btn lsl-btn--ghost lsl-btn--sm" onClick={() => LSL.downloadICS({ id: b.id, date: b.date, time: b.time, duration: b.duration, service: b.snapshot.service_name, location: loc, athlete: b.form.athlete, coach: b.snapshot.coach_name })}><Icon name="calendar-plus" /> .ics</button>}
          {b.family && b.family.id && <button className="lsl-btn lsl-btn--ghost lsl-btn--sm" onClick={() => app.openFamily(b.family.id)}><Icon name="users" /> Family</button>}
          {!req && !closed && b.status !== 'completed' && <button className="lsl-admin__del lsl-admin__del--text" onClick={() => onAction('cancel')}><Icon name="x" /> Cancel &amp; reopen</button>}
        </div>
      </div>
    );
  }

  /* ---------------- Booking details ---------------- */
  function BookingDialog({ id, onClose }) {
    const app = A.useApp();
    const toast = A.useToast();
    const q = A.useFetch('/api/admin/bookings/' + id, [app.version]);
    const [edit, setEdit] = useState(null);
    const [saving, setSaving] = useState(false);
    const [sub, setSub] = useState(null);
    const [busy, run] = A.useAction();
    const d = q.data;
    useEffect(() => { if (d) setEdit({ form: { ...d.booking.form }, private_notes: d.booking.private_notes || '', roster: d.booking.roster || [], payer_mode: d.booking.payer_mode }); }, [d]);
    if (!d || !edit) {
      return <Dialog title="Booking" onClose={onClose} wide>{q.error ? <A.ErrorState error={q.error} onRetry={q.reload} /> : <A.Loading />}</Dialog>;
    }
    const b = d.booking;
    const dirty = JSON.stringify(edit) !== JSON.stringify({ form: b.form, private_notes: b.private_notes || '', roster: b.roster || [], payer_mode: b.payer_mode });
    const save = async () => {
      setSaving(true);
      try { await A.api('PATCH', '/api/admin/bookings/' + id, edit); toast('Booking saved'); app.changed(); } catch (e) { toast(e.message, 'err'); } finally { setSaving(false); }
    };
    const act = (path, body, msg) => run(() => A.api('POST', '/api/admin/bookings/' + id + path, body), msg).then(() => app.changed()).catch(() => {});
    const closed = CLOSED.includes(b.status);
    const loc = b.snapshot.location || {};
    const setForm = (k) => (e) => setEdit({ ...edit, form: { ...edit.form, [k]: e.target.value } });
    const phoneDigits = (b.form.phone || '').replace(/[^\d+]/g, '');
    const resendKind = b.status === 'requested' ? 'request_received' : 'confirmation';
    const canResend = b.status === 'requested' || b.status === 'confirmed' || b.status === 'completed';
    const lastNotice = d.notifications[d.notifications.length - 1];

    return (
      <Dialog title={b.form.athlete + ' — ' + (b.snapshot.service_name || 'Booking')} onClose={onClose} wide busy={saving}
        footer={<>
          {dirty && <span className="lsl-a-inline-status is-dirty"><Icon name="pencil" /> Unsaved changes</span>}
          <span className="lsl-a-spacer" />
          <button className="lsl-btn lsl-btn--ghost lsl-btn--sm" onClick={onClose}>Close</button>
          <button className="lsl-btn lsl-btn--primary lsl-btn--sm" onClick={save} disabled={!dirty || saving}>{saving ? 'Saving…' : 'Save changes'}</button>
        </>}>
        <div className="lsl-a-badges" style={{ marginTop: 0, marginBottom: 12 }}>
          <StatusBadge kind="booking" value={b.status} /><StatusBadge kind="payment" value={b.payment_status} />{b.kind === 'dated' && <StatusBadge kind="attendance" value={b.attendance} />}
          {b.legacy && <Badge tone="muted" icon="archive">Imported</Badge>}
        </div>
        {b.attention && <A.Banner tone="warn">{b.attention} <button className="lsl-a-linkbtn" onClick={() => run(() => A.api('PATCH', '/api/admin/bookings/' + id, { clear_attention: true }), 'Marked as handled').then(app.changed)}>Mark handled</button></A.Banner>}
        {b.legacy && b.payment_status === 'unknown' && <A.Banner tone="info">Imported from the old system, which never confirmed payment with Stripe. Check Stripe and record the payment here if it was paid.</A.Banner>}

        <div className="lsl-a-block">
          <dl className="lsl-a-dl">
            {b.date ? <><dt>When</dt><dd>{LSL.fmtDateLong(b.date)} · {LSL.fmtTime(b.time)}–{LSL.fmtTime(A.endTime(b.time, b.duration))} {LSL.tzLabel(b.date, b.time)}</dd></> : <><dt>Requested</dt><dd>{requestLine(b)}</dd></>}
            {loc.name && <><dt>Location</dt><dd>{loc.name}{loc.facility_name ? ' · ' + loc.facility_name : ''}{loc.address ? <><br /><span className="lsl-a-muted">{loc.address}</span></> : null}</dd></>}
            <dt>Coach</dt><dd>{b.snapshot.coach_name || '—'}</dd>
            {b.players && <><dt>Players</dt><dd>{b.players}</dd></>}
            {b.hold_expires_at && b.status === 'awaiting_payment' && <><dt>Hold</dt><dd>Reserved until {LSL.fmtInstant(b.hold_expires_at)} while the family pays</dd></>}
            <dt>Booked</dt><dd>{A.stamp(b.created_at)} · ID <span className="lsl-a-mono">{b.id}</span></dd>
          </dl>
        </div>

        <div className="lsl-a-row" style={{ marginBottom: 16 }}>
          {b.status === 'requested' && <>
            <button className="lsl-btn lsl-btn--primary lsl-btn--xs" onClick={() => setSub('approve')}><Icon name="check" /> Approve</button>
            <button className="lsl-btn lsl-btn--ghost lsl-btn--xs" onClick={() => setSub('offer')}><Icon name="calendar-clock" /> Offer a time</button>
            <button className="lsl-btn lsl-btn--ghost lsl-btn--xs" onClick={() => setSub('decline')}><Icon name="x" /> Decline</button>
          </>}
          {b.kind === 'dated' && ['awaiting_payment', 'confirmed'].includes(b.status) && <button className="lsl-btn lsl-btn--ghost lsl-btn--xs" onClick={() => setSub('reschedule')}><Icon name="calendar-range" /> Reschedule</button>}
          {canResend && <button className="lsl-btn lsl-btn--ghost lsl-btn--xs" disabled={busy} onClick={() => act('/resend', { kind: resendKind }, (r) => r.notice.status === 'sent' ? 'Email sent' : 'Not sent: ' + (r.notice.detail || r.notice.status))}><Icon name="send" /> Resend {resendKind === 'confirmation' ? 'confirmation' : 'receipt'}</button>}
          {b.form.email && <a className="lsl-btn lsl-btn--ghost lsl-btn--xs" href={'mailto:' + b.form.email + '?subject=' + encodeURIComponent('LakeShore Legends — ' + b.form.athlete)}><Icon name="mail" /> Email</a>}
          {phoneDigits && <a className="lsl-btn lsl-btn--ghost lsl-btn--xs" href={'sms:' + phoneDigits}><Icon name="message-square" /> Text</a>}
          {phoneDigits && <a className="lsl-btn lsl-btn--ghost lsl-btn--xs" href={'tel:' + phoneDigits}><Icon name="phone" /> Call</a>}
          {b.date && <button className="lsl-btn lsl-btn--ghost lsl-btn--xs" onClick={() => LSL.downloadICS({ id: b.id, date: b.date, time: b.time, duration: b.duration, service: b.snapshot.service_name, location: loc.name, athlete: b.form.athlete, coach: b.snapshot.coach_name })}><Icon name="calendar-plus" /> .ics</button>}
          {b.family_id && <button className="lsl-btn lsl-btn--ghost lsl-btn--xs" onClick={() => { app.openFamily(b.family_id); }}><Icon name="users" /> Family</button>}
          {!closed && b.status !== 'completed' && b.kind === 'dated' && <button className="lsl-btn lsl-btn--ghost lsl-btn--xs" onClick={() => setSub('cancel')}><Icon name="circle-x" /> Cancel…</button>}
        </div>
        {lastNotice && <p className="lsl-a-muted lsl-a-small">Last email: {lastNotice.kind.replace('_', ' ')} — <strong>{lastNotice.status}</strong>{lastNotice.detail ? ' (' + lastNotice.detail + ')' : ''} · {A.stamp(lastNotice.created_at)}</p>}

        {b.kind === 'dated' && !['requested', 'declined', 'expired'].includes(b.status) && (
          <div className="lsl-a-block">
            <div className="lsl-a-h4">Attendance</div>
            <Seg label="Attendance" value={b.attendance} onChange={(v) => act('/attendance', { attendance: v }, 'Attendance saved')}
              options={Object.entries(A.ATTENDANCE).map(([k, v]) => [k, v.label])} />
          </div>
        )}

        <div className="lsl-a-block lsl-a-familyvis">
          <div className="lsl-a-familyvis__label"><Icon name="eye" size={13} /> Family-provided details (the family sees these in emails)</div>
          <div className="lsl-a-grid">
            <Field label="Parent / guardian"><input className="lsl-input" value={edit.form.parent || ''} onChange={setForm('parent')} /></Field>
            <Field label="Athlete"><input className="lsl-input" value={edit.form.athlete || ''} onChange={setForm('athlete')} /></Field>
            <Field label="Email"><input className="lsl-input" type="email" value={edit.form.email || ''} onChange={setForm('email')} /></Field>
            <Field label="Phone"><input className="lsl-input" value={edit.form.phone || ''} onChange={setForm('phone')} /></Field>
            <Field label="Age / grade"><input className="lsl-input" value={edit.form.age || ''} onChange={setForm('age')} /></Field>
            <Field label="Focus / goals"><input className="lsl-input" value={edit.form.focus || ''} onChange={setForm('focus')} /></Field>
          </div>
          <Field label="Family's notes"><textarea className="lsl-textarea" value={edit.form.notes || ''} onChange={setForm('notes')} style={{ minHeight: 60 }} /></Field>
        </div>

        <div className="lsl-a-block lsl-a-private">
          <div className="lsl-a-private__label"><Icon name="lock" size={13} /> Private coaching notes — never shown to families</div>
          <textarea className="lsl-textarea" aria-label="Private coaching notes" value={edit.private_notes} onChange={(e) => setEdit({ ...edit, private_notes: e.target.value })} placeholder="What you worked on, what to focus on next time…" style={{ minHeight: 80 }} />
        </div>

        {(b.roster.length > 1 || (b.players && b.players !== '1')) && (
          <div className="lsl-a-block">
            <div className="lsl-a-h4">Group roster</div>
            <div className="lsl-a-row" style={{ marginBottom: 10 }}>
              <Seg label="Who pays" value={edit.payer_mode} onChange={(v) => setEdit({ ...edit, payer_mode: v })} options={[['one', 'One person pays for the group'], ['each', 'Each athlete pays']]} />
            </div>
            <div className="lsl-a-roster">
              {edit.roster.map((m, i) => (
                <div key={i} className="lsl-a-roster__row">
                  <input className="lsl-input" aria-label={'Participant ' + (i + 1) + ' name'} value={m.name || ''} onChange={(e) => setEdit({ ...edit, roster: edit.roster.map((x, j) => j === i ? { ...x, name: e.target.value } : x) })} placeholder="Name" />
                  <input className="lsl-input" aria-label={'Participant ' + (i + 1) + ' contact'} value={m.contact || ''} onChange={(e) => setEdit({ ...edit, roster: edit.roster.map((x, j) => j === i ? { ...x, contact: e.target.value } : x) })} placeholder="Email or phone" />
                  {edit.payer_mode === 'each' ? <label className="lsl-a-check"><input type="checkbox" checked={!!m.paid} onChange={(e) => setEdit({ ...edit, roster: edit.roster.map((x, j) => j === i ? { ...x, paid: e.target.checked } : x) })} /> Paid</label> : <span />}
                  {!m.primary ? <button className="lsl-admin__del" aria-label="Remove participant" onClick={() => setEdit({ ...edit, roster: edit.roster.filter((_, j) => j !== i) })}><Icon name="trash-2" /></button> : <Badge tone="muted">Booker</Badge>}
                </div>
              ))}
            </div>
            <button className="lsl-btn lsl-btn--ghost lsl-btn--xs" style={{ marginTop: 8 }} onClick={() => setEdit({ ...edit, roster: [...edit.roster, { name: '', contact: '' }] })}><Icon name="plus" /> Add participant</button>
          </div>
        )}

        {app.isDirector && <PaymentPanel d={d} onChanged={app.changed} />}

        <Expand title={'History (' + (d.events.length + d.notifications.length) + ')'} icon="history">
          <ul className="lsl-a-timeline">
            {[...d.events.map((e) => ({ at: e.at, text: eventText(e, app) })), ...d.notifications.map((n) => ({ at: n.created_at, text: 'Email "' + n.kind.replace(/_/g, ' ') + '" → ' + (n.to_addr || 'no address') + ': ' + n.status + (n.detail ? ' — ' + n.detail : '') }))]
              .sort((x, y) => x.at.localeCompare(y.at)).map((e, i) => <li key={i}><time>{A.stamp(e.at)}</time><span>{e.text}</span></li>)}
          </ul>
        </Expand>

        {sub === 'cancel' && <CancelDialog b={b} onClose={() => setSub(null)} onDone={app.changed} />}
        {sub === 'reschedule' && <RescheduleDialog b={b} onClose={() => setSub(null)} onDone={app.changed} />}
        {sub === 'approve' && <ApproveDialog b={b} onClose={() => setSub(null)} onDone={app.changed} />}
        {sub === 'offer' && <OfferDialog b={b} onClose={() => setSub(null)} onDone={app.changed} />}
        {sub === 'decline' && <DeclineDialog b={b} onClose={() => setSub(null)} onDone={app.changed} />}
      </Dialog>
    );
  }

  function eventText(e, app) {
    const who = e.actor === 'family' ? 'Family' : e.actor === 'stripe' ? 'Stripe' : e.actor === 'system' ? 'System' : (app.coachName(e.actor) || 'Coach');
    const d = e.data || {};
    const t = {
      created: 'booking created (' + (A.BOOKING[d.status] || {}).label + ')', requested: 'request submitted', imported: 'imported from the old system',
      confirmed: 'confirmed' + (d.reason ? ' (' + d.reason.replace(/_/g, ' ') + ')' : ''), payment_succeeded: 'payment verified by Stripe', payment_pending: 'payment started, waiting for bank confirmation',
      payment_failed: 'payment failed', refund: 'refund reported (' + (d.status || '').replace('_', ' ') + ')', hold_expired: 'checkout hold expired — opening released',
      checkout_expired: 'Stripe checkout expired', late_payment_conflict: 'late payment, but the time was taken', offline_payment: 'recorded ' + A.money(d.amount_cents) + ' via ' + d.method,
      offline_refund: 'recorded refund of ' + A.money(d.amount_cents), complimentary: 'marked complimentary', credit_redeemed: 'package credit applied',
      rescheduled: 'moved from ' + (d.from && d.from.date ? LSL.fmtDate(d.from.date) + ' ' + LSL.fmtTime(d.from.time) : '?') + ' to ' + (d.to ? LSL.fmtDate(d.to.date) + ' ' + LSL.fmtTime(d.to.time) : '?'),
      canceled: 'canceled — opening ' + (d.reopen ? 'reopened' : 'removed') + ', payment: ' + (d.payment_outcome || 'unchanged').replace('_', ' ') + (d.notify ? ', family notified' : ''),
      approved: 'request approved for ' + (d.date ? LSL.fmtDate(d.date) + ' ' + LSL.fmtTime(d.time) : ''), offered_times: 'offered ' + A.plural((d.options || []).length, 'time'),
      declined: 'request declined', attendance: 'attendance: ' + ((A.ATTENDANCE[d.attendance] || {}).label || d.attendance), edited: 'edited ' + (d.fields || []).join(', '),
      resent: 'resent ' + (d.kind || '').replace('_', ' ') + ' (' + d.status + ')', location_details_updated: 'location details updated', conflict_rollback: 'reservation rolled back (time conflict)',
    }[e.type] || e.type.replace(/_/g, ' ');
    return who + ': ' + t;
  }

  function PaymentPanel({ d, onChanged }) {
    const b = d.booking;
    const app = A.useApp();
    const [busy, run] = A.useAction();
    const [pay, setPay] = useState({ amount: b.snapshot.price_cents != null ? (b.snapshot.price_cents / 100).toFixed(2) : '', method: 'venmo', paid_on: app.today, note: '', kind: 'charge' });
    const [err, setErr] = useState('');
    const usable = d.packages.filter((p) => p.status === 'active' && (p.balance == null || p.balance > 0) && (!p.snapshot.eligible_type_ids || p.snapshot.eligible_type_ids.includes(b.type_id)));
    const [pkg, setPkg] = useState('');
    const record = () => {
      setErr('');
      const cents = A.parseMoney(pay.amount);
      if (!(cents > 0)) { setErr('Enter an amount.'); return; }
      run(() => A.api('POST', '/api/admin/bookings/' + b.id + '/payments', { amount_cents: cents, method: pay.method, paid_on: pay.paid_on, note: pay.note, kind: pay.kind }),
        pay.kind === 'refund' ? 'Refund recorded' : 'Payment recorded').then(onChanged).catch((e) => setErr(e.message));
    };
    return (
      <div className="lsl-a-block">
        <div className="lsl-a-h4">Payment</div>
        <p className="lsl-a-small" style={{ marginTop: 0 }}>
          Price when booked: <strong>{b.snapshot.price_cents != null ? A.money(b.snapshot.price_cents) + (b.snapshot.pricing_basis === 'athlete' ? ' per athlete' : ' per session') : 'not recorded (Stripe price not verified)'}</strong>
        </p>
        {d.payments.length > 0 ? (
          <ul className="lsl-a-list">
            {d.payments.map((p) => (
              <li key={p.id}>
                <Badge tone={p.kind === 'refund' ? 'orange' : p.status === 'succeeded' ? 'green' : p.status === 'failed' ? 'danger' : 'warn'} icon={p.kind === 'refund' ? 'undo-2' : 'receipt'}>{p.kind === 'refund' ? 'Refund' : p.status}</Badge>
                <strong>{A.money(p.amount_cents)}</strong> · {p.source === 'stripe' ? 'Stripe' : p.method} · {p.paid_on || A.stamp(p.created_at)}
                {p.recorded_by && <span className="lsl-a-muted">· recorded by {app.coachName(p.recorded_by) || 'coach'}</span>}
                {p.note && <span className="lsl-a-muted">· {p.note}</span>}
              </li>
            ))}
          </ul>
        ) : <p className="lsl-a-muted lsl-a-small">No payments on record.{b.payment_status === 'unknown' ? ' Payment status is Unknown — a booking record alone doesn\'t prove payment.' : ''}</p>}
        <div className="lsl-a-row" style={{ margin: '10px 0' }}>
          {b.status === 'awaiting_payment' && <button className="lsl-btn lsl-btn--ghost lsl-btn--xs" disabled={busy} onClick={() => run(() => A.api('POST', '/api/admin/bookings/' + b.id + '/confirm'), 'Confirmed — payment still outstanding').then(onChanged)}>Confirm now, collect payment later</button>}
          {!['complimentary', 'paid'].includes(b.payment_status) && <button className="lsl-btn lsl-btn--ghost lsl-btn--xs" disabled={busy} onClick={() => run(() => A.api('POST', '/api/admin/bookings/' + b.id + '/complimentary'), 'Marked complimentary').then(onChanged)}>Mark complimentary</button>}
        </div>
        <Expand title="Record an offline payment or refund" icon="hand-coins">
          <div className="lsl-a-grid">
            <Field label="Type"><select className="lsl-select" value={pay.kind} onChange={(e) => setPay({ ...pay, kind: e.target.value })}><option value="charge">Payment received</option><option value="refund">Refund given</option></select></Field>
            <Field label="Amount ($)" error={err || null}><input className="lsl-input" inputMode="decimal" value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} /></Field>
            <Field label="Method"><select className="lsl-select" value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })}>{METHODS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>
            <Field label="Date"><input className="lsl-input" type="date" value={pay.paid_on} onChange={(e) => setPay({ ...pay, paid_on: e.target.value })} /></Field>
          </div>
          <Field label="Note (optional)"><input className="lsl-input" value={pay.note} onChange={(e) => setPay({ ...pay, note: e.target.value })} placeholder="e.g. Venmo @parent-name" /></Field>
          <button className="lsl-btn lsl-btn--primary lsl-btn--xs" onClick={record} disabled={busy}>Record {pay.kind === 'refund' ? 'refund' : 'payment'}</button>
          <p className="lsl-a-muted lsl-a-small">Recorded with your name and the time for the audit trail. Card refunds for online payments are issued in Stripe; they appear here automatically.</p>
        </Expand>
        {usable.length > 0 && b.payment_status !== 'package_credit' && (
          <Expand title="Use a package credit" icon="ticket">
            <div className="lsl-a-row">
              <select className="lsl-select" style={{ width: 'auto', flex: 1 }} value={pkg} onChange={(e) => setPkg(e.target.value)} aria-label="Package">
                <option value="">Choose a package…</option>
                {usable.map((p) => <option key={p.id} value={p.id}>{p.snapshot.name} — {p.balance == null ? 'unlimited' : p.balance + ' left'}{p.expires_on ? ', expires ' + LSL.fmtDate(p.expires_on) : ''}</option>)}
              </select>
              <button className="lsl-btn lsl-btn--primary lsl-btn--xs" disabled={!pkg || busy} onClick={() => run(() => A.api('POST', '/api/admin/bookings/' + b.id + '/redeem', { family_package_id: pkg }), 'Credit applied').then(onChanged)}>Apply 1 credit</button>
            </div>
          </Expand>
        )}
      </div>
    );
  }

  /* ---------------- Cancel ---------------- */
  function CancelDialog({ b, onClose, onDone }) {
    const app = A.useApp();
    const toast = A.useToast();
    const q = A.useFetch('/api/admin/bookings/' + b.id + '/cancel');
    const [v, setV] = useState({ reopen: true, notify: false, payment_outcome: 'unchanged', reason: '', override_policy: false });
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');
    const info = q.data;
    const emailOk = app.integrations ? app.integrations.email.configured : null;
    const paid = ['paid', 'partially_refunded'].includes(b.payment_status);
    const submit = async () => {
      setBusy(true); setErr('');
      try {
        const r = await A.api('POST', '/api/admin/bookings/' + b.id + '/cancel', v);
        toast('Booking canceled' + (r.notice ? ' — email ' + r.notice.status : ''));
        onDone(); onClose();
      } catch (e) { setErr(e.message); } finally { setBusy(false); }
    };
    return (
      <Dialog title={'Cancel ' + b.form.athlete + "'s session"} onClose={onClose} busy={busy}
        footer={<><button className="lsl-btn lsl-btn--ghost lsl-btn--sm" onClick={onClose}>Keep booking</button><button className="lsl-btn lsl-btn--danger lsl-btn--sm" onClick={submit} disabled={busy || !info}>{busy ? 'Canceling…' : 'Cancel booking'}</button></>}>
        <p className="lsl-body lsl-body--sm" style={{ marginTop: 0 }}>{b.snapshot.service_name} · {b.date ? LSL.fmtDateLong(b.date) + ' at ' + LSL.fmtTime(b.time) : ''}</p>
        {!info ? <A.Loading /> : <>
          <A.Banner tone="info"><strong>Policy:</strong> {info.policy.rule}{info.policy.hours != null ? ' (' + (info.policy.hours >= 0 ? info.policy.hours + ' hours before the session' : 'session already started') + ')' : ''}</A.Banner>
          <fieldset style={{ border: 0, padding: 0, margin: '0 0 14px' }}>
            <legend className="lsl-a-h4">The opening</legend>
            <label className="lsl-a-check" style={{ display: 'flex', marginBottom: 6 }}><input type="radio" name="reopen" checked={v.reopen} onChange={() => setV({ ...v, reopen: true })} /> Reopen it so another family can book this time</label>
            <label className="lsl-a-check" style={{ display: 'flex' }}><input type="radio" name="reopen" checked={!v.reopen} onChange={() => setV({ ...v, reopen: false })} /> Remove it (I'm no longer available then)</label>
          </fieldset>
          <fieldset style={{ border: 0, padding: 0, margin: '0 0 14px' }}>
            <legend className="lsl-a-h4">The family</legend>
            <label className="lsl-a-check"><input type="checkbox" checked={v.notify} disabled={!info.email_on_file} onChange={(e) => setV({ ...v, notify: e.target.checked })} /> Email the family a cancellation notice</label>
            {v.notify && emailOk === false && <p className="lsl-a-small" style={{ color: '#8a5a00' }}>Email isn't set up yet, so no message will actually be sent — it will be logged as "skipped". Contact the family directly.</p>}
            {!v.notify && <p className="lsl-a-muted lsl-a-small">The family will not be notified automatically.</p>}
          </fieldset>
          {app.isDirector && (
            <fieldset style={{ border: 0, padding: 0, margin: '0 0 14px' }}>
              <legend className="lsl-a-h4">Payment ({A.PAYMENT[b.payment_status].label})</legend>
              <label className="lsl-a-check" style={{ display: 'flex', marginBottom: 6 }}><input type="radio" name="pay" checked={v.payment_outcome === 'unchanged'} onChange={() => setV({ ...v, payment_outcome: 'unchanged' })} /> Leave payment unchanged</label>
              {paid && <label className="lsl-a-check" style={{ display: 'flex', marginBottom: 6 }}><input type="radio" name="pay" checked={v.payment_outcome === 'refund_pending'} onChange={() => setV({ ...v, payment_outcome: 'refund_pending' })} /> Refund — I'll issue it in Stripe ({info.policy.refundPct}% per policy)</label>}
              <label className="lsl-a-check" style={{ display: 'flex', marginBottom: 6 }}><input type="radio" name="pay" checked={v.payment_outcome === 'credit'} onChange={() => setV({ ...v, payment_outcome: 'credit' })} /> Give the family a session credit instead</label>
              {info.credit_redeemed && <label className="lsl-a-check" style={{ display: 'flex' }}><input type="radio" name="pay" checked={v.payment_outcome === 'restore_credit'} onChange={() => setV({ ...v, payment_outcome: 'restore_credit' })} /> Restore the package credit that was used {info.policy.creditRestorable ? '(allowed by policy)' : '(outside the policy window)'}</label>}
              {v.payment_outcome === 'restore_credit' && !info.policy.creditRestorable && <label className="lsl-a-check" style={{ marginTop: 6 }}><input type="checkbox" checked={v.override_policy} onChange={(e) => setV({ ...v, override_policy: e.target.checked })} /> Override the policy for this family</label>}
              <p className="lsl-a-muted lsl-a-small">Canceling never refunds money by itself. Refunds are issued in Stripe and show up here automatically.</p>
            </fieldset>
          )}
          <Field label="Reason (internal)"><input className="lsl-input" value={v.reason} onChange={(e) => setV({ ...v, reason: e.target.value })} placeholder="e.g. Family sick, rescheduling next week" /></Field>
          {err && <A.Banner tone="danger">{err}</A.Banner>}
        </>}
      </Dialog>
    );
  }

  /* ---------------- Slot picker for reschedule / approve ---------------- */
  function SlotPicker({ value, onChange, excludeId }) {
    const app = A.useApp();
    const to = (() => { const [y, m, d] = app.today.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d + 45)).toISOString().slice(0, 10); })();
    const q = A.useFetch('/api/admin/schedule?from=' + app.today + '&to=' + to);
    const [custom, setCustom] = useState({ date: '', time: '', loc_id: (app.locations.find((l) => l.active) || {}).id || '' });
    const open = q.data ? q.data.slots.filter((s) => s.status === 'open' && s.id !== excludeId && !s.conflicts.some((c) => c.severity === 'hard')) : [];
    const mode = value && value.slot_id ? 'slot' : value && value.date ? 'custom' : (value && value.mode) || 'slot';
    return (
      <div>
        <Seg label="Choose time" value={mode} onChange={(m) => onChange(m === 'slot' ? { mode: 'slot' } : { mode: 'custom', ...custom })} options={[['slot', 'Pick an opening'], ['custom', 'Enter a time']]} />
        <div style={{ marginTop: 12 }}>
          {mode === 'slot' ? (q.loading ? <A.Loading /> : open.length === 0 ? <p className="lsl-a-muted lsl-a-small">No open times in the next 45 days. Enter a time instead.</p> : (
            <Field label="Opening">
              <select className="lsl-select" value={(value && value.slot_id) || ''} onChange={(e) => onChange({ mode: 'slot', slot_id: e.target.value })}>
                <option value="">Choose…</option>
                {open.map((s) => <option key={s.id} value={s.id}>{LSL.fmtDate(s.date)} · {LSL.fmtTime(s.time)} · {app.locName(s.loc_id)}{s.contingent ? ' (B2B)' : ''}</option>)}
              </select>
            </Field>
          )) : (
            <div className="lsl-a-grid">
              <Field label="Date"><input className="lsl-input" type="date" min={app.today} value={custom.date} onChange={(e) => { const c = { ...custom, date: e.target.value }; setCustom(c); onChange({ mode: 'custom', ...c }); }} /></Field>
              <Field label="Time"><input className="lsl-input" type="time" value={custom.time} onChange={(e) => { const c = { ...custom, time: e.target.value }; setCustom(c); onChange({ mode: 'custom', ...c }); }} /></Field>
              <Field label="Location"><select className="lsl-select" value={custom.loc_id} onChange={(e) => { const c = { ...custom, loc_id: e.target.value }; setCustom(c); onChange({ mode: 'custom', ...c }); }}>{app.locations.filter((l) => l.active).map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select></Field>
            </div>
          )}
        </div>
      </div>
    );
  }
  const targetBody = (t) => (t && t.slot_id ? { slot_id: t.slot_id } : t ? { date: t.date, time: t.time, loc_id: t.loc_id } : {});

  function RescheduleDialog({ b, onClose, onDone }) {
    const app = A.useApp();
    const toast = A.useToast();
    const [t, setT] = useState(null);
    const [notify, setNotify] = useState(true);
    const [reopen, setReopen] = useState(true);
    const [reason, setReason] = useState('');
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');
    const hrs = b.date ? (LSL.localToInstant(b.date, b.time, app.settings.timezone) - Date.now()) / 3600000 : null;
    const late = hrs != null && hrs < app.settings.cancellation.rescheduleHours;
    const submit = async () => {
      setBusy(true); setErr('');
      try {
        const r = await A.api('POST', '/api/admin/bookings/' + b.id + '/reschedule', { ...targetBody(t), notify, reopen_old: reopen, reason });
        toast('Rescheduled' + (r.notice ? ' — email ' + r.notice.status : ''));
        onDone(); onClose();
      } catch (e) { setErr(e.message); } finally { setBusy(false); }
    };
    return (
      <Dialog title={'Reschedule ' + b.form.athlete} onClose={onClose} busy={busy}
        footer={<><button className="lsl-btn lsl-btn--ghost lsl-btn--sm" onClick={onClose}>Cancel</button><button className="lsl-btn lsl-btn--primary lsl-btn--sm" onClick={submit} disabled={busy || !t || !(t.slot_id || (t.date && t.time))}>Move session</button></>}>
        <p className="lsl-body lsl-body--sm" style={{ marginTop: 0 }}>Currently {LSL.fmtDateLong(b.date)} at {LSL.fmtTime(b.time)}. The booking keeps its history, payment, and notes.</p>
        {late && <A.Banner tone="warn">This is within your {app.settings.cancellation.rescheduleHours}-hour rescheduling window. You can still move it as the coach.</A.Banner>}
        <SlotPicker value={t} onChange={setT} excludeId={b.slot_id} />
        <label className="lsl-a-check" style={{ margin: '12px 0 6px', display: 'flex' }}><input type="checkbox" checked={reopen} onChange={(e) => setReopen(e.target.checked)} /> Reopen the old time for other families</label>
        <label className="lsl-a-check" style={{ display: 'flex' }}><input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} /> Email the family the new time</label>
        <Field label="Reason (internal)" className=""><input className="lsl-input" value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
        {err && <A.Banner tone="danger">{err}</A.Banner>}
      </Dialog>
    );
  }

  function ApproveDialog({ b, onClose, onDone }) {
    const app = A.useApp();
    const toast = A.useToast();
    const r0 = b.request || {};
    const [t, setT] = useState(r0.slot_id ? { mode: 'slot', slot_id: r0.slot_id } : null);
    const [type, setType] = useState(b.type_id || (app.types.find((x) => x.active) || {}).id);
    const [requirePay, setRequirePay] = useState(true);
    const [notify, setNotify] = useState(true);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');
    const [link, setLink] = useState(null);
    const ty = app.typeById(type);
    const submit = async () => {
      setBusy(true); setErr('');
      try {
        const r = await A.api('POST', '/api/admin/bookings/' + b.id + '/approve', { ...targetBody(t), type_id: type, require_payment: requirePay, notify });
        toast('Request approved' + (r.notice ? ' — email ' + r.notice.status : ''));
        onDone();
        if (r.checkout_url) setLink(r.checkout_url); else onClose();
      } catch (e) { setErr(e.message); } finally { setBusy(false); }
    };
    if (link) {
      return (
        <Dialog title="Approved — payment link" onClose={onClose} footer={<button className="lsl-btn lsl-btn--primary lsl-btn--sm" onClick={onClose}>Done</button>}>
          <p className="lsl-body lsl-body--sm" style={{ marginTop: 0 }}>The booking is reserved and waiting for payment. This link is tied to this booking, so the payment is matched automatically:</p>
          <p className="lsl-a-mono">{link}</p>
          <button className="lsl-btn lsl-btn--ghost lsl-btn--xs" onClick={() => A.copy(link, toast)}><Icon name="copy" /> Copy link</button>
        </Dialog>
      );
    }
    return (
      <Dialog title={'Approve request — ' + b.form.athlete} onClose={onClose} busy={busy}
        footer={<><button className="lsl-btn lsl-btn--ghost lsl-btn--sm" onClick={onClose}>Cancel</button><button className="lsl-btn lsl-btn--primary lsl-btn--sm" onClick={submit} disabled={busy || !t || !(t.slot_id || (t.date && t.time))}>Approve</button></>}>
        <p className="lsl-a-small" style={{ marginTop: 0 }}><strong>They asked for:</strong> {requestLine(b)}{b.players ? ' · ' + b.players + ' players' : ''}</p>
        <Field label="Session type"><select className="lsl-select" value={type} onChange={(e) => setType(e.target.value)}>{app.types.filter((x) => x.active).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></Field>
        <SlotPicker value={t} onChange={setT} />
        <label className="lsl-a-check" style={{ margin: '12px 0 6px', display: 'flex' }}><input type="checkbox" checked={requirePay && !!ty.pay_link} disabled={!ty.pay_link} onChange={(e) => setRequirePay(e.target.checked)} /> Require payment to confirm {ty.pay_link ? '(family gets a Stripe link)' : '(this service has no payment link)'}</label>
        <label className="lsl-a-check" style={{ display: 'flex' }}><input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} /> Email the family that it's approved</label>
        {err && <A.Banner tone="danger">{err}</A.Banner>}
      </Dialog>
    );
  }

  function OfferDialog({ b, onClose, onDone }) {
    const app = A.useApp();
    const toast = A.useToast();
    const loc0 = (app.locations.find((l) => l.active) || {}).id;
    const [opts, setOpts] = useState([{ date: '', time: '', loc_id: loc0 }]);
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');
    const submit = async () => {
      setBusy(true); setErr('');
      try {
        const r = await A.api('POST', '/api/admin/bookings/' + b.id + '/offer', { options: opts.filter((o) => o.date && o.time), message });
        toast(r.notice.status === 'sent' ? 'Times sent to the family' : 'Offer logged — email ' + r.notice.status + (r.notice.detail ? ': ' + r.notice.detail : ''), r.notice.status === 'sent' ? 'ok' : 'err');
        onDone(); onClose();
      } catch (e) { setErr(e.message); } finally { setBusy(false); }
    };
    const upd = (i, k, v) => setOpts(opts.map((o, j) => (j === i ? { ...o, [k]: v } : o)));
    return (
      <Dialog title={'Offer times to ' + b.form.parent} onClose={onClose} busy={busy}
        footer={<><button className="lsl-btn lsl-btn--ghost lsl-btn--sm" onClick={onClose}>Cancel</button><button className="lsl-btn lsl-btn--primary lsl-btn--sm" onClick={submit} disabled={busy || !opts.some((o) => o.date && o.time)}>Send offer</button></>}>
        <p className="lsl-a-small" style={{ marginTop: 0 }}><strong>They asked for:</strong> {requestLine(b)}</p>
        {opts.map((o, i) => (
          <div key={i} className="lsl-a-grid" style={{ marginBottom: 8 }}>
            <Field label={'Option ' + (i + 1) + ' date'}><input className="lsl-input" type="date" min={app.today} value={o.date} onChange={(e) => upd(i, 'date', e.target.value)} /></Field>
            <Field label="Time"><input className="lsl-input" type="time" value={o.time} onChange={(e) => upd(i, 'time', e.target.value)} /></Field>
            <Field label="Location"><select className="lsl-select" value={o.loc_id} onChange={(e) => upd(i, 'loc_id', e.target.value)}>{app.locations.filter((l) => l.active).map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select></Field>
          </div>
        ))}
        {opts.length < 4 && <button className="lsl-btn lsl-btn--ghost lsl-btn--xs" onClick={() => setOpts([...opts, { date: '', time: '', loc_id: loc0 }])}><Icon name="plus" /> Add another option</button>}
        <Field label="Message (optional)"><textarea className="lsl-textarea" value={message} onChange={(e) => setMessage(e.target.value)} style={{ minHeight: 70 }} /></Field>
        <p className="lsl-a-muted lsl-a-small">Offering times doesn't reserve them. When the family replies, use Approve to book the time they pick.</p>
        {err && <A.Banner tone="danger">{err}</A.Banner>}
      </Dialog>
    );
  }

  function DeclineDialog({ b, onClose, onDone }) {
    const toast = A.useToast();
    const [reason, setReason] = useState('');
    const [notify, setNotify] = useState(true);
    const [busy, setBusy] = useState(false);
    const submit = async () => {
      setBusy(true);
      try { const r = await A.api('POST', '/api/admin/bookings/' + b.id + '/decline', { reason, notify }); toast('Request declined' + (r.notice ? ' — email ' + r.notice.status : '')); onDone(); onClose(); }
      catch (e) { toast(e.message, 'err'); } finally { setBusy(false); }
    };
    return (
      <Dialog title={'Decline request — ' + b.form.athlete} onClose={onClose} busy={busy}
        footer={<><button className="lsl-btn lsl-btn--ghost lsl-btn--sm" onClick={onClose}>Keep request</button><button className="lsl-btn lsl-btn--danger lsl-btn--sm" onClick={submit} disabled={busy}>Decline</button></>}>
        <Field label="Reason" hint="Included in the email if you notify the family"><input className="lsl-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. that time is already full" /></Field>
        <label className="lsl-a-check"><input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} /> Email the family</label>
      </Dialog>
    );
  }

  /* ---------------- Family drawer ---------------- */
  function FamilyDrawer({ id, onClose }) {
    const app = A.useApp();
    const toast = A.useToast();
    const q = A.useFetch('/api/admin/families/' + id, [app.version]);
    const [fam, setFam] = useState(null);
    const [busy, run] = A.useAction();
    const [grant, setGrant] = useState({ package_id: '', amount: '', method: 'venmo' });
    const [mergeQ, setMergeQ] = useState('');
    const [mergeHits, setMergeHits] = useState([]);
    const pk = A.useFetch(app.isDirector ? '/api/admin/packages' : null);
    const d = q.data;
    useEffect(() => { if (d) setFam({ parent_name: d.family.parent_name, email: d.family.email || '', phone: d.family.phone || '', notes_private: d.family.notes_private || '' }); }, [d]);
    if (!d || !fam) return <Dialog drawer title="Family" onClose={onClose}>{q.error ? <A.ErrorState error={q.error} onRetry={q.reload} /> : <A.Loading />}</Dialog>;
    const dirty = fam.parent_name !== d.family.parent_name || fam.email !== (d.family.email || '') || fam.phone !== (d.family.phone || '') || fam.notes_private !== (d.family.notes_private || '');
    const att = d.bookings.reduce((o, b) => { o[b.attendance] = (o[b.attendance] || 0) + 1; return o; }, {});
    const saveFam = () => run(() => A.api('PATCH', '/api/admin/families/' + id, fam), 'Family saved').then(app.changed);
    const searchMerge = async (s) => {
      setMergeQ(s);
      if (s.trim().length < 2) { setMergeHits([]); return; }
      try { const r = await A.api('GET', '/api/admin/families?q=' + encodeURIComponent(s)); setMergeHits(r.families.filter((f) => f.id !== id)); } catch (e) { /* ignore */ }
    };
    return (
      <Dialog drawer title={d.family.parent_name + "'s family"} onClose={onClose}
        footer={dirty ? <><span className="lsl-a-inline-status is-dirty"><Icon name="pencil" /> Unsaved</span><button className="lsl-btn lsl-btn--primary lsl-btn--sm" onClick={saveFam} disabled={busy}>Save</button></> : null}>
        <div className="lsl-a-block lsl-a-familyvis">
          <div className="lsl-a-familyvis__label"><Icon name="contact" size={13} /> Parent contact</div>
          <Field label="Parent / guardian"><input className="lsl-input" value={fam.parent_name} onChange={(e) => setFam({ ...fam, parent_name: e.target.value })} /></Field>
          <div className="lsl-a-grid">
            <Field label="Email"><input className="lsl-input" type="email" value={fam.email} onChange={(e) => setFam({ ...fam, email: e.target.value })} /></Field>
            <Field label="Phone"><input className="lsl-input" value={fam.phone} onChange={(e) => setFam({ ...fam, phone: e.target.value })} /></Field>
          </div>
        </div>
        <div className="lsl-a-block">
          <div className="lsl-a-h4">Athletes {d.athletes.length > 1 && <span className="lsl-a-muted">(siblings)</span>}</div>
          {d.athletes.map((a) => <AthleteRow key={a.id} a={a} others={d.athletes.filter((x) => x.id !== a.id)} bookings={d.bookings.filter((b) => b.athlete_id === a.id)} />)}
        </div>
        <div className="lsl-a-block lsl-a-private">
          <div className="lsl-a-private__label"><Icon name="lock" size={13} /> Private family notes — never shown to families</div>
          <textarea className="lsl-textarea" aria-label="Private family notes" value={fam.notes_private} onChange={(e) => setFam({ ...fam, notes_private: e.target.value })} style={{ minHeight: 70 }} />
        </div>
        <div className="lsl-a-block">
          <div className="lsl-a-h4">Booking &amp; attendance history</div>
          <p className="lsl-a-small lsl-a-muted" style={{ marginTop: 0 }}>{A.plural(d.bookings.length, 'booking')} · {att.present || 0} present · {att.late || 0} late · {att.no_show || 0} no-show</p>
          <ul className="lsl-a-list">
            {d.bookings.map((b) => (
              <li key={b.id}>
                <button className="lsl-a-linkbtn" onClick={() => app.openBooking(b.id)}>{b.date ? LSL.fmtDate(b.date) + ' · ' + LSL.fmtTime(b.time) : 'Request'}</button>
                <span>{b.snapshot.service_name}</span>
                <StatusBadge kind="booking" value={b.status} />
                {b.kind === 'dated' && b.attendance !== 'not_recorded' && <StatusBadge kind="attendance" value={b.attendance} />}
              </li>
            ))}
          </ul>
        </div>
        {app.isDirector && (
          <div className="lsl-a-block">
            <div className="lsl-a-h4">Packages &amp; credits</div>
            {d.packages.length === 0 ? <p className="lsl-a-muted lsl-a-small">No packages.</p> : (
              <ul className="lsl-a-list">
                {d.packages.map((p) => (
                  <li key={p.id}>
                    <strong>{p.snapshot.name}</strong>
                    <Badge tone={p.status === 'active' ? 'green' : 'muted'}>{p.status.replace('_', ' ')}</Badge>
                    <span>{p.balance == null ? 'Unlimited' : p.balance + ' of ' + p.credits_total + ' left'}</span>
                    {p.expires_on && <span className="lsl-a-muted">expires {LSL.fmtDate(p.expires_on)}</span>}
                  </li>
                ))}
              </ul>
            )}
            {d.ledger.length > 0 && (
              <Expand title="Credit history" icon="list">
                <ul className="lsl-a-timeline">{d.ledger.map((l) => <li key={l.id}><time>{A.stamp(l.at)}</time><span>{l.reason} {l.delta > 0 ? '+' + l.delta : l.delta}{l.note ? ' — ' + l.note : ''}</span></li>)}</ul>
              </Expand>
            )}
            {pk.data && pk.data.packages.filter((p) => p.active).length > 0 && (
              <Expand title="Record a package sale" icon="plus">
                <div className="lsl-a-grid">
                  <Field label="Package"><select className="lsl-select" value={grant.package_id} onChange={(e) => { const p = pk.data.packages.find((x) => x.id === e.target.value); setGrant({ ...grant, package_id: e.target.value, amount: p ? (p.price_cents / 100).toFixed(2) : '' }); }}>
                    <option value="">Choose…</option>{pk.data.packages.filter((p) => p.active).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
                  <Field label="Amount paid ($)" hint="0 if complimentary"><input className="lsl-input" inputMode="decimal" value={grant.amount} onChange={(e) => setGrant({ ...grant, amount: e.target.value })} /></Field>
                  <Field label="Method"><select className="lsl-select" value={grant.method} onChange={(e) => setGrant({ ...grant, method: e.target.value })}>{METHODS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>
                </div>
                <button className="lsl-btn lsl-btn--primary lsl-btn--xs" disabled={!grant.package_id || busy}
                  onClick={() => run(() => A.api('POST', '/api/admin/families/' + id + '/packages', { package_id: grant.package_id, payment: { amount_cents: A.parseMoney(grant.amount) || 0, method: grant.method } }), 'Package added').then(app.changed)}>Add package</button>
              </Expand>
            )}
            <Expand title="Merge with another family record" icon="merge">
              <p className="lsl-a-muted lsl-a-small" style={{ marginTop: 0 }}>Records are never merged automatically. Use this only when you're sure two records are the same family (e.g. a parent used two emails).</p>
              <input className="lsl-input" type="search" placeholder="Search by parent, athlete, or email" value={mergeQ} onChange={(e) => searchMerge(e.target.value)} aria-label="Search families to merge" />
              <ul className="lsl-a-list">
                {mergeHits.map((h) => (
                  <li key={h.id}><span>{h.parent_name} · {h.email} · {h.athletes}</span><span className="lsl-a-spacer" />
                    <button className="lsl-btn lsl-btn--ghost lsl-btn--xs" onClick={() => { if (window.confirm('Merge ' + h.parent_name + ' into this family? Their athletes, bookings, and packages move here.')) run(() => A.api('POST', '/api/admin/families/' + id + '/merge', { other_id: h.id }), 'Families merged').then(app.changed); }}>Merge into this family</button>
                  </li>
                ))}
              </ul>
            </Expand>
          </div>
        )}
      </Dialog>
    );
  }

  function AthleteRow({ a, others, bookings }) {
    const app = A.useApp();
    const [v, setV] = useState({ name: a.name, grade: a.grade || '', goals: a.goals || '', notes_private: a.notes_private || '' });
    const [busy, run] = A.useAction();
    const dirty = v.name !== a.name || v.grade !== (a.grade || '') || v.goals !== (a.goals || '') || v.notes_private !== (a.notes_private || '');
    return (
      <div className="lsl-a-card" style={{ padding: 14 }}>
        <div className="lsl-a-card__head" style={{ marginBottom: 8 }}>
          <strong>{a.name}</strong><span className="lsl-a-muted lsl-a-small">{A.plural(bookings.length, 'booking')}</span>
        </div>
        <div className="lsl-a-grid">
          <Field label="Name"><input className="lsl-input" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></Field>
          <Field label="Grade / age"><input className="lsl-input" value={v.grade} onChange={(e) => setV({ ...v, grade: e.target.value })} /></Field>
        </div>
        <Field label="Training goals"><input className="lsl-input" value={v.goals} onChange={(e) => setV({ ...v, goals: e.target.value })} /></Field>
        <div className="lsl-a-private" style={{ marginBottom: 8 }}>
          <div className="lsl-a-private__label"><Icon name="lock" size={12} /> Private notes on {a.name}</div>
          <textarea className="lsl-textarea" aria-label={'Private notes on ' + a.name} value={v.notes_private} onChange={(e) => setV({ ...v, notes_private: e.target.value })} style={{ minHeight: 56 }} />
        </div>
        <div className="lsl-a-row">
          {dirty && <button className="lsl-btn lsl-btn--primary lsl-btn--xs" disabled={busy} onClick={() => run(() => A.api('PATCH', '/api/admin/athletes/' + a.id, v), 'Athlete saved').then(app.changed)}>Save athlete</button>}
          {app.isDirector && others.length > 0 && (
            <select className="lsl-select" style={{ width: 'auto' }} value="" aria-label={'Merge ' + a.name + ' into another athlete'}
              onChange={(e) => { const o = others.find((x) => x.id === e.target.value); if (o && window.confirm('Merge "' + a.name + '" into "' + o.name + '"? Bookings move to ' + o.name + '.')) run(() => A.api('POST', '/api/admin/athletes/' + a.id + '/merge', { into_id: o.id }), 'Athletes merged').then(app.changed); }}>
              <option value="">Same person as…</option>
              {others.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          )}
        </div>
      </div>
    );
  }

  A.BookingDialog = BookingDialog;
  A.FamilyDrawer = FamilyDrawer;
  A.tabs = A.tabs || {};
  A.tabs.BooksTab = BooksTab;
})();
