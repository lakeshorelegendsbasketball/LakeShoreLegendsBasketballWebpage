/* global React, LSL */
/* Coach dashboard — Settings tab. */
(function () {
  const { useState, useEffect } = React;
  const A = window.LSLA;
  const { Icon, Badge, Field, Seg, Dialog } = A;

  const TZS = ['America/Chicago', 'America/New_York', 'America/Denver', 'America/Phoenix', 'America/Los_Angeles', 'America/Anchorage', 'Pacific/Honolulu'];
  const TEMPLATE_NAMES = {
    request_received: 'Request received', confirmation: 'Booking confirmed', reminder: 'Reminder', cancellation: 'Cancellation',
    reschedule: 'Rescheduled', approval: 'Request approved', decline: 'Request declined', offer: 'Times offered',
  };
  const PLACEHOLDERS = ['parent', 'athlete', 'service', 'date', 'time', 'timezone', 'coach', 'location', 'location_details', 'prep', 'policy', 'requested', 'previous', 'cancel_outcome', 'payment_step', 'offer_times', 'message'];

  /** A settings section: collapsible card with its own dirty/save state. */
  function Section({ title, icon, pick, children, defaultOpen, note }) {
    const app = A.useApp();
    const toast = A.useToast();
    const orig = pick(app.settings);
    const [v, setV] = useState(orig);
    const [errs, setErrs] = useState({});
    const [saving, setSaving] = useState(false);
    useEffect(() => { setV(pick(app.settings)); }, [app.settings]);
    const dirty = JSON.stringify(v) !== JSON.stringify(orig);
    const save = async () => {
      setSaving(true); setErrs({});
      try { await A.api('PUT', '/api/admin/settings', v); toast(title + ' saved'); await app.reload(); }
      catch (e) { setErrs(e.fields || {}); toast(e.message, 'err'); } finally { setSaving(false); }
    };
    return (
      <details className="lsl-a-expand lsl-a-section" open={defaultOpen}>
        <summary><Icon name="chevron-right" className="lsl-a-chev" /><Icon name={icon} /> {title}{dirty && <span className="lsl-a-inline-status is-dirty" style={{ marginLeft: 8 }}>• unsaved</span>}</summary>
        <div className="lsl-a-expand__body">
          {note}
          {children(v, setV, errs)}
          <A.SaveBar dirty={dirty} saving={saving} onSave={save} onDiscard={() => { setV(orig); setErrs({}); }} label={'Unsaved changes to ' + title.toLowerCase()} />
        </div>
      </details>
    );
  }

  const num = (v, setV, k, sub) => (e) => {
    const n = e.target.value === '' ? '' : Number(e.target.value);
    if (sub) setV({ ...v, [sub]: { ...v[sub], [k]: n } }); else setV({ ...v, [k]: n });
  };

  function SettingsTab() {
    const app = A.useApp();
    if (!app.isDirector) {
      return (
        <div>
          <A.Banner tone="info">Program settings are managed by a director. You can change your own password below.</A.Banner>
          <PasswordSection />
        </div>
      );
    }
    const locs = app.locations.filter((l) => !l.archived_at);
    return (
      <div>
        <Section title="Scheduling" icon="calendar-cog" defaultOpen
          pick={(s) => ({ timezone: s.timezone, defaultDuration: s.defaultDuration, sameLocationBuffer: s.sameLocationBuffer, travelDefault: s.travelDefault, travel: s.travel, conflictAction: s.conflictAction, minNoticeHours: s.minNoticeHours, maxAdvanceDays: s.maxAdvanceDays, holdMinutes: s.holdMinutes })}>
          {(v, setV, errs) => <>
            <div className="lsl-a-grid">
              <Field label="Time zone" error={errs.timezone} hint="All dates and times use this zone, including daylight saving.">
                <select className="lsl-select" value={v.timezone} onChange={(e) => setV({ ...v, timezone: e.target.value })}>
                  {[...new Set([v.timezone, ...TZS])].map((z) => <option key={z} value={z}>{z.replace('_', ' ')} ({LSL.tzLabel(null, null, z)})</option>)}
                </select>
              </Field>
              <Field label="Default session length (min)" error={errs.defaultDuration}><input className="lsl-input" type="number" value={v.defaultDuration} onChange={num(v, setV, 'defaultDuration')} /></Field>
              <Field label="Minimum booking notice (hours)" error={errs.minNoticeHours} hint="Openings sooner than this are hidden from families."><input className="lsl-input" type="number" value={v.minNoticeHours} onChange={num(v, setV, 'minNoticeHours')} /></Field>
              <Field label="Book up to (days ahead)" error={errs.maxAdvanceDays}><input className="lsl-input" type="number" value={v.maxAdvanceDays} onChange={num(v, setV, 'maxAdvanceDays')} /></Field>
              <Field label="Checkout hold (minutes)" error={errs.holdMinutes} hint="How long a time is held while a family pays in Stripe."><input className="lsl-input" type="number" value={v.holdMinutes} onChange={num(v, setV, 'holdMinutes')} /></Field>
            </div>
            <div className="lsl-a-h4" style={{ marginTop: 18 }}>Buffers &amp; travel</div>
            <p className="lsl-a-muted lsl-a-small" style={{ marginTop: 0 }}>Gaps are measured from the end of one session to the start of the next. Set real travel times yourself — they're not estimated.</p>
            <div className="lsl-a-grid">
              <Field label="Same location (min)" error={errs.sameLocationBuffer} hint="0 = true back-to-back is allowed"><input className="lsl-input" type="number" value={v.sameLocationBuffer} onChange={num(v, setV, 'sameLocationBuffer')} /></Field>
              <Field label="Between locations — default (min)" error={errs.travelDefault}><input className="lsl-input" type="number" value={v.travelDefault} onChange={num(v, setV, 'travelDefault')} /></Field>
              <Field label="When a booking conflicts with an opening">
                <select className="lsl-select" value={v.conflictAction} onChange={(e) => setV({ ...v, conflictAction: e.target.value })}>
                  <option value="bump">Move the opening to the next safe time</option>
                  <option value="delete">Remove the opening</option>
                </select>
              </Field>
            </div>
            {locs.length > 1 && (
              <div style={{ overflowX: 'auto', marginTop: 12 }}>
                <table className="lsl-a-matrix">
                  <caption className="lsl-a-small lsl-a-muted" style={{ textAlign: 'left', paddingBottom: 6 }}>Travel time for specific pairs (blank = default)</caption>
                  <thead><tr><th scope="col">From</th><th scope="col">To</th><th scope="col">Minutes</th></tr></thead>
                  <tbody>
                    {locs.flatMap((a, i) => locs.slice(i + 1).map((b) => {
                      const key = [a.id, b.id].sort().join('|');
                      return (
                        <tr key={key}><td>{a.name}</td><td>{b.name}</td>
                          <td><input className="lsl-input" type="number" min="0" aria-label={'Travel minutes between ' + a.name + ' and ' + b.name} placeholder={String(v.travelDefault)}
                            value={v.travel[key] ?? ''} onChange={(e) => setV({ ...v, travel: { ...v.travel, [key]: e.target.value === '' ? undefined : Number(e.target.value) } })} /></td></tr>
                      );
                    }))}
                  </tbody>
                </table>
              </div>
            )}
          </>}
        </Section>

        <Section title="Cancellation & rescheduling" icon="calendar-x"
          pick={(s) => ({ cancellation: { ...s.cancellation } })}>
          {(v, setV) => <>
            <div className="lsl-a-grid">
              <Field label="Full refund if canceled (hours ahead)"><input className="lsl-input" type="number" value={v.cancellation.fullRefundHours} onChange={num(v, setV, 'fullRefundHours', 'cancellation')} /></Field>
              <Field label="Late-cancel retainer (%)"><input className="lsl-input" type="number" value={v.cancellation.lateRetainerPct} onChange={num(v, setV, 'lateRetainerPct', 'cancellation')} /></Field>
              <Field label="Restore package credit if canceled (hours ahead)"><input className="lsl-input" type="number" value={v.cancellation.creditRestoreHours} onChange={num(v, setV, 'creditRestoreHours', 'cancellation')} /></Field>
              <Field label="Reschedule allowed until (hours ahead)"><input className="lsl-input" type="number" value={v.cancellation.rescheduleHours} onChange={num(v, setV, 'rescheduleHours', 'cancellation')} /></Field>
            </div>
            <Field label="Policy shown to families (one line each)" hint="Appears on the booking page and in emails. Keep it consistent with the numbers above.">
              <textarea className="lsl-textarea" style={{ minHeight: 90 }} value={(v.cancellation.policyLines || []).join('\n')} onChange={(e) => setV({ ...v, cancellation: { ...v.cancellation, policyLines: e.target.value.split('\n') } })} />
            </Field>
            <p className="lsl-a-muted lsl-a-small">These rules guide the cancel dialog. Refunds are never issued automatically.</p>
          </>}
        </Section>

        <Section title="Payment & confirmation" icon="credit-card" pick={(s) => ({ payment: { ...s.payment } })}>
          {(v, setV) => <>
            <label className="lsl-a-check" style={{ display: 'flex', marginBottom: 8 }}><input type="radio" name="pm" checked={v.payment.mode === 'pay_to_confirm'} onChange={() => setV({ payment: { mode: 'pay_to_confirm' } })} />
              <span><strong>Payment confirms the booking</strong> — the time is held during checkout and confirmed only when Stripe verifies payment. (Recommended)</span></label>
            <label className="lsl-a-check" style={{ display: 'flex' }}><input type="radio" name="pm" checked={v.payment.mode === 'confirm_then_pay'} onChange={() => setV({ payment: { mode: 'confirm_then_pay' } })} />
              <span><strong>Confirm right away, pay after</strong> — the booking is confirmed immediately and shows as Unpaid until payment arrives.</span></label>
          </>}
        </Section>

        <Section title="Registration form" icon="clipboard-list" pick={(s) => ({ registration: JSON.parse(JSON.stringify(s.registration)) })}>
          {(v, setV) => {
            const setField = (k, patch) => setV({ registration: { ...v.registration, fields: { ...v.registration.fields, [k]: { ...v.registration.fields[k], ...patch } } } });
            const acks = v.registration.acknowledgments || [];
            const setAcks = (a) => setV({ registration: { ...v.registration, acknowledgments: a } });
            return <>
              <p className="lsl-a-muted lsl-a-small" style={{ marginTop: 0 }}>Parent name, athlete name, and email are always required.</p>
              {Object.entries(v.registration.fields).map(([k, f]) => (
                <div key={k} className="lsl-a-row" style={{ marginBottom: 8 }}>
                  <input className="lsl-input" style={{ flex: 1, minWidth: 180 }} value={f.label} onChange={(e) => setField(k, { label: e.target.value })} aria-label={'Label for ' + k} />
                  <label className="lsl-a-check"><input type="checkbox" checked={f.show !== false} onChange={(e) => setField(k, { show: e.target.checked })} /> Show</label>
                  <label className="lsl-a-check"><input type="checkbox" checked={!!f.required} disabled={f.show === false} onChange={(e) => setField(k, { required: e.target.checked })} /> Required</label>
                </div>
              ))}
              <div className="lsl-a-h4" style={{ marginTop: 16 }}>Required acknowledgments</div>
              {acks.map((a, i) => (
                <div key={a.id} className="lsl-a-row" style={{ marginBottom: 8 }}>
                  <input className="lsl-input" style={{ flex: 1, minWidth: 200 }} value={a.text} onChange={(e) => setAcks(acks.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))} aria-label={'Acknowledgment ' + (i + 1)} />
                  <label className="lsl-a-check"><input type="checkbox" checked={a.required} onChange={(e) => setAcks(acks.map((x, j) => (j === i ? { ...x, required: e.target.checked } : x)))} /> Required</label>
                  <button className="lsl-admin__del" aria-label="Remove acknowledgment" onClick={() => setAcks(acks.filter((_, j) => j !== i))}><Icon name="trash-2" /></button>
                </div>
              ))}
              <button className="lsl-btn lsl-btn--ghost lsl-btn--xs" onClick={() => setAcks([...acks, { id: 'ack' + Date.now().toString(36), text: '', required: true }])}><Icon name="plus" /> Add acknowledgment</button>
            </>;
          }}
        </Section>

        <Section title="Notifications" icon="bell" pick={(s) => ({ notifications: JSON.parse(JSON.stringify(s.notifications)), calendar: { ...s.calendar } })}
          note={app.integrations && !app.integrations.email.configured ? <A.Banner tone="warn">Email isn't connected yet, so nothing is actually sent — each message is logged as "skipped". See Connections below.</A.Banner> : null}>
          {(v, setV) => {
            const n = v.notifications;
            const setN = (patch) => setV({ ...v, notifications: { ...n, ...patch } });
            return <>
              <div className="lsl-a-checks" style={{ flexDirection: 'column', gap: 8 }}>
                <label className="lsl-a-check"><input type="checkbox" checked={n.sendRequestReceipt} onChange={(e) => setN({ sendRequestReceipt: e.target.checked })} /> Email families when a request is received (clearly says it's not confirmed)</label>
                <label className="lsl-a-check"><input type="checkbox" checked={n.sendConfirmation} onChange={(e) => setN({ sendConfirmation: e.target.checked })} /> Email a confirmation when a booking is confirmed</label>
                <label className="lsl-a-check"><input type="checkbox" checked={n.sendReschedule} onChange={(e) => setN({ sendReschedule: e.target.checked })} /> Allow reschedule emails</label>
                <label className="lsl-a-check"><input type="checkbox" checked={n.sendCancellation} onChange={(e) => setN({ sendCancellation: e.target.checked })} /> Allow cancellation emails</label>
              </div>
              <div className="lsl-a-h4" style={{ marginTop: 16 }}>Reminders</div>
              {n.reminders.map((r, i) => (
                <div key={i} className="lsl-a-row" style={{ marginBottom: 8 }}>
                  <label className="lsl-a-check"><input type="checkbox" checked={r.enabled} onChange={(e) => setN({ reminders: n.reminders.map((x, j) => (j === i ? { ...x, enabled: e.target.checked } : x)) })} /> Send</label>
                  <input className="lsl-input" type="number" min="1" max="336" style={{ width: 90 }} value={r.hoursBefore} aria-label="Hours before" onChange={(e) => setN({ reminders: n.reminders.map((x, j) => (j === i ? { ...x, hoursBefore: Number(e.target.value) } : x)) })} />
                  <span className="lsl-a-small">hours before the session</span>
                  <button className="lsl-admin__del" aria-label="Remove reminder" onClick={() => setN({ reminders: n.reminders.filter((_, j) => j !== i) })}><Icon name="trash-2" /></button>
                </div>
              ))}
              {n.reminders.length < 4 && <button className="lsl-btn lsl-btn--ghost lsl-btn--xs" onClick={() => setN({ reminders: [...n.reminders, { hoursBefore: 2, enabled: true }] })}><Icon name="plus" /> Add reminder</button>}
              <p className="lsl-a-muted lsl-a-small">Each reminder is sent once per session time. A session booked inside the window doesn't get that reminder.</p>
              <div className="lsl-a-grid" style={{ marginTop: 12 }}>
                <Field label="From name"><input className="lsl-input" value={n.fromName} onChange={(e) => setN({ fromName: e.target.value })} /></Field>
                <Field label="Reply-to email" hint="Where family replies go"><input className="lsl-input" type="email" value={n.replyTo} onChange={(e) => setN({ replyTo: e.target.value })} /></Field>
                <Field label="Coach alert email" hint="Get a copy of new bookings"><input className="lsl-input" type="email" value={n.coachAlertEmail} onChange={(e) => setN({ coachAlertEmail: e.target.value })} /></Field>
                <Field label="Coach name in emails & calendar"><input className="lsl-input" value={v.calendar.coachName} onChange={(e) => setV({ ...v, calendar: { ...v.calendar, coachName: e.target.value } })} /></Field>
              </div>
            </>;
          }}
        </Section>

        <TemplatesSection />
        <CoachesSection />
        <ConnectionsSection />
        <PasswordSection />
        <ImportSection />
      </div>
    );
  }

  function TemplatesSection() {
    const app = A.useApp();
    const toast = A.useToast();
    const [kind, setKind] = useState('confirmation');
    const orig = app.settings.templates[kind];
    const [v, setV] = useState(orig);
    const [preview, setPreview] = useState(null);
    const [busy, setBusy] = useState(false);
    useEffect(() => { setV(app.settings.templates[kind]); setPreview(null); }, [kind, app.settings]);
    const dirty = JSON.stringify(v) !== JSON.stringify(orig);
    const call = async (fn) => { setBusy(true); try { await fn(); } catch (e) { toast(e.message, 'err'); } finally { setBusy(false); } };
    const doPreview = (sendTest) => call(async () => {
      const r = await A.api('POST', '/api/admin/templates/preview', { kind, template: v, send_test: sendTest });
      setPreview(r);
      if (sendTest) toast(r.test.status === 'sent' ? 'Test sent to ' + app.me.email : 'Test not sent: ' + (r.test.detail || r.test.status), r.test.status === 'sent' ? 'ok' : 'err');
    });
    const save = () => call(async () => { await A.api('PUT', '/api/admin/settings', { templates: { [kind]: v } }); toast('Template saved'); await app.reload(); });
    const reset = () => call(async () => { await A.api('POST', '/api/admin/templates/' + kind + '/reset'); toast('Template reset to default'); await app.reload(); });
    return (
      <details className="lsl-a-expand lsl-a-section">
        <summary><Icon name="chevron-right" className="lsl-a-chev" /><Icon name="mail" /> Email templates</summary>
        <div className="lsl-a-expand__body">
          <Field label="Template">
            <select className="lsl-select" value={kind} onChange={(e) => { if (!dirty || window.confirm('Discard unsaved template changes?')) setKind(e.target.value); }}>
              {Object.entries(TEMPLATE_NAMES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </Field>
          <Field label="Subject"><input className="lsl-input" value={v.subject} onChange={(e) => setV({ ...v, subject: e.target.value })} /></Field>
          <Field label="Body" hint={'Placeholders: ' + PLACEHOLDERS.map((p) => '{{' + p + '}}').join(' ')}><textarea className="lsl-textarea lsl-a-tpl" value={v.body} onChange={(e) => setV({ ...v, body: e.target.value })} /></Field>
          <p className="lsl-a-muted lsl-a-small">{'{{location_details}}'} (facility, address, parking) is only filled in for confirmed bookings.</p>
          <div className="lsl-a-row">
            <button className="lsl-btn lsl-btn--ghost lsl-btn--xs" onClick={() => doPreview(false)} disabled={busy}><Icon name="eye" /> Preview</button>
            <button className="lsl-btn lsl-btn--ghost lsl-btn--xs" onClick={() => doPreview(true)} disabled={busy}><Icon name="send" /> Send test to me</button>
            <button className="lsl-a-linkbtn" onClick={reset} disabled={busy}>Reset to default</button>
            <span className="lsl-a-spacer" />
            <button className="lsl-btn lsl-btn--primary lsl-btn--xs" onClick={save} disabled={busy || !dirty}>Save template</button>
          </div>
          {preview && <div style={{ marginTop: 12 }}><div className="lsl-a-h4">Preview with sample data</div><div className="lsl-a-previewbox"><strong>{preview.subject}</strong>{'\n\n'}{preview.body}</div></div>}
        </div>
      </details>
    );
  }

  function CoachesSection() {
    const app = A.useApp();
    const toast = A.useToast();
    const [adding, setAdding] = useState(false);
    const [edit, setEdit] = useState(null);
    return (
      <details className="lsl-a-expand lsl-a-section">
        <summary><Icon name="chevron-right" className="lsl-a-chev" /><Icon name="users" /> Coaches &amp; access</summary>
        <div className="lsl-a-expand__body">
          <A.Banner tone="info"><strong>Directors</strong> see and manage everything, including payments, prices, and settings. <strong>Coaches</strong> see only their own openings and assigned bookings (with family contact info and private notes for those), and can't see payment amounts, packages, or settings.</A.Banner>
          <ul className="lsl-a-list">
            {app.coaches.map((c) => (
              <li key={c.id}>
                <strong>{c.name}</strong><span className="lsl-a-muted">{c.email}</span>
                <Badge tone={c.role === 'director' ? 'navy' : 'sky'}>{c.role}</Badge>
                {!c.active && <Badge tone="muted">Deactivated</Badge>}
                <span className="lsl-a-spacer" />
                <button className="lsl-btn lsl-btn--ghost lsl-btn--xs" onClick={() => setEdit(c)}>Edit</button>
              </li>
            ))}
          </ul>
          <button className="lsl-btn lsl-btn--ghost lsl-btn--xs" style={{ marginTop: 10 }} onClick={() => setAdding(true)}><Icon name="user-plus" /> Add coach</button>
        </div>
        {(adding || edit) && <CoachDialog c={edit} onClose={() => { setAdding(false); setEdit(null); }} />}
      </details>
    );
  }

  function CoachDialog({ c, onClose }) {
    const app = A.useApp();
    const toast = A.useToast();
    const isNew = !c;
    const [v, setV] = useState({ name: c ? c.name : '', email: c ? c.email : '', role: c ? c.role : 'coach', phone: c ? c.phone || '' : '', bio: c ? c.bio || '' : '', password: '', active: c ? !!c.active : true });
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');
    const save = async () => {
      setBusy(true); setErr('');
      try {
        if (isNew) await A.api('POST', '/api/admin/users', v);
        else await A.api('PATCH', '/api/admin/users/' + c.id, { name: v.name, role: v.role, phone: v.phone, bio: v.bio, active: v.active, ...(v.password ? { password: v.password } : {}) });
        toast(isNew ? 'Coach added — share the temporary password with them privately' : 'Coach updated'); await app.reload(); onClose();
      } catch (e) { setErr(e.message); } finally { setBusy(false); }
    };
    return (
      <Dialog title={isNew ? 'Add coach' : 'Edit ' + c.name} onClose={onClose} busy={busy}
        footer={<><button className="lsl-btn lsl-btn--ghost lsl-btn--sm" onClick={onClose}>Cancel</button><button className="lsl-btn lsl-btn--primary lsl-btn--sm" onClick={save} disabled={busy}>Save</button></>}>
        <div className="lsl-a-grid">
          <Field label="Name"><input className="lsl-input" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></Field>
          <Field label="Email"><input className="lsl-input" type="email" value={v.email} disabled={!isNew} onChange={(e) => setV({ ...v, email: e.target.value })} /></Field>
          <Field label="Phone"><input className="lsl-input" value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} /></Field>
          <Field label="Access"><select className="lsl-select" value={v.role} disabled={c && c.id === app.me.id} onChange={(e) => setV({ ...v, role: e.target.value })}><option value="coach">Coach</option><option value="director">Director</option></select></Field>
        </div>
        <Field label="Bio (optional)"><textarea className="lsl-textarea" value={v.bio} onChange={(e) => setV({ ...v, bio: e.target.value })} style={{ minHeight: 56 }} /></Field>
        <Field label={isNew ? 'Temporary password' : 'Reset password (optional)'} hint="At least 10 characters. Resetting signs them out everywhere.">
          <input className="lsl-input" type="text" autoComplete="new-password" value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} />
        </Field>
        {!isNew && c.id !== app.me.id && <label className="lsl-a-check"><input type="checkbox" checked={v.active} onChange={(e) => setV({ ...v, active: e.target.checked })} /> Active (can sign in)</label>}
        {err && <A.Banner tone="danger">{err}</A.Banner>}
      </Dialog>
    );
  }

  function ConnectionsSection() {
    const app = A.useApp();
    const toast = A.useToast();
    const i = app.integrations;
    if (!i) return null;
    const Row = ({ ok, warn, label, children }) => (
      <li><Badge tone={ok ? 'green' : warn ? 'warn' : 'danger'} icon={ok ? 'circle-check' : warn ? 'triangle-alert' : 'circle-x'}>{ok ? 'Connected' : warn ? 'Partial' : 'Not set up'}</Badge><strong>{label}</strong><span className="lsl-a-small">{children}</span></li>
    );
    return (
      <details className="lsl-a-expand lsl-a-section">
        <summary><Icon name="chevron-right" className="lsl-a-chev" /><Icon name="plug" /> Connections</summary>
        <div className="lsl-a-expand__body">
          <ul className="lsl-a-list">
            <Row ok={i.stripe.webhook === 'configured'} label="Stripe payments">
              {i.stripe.webhook === 'configured'
                ? <>Webhook active. {i.stripe.last_event ? 'Last event ' + A.stamp(i.stripe.last_event.received_at) + ' (' + i.stripe.last_event.type + ').' : 'No events received yet.'}</>
                : <>Payments can't be verified until the Stripe webhook secret is added. Until then, bookings stay "Awaiting payment".</>}
            </Row>
            <Row ok={i.stripe.api === 'configured'} warn={i.stripe.api !== 'configured'} label="Stripe price check">
              {i.stripe.api === 'configured' ? 'Read-only key in ' + i.stripe.mode + ' mode.' : 'Optional — add a read-only key to show live prices.'}
            </Row>
            <Row ok={i.email.configured} label="Family email">
              {i.email.detail}{i.email.failed_last_7_days ? ' ' + i.email.failed_last_7_days + ' failed in the last 7 days.' : ''}
            </Row>
            <Row ok={!!i.scheduler.last_run} warn={!i.scheduler.last_run} label="Reminders & hold expiry">
              {i.scheduler.last_run ? 'Last ran ' + A.stamp(i.scheduler.last_run) + '.' : 'Hasn\'t run yet (runs every 10 minutes once deployed).'}
            </Row>
            <Row ok label="Calendar files (.ics)">Download buttons on every booking. Times are exported with the correct time zone.</Row>
          </ul>
          {i.stripe.webhook_url && (
            <p className="lsl-a-small">Stripe webhook URL: <span className="lsl-a-mono">{i.stripe.webhook_url}</span> <button className="lsl-a-linkbtn" onClick={() => A.copy(i.stripe.webhook_url, toast)}>Copy</button><br />
              Events to send: <span className="lsl-a-mono">checkout.session.completed, checkout.session.async_payment_succeeded, checkout.session.async_payment_failed, checkout.session.expired, charge.refunded</span></p>
          )}
          <p className="lsl-a-muted lsl-a-small">Secret keys are stored only on the server and are never shown here.</p>
        </div>
      </details>
    );
  }

  function PasswordSection() {
    const toast = A.useToast();
    const [v, setV] = useState({ current: '', next: '', confirm: '' });
    const [err, setErr] = useState('');
    const [busy, setBusy] = useState(false);
    const save = async () => {
      setErr('');
      if (v.next !== v.confirm) { setErr('New passwords do not match.'); return; }
      setBusy(true);
      try { const r = await A.api('POST', '/api/auth/password', { current: v.current, next: v.next }); A.setToken(r.token); setV({ current: '', next: '', confirm: '' }); toast('Password changed — other devices were signed out'); }
      catch (e) { setErr(e.message); } finally { setBusy(false); }
    };
    return (
      <details className="lsl-a-expand lsl-a-section">
        <summary><Icon name="chevron-right" className="lsl-a-chev" /><Icon name="key-round" /> Your password</summary>
        <div className="lsl-a-expand__body">
          <div className="lsl-a-grid">
            <Field label="Current password"><input className="lsl-input" type="password" autoComplete="current-password" value={v.current} onChange={(e) => setV({ ...v, current: e.target.value })} /></Field>
            <Field label="New password" hint="At least 10 characters"><input className="lsl-input" type="password" autoComplete="new-password" value={v.next} onChange={(e) => setV({ ...v, next: e.target.value })} /></Field>
            <Field label="Confirm new password"><input className="lsl-input" type="password" autoComplete="new-password" value={v.confirm} onChange={(e) => setV({ ...v, confirm: e.target.value })} /></Field>
          </div>
          {err && <span className="lsl-err" role="alert">{err}</span>}
          <button className="lsl-btn lsl-btn--primary lsl-btn--xs" style={{ marginTop: 10 }} onClick={save} disabled={busy || !v.current || !v.next}>Change password</button>
        </div>
      </details>
    );
  }

  /** One-time move of data from the old JSONbin storage. */
  function ImportSection() {
    const app = A.useApp();
    const toast = A.useToast();
    const [v, setV] = useState({ key: '', bin: '6a2799d5da38895dfe9dfaa8' });
    const [snap, setSnap] = useState(null);
    const [result, setResult] = useState(null);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');
    const fetchOld = async () => {
      setErr(''); setBusy(true); setSnap(null);
      try {
        const res = await fetch('https://api.jsonbin.io/v3/b/' + encodeURIComponent(v.bin.trim()) + '/latest', { headers: { 'X-Master-Key': v.key.trim() } });
        if (!res.ok) throw new Error('JSONbin said ' + res.status + ' — check the key and bin ID.');
        setSnap((await res.json()).record);
      } catch (e) { setErr(e.message); } finally { setBusy(false); }
    };
    const doImport = async () => {
      setBusy(true); setErr('');
      try { const r = await A.api('POST', '/api/admin/import-legacy', { snapshot: snap }); setResult(r); toast('Import complete'); app.reload(); app.changed(); }
      catch (e) { setErr(e.message); } finally { setBusy(false); }
    };
    return (
      <details className="lsl-a-expand lsl-a-section">
        <summary><Icon name="chevron-right" className="lsl-a-chev" /><Icon name="database" /> Import from the old booking system</summary>
        <div className="lsl-a-expand__body">
          <p className="lsl-a-small" style={{ marginTop: 0 }}>Copies bookings, openings, session types, and locations from the old JSONbin storage. Safe to run more than once — nothing is duplicated. Imported bookings keep their details; payment shows as <strong>Unknown</strong> because the old system never confirmed payments.</p>
          <div className="lsl-a-grid">
            <Field label="JSONbin master key" hint="Used once in your browser; not saved."><input className="lsl-input lsl-a-mono" type="password" autoComplete="off" value={v.key} onChange={(e) => setV({ ...v, key: e.target.value })} /></Field>
            <Field label="Bin ID"><input className="lsl-input lsl-a-mono" value={v.bin} onChange={(e) => setV({ ...v, bin: e.target.value })} /></Field>
          </div>
          <div className="lsl-a-row">
            <button className="lsl-btn lsl-btn--ghost lsl-btn--xs" onClick={fetchOld} disabled={busy || !v.key}><Icon name="download" /> Load old data</button>
            {snap && <button className="lsl-btn lsl-btn--primary lsl-btn--xs" onClick={doImport} disabled={busy}>Import {A.plural((snap.books || []).length, 'booking')} and {A.plural((snap.slots || []).length, 'opening')}</button>}
          </div>
          {err && <A.Banner tone="danger">{err}</A.Banner>}
          {result && <A.Banner tone="ok">Imported {result.counts.bookings} bookings, {result.counts.slots} openings, {result.counts.types} session types, {result.counts.locations} locations{result.counts.skipped ? ' (' + result.counts.skipped + ' unreadable rows skipped)' : ''}. After you've checked everything, delete the old bin in JSONbin and regenerate its key.</A.Banner>}
        </div>
      </details>
    );
  }

  A.tabs = A.tabs || {};
  A.tabs.SettingsTab = SettingsTab;
})();
