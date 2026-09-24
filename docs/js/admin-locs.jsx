/* global React, LSL */
/* Coach dashboard — Locations tab. */
(function () {
  const { useState, useEffect } = React;
  const A = window.LSLA;
  const { Icon, Badge, Field, Dialog } = A;

  const toForm = (l) => ({
    name: l.name || '', facility_name: l.facility_name || '', address: l.address || '', parking: l.parking || '', indoor_outdoor: l.indoor_outdoor || '',
    weather_notes: l.weather_notes || '', hours: l.hours || '', eligible_type_ids: l.eligible_type_ids || [],
    rental_cost: l.rental_cost_cents != null ? (l.rental_cost_cents / 100).toFixed(2) : '', rental_basis: l.rental_basis || '',
  });
  const toBody = (v) => ({ ...v, rental_cost_cents: v.rental_cost === '' ? null : A.parseMoney(v.rental_cost), rental_cost: undefined, indoor_outdoor: v.indoor_outdoor || null, rental_basis: v.rental_basis || null });

  function LocsTab() {
    const app = A.useApp();
    const [busy, run] = A.useAction();
    const [showArchived, setShowArchived] = useState(false);
    const locs = app.locations.filter((l) => showArchived || !l.archived_at);
    const archivedCount = app.locations.filter((l) => l.archived_at).length;
    const add = () => run(() => A.api('POST', '/api/admin/locations', { name: 'New location' }), 'Location added — give it a name').then(app.reload);
    return (
      <div>
        <p className="lsl-body lsl-body--sm" style={{ marginTop: 0, color: 'var(--fg3)' }}>Use general areas/towns. Exact address can be shared privately once a booking is confirmed.</p>
        {!app.isDirector && <A.Banner tone="info">Only a director can edit locations.</A.Banner>}
        {locs.map((l) => <LocCard key={l.id} l={l} />)}
        {app.isDirector && (
          <div className="lsl-a-row">
            <button className="lsl-btn lsl-btn--ghost lsl-btn--sm" onClick={add} disabled={busy}><Icon name="plus" /> Add location</button>
            {archivedCount > 0 && <button className="lsl-a-linkbtn" onClick={() => setShowArchived(!showArchived)}>{showArchived ? 'Hide' : 'Show'} {archivedCount} archived</button>}
          </div>
        )}
      </div>
    );
  }

  function LocCard({ l }) {
    const app = A.useApp();
    const toast = A.useToast();
    const [v, setV] = useState(() => toForm(l));
    const [errs, setErrs] = useState({});
    const [saving, setSaving] = useState(false);
    const [decision, setDecision] = useState(null);
    const [archiveDlg, setArchiveDlg] = useState(false);
    useEffect(() => { setV(toForm(l)); }, [l]);
    const orig = toForm(l);
    const dirty = JSON.stringify(v) !== JSON.stringify(orig);
    const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
    const ro = !app.isDirector;
    const save = async (apply) => {
      if (!v.name.trim()) { setErrs({ name: 'Required' }); return; }
      setSaving(true); setErrs({});
      try {
        await A.api('PUT', '/api/admin/locations/' + l.id, { ...toBody(v), ...(apply !== undefined ? { apply_to_upcoming: apply } : {}) });
        toast('Location saved' + (apply ? ' — upcoming bookings updated' : '')); setDecision(null); app.reload();
      } catch (e) {
        if (e.status === 409 && e.data.needs_decision) setDecision(e.data.upcoming);
        else { setErrs(e.fields || {}); toast(e.message, 'err'); }
      } finally { setSaving(false); }
    };
    const restore = () => A.api('POST', '/api/admin/locations/' + l.id + '/archive', { archive: false }).then(() => { toast('Location restored'); app.reload(); }).catch((e) => toast(e.message, 'err'));
    const hasPrivate = ['facility_name', 'address', 'parking', 'indoor_outdoor', 'weather_notes', 'hours'].some((k) => v[k]);
    return (
      <div className={'lsl-admin__card' + (l.archived_at ? ' is-inactive' : '')}>
        <div className="lsl-a-card__head" style={{ marginBottom: 6 }}>
          {l.archived_at ? <Badge tone="muted" icon="archive">Archived</Badge> : <Badge tone="green" icon="circle-check">Active</Badge>}
          {l.indoor_outdoor && <Badge tone="muted" icon={l.indoor_outdoor === 'outdoor' ? 'sun' : 'house'}>{l.indoor_outdoor}</Badge>}
        </div>
        <Field label="Area / Town" error={errs.name} hint="Public — shown on the booking page"><input className="lsl-input" value={v.name} onChange={set('name')} placeholder="Park Ridge, IL" readOnly={ro} /></Field>
        <A.Expand title={'Private facility details' + (hasPrivate ? '' : ' (none yet)')} icon="lock">
          <p className="lsl-a-muted lsl-a-small" style={{ marginTop: 0 }}><Icon name="lock" size={12} /> Shared with families only in confirmation and reminder emails for confirmed bookings — never on the public site.</p>
          <div className="lsl-a-grid">
            <Field label="Facility name"><input className="lsl-input" value={v.facility_name} onChange={set('facility_name')} readOnly={ro} placeholder="e.g. Maine South Fieldhouse" /></Field>
            <Field label="Indoor / outdoor"><select className="lsl-select" value={v.indoor_outdoor} onChange={set('indoor_outdoor')} disabled={ro}><option value="">Not set</option><option value="indoor">Indoor</option><option value="outdoor">Outdoor</option><option value="both">Both</option></select></Field>
          </div>
          <Field label="Street address"><input className="lsl-input" value={v.address} onChange={set('address')} readOnly={ro} autoComplete="off" /></Field>
          <Field label="Parking & entrance instructions"><textarea className="lsl-textarea" value={v.parking} onChange={set('parking')} readOnly={ro} style={{ minHeight: 56 }} /></Field>
          <Field label="Weather instructions" hint="e.g. what happens if it rains for outdoor sessions"><textarea className="lsl-textarea" value={v.weather_notes} onChange={set('weather_notes')} readOnly={ro} style={{ minHeight: 56 }} /></Field>
          <Field label="Available hours"><input className="lsl-input" value={v.hours} onChange={set('hours')} readOnly={ro} placeholder="Weekdays 3–9 PM, weekends 8 AM–2 PM" /></Field>
          {app.isDirector && (
            <div className="lsl-a-grid">
              <Field label="Rental cost ($)" error={errs.rental_cost_cents}><input className="lsl-input" inputMode="decimal" value={v.rental_cost} onChange={set('rental_cost')} /></Field>
              <Field label="Charged"><select className="lsl-select" value={v.rental_basis} onChange={set('rental_basis')}><option value="">Not set</option><option value="hourly">Per hour</option><option value="per_session">Per session</option></select></Field>
            </div>
          )}
          <div className="lsl-a-block" style={{ marginTop: 12 }}>
            <div className="lsl-a-h4">Services offered here</div>
            <div className="lsl-a-checks">
              {app.types.filter((t) => !t.archived_at).map((t) => <label key={t.id} className="lsl-a-check"><input type="checkbox" disabled={ro} checked={v.eligible_type_ids.length === 0 || v.eligible_type_ids.includes(t.id)}
                onChange={() => { const all = app.types.filter((x) => !x.archived_at).map((x) => x.id); const cur = v.eligible_type_ids.length ? v.eligible_type_ids : all; const next = cur.includes(t.id) ? cur.filter((x) => x !== t.id) : [...cur, t.id]; setV({ ...v, eligible_type_ids: next.length === all.length ? [] : next }); }} /> {t.name}</label>)}
            </div>
          </div>
        </A.Expand>
        {app.isDirector && (
          <div className="lsl-a-row" style={{ marginTop: 10 }}>
            <span className="lsl-a-spacer" />
            {l.archived_at
              ? <button className="lsl-admin__del lsl-admin__del--text" onClick={restore}><Icon name="archive-restore" /> Restore</button>
              : <button className="lsl-admin__del lsl-admin__del--text" onClick={() => setArchiveDlg(true)}><Icon name="archive" /> Archive</button>}
          </div>
        )}
        <A.SaveBar dirty={dirty} saving={saving} onSave={() => save()} onDiscard={() => setV(orig)} label={'Unsaved changes to ' + (l.name || 'location')} />
        {decision && (
          <Dialog title="Upcoming appointments are affected" onClose={() => setDecision(null)} busy={saving}
            footer={<>
              <button className="lsl-btn lsl-btn--ghost lsl-btn--sm" onClick={() => setDecision(null)}>Cancel</button>
              <button className="lsl-btn lsl-btn--ghost lsl-btn--sm" onClick={() => save(false)} disabled={saving}>Keep their current details</button>
              <button className="lsl-btn lsl-btn--primary lsl-btn--sm" onClick={() => save(true)} disabled={saving}>Update their details</button>
            </>}>
            <p className="lsl-body lsl-body--sm" style={{ marginTop: 0 }}>{A.plural(decision.length, 'upcoming booking')} at this location. Should their booking details (used in reminder emails) switch to the new information? Past bookings always keep what they had.</p>
            <ul className="lsl-a-list">{decision.map((b) => <li key={b.id}>{LSL.fmtDate(b.date)} · {LSL.fmtTime(b.time)} · {b.athlete}</li>)}</ul>
            <p className="lsl-a-muted lsl-a-small">No emails are sent from here. Appointments are not moved.</p>
          </Dialog>
        )}
        {archiveDlg && <ArchiveDialog l={l} onClose={() => setArchiveDlg(false)} />}
      </div>
    );
  }

  function ArchiveDialog({ l, onClose }) {
    const app = A.useApp();
    const toast = A.useToast();
    const q = A.useFetch('/api/admin/locations/' + l.id + '/impact');
    const [open, setOpen] = useState('remove');
    const [ack, setAck] = useState(false);
    const [busy, setBusy] = useState(false);
    const imp = q.data;
    const submit = async () => {
      setBusy(true);
      try {
        const r = await A.api('POST', '/api/admin/locations/' + l.id + '/archive', { archive: true, open_slots: open, acknowledge_bookings: ack });
        toast('Location archived' + (r.kept_bookings ? ' — ' + A.plural(r.kept_bookings, 'booking') + ' still scheduled there' : ''));
        app.reload(); onClose();
      } catch (e) { toast(e.message, 'err'); } finally { setBusy(false); }
    };
    return (
      <Dialog title={'Archive ' + l.name + '?'} onClose={onClose} busy={busy}
        footer={<><button className="lsl-btn lsl-btn--ghost lsl-btn--sm" onClick={onClose}>Cancel</button><button className="lsl-btn lsl-btn--primary lsl-btn--sm" onClick={submit} disabled={busy || !imp || (imp.bookings.length > 0 && !ack)}>Archive</button></>}>
        {!imp ? <A.Loading /> : <>
          <p className="lsl-body lsl-body--sm" style={{ marginTop: 0 }}>Families won't be able to pick this location. Past bookings keep their location details.</p>
          {imp.open_slots > 0 && (
            <fieldset style={{ border: 0, padding: 0, margin: '0 0 14px' }}>
              <legend className="lsl-a-h4">{A.plural(imp.open_slots, 'future opening')} here</legend>
              <label className="lsl-a-check" style={{ display: 'flex', marginBottom: 6 }}><input type="radio" name="open" checked={open === 'remove'} onChange={() => setOpen('remove')} /> Delete them</label>
              <label className="lsl-a-check" style={{ display: 'flex' }}><input type="radio" name="open" checked={open === 'keep'} onChange={() => setOpen('keep')} /> Keep them (hidden from families while archived)</label>
            </fieldset>
          )}
          {imp.bookings.length > 0 && (
            <A.Banner tone="warn">
              <strong>{A.plural(imp.bookings.length, 'upcoming booking')}</strong> are scheduled here. They will <strong>not</strong> be moved or canceled.
              <ul className="lsl-a-list">{imp.bookings.map((b) => <li key={b.id}>{LSL.fmtDate(b.date)} · {LSL.fmtTime(b.time)} · {b.athlete}</li>)}</ul>
              <label className="lsl-a-check"><input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} /> I'll handle these bookings myself (reschedule or keep them here)</label>
            </A.Banner>
          )}
        </>}
      </Dialog>
    );
  }

  A.tabs = A.tabs || {};
  A.tabs.LocsTab = LocsTab;
})();
