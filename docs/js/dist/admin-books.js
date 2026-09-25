function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
/* global React, LSL */
/* Coach dashboard — Bookings tab, booking details, family drawer. */
(function () {
  var _React = React,
    useState = _React.useState,
    useEffect = _React.useEffect,
    useMemo = _React.useMemo;
  var A = window.LSLA;
  var Icon = A.Icon,
    Badge = A.Badge,
    StatusBadge = A.StatusBadge,
    Dialog = A.Dialog,
    Field = A.Field,
    Seg = A.Seg,
    Expand = A.Expand;
  var VIEWS = [['upcoming', 'Upcoming'], ['requests', 'Requests'], ['past', 'Past'], ['canceled', 'Canceled'], ['all', 'All']];
  var CLOSED = ['canceled', 'declined', 'expired'];
  var PAGE = 40;
  var METHODS = [['cash', 'Cash'], ['venmo', 'Venmo'], ['zelle', 'Zelle'], ['check', 'Check'], ['card', 'Card (in person)'], ['other', 'Other']];
  var endMins = b => {
    var _b$time$split$map = b.time.split(':').map(Number),
      _b$time$split$map2 = _slicedToArray(_b$time$split$map, 2),
      h = _b$time$split$map2[0],
      m = _b$time$split$map2[1];
    return h * 60 + m + (b.duration || 60);
  };
  function isPast(b, now) {
    if (!b.date) return false;
    if (b.date !== now.date) return b.date < now.date;
    var _now$time$split$map = now.time.split(':').map(Number),
      _now$time$split$map2 = _slicedToArray(_now$time$split$map, 2),
      h = _now$time$split$map2[0],
      m = _now$time$split$map2[1];
    return endMins(b) <= h * 60 + m;
  }
  function viewOf(b, now) {
    if (CLOSED.includes(b.status)) return 'canceled';
    if (b.status === 'requested') return 'requests';
    if (b.kind === 'dated' && isPast(b, now)) return 'past';
    return 'upcoming';
  }
  var requestLine = b => {
    var r = b.request || {};
    if (r.slot_id) return 'Requested ' + LSL.fmtDate(r.date) + ' · ' + LSL.fmtTime(r.time) + (r.location ? ' · ' + r.location : '');
    return ['Request', r.day || (r.dow != null ? ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'][r.dow] : null), r.time || (r.reqTime ? LSL.fmtTime(r.reqTime) : null), r.date, r.location].filter(Boolean).join(' · ');
  };
  function BooksTab() {
    var app = A.useApp();
    var q = A.useFetch('/api/admin/bookings', [app.version]);
    var _useState = useState('upcoming'),
      _useState2 = _slicedToArray(_useState, 2),
      view = _useState2[0],
      setView = _useState2[1];
    var _useState3 = useState(''),
      _useState4 = _slicedToArray(_useState3, 2),
      search = _useState4[0],
      setSearch = _useState4[1];
    var _useState5 = useState({
        from: '',
        to: '',
        loc: '',
        type: '',
        coach: '',
        status: '',
        payment: '',
        attention: false
      }),
      _useState6 = _slicedToArray(_useState5, 2),
      f = _useState6[0],
      setF = _useState6[1];
    var _useState7 = useState(PAGE),
      _useState8 = _slicedToArray(_useState7, 2),
      limit = _useState8[0],
      setLimit = _useState8[1];
    var _useState9 = useState(null),
      _useState0 = _slicedToArray(_useState9, 2),
      dlg = _useState0[0],
      setDlg = _useState0[1];
    var toast = A.useToast();
    var data = q.data;
    var now = data ? data.now : {
      date: app.today,
      time: '00:00'
    };
    var all = data ? data.bookings : [];
    var counts = useMemo(() => {
      var c = {
        upcoming: 0,
        requests: 0,
        past: 0,
        canceled: 0,
        all: all.length,
        awaiting: 0,
        attention: 0
      };
      all.forEach(b => {
        c[viewOf(b, now)]++;
        if (b.status === 'awaiting_payment' && !isPast(b, now)) c.awaiting++;
        if (b.attention) c.attention++;
      });
      return c;
    }, [all, now]);
    var filtered = useMemo(() => {
      var s = search.trim().toLowerCase();
      var rows = all.filter(b => view === 'all' || viewOf(b, now) === view);
      if (s) rows = rows.filter(b => [b.form.athlete, b.form.parent, b.form.email, b.form.phone, b.athlete.name, b.family.parent, b.family.email, b.id].some(x => x && String(x).toLowerCase().includes(s)));
      if (f.from) rows = rows.filter(b => (b.date || b.created_at.slice(0, 10)) >= f.from);
      if (f.to) rows = rows.filter(b => (b.date || b.created_at.slice(0, 10)) <= f.to);
      if (f.loc) rows = rows.filter(b => b.loc_id === f.loc || b.request && b.request.loc_id === f.loc);
      if (f.type) rows = rows.filter(b => b.type_id === f.type);
      if (f.coach) rows = rows.filter(b => (b.coach_id || '') === f.coach);
      if (f.status) rows = rows.filter(b => b.status === f.status);
      if (f.payment) rows = rows.filter(b => b.payment_status === f.payment);
      if (f.attention) rows = rows.filter(b => b.attention);
      var key = b => b.date ? b.date + 'T' + b.time : b.created_at;
      if (view === 'upcoming' || view === 'requests') rows.sort((a, b) => view === 'requests' ? a.created_at.localeCompare(b.created_at) : key(a).localeCompare(key(b)));else rows.sort((a, b) => key(b).localeCompare(key(a)));
      return rows;
    }, [all, view, search, f, now]);
    var activeFilters = Object.entries(f).filter(_ref => {
      var _ref2 = _slicedToArray(_ref, 2),
        v = _ref2[1];
      return v;
    }).length;
    var exportCsv = /*#__PURE__*/function () {
      var _ref3 = _asyncToGenerator(function* (kind) {
        var stampName = 'lsl-' + kind + '-' + app.today + '.csv';
        if (kind === 'bookings') {
          A.downloadCsv(stampName, [['Booking ID', 'Status', 'Date', 'Time', 'Time zone', 'Service', 'Location', 'Athlete', 'Age/Grade', 'Parent', 'Email', 'Phone', 'Players', 'Payment', 'Attendance', ...(app.isDirector ? ['Net paid'] : []), 'Created'], ...filtered.map(b => [b.id, A.BOOKING[b.status].label, b.date || '', b.time ? LSL.fmtTime(b.time) : '', b.date ? LSL.tzLabel(b.date, b.time) : '', b.snapshot.service_name, (b.snapshot.location || {}).name || (b.request || {}).location || '', b.form.athlete, b.form.age, b.form.parent, b.form.email, b.form.phone, b.players || '', A.PAYMENT[b.payment_status].label, A.ATTENDANCE[b.attendance].label, ...(app.isDirector ? [b.net_paid_cents == null ? '' : (b.net_paid_cents / 100).toFixed(2)] : []), b.created_at])]);
        } else if (kind === 'attendance') {
          A.downloadCsv(stampName, [['Date', 'Time', 'Athlete', 'Service', 'Location', 'Attendance', 'Booking status'], ...filtered.filter(b => b.kind === 'dated').map(b => [b.date, LSL.fmtTime(b.time), b.form.athlete, b.snapshot.service_name, (b.snapshot.location || {}).name || '', A.ATTENDANCE[b.attendance].label, A.BOOKING[b.status].label])]);
        } else {
          try {
            var r = yield A.api('GET', '/api/admin/payments');
            var ids = new Set(filtered.map(b => b.id));
            A.downloadCsv(stampName, [['Recorded', 'Paid on', 'Booking ID', 'Athlete', 'Session date', 'Source', 'Type', 'Amount', 'Method', 'Status', 'Stripe checkout', 'Note'], ...r.payments.filter(p => !p.booking_id || ids.has(p.booking_id)).map(p => [p.created_at, p.paid_on || '', p.booking_id || (p.family_package_id ? 'package ' + p.family_package_id : ''), p.form.athlete || '', p.date || '', p.source, p.kind, (p.amount_cents / 100).toFixed(2), p.method || '', p.status, p.stripe_session_id || '', p.note || ''])]);
          } catch (e) {
            toast(e.message, 'err');
          }
        }
      });
      return function exportCsv(_x) {
        return _ref3.apply(this, arguments);
      };
    }();
    if (q.loading && !data) return /*#__PURE__*/React.createElement("div", null, [1, 2, 3].map(i => /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "lsl-a-skel"
    })));
    if (q.error && !data) return /*#__PURE__*/React.createElement(A.ErrorState, {
      error: q.error,
      onRetry: q.reload
    });
    var Stat = _ref4 => {
      var n = _ref4.n,
        label = _ref4.label,
        onClick = _ref4.onClick,
        alert = _ref4.alert;
      return /*#__PURE__*/React.createElement("button", {
        className: 'lsl-a-stat lsl-a-stat--btn' + (alert && n ? ' is-alert' : ''),
        onClick: onClick
      }, /*#__PURE__*/React.createElement("b", null, n), /*#__PURE__*/React.createElement("span", null, label));
    };
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-counts"
    }, /*#__PURE__*/React.createElement(Stat, {
      n: counts.upcoming,
      label: "Upcoming",
      onClick: () => {
        setView('upcoming');
        setF(_objectSpread(_objectSpread({}, f), {}, {
          status: '',
          attention: false
        }));
      }
    }), /*#__PURE__*/React.createElement(Stat, {
      n: counts.requests,
      label: "Pending requests",
      alert: true,
      onClick: () => setView('requests')
    }), /*#__PURE__*/React.createElement(Stat, {
      n: counts.awaiting,
      label: "Awaiting payment",
      alert: true,
      onClick: () => {
        setView('upcoming');
        setF(_objectSpread(_objectSpread({}, f), {}, {
          status: 'awaiting_payment'
        }));
      }
    }), counts.attention > 0 && /*#__PURE__*/React.createElement(Stat, {
      n: counts.attention,
      label: "Needs attention",
      alert: true,
      onClick: () => {
        setView('all');
        setF(_objectSpread(_objectSpread({}, f), {}, {
          attention: true
        }));
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-subtabs",
      role: "tablist",
      "aria-label": "Booking views"
    }, VIEWS.map(_ref5 => {
      var _ref6 = _slicedToArray(_ref5, 2),
        k = _ref6[0],
        l = _ref6[1];
      return /*#__PURE__*/React.createElement("button", {
        key: k,
        role: "tab",
        "aria-selected": view === k,
        onClick: () => {
          setView(k);
          setLimit(PAGE);
        }
      }, l, /*#__PURE__*/React.createElement("span", {
        className: "lsl-a-count"
      }, counts[k]));
    })), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-searchrow"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-search"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "search"
    }), /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      type: "search",
      placeholder: "Search athlete, parent, email, phone",
      value: search,
      onChange: e => setSearch(e.target.value),
      "aria-label": "Search bookings"
    })), /*#__PURE__*/React.createElement("button", {
      className: "lsl-a-iconbtn",
      onClick: q.reload,
      "aria-label": "Refresh bookings",
      title: "Refresh"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: q.loading ? 'loader-circle' : 'refresh-cw',
      className: q.loading ? 'lsl-a-spin' : ''
    }))), /*#__PURE__*/React.createElement(Expand, {
      title: 'Filters' + (activeFilters ? ' (' + activeFilters + ' on)' : ''),
      icon: "sliders-horizontal"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-grid"
    }, /*#__PURE__*/React.createElement(Field, {
      label: "From"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      type: "date",
      value: f.from,
      onChange: e => setF(_objectSpread(_objectSpread({}, f), {}, {
        from: e.target.value
      }))
    })), /*#__PURE__*/React.createElement(Field, {
      label: "To"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      type: "date",
      value: f.to,
      onChange: e => setF(_objectSpread(_objectSpread({}, f), {}, {
        to: e.target.value
      }))
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Location"
    }, /*#__PURE__*/React.createElement("select", {
      className: "lsl-select",
      value: f.loc,
      onChange: e => setF(_objectSpread(_objectSpread({}, f), {}, {
        loc: e.target.value
      }))
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "Any"), app.locations.map(l => /*#__PURE__*/React.createElement("option", {
      key: l.id,
      value: l.id
    }, l.name)))), /*#__PURE__*/React.createElement(Field, {
      label: "Session type"
    }, /*#__PURE__*/React.createElement("select", {
      className: "lsl-select",
      value: f.type,
      onChange: e => setF(_objectSpread(_objectSpread({}, f), {}, {
        type: e.target.value
      }))
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "Any"), app.types.map(t => /*#__PURE__*/React.createElement("option", {
      key: t.id,
      value: t.id
    }, t.name)))), app.coaches.length > 1 && app.isDirector && /*#__PURE__*/React.createElement(Field, {
      label: "Coach"
    }, /*#__PURE__*/React.createElement("select", {
      className: "lsl-select",
      value: f.coach,
      onChange: e => setF(_objectSpread(_objectSpread({}, f), {}, {
        coach: e.target.value
      }))
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "Any"), app.coaches.map(c => /*#__PURE__*/React.createElement("option", {
      key: c.id,
      value: c.id
    }, c.name)))), /*#__PURE__*/React.createElement(Field, {
      label: "Booking status"
    }, /*#__PURE__*/React.createElement("select", {
      className: "lsl-select",
      value: f.status,
      onChange: e => setF(_objectSpread(_objectSpread({}, f), {}, {
        status: e.target.value
      }))
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "Any"), Object.entries(A.BOOKING).map(_ref7 => {
      var _ref8 = _slicedToArray(_ref7, 2),
        k = _ref8[0],
        v = _ref8[1];
      return /*#__PURE__*/React.createElement("option", {
        key: k,
        value: k
      }, v.label);
    }))), /*#__PURE__*/React.createElement(Field, {
      label: "Payment status"
    }, /*#__PURE__*/React.createElement("select", {
      className: "lsl-select",
      value: f.payment,
      onChange: e => setF(_objectSpread(_objectSpread({}, f), {}, {
        payment: e.target.value
      }))
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "Any"), Object.entries(A.PAYMENT).map(_ref9 => {
      var _ref0 = _slicedToArray(_ref9, 2),
        k = _ref0[0],
        v = _ref0[1];
      return /*#__PURE__*/React.createElement("option", {
        key: k,
        value: k
      }, v.label);
    })))), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-row",
      style: {
        marginTop: 10
      }
    }, /*#__PURE__*/React.createElement("label", {
      className: "lsl-a-check"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: f.attention,
      onChange: e => setF(_objectSpread(_objectSpread({}, f), {}, {
        attention: e.target.checked
      }))
    }), " Only bookings that need attention"), /*#__PURE__*/React.createElement("span", {
      className: "lsl-a-spacer"
    }), activeFilters > 0 && /*#__PURE__*/React.createElement("button", {
      className: "lsl-a-linkbtn",
      onClick: () => setF({
        from: '',
        to: '',
        loc: '',
        type: '',
        coach: '',
        status: '',
        payment: '',
        attention: false
      })
    }, "Clear filters"))), /*#__PURE__*/React.createElement(Expand, {
      title: "Export CSV",
      icon: "download"
    }, /*#__PURE__*/React.createElement("p", {
      className: "lsl-a-muted lsl-a-small",
      style: {
        marginTop: 0
      }
    }, "Exports what's currently shown (", A.plural(filtered.length, 'booking'), ")."), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-row"
    }, /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--xs",
      onClick: () => exportCsv('bookings')
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "file-spreadsheet"
    }), " Bookings"), /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--xs",
      onClick: () => exportCsv('attendance')
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "user-check"
    }), " Attendance"), app.isDirector && /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--xs",
      onClick: () => exportCsv('payments')
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "receipt"
    }), " Payment records"))), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 12
      }
    }), filtered.length === 0 ? /*#__PURE__*/React.createElement(A.Empty, {
      icon: view === 'requests' ? 'inbox' : 'calendar'
    }, all.length === 0 ? 'No bookings yet. They\'ll appear here as families reserve openings.' : search || activeFilters ? 'No bookings match your search or filters.' : 'Nothing in ' + VIEWS.find(v => v[0] === view)[1].toLowerCase() + ' right now.') : /*#__PURE__*/React.createElement("div", {
      className: "lsl-admin__list"
    }, filtered.slice(0, limit).map(b => /*#__PURE__*/React.createElement(BookingCard, {
      key: b.id,
      b: b,
      now: now,
      onAction: kind => setDlg({
        kind,
        b
      })
    }))), filtered.length > limit && /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-more"
    }, /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
      onClick: () => setLimit(limit + PAGE)
    }, "Show more (", filtered.length - limit, " left)")), dlg && dlg.kind === 'cancel' && /*#__PURE__*/React.createElement(CancelDialog, {
      b: dlg.b,
      onClose: () => setDlg(null),
      onDone: app.changed
    }), dlg && dlg.kind === 'approve' && /*#__PURE__*/React.createElement(ApproveDialog, {
      b: dlg.b,
      onClose: () => setDlg(null),
      onDone: app.changed
    }), dlg && dlg.kind === 'offer' && /*#__PURE__*/React.createElement(OfferDialog, {
      b: dlg.b,
      onClose: () => setDlg(null),
      onDone: app.changed
    }), dlg && dlg.kind === 'decline' && /*#__PURE__*/React.createElement(DeclineDialog, {
      b: dlg.b,
      onClose: () => setDlg(null),
      onDone: app.changed
    }));
  }
  function BookingCard(_ref1) {
    var b = _ref1.b,
      now = _ref1.now,
      onAction = _ref1.onAction;
    var app = A.useApp();
    var req = b.status === 'requested';
    var closed = CLOSED.includes(b.status);
    var past = isPast(b, now);
    var loc = (b.snapshot.location || {}).name;
    return /*#__PURE__*/React.createElement("div", {
      className: 'lsl-admin__booking' + (b.attention ? ' is-attn' : '') + (closed ? ' is-closed' : '')
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-admin__bookhead"
    }, /*#__PURE__*/React.createElement("button", {
      className: "lsl-a-athbtn",
      onClick: () => app.openBooking(b.id),
      "aria-label": 'Open booking for ' + b.form.athlete
    }, b.form.athlete), req ? /*#__PURE__*/React.createElement("span", {
      className: "lsl-pill lsl-pill--outline"
    }, requestLine(b)) : b.date ? /*#__PURE__*/React.createElement("span", {
      className: "lsl-pill lsl-pill--sky"
    }, LSL.fmtDate(b.date), " \xB7 ", LSL.fmtTime(b.time), " ", LSL.tzLabel(b.date, b.time)) : null), /*#__PURE__*/React.createElement("div", {
      className: "lsl-admin__bookmeta"
    }, b.snapshot.service_name, b.players ? ' · ' + b.players + ' players' : '', loc ? ' · ' + loc : '', b.coach_id && app.coaches.length > 1 ? ' · ' + (app.coachName(b.coach_id) || '') : '', /*#__PURE__*/React.createElement("br", null), "Parent: ", b.form.parent, " \xB7 ", b.form.email, b.form.phone ? ' · ' + b.form.phone : '', /*#__PURE__*/React.createElement("br", null), [b.form.age && 'Age/Grade: ' + b.form.age, b.form.focus && 'Focus: ' + b.form.focus].filter(Boolean).join(' · '), b.form.notes ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("br", null), "Notes: ", b.form.notes) : null), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-badges"
    }, /*#__PURE__*/React.createElement(StatusBadge, {
      kind: "booking",
      value: b.status
    }), /*#__PURE__*/React.createElement(StatusBadge, {
      kind: "payment",
      value: b.payment_status
    }), b.kind === 'dated' && (past || b.attendance !== 'not_recorded') && /*#__PURE__*/React.createElement(StatusBadge, {
      kind: "attendance",
      value: b.attendance
    }), b.status === 'awaiting_payment' && b.hold_expires_at && /*#__PURE__*/React.createElement(Badge, {
      tone: "warn",
      icon: "timer"
    }, "Hold until ", LSL.fmtInstant(b.hold_expires_at)), b.legacy && /*#__PURE__*/React.createElement(Badge, {
      tone: "muted",
      icon: "archive",
      title: "Imported from the previous booking system"
    }, "Imported"), b.failed_notices > 0 && /*#__PURE__*/React.createElement(Badge, {
      tone: "danger",
      icon: "mail-x"
    }, "Email failed")), b.attention && /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-attn",
      role: "note"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "triangle-alert"
    }), b.attention), /*#__PURE__*/React.createElement("div", {
      className: "lsl-admin__bookactions"
    }, /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
      onClick: () => app.openBooking(b.id)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "panel-right-open"
    }), " Details"), req && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
      onClick: () => onAction('approve')
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check"
    }), " Approve"), /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
      onClick: () => onAction('offer')
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "calendar-clock"
    }), " Offer a time"), /*#__PURE__*/React.createElement("button", {
      className: "lsl-admin__del lsl-admin__del--text",
      onClick: () => onAction('decline')
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "x"
    }), " Decline")), !req && b.date && /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
      onClick: () => LSL.downloadICS({
        id: b.id,
        date: b.date,
        time: b.time,
        duration: b.duration,
        service: b.snapshot.service_name,
        location: loc,
        athlete: b.form.athlete,
        coach: b.snapshot.coach_name
      })
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "calendar-plus"
    }), " .ics"), b.family && b.family.id && /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
      onClick: () => app.openFamily(b.family.id)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "users"
    }), " Family"), !req && !closed && b.status !== 'completed' && /*#__PURE__*/React.createElement("button", {
      className: "lsl-admin__del lsl-admin__del--text",
      onClick: () => onAction('cancel')
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "x"
    }), " Cancel & reopen")));
  }

  /* ---------------- Booking details ---------------- */
  function BookingDialog(_ref10) {
    var id = _ref10.id,
      onClose = _ref10.onClose;
    var app = A.useApp();
    var toast = A.useToast();
    var q = A.useFetch('/api/admin/bookings/' + id, [app.version]);
    var _useState1 = useState(null),
      _useState10 = _slicedToArray(_useState1, 2),
      edit = _useState10[0],
      setEdit = _useState10[1];
    var _useState11 = useState(false),
      _useState12 = _slicedToArray(_useState11, 2),
      saving = _useState12[0],
      setSaving = _useState12[1];
    var _useState13 = useState(null),
      _useState14 = _slicedToArray(_useState13, 2),
      sub = _useState14[0],
      setSub = _useState14[1];
    var _A$useAction = A.useAction(),
      _A$useAction2 = _slicedToArray(_A$useAction, 2),
      busy = _A$useAction2[0],
      run = _A$useAction2[1];
    var d = q.data;
    useEffect(() => {
      if (d) setEdit({
        form: _objectSpread({}, d.booking.form),
        private_notes: d.booking.private_notes || '',
        roster: d.booking.roster || [],
        payer_mode: d.booking.payer_mode
      });
    }, [d]);
    if (!d || !edit) {
      return /*#__PURE__*/React.createElement(Dialog, {
        title: "Booking",
        onClose: onClose,
        wide: true
      }, q.error ? /*#__PURE__*/React.createElement(A.ErrorState, {
        error: q.error,
        onRetry: q.reload
      }) : /*#__PURE__*/React.createElement(A.Loading, null));
    }
    var b = d.booking;
    var dirty = JSON.stringify(edit) !== JSON.stringify({
      form: b.form,
      private_notes: b.private_notes || '',
      roster: b.roster || [],
      payer_mode: b.payer_mode
    });
    var save = /*#__PURE__*/function () {
      var _ref11 = _asyncToGenerator(function* () {
        setSaving(true);
        try {
          yield A.api('PATCH', '/api/admin/bookings/' + id, edit);
          toast('Booking saved');
          app.changed();
        } catch (e) {
          toast(e.message, 'err');
        } finally {
          setSaving(false);
        }
      });
      return function save() {
        return _ref11.apply(this, arguments);
      };
    }();
    var act = (path, body, msg) => run(() => A.api('POST', '/api/admin/bookings/' + id + path, body), msg).then(() => app.changed()).catch(() => {});
    var closed = CLOSED.includes(b.status);
    var loc = b.snapshot.location || {};
    var setForm = k => e => setEdit(_objectSpread(_objectSpread({}, edit), {}, {
      form: _objectSpread(_objectSpread({}, edit.form), {}, {
        [k]: e.target.value
      })
    }));
    var phoneDigits = (b.form.phone || '').replace(/[^\d+]/g, '');
    var resendKind = b.status === 'requested' ? 'request_received' : 'confirmation';
    var canResend = b.status === 'requested' || b.status === 'confirmed' || b.status === 'completed';
    var lastNotice = d.notifications[d.notifications.length - 1];
    return /*#__PURE__*/React.createElement(Dialog, {
      title: b.form.athlete + ' — ' + (b.snapshot.service_name || 'Booking'),
      onClose: onClose,
      wide: true,
      busy: saving,
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, dirty && /*#__PURE__*/React.createElement("span", {
        className: "lsl-a-inline-status is-dirty"
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "pencil"
      }), " Unsaved changes"), /*#__PURE__*/React.createElement("span", {
        className: "lsl-a-spacer"
      }), /*#__PURE__*/React.createElement("button", {
        className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
        onClick: onClose
      }, "Close"), /*#__PURE__*/React.createElement("button", {
        className: "lsl-btn lsl-btn--primary lsl-btn--sm",
        onClick: save,
        disabled: !dirty || saving
      }, saving ? 'Saving…' : 'Save changes'))
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-badges",
      style: {
        marginTop: 0,
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement(StatusBadge, {
      kind: "booking",
      value: b.status
    }), /*#__PURE__*/React.createElement(StatusBadge, {
      kind: "payment",
      value: b.payment_status
    }), b.kind === 'dated' && /*#__PURE__*/React.createElement(StatusBadge, {
      kind: "attendance",
      value: b.attendance
    }), b.legacy && /*#__PURE__*/React.createElement(Badge, {
      tone: "muted",
      icon: "archive"
    }, "Imported")), b.attention && /*#__PURE__*/React.createElement(A.Banner, {
      tone: "warn"
    }, b.attention, " ", /*#__PURE__*/React.createElement("button", {
      className: "lsl-a-linkbtn",
      onClick: () => run(() => A.api('PATCH', '/api/admin/bookings/' + id, {
        clear_attention: true
      }), 'Marked as handled').then(app.changed)
    }, "Mark handled")), b.legacy && b.kind === 'dated' && /*#__PURE__*/React.createElement(A.Banner, {
      tone: "info"
    }, "Imported from the old system and marked Paid at import. If this one wasn't paid, correct it under Payment below."), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-block"
    }, /*#__PURE__*/React.createElement("dl", {
      className: "lsl-a-dl"
    }, b.date ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("dt", null, "When"), /*#__PURE__*/React.createElement("dd", null, LSL.fmtDateLong(b.date), " \xB7 ", LSL.fmtTime(b.time), "\u2013", LSL.fmtTime(A.endTime(b.time, b.duration)), " ", LSL.tzLabel(b.date, b.time))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("dt", null, "Requested"), /*#__PURE__*/React.createElement("dd", null, requestLine(b))), loc.name && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("dt", null, "Location"), /*#__PURE__*/React.createElement("dd", null, loc.name, loc.facility_name ? ' · ' + loc.facility_name : '', loc.address ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
      className: "lsl-a-muted"
    }, loc.address)) : null)), /*#__PURE__*/React.createElement("dt", null, "Coach"), /*#__PURE__*/React.createElement("dd", null, b.snapshot.coach_name || '—'), b.players && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("dt", null, "Players"), /*#__PURE__*/React.createElement("dd", null, b.players)), b.hold_expires_at && b.status === 'awaiting_payment' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("dt", null, "Hold"), /*#__PURE__*/React.createElement("dd", null, "Reserved until ", LSL.fmtInstant(b.hold_expires_at), " while the family pays")), /*#__PURE__*/React.createElement("dt", null, "Booked"), /*#__PURE__*/React.createElement("dd", null, A.stamp(b.created_at), " \xB7 ID ", /*#__PURE__*/React.createElement("span", {
      className: "lsl-a-mono"
    }, b.id)))), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-row",
      style: {
        marginBottom: 16
      }
    }, b.status === 'requested' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--primary lsl-btn--xs",
      onClick: () => setSub('approve')
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check"
    }), " Approve"), /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--xs",
      onClick: () => setSub('offer')
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "calendar-clock"
    }), " Offer a time"), /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--xs",
      onClick: () => setSub('decline')
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "x"
    }), " Decline")), b.kind === 'dated' && ['awaiting_payment', 'confirmed'].includes(b.status) && /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--xs",
      onClick: () => setSub('reschedule')
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "calendar-range"
    }), " Reschedule"), canResend && /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--xs",
      disabled: busy,
      onClick: () => act('/resend', {
        kind: resendKind
      }, r => r.notice.status === 'sent' ? 'Email sent' : 'Not sent: ' + (r.notice.detail || r.notice.status))
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "send"
    }), " Resend ", resendKind === 'confirmation' ? 'confirmation' : 'receipt'), b.form.email && /*#__PURE__*/React.createElement("a", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--xs",
      href: 'mailto:' + b.form.email + '?subject=' + encodeURIComponent('LakeShore Legends — ' + b.form.athlete)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "mail"
    }), " Email"), phoneDigits && /*#__PURE__*/React.createElement("a", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--xs",
      href: 'sms:' + phoneDigits
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "message-square"
    }), " Text"), phoneDigits && /*#__PURE__*/React.createElement("a", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--xs",
      href: 'tel:' + phoneDigits
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "phone"
    }), " Call"), b.date && /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--xs",
      onClick: () => LSL.downloadICS({
        id: b.id,
        date: b.date,
        time: b.time,
        duration: b.duration,
        service: b.snapshot.service_name,
        location: loc.name,
        athlete: b.form.athlete,
        coach: b.snapshot.coach_name
      })
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "calendar-plus"
    }), " .ics"), b.family_id && /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--xs",
      onClick: () => {
        app.openFamily(b.family_id);
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "users"
    }), " Family"), !closed && b.status !== 'completed' && b.kind === 'dated' && /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--xs",
      onClick: () => setSub('cancel')
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "circle-x"
    }), " Cancel\u2026")), lastNotice && /*#__PURE__*/React.createElement("p", {
      className: "lsl-a-muted lsl-a-small"
    }, "Last email: ", lastNotice.kind.replace('_', ' '), " \u2014 ", /*#__PURE__*/React.createElement("strong", null, lastNotice.status), lastNotice.detail ? ' (' + lastNotice.detail + ')' : '', " \xB7 ", A.stamp(lastNotice.created_at)), b.kind === 'dated' && !['requested', 'declined', 'expired'].includes(b.status) && /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-block"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-h4"
    }, "Attendance"), /*#__PURE__*/React.createElement(Seg, {
      label: "Attendance",
      value: b.attendance,
      onChange: v => act('/attendance', {
        attendance: v
      }, 'Attendance saved'),
      options: Object.entries(A.ATTENDANCE).map(_ref12 => {
        var _ref13 = _slicedToArray(_ref12, 2),
          k = _ref13[0],
          v = _ref13[1];
        return [k, v.label];
      })
    })), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-block lsl-a-familyvis"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-familyvis__label"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "eye",
      size: 13
    }), " Family-provided details (the family sees these in emails)"), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-grid"
    }, /*#__PURE__*/React.createElement(Field, {
      label: "Parent / guardian"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      value: edit.form.parent || '',
      onChange: setForm('parent')
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Athlete"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      value: edit.form.athlete || '',
      onChange: setForm('athlete')
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Email"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      type: "email",
      value: edit.form.email || '',
      onChange: setForm('email')
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Phone"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      value: edit.form.phone || '',
      onChange: setForm('phone')
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Age / grade"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      value: edit.form.age || '',
      onChange: setForm('age')
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Focus / goals"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      value: edit.form.focus || '',
      onChange: setForm('focus')
    }))), /*#__PURE__*/React.createElement(Field, {
      label: "Family's notes"
    }, /*#__PURE__*/React.createElement("textarea", {
      className: "lsl-textarea",
      value: edit.form.notes || '',
      onChange: setForm('notes'),
      style: {
        minHeight: 60
      }
    }))), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-block lsl-a-private"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-private__label"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "lock",
      size: 13
    }), " Private coaching notes \u2014 never shown to families"), /*#__PURE__*/React.createElement("textarea", {
      className: "lsl-textarea",
      "aria-label": "Private coaching notes",
      value: edit.private_notes,
      onChange: e => setEdit(_objectSpread(_objectSpread({}, edit), {}, {
        private_notes: e.target.value
      })),
      placeholder: "What you worked on, what to focus on next time\u2026",
      style: {
        minHeight: 80
      }
    })), (b.roster.length > 1 || b.players && b.players !== '1') && /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-block"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-h4"
    }, "Group roster"), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-row",
      style: {
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement(Seg, {
      label: "Who pays",
      value: edit.payer_mode,
      onChange: v => setEdit(_objectSpread(_objectSpread({}, edit), {}, {
        payer_mode: v
      })),
      options: [['one', 'One person pays for the group'], ['each', 'Each athlete pays']]
    })), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-roster"
    }, edit.roster.map((m, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "lsl-a-roster__row"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      "aria-label": 'Participant ' + (i + 1) + ' name',
      value: m.name || '',
      onChange: e => setEdit(_objectSpread(_objectSpread({}, edit), {}, {
        roster: edit.roster.map((x, j) => j === i ? _objectSpread(_objectSpread({}, x), {}, {
          name: e.target.value
        }) : x)
      })),
      placeholder: "Name"
    }), /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      "aria-label": 'Participant ' + (i + 1) + ' contact',
      value: m.contact || '',
      onChange: e => setEdit(_objectSpread(_objectSpread({}, edit), {}, {
        roster: edit.roster.map((x, j) => j === i ? _objectSpread(_objectSpread({}, x), {}, {
          contact: e.target.value
        }) : x)
      })),
      placeholder: "Email or phone"
    }), edit.payer_mode === 'each' ? /*#__PURE__*/React.createElement("label", {
      className: "lsl-a-check"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: !!m.paid,
      onChange: e => setEdit(_objectSpread(_objectSpread({}, edit), {}, {
        roster: edit.roster.map((x, j) => j === i ? _objectSpread(_objectSpread({}, x), {}, {
          paid: e.target.checked
        }) : x)
      }))
    }), " Paid") : /*#__PURE__*/React.createElement("span", null), !m.primary ? /*#__PURE__*/React.createElement("button", {
      className: "lsl-admin__del",
      "aria-label": "Remove participant",
      onClick: () => setEdit(_objectSpread(_objectSpread({}, edit), {}, {
        roster: edit.roster.filter((_, j) => j !== i)
      }))
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "trash-2"
    })) : /*#__PURE__*/React.createElement(Badge, {
      tone: "muted"
    }, "Booker")))), /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--xs",
      style: {
        marginTop: 8
      },
      onClick: () => setEdit(_objectSpread(_objectSpread({}, edit), {}, {
        roster: [...edit.roster, {
          name: '',
          contact: ''
        }]
      }))
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "plus"
    }), " Add participant")), app.isDirector && /*#__PURE__*/React.createElement(PaymentPanel, {
      d: d,
      onChanged: app.changed
    }), /*#__PURE__*/React.createElement(Expand, {
      title: 'History (' + (d.events.length + d.notifications.length) + ')',
      icon: "history"
    }, /*#__PURE__*/React.createElement("ul", {
      className: "lsl-a-timeline"
    }, [...d.events.map(e => ({
      at: e.at,
      text: eventText(e, app)
    })), ...d.notifications.map(n => ({
      at: n.created_at,
      text: 'Email "' + n.kind.replace(/_/g, ' ') + '" → ' + (n.to_addr || 'no address') + ': ' + n.status + (n.detail ? ' — ' + n.detail : '')
    }))].sort((x, y) => x.at.localeCompare(y.at)).map((e, i) => /*#__PURE__*/React.createElement("li", {
      key: i
    }, /*#__PURE__*/React.createElement("time", null, A.stamp(e.at)), /*#__PURE__*/React.createElement("span", null, e.text))))), app.isDirector && /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-row",
      style: {
        marginTop: 16,
        paddingTop: 12,
        borderTop: '1px dashed var(--line-soft)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "lsl-a-spacer"
    }), /*#__PURE__*/React.createElement("button", {
      className: "lsl-admin__del lsl-admin__del--text",
      onClick: () => setSub('delete')
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "trash-2"
    }), " Delete booking\u2026")), sub === 'delete' && /*#__PURE__*/React.createElement(DeleteBookingDialog, {
      b: b,
      hasPayments: d.payments.length > 0,
      onClose: () => setSub(null),
      onDeleted: () => {
        setSub(null);
        onClose();
        app.changed();
      }
    }), sub === 'cancel' && /*#__PURE__*/React.createElement(CancelDialog, {
      b: b,
      onClose: () => setSub(null),
      onDone: app.changed
    }), sub === 'reschedule' && /*#__PURE__*/React.createElement(RescheduleDialog, {
      b: b,
      onClose: () => setSub(null),
      onDone: app.changed
    }), sub === 'approve' && /*#__PURE__*/React.createElement(ApproveDialog, {
      b: b,
      onClose: () => setSub(null),
      onDone: app.changed
    }), sub === 'offer' && /*#__PURE__*/React.createElement(OfferDialog, {
      b: b,
      onClose: () => setSub(null),
      onDone: app.changed
    }), sub === 'decline' && /*#__PURE__*/React.createElement(DeclineDialog, {
      b: b,
      onClose: () => setSub(null),
      onDone: app.changed
    }));
  }
  function eventText(e, app) {
    var who = e.actor === 'family' ? 'Family' : e.actor === 'stripe' ? 'Stripe' : e.actor === 'system' ? 'System' : app.coachName(e.actor) || 'Coach';
    var d = e.data || {};
    var t = {
      created: 'booking created (' + (A.BOOKING[d.status] || {}).label + ')',
      requested: 'request submitted',
      imported: 'imported from the old system',
      confirmed: 'confirmed' + (d.reason ? ' (' + d.reason.replace(/_/g, ' ') + ')' : ''),
      payment_succeeded: 'payment verified by Stripe',
      payment_pending: 'payment started, waiting for bank confirmation',
      payment_failed: 'payment failed',
      refund: 'refund reported (' + (d.status || '').replace('_', ' ') + ')',
      hold_expired: 'checkout hold expired — opening released',
      checkout_expired: 'Stripe checkout expired',
      late_payment_conflict: 'late payment, but the time was taken',
      offline_payment: 'recorded ' + A.money(d.amount_cents) + ' via ' + d.method,
      offline_refund: 'recorded refund of ' + A.money(d.amount_cents),
      complimentary: 'marked complimentary',
      credit_redeemed: 'package credit applied',
      rescheduled: 'moved from ' + (d.from && d.from.date ? LSL.fmtDate(d.from.date) + ' ' + LSL.fmtTime(d.from.time) : '?') + ' to ' + (d.to ? LSL.fmtDate(d.to.date) + ' ' + LSL.fmtTime(d.to.time) : '?'),
      canceled: 'canceled — opening ' + (d.reopen ? 'reopened' : 'removed') + ', payment: ' + (d.payment_outcome || 'unchanged').replace('_', ' ') + (d.notify ? ', family notified' : ''),
      approved: 'request approved for ' + (d.date ? LSL.fmtDate(d.date) + ' ' + LSL.fmtTime(d.time) : ''),
      offered_times: 'offered ' + A.plural((d.options || []).length, 'time'),
      declined: 'request declined',
      attendance: 'attendance: ' + ((A.ATTENDANCE[d.attendance] || {}).label || d.attendance),
      edited: 'edited ' + (d.fields || []).join(', '),
      resent: 'resent ' + (d.kind || '').replace('_', ' ') + ' (' + d.status + ')',
      payment_status_corrected: 'payment status changed from ' + ((A.PAYMENT[d.from] || {}).label || d.from) + ' to ' + ((A.PAYMENT[d.to] || {}).label || d.to) + ' — ' + d.reason,
      location_details_updated: 'location details updated',
      conflict_rollback: 'reservation rolled back (time conflict)'
    }[e.type] || e.type.replace(/_/g, ' ');
    return who + ': ' + t;
  }
  function PaymentPanel(_ref14) {
    var d = _ref14.d,
      onChanged = _ref14.onChanged;
    var b = d.booking;
    var app = A.useApp();
    var _A$useAction3 = A.useAction(),
      _A$useAction4 = _slicedToArray(_A$useAction3, 2),
      busy = _A$useAction4[0],
      run = _A$useAction4[1];
    var _useState15 = useState({
        amount: b.snapshot.price_cents != null ? (b.snapshot.price_cents / 100).toFixed(2) : '',
        method: 'venmo',
        paid_on: app.today,
        note: '',
        kind: 'charge'
      }),
      _useState16 = _slicedToArray(_useState15, 2),
      pay = _useState16[0],
      setPay = _useState16[1];
    var _useState17 = useState(''),
      _useState18 = _slicedToArray(_useState17, 2),
      err = _useState18[0],
      setErr = _useState18[1];
    var usable = d.packages.filter(p => p.status === 'active' && (p.balance == null || p.balance > 0) && (!p.snapshot.eligible_type_ids || p.snapshot.eligible_type_ids.includes(b.type_id)));
    var _useState19 = useState(''),
      _useState20 = _slicedToArray(_useState19, 2),
      pkg = _useState20[0],
      setPkg = _useState20[1];
    var record = () => {
      setErr('');
      var cents = A.parseMoney(pay.amount);
      if (!(cents > 0)) {
        setErr('Enter an amount.');
        return;
      }
      run(() => A.api('POST', '/api/admin/bookings/' + b.id + '/payments', {
        amount_cents: cents,
        method: pay.method,
        paid_on: pay.paid_on,
        note: pay.note,
        kind: pay.kind
      }), pay.kind === 'refund' ? 'Refund recorded' : 'Payment recorded').then(onChanged).catch(e => setErr(e.message));
    };
    return /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-block"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-h4"
    }, "Payment"), /*#__PURE__*/React.createElement("p", {
      className: "lsl-a-small",
      style: {
        marginTop: 0
      }
    }, "Price when booked: ", /*#__PURE__*/React.createElement("strong", null, b.snapshot.price_cents != null ? A.money(b.snapshot.price_cents) + (b.snapshot.pricing_basis === 'athlete' ? ' per athlete' : ' per session') : 'not recorded (Stripe price not verified)')), d.payments.length > 0 ? /*#__PURE__*/React.createElement("ul", {
      className: "lsl-a-list"
    }, d.payments.map(p => /*#__PURE__*/React.createElement("li", {
      key: p.id
    }, /*#__PURE__*/React.createElement(Badge, {
      tone: p.kind === 'refund' ? 'orange' : p.status === 'succeeded' ? 'green' : p.status === 'failed' ? 'danger' : 'warn',
      icon: p.kind === 'refund' ? 'undo-2' : 'receipt'
    }, p.kind === 'refund' ? 'Refund' : p.status), /*#__PURE__*/React.createElement("strong", null, A.money(p.amount_cents)), " \xB7 ", p.source === 'stripe' ? 'Stripe' : p.method, " \xB7 ", p.paid_on || A.stamp(p.created_at), p.recorded_by && /*#__PURE__*/React.createElement("span", {
      className: "lsl-a-muted"
    }, "\xB7 recorded by ", app.coachName(p.recorded_by) || 'coach'), p.note && /*#__PURE__*/React.createElement("span", {
      className: "lsl-a-muted"
    }, "\xB7 ", p.note)))) : /*#__PURE__*/React.createElement("p", {
      className: "lsl-a-muted lsl-a-small"
    }, "No payments on record.", b.payment_status === 'unknown' ? ' Payment status is Unknown — a booking record alone doesn\'t prove payment.' : ''), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-row",
      style: {
        margin: '10px 0'
      }
    }, b.status === 'awaiting_payment' && /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--xs",
      disabled: busy,
      onClick: () => run(() => A.api('POST', '/api/admin/bookings/' + b.id + '/confirm'), 'Confirmed — payment still outstanding').then(onChanged)
    }, "Confirm now, collect payment later"), !['complimentary', 'paid'].includes(b.payment_status) && /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--xs",
      disabled: busy,
      onClick: () => run(() => A.api('POST', '/api/admin/bookings/' + b.id + '/complimentary'), 'Marked complimentary').then(onChanged)
    }, "Mark complimentary")), /*#__PURE__*/React.createElement(FixPaymentStatus, {
      b: b,
      onChanged: onChanged
    }), /*#__PURE__*/React.createElement(Expand, {
      title: "Record an offline payment or refund",
      icon: "hand-coins"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-grid"
    }, /*#__PURE__*/React.createElement(Field, {
      label: "Type"
    }, /*#__PURE__*/React.createElement("select", {
      className: "lsl-select",
      value: pay.kind,
      onChange: e => setPay(_objectSpread(_objectSpread({}, pay), {}, {
        kind: e.target.value
      }))
    }, /*#__PURE__*/React.createElement("option", {
      value: "charge"
    }, "Payment received"), /*#__PURE__*/React.createElement("option", {
      value: "refund"
    }, "Refund given"))), /*#__PURE__*/React.createElement(Field, {
      label: "Amount ($)",
      error: err || null
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      inputMode: "decimal",
      value: pay.amount,
      onChange: e => setPay(_objectSpread(_objectSpread({}, pay), {}, {
        amount: e.target.value
      }))
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Method"
    }, /*#__PURE__*/React.createElement("select", {
      className: "lsl-select",
      value: pay.method,
      onChange: e => setPay(_objectSpread(_objectSpread({}, pay), {}, {
        method: e.target.value
      }))
    }, METHODS.map(_ref15 => {
      var _ref16 = _slicedToArray(_ref15, 2),
        k = _ref16[0],
        l = _ref16[1];
      return /*#__PURE__*/React.createElement("option", {
        key: k,
        value: k
      }, l);
    }))), /*#__PURE__*/React.createElement(Field, {
      label: "Date"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      type: "date",
      value: pay.paid_on,
      onChange: e => setPay(_objectSpread(_objectSpread({}, pay), {}, {
        paid_on: e.target.value
      }))
    }))), /*#__PURE__*/React.createElement(Field, {
      label: "Note (optional)"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      value: pay.note,
      onChange: e => setPay(_objectSpread(_objectSpread({}, pay), {}, {
        note: e.target.value
      })),
      placeholder: "e.g. Venmo @parent-name"
    })), /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--primary lsl-btn--xs",
      onClick: record,
      disabled: busy
    }, "Record ", pay.kind === 'refund' ? 'refund' : 'payment'), /*#__PURE__*/React.createElement("p", {
      className: "lsl-a-muted lsl-a-small"
    }, "Recorded with your name and the time for the audit trail. Card refunds for online payments are issued in Stripe; they appear here automatically.")), usable.length > 0 && b.payment_status !== 'package_credit' && /*#__PURE__*/React.createElement(Expand, {
      title: "Use a package credit",
      icon: "ticket"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-row"
    }, /*#__PURE__*/React.createElement("select", {
      className: "lsl-select",
      style: {
        width: 'auto',
        flex: 1
      },
      value: pkg,
      onChange: e => setPkg(e.target.value),
      "aria-label": "Package"
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "Choose a package\u2026"), usable.map(p => /*#__PURE__*/React.createElement("option", {
      key: p.id,
      value: p.id
    }, p.snapshot.name, " \u2014 ", p.balance == null ? 'unlimited' : p.balance + ' left', p.expires_on ? ', expires ' + LSL.fmtDate(p.expires_on) : ''))), /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--primary lsl-btn--xs",
      disabled: !pkg || busy,
      onClick: () => run(() => A.api('POST', '/api/admin/bookings/' + b.id + '/redeem', {
        family_package_id: pkg
      }), 'Credit applied').then(onChanged)
    }, "Apply 1 credit"))));
  }
  function FixPaymentStatus(_ref17) {
    var b = _ref17.b,
      onChanged = _ref17.onChanged;
    var _A$useAction5 = A.useAction(),
      _A$useAction6 = _slicedToArray(_A$useAction5, 2),
      busy = _A$useAction6[0],
      run = _A$useAction6[1];
    var _useState21 = useState(b.payment_status === 'paid' ? 'unpaid' : 'paid'),
      _useState22 = _slicedToArray(_useState21, 2),
      to = _useState22[0],
      setTo = _useState22[1];
    var _useState23 = useState(''),
      _useState24 = _slicedToArray(_useState23, 2),
      reason = _useState24[0],
      setReason = _useState24[1];
    return /*#__PURE__*/React.createElement(Expand, {
      title: "Correct payment status",
      icon: "pencil"
    }, /*#__PURE__*/React.createElement("p", {
      className: "lsl-a-muted lsl-a-small",
      style: {
        marginTop: 0
      }
    }, "For fixing records by hand, e.g. an imported session that wasn't actually paid. Logged with your name and reason."), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-row"
    }, /*#__PURE__*/React.createElement("select", {
      className: "lsl-select",
      style: {
        width: 'auto'
      },
      value: to,
      onChange: e => setTo(e.target.value),
      "aria-label": "New payment status"
    }, ['paid', 'unpaid', 'unknown', 'complimentary'].filter(k => k !== b.payment_status).map(k => /*#__PURE__*/React.createElement("option", {
      key: k,
      value: k
    }, A.PAYMENT[k].label))), /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      style: {
        flex: 1,
        minWidth: 160
      },
      value: reason,
      onChange: e => setReason(e.target.value),
      placeholder: "Reason (required)",
      "aria-label": "Reason"
    }), /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--primary lsl-btn--xs",
      disabled: busy || !reason.trim(),
      onClick: () => run(() => A.api('PATCH', '/api/admin/bookings/' + b.id, {
        payment_status: to,
        payment_reason: reason
      }), 'Payment status updated').then(onChanged)
    }, "Update")));
  }

  /* ---------------- Delete (two confirmations) ---------------- */
  function DeleteBookingDialog(_ref18) {
    var b = _ref18.b,
      hasPayments = _ref18.hasPayments,
      onClose = _ref18.onClose,
      onDeleted = _ref18.onDeleted;
    var toast = A.useToast();
    var _useState25 = useState(1),
      _useState26 = _slicedToArray(_useState25, 2),
      step = _useState26[0],
      setStep = _useState26[1];
    var _useState27 = useState(false),
      _useState28 = _slicedToArray(_useState27, 2),
      busy = _useState28[0],
      setBusy = _useState28[1];
    var _useState29 = useState(''),
      _useState30 = _slicedToArray(_useState29, 2),
      err = _useState30[0],
      setErr = _useState30[1];
    var holdsTime = b.slot_id && ['awaiting_payment', 'confirmed', 'completed'].includes(b.status);
    var del = /*#__PURE__*/function () {
      var _ref19 = _asyncToGenerator(function* () {
        setBusy(true);
        setErr('');
        try {
          yield A.api('DELETE', '/api/admin/bookings/' + b.id, {
            confirm: 'DELETE'
          });
          toast('Booking deleted');
          onDeleted();
        } catch (e) {
          setErr(e.message);
        } finally {
          setBusy(false);
        }
      });
      return function del() {
        return _ref19.apply(this, arguments);
      };
    }();
    var what = b.form.athlete + ' — ' + (b.snapshot.service_name || 'booking') + (b.date ? ' · ' + LSL.fmtDate(b.date) + ' ' + LSL.fmtTime(b.time) : '');
    if (step === 1) {
      return /*#__PURE__*/React.createElement(Dialog, {
        title: "Delete this booking?",
        onClose: onClose,
        footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
          className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
          onClick: onClose,
          "data-autofocus": true
        }, "Keep booking"), /*#__PURE__*/React.createElement("button", {
          className: "lsl-btn lsl-btn--danger lsl-btn--sm",
          onClick: () => setStep(2)
        }, "Continue"))
      }, /*#__PURE__*/React.createElement("p", {
        className: "lsl-body lsl-body--sm",
        style: {
          marginTop: 0
        }
      }, /*#__PURE__*/React.createElement("strong", null, what)), /*#__PURE__*/React.createElement(A.Banner, {
        tone: "warn"
      }, "This permanently removes the booking and its history from the dashboard. It can't be undone."), /*#__PURE__*/React.createElement("ul", {
        className: "lsl-a-list"
      }, holdsTime && /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Icon, {
        name: "calendar"
      }), " Its time slot is reopened for other families."), hasPayments && /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Icon, {
        name: "receipt"
      }), " Payment records are kept for your bookkeeping. Nothing is refunded."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Icon, {
        name: "mail-x"
      }), " The family is not notified."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Icon, {
        name: "archive"
      }), " A copy is saved in the internal audit log.")), /*#__PURE__*/React.createElement("p", {
        className: "lsl-a-muted lsl-a-small"
      }, "If the session just isn't happening, ", /*#__PURE__*/React.createElement("strong", null, "Cancel"), " is usually better \u2014 it keeps the record."));
    }
    return /*#__PURE__*/React.createElement(Dialog, {
      title: "Are you absolutely sure?",
      onClose: onClose,
      busy: busy,
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
        className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
        onClick: onClose,
        "data-autofocus": true
      }, "No, keep it"), /*#__PURE__*/React.createElement("button", {
        className: "lsl-btn lsl-btn--danger lsl-btn--sm",
        onClick: del,
        disabled: busy
      }, busy ? 'Deleting…' : 'Yes, delete forever'))
    }, /*#__PURE__*/React.createElement("p", {
      className: "lsl-body lsl-body--sm",
      style: {
        marginTop: 0
      }
    }, /*#__PURE__*/React.createElement("strong", null, what), " will be permanently deleted. This can't be undone."), err && /*#__PURE__*/React.createElement(A.Banner, {
      tone: "danger"
    }, err));
  }

  /* ---------------- Cancel ---------------- */
  function CancelDialog(_ref20) {
    var b = _ref20.b,
      onClose = _ref20.onClose,
      onDone = _ref20.onDone;
    var app = A.useApp();
    var toast = A.useToast();
    var q = A.useFetch('/api/admin/bookings/' + b.id + '/cancel');
    var _useState31 = useState({
        reopen: true,
        notify: false,
        payment_outcome: 'unchanged',
        reason: '',
        override_policy: false
      }),
      _useState32 = _slicedToArray(_useState31, 2),
      v = _useState32[0],
      setV = _useState32[1];
    var _useState33 = useState(false),
      _useState34 = _slicedToArray(_useState33, 2),
      busy = _useState34[0],
      setBusy = _useState34[1];
    var _useState35 = useState(''),
      _useState36 = _slicedToArray(_useState35, 2),
      err = _useState36[0],
      setErr = _useState36[1];
    var info = q.data;
    var emailOk = app.integrations ? app.integrations.email.configured : null;
    var paid = ['paid', 'partially_refunded'].includes(b.payment_status);
    var submit = /*#__PURE__*/function () {
      var _ref21 = _asyncToGenerator(function* () {
        setBusy(true);
        setErr('');
        try {
          var r = yield A.api('POST', '/api/admin/bookings/' + b.id + '/cancel', v);
          toast('Booking canceled' + (r.notice ? ' — email ' + r.notice.status : ''));
          onDone();
          onClose();
        } catch (e) {
          setErr(e.message);
        } finally {
          setBusy(false);
        }
      });
      return function submit() {
        return _ref21.apply(this, arguments);
      };
    }();
    return /*#__PURE__*/React.createElement(Dialog, {
      title: 'Cancel ' + b.form.athlete + "'s session",
      onClose: onClose,
      busy: busy,
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
        className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
        onClick: onClose
      }, "Keep booking"), /*#__PURE__*/React.createElement("button", {
        className: "lsl-btn lsl-btn--danger lsl-btn--sm",
        onClick: submit,
        disabled: busy || !info
      }, busy ? 'Canceling…' : 'Cancel booking'))
    }, /*#__PURE__*/React.createElement("p", {
      className: "lsl-body lsl-body--sm",
      style: {
        marginTop: 0
      }
    }, b.snapshot.service_name, " \xB7 ", b.date ? LSL.fmtDateLong(b.date) + ' at ' + LSL.fmtTime(b.time) : ''), !info ? /*#__PURE__*/React.createElement(A.Loading, null) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(A.Banner, {
      tone: "info"
    }, /*#__PURE__*/React.createElement("strong", null, "Policy:"), " ", info.policy.rule, info.policy.hours != null ? ' (' + (info.policy.hours >= 0 ? info.policy.hours + ' hours before the session' : 'session already started') + ')' : ''), /*#__PURE__*/React.createElement("fieldset", {
      style: {
        border: 0,
        padding: 0,
        margin: '0 0 14px'
      }
    }, /*#__PURE__*/React.createElement("legend", {
      className: "lsl-a-h4"
    }, "The opening"), /*#__PURE__*/React.createElement("label", {
      className: "lsl-a-check",
      style: {
        display: 'flex',
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "radio",
      name: "reopen",
      checked: v.reopen,
      onChange: () => setV(_objectSpread(_objectSpread({}, v), {}, {
        reopen: true
      }))
    }), " Reopen it so another family can book this time"), /*#__PURE__*/React.createElement("label", {
      className: "lsl-a-check",
      style: {
        display: 'flex'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "radio",
      name: "reopen",
      checked: !v.reopen,
      onChange: () => setV(_objectSpread(_objectSpread({}, v), {}, {
        reopen: false
      }))
    }), " Remove it (I'm no longer available then)")), /*#__PURE__*/React.createElement("fieldset", {
      style: {
        border: 0,
        padding: 0,
        margin: '0 0 14px'
      }
    }, /*#__PURE__*/React.createElement("legend", {
      className: "lsl-a-h4"
    }, "The family"), /*#__PURE__*/React.createElement("label", {
      className: "lsl-a-check"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: v.notify,
      disabled: !info.email_on_file,
      onChange: e => setV(_objectSpread(_objectSpread({}, v), {}, {
        notify: e.target.checked
      }))
    }), " Email the family a cancellation notice"), v.notify && emailOk === false && /*#__PURE__*/React.createElement("p", {
      className: "lsl-a-small",
      style: {
        color: '#8a5a00'
      }
    }, "Email isn't set up yet, so no message will actually be sent \u2014 it will be logged as \"skipped\". Contact the family directly."), !v.notify && /*#__PURE__*/React.createElement("p", {
      className: "lsl-a-muted lsl-a-small"
    }, "The family will not be notified automatically.")), app.isDirector && /*#__PURE__*/React.createElement("fieldset", {
      style: {
        border: 0,
        padding: 0,
        margin: '0 0 14px'
      }
    }, /*#__PURE__*/React.createElement("legend", {
      className: "lsl-a-h4"
    }, "Payment (", A.PAYMENT[b.payment_status].label, ")"), /*#__PURE__*/React.createElement("label", {
      className: "lsl-a-check",
      style: {
        display: 'flex',
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "radio",
      name: "pay",
      checked: v.payment_outcome === 'unchanged',
      onChange: () => setV(_objectSpread(_objectSpread({}, v), {}, {
        payment_outcome: 'unchanged'
      }))
    }), " Leave payment unchanged"), paid && /*#__PURE__*/React.createElement("label", {
      className: "lsl-a-check",
      style: {
        display: 'flex',
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "radio",
      name: "pay",
      checked: v.payment_outcome === 'refund_pending',
      onChange: () => setV(_objectSpread(_objectSpread({}, v), {}, {
        payment_outcome: 'refund_pending'
      }))
    }), " Refund \u2014 I'll issue it in Stripe (", info.policy.refundPct, "% per policy)"), /*#__PURE__*/React.createElement("label", {
      className: "lsl-a-check",
      style: {
        display: 'flex',
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "radio",
      name: "pay",
      checked: v.payment_outcome === 'credit',
      onChange: () => setV(_objectSpread(_objectSpread({}, v), {}, {
        payment_outcome: 'credit'
      }))
    }), " Give the family a session credit instead"), info.credit_redeemed && /*#__PURE__*/React.createElement("label", {
      className: "lsl-a-check",
      style: {
        display: 'flex'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "radio",
      name: "pay",
      checked: v.payment_outcome === 'restore_credit',
      onChange: () => setV(_objectSpread(_objectSpread({}, v), {}, {
        payment_outcome: 'restore_credit'
      }))
    }), " Restore the package credit that was used ", info.policy.creditRestorable ? '(allowed by policy)' : '(outside the policy window)'), v.payment_outcome === 'restore_credit' && !info.policy.creditRestorable && /*#__PURE__*/React.createElement("label", {
      className: "lsl-a-check",
      style: {
        marginTop: 6
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: v.override_policy,
      onChange: e => setV(_objectSpread(_objectSpread({}, v), {}, {
        override_policy: e.target.checked
      }))
    }), " Override the policy for this family"), /*#__PURE__*/React.createElement("p", {
      className: "lsl-a-muted lsl-a-small"
    }, "Canceling never refunds money by itself. Refunds are issued in Stripe and show up here automatically.")), /*#__PURE__*/React.createElement(Field, {
      label: "Reason (internal)"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      value: v.reason,
      onChange: e => setV(_objectSpread(_objectSpread({}, v), {}, {
        reason: e.target.value
      })),
      placeholder: "e.g. Family sick, rescheduling next week"
    })), err && /*#__PURE__*/React.createElement(A.Banner, {
      tone: "danger"
    }, err)));
  }

  /* ---------------- Slot picker for reschedule / approve ---------------- */
  function SlotPicker(_ref22) {
    var value = _ref22.value,
      _onChange = _ref22.onChange,
      excludeId = _ref22.excludeId;
    var app = A.useApp();
    var to = (() => {
      var _app$today$split$map = app.today.split('-').map(Number),
        _app$today$split$map2 = _slicedToArray(_app$today$split$map, 3),
        y = _app$today$split$map2[0],
        m = _app$today$split$map2[1],
        d = _app$today$split$map2[2];
      return new Date(Date.UTC(y, m - 1, d + 45)).toISOString().slice(0, 10);
    })();
    var q = A.useFetch('/api/admin/schedule?from=' + app.today + '&to=' + to);
    var _useState37 = useState({
        date: '',
        time: '',
        loc_id: (app.locations.find(l => l.active) || {}).id || ''
      }),
      _useState38 = _slicedToArray(_useState37, 2),
      custom = _useState38[0],
      setCustom = _useState38[1];
    var open = q.data ? q.data.slots.filter(s => s.status === 'open' && s.id !== excludeId && !s.conflicts.some(c => c.severity === 'hard')) : [];
    var mode = value && value.slot_id ? 'slot' : value && value.date ? 'custom' : value && value.mode || 'slot';
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Seg, {
      label: "Choose time",
      value: mode,
      onChange: m => _onChange(m === 'slot' ? {
        mode: 'slot'
      } : _objectSpread({
        mode: 'custom'
      }, custom)),
      options: [['slot', 'Pick an opening'], ['custom', 'Enter a time']]
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12
      }
    }, mode === 'slot' ? q.loading ? /*#__PURE__*/React.createElement(A.Loading, null) : open.length === 0 ? /*#__PURE__*/React.createElement("p", {
      className: "lsl-a-muted lsl-a-small"
    }, "No open times in the next 45 days. Enter a time instead.") : /*#__PURE__*/React.createElement(Field, {
      label: "Opening"
    }, /*#__PURE__*/React.createElement("select", {
      className: "lsl-select",
      value: value && value.slot_id || '',
      onChange: e => _onChange({
        mode: 'slot',
        slot_id: e.target.value
      })
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "Choose\u2026"), open.map(s => /*#__PURE__*/React.createElement("option", {
      key: s.id,
      value: s.id
    }, LSL.fmtDate(s.date), " \xB7 ", LSL.fmtTime(s.time), " \xB7 ", app.locName(s.loc_id), s.contingent ? ' (B2B)' : '')))) : /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-grid"
    }, /*#__PURE__*/React.createElement(Field, {
      label: "Date"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      type: "date",
      min: app.today,
      value: custom.date,
      onChange: e => {
        var c = _objectSpread(_objectSpread({}, custom), {}, {
          date: e.target.value
        });
        setCustom(c);
        _onChange(_objectSpread({
          mode: 'custom'
        }, c));
      }
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Time"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      type: "time",
      value: custom.time,
      onChange: e => {
        var c = _objectSpread(_objectSpread({}, custom), {}, {
          time: e.target.value
        });
        setCustom(c);
        _onChange(_objectSpread({
          mode: 'custom'
        }, c));
      }
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Location"
    }, /*#__PURE__*/React.createElement("select", {
      className: "lsl-select",
      value: custom.loc_id,
      onChange: e => {
        var c = _objectSpread(_objectSpread({}, custom), {}, {
          loc_id: e.target.value
        });
        setCustom(c);
        _onChange(_objectSpread({
          mode: 'custom'
        }, c));
      }
    }, app.locations.filter(l => l.active).map(l => /*#__PURE__*/React.createElement("option", {
      key: l.id,
      value: l.id
    }, l.name)))))));
  }
  var targetBody = t => t && t.slot_id ? {
    slot_id: t.slot_id
  } : t ? {
    date: t.date,
    time: t.time,
    loc_id: t.loc_id
  } : {};
  function RescheduleDialog(_ref23) {
    var b = _ref23.b,
      onClose = _ref23.onClose,
      onDone = _ref23.onDone;
    var app = A.useApp();
    var toast = A.useToast();
    var _useState39 = useState(null),
      _useState40 = _slicedToArray(_useState39, 2),
      t = _useState40[0],
      setT = _useState40[1];
    var _useState41 = useState(true),
      _useState42 = _slicedToArray(_useState41, 2),
      notify = _useState42[0],
      setNotify = _useState42[1];
    var _useState43 = useState(true),
      _useState44 = _slicedToArray(_useState43, 2),
      reopen = _useState44[0],
      setReopen = _useState44[1];
    var _useState45 = useState(''),
      _useState46 = _slicedToArray(_useState45, 2),
      reason = _useState46[0],
      setReason = _useState46[1];
    var _useState47 = useState(false),
      _useState48 = _slicedToArray(_useState47, 2),
      busy = _useState48[0],
      setBusy = _useState48[1];
    var _useState49 = useState(''),
      _useState50 = _slicedToArray(_useState49, 2),
      err = _useState50[0],
      setErr = _useState50[1];
    var hrs = b.date ? (LSL.localToInstant(b.date, b.time, app.settings.timezone) - Date.now()) / 3600000 : null;
    var late = hrs != null && hrs < app.settings.cancellation.rescheduleHours;
    var submit = /*#__PURE__*/function () {
      var _ref24 = _asyncToGenerator(function* () {
        setBusy(true);
        setErr('');
        try {
          var r = yield A.api('POST', '/api/admin/bookings/' + b.id + '/reschedule', _objectSpread(_objectSpread({}, targetBody(t)), {}, {
            notify,
            reopen_old: reopen,
            reason
          }));
          toast('Rescheduled' + (r.notice ? ' — email ' + r.notice.status : ''));
          onDone();
          onClose();
        } catch (e) {
          setErr(e.message);
        } finally {
          setBusy(false);
        }
      });
      return function submit() {
        return _ref24.apply(this, arguments);
      };
    }();
    return /*#__PURE__*/React.createElement(Dialog, {
      title: 'Reschedule ' + b.form.athlete,
      onClose: onClose,
      busy: busy,
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
        className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
        onClick: onClose
      }, "Cancel"), /*#__PURE__*/React.createElement("button", {
        className: "lsl-btn lsl-btn--primary lsl-btn--sm",
        onClick: submit,
        disabled: busy || !t || !(t.slot_id || t.date && t.time)
      }, "Move session"))
    }, /*#__PURE__*/React.createElement("p", {
      className: "lsl-body lsl-body--sm",
      style: {
        marginTop: 0
      }
    }, "Currently ", LSL.fmtDateLong(b.date), " at ", LSL.fmtTime(b.time), ". The booking keeps its history, payment, and notes."), late && /*#__PURE__*/React.createElement(A.Banner, {
      tone: "warn"
    }, "This is within your ", app.settings.cancellation.rescheduleHours, "-hour rescheduling window. You can still move it as the coach."), /*#__PURE__*/React.createElement(SlotPicker, {
      value: t,
      onChange: setT,
      excludeId: b.slot_id
    }), /*#__PURE__*/React.createElement("label", {
      className: "lsl-a-check",
      style: {
        margin: '12px 0 6px',
        display: 'flex'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: reopen,
      onChange: e => setReopen(e.target.checked)
    }), " Reopen the old time for other families"), /*#__PURE__*/React.createElement("label", {
      className: "lsl-a-check",
      style: {
        display: 'flex'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: notify,
      onChange: e => setNotify(e.target.checked)
    }), " Email the family the new time"), /*#__PURE__*/React.createElement(Field, {
      label: "Reason (internal)",
      className: ""
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      value: reason,
      onChange: e => setReason(e.target.value)
    })), err && /*#__PURE__*/React.createElement(A.Banner, {
      tone: "danger"
    }, err));
  }
  function ApproveDialog(_ref25) {
    var b = _ref25.b,
      onClose = _ref25.onClose,
      onDone = _ref25.onDone;
    var app = A.useApp();
    var toast = A.useToast();
    var r0 = b.request || {};
    var _useState51 = useState(r0.slot_id ? {
        mode: 'slot',
        slot_id: r0.slot_id
      } : null),
      _useState52 = _slicedToArray(_useState51, 2),
      t = _useState52[0],
      setT = _useState52[1];
    var _useState53 = useState(b.type_id || (app.types.find(x => x.active) || {}).id),
      _useState54 = _slicedToArray(_useState53, 2),
      type = _useState54[0],
      setType = _useState54[1];
    var _useState55 = useState(true),
      _useState56 = _slicedToArray(_useState55, 2),
      requirePay = _useState56[0],
      setRequirePay = _useState56[1];
    var _useState57 = useState(true),
      _useState58 = _slicedToArray(_useState57, 2),
      notify = _useState58[0],
      setNotify = _useState58[1];
    var _useState59 = useState(false),
      _useState60 = _slicedToArray(_useState59, 2),
      busy = _useState60[0],
      setBusy = _useState60[1];
    var _useState61 = useState(''),
      _useState62 = _slicedToArray(_useState61, 2),
      err = _useState62[0],
      setErr = _useState62[1];
    var _useState63 = useState(null),
      _useState64 = _slicedToArray(_useState63, 2),
      link = _useState64[0],
      setLink = _useState64[1];
    var ty = app.typeById(type);
    var submit = /*#__PURE__*/function () {
      var _ref26 = _asyncToGenerator(function* () {
        setBusy(true);
        setErr('');
        try {
          var r = yield A.api('POST', '/api/admin/bookings/' + b.id + '/approve', _objectSpread(_objectSpread({}, targetBody(t)), {}, {
            type_id: type,
            require_payment: requirePay,
            notify
          }));
          toast('Request approved' + (r.notice ? ' — email ' + r.notice.status : ''));
          onDone();
          if (r.checkout_url) setLink(r.checkout_url);else onClose();
        } catch (e) {
          setErr(e.message);
        } finally {
          setBusy(false);
        }
      });
      return function submit() {
        return _ref26.apply(this, arguments);
      };
    }();
    if (link) {
      return /*#__PURE__*/React.createElement(Dialog, {
        title: "Approved \u2014 payment link",
        onClose: onClose,
        footer: /*#__PURE__*/React.createElement("button", {
          className: "lsl-btn lsl-btn--primary lsl-btn--sm",
          onClick: onClose
        }, "Done")
      }, /*#__PURE__*/React.createElement("p", {
        className: "lsl-body lsl-body--sm",
        style: {
          marginTop: 0
        }
      }, "The booking is reserved and waiting for payment. This link is tied to this booking, so the payment is matched automatically:"), /*#__PURE__*/React.createElement("p", {
        className: "lsl-a-mono"
      }, link), /*#__PURE__*/React.createElement("button", {
        className: "lsl-btn lsl-btn--ghost lsl-btn--xs",
        onClick: () => A.copy(link, toast)
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "copy"
      }), " Copy link"));
    }
    return /*#__PURE__*/React.createElement(Dialog, {
      title: 'Approve request — ' + b.form.athlete,
      onClose: onClose,
      busy: busy,
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
        className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
        onClick: onClose
      }, "Cancel"), /*#__PURE__*/React.createElement("button", {
        className: "lsl-btn lsl-btn--primary lsl-btn--sm",
        onClick: submit,
        disabled: busy || !t || !(t.slot_id || t.date && t.time)
      }, "Approve"))
    }, /*#__PURE__*/React.createElement("p", {
      className: "lsl-a-small",
      style: {
        marginTop: 0
      }
    }, /*#__PURE__*/React.createElement("strong", null, "They asked for:"), " ", requestLine(b), b.players ? ' · ' + b.players + ' players' : ''), /*#__PURE__*/React.createElement(Field, {
      label: "Session type"
    }, /*#__PURE__*/React.createElement("select", {
      className: "lsl-select",
      value: type,
      onChange: e => setType(e.target.value)
    }, app.types.filter(x => x.active).map(x => /*#__PURE__*/React.createElement("option", {
      key: x.id,
      value: x.id
    }, x.name)))), /*#__PURE__*/React.createElement(SlotPicker, {
      value: t,
      onChange: setT
    }), /*#__PURE__*/React.createElement("label", {
      className: "lsl-a-check",
      style: {
        margin: '12px 0 6px',
        display: 'flex'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: requirePay && !!ty.pay_link,
      disabled: !ty.pay_link,
      onChange: e => setRequirePay(e.target.checked)
    }), " Require payment to confirm ", ty.pay_link ? '(family gets a Stripe link)' : '(this service has no payment link)'), /*#__PURE__*/React.createElement("label", {
      className: "lsl-a-check",
      style: {
        display: 'flex'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: notify,
      onChange: e => setNotify(e.target.checked)
    }), " Email the family that it's approved"), err && /*#__PURE__*/React.createElement(A.Banner, {
      tone: "danger"
    }, err));
  }
  function OfferDialog(_ref27) {
    var b = _ref27.b,
      onClose = _ref27.onClose,
      onDone = _ref27.onDone;
    var app = A.useApp();
    var toast = A.useToast();
    var loc0 = (app.locations.find(l => l.active) || {}).id;
    var _useState65 = useState([{
        date: '',
        time: '',
        loc_id: loc0
      }]),
      _useState66 = _slicedToArray(_useState65, 2),
      opts = _useState66[0],
      setOpts = _useState66[1];
    var _useState67 = useState(''),
      _useState68 = _slicedToArray(_useState67, 2),
      message = _useState68[0],
      setMessage = _useState68[1];
    var _useState69 = useState(false),
      _useState70 = _slicedToArray(_useState69, 2),
      busy = _useState70[0],
      setBusy = _useState70[1];
    var _useState71 = useState(''),
      _useState72 = _slicedToArray(_useState71, 2),
      err = _useState72[0],
      setErr = _useState72[1];
    var submit = /*#__PURE__*/function () {
      var _ref28 = _asyncToGenerator(function* () {
        setBusy(true);
        setErr('');
        try {
          var r = yield A.api('POST', '/api/admin/bookings/' + b.id + '/offer', {
            options: opts.filter(o => o.date && o.time),
            message
          });
          toast(r.notice.status === 'sent' ? 'Times sent to the family' : 'Offer logged — email ' + r.notice.status + (r.notice.detail ? ': ' + r.notice.detail : ''), r.notice.status === 'sent' ? 'ok' : 'err');
          onDone();
          onClose();
        } catch (e) {
          setErr(e.message);
        } finally {
          setBusy(false);
        }
      });
      return function submit() {
        return _ref28.apply(this, arguments);
      };
    }();
    var upd = (i, k, v) => setOpts(opts.map((o, j) => j === i ? _objectSpread(_objectSpread({}, o), {}, {
      [k]: v
    }) : o));
    return /*#__PURE__*/React.createElement(Dialog, {
      title: 'Offer times to ' + b.form.parent,
      onClose: onClose,
      busy: busy,
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
        className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
        onClick: onClose
      }, "Cancel"), /*#__PURE__*/React.createElement("button", {
        className: "lsl-btn lsl-btn--primary lsl-btn--sm",
        onClick: submit,
        disabled: busy || !opts.some(o => o.date && o.time)
      }, "Send offer"))
    }, /*#__PURE__*/React.createElement("p", {
      className: "lsl-a-small",
      style: {
        marginTop: 0
      }
    }, /*#__PURE__*/React.createElement("strong", null, "They asked for:"), " ", requestLine(b)), opts.map((o, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "lsl-a-grid",
      style: {
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement(Field, {
      label: 'Option ' + (i + 1) + ' date'
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      type: "date",
      min: app.today,
      value: o.date,
      onChange: e => upd(i, 'date', e.target.value)
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Time"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      type: "time",
      value: o.time,
      onChange: e => upd(i, 'time', e.target.value)
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Location"
    }, /*#__PURE__*/React.createElement("select", {
      className: "lsl-select",
      value: o.loc_id,
      onChange: e => upd(i, 'loc_id', e.target.value)
    }, app.locations.filter(l => l.active).map(l => /*#__PURE__*/React.createElement("option", {
      key: l.id,
      value: l.id
    }, l.name)))))), opts.length < 4 && /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--xs",
      onClick: () => setOpts([...opts, {
        date: '',
        time: '',
        loc_id: loc0
      }])
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "plus"
    }), " Add another option"), /*#__PURE__*/React.createElement(Field, {
      label: "Message (optional)"
    }, /*#__PURE__*/React.createElement("textarea", {
      className: "lsl-textarea",
      value: message,
      onChange: e => setMessage(e.target.value),
      style: {
        minHeight: 70
      }
    })), /*#__PURE__*/React.createElement("p", {
      className: "lsl-a-muted lsl-a-small"
    }, "Offering times doesn't reserve them. When the family replies, use Approve to book the time they pick."), err && /*#__PURE__*/React.createElement(A.Banner, {
      tone: "danger"
    }, err));
  }
  function DeclineDialog(_ref29) {
    var b = _ref29.b,
      onClose = _ref29.onClose,
      onDone = _ref29.onDone;
    var toast = A.useToast();
    var _useState73 = useState(''),
      _useState74 = _slicedToArray(_useState73, 2),
      reason = _useState74[0],
      setReason = _useState74[1];
    var _useState75 = useState(true),
      _useState76 = _slicedToArray(_useState75, 2),
      notify = _useState76[0],
      setNotify = _useState76[1];
    var _useState77 = useState(false),
      _useState78 = _slicedToArray(_useState77, 2),
      busy = _useState78[0],
      setBusy = _useState78[1];
    var submit = /*#__PURE__*/function () {
      var _ref30 = _asyncToGenerator(function* () {
        setBusy(true);
        try {
          var r = yield A.api('POST', '/api/admin/bookings/' + b.id + '/decline', {
            reason,
            notify
          });
          toast('Request declined' + (r.notice ? ' — email ' + r.notice.status : ''));
          onDone();
          onClose();
        } catch (e) {
          toast(e.message, 'err');
        } finally {
          setBusy(false);
        }
      });
      return function submit() {
        return _ref30.apply(this, arguments);
      };
    }();
    return /*#__PURE__*/React.createElement(Dialog, {
      title: 'Decline request — ' + b.form.athlete,
      onClose: onClose,
      busy: busy,
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
        className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
        onClick: onClose
      }, "Keep request"), /*#__PURE__*/React.createElement("button", {
        className: "lsl-btn lsl-btn--danger lsl-btn--sm",
        onClick: submit,
        disabled: busy
      }, "Decline"))
    }, /*#__PURE__*/React.createElement(Field, {
      label: "Reason",
      hint: "Included in the email if you notify the family"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      value: reason,
      onChange: e => setReason(e.target.value),
      placeholder: "e.g. that time is already full"
    })), /*#__PURE__*/React.createElement("label", {
      className: "lsl-a-check"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: notify,
      onChange: e => setNotify(e.target.checked)
    }), " Email the family"));
  }

  /* ---------------- Family drawer ---------------- */
  function FamilyDrawer(_ref31) {
    var id = _ref31.id,
      onClose = _ref31.onClose;
    var app = A.useApp();
    var toast = A.useToast();
    var q = A.useFetch('/api/admin/families/' + id, [app.version]);
    var _useState79 = useState(null),
      _useState80 = _slicedToArray(_useState79, 2),
      fam = _useState80[0],
      setFam = _useState80[1];
    var _A$useAction7 = A.useAction(),
      _A$useAction8 = _slicedToArray(_A$useAction7, 2),
      busy = _A$useAction8[0],
      run = _A$useAction8[1];
    var _useState81 = useState({
        package_id: '',
        amount: '',
        method: 'venmo'
      }),
      _useState82 = _slicedToArray(_useState81, 2),
      grant = _useState82[0],
      setGrant = _useState82[1];
    var _useState83 = useState(''),
      _useState84 = _slicedToArray(_useState83, 2),
      mergeQ = _useState84[0],
      setMergeQ = _useState84[1];
    var _useState85 = useState([]),
      _useState86 = _slicedToArray(_useState85, 2),
      mergeHits = _useState86[0],
      setMergeHits = _useState86[1];
    var pk = A.useFetch(app.isDirector ? '/api/admin/packages' : null);
    var d = q.data;
    useEffect(() => {
      if (d) setFam({
        parent_name: d.family.parent_name,
        email: d.family.email || '',
        phone: d.family.phone || '',
        notes_private: d.family.notes_private || ''
      });
    }, [d]);
    if (!d || !fam) return /*#__PURE__*/React.createElement(Dialog, {
      drawer: true,
      title: "Family",
      onClose: onClose
    }, q.error ? /*#__PURE__*/React.createElement(A.ErrorState, {
      error: q.error,
      onRetry: q.reload
    }) : /*#__PURE__*/React.createElement(A.Loading, null));
    var dirty = fam.parent_name !== d.family.parent_name || fam.email !== (d.family.email || '') || fam.phone !== (d.family.phone || '') || fam.notes_private !== (d.family.notes_private || '');
    var att = d.bookings.reduce((o, b) => {
      o[b.attendance] = (o[b.attendance] || 0) + 1;
      return o;
    }, {});
    var saveFam = () => run(() => A.api('PATCH', '/api/admin/families/' + id, fam), 'Family saved').then(app.changed);
    var searchMerge = /*#__PURE__*/function () {
      var _ref32 = _asyncToGenerator(function* (s) {
        setMergeQ(s);
        if (s.trim().length < 2) {
          setMergeHits([]);
          return;
        }
        try {
          var r = yield A.api('GET', '/api/admin/families?q=' + encodeURIComponent(s));
          setMergeHits(r.families.filter(f => f.id !== id));
        } catch (e) {/* ignore */}
      });
      return function searchMerge(_x2) {
        return _ref32.apply(this, arguments);
      };
    }();
    return /*#__PURE__*/React.createElement(Dialog, {
      drawer: true,
      title: d.family.parent_name + "'s family",
      onClose: onClose,
      footer: dirty ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
        className: "lsl-a-inline-status is-dirty"
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "pencil"
      }), " Unsaved"), /*#__PURE__*/React.createElement("button", {
        className: "lsl-btn lsl-btn--primary lsl-btn--sm",
        onClick: saveFam,
        disabled: busy
      }, "Save")) : null
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-block lsl-a-familyvis"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-familyvis__label"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "contact",
      size: 13
    }), " Parent contact"), /*#__PURE__*/React.createElement(Field, {
      label: "Parent / guardian"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      value: fam.parent_name,
      onChange: e => setFam(_objectSpread(_objectSpread({}, fam), {}, {
        parent_name: e.target.value
      }))
    })), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-grid"
    }, /*#__PURE__*/React.createElement(Field, {
      label: "Email"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      type: "email",
      value: fam.email,
      onChange: e => setFam(_objectSpread(_objectSpread({}, fam), {}, {
        email: e.target.value
      }))
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Phone"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      value: fam.phone,
      onChange: e => setFam(_objectSpread(_objectSpread({}, fam), {}, {
        phone: e.target.value
      }))
    })))), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-block"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-h4"
    }, "Athletes ", d.athletes.length > 1 && /*#__PURE__*/React.createElement("span", {
      className: "lsl-a-muted"
    }, "(siblings)")), d.athletes.map(a => /*#__PURE__*/React.createElement(AthleteRow, {
      key: a.id,
      a: a,
      others: d.athletes.filter(x => x.id !== a.id),
      bookings: d.bookings.filter(b => b.athlete_id === a.id)
    }))), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-block lsl-a-private"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-private__label"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "lock",
      size: 13
    }), " Private family notes \u2014 never shown to families"), /*#__PURE__*/React.createElement("textarea", {
      className: "lsl-textarea",
      "aria-label": "Private family notes",
      value: fam.notes_private,
      onChange: e => setFam(_objectSpread(_objectSpread({}, fam), {}, {
        notes_private: e.target.value
      })),
      style: {
        minHeight: 70
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-block"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-h4"
    }, "Booking & attendance history"), /*#__PURE__*/React.createElement("p", {
      className: "lsl-a-small lsl-a-muted",
      style: {
        marginTop: 0
      }
    }, A.plural(d.bookings.length, 'booking'), " \xB7 ", att.present || 0, " present \xB7 ", att.late || 0, " late \xB7 ", att.no_show || 0, " no-show"), /*#__PURE__*/React.createElement("ul", {
      className: "lsl-a-list"
    }, d.bookings.map(b => /*#__PURE__*/React.createElement("li", {
      key: b.id
    }, /*#__PURE__*/React.createElement("button", {
      className: "lsl-a-linkbtn",
      onClick: () => app.openBooking(b.id)
    }, b.date ? LSL.fmtDate(b.date) + ' · ' + LSL.fmtTime(b.time) : 'Request'), /*#__PURE__*/React.createElement("span", null, b.snapshot.service_name), /*#__PURE__*/React.createElement(StatusBadge, {
      kind: "booking",
      value: b.status
    }), b.kind === 'dated' && b.attendance !== 'not_recorded' && /*#__PURE__*/React.createElement(StatusBadge, {
      kind: "attendance",
      value: b.attendance
    }))))), app.isDirector && /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-block"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-h4"
    }, "Packages & credits"), d.packages.length === 0 ? /*#__PURE__*/React.createElement("p", {
      className: "lsl-a-muted lsl-a-small"
    }, "No packages.") : /*#__PURE__*/React.createElement("ul", {
      className: "lsl-a-list"
    }, d.packages.map(p => /*#__PURE__*/React.createElement("li", {
      key: p.id
    }, /*#__PURE__*/React.createElement("strong", null, p.snapshot.name), /*#__PURE__*/React.createElement(Badge, {
      tone: p.status === 'active' ? 'green' : 'muted'
    }, p.status.replace('_', ' ')), /*#__PURE__*/React.createElement("span", null, p.balance == null ? 'Unlimited' : p.balance + ' of ' + p.credits_total + ' left'), p.expires_on && /*#__PURE__*/React.createElement("span", {
      className: "lsl-a-muted"
    }, "expires ", LSL.fmtDate(p.expires_on))))), d.ledger.length > 0 && /*#__PURE__*/React.createElement(Expand, {
      title: "Credit history",
      icon: "list"
    }, /*#__PURE__*/React.createElement("ul", {
      className: "lsl-a-timeline"
    }, d.ledger.map(l => /*#__PURE__*/React.createElement("li", {
      key: l.id
    }, /*#__PURE__*/React.createElement("time", null, A.stamp(l.at)), /*#__PURE__*/React.createElement("span", null, l.reason, " ", l.delta > 0 ? '+' + l.delta : l.delta, l.note ? ' — ' + l.note : ''))))), pk.data && pk.data.packages.filter(p => p.active).length > 0 && /*#__PURE__*/React.createElement(Expand, {
      title: "Record a package sale",
      icon: "plus"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-grid"
    }, /*#__PURE__*/React.createElement(Field, {
      label: "Package"
    }, /*#__PURE__*/React.createElement("select", {
      className: "lsl-select",
      value: grant.package_id,
      onChange: e => {
        var p = pk.data.packages.find(x => x.id === e.target.value);
        setGrant(_objectSpread(_objectSpread({}, grant), {}, {
          package_id: e.target.value,
          amount: p ? (p.price_cents / 100).toFixed(2) : ''
        }));
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "Choose\u2026"), pk.data.packages.filter(p => p.active).map(p => /*#__PURE__*/React.createElement("option", {
      key: p.id,
      value: p.id
    }, p.name)))), /*#__PURE__*/React.createElement(Field, {
      label: "Amount paid ($)",
      hint: "0 if complimentary"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      inputMode: "decimal",
      value: grant.amount,
      onChange: e => setGrant(_objectSpread(_objectSpread({}, grant), {}, {
        amount: e.target.value
      }))
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Method"
    }, /*#__PURE__*/React.createElement("select", {
      className: "lsl-select",
      value: grant.method,
      onChange: e => setGrant(_objectSpread(_objectSpread({}, grant), {}, {
        method: e.target.value
      }))
    }, METHODS.map(_ref33 => {
      var _ref34 = _slicedToArray(_ref33, 2),
        k = _ref34[0],
        l = _ref34[1];
      return /*#__PURE__*/React.createElement("option", {
        key: k,
        value: k
      }, l);
    })))), /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--primary lsl-btn--xs",
      disabled: !grant.package_id || busy,
      onClick: () => run(() => A.api('POST', '/api/admin/families/' + id + '/packages', {
        package_id: grant.package_id,
        payment: {
          amount_cents: A.parseMoney(grant.amount) || 0,
          method: grant.method
        }
      }), 'Package added').then(app.changed)
    }, "Add package")), /*#__PURE__*/React.createElement(Expand, {
      title: "Merge with another family record",
      icon: "merge"
    }, /*#__PURE__*/React.createElement("p", {
      className: "lsl-a-muted lsl-a-small",
      style: {
        marginTop: 0
      }
    }, "Records are never merged automatically. Use this only when you're sure two records are the same family (e.g. a parent used two emails)."), /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      type: "search",
      placeholder: "Search by parent, athlete, or email",
      value: mergeQ,
      onChange: e => searchMerge(e.target.value),
      "aria-label": "Search families to merge"
    }), /*#__PURE__*/React.createElement("ul", {
      className: "lsl-a-list"
    }, mergeHits.map(h => /*#__PURE__*/React.createElement("li", {
      key: h.id
    }, /*#__PURE__*/React.createElement("span", null, h.parent_name, " \xB7 ", h.email, " \xB7 ", h.athletes), /*#__PURE__*/React.createElement("span", {
      className: "lsl-a-spacer"
    }), /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--xs",
      onClick: () => {
        if (window.confirm('Merge ' + h.parent_name + ' into this family? Their athletes, bookings, and packages move here.')) run(() => A.api('POST', '/api/admin/families/' + id + '/merge', {
          other_id: h.id
        }), 'Families merged').then(app.changed);
      }
    }, "Merge into this family")))))));
  }
  function AthleteRow(_ref35) {
    var a = _ref35.a,
      others = _ref35.others,
      bookings = _ref35.bookings;
    var app = A.useApp();
    var _useState87 = useState({
        name: a.name,
        grade: a.grade || '',
        goals: a.goals || '',
        notes_private: a.notes_private || ''
      }),
      _useState88 = _slicedToArray(_useState87, 2),
      v = _useState88[0],
      setV = _useState88[1];
    var _A$useAction9 = A.useAction(),
      _A$useAction0 = _slicedToArray(_A$useAction9, 2),
      busy = _A$useAction0[0],
      run = _A$useAction0[1];
    var dirty = v.name !== a.name || v.grade !== (a.grade || '') || v.goals !== (a.goals || '') || v.notes_private !== (a.notes_private || '');
    return /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-card",
      style: {
        padding: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-card__head",
      style: {
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("strong", null, a.name), /*#__PURE__*/React.createElement("span", {
      className: "lsl-a-muted lsl-a-small"
    }, A.plural(bookings.length, 'booking'))), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-grid"
    }, /*#__PURE__*/React.createElement(Field, {
      label: "Name"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      value: v.name,
      onChange: e => setV(_objectSpread(_objectSpread({}, v), {}, {
        name: e.target.value
      }))
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Grade / age"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      value: v.grade,
      onChange: e => setV(_objectSpread(_objectSpread({}, v), {}, {
        grade: e.target.value
      }))
    }))), /*#__PURE__*/React.createElement(Field, {
      label: "Training goals"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      value: v.goals,
      onChange: e => setV(_objectSpread(_objectSpread({}, v), {}, {
        goals: e.target.value
      }))
    })), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-private",
      style: {
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-private__label"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "lock",
      size: 12
    }), " Private notes on ", a.name), /*#__PURE__*/React.createElement("textarea", {
      className: "lsl-textarea",
      "aria-label": 'Private notes on ' + a.name,
      value: v.notes_private,
      onChange: e => setV(_objectSpread(_objectSpread({}, v), {}, {
        notes_private: e.target.value
      })),
      style: {
        minHeight: 56
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-row"
    }, dirty && /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--primary lsl-btn--xs",
      disabled: busy,
      onClick: () => run(() => A.api('PATCH', '/api/admin/athletes/' + a.id, v), 'Athlete saved').then(app.changed)
    }, "Save athlete"), app.isDirector && others.length > 0 && /*#__PURE__*/React.createElement("select", {
      className: "lsl-select",
      style: {
        width: 'auto'
      },
      value: "",
      "aria-label": 'Merge ' + a.name + ' into another athlete',
      onChange: e => {
        var o = others.find(x => x.id === e.target.value);
        if (o && window.confirm('Merge "' + a.name + '" into "' + o.name + '"? Bookings move to ' + o.name + '.')) run(() => A.api('POST', '/api/admin/athletes/' + a.id + '/merge', {
          into_id: o.id
        }), 'Athletes merged').then(app.changed);
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "Same person as\u2026"), others.map(o => /*#__PURE__*/React.createElement("option", {
      key: o.id,
      value: o.id
    }, o.name)))));
  }
  A.BookingDialog = BookingDialog;
  A.FamilyDrawer = FamilyDrawer;
  A.tabs = A.tabs || {};
  A.tabs.BooksTab = BooksTab;
})();