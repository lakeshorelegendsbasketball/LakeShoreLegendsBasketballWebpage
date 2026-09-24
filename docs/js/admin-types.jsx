/* global React, LSL */
/* Coach dashboard — Sessions & Links tab (services + packages). */
(function () {
  const { useState, useEffect } = React;
  const A = window.LSLA;
  const { Icon, Badge, Field, Expand, Seg, Dialog } = A;
  const SITE = 'https://www.lakeshorelegendsbasketball.com';

  const toForm = (t) => ({
    name: t.name, size: t.size, duration: t.duration, min_participants: t.min_participants, max_participants: t.max_participants,
    pricing_basis: t.pricing_basis, pay_link: t.pay_link || '', booking_mode: t.booking_mode, eligible_loc_ids: t.eligible_loc_ids || [],
    coach_ids: t.coach_ids || [], description: t.description || '', prep_instructions: t.prep_instructions || '', active: !!t.active,
  });

  function validate(v) {
    const e = {};
    if (!v.name.trim()) e.name = 'Required';
    if (!(v.duration >= 15 && v.duration <= 480)) e.duration = '15–480 min';
    if (!(v.min_participants >= 1)) e.min_participants = 'At least 1';
    if (!(v.max_participants >= v.min_participants)) e.max_participants = 'Must be ≥ minimum';
    if (v.pay_link && !/^https:\/\/(buy|checkout)\.stripe\.com\/[\w\/-]+$/.test(v.pay_link.trim())) e.pay_link = 'Use a Stripe Payment Link (https://buy.stripe.com/…)';
    return e;
  }

  function TypesTab() {
    const app = A.useApp();
    const toast = A.useToast();
    const [busy, run] = A.useAction();
    const [showArchived, setShowArchived] = useState(false);
    const types = app.types.filter((t) => showArchived || !t.archived_at);
    const archivedCount = app.types.filter((t) => t.archived_at).length;
    const stripe = app.integrations && app.integrations.stripe;
    const lastCheck = app.types.map((t) => t.stripe_checked_at).filter(Boolean).sort().pop();
    const add = () => run(() => A.api('POST', '/api/admin/types', { name: 'New Session', size: '1-on-1', duration: app.settings.defaultDuration, min_participants: 1, max_participants: 1, booking_mode: 'request', active: false }), 'Session type added (inactive until you finish it)').then(app.reload);
    const verify = () => run(() => A.api('POST', '/api/admin/types/verify-prices'), (r) => r.status === 'ok' ? 'Prices checked with Stripe' : 'Could not verify: ' + r.detail).then(app.reload).catch(() => app.reload());
    if (!app.isDirector) return <ReadOnlyTypes />;
    return (
      <div>
        <p className="lsl-body lsl-body--sm" style={{ marginTop: 0, color: 'var(--fg3)' }}>
          Each session forwards to its Stripe Payment Link after the family reserves. Edit prices in Stripe — Stripe is the source of truth, and the checkout page always shows the live price.
        </p>
        <div className="lsl-a-banner lsl-a-banner--info" style={{ alignItems: 'center' }}>
          <Icon name="badge-dollar-sign" />
          <div style={{ flex: 1 }}>
            {stripe && stripe.api === 'configured'
              ? <>Prices shown below come from Stripe{lastCheck ? ' (last checked ' + A.stamp(lastCheck) + ')' : ''}.</>
              : <>Price verification is unavailable — add a read-only Stripe key to show live prices here. Payments still work and are verified by the Stripe webhook.</>}
          </div>
          <button className="lsl-btn lsl-btn--ghost lsl-btn--xs" onClick={verify} disabled={busy}><Icon name="refresh-cw" /> Check prices</button>
        </div>
        {types.map((t) => <TypeCard key={t.id} t={t} />)}
        <div className="lsl-a-row">
          <button className="lsl-btn lsl-btn--ghost lsl-btn--sm" onClick={add} disabled={busy}><Icon name="plus" /> Add session type</button>
          {archivedCount > 0 && <button className="lsl-a-linkbtn" onClick={() => setShowArchived(!showArchived)}>{showArchived ? 'Hide' : 'Show'} {archivedCount} archived</button>}
        </div>
        <div style={{ height: 22 }} />
        <PackagesSection />
      </div>
    );
  }

  function ReadOnlyTypes() {
    const app = A.useApp();
    return (
      <div>
        <A.Banner tone="info">Only a director can change services and prices.</A.Banner>
        {app.types.filter((t) => t.active).map((t) => (
          <div key={t.id} className="lsl-a-card"><div className="lsl-a-card__head"><h3 className="lsl-a-card__title">{t.name}</h3><Badge tone="muted">{t.size} · {t.duration} min</Badge></div>
            {t.description && <p className="lsl-a-small">{t.description}</p>}
            {t.prep_instructions && <p className="lsl-a-small"><strong>Prep:</strong> {t.prep_instructions}</p>}
          </div>
        ))}
      </div>
    );
  }

  function PriceBadge({ t }) {
    if (!t.pay_link) return <Badge tone="warn" icon="link-2-off">No payment link</Badge>;
    if (t.stripe_check_status === 'verified') return <Badge tone="green" icon="badge-check" title={t.stripe_check_detail || 'Verified with Stripe'}>{t.stripe_price_cents != null ? A.money(t.stripe_price_cents) + (t.pricing_basis === 'athlete' ? ' / athlete' : '') : 'Link verified'}</Badge>;
    if (t.stripe_check_status === 'mismatch') return <Badge tone="danger" icon="circle-alert" title={t.stripe_check_detail}>Link problem</Badge>;
    return <Badge tone="outline" icon="circle-help" title={t.stripe_check_detail || 'Not checked with Stripe'}>Price not verified</Badge>;
  }

  function TypeCard({ t }) {
    const app = A.useApp();
    const toast = A.useToast();
    const [confirmUi, confirm] = A.useConfirm();
    const [v, setV] = useState(() => toForm(t));
    const [errs, setErrs] = useState({});
    const [saving, setSaving] = useState(false);
    const [busy, run] = A.useAction();
    useEffect(() => { setV(toForm(t)); }, [t]);
    const orig = toForm(t);
    const dirty = JSON.stringify(v) !== JSON.stringify(orig);
    const set = (k, num) => (e) => setV({ ...v, [k]: num ? +e.target.value : e.target.value });
    const toggleIn = (k, id) => setV({ ...v, [k]: v[k].includes(id) ? v[k].filter((x) => x !== id) : [...v[k], id] });
    const save = async () => {
      const e = validate(v); setErrs(e);
      if (Object.keys(e).length) { toast('Please fix the highlighted fields', 'err'); return; }
      setSaving(true);
      try { await A.api('PUT', '/api/admin/types/' + t.id, v); toast('"' + v.name + '" saved'); app.reload(); }
      catch (ex) { setErrs(ex.fields || {}); toast(ex.message, 'err'); } finally { setSaving(false); }
    };
    const archive = async (flag) => {
      if (flag && !(await confirm({ title: 'Archive "' + t.name + '"?', body: 'It disappears from the booking page. Past and upcoming bookings keep their original name and price.', confirmLabel: 'Archive' }))) return;
      run(() => A.api('POST', '/api/admin/types/' + t.id + '/archive', { archive: flag }), flag ? 'Archived' : 'Restored').then(app.reload);
    };
    const del = async () => {
      if (!(await confirm({ title: 'Delete "' + t.name + '" permanently?', body: 'Only possible when no booking has ever used it. Otherwise, archive it.', confirmLabel: 'Delete', danger: true }))) return;
      run(() => A.api('DELETE', '/api/admin/types/' + t.id), 'Deleted').then(app.reload).catch(() => {});
    };
    const bookingLink = SITE + '/training.html#book';
    return (
      <div className={'lsl-a-card' + (!t.active ? ' is-inactive' : '')}>
        {confirmUi}
        <div className="lsl-a-card__head">
          <h3 className="lsl-a-card__title">{t.name}</h3>
          {t.archived_at ? <Badge tone="muted" icon="archive">Archived</Badge> : t.active ? <Badge tone="green" icon="circle-check">Active</Badge> : <Badge tone="muted" icon="circle-pause">Inactive</Badge>}
          {t.booking_mode === 'request' && <Badge tone="outline" icon="inbox">Request / approval</Badge>}
          <PriceBadge t={t} />
        </div>
        {t.stripe_check_status === 'mismatch' && <A.Banner tone="danger">{t.stripe_check_detail}</A.Banner>}
        <div className="lsl-field lsl-field--row">
          <Field label="Name" error={errs.name}><input className="lsl-input" value={v.name} onChange={set('name')} /></Field>
          <div className="lsl-a-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <Field label="Format"><input className="lsl-input" value={v.size} onChange={set('size')} placeholder="1-on-1" /></Field>
            <Field label="Minutes" error={errs.duration}><input className="lsl-input" type="number" min="15" max="480" step="5" value={v.duration} onChange={set('duration', true)} /></Field>
          </div>
        </div>
        <Field label="Stripe Payment Link" error={errs.pay_link} hint="Payments are matched to bookings automatically — the booking ID is attached when the family is sent to Stripe.">
          <input className="lsl-input" value={v.pay_link} onChange={set('pay_link')} placeholder="https://buy.stripe.com/..." />
        </Field>
        <Expand title="More options" icon="settings-2">
          <div className="lsl-a-grid">
            <Field label="Min participants" error={errs.min_participants}><input className="lsl-input" type="number" min="1" value={v.min_participants} onChange={set('min_participants', true)} /></Field>
            <Field label="Max participants" error={errs.max_participants}><input className="lsl-input" type="number" min="1" value={v.max_participants} onChange={set('max_participants', true)} /></Field>
          </div>
          <div className="lsl-a-block" style={{ marginTop: 12 }}>
            <div className="lsl-a-h4">Price is charged</div>
            <Seg label="Pricing basis" value={v.pricing_basis} onChange={(x) => setV({ ...v, pricing_basis: x })} options={[['group', 'Once for the whole group'], ['athlete', 'Per athlete']]} />
            {v.pricing_basis === 'athlete' && <p className="lsl-a-muted lsl-a-small">Make sure the Stripe Payment Link lets the customer set the quantity, or send each athlete their own link.</p>}
          </div>
          <div className="lsl-a-block">
            <div className="lsl-a-h4">How families book</div>
            <Seg label="Booking mode" value={v.booking_mode} onChange={(x) => setV({ ...v, booking_mode: x })} options={[['immediate', 'Book immediately'], ['request', 'Request — I approve']]} />
          </div>
          <div className="lsl-a-block">
            <div className="lsl-a-h4">Offered at</div>
            <div className="lsl-a-checks">
              {app.locations.filter((l) => !l.archived_at).map((l) => <label key={l.id} className="lsl-a-check"><input type="checkbox" checked={v.eligible_loc_ids.length === 0 || v.eligible_loc_ids.includes(l.id)}
                onChange={() => { const cur = v.eligible_loc_ids.length ? v.eligible_loc_ids : app.locations.map((x) => x.id); const next = cur.includes(l.id) ? cur.filter((x) => x !== l.id) : [...cur, l.id]; setV({ ...v, eligible_loc_ids: next.length === app.locations.length ? [] : next }); }} /> {l.name}</label>)}
            </div>
            <span className="lsl-a-muted lsl-a-small">All checked = every location.</span>
          </div>
          {app.coaches.filter((c) => c.active).length > 1 && (
            <div className="lsl-a-block">
              <div className="lsl-a-h4">Coaches who can run it</div>
              <div className="lsl-a-checks">
                {app.coaches.filter((c) => c.active).map((c) => <label key={c.id} className="lsl-a-check"><input type="checkbox" checked={v.coach_ids.includes(c.id)} onChange={() => toggleIn('coach_ids', c.id)} /> {c.name}</label>)}
              </div>
              <span className="lsl-a-muted lsl-a-small">None checked = any coach.</span>
            </div>
          )}
          <Field label="Description (shown to families)"><textarea className="lsl-textarea" value={v.description} onChange={set('description')} style={{ minHeight: 60 }} /></Field>
          <Field label="Preparation instructions" hint="Included in confirmation and reminder emails"><textarea className="lsl-textarea" value={v.prep_instructions} onChange={set('prep_instructions')} style={{ minHeight: 60 }} placeholder="Bring a ball, water, and court shoes." /></Field>
          <label className="lsl-a-check"><input type="checkbox" checked={v.active} onChange={(e) => setV({ ...v, active: e.target.checked })} /> Active — show on the booking page</label>
        </Expand>
        <div className="lsl-a-row" style={{ marginTop: 12 }}>
          {v.pay_link && <a className="lsl-btn lsl-btn--ghost lsl-btn--xs" href={v.pay_link} target="_blank" rel="noopener"><Icon name="external-link" /> Preview checkout</a>}
          <button className="lsl-btn lsl-btn--ghost lsl-btn--xs" onClick={() => A.copy(bookingLink, toast)}><Icon name="link" /> Copy booking link</button>
          <span className="lsl-a-spacer" />
          {t.archived_at
            ? <button className="lsl-admin__del lsl-admin__del--text" onClick={() => archive(false)}><Icon name="archive-restore" /> Restore</button>
            : <button className="lsl-admin__del lsl-admin__del--text" onClick={() => archive(true)}><Icon name="archive" /> Archive</button>}
          {t.archived_at && <button className="lsl-admin__del lsl-admin__del--text" onClick={del}><Icon name="trash-2" /> Delete</button>}
        </div>
        <A.SaveBar dirty={dirty} saving={saving} onSave={save} onDiscard={() => { setV(orig); setErrs({}); }} label={'Unsaved changes to ' + t.name} />
      </div>
    );
  }

  /* ---------------- Packages ---------------- */
  function PackagesSection() {
    const app = A.useApp();
    const q = A.useFetch('/api/admin/packages', [app.version]);
    const [editing, setEditing] = useState(null);
    const pkgs = q.data ? q.data.packages : [];
    return (
      <details className="lsl-a-expand lsl-a-section">
        <summary><Icon name="chevron-right" className="lsl-a-chev" /><Icon name="ticket" /> Packages {pkgs.length ? '(' + pkgs.filter((p) => p.active).length + ' active)' : ''}</summary>
        <div className="lsl-a-expand__body">
          <p className="lsl-a-small lsl-a-muted" style={{ marginTop: 0 }}>Prepaid session bundles. Billing is <strong>one-time</strong> — recurring subscriptions are not set up. Credits are tracked per family and applied from each booking.</p>
          {q.loading && !q.data ? <A.Loading /> : q.error ? <A.ErrorState error={q.error} onRetry={q.reload} /> : pkgs.length === 0 ? <A.Empty icon="ticket">No packages yet.</A.Empty> : (
            <ul className="lsl-a-list">
              {pkgs.map((p) => (
                <li key={p.id}>
                  <strong>{p.name}</strong>
                  <span>{A.money(p.price_cents)} · {p.credits == null ? 'Unlimited sessions' : A.plural(p.credits, 'session')} · {p.validity_days ? 'valid ' + p.validity_days + ' days' : 'no expiration'}</span>
                  {p.archived_at ? <Badge tone="muted">Archived</Badge> : p.active ? <Badge tone="green">Active</Badge> : <Badge tone="muted">Inactive</Badge>}
                  <span className="lsl-a-muted lsl-a-small">{p.sold} sold</span>
                  <span className="lsl-a-spacer" />
                  <button className="lsl-btn lsl-btn--ghost lsl-btn--xs" onClick={() => setEditing(p)}>Edit</button>
                </li>
              ))}
            </ul>
          )}
          <button className="lsl-btn lsl-btn--ghost lsl-btn--xs" style={{ marginTop: 10 }} onClick={() => setEditing({})}><Icon name="plus" /> Add package</button>
        </div>
        {editing && <PackageDialog p={editing} onClose={() => setEditing(null)} onDone={() => { q.reload(); app.changed(); }} />}
      </details>
    );
  }

  function PackageDialog({ p, onClose, onDone }) {
    const app = A.useApp();
    const toast = A.useToast();
    const [confirmUi, confirm] = A.useConfirm();
    const isNew = !p.id;
    const [v, setV] = useState({
      name: p.name || '', price: p.price_cents != null ? (p.price_cents / 100).toFixed(2) : '', unlimited: p.id ? p.credits == null : false, credits: p.credits || 5,
      validity_days: p.validity_days || '', eligible_type_ids: p.eligible_type_ids || [], pay_link: p.pay_link || '', description: p.description || '', active: p.id ? !!p.active : true,
    });
    const [errs, setErrs] = useState({});
    const [busy, setBusy] = useState(false);
    const save = async () => {
      setBusy(true); setErrs({});
      try {
        await A.api(isNew ? 'POST' : 'PUT', '/api/admin/packages' + (isNew ? '' : '/' + p.id), {
          name: v.name, price_cents: A.parseMoney(v.price), credits: v.unlimited ? null : +v.credits, validity_days: v.validity_days === '' ? null : +v.validity_days,
          eligible_type_ids: v.eligible_type_ids, pay_link: v.pay_link, description: v.description, active: v.active,
        });
        toast('Package saved'); onDone(); onClose();
      } catch (e) { setErrs(e.fields || {}); toast(e.message, 'err'); } finally { setBusy(false); }
    };
    const archive = async () => {
      if (!(await confirm({ title: 'Archive this package?', body: 'Families who bought it keep their credits and history.', confirmLabel: 'Archive' }))) return;
      try { await A.api('POST', '/api/admin/packages/' + p.id + '/archive', { archive: !p.archived_at }); toast(p.archived_at ? 'Restored' : 'Archived'); onDone(); onClose(); } catch (e) { toast(e.message, 'err'); }
    };
    const rule = v.validity_days ? 'Expires ' + v.validity_days + ' days after purchase. Unused credits are forfeited at expiration.' : (v.unlimited ? 'Unlimited access needs a validity period.' : 'Credits never expire.');
    return (
      <Dialog title={isNew ? 'New package' : 'Edit ' + p.name} onClose={onClose} busy={busy}
        footer={<>
          {!isNew && <button className="lsl-admin__del lsl-admin__del--text" onClick={archive}><Icon name="archive" /> {p.archived_at ? 'Restore' : 'Archive'}</button>}
          <span className="lsl-a-spacer" />
          <button className="lsl-btn lsl-btn--ghost lsl-btn--sm" onClick={onClose}>Cancel</button>
          <button className="lsl-btn lsl-btn--primary lsl-btn--sm" onClick={save} disabled={busy}>Save package</button>
        </>}>
        {confirmUi}
        <div className="lsl-a-grid">
          <Field label="Package name" error={errs.name}><input className="lsl-input" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} placeholder="5-Session Pack" /></Field>
          <Field label="Price ($)" error={errs.price_cents}><input className="lsl-input" inputMode="decimal" value={v.price} onChange={(e) => setV({ ...v, price: e.target.value })} /></Field>
        </div>
        <div className="lsl-a-block" style={{ marginTop: 12 }}>
          <div className="lsl-a-h4">Sessions included</div>
          <Seg label="Sessions included" value={v.unlimited ? 'u' : 'c'} onChange={(x) => setV({ ...v, unlimited: x === 'u' })} options={[['c', 'A set number'], ['u', 'Unlimited for a period']]} />
          {!v.unlimited && <Field label="Session credits" error={errs.credits} className=""><input className="lsl-input" type="number" min="1" value={v.credits} onChange={(e) => setV({ ...v, credits: e.target.value })} style={{ maxWidth: 120 }} /></Field>}
        </div>
        <Field label="Valid for (days)" error={errs.validity_days} hint={rule}><input className="lsl-input" type="number" min="1" value={v.validity_days} onChange={(e) => setV({ ...v, validity_days: e.target.value })} placeholder="e.g. 90 — blank = no expiration" style={{ maxWidth: 220 }} /></Field>
        <div className="lsl-a-block">
          <div className="lsl-a-h4">Can be used for</div>
          <div className="lsl-a-checks">
            {app.types.filter((t) => !t.archived_at).map((t) => <label key={t.id} className="lsl-a-check"><input type="checkbox" checked={v.eligible_type_ids.includes(t.id)} onChange={() => setV({ ...v, eligible_type_ids: v.eligible_type_ids.includes(t.id) ? v.eligible_type_ids.filter((x) => x !== t.id) : [...v.eligible_type_ids, t.id] })} /> {t.name}</label>)}
          </div>
          <span className="lsl-a-muted lsl-a-small">None checked = any session type.</span>
        </div>
        <div className="lsl-a-block">
          <div className="lsl-a-h4">Billing</div>
          <Badge tone="sky" icon="receipt">One-time payment</Badge>
          <p className="lsl-a-muted lsl-a-small">Recurring billing isn't set up, so packages are always sold as a single payment.</p>
        </div>
        <Field label="Stripe Payment Link (optional)" error={errs.pay_link} hint="For selling online. You can also record sales from a family's profile."><input className="lsl-input" value={v.pay_link} onChange={(e) => setV({ ...v, pay_link: e.target.value })} placeholder="https://buy.stripe.com/..." /></Field>
        <Field label="Description"><textarea className="lsl-textarea" value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} style={{ minHeight: 56 }} /></Field>
        <label className="lsl-a-check"><input type="checkbox" checked={v.active} onChange={(e) => setV({ ...v, active: e.target.checked })} /> Active</label>
      </Dialog>
    );
  }

  A.tabs = A.tabs || {};
  A.tabs.TypesTab = TypesTab;
})();
