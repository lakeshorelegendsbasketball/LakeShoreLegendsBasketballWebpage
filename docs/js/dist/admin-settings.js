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
/* Coach dashboard — Settings tab. */
(function () {
  var _React = React,
    useState = _React.useState,
    useEffect = _React.useEffect;
  var A = window.LSLA;
  var Icon = A.Icon,
    Badge = A.Badge,
    Field = A.Field,
    Seg = A.Seg,
    Dialog = A.Dialog;
  var TZS = ['America/Chicago', 'America/New_York', 'America/Denver', 'America/Phoenix', 'America/Los_Angeles', 'America/Anchorage', 'Pacific/Honolulu'];
  var TEMPLATE_NAMES = {
    request_received: 'Request received',
    confirmation: 'Booking confirmed',
    reminder: 'Reminder',
    cancellation: 'Cancellation',
    reschedule: 'Rescheduled',
    approval: 'Request approved',
    decline: 'Request declined',
    offer: 'Times offered'
  };
  var PLACEHOLDERS = ['parent', 'athlete', 'service', 'date', 'time', 'timezone', 'coach', 'location', 'location_details', 'prep', 'policy', 'requested', 'previous', 'cancel_outcome', 'payment_step', 'offer_times', 'message'];

  /** A settings section: collapsible card with its own dirty/save state. */
  function Section(_ref) {
    var title = _ref.title,
      icon = _ref.icon,
      pick = _ref.pick,
      children = _ref.children,
      defaultOpen = _ref.defaultOpen,
      note = _ref.note;
    var app = A.useApp();
    var toast = A.useToast();
    var orig = pick(app.settings);
    var _useState = useState(orig),
      _useState2 = _slicedToArray(_useState, 2),
      v = _useState2[0],
      setV = _useState2[1];
    var _useState3 = useState({}),
      _useState4 = _slicedToArray(_useState3, 2),
      errs = _useState4[0],
      setErrs = _useState4[1];
    var _useState5 = useState(false),
      _useState6 = _slicedToArray(_useState5, 2),
      saving = _useState6[0],
      setSaving = _useState6[1];
    useEffect(() => {
      setV(pick(app.settings));
    }, [app.settings]);
    var dirty = JSON.stringify(v) !== JSON.stringify(orig);
    var save = /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(function* () {
        setSaving(true);
        setErrs({});
        try {
          yield A.api('PUT', '/api/admin/settings', v);
          toast(title + ' saved');
          yield app.reload();
        } catch (e) {
          setErrs(e.fields || {});
          toast(e.message, 'err');
        } finally {
          setSaving(false);
        }
      });
      return function save() {
        return _ref2.apply(this, arguments);
      };
    }();
    return /*#__PURE__*/React.createElement("details", {
      className: "lsl-a-expand lsl-a-section",
      open: defaultOpen
    }, /*#__PURE__*/React.createElement("summary", null, /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      className: "lsl-a-chev"
    }), /*#__PURE__*/React.createElement(Icon, {
      name: icon
    }), " ", title, dirty && /*#__PURE__*/React.createElement("span", {
      className: "lsl-a-inline-status is-dirty",
      style: {
        marginLeft: 8
      }
    }, "\u2022 unsaved")), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-expand__body"
    }, note, children(v, setV, errs), /*#__PURE__*/React.createElement(A.SaveBar, {
      dirty: dirty,
      saving: saving,
      onSave: save,
      onDiscard: () => {
        setV(orig);
        setErrs({});
      },
      label: 'Unsaved changes to ' + title.toLowerCase()
    })));
  }
  var num = (v, setV, k, sub) => e => {
    var n = e.target.value === '' ? '' : Number(e.target.value);
    if (sub) setV(_objectSpread(_objectSpread({}, v), {}, {
      [sub]: _objectSpread(_objectSpread({}, v[sub]), {}, {
        [k]: n
      })
    }));else setV(_objectSpread(_objectSpread({}, v), {}, {
      [k]: n
    }));
  };
  function SettingsTab() {
    var app = A.useApp();
    if (!app.isDirector) {
      return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(A.Banner, {
        tone: "info"
      }, "Program settings are managed by a director. You can change your own password below."), /*#__PURE__*/React.createElement(PasswordSection, null));
    }
    var locs = app.locations.filter(l => !l.archived_at);
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Section, {
      title: "Scheduling",
      icon: "calendar-cog",
      defaultOpen: true,
      pick: s => ({
        timezone: s.timezone,
        defaultDuration: s.defaultDuration,
        sameLocationBuffer: s.sameLocationBuffer,
        travelDefault: s.travelDefault,
        travel: s.travel,
        conflictAction: s.conflictAction,
        minNoticeHours: s.minNoticeHours,
        maxAdvanceDays: s.maxAdvanceDays,
        holdMinutes: s.holdMinutes
      })
    }, (v, setV, errs) => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-grid"
    }, /*#__PURE__*/React.createElement(Field, {
      label: "Time zone",
      error: errs.timezone,
      hint: "All dates and times use this zone, including daylight saving."
    }, /*#__PURE__*/React.createElement("select", {
      className: "lsl-select",
      value: v.timezone,
      onChange: e => setV(_objectSpread(_objectSpread({}, v), {}, {
        timezone: e.target.value
      }))
    }, [...new Set([v.timezone, ...TZS])].map(z => /*#__PURE__*/React.createElement("option", {
      key: z,
      value: z
    }, z.replace('_', ' '), " (", LSL.tzLabel(null, null, z), ")")))), /*#__PURE__*/React.createElement(Field, {
      label: "Default session length (min)",
      error: errs.defaultDuration
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      type: "number",
      value: v.defaultDuration,
      onChange: num(v, setV, 'defaultDuration')
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Minimum booking notice (hours)",
      error: errs.minNoticeHours,
      hint: "Openings sooner than this are hidden from families."
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      type: "number",
      value: v.minNoticeHours,
      onChange: num(v, setV, 'minNoticeHours')
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Book up to (days ahead)",
      error: errs.maxAdvanceDays
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      type: "number",
      value: v.maxAdvanceDays,
      onChange: num(v, setV, 'maxAdvanceDays')
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Checkout hold (minutes)",
      error: errs.holdMinutes,
      hint: "How long a time is held while a family pays in Stripe."
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      type: "number",
      value: v.holdMinutes,
      onChange: num(v, setV, 'holdMinutes')
    }))), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-h4",
      style: {
        marginTop: 18
      }
    }, "Buffers & travel"), /*#__PURE__*/React.createElement("p", {
      className: "lsl-a-muted lsl-a-small",
      style: {
        marginTop: 0
      }
    }, "Gaps are measured from the end of one session to the start of the next. Set real travel times yourself \u2014 they're not estimated."), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-grid"
    }, /*#__PURE__*/React.createElement(Field, {
      label: "Same location (min)",
      error: errs.sameLocationBuffer,
      hint: "0 = true back-to-back is allowed"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      type: "number",
      value: v.sameLocationBuffer,
      onChange: num(v, setV, 'sameLocationBuffer')
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Between locations \u2014 default (min)",
      error: errs.travelDefault
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      type: "number",
      value: v.travelDefault,
      onChange: num(v, setV, 'travelDefault')
    })), /*#__PURE__*/React.createElement(Field, {
      label: "When a booking conflicts with an opening"
    }, /*#__PURE__*/React.createElement("select", {
      className: "lsl-select",
      value: v.conflictAction,
      onChange: e => setV(_objectSpread(_objectSpread({}, v), {}, {
        conflictAction: e.target.value
      }))
    }, /*#__PURE__*/React.createElement("option", {
      value: "bump"
    }, "Move the opening to the next safe time"), /*#__PURE__*/React.createElement("option", {
      value: "delete"
    }, "Remove the opening")))), locs.length > 1 && /*#__PURE__*/React.createElement("div", {
      style: {
        overflowX: 'auto',
        marginTop: 12
      }
    }, /*#__PURE__*/React.createElement("table", {
      className: "lsl-a-matrix"
    }, /*#__PURE__*/React.createElement("caption", {
      className: "lsl-a-small lsl-a-muted",
      style: {
        textAlign: 'left',
        paddingBottom: 6
      }
    }, "Travel time for specific pairs (blank = default)"), /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
      scope: "col"
    }, "From"), /*#__PURE__*/React.createElement("th", {
      scope: "col"
    }, "To"), /*#__PURE__*/React.createElement("th", {
      scope: "col"
    }, "Minutes"))), /*#__PURE__*/React.createElement("tbody", null, locs.flatMap((a, i) => locs.slice(i + 1).map(b => {
      var _v$travel$key;
      var key = [a.id, b.id].sort().join('|');
      return /*#__PURE__*/React.createElement("tr", {
        key: key
      }, /*#__PURE__*/React.createElement("td", null, a.name), /*#__PURE__*/React.createElement("td", null, b.name), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("input", {
        className: "lsl-input",
        type: "number",
        min: "0",
        "aria-label": 'Travel minutes between ' + a.name + ' and ' + b.name,
        placeholder: String(v.travelDefault),
        value: (_v$travel$key = v.travel[key]) !== null && _v$travel$key !== void 0 ? _v$travel$key : '',
        onChange: e => setV(_objectSpread(_objectSpread({}, v), {}, {
          travel: _objectSpread(_objectSpread({}, v.travel), {}, {
            [key]: e.target.value === '' ? undefined : Number(e.target.value)
          })
        }))
      })));
    }))))))), /*#__PURE__*/React.createElement(Section, {
      title: "Cancellation & rescheduling",
      icon: "calendar-x",
      pick: s => ({
        cancellation: _objectSpread({}, s.cancellation)
      })
    }, (v, setV) => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-grid"
    }, /*#__PURE__*/React.createElement(Field, {
      label: "Full refund if canceled (hours ahead)"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      type: "number",
      value: v.cancellation.fullRefundHours,
      onChange: num(v, setV, 'fullRefundHours', 'cancellation')
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Late-cancel retainer (%)"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      type: "number",
      value: v.cancellation.lateRetainerPct,
      onChange: num(v, setV, 'lateRetainerPct', 'cancellation')
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Restore package credit if canceled (hours ahead)"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      type: "number",
      value: v.cancellation.creditRestoreHours,
      onChange: num(v, setV, 'creditRestoreHours', 'cancellation')
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Reschedule allowed until (hours ahead)"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      type: "number",
      value: v.cancellation.rescheduleHours,
      onChange: num(v, setV, 'rescheduleHours', 'cancellation')
    }))), /*#__PURE__*/React.createElement(Field, {
      label: "Policy shown to families (one line each)",
      hint: "Appears on the booking page and in emails. Keep it consistent with the numbers above."
    }, /*#__PURE__*/React.createElement("textarea", {
      className: "lsl-textarea",
      style: {
        minHeight: 90
      },
      value: (v.cancellation.policyLines || []).join('\n'),
      onChange: e => setV(_objectSpread(_objectSpread({}, v), {}, {
        cancellation: _objectSpread(_objectSpread({}, v.cancellation), {}, {
          policyLines: e.target.value.split('\n')
        })
      }))
    })), /*#__PURE__*/React.createElement("p", {
      className: "lsl-a-muted lsl-a-small"
    }, "These rules guide the cancel dialog. Refunds are never issued automatically."))), /*#__PURE__*/React.createElement(Section, {
      title: "Payment & confirmation",
      icon: "credit-card",
      pick: s => ({
        payment: _objectSpread({}, s.payment)
      })
    }, (v, setV) => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("label", {
      className: "lsl-a-check",
      style: {
        display: 'flex',
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "radio",
      name: "pm",
      checked: v.payment.mode === 'pay_to_confirm',
      onChange: () => setV({
        payment: {
          mode: 'pay_to_confirm'
        }
      })
    }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, "Payment confirms the booking"), " \u2014 the time is held during checkout and confirmed only when Stripe verifies payment. (Recommended)")), /*#__PURE__*/React.createElement("label", {
      className: "lsl-a-check",
      style: {
        display: 'flex'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "radio",
      name: "pm",
      checked: v.payment.mode === 'confirm_then_pay',
      onChange: () => setV({
        payment: {
          mode: 'confirm_then_pay'
        }
      })
    }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, "Confirm right away, pay after"), " \u2014 the booking is confirmed immediately and shows as Unpaid until payment arrives.")))), /*#__PURE__*/React.createElement(Section, {
      title: "Registration form",
      icon: "clipboard-list",
      pick: s => ({
        registration: JSON.parse(JSON.stringify(s.registration))
      })
    }, (v, setV) => {
      var setField = (k, patch) => setV({
        registration: _objectSpread(_objectSpread({}, v.registration), {}, {
          fields: _objectSpread(_objectSpread({}, v.registration.fields), {}, {
            [k]: _objectSpread(_objectSpread({}, v.registration.fields[k]), patch)
          })
        })
      });
      var acks = v.registration.acknowledgments || [];
      var setAcks = a => setV({
        registration: _objectSpread(_objectSpread({}, v.registration), {}, {
          acknowledgments: a
        })
      });
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", {
        className: "lsl-a-muted lsl-a-small",
        style: {
          marginTop: 0
        }
      }, "Parent name, athlete name, and email are always required."), Object.entries(v.registration.fields).map(_ref3 => {
        var _ref4 = _slicedToArray(_ref3, 2),
          k = _ref4[0],
          f = _ref4[1];
        return /*#__PURE__*/React.createElement("div", {
          key: k,
          className: "lsl-a-row",
          style: {
            marginBottom: 8
          }
        }, /*#__PURE__*/React.createElement("input", {
          className: "lsl-input",
          style: {
            flex: 1,
            minWidth: 180
          },
          value: f.label,
          onChange: e => setField(k, {
            label: e.target.value
          }),
          "aria-label": 'Label for ' + k
        }), /*#__PURE__*/React.createElement("label", {
          className: "lsl-a-check"
        }, /*#__PURE__*/React.createElement("input", {
          type: "checkbox",
          checked: f.show !== false,
          onChange: e => setField(k, {
            show: e.target.checked
          })
        }), " Show"), /*#__PURE__*/React.createElement("label", {
          className: "lsl-a-check"
        }, /*#__PURE__*/React.createElement("input", {
          type: "checkbox",
          checked: !!f.required,
          disabled: f.show === false,
          onChange: e => setField(k, {
            required: e.target.checked
          })
        }), " Required"));
      }), /*#__PURE__*/React.createElement("div", {
        className: "lsl-a-h4",
        style: {
          marginTop: 16
        }
      }, "Required acknowledgments"), acks.map((a, i) => /*#__PURE__*/React.createElement("div", {
        key: a.id,
        className: "lsl-a-row",
        style: {
          marginBottom: 8
        }
      }, /*#__PURE__*/React.createElement("input", {
        className: "lsl-input",
        style: {
          flex: 1,
          minWidth: 200
        },
        value: a.text,
        onChange: e => setAcks(acks.map((x, j) => j === i ? _objectSpread(_objectSpread({}, x), {}, {
          text: e.target.value
        }) : x)),
        "aria-label": 'Acknowledgment ' + (i + 1)
      }), /*#__PURE__*/React.createElement("label", {
        className: "lsl-a-check"
      }, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        checked: a.required,
        onChange: e => setAcks(acks.map((x, j) => j === i ? _objectSpread(_objectSpread({}, x), {}, {
          required: e.target.checked
        }) : x))
      }), " Required"), /*#__PURE__*/React.createElement("button", {
        className: "lsl-admin__del",
        "aria-label": "Remove acknowledgment",
        onClick: () => setAcks(acks.filter((_, j) => j !== i))
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "trash-2"
      })))), /*#__PURE__*/React.createElement("button", {
        className: "lsl-btn lsl-btn--ghost lsl-btn--xs",
        onClick: () => setAcks([...acks, {
          id: 'ack' + Date.now().toString(36),
          text: '',
          required: true
        }])
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "plus"
      }), " Add acknowledgment"));
    }), /*#__PURE__*/React.createElement(Section, {
      title: "Notifications",
      icon: "bell",
      pick: s => ({
        notifications: JSON.parse(JSON.stringify(s.notifications)),
        calendar: _objectSpread({}, s.calendar)
      }),
      note: app.integrations && !app.integrations.email.configured ? /*#__PURE__*/React.createElement(A.Banner, {
        tone: "warn"
      }, "Email isn't connected yet, so nothing is actually sent \u2014 each message is logged as \"skipped\". See Connections below.") : null
    }, (v, setV) => {
      var n = v.notifications;
      var setN = patch => setV(_objectSpread(_objectSpread({}, v), {}, {
        notifications: _objectSpread(_objectSpread({}, n), patch)
      }));
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        className: "lsl-a-checks",
        style: {
          flexDirection: 'column',
          gap: 8
        }
      }, /*#__PURE__*/React.createElement("label", {
        className: "lsl-a-check"
      }, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        checked: n.sendRequestReceipt,
        onChange: e => setN({
          sendRequestReceipt: e.target.checked
        })
      }), " Email families when a request is received (clearly says it's not confirmed)"), /*#__PURE__*/React.createElement("label", {
        className: "lsl-a-check"
      }, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        checked: n.sendConfirmation,
        onChange: e => setN({
          sendConfirmation: e.target.checked
        })
      }), " Email a confirmation when a booking is confirmed"), /*#__PURE__*/React.createElement("label", {
        className: "lsl-a-check"
      }, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        checked: n.sendReschedule,
        onChange: e => setN({
          sendReschedule: e.target.checked
        })
      }), " Allow reschedule emails"), /*#__PURE__*/React.createElement("label", {
        className: "lsl-a-check"
      }, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        checked: n.sendCancellation,
        onChange: e => setN({
          sendCancellation: e.target.checked
        })
      }), " Allow cancellation emails")), /*#__PURE__*/React.createElement("div", {
        className: "lsl-a-h4",
        style: {
          marginTop: 16
        }
      }, "Reminders"), n.reminders.map((r, i) => /*#__PURE__*/React.createElement("div", {
        key: i,
        className: "lsl-a-row",
        style: {
          marginBottom: 8
        }
      }, /*#__PURE__*/React.createElement("label", {
        className: "lsl-a-check"
      }, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        checked: r.enabled,
        onChange: e => setN({
          reminders: n.reminders.map((x, j) => j === i ? _objectSpread(_objectSpread({}, x), {}, {
            enabled: e.target.checked
          }) : x)
        })
      }), " Send"), /*#__PURE__*/React.createElement("input", {
        className: "lsl-input",
        type: "number",
        min: "1",
        max: "336",
        style: {
          width: 90
        },
        value: r.hoursBefore,
        "aria-label": "Hours before",
        onChange: e => setN({
          reminders: n.reminders.map((x, j) => j === i ? _objectSpread(_objectSpread({}, x), {}, {
            hoursBefore: Number(e.target.value)
          }) : x)
        })
      }), /*#__PURE__*/React.createElement("span", {
        className: "lsl-a-small"
      }, "hours before the session"), /*#__PURE__*/React.createElement("button", {
        className: "lsl-admin__del",
        "aria-label": "Remove reminder",
        onClick: () => setN({
          reminders: n.reminders.filter((_, j) => j !== i)
        })
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "trash-2"
      })))), n.reminders.length < 4 && /*#__PURE__*/React.createElement("button", {
        className: "lsl-btn lsl-btn--ghost lsl-btn--xs",
        onClick: () => setN({
          reminders: [...n.reminders, {
            hoursBefore: 2,
            enabled: true
          }]
        })
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "plus"
      }), " Add reminder"), /*#__PURE__*/React.createElement("p", {
        className: "lsl-a-muted lsl-a-small"
      }, "Each reminder is sent once per session time. A session booked inside the window doesn't get that reminder."), /*#__PURE__*/React.createElement("div", {
        className: "lsl-a-grid",
        style: {
          marginTop: 12
        }
      }, /*#__PURE__*/React.createElement(Field, {
        label: "From name"
      }, /*#__PURE__*/React.createElement("input", {
        className: "lsl-input",
        value: n.fromName,
        onChange: e => setN({
          fromName: e.target.value
        })
      })), /*#__PURE__*/React.createElement(Field, {
        label: "Reply-to email",
        hint: "Where family replies go"
      }, /*#__PURE__*/React.createElement("input", {
        className: "lsl-input",
        type: "email",
        value: n.replyTo,
        onChange: e => setN({
          replyTo: e.target.value
        })
      })), /*#__PURE__*/React.createElement(Field, {
        label: "Coach alert email",
        hint: "Get a copy of new bookings"
      }, /*#__PURE__*/React.createElement("input", {
        className: "lsl-input",
        type: "email",
        value: n.coachAlertEmail,
        onChange: e => setN({
          coachAlertEmail: e.target.value
        })
      })), /*#__PURE__*/React.createElement(Field, {
        label: "Coach name in emails & calendar"
      }, /*#__PURE__*/React.createElement("input", {
        className: "lsl-input",
        value: v.calendar.coachName,
        onChange: e => setV(_objectSpread(_objectSpread({}, v), {}, {
          calendar: _objectSpread(_objectSpread({}, v.calendar), {}, {
            coachName: e.target.value
          })
        }))
      }))));
    }), /*#__PURE__*/React.createElement(TemplatesSection, null), /*#__PURE__*/React.createElement(CoachesSection, null), /*#__PURE__*/React.createElement(ConnectionsSection, null), /*#__PURE__*/React.createElement(PasswordSection, null), /*#__PURE__*/React.createElement(ImportSection, null));
  }
  function TemplatesSection() {
    var app = A.useApp();
    var toast = A.useToast();
    var _useState7 = useState('confirmation'),
      _useState8 = _slicedToArray(_useState7, 2),
      kind = _useState8[0],
      setKind = _useState8[1];
    var orig = app.settings.templates[kind];
    var _useState9 = useState(orig),
      _useState0 = _slicedToArray(_useState9, 2),
      v = _useState0[0],
      setV = _useState0[1];
    var _useState1 = useState(null),
      _useState10 = _slicedToArray(_useState1, 2),
      preview = _useState10[0],
      setPreview = _useState10[1];
    var _useState11 = useState(false),
      _useState12 = _slicedToArray(_useState11, 2),
      busy = _useState12[0],
      setBusy = _useState12[1];
    useEffect(() => {
      setV(app.settings.templates[kind]);
      setPreview(null);
    }, [kind, app.settings]);
    var dirty = JSON.stringify(v) !== JSON.stringify(orig);
    var call = /*#__PURE__*/function () {
      var _ref5 = _asyncToGenerator(function* (fn) {
        setBusy(true);
        try {
          yield fn();
        } catch (e) {
          toast(e.message, 'err');
        } finally {
          setBusy(false);
        }
      });
      return function call(_x) {
        return _ref5.apply(this, arguments);
      };
    }();
    var doPreview = sendTest => call(/*#__PURE__*/_asyncToGenerator(function* () {
      var r = yield A.api('POST', '/api/admin/templates/preview', {
        kind,
        template: v,
        send_test: sendTest
      });
      setPreview(r);
      if (sendTest) toast(r.test.status === 'sent' ? 'Test sent to ' + app.me.email : 'Test not sent: ' + (r.test.detail || r.test.status), r.test.status === 'sent' ? 'ok' : 'err');
    }));
    var save = () => call(/*#__PURE__*/_asyncToGenerator(function* () {
      yield A.api('PUT', '/api/admin/settings', {
        templates: {
          [kind]: v
        }
      });
      toast('Template saved');
      yield app.reload();
    }));
    var reset = () => call(/*#__PURE__*/_asyncToGenerator(function* () {
      yield A.api('POST', '/api/admin/templates/' + kind + '/reset');
      toast('Template reset to default');
      yield app.reload();
    }));
    return /*#__PURE__*/React.createElement("details", {
      className: "lsl-a-expand lsl-a-section"
    }, /*#__PURE__*/React.createElement("summary", null, /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      className: "lsl-a-chev"
    }), /*#__PURE__*/React.createElement(Icon, {
      name: "mail"
    }), " Email templates"), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-expand__body"
    }, /*#__PURE__*/React.createElement(Field, {
      label: "Template"
    }, /*#__PURE__*/React.createElement("select", {
      className: "lsl-select",
      value: kind,
      onChange: e => {
        if (!dirty || window.confirm('Discard unsaved template changes?')) setKind(e.target.value);
      }
    }, Object.entries(TEMPLATE_NAMES).map(_ref9 => {
      var _ref0 = _slicedToArray(_ref9, 2),
        k = _ref0[0],
        l = _ref0[1];
      return /*#__PURE__*/React.createElement("option", {
        key: k,
        value: k
      }, l);
    }))), /*#__PURE__*/React.createElement(Field, {
      label: "Subject"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      value: v.subject,
      onChange: e => setV(_objectSpread(_objectSpread({}, v), {}, {
        subject: e.target.value
      }))
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Body",
      hint: 'Placeholders: ' + PLACEHOLDERS.map(p => '{{' + p + '}}').join(' ')
    }, /*#__PURE__*/React.createElement("textarea", {
      className: "lsl-textarea lsl-a-tpl",
      value: v.body,
      onChange: e => setV(_objectSpread(_objectSpread({}, v), {}, {
        body: e.target.value
      }))
    })), /*#__PURE__*/React.createElement("p", {
      className: "lsl-a-muted lsl-a-small"
    }, '{{location_details}}', " (facility, address, parking) is only filled in for confirmed bookings."), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-row"
    }, /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--xs",
      onClick: () => doPreview(false),
      disabled: busy
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "eye"
    }), " Preview"), /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--xs",
      onClick: () => doPreview(true),
      disabled: busy
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "send"
    }), " Send test to me"), /*#__PURE__*/React.createElement("button", {
      className: "lsl-a-linkbtn",
      onClick: reset,
      disabled: busy
    }, "Reset to default"), /*#__PURE__*/React.createElement("span", {
      className: "lsl-a-spacer"
    }), /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--primary lsl-btn--xs",
      onClick: save,
      disabled: busy || !dirty
    }, "Save template")), preview && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-h4"
    }, "Preview with sample data"), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-previewbox"
    }, /*#__PURE__*/React.createElement("strong", null, preview.subject), '\n\n', preview.body))));
  }
  function CoachesSection() {
    var app = A.useApp();
    var toast = A.useToast();
    var _useState13 = useState(false),
      _useState14 = _slicedToArray(_useState13, 2),
      adding = _useState14[0],
      setAdding = _useState14[1];
    var _useState15 = useState(null),
      _useState16 = _slicedToArray(_useState15, 2),
      edit = _useState16[0],
      setEdit = _useState16[1];
    return /*#__PURE__*/React.createElement("details", {
      className: "lsl-a-expand lsl-a-section"
    }, /*#__PURE__*/React.createElement("summary", null, /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      className: "lsl-a-chev"
    }), /*#__PURE__*/React.createElement(Icon, {
      name: "users"
    }), " Coaches & access"), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-expand__body"
    }, /*#__PURE__*/React.createElement(A.Banner, {
      tone: "info"
    }, /*#__PURE__*/React.createElement("strong", null, "Directors"), " see and manage everything, including payments, prices, and settings. ", /*#__PURE__*/React.createElement("strong", null, "Coaches"), " see only their own openings and assigned bookings (with family contact info and private notes for those), and can't see payment amounts, packages, or settings."), /*#__PURE__*/React.createElement("ul", {
      className: "lsl-a-list"
    }, app.coaches.map(c => /*#__PURE__*/React.createElement("li", {
      key: c.id
    }, /*#__PURE__*/React.createElement("strong", null, c.name), /*#__PURE__*/React.createElement("span", {
      className: "lsl-a-muted"
    }, c.email), /*#__PURE__*/React.createElement(Badge, {
      tone: c.role === 'director' ? 'navy' : 'sky'
    }, c.role), !c.active && /*#__PURE__*/React.createElement(Badge, {
      tone: "muted"
    }, "Deactivated"), /*#__PURE__*/React.createElement("span", {
      className: "lsl-a-spacer"
    }), /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--xs",
      onClick: () => setEdit(c)
    }, "Edit")))), /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--xs",
      style: {
        marginTop: 10
      },
      onClick: () => setAdding(true)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "user-plus"
    }), " Add coach")), (adding || edit) && /*#__PURE__*/React.createElement(CoachDialog, {
      c: edit,
      onClose: () => {
        setAdding(false);
        setEdit(null);
      }
    }));
  }
  function CoachDialog(_ref1) {
    var c = _ref1.c,
      onClose = _ref1.onClose;
    var app = A.useApp();
    var toast = A.useToast();
    var isNew = !c;
    var _useState17 = useState({
        name: c ? c.name : '',
        email: c ? c.email : '',
        role: c ? c.role : 'coach',
        phone: c ? c.phone || '' : '',
        bio: c ? c.bio || '' : '',
        password: '',
        active: c ? !!c.active : true
      }),
      _useState18 = _slicedToArray(_useState17, 2),
      v = _useState18[0],
      setV = _useState18[1];
    var _useState19 = useState(false),
      _useState20 = _slicedToArray(_useState19, 2),
      busy = _useState20[0],
      setBusy = _useState20[1];
    var _useState21 = useState(''),
      _useState22 = _slicedToArray(_useState21, 2),
      err = _useState22[0],
      setErr = _useState22[1];
    var save = /*#__PURE__*/function () {
      var _ref10 = _asyncToGenerator(function* () {
        setBusy(true);
        setErr('');
        try {
          if (isNew) yield A.api('POST', '/api/admin/users', v);else yield A.api('PATCH', '/api/admin/users/' + c.id, _objectSpread({
            name: v.name,
            role: v.role,
            phone: v.phone,
            bio: v.bio,
            active: v.active
          }, v.password ? {
            password: v.password
          } : {}));
          toast(isNew ? 'Coach added — share the temporary password with them privately' : 'Coach updated');
          yield app.reload();
          onClose();
        } catch (e) {
          setErr(e.message);
        } finally {
          setBusy(false);
        }
      });
      return function save() {
        return _ref10.apply(this, arguments);
      };
    }();
    return /*#__PURE__*/React.createElement(Dialog, {
      title: isNew ? 'Add coach' : 'Edit ' + c.name,
      onClose: onClose,
      busy: busy,
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
        className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
        onClick: onClose
      }, "Cancel"), /*#__PURE__*/React.createElement("button", {
        className: "lsl-btn lsl-btn--primary lsl-btn--sm",
        onClick: save,
        disabled: busy
      }, "Save"))
    }, /*#__PURE__*/React.createElement("div", {
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
      label: "Email"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      type: "email",
      value: v.email,
      disabled: !isNew,
      onChange: e => setV(_objectSpread(_objectSpread({}, v), {}, {
        email: e.target.value
      }))
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Phone"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      value: v.phone,
      onChange: e => setV(_objectSpread(_objectSpread({}, v), {}, {
        phone: e.target.value
      }))
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Access"
    }, /*#__PURE__*/React.createElement("select", {
      className: "lsl-select",
      value: v.role,
      disabled: c && c.id === app.me.id,
      onChange: e => setV(_objectSpread(_objectSpread({}, v), {}, {
        role: e.target.value
      }))
    }, /*#__PURE__*/React.createElement("option", {
      value: "coach"
    }, "Coach"), /*#__PURE__*/React.createElement("option", {
      value: "director"
    }, "Director")))), /*#__PURE__*/React.createElement(Field, {
      label: "Bio (optional)"
    }, /*#__PURE__*/React.createElement("textarea", {
      className: "lsl-textarea",
      value: v.bio,
      onChange: e => setV(_objectSpread(_objectSpread({}, v), {}, {
        bio: e.target.value
      })),
      style: {
        minHeight: 56
      }
    })), /*#__PURE__*/React.createElement(Field, {
      label: isNew ? 'Temporary password' : 'Reset password (optional)',
      hint: "At least 10 characters. Resetting signs them out everywhere."
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      type: "text",
      autoComplete: "new-password",
      value: v.password,
      onChange: e => setV(_objectSpread(_objectSpread({}, v), {}, {
        password: e.target.value
      }))
    })), !isNew && c.id !== app.me.id && /*#__PURE__*/React.createElement("label", {
      className: "lsl-a-check"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: v.active,
      onChange: e => setV(_objectSpread(_objectSpread({}, v), {}, {
        active: e.target.checked
      }))
    }), " Active (can sign in)"), err && /*#__PURE__*/React.createElement(A.Banner, {
      tone: "danger"
    }, err));
  }
  function ConnectionsSection() {
    var app = A.useApp();
    var toast = A.useToast();
    var i = app.integrations;
    if (!i) return null;
    var Row = _ref11 => {
      var ok = _ref11.ok,
        warn = _ref11.warn,
        label = _ref11.label,
        children = _ref11.children;
      return /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Badge, {
        tone: ok ? 'green' : warn ? 'warn' : 'danger',
        icon: ok ? 'circle-check' : warn ? 'triangle-alert' : 'circle-x'
      }, ok ? 'Connected' : warn ? 'Partial' : 'Not set up'), /*#__PURE__*/React.createElement("strong", null, label), /*#__PURE__*/React.createElement("span", {
        className: "lsl-a-small"
      }, children));
    };
    return /*#__PURE__*/React.createElement("details", {
      className: "lsl-a-expand lsl-a-section"
    }, /*#__PURE__*/React.createElement("summary", null, /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      className: "lsl-a-chev"
    }), /*#__PURE__*/React.createElement(Icon, {
      name: "plug"
    }), " Connections"), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-expand__body"
    }, /*#__PURE__*/React.createElement("ul", {
      className: "lsl-a-list"
    }, /*#__PURE__*/React.createElement(Row, {
      ok: i.stripe.webhook === 'configured',
      label: "Stripe payments"
    }, i.stripe.webhook === 'configured' ? /*#__PURE__*/React.createElement(React.Fragment, null, "Webhook active. ", i.stripe.last_event ? 'Last event ' + A.stamp(i.stripe.last_event.received_at) + ' (' + i.stripe.last_event.type + ').' : 'No events received yet.') : /*#__PURE__*/React.createElement(React.Fragment, null, "Payments can't be verified until the Stripe webhook secret is added. Until then, bookings stay \"Awaiting payment\".")), /*#__PURE__*/React.createElement(Row, {
      ok: i.stripe.api === 'configured',
      warn: i.stripe.api !== 'configured',
      label: "Stripe price check"
    }, i.stripe.api === 'configured' ? 'Read-only key in ' + i.stripe.mode + ' mode.' : 'Optional — add a read-only key to show live prices.'), /*#__PURE__*/React.createElement(Row, {
      ok: i.email.configured,
      label: "Family email"
    }, i.email.detail, i.email.failed_last_7_days ? ' ' + i.email.failed_last_7_days + ' failed in the last 7 days.' : ''), /*#__PURE__*/React.createElement(Row, {
      ok: !!i.scheduler.last_run,
      warn: !i.scheduler.last_run,
      label: "Reminders & hold expiry"
    }, i.scheduler.last_run ? 'Last ran ' + A.stamp(i.scheduler.last_run) + '.' : 'Hasn\'t run yet (runs every 10 minutes once deployed).'), /*#__PURE__*/React.createElement(Row, {
      ok: true,
      label: "Calendar files (.ics)"
    }, "Download buttons on every booking. Times are exported with the correct time zone.")), i.stripe.webhook_url && /*#__PURE__*/React.createElement("p", {
      className: "lsl-a-small"
    }, "Stripe webhook URL: ", /*#__PURE__*/React.createElement("span", {
      className: "lsl-a-mono"
    }, i.stripe.webhook_url), " ", /*#__PURE__*/React.createElement("button", {
      className: "lsl-a-linkbtn",
      onClick: () => A.copy(i.stripe.webhook_url, toast)
    }, "Copy"), /*#__PURE__*/React.createElement("br", null), "Events to send: ", /*#__PURE__*/React.createElement("span", {
      className: "lsl-a-mono"
    }, "checkout.session.completed, checkout.session.async_payment_succeeded, checkout.session.async_payment_failed, checkout.session.expired, charge.refunded")), /*#__PURE__*/React.createElement("p", {
      className: "lsl-a-muted lsl-a-small"
    }, "Secret keys are stored only on the server and are never shown here.")));
  }
  function PasswordSection() {
    var toast = A.useToast();
    var _useState23 = useState({
        current: '',
        next: '',
        confirm: ''
      }),
      _useState24 = _slicedToArray(_useState23, 2),
      v = _useState24[0],
      setV = _useState24[1];
    var _useState25 = useState(''),
      _useState26 = _slicedToArray(_useState25, 2),
      err = _useState26[0],
      setErr = _useState26[1];
    var _useState27 = useState(false),
      _useState28 = _slicedToArray(_useState27, 2),
      busy = _useState28[0],
      setBusy = _useState28[1];
    var save = /*#__PURE__*/function () {
      var _ref12 = _asyncToGenerator(function* () {
        setErr('');
        if (v.next !== v.confirm) {
          setErr('New passwords do not match.');
          return;
        }
        setBusy(true);
        try {
          var r = yield A.api('POST', '/api/auth/password', {
            current: v.current,
            next: v.next
          });
          A.setToken(r.token);
          setV({
            current: '',
            next: '',
            confirm: ''
          });
          toast('Password changed — other devices were signed out');
        } catch (e) {
          setErr(e.message);
        } finally {
          setBusy(false);
        }
      });
      return function save() {
        return _ref12.apply(this, arguments);
      };
    }();
    return /*#__PURE__*/React.createElement("details", {
      className: "lsl-a-expand lsl-a-section"
    }, /*#__PURE__*/React.createElement("summary", null, /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      className: "lsl-a-chev"
    }), /*#__PURE__*/React.createElement(Icon, {
      name: "key-round"
    }), " Your password"), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-expand__body"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-grid"
    }, /*#__PURE__*/React.createElement(Field, {
      label: "Current password"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      type: "password",
      autoComplete: "current-password",
      value: v.current,
      onChange: e => setV(_objectSpread(_objectSpread({}, v), {}, {
        current: e.target.value
      }))
    })), /*#__PURE__*/React.createElement(Field, {
      label: "New password",
      hint: "At least 10 characters"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      type: "password",
      autoComplete: "new-password",
      value: v.next,
      onChange: e => setV(_objectSpread(_objectSpread({}, v), {}, {
        next: e.target.value
      }))
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Confirm new password"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      type: "password",
      autoComplete: "new-password",
      value: v.confirm,
      onChange: e => setV(_objectSpread(_objectSpread({}, v), {}, {
        confirm: e.target.value
      }))
    }))), err && /*#__PURE__*/React.createElement("span", {
      className: "lsl-err",
      role: "alert"
    }, err), /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--primary lsl-btn--xs",
      style: {
        marginTop: 10
      },
      onClick: save,
      disabled: busy || !v.current || !v.next
    }, "Change password")));
  }

  /** One-time move of data from the old JSONbin storage. */
  function ImportSection() {
    var app = A.useApp();
    var toast = A.useToast();
    var _useState29 = useState({
        key: '',
        bin: '6a2799d5da38895dfe9dfaa8'
      }),
      _useState30 = _slicedToArray(_useState29, 2),
      v = _useState30[0],
      setV = _useState30[1];
    var _useState31 = useState(null),
      _useState32 = _slicedToArray(_useState31, 2),
      snap = _useState32[0],
      setSnap = _useState32[1];
    var _useState33 = useState(null),
      _useState34 = _slicedToArray(_useState33, 2),
      result = _useState34[0],
      setResult = _useState34[1];
    var _useState35 = useState(false),
      _useState36 = _slicedToArray(_useState35, 2),
      busy = _useState36[0],
      setBusy = _useState36[1];
    var _useState37 = useState(''),
      _useState38 = _slicedToArray(_useState37, 2),
      err = _useState38[0],
      setErr = _useState38[1];
    var fetchOld = /*#__PURE__*/function () {
      var _ref13 = _asyncToGenerator(function* () {
        setErr('');
        setBusy(true);
        setSnap(null);
        try {
          var res = yield fetch('https://api.jsonbin.io/v3/b/' + encodeURIComponent(v.bin.trim()) + '/latest', {
            headers: {
              'X-Master-Key': v.key.trim()
            }
          });
          if (!res.ok) throw new Error('JSONbin said ' + res.status + ' — check the key and bin ID.');
          setSnap((yield res.json()).record);
        } catch (e) {
          setErr(e.message);
        } finally {
          setBusy(false);
        }
      });
      return function fetchOld() {
        return _ref13.apply(this, arguments);
      };
    }();
    var doImport = /*#__PURE__*/function () {
      var _ref14 = _asyncToGenerator(function* () {
        setBusy(true);
        setErr('');
        try {
          var r = yield A.api('POST', '/api/admin/import-legacy', {
            snapshot: snap
          });
          setResult(r);
          toast('Import complete');
          app.reload();
          app.changed();
        } catch (e) {
          setErr(e.message);
        } finally {
          setBusy(false);
        }
      });
      return function doImport() {
        return _ref14.apply(this, arguments);
      };
    }();
    return /*#__PURE__*/React.createElement("details", {
      className: "lsl-a-expand lsl-a-section"
    }, /*#__PURE__*/React.createElement("summary", null, /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      className: "lsl-a-chev"
    }), /*#__PURE__*/React.createElement(Icon, {
      name: "database"
    }), " Import from the old booking system"), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-expand__body"
    }, /*#__PURE__*/React.createElement("p", {
      className: "lsl-a-small",
      style: {
        marginTop: 0
      }
    }, "Copies bookings, openings, session types, and locations from the old JSONbin storage. Safe to run more than once \u2014 nothing is duplicated. Imported bookings keep their details; payment shows as ", /*#__PURE__*/React.createElement("strong", null, "Unknown"), " because the old system never confirmed payments."), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-grid"
    }, /*#__PURE__*/React.createElement(Field, {
      label: "JSONbin master key",
      hint: "Used once in your browser; not saved."
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input lsl-a-mono",
      type: "password",
      autoComplete: "off",
      value: v.key,
      onChange: e => setV(_objectSpread(_objectSpread({}, v), {}, {
        key: e.target.value
      }))
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Bin ID"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input lsl-a-mono",
      value: v.bin,
      onChange: e => setV(_objectSpread(_objectSpread({}, v), {}, {
        bin: e.target.value
      }))
    }))), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-row"
    }, /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--xs",
      onClick: fetchOld,
      disabled: busy || !v.key
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "download"
    }), " Load old data"), snap && /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--primary lsl-btn--xs",
      onClick: doImport,
      disabled: busy
    }, "Import ", A.plural((snap.books || []).length, 'booking'), " and ", A.plural((snap.slots || []).length, 'opening'))), err && /*#__PURE__*/React.createElement(A.Banner, {
      tone: "danger"
    }, err), result && /*#__PURE__*/React.createElement(A.Banner, {
      tone: "ok"
    }, "Imported ", result.counts.bookings, " bookings, ", result.counts.slots, " openings, ", result.counts.types, " session types, ", result.counts.locations, " locations", result.counts.skipped ? ' (' + result.counts.skipped + ' unreadable rows skipped)' : '', ". After you've checked everything, delete the old bin in JSONbin and regenerate its key.")));
  }
  A.tabs = A.tabs || {};
  A.tabs.SettingsTab = SettingsTab;
})();