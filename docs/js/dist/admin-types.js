function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
/* global React, LSL */
/* Coach dashboard — Sessions & Links tab (services + packages). */
(function () {
  var _React = React,
    useState = _React.useState,
    useEffect = _React.useEffect;
  var A = window.LSLA;
  var Icon = A.Icon,
    Badge = A.Badge,
    Field = A.Field,
    Expand = A.Expand,
    Seg = A.Seg,
    Dialog = A.Dialog;
  var SITE = 'https://www.lakeshorelegendsbasketball.com';
  var toForm = t => ({
    name: t.name,
    size: t.size,
    duration: t.duration,
    min_participants: t.min_participants,
    max_participants: t.max_participants,
    pricing_basis: t.pricing_basis,
    pay_link: t.pay_link || '',
    booking_mode: t.booking_mode,
    eligible_loc_ids: t.eligible_loc_ids || [],
    coach_ids: t.coach_ids || [],
    description: t.description || '',
    prep_instructions: t.prep_instructions || '',
    active: !!t.active
  });
  function validate(v) {
    var e = {};
    if (!v.name.trim()) e.name = 'Required';
    if (!(v.duration >= 15 && v.duration <= 480)) e.duration = '15–480 min';
    if (!(v.min_participants >= 1)) e.min_participants = 'At least 1';
    if (!(v.max_participants >= v.min_participants)) e.max_participants = 'Must be ≥ minimum';
    if (v.pay_link && !/^https:\/\/(buy|checkout)\.stripe\.com\/[\w\/-]+$/.test(v.pay_link.trim())) e.pay_link = 'Use a Stripe Payment Link (https://buy.stripe.com/…)';
    return e;
  }
  function TypesTab() {
    var app = A.useApp();
    var toast = A.useToast();
    var _A$useAction = A.useAction(),
      _A$useAction2 = _slicedToArray(_A$useAction, 2),
      busy = _A$useAction2[0],
      run = _A$useAction2[1];
    var _useState = useState(false),
      _useState2 = _slicedToArray(_useState, 2),
      showArchived = _useState2[0],
      setShowArchived = _useState2[1];
    var types = app.types.filter(t => showArchived || !t.archived_at);
    var archivedCount = app.types.filter(t => t.archived_at).length;
    var stripe = app.integrations && app.integrations.stripe;
    var lastCheck = app.types.map(t => t.stripe_checked_at).filter(Boolean).sort().pop();
    var add = () => run(() => A.api('POST', '/api/admin/types', {
      name: 'New Session',
      size: '1-on-1',
      duration: app.settings.defaultDuration,
      min_participants: 1,
      max_participants: 1,
      booking_mode: 'request',
      active: false
    }), 'Session type added (inactive until you finish it)').then(app.reload);
    var verify = () => run(() => A.api('POST', '/api/admin/types/verify-prices'), r => r.status === 'ok' ? 'Prices checked with Stripe' : 'Could not verify: ' + r.detail).then(app.reload).catch(() => app.reload());
    if (!app.isDirector) return /*#__PURE__*/React.createElement(ReadOnlyTypes, null);
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
      className: "lsl-body lsl-body--sm",
      style: {
        marginTop: 0,
        color: 'var(--fg3)'
      }
    }, "Each session forwards to its Stripe Payment Link after the family reserves. Edit prices in Stripe \u2014 Stripe is the source of truth, and the checkout page always shows the live price."), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-banner lsl-a-banner--info",
      style: {
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "badge-dollar-sign"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, stripe && stripe.api === 'configured' ? /*#__PURE__*/React.createElement(React.Fragment, null, "Prices shown below come from Stripe", lastCheck ? ' (last checked ' + A.stamp(lastCheck) + ')' : '', ".") : /*#__PURE__*/React.createElement(React.Fragment, null, "Price verification is unavailable \u2014 add a read-only Stripe key to show live prices here. Payments still work and are verified by the Stripe webhook.")), /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--xs",
      onClick: verify,
      disabled: busy
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "refresh-cw"
    }), " Check prices")), types.map(t => /*#__PURE__*/React.createElement(TypeCard, {
      key: t.id,
      t: t
    })), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-row"
    }, /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
      onClick: add,
      disabled: busy
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "plus"
    }), " Add session type"), archivedCount > 0 && /*#__PURE__*/React.createElement("button", {
      className: "lsl-a-linkbtn",
      onClick: () => setShowArchived(!showArchived)
    }, showArchived ? 'Hide' : 'Show', " ", archivedCount, " archived")), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 22
      }
    }), /*#__PURE__*/React.createElement(PackagesSection, null));
  }
  function ReadOnlyTypes() {
    var app = A.useApp();
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(A.Banner, {
      tone: "info"
    }, "Only a director can change services and prices."), app.types.filter(t => t.active).map(t => /*#__PURE__*/React.createElement("div", {
      key: t.id,
      className: "lsl-a-card"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-card__head"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "lsl-a-card__title"
    }, t.name), /*#__PURE__*/React.createElement(Badge, {
      tone: "muted"
    }, t.size, " \xB7 ", t.duration, " min")), t.description && /*#__PURE__*/React.createElement("p", {
      className: "lsl-a-small"
    }, t.description), t.prep_instructions && /*#__PURE__*/React.createElement("p", {
      className: "lsl-a-small"
    }, /*#__PURE__*/React.createElement("strong", null, "Prep:"), " ", t.prep_instructions))));
  }
  function PriceBadge(_ref) {
    var t = _ref.t;
    if (!t.pay_link) return /*#__PURE__*/React.createElement(Badge, {
      tone: "warn",
      icon: "link-2-off"
    }, "No payment link");
    if (t.stripe_check_status === 'verified') return /*#__PURE__*/React.createElement(Badge, {
      tone: "green",
      icon: "badge-check",
      title: t.stripe_check_detail || 'Verified with Stripe'
    }, t.stripe_price_cents != null ? A.money(t.stripe_price_cents) + (t.pricing_basis === 'athlete' ? ' / athlete' : '') : 'Link verified');
    if (t.stripe_check_status === 'mismatch') return /*#__PURE__*/React.createElement(Badge, {
      tone: "danger",
      icon: "circle-alert",
      title: t.stripe_check_detail
    }, "Link problem");
    return /*#__PURE__*/React.createElement(Badge, {
      tone: "outline",
      icon: "circle-help",
      title: t.stripe_check_detail || 'Not checked with Stripe'
    }, "Price not verified");
  }
  function TypeCard(_ref2) {
    var t = _ref2.t;
    var app = A.useApp();
    var toast = A.useToast();
    var _A$useConfirm = A.useConfirm(),
      _A$useConfirm2 = _slicedToArray(_A$useConfirm, 2),
      confirmUi = _A$useConfirm2[0],
      confirm = _A$useConfirm2[1];
    var _useState3 = useState(() => toForm(t)),
      _useState4 = _slicedToArray(_useState3, 2),
      v = _useState4[0],
      setV = _useState4[1];
    var _useState5 = useState({}),
      _useState6 = _slicedToArray(_useState5, 2),
      errs = _useState6[0],
      setErrs = _useState6[1];
    var _useState7 = useState(false),
      _useState8 = _slicedToArray(_useState7, 2),
      saving = _useState8[0],
      setSaving = _useState8[1];
    var _A$useAction3 = A.useAction(),
      _A$useAction4 = _slicedToArray(_A$useAction3, 2),
      busy = _A$useAction4[0],
      run = _A$useAction4[1];
    useEffect(() => {
      setV(toForm(t));
    }, [t]);
    var orig = toForm(t);
    var dirty = JSON.stringify(v) !== JSON.stringify(orig);
    var set = (k, num) => e => setV(_objectSpread(_objectSpread({}, v), {}, {
      [k]: num ? +e.target.value : e.target.value
    }));
    var toggleIn = (k, id) => setV(_objectSpread(_objectSpread({}, v), {}, {
      [k]: v[k].includes(id) ? v[k].filter(x => x !== id) : [...v[k], id]
    }));
    var save = /*#__PURE__*/function () {
      var _ref3 = _asyncToGenerator(function* () {
        var e = validate(v);
        setErrs(e);
        if (Object.keys(e).length) {
          toast('Please fix the highlighted fields', 'err');
          return;
        }
        setSaving(true);
        try {
          yield A.api('PUT', '/api/admin/types/' + t.id, v);
          toast('"' + v.name + '" saved');
          app.reload();
        } catch (ex) {
          setErrs(ex.fields || {});
          toast(ex.message, 'err');
        } finally {
          setSaving(false);
        }
      });
      return function save() {
        return _ref3.apply(this, arguments);
      };
    }();
    var archive = /*#__PURE__*/function () {
      var _ref4 = _asyncToGenerator(function* (flag) {
        if (flag && !(yield confirm({
          title: 'Archive "' + t.name + '"?',
          body: 'It disappears from the booking page. Past and upcoming bookings keep their original name and price.',
          confirmLabel: 'Archive'
        }))) return;
        run(() => A.api('POST', '/api/admin/types/' + t.id + '/archive', {
          archive: flag
        }), flag ? 'Archived' : 'Restored').then(app.reload);
      });
      return function archive(_x) {
        return _ref4.apply(this, arguments);
      };
    }();
    var del = /*#__PURE__*/function () {
      var _ref5 = _asyncToGenerator(function* () {
        if (!(yield confirm({
          title: 'Delete "' + t.name + '" permanently?',
          body: 'Only possible when no booking has ever used it. Otherwise, archive it.',
          confirmLabel: 'Delete',
          danger: true
        }))) return;
        run(() => A.api('DELETE', '/api/admin/types/' + t.id), 'Deleted').then(app.reload).catch(() => {});
      });
      return function del() {
        return _ref5.apply(this, arguments);
      };
    }();
    var bookingLink = SITE + '/training.html#book';
    return /*#__PURE__*/React.createElement("div", {
      className: 'lsl-a-card' + (!t.active ? ' is-inactive' : '')
    }, confirmUi, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-card__head"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "lsl-a-card__title"
    }, t.name), t.archived_at ? /*#__PURE__*/React.createElement(Badge, {
      tone: "muted",
      icon: "archive"
    }, "Archived") : t.active ? /*#__PURE__*/React.createElement(Badge, {
      tone: "green",
      icon: "circle-check"
    }, "Active") : /*#__PURE__*/React.createElement(Badge, {
      tone: "muted",
      icon: "circle-pause"
    }, "Inactive"), t.booking_mode === 'request' && /*#__PURE__*/React.createElement(Badge, {
      tone: "outline",
      icon: "inbox"
    }, "Request / approval"), /*#__PURE__*/React.createElement(PriceBadge, {
      t: t
    })), t.stripe_check_status === 'mismatch' && /*#__PURE__*/React.createElement(A.Banner, {
      tone: "danger"
    }, t.stripe_check_detail), /*#__PURE__*/React.createElement("div", {
      className: "lsl-field lsl-field--row"
    }, /*#__PURE__*/React.createElement(Field, {
      label: "Name",
      error: errs.name
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      value: v.name,
      onChange: set('name')
    })), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-grid",
      style: {
        gridTemplateColumns: '1fr 1fr'
      }
    }, /*#__PURE__*/React.createElement(Field, {
      label: "Format"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      value: v.size,
      onChange: set('size'),
      placeholder: "1-on-1"
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Minutes",
      error: errs.duration
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      type: "number",
      min: "15",
      max: "480",
      step: "5",
      value: v.duration,
      onChange: set('duration', true)
    })))), /*#__PURE__*/React.createElement(Field, {
      label: "Stripe Payment Link",
      error: errs.pay_link,
      hint: "Payments are matched to bookings automatically \u2014 the booking ID is attached when the family is sent to Stripe."
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      value: v.pay_link,
      onChange: set('pay_link'),
      placeholder: "https://buy.stripe.com/..."
    })), /*#__PURE__*/React.createElement(Expand, {
      title: "More options",
      icon: "settings-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-grid"
    }, /*#__PURE__*/React.createElement(Field, {
      label: "Min participants",
      error: errs.min_participants
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      type: "number",
      min: "1",
      value: v.min_participants,
      onChange: set('min_participants', true)
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Max participants",
      error: errs.max_participants
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      type: "number",
      min: "1",
      value: v.max_participants,
      onChange: set('max_participants', true)
    }))), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-block",
      style: {
        marginTop: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-h4"
    }, "Price is charged"), /*#__PURE__*/React.createElement(Seg, {
      label: "Pricing basis",
      value: v.pricing_basis,
      onChange: x => setV(_objectSpread(_objectSpread({}, v), {}, {
        pricing_basis: x
      })),
      options: [['group', 'Once for the whole group'], ['athlete', 'Per athlete']]
    }), v.pricing_basis === 'athlete' && /*#__PURE__*/React.createElement("p", {
      className: "lsl-a-muted lsl-a-small"
    }, "Make sure the Stripe Payment Link lets the customer set the quantity, or send each athlete their own link.")), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-block"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-h4"
    }, "How families book"), /*#__PURE__*/React.createElement(Seg, {
      label: "Booking mode",
      value: v.booking_mode,
      onChange: x => setV(_objectSpread(_objectSpread({}, v), {}, {
        booking_mode: x
      })),
      options: [['immediate', 'Book immediately'], ['request', 'Request — I approve']]
    })), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-block"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-h4"
    }, "Offered at"), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-checks"
    }, app.locations.filter(l => !l.archived_at).map(l => /*#__PURE__*/React.createElement("label", {
      key: l.id,
      className: "lsl-a-check"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: v.eligible_loc_ids.length === 0 || v.eligible_loc_ids.includes(l.id),
      onChange: () => {
        var cur = v.eligible_loc_ids.length ? v.eligible_loc_ids : app.locations.map(x => x.id);
        var next = cur.includes(l.id) ? cur.filter(x => x !== l.id) : [...cur, l.id];
        setV(_objectSpread(_objectSpread({}, v), {}, {
          eligible_loc_ids: next.length === app.locations.length ? [] : next
        }));
      }
    }), " ", l.name))), /*#__PURE__*/React.createElement("span", {
      className: "lsl-a-muted lsl-a-small"
    }, "All checked = every location.")), app.coaches.filter(c => c.active).length > 1 && /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-block"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-h4"
    }, "Coaches who can run it"), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-checks"
    }, app.coaches.filter(c => c.active).map(c => /*#__PURE__*/React.createElement("label", {
      key: c.id,
      className: "lsl-a-check"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: v.coach_ids.includes(c.id),
      onChange: () => toggleIn('coach_ids', c.id)
    }), " ", c.name))), /*#__PURE__*/React.createElement("span", {
      className: "lsl-a-muted lsl-a-small"
    }, "None checked = any coach.")), /*#__PURE__*/React.createElement(Field, {
      label: "Description (shown to families)"
    }, /*#__PURE__*/React.createElement("textarea", {
      className: "lsl-textarea",
      value: v.description,
      onChange: set('description'),
      style: {
        minHeight: 60
      }
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Preparation instructions",
      hint: "Included in confirmation and reminder emails"
    }, /*#__PURE__*/React.createElement("textarea", {
      className: "lsl-textarea",
      value: v.prep_instructions,
      onChange: set('prep_instructions'),
      style: {
        minHeight: 60
      },
      placeholder: "Bring a ball, water, and court shoes."
    })), /*#__PURE__*/React.createElement("label", {
      className: "lsl-a-check"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: v.active,
      onChange: e => setV(_objectSpread(_objectSpread({}, v), {}, {
        active: e.target.checked
      }))
    }), " Active \u2014 show on the booking page")), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-row",
      style: {
        marginTop: 12
      }
    }, v.pay_link && /*#__PURE__*/React.createElement("a", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--xs",
      href: v.pay_link,
      target: "_blank",
      rel: "noopener"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "external-link"
    }), " Preview checkout"), /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--xs",
      onClick: () => A.copy(bookingLink, toast)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "link"
    }), " Copy booking link"), /*#__PURE__*/React.createElement("span", {
      className: "lsl-a-spacer"
    }), t.archived_at ? /*#__PURE__*/React.createElement("button", {
      className: "lsl-admin__del lsl-admin__del--text",
      onClick: () => archive(false)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "archive-restore"
    }), " Restore") : /*#__PURE__*/React.createElement("button", {
      className: "lsl-admin__del lsl-admin__del--text",
      onClick: () => archive(true)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "archive"
    }), " Archive"), t.archived_at && /*#__PURE__*/React.createElement("button", {
      className: "lsl-admin__del lsl-admin__del--text",
      onClick: del
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "trash-2"
    }), " Delete")), /*#__PURE__*/React.createElement(A.SaveBar, {
      dirty: dirty,
      saving: saving,
      onSave: save,
      onDiscard: () => {
        setV(orig);
        setErrs({});
      },
      label: 'Unsaved changes to ' + t.name
    }));
  }

  /* ---------------- Packages ---------------- */
  function PackagesSection() {
    var app = A.useApp();
    var q = A.useFetch('/api/admin/packages', [app.version]);
    var _useState9 = useState(null),
      _useState0 = _slicedToArray(_useState9, 2),
      editing = _useState0[0],
      setEditing = _useState0[1];
    var pkgs = q.data ? q.data.packages : [];
    return /*#__PURE__*/React.createElement("details", {
      className: "lsl-a-expand lsl-a-section"
    }, /*#__PURE__*/React.createElement("summary", null, /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      className: "lsl-a-chev"
    }), /*#__PURE__*/React.createElement(Icon, {
      name: "ticket"
    }), " Packages ", pkgs.length ? '(' + pkgs.filter(p => p.active).length + ' active)' : ''), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-expand__body"
    }, /*#__PURE__*/React.createElement("p", {
      className: "lsl-a-small lsl-a-muted",
      style: {
        marginTop: 0
      }
    }, "Prepaid session bundles. Billing is ", /*#__PURE__*/React.createElement("strong", null, "one-time"), " \u2014 recurring subscriptions are not set up. Credits are tracked per family and applied from each booking."), q.loading && !q.data ? /*#__PURE__*/React.createElement(A.Loading, null) : q.error ? /*#__PURE__*/React.createElement(A.ErrorState, {
      error: q.error,
      onRetry: q.reload
    }) : pkgs.length === 0 ? /*#__PURE__*/React.createElement(A.Empty, {
      icon: "ticket"
    }, "No packages yet.") : /*#__PURE__*/React.createElement("ul", {
      className: "lsl-a-list"
    }, pkgs.map(p => /*#__PURE__*/React.createElement("li", {
      key: p.id
    }, /*#__PURE__*/React.createElement("strong", null, p.name), /*#__PURE__*/React.createElement("span", null, A.money(p.price_cents), " \xB7 ", p.credits == null ? 'Unlimited sessions' : A.plural(p.credits, 'session'), " \xB7 ", p.validity_days ? 'valid ' + p.validity_days + ' days' : 'no expiration'), p.archived_at ? /*#__PURE__*/React.createElement(Badge, {
      tone: "muted"
    }, "Archived") : p.active ? /*#__PURE__*/React.createElement(Badge, {
      tone: "green"
    }, "Active") : /*#__PURE__*/React.createElement(Badge, {
      tone: "muted"
    }, "Inactive"), /*#__PURE__*/React.createElement("span", {
      className: "lsl-a-muted lsl-a-small"
    }, p.sold, " sold"), /*#__PURE__*/React.createElement("span", {
      className: "lsl-a-spacer"
    }), /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--xs",
      onClick: () => setEditing(p)
    }, "Edit")))), /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--xs",
      style: {
        marginTop: 10
      },
      onClick: () => setEditing({})
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "plus"
    }), " Add package")), editing && /*#__PURE__*/React.createElement(PackageDialog, {
      p: editing,
      onClose: () => setEditing(null),
      onDone: () => {
        q.reload();
        app.changed();
      }
    }));
  }
  function PackageDialog(_ref6) {
    var p = _ref6.p,
      onClose = _ref6.onClose,
      onDone = _ref6.onDone;
    var app = A.useApp();
    var toast = A.useToast();
    var _A$useConfirm3 = A.useConfirm(),
      _A$useConfirm4 = _slicedToArray(_A$useConfirm3, 2),
      confirmUi = _A$useConfirm4[0],
      confirm = _A$useConfirm4[1];
    var isNew = !p.id;
    var _useState1 = useState({
        name: p.name || '',
        price: p.price_cents != null ? (p.price_cents / 100).toFixed(2) : '',
        unlimited: p.id ? p.credits == null : false,
        credits: p.credits || 5,
        validity_days: p.validity_days || '',
        eligible_type_ids: p.eligible_type_ids || [],
        pay_link: p.pay_link || '',
        description: p.description || '',
        active: p.id ? !!p.active : true
      }),
      _useState10 = _slicedToArray(_useState1, 2),
      v = _useState10[0],
      setV = _useState10[1];
    var _useState11 = useState({}),
      _useState12 = _slicedToArray(_useState11, 2),
      errs = _useState12[0],
      setErrs = _useState12[1];
    var _useState13 = useState(false),
      _useState14 = _slicedToArray(_useState13, 2),
      busy = _useState14[0],
      setBusy = _useState14[1];
    var save = /*#__PURE__*/function () {
      var _ref7 = _asyncToGenerator(function* () {
        setBusy(true);
        setErrs({});
        try {
          yield A.api(isNew ? 'POST' : 'PUT', '/api/admin/packages' + (isNew ? '' : '/' + p.id), {
            name: v.name,
            price_cents: A.parseMoney(v.price),
            credits: v.unlimited ? null : +v.credits,
            validity_days: v.validity_days === '' ? null : +v.validity_days,
            eligible_type_ids: v.eligible_type_ids,
            pay_link: v.pay_link,
            description: v.description,
            active: v.active
          });
          toast('Package saved');
          onDone();
          onClose();
        } catch (e) {
          setErrs(e.fields || {});
          toast(e.message, 'err');
        } finally {
          setBusy(false);
        }
      });
      return function save() {
        return _ref7.apply(this, arguments);
      };
    }();
    var archive = /*#__PURE__*/function () {
      var _ref8 = _asyncToGenerator(function* () {
        if (!(yield confirm({
          title: 'Archive this package?',
          body: 'Families who bought it keep their credits and history.',
          confirmLabel: 'Archive'
        }))) return;
        try {
          yield A.api('POST', '/api/admin/packages/' + p.id + '/archive', {
            archive: !p.archived_at
          });
          toast(p.archived_at ? 'Restored' : 'Archived');
          onDone();
          onClose();
        } catch (e) {
          toast(e.message, 'err');
        }
      });
      return function archive() {
        return _ref8.apply(this, arguments);
      };
    }();
    var rule = v.validity_days ? 'Expires ' + v.validity_days + ' days after purchase. Unused credits are forfeited at expiration.' : v.unlimited ? 'Unlimited access needs a validity period.' : 'Credits never expire.';
    return /*#__PURE__*/React.createElement(Dialog, {
      title: isNew ? 'New package' : 'Edit ' + p.name,
      onClose: onClose,
      busy: busy,
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, !isNew && /*#__PURE__*/React.createElement("button", {
        className: "lsl-admin__del lsl-admin__del--text",
        onClick: archive
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "archive"
      }), " ", p.archived_at ? 'Restore' : 'Archive'), /*#__PURE__*/React.createElement("span", {
        className: "lsl-a-spacer"
      }), /*#__PURE__*/React.createElement("button", {
        className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
        onClick: onClose
      }, "Cancel"), /*#__PURE__*/React.createElement("button", {
        className: "lsl-btn lsl-btn--primary lsl-btn--sm",
        onClick: save,
        disabled: busy
      }, "Save package"))
    }, confirmUi, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-grid"
    }, /*#__PURE__*/React.createElement(Field, {
      label: "Package name",
      error: errs.name
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      value: v.name,
      onChange: e => setV(_objectSpread(_objectSpread({}, v), {}, {
        name: e.target.value
      })),
      placeholder: "5-Session Pack"
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Price ($)",
      error: errs.price_cents
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      inputMode: "decimal",
      value: v.price,
      onChange: e => setV(_objectSpread(_objectSpread({}, v), {}, {
        price: e.target.value
      }))
    }))), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-block",
      style: {
        marginTop: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-h4"
    }, "Sessions included"), /*#__PURE__*/React.createElement(Seg, {
      label: "Sessions included",
      value: v.unlimited ? 'u' : 'c',
      onChange: x => setV(_objectSpread(_objectSpread({}, v), {}, {
        unlimited: x === 'u'
      })),
      options: [['c', 'A set number'], ['u', 'Unlimited for a period']]
    }), !v.unlimited && /*#__PURE__*/React.createElement(Field, {
      label: "Session credits",
      error: errs.credits,
      className: ""
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      type: "number",
      min: "1",
      value: v.credits,
      onChange: e => setV(_objectSpread(_objectSpread({}, v), {}, {
        credits: e.target.value
      })),
      style: {
        maxWidth: 120
      }
    }))), /*#__PURE__*/React.createElement(Field, {
      label: "Valid for (days)",
      error: errs.validity_days,
      hint: rule
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      type: "number",
      min: "1",
      value: v.validity_days,
      onChange: e => setV(_objectSpread(_objectSpread({}, v), {}, {
        validity_days: e.target.value
      })),
      placeholder: "e.g. 90 \u2014 blank = no expiration",
      style: {
        maxWidth: 220
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-block"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-h4"
    }, "Can be used for"), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-checks"
    }, app.types.filter(t => !t.archived_at).map(t => /*#__PURE__*/React.createElement("label", {
      key: t.id,
      className: "lsl-a-check"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: v.eligible_type_ids.includes(t.id),
      onChange: () => setV(_objectSpread(_objectSpread({}, v), {}, {
        eligible_type_ids: v.eligible_type_ids.includes(t.id) ? v.eligible_type_ids.filter(x => x !== t.id) : [...v.eligible_type_ids, t.id]
      }))
    }), " ", t.name))), /*#__PURE__*/React.createElement("span", {
      className: "lsl-a-muted lsl-a-small"
    }, "None checked = any session type.")), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-block"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-h4"
    }, "Billing"), /*#__PURE__*/React.createElement(Badge, {
      tone: "sky",
      icon: "receipt"
    }, "One-time payment"), /*#__PURE__*/React.createElement("p", {
      className: "lsl-a-muted lsl-a-small"
    }, "Recurring billing isn't set up, so packages are always sold as a single payment.")), /*#__PURE__*/React.createElement(Field, {
      label: "Stripe Payment Link (optional)",
      error: errs.pay_link,
      hint: "For selling online. You can also record sales from a family's profile."
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      value: v.pay_link,
      onChange: e => setV(_objectSpread(_objectSpread({}, v), {}, {
        pay_link: e.target.value
      })),
      placeholder: "https://buy.stripe.com/..."
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Description"
    }, /*#__PURE__*/React.createElement("textarea", {
      className: "lsl-textarea",
      value: v.description,
      onChange: e => setV(_objectSpread(_objectSpread({}, v), {}, {
        description: e.target.value
      })),
      style: {
        minHeight: 56
      }
    })), /*#__PURE__*/React.createElement("label", {
      className: "lsl-a-check"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: v.active,
      onChange: e => setV(_objectSpread(_objectSpread({}, v), {}, {
        active: e.target.checked
      }))
    }), " Active"));
  }
  A.tabs = A.tabs || {};
  A.tabs.TypesTab = TypesTab;
})();