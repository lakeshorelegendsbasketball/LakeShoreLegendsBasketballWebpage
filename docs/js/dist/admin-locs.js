function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/* global React, LSL */
/* Coach dashboard — Locations tab. */
(function () {
  var _React = React,
    useState = _React.useState,
    useEffect = _React.useEffect;
  var A = window.LSLA;
  var Icon = A.Icon,
    Badge = A.Badge,
    Field = A.Field,
    Dialog = A.Dialog;
  var toForm = l => ({
    name: l.name || '',
    facility_name: l.facility_name || '',
    address: l.address || '',
    parking: l.parking || '',
    indoor_outdoor: l.indoor_outdoor || '',
    weather_notes: l.weather_notes || '',
    hours: l.hours || '',
    eligible_type_ids: l.eligible_type_ids || [],
    rental_cost: l.rental_cost_cents != null ? (l.rental_cost_cents / 100).toFixed(2) : '',
    rental_basis: l.rental_basis || ''
  });
  var toBody = v => _objectSpread(_objectSpread({}, v), {}, {
    rental_cost_cents: v.rental_cost === '' ? null : A.parseMoney(v.rental_cost),
    rental_cost: undefined,
    indoor_outdoor: v.indoor_outdoor || null,
    rental_basis: v.rental_basis || null
  });
  function LocsTab() {
    var app = A.useApp();
    var _A$useAction = A.useAction(),
      _A$useAction2 = _slicedToArray(_A$useAction, 2),
      busy = _A$useAction2[0],
      run = _A$useAction2[1];
    var _useState = useState(false),
      _useState2 = _slicedToArray(_useState, 2),
      showArchived = _useState2[0],
      setShowArchived = _useState2[1];
    var locs = app.locations.filter(l => showArchived || !l.archived_at);
    var archivedCount = app.locations.filter(l => l.archived_at).length;
    var add = () => run(() => A.api('POST', '/api/admin/locations', {
      name: 'New location'
    }), 'Location added — give it a name').then(app.reload);
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
      className: "lsl-body lsl-body--sm",
      style: {
        marginTop: 0,
        color: 'var(--fg3)'
      }
    }, "Use general areas/towns. Exact address can be shared privately once a booking is confirmed."), !app.isDirector && /*#__PURE__*/React.createElement(A.Banner, {
      tone: "info"
    }, "Only a director can edit locations."), locs.map(l => /*#__PURE__*/React.createElement(LocCard, {
      key: l.id,
      l: l
    })), app.isDirector && /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-row"
    }, /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
      onClick: add,
      disabled: busy
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "plus"
    }), " Add location"), archivedCount > 0 && /*#__PURE__*/React.createElement("button", {
      className: "lsl-a-linkbtn",
      onClick: () => setShowArchived(!showArchived)
    }, showArchived ? 'Hide' : 'Show', " ", archivedCount, " archived")));
  }
  function LocCard(_ref) {
    var l = _ref.l;
    var app = A.useApp();
    var toast = A.useToast();
    var _useState3 = useState(() => toForm(l)),
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
    var _useState9 = useState(null),
      _useState0 = _slicedToArray(_useState9, 2),
      decision = _useState0[0],
      setDecision = _useState0[1];
    var _useState1 = useState(false),
      _useState10 = _slicedToArray(_useState1, 2),
      archiveDlg = _useState10[0],
      setArchiveDlg = _useState10[1];
    useEffect(() => {
      setV(toForm(l));
    }, [l]);
    var orig = toForm(l);
    var dirty = JSON.stringify(v) !== JSON.stringify(orig);
    var set = k => e => setV(_objectSpread(_objectSpread({}, v), {}, {
      [k]: e.target.value
    }));
    var ro = !app.isDirector;
    var save = /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(function* (apply) {
        if (!v.name.trim()) {
          setErrs({
            name: 'Required'
          });
          return;
        }
        setSaving(true);
        setErrs({});
        try {
          yield A.api('PUT', '/api/admin/locations/' + l.id, _objectSpread(_objectSpread({}, toBody(v)), apply !== undefined ? {
            apply_to_upcoming: apply
          } : {}));
          toast('Location saved' + (apply ? ' — upcoming bookings updated' : ''));
          setDecision(null);
          app.reload();
        } catch (e) {
          if (e.status === 409 && e.data.needs_decision) setDecision(e.data.upcoming);else {
            setErrs(e.fields || {});
            toast(e.message, 'err');
          }
        } finally {
          setSaving(false);
        }
      });
      return function save(_x) {
        return _ref2.apply(this, arguments);
      };
    }();
    var restore = () => A.api('POST', '/api/admin/locations/' + l.id + '/archive', {
      archive: false
    }).then(() => {
      toast('Location restored');
      app.reload();
    }).catch(e => toast(e.message, 'err'));
    var hasPrivate = ['facility_name', 'address', 'parking', 'indoor_outdoor', 'weather_notes', 'hours'].some(k => v[k]);
    return /*#__PURE__*/React.createElement("div", {
      className: 'lsl-admin__card' + (l.archived_at ? ' is-inactive' : '')
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-card__head",
      style: {
        marginBottom: 6
      }
    }, l.archived_at ? /*#__PURE__*/React.createElement(Badge, {
      tone: "muted",
      icon: "archive"
    }, "Archived") : /*#__PURE__*/React.createElement(Badge, {
      tone: "green",
      icon: "circle-check"
    }, "Active"), l.indoor_outdoor && /*#__PURE__*/React.createElement(Badge, {
      tone: "muted",
      icon: l.indoor_outdoor === 'outdoor' ? 'sun' : 'house'
    }, l.indoor_outdoor)), /*#__PURE__*/React.createElement(Field, {
      label: "Area / Town",
      error: errs.name,
      hint: "Public \u2014 shown on the booking page"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      value: v.name,
      onChange: set('name'),
      placeholder: "Park Ridge, IL",
      readOnly: ro
    })), /*#__PURE__*/React.createElement(A.Expand, {
      title: 'Private facility details' + (hasPrivate ? '' : ' (none yet)'),
      icon: "lock"
    }, /*#__PURE__*/React.createElement("p", {
      className: "lsl-a-muted lsl-a-small",
      style: {
        marginTop: 0
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "lock",
      size: 12
    }), " Shared with families only in confirmation and reminder emails for confirmed bookings \u2014 never on the public site."), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-grid"
    }, /*#__PURE__*/React.createElement(Field, {
      label: "Facility name"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      value: v.facility_name,
      onChange: set('facility_name'),
      readOnly: ro,
      placeholder: "e.g. Maine South Fieldhouse"
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Indoor / outdoor"
    }, /*#__PURE__*/React.createElement("select", {
      className: "lsl-select",
      value: v.indoor_outdoor,
      onChange: set('indoor_outdoor'),
      disabled: ro
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "Not set"), /*#__PURE__*/React.createElement("option", {
      value: "indoor"
    }, "Indoor"), /*#__PURE__*/React.createElement("option", {
      value: "outdoor"
    }, "Outdoor"), /*#__PURE__*/React.createElement("option", {
      value: "both"
    }, "Both")))), /*#__PURE__*/React.createElement(Field, {
      label: "Street address"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      value: v.address,
      onChange: set('address'),
      readOnly: ro,
      autoComplete: "off"
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Parking & entrance instructions"
    }, /*#__PURE__*/React.createElement("textarea", {
      className: "lsl-textarea",
      value: v.parking,
      onChange: set('parking'),
      readOnly: ro,
      style: {
        minHeight: 56
      }
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Weather instructions",
      hint: "e.g. what happens if it rains for outdoor sessions"
    }, /*#__PURE__*/React.createElement("textarea", {
      className: "lsl-textarea",
      value: v.weather_notes,
      onChange: set('weather_notes'),
      readOnly: ro,
      style: {
        minHeight: 56
      }
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Available hours"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      value: v.hours,
      onChange: set('hours'),
      readOnly: ro,
      placeholder: "Weekdays 3\u20139 PM, weekends 8 AM\u20132 PM"
    })), app.isDirector && /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-grid"
    }, /*#__PURE__*/React.createElement(Field, {
      label: "Rental cost ($)",
      error: errs.rental_cost_cents
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      inputMode: "decimal",
      value: v.rental_cost,
      onChange: set('rental_cost')
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Charged"
    }, /*#__PURE__*/React.createElement("select", {
      className: "lsl-select",
      value: v.rental_basis,
      onChange: set('rental_basis')
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "Not set"), /*#__PURE__*/React.createElement("option", {
      value: "hourly"
    }, "Per hour"), /*#__PURE__*/React.createElement("option", {
      value: "per_session"
    }, "Per session")))), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-block",
      style: {
        marginTop: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-h4"
    }, "Services offered here"), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-checks"
    }, app.types.filter(t => !t.archived_at).map(t => /*#__PURE__*/React.createElement("label", {
      key: t.id,
      className: "lsl-a-check"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      disabled: ro,
      checked: v.eligible_type_ids.length === 0 || v.eligible_type_ids.includes(t.id),
      onChange: () => {
        var all = app.types.filter(x => !x.archived_at).map(x => x.id);
        var cur = v.eligible_type_ids.length ? v.eligible_type_ids : all;
        var next = cur.includes(t.id) ? cur.filter(x => x !== t.id) : [...cur, t.id];
        setV(_objectSpread(_objectSpread({}, v), {}, {
          eligible_type_ids: next.length === all.length ? [] : next
        }));
      }
    }), " ", t.name))))), app.isDirector && /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-row",
      style: {
        marginTop: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "lsl-a-spacer"
    }), l.archived_at ? /*#__PURE__*/React.createElement("button", {
      className: "lsl-admin__del lsl-admin__del--text",
      onClick: restore
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "archive-restore"
    }), " Restore") : /*#__PURE__*/React.createElement("button", {
      className: "lsl-admin__del lsl-admin__del--text",
      onClick: () => setArchiveDlg(true)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "archive"
    }), " Archive")), /*#__PURE__*/React.createElement(A.SaveBar, {
      dirty: dirty,
      saving: saving,
      onSave: () => save(),
      onDiscard: () => setV(orig),
      label: 'Unsaved changes to ' + (l.name || 'location')
    }), decision && /*#__PURE__*/React.createElement(Dialog, {
      title: "Upcoming appointments are affected",
      onClose: () => setDecision(null),
      busy: saving,
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
        className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
        onClick: () => setDecision(null)
      }, "Cancel"), /*#__PURE__*/React.createElement("button", {
        className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
        onClick: () => save(false),
        disabled: saving
      }, "Keep their current details"), /*#__PURE__*/React.createElement("button", {
        className: "lsl-btn lsl-btn--primary lsl-btn--sm",
        onClick: () => save(true),
        disabled: saving
      }, "Update their details"))
    }, /*#__PURE__*/React.createElement("p", {
      className: "lsl-body lsl-body--sm",
      style: {
        marginTop: 0
      }
    }, A.plural(decision.length, 'upcoming booking'), " at this location. Should their booking details (used in reminder emails) switch to the new information? Past bookings always keep what they had."), /*#__PURE__*/React.createElement("ul", {
      className: "lsl-a-list"
    }, decision.map(b => /*#__PURE__*/React.createElement("li", {
      key: b.id
    }, LSL.fmtDate(b.date), " \xB7 ", LSL.fmtTime(b.time), " \xB7 ", b.athlete))), /*#__PURE__*/React.createElement("p", {
      className: "lsl-a-muted lsl-a-small"
    }, "No emails are sent from here. Appointments are not moved.")), archiveDlg && /*#__PURE__*/React.createElement(ArchiveDialog, {
      l: l,
      onClose: () => setArchiveDlg(false)
    }));
  }
  function ArchiveDialog(_ref3) {
    var l = _ref3.l,
      onClose = _ref3.onClose;
    var app = A.useApp();
    var toast = A.useToast();
    var q = A.useFetch('/api/admin/locations/' + l.id + '/impact');
    var _useState11 = useState('remove'),
      _useState12 = _slicedToArray(_useState11, 2),
      open = _useState12[0],
      setOpen = _useState12[1];
    var _useState13 = useState(false),
      _useState14 = _slicedToArray(_useState13, 2),
      ack = _useState14[0],
      setAck = _useState14[1];
    var _useState15 = useState(false),
      _useState16 = _slicedToArray(_useState15, 2),
      busy = _useState16[0],
      setBusy = _useState16[1];
    var imp = q.data;
    var submit = /*#__PURE__*/function () {
      var _ref4 = _asyncToGenerator(function* () {
        setBusy(true);
        try {
          var r = yield A.api('POST', '/api/admin/locations/' + l.id + '/archive', {
            archive: true,
            open_slots: open,
            acknowledge_bookings: ack
          });
          toast('Location archived' + (r.kept_bookings ? ' — ' + A.plural(r.kept_bookings, 'booking') + ' still scheduled there' : ''));
          app.reload();
          onClose();
        } catch (e) {
          toast(e.message, 'err');
        } finally {
          setBusy(false);
        }
      });
      return function submit() {
        return _ref4.apply(this, arguments);
      };
    }();
    return /*#__PURE__*/React.createElement(Dialog, {
      title: 'Archive ' + l.name + '?',
      onClose: onClose,
      busy: busy,
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
        className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
        onClick: onClose
      }, "Cancel"), /*#__PURE__*/React.createElement("button", {
        className: "lsl-btn lsl-btn--primary lsl-btn--sm",
        onClick: submit,
        disabled: busy || !imp || imp.bookings.length > 0 && !ack
      }, "Archive"))
    }, !imp ? /*#__PURE__*/React.createElement(A.Loading, null) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", {
      className: "lsl-body lsl-body--sm",
      style: {
        marginTop: 0
      }
    }, "Families won't be able to pick this location. Past bookings keep their location details."), imp.open_slots > 0 && /*#__PURE__*/React.createElement("fieldset", {
      style: {
        border: 0,
        padding: 0,
        margin: '0 0 14px'
      }
    }, /*#__PURE__*/React.createElement("legend", {
      className: "lsl-a-h4"
    }, A.plural(imp.open_slots, 'future opening'), " here"), /*#__PURE__*/React.createElement("label", {
      className: "lsl-a-check",
      style: {
        display: 'flex',
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "radio",
      name: "open",
      checked: open === 'remove',
      onChange: () => setOpen('remove')
    }), " Delete them"), /*#__PURE__*/React.createElement("label", {
      className: "lsl-a-check",
      style: {
        display: 'flex'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "radio",
      name: "open",
      checked: open === 'keep',
      onChange: () => setOpen('keep')
    }), " Keep them (hidden from families while archived)")), imp.bookings.length > 0 && /*#__PURE__*/React.createElement(A.Banner, {
      tone: "warn"
    }, /*#__PURE__*/React.createElement("strong", null, A.plural(imp.bookings.length, 'upcoming booking')), " are scheduled here. They will ", /*#__PURE__*/React.createElement("strong", null, "not"), " be moved or canceled.", /*#__PURE__*/React.createElement("ul", {
      className: "lsl-a-list"
    }, imp.bookings.map(b => /*#__PURE__*/React.createElement("li", {
      key: b.id
    }, LSL.fmtDate(b.date), " \xB7 ", LSL.fmtTime(b.time), " \xB7 ", b.athlete))), /*#__PURE__*/React.createElement("label", {
      className: "lsl-a-check"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: ack,
      onChange: e => setAck(e.target.checked)
    }), " I'll handle these bookings myself (reschedule or keep them here)"))));
  }
  A.tabs = A.tabs || {};
  A.tabs.LocsTab = LocsTab;
})();