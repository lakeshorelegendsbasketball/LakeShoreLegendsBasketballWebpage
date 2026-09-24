/* global React, ReactDOM, LSL */
/* Coach dashboard — shared pieces: API client, auth shell, UI primitives.
   Each admin file is wrapped in an IIFE and publishes to window.LSLA. */
(function () {
  const { useState, useEffect, useRef, useCallback, useContext, createContext, useMemo } = React;
  const A = (window.LSLA = window.LSLA || {});

  /* ---------------- API + session ---------------- */
  const TOKEN_KEY = 'lsl_admin_token';
  const store = {
    get() { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch (e) { return ''; } },
    set(v) { try { if (v) localStorage.setItem(TOKEN_KEY, v); else localStorage.removeItem(TOKEN_KEY); } catch (e) { /* private mode */ } },
  };
  let token = store.get();
  A.setToken = (t) => { token = t || ''; store.set(token); };
  A.api = async function (method, path, body) {
    try { return await LSL.api(method, path, body, token); } catch (e) {
      if (e.status === 401 && token) { A.setToken(''); window.dispatchEvent(new CustomEvent('lsl-auth-expired')); }
      throw e;
    }
  };

  /* ---------------- Icons (rendered by React, not DOM-swapped) ---------------- */
  const pascal = (n) => n.replace(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase());
  function Icon({ name, size = 16, className, label, style }) {
    const node = window.lucide && window.lucide.icons && window.lucide.icons[pascal(name)];
    if (!node) return null;
    return (
      <svg className={'lsl-a-ico' + (className ? ' ' + className : '')} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden={label ? undefined : 'true'} role={label ? 'img' : undefined} aria-label={label}>
        {node.map(([tag, attrs], i) => React.createElement(tag, { key: i, ...attrs }))}
      </svg>
    );
  }
  A.Icon = Icon;

  /* ---------------- Status vocabularies ---------------- */
  A.BOOKING = {
    requested: { label: 'Requested', tone: 'outline', icon: 'inbox' },
    awaiting_payment: { label: 'Awaiting payment', tone: 'warn', icon: 'hourglass' },
    confirmed: { label: 'Confirmed', tone: 'sky', icon: 'circle-check' },
    completed: { label: 'Completed', tone: 'green', icon: 'flag' },
    canceled: { label: 'Canceled', tone: 'muted', icon: 'circle-x' },
    declined: { label: 'Declined', tone: 'muted', icon: 'ban' },
    expired: { label: 'Hold expired', tone: 'muted', icon: 'timer-off' },
  };
  A.ATTENDANCE = {
    not_recorded: { label: 'Not recorded', tone: 'outline', icon: 'circle-dashed' },
    present: { label: 'Present', tone: 'green', icon: 'user-check' },
    late: { label: 'Late', tone: 'warn', icon: 'clock-alert' },
    no_show: { label: 'No-show', tone: 'danger', icon: 'user-x' },
  };
  A.PAYMENT = {
    unknown: { label: 'Unknown', tone: 'outline', icon: 'circle-help' },
    unpaid: { label: 'Unpaid', tone: 'warn', icon: 'circle-dollar-sign' },
    pending: { label: 'Pending', tone: 'warn', icon: 'loader' },
    paid: { label: 'Paid', tone: 'green', icon: 'badge-check' },
    partially_refunded: { label: 'Partially refunded', tone: 'orange', icon: 'undo-2' },
    refunded: { label: 'Refunded', tone: 'muted', icon: 'undo-2' },
    package_credit: { label: 'Package credit', tone: 'sky', icon: 'ticket' },
    complimentary: { label: 'Complimentary', tone: 'sky', icon: 'gift' },
  };
  function Badge({ tone = 'muted', icon, children, title }) {
    return <span className={'lsl-a-badge lsl-a-badge--' + tone} title={title}>{icon && <Icon name={icon} />}{children}</span>;
  }
  function StatusBadge({ kind, value }) {
    const map = kind === 'payment' ? A.PAYMENT : kind === 'attendance' ? A.ATTENDANCE : A.BOOKING;
    const m = map[value] || { label: value, tone: 'muted' };
    const prefix = kind === 'payment' ? 'Payment: ' : kind === 'attendance' ? 'Attendance: ' : 'Booking: ';
    return <Badge tone={m.tone} icon={m.icon} title={prefix + m.label}><span className="lsl-a-sr">{prefix}</span>{m.label}</Badge>;
  }
  A.Badge = Badge; A.StatusBadge = StatusBadge;

  /* ---------------- Toasts ---------------- */
  const ToastCtx = createContext(() => {});
  function ToastHost({ children }) {
    const [items, setItems] = useState([]);
    const push = useCallback((msg, tone = 'ok') => {
      const id = Math.random().toString(36).slice(2);
      setItems((x) => [...x, { id, msg, tone }]);
      setTimeout(() => setItems((x) => x.filter((t) => t.id !== id)), tone === 'err' ? 7000 : 3500);
    }, []);
    return (
      <ToastCtx.Provider value={push}>
        {children}
        <div className="lsl-a-toasts" role="status" aria-live="polite">
          {items.map((t) => (
            <div key={t.id} className={'lsl-a-toast is-' + t.tone}><Icon name={t.tone === 'err' ? 'circle-alert' : 'circle-check'} />{t.msg}</div>
          ))}
        </div>
      </ToastCtx.Provider>
    );
  }
  A.useToast = () => useContext(ToastCtx);

  /* ---------------- Dialog / Drawer with focus trap ---------------- */
  let openLayers = 0;
  function Dialog({ title, onClose, children, footer, wide, drawer, busy }) {
    const ref = useRef(null);
    const idRef = useRef('dlg-' + Math.random().toString(36).slice(2));
    const closeRef = useRef(onClose); closeRef.current = onClose;
    useEffect(() => {
      const prev = document.activeElement;
      const el = ref.current;
      const focusables = () => [...el.querySelectorAll('button, [href], input, select, textarea, summary, [tabindex]:not([tabindex="-1"])')].filter((x) => !x.disabled && x.offsetParent !== null);
      const auto = el.querySelector('[data-autofocus]');
      (auto || focusables()[1] || el).focus();
      const onKey = (e) => {
        if (e.key === 'Escape') { e.stopPropagation(); if (!busy) closeRef.current(); }
        if (e.key === 'Tab') {
          const list = focusables(); if (!list.length) return;
          const first = list[0], last = list[list.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      };
      el.addEventListener('keydown', onKey);
      openLayers++; document.body.style.overflow = 'hidden';
      return () => {
        el.removeEventListener('keydown', onKey);
        openLayers--; if (!openLayers) document.body.style.overflow = '';
        if (prev && prev.focus) prev.focus();
      };
    }, []);
    return ReactDOM.createPortal(
      <div className={'lsl-a-overlay' + (drawer ? ' lsl-a-overlay--drawer' : '')} onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
        <div ref={ref} className={'lsl-a-dialog' + (wide ? ' is-wide' : '')} role="dialog" aria-modal="true" aria-labelledby={idRef.current} tabIndex={-1}>
          <div className="lsl-a-dialog__head">
            <h2 id={idRef.current}>{title}</h2>
            <button className="lsl-a-iconbtn" onClick={onClose} aria-label="Close" disabled={busy}><Icon name="x" size={18} /></button>
          </div>
          <div className="lsl-a-dialog__body">{children}</div>
          {footer && <div className="lsl-a-dialog__foot">{footer}</div>}
        </div>
      </div>, document.body);
  }
  A.Dialog = Dialog;

  /** const [confirmUi, confirm] = useConfirm(); await confirm({title, body, confirmLabel, danger}) */
  A.useConfirm = function () {
    const [state, setState] = useState(null);
    const ask = useCallback((opts) => new Promise((resolve) => setState({ ...opts, resolve })), []);
    const close = (v) => { state && state.resolve(v); setState(null); };
    const ui = state && (
      <Dialog title={state.title || 'Are you sure?'} onClose={() => close(false)}
        footer={<>
          <button className="lsl-btn lsl-btn--ghost lsl-btn--sm" onClick={() => close(false)}>{state.cancelLabel || 'Keep it'}</button>
          <button className={'lsl-btn lsl-btn--sm ' + (state.danger ? 'lsl-btn--danger' : 'lsl-btn--primary')} onClick={() => close(true)} data-autofocus>{state.confirmLabel || 'Confirm'}</button>
        </>}>
        <div className="lsl-body lsl-body--sm">{state.body}</div>
      </Dialog>
    );
    return [ui, ask];
  };

  /* ---------------- Form bits ---------------- */
  let fid = 0;
  function Field({ label, error, hint, required, children, id, className }) {
    const auto = useRef('f' + (++fid)).current;
    const fieldId = id || auto;
    const child = React.Children.only(children);
    const input = React.cloneElement(child, { id: fieldId, 'aria-invalid': error ? true : undefined, 'aria-describedby': (error || hint) ? fieldId + '-d' : undefined,
      className: (child.props.className || '') + (error ? ' is-error' : '') });
    return (
      <div className={'lsl-field' + (className ? ' ' + className : '')}>
        {label && <label htmlFor={fieldId}>{label}{required && <span className="req"> *</span>}</label>}
        {input}
        {error ? <span className="lsl-err" id={fieldId + '-d'}>{error}</span> : hint ? <span className="lsl-a-hint" id={fieldId + '-d'}>{hint}</span> : null}
      </div>
    );
  }
  A.Field = Field;

  function Expand({ title, icon, children, defaultOpen, className, badge }) {
    return (
      <details className={'lsl-a-expand' + (className ? ' ' + className : '')} open={defaultOpen}>
        <summary><Icon name="chevron-right" className="lsl-a-chev" />{icon && <Icon name={icon} />}{title}{badge}</summary>
        <div className="lsl-a-expand__body">{children}</div>
      </details>
    );
  }
  A.Expand = Expand;

  function Seg({ value, options, onChange, label }) {
    return (
      <div className="lsl-a-seg" role="group" aria-label={label}>
        {options.map(([v, l]) => <button type="button" key={v} aria-pressed={value === v} onClick={() => onChange(v)}>{l}</button>)}
      </div>
    );
  }
  A.Seg = Seg;

  A.Loading = ({ text }) => <div className="lsl-a-loading" role="status"><Icon name="loader-circle" className="lsl-a-spin" size={18} />{text || 'Loading…'}</div>;
  A.Empty = ({ icon = 'inbox', children }) => <div className="lsl-a-empty"><Icon name={icon} />{children}</div>;
  A.Banner = ({ tone = 'info', icon, children }) => (
    <div className={'lsl-a-banner lsl-a-banner--' + tone} role={tone === 'danger' ? 'alert' : undefined}>
      <Icon name={icon || { info: 'info', warn: 'triangle-alert', danger: 'circle-alert', ok: 'circle-check' }[tone]} />
      <div>{children}</div>
    </div>
  );
  A.ErrorState = ({ error, onRetry }) => (
    <A.Banner tone="danger">{(error && error.message) || 'Something went wrong.'} {onRetry && <button className="lsl-a-linkbtn" onClick={onRetry}>Try again</button>}</A.Banner>
  );

  /** Save bar that appears when a form has unsaved changes. */
  A.SaveBar = function ({ dirty, saving, onSave, onDiscard, label }) {
    if (!dirty && !saving) return null;
    return (
      <div className="lsl-a-savebar" role="region" aria-label="Unsaved changes">
        <Icon name="pencil" /> {saving ? 'Saving…' : (label || 'You have unsaved changes')}
        <span className="lsl-a-spacer" />
        <button className="lsl-btn lsl-btn--ghost lsl-btn--xs" onClick={onDiscard} disabled={saving}>Discard</button>
        <button className="lsl-btn lsl-btn--primary lsl-btn--xs" onClick={onSave} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
      </div>
    );
  };

  /** Fetch helper with loading / error / reload. */
  A.useFetch = function (path, deps = []) {
    const [state, setState] = useState({ loading: true, data: null, error: null });
    const [n, setN] = useState(0);
    useEffect(() => {
      let live = true;
      if (!path) { setState({ loading: false, data: null, error: null }); return; }
      setState((s) => ({ ...s, loading: true, error: null }));
      A.api('GET', path).then((d) => live && setState({ loading: false, data: d, error: null }))
        .catch((e) => live && setState((s) => ({ loading: false, data: s.data, error: e })));
      return () => { live = false; };
    }, [path, n, ...deps]);
    return { ...state, reload: () => setN((x) => x + 1) };
  };

  /** Run an action with busy state and toast feedback. */
  A.useAction = function () {
    const toast = A.useToast();
    const [busy, setBusy] = useState(false);
    const run = useCallback(async (fn, okMsg) => {
      setBusy(true);
      try { const r = await fn(); if (okMsg) toast(typeof okMsg === 'function' ? okMsg(r) : okMsg); return r; }
      catch (e) { toast(e.message || 'Something went wrong.', 'err'); throw e; }
      finally { setBusy(false); }
    }, [toast]);
    return [busy, run];
  };

  /* ---------------- Formatting ---------------- */
  A.money = (c) => (c == null ? '—' : '$' + (c / 100).toFixed(c % 100 === 0 ? 0 : 2));
  A.parseMoney = (s) => { const n = Number(String(s).replace(/[$,\s]/g, '')); return Number.isFinite(n) ? Math.round(n * 100) : NaN; };
  A.when = (b) => b.date ? LSL.fmtDate(b.date) + ' · ' + LSL.fmtTime(b.time) : '';
  A.stamp = (iso) => iso ? new Date(iso).toLocaleString('en-US', { timeZone: LSL.tz(), month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';
  A.endTime = (t, mins) => { const [h, m] = t.split(':').map(Number); const x = h * 60 + m + (mins || 60); return String(Math.floor(x / 60) % 24).padStart(2, '0') + ':' + String(x % 60).padStart(2, '0'); };
  A.plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');
  A.copy = async (text, toast) => {
    try { await navigator.clipboard.writeText(text); toast && toast('Copied to clipboard'); }
    catch (e) { window.prompt('Copy this:', text); }
  };
  A.downloadCsv = (name, rows) => {
    const esc = (v) => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const csv = rows.map((r) => r.map(esc).join(',')).join('\r\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  };

  /* ---------------- App context ---------------- */
  const AppCtx = createContext(null);
  A.useApp = () => useContext(AppCtx);

  const TABS = [['avail', 'Availability'], ['types', 'Sessions & Links'], ['locs', 'Locations'], ['books', 'Bookings'], ['set', 'Settings']];

  function Login({ onAuthed }) {
    const [mode, setMode] = useState('checking');
    const [form, setForm] = useState({ email: '', password: '', name: '', setupToken: '' });
    const [err, setErr] = useState('');
    const [busy, setBusy] = useState(false);
    useEffect(() => {
      LSL.api('GET', '/api/auth/setup').then((d) => setMode(d.needsSetup ? 'setup' : 'login')).catch((e) => { setMode('login'); setErr(e.message); });
    }, []);
    const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
    const submit = async (e) => {
      e.preventDefault(); setErr(''); setBusy(true);
      try {
        const d = mode === 'setup'
          ? await LSL.api('POST', '/api/auth/setup', form)
          : await LSL.api('POST', '/api/auth/login', { email: form.email, password: form.password });
        A.setToken(d.token); onAuthed();
      } catch (ex) { setErr(ex.message); } finally { setBusy(false); }
    };
    return (
      <div className="lsl-adminpage">
        <form className="lsl-admin lsl-admin--login" onSubmit={submit} noValidate>
          <div className="lsl-admin__lock"><Icon name="lock" size={28} /></div>
          <h1 className="lsl-h3" style={{ margin: '0 0 6px', textAlign: 'center' }}>{mode === 'setup' ? 'Create Director Account' : 'Coach Login'}</h1>
          <p className="lsl-body lsl-body--sm" style={{ marginTop: 0, textAlign: 'center', color: 'var(--fg3)' }}>
            {mode === 'setup' ? 'First-time setup. You need the setup token from the deployment.' : 'LakeShore Legends — private booking dashboard.'}
          </p>
          {mode === 'checking' ? <A.Loading text="Connecting…" /> : <>
            {mode === 'setup' && <Field label="Your name"><input className="lsl-input" value={form.name} onChange={set('name')} autoComplete="name" /></Field>}
            <Field label="Email"><input className="lsl-input" type="email" value={form.email} onChange={set('email')} autoComplete="username" autoFocus /></Field>
            <Field label="Password" hint={mode === 'setup' ? 'At least 10 characters.' : null}>
              <input className="lsl-input" type="password" value={form.password} onChange={set('password')} autoComplete={mode === 'setup' ? 'new-password' : 'current-password'} />
            </Field>
            {mode === 'setup' && <Field label="Setup token"><input className="lsl-input" value={form.setupToken} onChange={set('setupToken')} autoComplete="off" /></Field>}
            {err && <span className="lsl-err" role="alert" style={{ textAlign: 'center' }}>{err}</span>}
            <button type="submit" className="lsl-btn lsl-btn--primary" disabled={busy} style={{ width: '100%', marginTop: 14 }}>
              {busy ? 'Please wait…' : mode === 'setup' ? 'Create account' : 'Sign in'}
            </button>
          </>}
        </form>
      </div>
    );
  }

  function Shell() {
    const [boot, setBoot] = useState(null);
    const [bootErr, setBootErr] = useState(null);
    const [authed, setAuthed] = useState(!!token);
    const initialTab = (() => { const h = (location.hash || '').slice(1); return TABS.some(([k]) => k === h) ? h : 'avail'; })();
    const [tab, setTabState] = useState(initialTab);
    const [bookingId, setBookingId] = useState(null);
    const [familyId, setFamilyId] = useState(null);
    const [version, setVersion] = useState(0); // bump to make tabs refetch
    const tabRefs = useRef({});

    const loadBoot = useCallback(() => {
      setBootErr(null);
      return A.api('GET', '/api/admin/bootstrap').then((d) => { setBoot(d); window.LSL_TZ = d.settings.timezone; }).catch((e) => setBootErr(e));
    }, []);
    useEffect(() => { if (authed) loadBoot(); }, [authed]);
    useEffect(() => {
      const el = tabRefs.current[tab];
      if (el && el.parentElement && el.parentElement.scrollWidth > el.parentElement.clientWidth) el.scrollIntoView({ block: 'nearest', inline: 'center' });
    }, [tab, !!boot]);
    useEffect(() => {
      const onExpired = () => { setAuthed(false); setBoot(null); };
      window.addEventListener('lsl-auth-expired', onExpired);
      return () => window.removeEventListener('lsl-auth-expired', onExpired);
    }, []);
    const setTab = (k) => { setTabState(k); try { history.replaceState(null, '', '#' + k); } catch (e) { /* ignore */ } };
    const onTabKey = (e, i) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length;
      setTab(TABS[n][0]); tabRefs.current[TABS[n][0]].focus();
    };

    const ctx = useMemo(() => boot && ({
      ...boot, isDirector: boot.me.role === 'director', reload: loadBoot, version,
      changed: () => setVersion((v) => v + 1),
      openBooking: setBookingId, openFamily: setFamilyId,
      locName: (id) => (boot.locations.find((l) => l.id === id) || {}).name || id,
      typeById: (id) => boot.types.find((t) => t.id === id) || {},
      coachName: (id) => (boot.coaches.find((c) => c.id === id) || {}).name,
    }), [boot, version, loadBoot]);

    if (!authed) return <Login onAuthed={() => setAuthed(true)} />;
    if (!boot) {
      return (
        <div className="lsl-adminpage"><div className="lsl-admin lsl-admin--page">
          {bootErr ? <A.ErrorState error={bootErr} onRetry={loadBoot} /> : <A.Loading text="Loading your dashboard…" />}
        </div></div>
      );
    }
    const signOut = async () => { try { await A.api('POST', '/api/auth/logout'); } catch (e) { /* ignore */ } A.setToken(''); setAuthed(false); setBoot(null); };
    const T = A.tabs || {};
    const Current = { avail: T.AvailTab, types: T.TypesTab, locs: T.LocsTab, books: T.BooksTab, set: T.SettingsTab }[tab];
    const tzShort = LSL.tzLabel(null, null, boot.settings.timezone);
    return (
      <AppCtx.Provider value={ctx}>
        <div className="lsl-adminpage">
          <div className="lsl-admin lsl-admin--page">
            <div className="lsl-admin__head">
              <img src="assets/badge-crest.png" alt="LakeShore Legends" style={{ height: 40 }} />
              <h1 className="lsl-h3" style={{ margin: 0 }}>Coach Dashboard</h1>
              <span className="lsl-pill lsl-pill--sky">{boot.me.name}</span>
              <span className="lsl-a-tz" title="All times are shown in this time zone"><Icon name="globe" size={13} />{boot.settings.timezone.replace('_', ' ')} ({tzShort})</span>
              <a className="lsl-admin__exit" href="training.html"><Icon name="external-link" size={14} /> View site</a>
              <button className="lsl-a-signout" onClick={signOut}><Icon name="log-out" size={14} /> Sign out</button>
            </div>
            <div className="lsl-admin__tabs" role="tablist" aria-label="Dashboard sections">
              {TABS.map(([k, l], i) => (
                <button key={k} ref={(el) => (tabRefs.current[k] = el)} role="tab" id={'tab-' + k} aria-selected={tab === k} aria-controls={'panel-' + k}
                  tabIndex={tab === k ? 0 : -1} className={tab === k ? 'is-active' : ''} onClick={() => setTab(k)} onKeyDown={(e) => onTabKey(e, i)}>{l}</button>
              ))}
            </div>
            <div className="lsl-admin__body" role="tabpanel" id={'panel-' + tab} aria-labelledby={'tab-' + tab}>
              {Current ? <Current key={tab} /> : <A.Loading />}
            </div>
          </div>
        </div>
        {bookingId && A.BookingDialog && <A.BookingDialog id={bookingId} onClose={() => setBookingId(null)} />}
        {familyId && A.FamilyDrawer && <A.FamilyDrawer id={familyId} onClose={() => setFamilyId(null)} />}
      </AppCtx.Provider>
    );
  }

  A.App = function () {
    return <ToastHost><Shell /></ToastHost>;
  };
})();
