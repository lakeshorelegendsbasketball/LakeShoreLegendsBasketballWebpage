"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
/* global React, SectionHead, LSL */
var _React = React,
  useStateBk = _React.useState,
  useEffectBk = _React.useEffect;
var LSL_POLICY = 'Cancellations made within 48 hours of a session are subject to a 50% retainer. Cancellations made more than 48 hours in advance receive a 100% refund. Training session times and availability are subject to change.';
var DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var pad2 = function pad2(n) {
  return String(n).padStart(2, '0');
};
var isoOf = function isoOf(dt) {
  return dt.getFullYear() + '-' + pad2(dt.getMonth() + 1) + '-' + pad2(dt.getDate());
};

/* Three public services. "dated" services use the posted-opening calendar and
   forward to Stripe. The "request" service collects a day-of-week + time
   preference and emails the coach + family — no payment. */
var SERVICES = [{
  key: '1on1',
  name: '1-on-1 Private Training Session',
  icon: 'user',
  meta: 'One athlete · 60 min',
  mode: 'dated',
  typeId: 'p1'
}, {
  key: 'small',
  name: 'Small Group Training Session',
  icon: 'users',
  meta: 'Bring your own group',
  mode: 'request'
}, {
  key: 'class',
  name: 'Group Basketball Classes',
  icon: 'graduation-cap',
  meta: 'Open enrollment',
  mode: 'soon',
  typeId: 'p4'
}];
var REQ_TIMES = function () {
  var out = [];
  for (var h = 8; h <= 20; h++) for (var _i = 0, _arr = ['00', '30']; _i < _arr.length; _i++) {
    var m = _arr[_i];
    out.push(pad2(h) + ':' + m);
  }
  return out;
}();
function notifyCoach(_x) {
  return _notifyCoach.apply(this, arguments);
}
function _notifyCoach() {
  _notifyCoach = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(rec) {
    var key, type, base, extra, loc, _t;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.p = _context2.n) {
        case 0:
          key = LSL.getWeb3Key();
          if (key) {
            _context2.n = 1;
            break;
          }
          return _context2.a(2);
        case 1:
          type = LSL.typeById(rec.typeId);
          base = {
            access_key: key,
            from_name: 'LakeShore Legends Booking',
            replyto: rec.email,
            Parent_Guardian: rec.parent,
            Athlete: rec.athlete,
            Age_Grade: rec.age || '—',
            Email: rec.email,
            Phone: rec.phone || '—',
            Focus: rec.focus || '—',
            Notes: rec.notes || '—'
          };
          if (rec.mode === 'request') {
            extra = {
              subject: 'New Class Request — ' + rec.athlete + ' (' + rec.serviceName + ')',
              Service: rec.serviceName,
              Players_In_Group: rec.players,
              Preferred_Day: DOW[rec.dow],
              Preferred_Time: LSL.fmtTime(rec.reqTime)
            };
          } else {
            loc = LSL.locById(rec.locId);
            extra = {
              subject: 'New Booking — ' + rec.athlete + ' (' + LSL.fmtDate(rec.date) + ')',
              Service: rec.serviceName,
              Date: LSL.fmtDateLong(rec.date),
              Time: LSL.fmtTime(rec.time),
              Location: loc.name
            };
          }
          _context2.p = 2;
          _context2.n = 3;
          return fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json'
            },
            body: JSON.stringify(Object.assign(base, extra))
          });
        case 3:
          _context2.n = 5;
          break;
        case 4:
          _context2.p = 4;
          _t = _context2.v;
        case 5:
          return _context2.a(2);
      }
    }, _callee2, null, [[2, 4]]);
  }));
  return _notifyCoach.apply(this, arguments);
}
function PrivateBooking() {
  var _useStateBk = useStateBk(null),
    _useStateBk2 = _slicedToArray(_useStateBk, 2),
    service = _useStateBk2[0],
    setService = _useStateBk2[1];
  var _useStateBk3 = useStateBk(null),
    _useStateBk4 = _slicedToArray(_useStateBk3, 2),
    players = _useStateBk4[0],
    setPlayers = _useStateBk4[1];
  var _useStateBk5 = useStateBk(0),
    _useStateBk6 = _slicedToArray(_useStateBk5, 2),
    offset = _useStateBk6[0],
    setOffset = _useStateBk6[1];
  var _useStateBk7 = useStateBk(null),
    _useStateBk8 = _slicedToArray(_useStateBk7, 2),
    date = _useStateBk8[0],
    setDate = _useStateBk8[1];
  var _useStateBk9 = useStateBk(null),
    _useStateBk0 = _slicedToArray(_useStateBk9, 2),
    dow = _useStateBk0[0],
    setDow = _useStateBk0[1];
  var _useStateBk1 = useStateBk(null),
    _useStateBk10 = _slicedToArray(_useStateBk1, 2),
    slotId = _useStateBk10[0],
    setSlotId = _useStateBk10[1];
  var _useStateBk11 = useStateBk(''),
    _useStateBk12 = _slicedToArray(_useStateBk11, 2),
    reqTime = _useStateBk12[0],
    setReqTime = _useStateBk12[1];
  var _useStateBk13 = useStateBk(false),
    _useStateBk14 = _slicedToArray(_useStateBk13, 2),
    formOpen = _useStateBk14[0],
    setFormOpen = _useStateBk14[1];
  useEffectBk(function () {
    if (window.lucide) window.lucide.createIcons();
  });
  var todayIso = isoOf(new Date());
  var openSlots = LSL.getSlots().filter(function (s) {
    return s.status === 'open' && s.date >= todayIso;
  });
  var openDates = new Set(openSlots.map(function (s) {
    return s.date;
  }));
  var pickService = function pickService(s) {
    setService(s);
    setPlayers(null);
    setDate(null);
    setDow(null);
    setSlotId(null);
    setReqTime('');
    setOffset(0);
  };
  var pickDate = function pickDate(iso) {
    setDate(iso);
    setSlotId(null);
  };
  var pickDow = function pickDow(d) {
    setDow(d);
    setReqTime('');
  };
  var daySlots = date ? openSlots.filter(function (s) {
    return s.date === date;
  }).sort(function (a, b) {
    return a.time.localeCompare(b.time);
  }) : [];
  var byLoc = {};
  daySlots.forEach(function (s) {
    (byLoc[s.locId] = byLoc[s.locId] || []).push(s);
  });
  var isReq = service && service.mode === 'request';
  var isSoon = service && service.mode === 'soon';
  var col2Head = isReq ? 'Select a Day' : 'Select a Date';
  var col3Head = isReq ? 'Request a Time' : 'Available Times';

  // build descriptor for the form
  var desc = null;
  if (isReq && dow != null && reqTime) desc = {
    mode: 'request',
    serviceName: service.name,
    players: players,
    dow: dow,
    reqTime: reqTime
  };else if (service && !isReq && slotId) desc = {
    mode: 'dated',
    serviceName: service.name,
    typeId: service.typeId,
    slotId: slotId
  };
  return /*#__PURE__*/React.createElement("section", {
    className: "lsl-section lsl-section--cream",
    id: "book",
    style: {
      paddingTop: '44px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-wrap"
  }, /*#__PURE__*/React.createElement(SectionHead, {
    center: true,
    wide: true,
    eyebrow: "Private Training",
    title: "Book a Session With Coach Gio",
    sub: "Check out our availability and book the date and time that works for you."
  }), /*#__PURE__*/React.createElement("div", {
    className: "lsl-sched"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-sched__col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-sched__head"
  }, "Service Offerings"), /*#__PURE__*/React.createElement("div", {
    className: "lsl-svclist"
  }, SERVICES.map(function (s) {
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: s.key
    }, /*#__PURE__*/React.createElement("button", {
      className: 'lsl-svc' + (service && service.key === s.key ? ' is-sel' : ''),
      onClick: function onClick() {
        return pickService(s);
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "lsl-svc__ico"
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": s.icon
    })), /*#__PURE__*/React.createElement("span", {
      className: "lsl-svc__body"
    }, /*#__PURE__*/React.createElement("span", {
      className: "lsl-svc__name"
    }, s.name), /*#__PURE__*/React.createElement("span", {
      className: "lsl-svc__meta"
    }, s.meta)), /*#__PURE__*/React.createElement("i", {
      "data-lucide": "chevron-right",
      className: "lsl-svc__chev"
    })), s.key === 'small' && service && service.key === 'small' && /*#__PURE__*/React.createElement("div", {
      className: "lsl-svcsub"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-svcsub__q"
    }, "How many players do you have in your group?"), /*#__PURE__*/React.createElement("div", {
      className: "lsl-svcsub__opts"
    }, ['2', '3', '4', '5', '6+'].map(function (n) {
      return /*#__PURE__*/React.createElement("button", {
        key: n,
        className: 'lsl-countchip' + (players === n ? ' is-sel' : ''),
        onClick: function onClick() {
          setPlayers(n);
          setDow(null);
          setReqTime('');
        }
      }, n);
    }))));
  }))), /*#__PURE__*/React.createElement("div", {
    className: "lsl-sched__col lsl-sched__col--border"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-sched__head"
  }, col2Head), !service && /*#__PURE__*/React.createElement("div", {
    className: "lsl-sched__ph"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "arrow-left"
  }), " Choose a service to begin."), isSoon && /*#__PURE__*/React.createElement("div", {
    className: "lsl-soon"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "clock"
  }), /*#__PURE__*/React.createElement("div", {
    className: "lsl-soon__title"
  }, "Coming Soon!"), /*#__PURE__*/React.createElement("p", {
    className: "lsl-soon__sub"
  }, "Group basketball classes are launching soon. Check back for dates and times.")), service && !isReq && !isSoon && /*#__PURE__*/React.createElement(Calendar, {
    offset: offset,
    onOffset: setOffset,
    openDates: openDates,
    selected: date,
    onPick: pickDate,
    todayIso: todayIso
  }), isReq && !players && /*#__PURE__*/React.createElement("div", {
    className: "lsl-sched__ph"
  }, "Select your group size first."), isReq && players && /*#__PURE__*/React.createElement("div", {
    className: "lsl-dows"
  }, DOW.map(function (d, i) {
    return /*#__PURE__*/React.createElement("button", {
      key: d,
      className: 'lsl-dow' + (dow === i ? ' is-sel' : ''),
      onClick: function onClick() {
        return pickDow(i);
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "lsl-dow__d"
    }, d), /*#__PURE__*/React.createElement("i", {
      "data-lucide": "chevron-right"
    }));
  }))), /*#__PURE__*/React.createElement("div", {
    className: "lsl-sched__col lsl-sched__col--border"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-sched__head"
  }, col3Head), isSoon && /*#__PURE__*/React.createElement("div", {
    className: "lsl-sched__ph"
  }, "Stay tuned \u2014 enrollment opens soon."), service && !isReq && !isSoon && !date && /*#__PURE__*/React.createElement("div", {
    className: "lsl-sched__ph"
  }, "Pick a date with a dot to see open times."), service && !isReq && !isSoon && date && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "lsl-times__day"
  }, LSL.fmtDateLong(date)), daySlots.length === 0 && /*#__PURE__*/React.createElement("p", {
    className: "lsl-body lsl-body--sm",
    style: {
      color: 'var(--fg3)'
    }
  }, "No open times this day."), Object.keys(byLoc).map(function (lid) {
    return /*#__PURE__*/React.createElement("div", {
      className: "lsl-times__group",
      key: lid
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-times__loc"
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "map-pin"
    }), LSL.locById(lid).name), /*#__PURE__*/React.createElement("div", {
      className: "lsl-times__row"
    }, byLoc[lid].map(function (s) {
      return /*#__PURE__*/React.createElement("button", {
        key: s.id,
        className: 'lsl-time' + (slotId === s.id ? ' is-sel' : ''),
        onClick: function onClick() {
          return setSlotId(s.id);
        }
      }, LSL.fmtTime(s.time));
    })));
  })), isReq && dow == null && /*#__PURE__*/React.createElement("div", {
    className: "lsl-sched__ph"
  }, players ? 'Pick a day of the week first.' : 'Choose group size and a day.'), isReq && dow != null && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "lsl-times__day"
  }, DOW[dow], "s"), /*#__PURE__*/React.createElement("label", {
    className: "lsl-times__lbl"
  }, "What time works best?"), /*#__PURE__*/React.createElement("select", {
    className: "lsl-select",
    value: reqTime,
    onChange: function onChange(e) {
      return setReqTime(e.target.value);
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Select a preferred time\u2026"), REQ_TIMES.map(function (t) {
    return /*#__PURE__*/React.createElement("option", {
      key: t,
      value: t
    }, LSL.fmtTime(t));
  })), /*#__PURE__*/React.createElement("p", {
    className: "lsl-body lsl-body--sm",
    style: {
      color: 'var(--fg3)',
      marginTop: 10
    }
  }, "This is a request \u2014 Coach Gio will confirm the time by email.")), desc && /*#__PURE__*/React.createElement("button", {
    className: "lsl-btn lsl-btn--primary lsl-times__req",
    onClick: function onClick() {
      return setFormOpen(true);
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "calendar-check"
  }), " Request Booking"))), /*#__PURE__*/React.createElement("p", {
    className: "lsl-bookpolicy"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "info"
  }), LSL_POLICY)), formOpen && desc && /*#__PURE__*/React.createElement(BookingForm, {
    desc: desc,
    onClose: function onClose() {
      return setFormOpen(false);
    },
    onBooked: function onBooked() {
      setSlotId(null);
      setDate(null);
      setReqTime('');
      setDow(null);
    }
  }));
}
function Calendar(_ref) {
  var offset = _ref.offset,
    onOffset = _ref.onOffset,
    openDates = _ref.openDates,
    selected = _ref.selected,
    onPick = _ref.onPick,
    todayIso = _ref.todayIso;
  useEffectBk(function () {
    if (window.lucide) window.lucide.createIcons();
  });
  var today = new Date();
  var base = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  var y = base.getFullYear(),
    m = base.getMonth();
  var firstDow = new Date(y, m, 1).getDay();
  var days = new Date(y, m + 1, 0).getDate();
  var cells = [];
  for (var i = 0; i < firstDow; i++) cells.push(null);
  for (var d = 1; d <= days; d++) cells.push(d);
  var monthName = base.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });
  var dows = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return /*#__PURE__*/React.createElement("div", {
    className: "lsl-cal"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-cal__nav"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return onOffset(Math.max(0, offset - 1));
    },
    disabled: offset <= 0,
    "aria-label": "Previous month"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "chevron-left"
  })), /*#__PURE__*/React.createElement("span", {
    className: "lsl-cal__month"
  }, monthName), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return onOffset(offset + 1);
    },
    "aria-label": "Next month"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "chevron-right"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "lsl-cal__dows"
  }, dows.map(function (d) {
    return /*#__PURE__*/React.createElement("span", {
      key: d
    }, d);
  })), /*#__PURE__*/React.createElement("div", {
    className: "lsl-cal__grid"
  }, cells.map(function (d, i) {
    if (d === null) return /*#__PURE__*/React.createElement("span", {
      key: 'b' + i,
      className: "lsl-cal__cell is-empty"
    });
    var iso = y + '-' + pad2(m + 1) + '-' + pad2(d);
    var hasOpen = openDates.has(iso);
    var isPast = iso < todayIso;
    var can = hasOpen && !isPast;
    return /*#__PURE__*/React.createElement("button", {
      key: iso,
      disabled: !can,
      className: 'lsl-cal__cell' + (can ? ' is-open' : '') + (selected === iso ? ' is-sel' : ''),
      onClick: function onClick() {
        return can && onPick(iso);
      }
    }, d, can && /*#__PURE__*/React.createElement("span", {
      className: "lsl-cal__dot"
    }));
  })));
}
function BookingForm(_ref2) {
  var desc = _ref2.desc,
    onClose = _ref2.onClose,
    onBooked = _ref2.onBooked;
  var _useStateBk15 = useStateBk({
      parent: '',
      athlete: '',
      age: '',
      email: '',
      phone: '',
      focus: '',
      notes: ''
    }),
    _useStateBk16 = _slicedToArray(_useStateBk15, 2),
    form = _useStateBk16[0],
    setForm = _useStateBk16[1];
  var _useStateBk17 = useStateBk({}),
    _useStateBk18 = _slicedToArray(_useStateBk17, 2),
    errs = _useStateBk18[0],
    setErrs = _useStateBk18[1];
  var _useStateBk19 = useStateBk(false),
    _useStateBk20 = _slicedToArray(_useStateBk19, 2),
    busy = _useStateBk20[0],
    setBusy = _useStateBk20[1];
  var _useStateBk21 = useStateBk(null),
    _useStateBk22 = _slicedToArray(_useStateBk21, 2),
    result = _useStateBk22[0],
    setResult = _useStateBk22[1];
  useEffectBk(function () {
    if (window.lucide) window.lucide.createIcons();
  }, [result]);
  useEffectBk(function () {
    var onKey = function onKey(e) {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return function () {
      return window.removeEventListener('keydown', onKey);
    };
  }, []);
  var isReq = desc.mode === 'request';
  var type = isReq ? {} : LSL.typeById(desc.typeId);
  var slot = isReq ? {} : LSL.getSlots().find(function (s) {
    return s.id === desc.slotId;
  }) || {};
  var loc = isReq ? {} : LSL.locById(slot.locId);
  var set = function set(k) {
    return function (e) {
      return setForm(_objectSpread(_objectSpread({}, form), {}, _defineProperty({}, k, e.target.value)));
    };
  };
  function validate() {
    var e = {};
    if (!form.parent.trim()) e.parent = 'Required';
    if (!form.athlete.trim()) e.athlete = 'Required';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = 'Enter a valid email';
    setErrs(e);
    return Object.keys(e).length === 0;
  }
  function submit(_x2) {
    return _submit.apply(this, arguments);
  } // dated bookings forward to Stripe after the confirmation screen
  function _submit() {
    _submit = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(e) {
      var rec, slots, sIdx;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.n) {
          case 0:
            e.preventDefault();
            if (validate()) {
              _context.n = 1;
              break;
            }
            return _context.a(2);
          case 1:
            setBusy(true);
            if (!isReq) {
              _context.n = 2;
              break;
            }
            rec = {
              id: LSL.uid(),
              mode: 'request',
              serviceName: desc.serviceName,
              players: desc.players,
              dow: desc.dow,
              reqTime: desc.reqTime,
              parent: form.parent,
              athlete: form.athlete,
              age: form.age,
              email: form.email,
              phone: form.phone,
              focus: form.focus,
              notes: form.notes,
              created: new Date().toISOString(),
              status: 'requested'
            };
            LSL.setBooks([].concat(_toConsumableArray(LSL.getBooks()), [rec]));
            _context.n = 4;
            break;
          case 2:
            slots = LSL.getSlots();
            sIdx = slots.findIndex(function (s) {
              return s.id === desc.slotId;
            });
            if (!(sIdx < 0 || slots[sIdx].status !== 'open')) {
              _context.n = 3;
              break;
            }
            setBusy(false);
            setErrs({
              form: 'Sorry — that opening was just taken. Please pick another time.'
            });
            return _context.a(2);
          case 3:
            rec = {
              id: LSL.uid(),
              mode: 'dated',
              typeId: desc.typeId,
              serviceName: desc.serviceName,
              slotId: desc.slotId,
              date: slots[sIdx].date,
              time: slots[sIdx].time,
              locId: slots[sIdx].locId,
              parent: form.parent,
              athlete: form.athlete,
              age: form.age,
              email: form.email,
              phone: form.phone,
              focus: form.focus,
              notes: form.notes,
              created: new Date().toISOString(),
              status: 'awaiting_payment'
            };
            slots[sIdx] = _objectSpread(_objectSpread({}, slots[sIdx]), {}, {
              status: 'booked',
              bookingId: rec.id
            });
            LSL.setSlots(slots);
            LSL.setBooks([].concat(_toConsumableArray(LSL.getBooks()), [rec]));
          case 4:
            _context.n = 5;
            return notifyCoach(rec);
          case 5:
            setBusy(false);
            setResult(rec);
            if (onBooked) onBooked();
          case 6:
            return _context.a(2);
        }
      }, _callee);
    }));
    return _submit.apply(this, arguments);
  }
  useEffectBk(function () {
    if (result && result.mode === 'dated' && type.payLink) {
      var id = setTimeout(function () {
        window.location.href = type.payLink;
      }, 4000);
      return function () {
        return clearTimeout(id);
      };
    }
  }, [result]);
  return /*#__PURE__*/React.createElement("div", {
    className: "lsl-lightbox",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-bkmodal",
    onClick: function onClick(e) {
      return e.stopPropagation();
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "lsl-lightbox__close",
    onClick: onClose,
    "aria-label": "Close",
    style: {
      position: 'absolute',
      top: 16,
      right: 16
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "x"
  })), !result ? /*#__PURE__*/React.createElement("form", {
    className: "lsl-bkbody",
    onSubmit: submit
  }, /*#__PURE__*/React.createElement("h3", {
    className: "lsl-h3",
    style: {
      marginTop: 0,
      marginBottom: 4
    }
  }, "Request Booking"), /*#__PURE__*/React.createElement("div", {
    className: "lsl-bksummary"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "dumbbell"
  }), desc.serviceName), isReq ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "users"
  }), desc.players, " players"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "calendar"
  }), DOW[desc.dow], "s"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "clock"
  }), LSL.fmtTime(desc.reqTime))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "calendar"
  }), LSL.fmtDateLong(slot.date)), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "clock"
  }), LSL.fmtTime(slot.time)), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "map-pin"
  }), loc.name))), /*#__PURE__*/React.createElement("div", {
    className: "lsl-field lsl-field--row"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Parent / Guardian Name ", /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: 'lsl-input' + (errs.parent ? ' is-error' : ''),
    value: form.parent,
    onChange: set('parent'),
    placeholder: "Jane Smith"
  }), errs.parent && /*#__PURE__*/React.createElement("span", {
    className: "lsl-err"
  }, errs.parent)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Athlete Name ", /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: 'lsl-input' + (errs.athlete ? ' is-error' : ''),
    value: form.athlete,
    onChange: set('athlete'),
    placeholder: "Alex Smith"
  }), errs.athlete && /*#__PURE__*/React.createElement("span", {
    className: "lsl-err"
  }, errs.athlete))), /*#__PURE__*/React.createElement("div", {
    className: "lsl-field lsl-field--row"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Email ", /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: 'lsl-input' + (errs.email ? ' is-error' : ''),
    type: "email",
    value: form.email,
    onChange: set('email'),
    placeholder: "you@email.com"
  }), errs.email && /*#__PURE__*/React.createElement("span", {
    className: "lsl-err"
  }, errs.email)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Phone"), /*#__PURE__*/React.createElement("input", {
    className: "lsl-input",
    value: form.phone,
    onChange: set('phone'),
    placeholder: "(555) 555-5555"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "lsl-field lsl-field--row"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Athlete Age / Grade"), /*#__PURE__*/React.createElement("input", {
    className: "lsl-input",
    value: form.age,
    onChange: set('age'),
    placeholder: "7th grade"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Focus Areas / Goals"), /*#__PURE__*/React.createElement("input", {
    className: "lsl-input",
    value: form.focus,
    onChange: set('focus'),
    placeholder: "Shooting, ball handling"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "lsl-field"
  }, /*#__PURE__*/React.createElement("label", null, "Additional Notes"), /*#__PURE__*/React.createElement("textarea", {
    className: "lsl-textarea",
    value: form.notes,
    onChange: set('notes'),
    placeholder: "Anything Coach Gio should know",
    style: {
      minHeight: 76
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "lsl-bknote",
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": isReq ? 'mail' : 'shield-check'
  }), isReq ? /*#__PURE__*/React.createElement("span", null, "This sends a ", /*#__PURE__*/React.createElement("strong", null, "class request"), " to Coach Gio. You'll get a confirmation email \u2014 no payment is taken now.") : /*#__PURE__*/React.createElement("span", null, "After you submit, you'll be taken to ", /*#__PURE__*/React.createElement("strong", null, "Stripe"), " to pay securely and lock in your spot. Stripe emails your receipt.")), /*#__PURE__*/React.createElement("p", {
    className: "lsl-bkpolicy--modal"
  }, LSL_POLICY), errs.form && /*#__PURE__*/React.createElement("p", {
    className: "lsl-err"
  }, errs.form), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "lsl-btn lsl-btn--primary",
    disabled: busy,
    style: {
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": isReq ? 'send' : 'arrow-right'
  }), busy ? ' Submitting…' : isReq ? ' Submit Request' : ' Reserve & Continue to Payment')) : result.mode === 'request' ? /*#__PURE__*/React.createElement("div", {
    className: "lsl-bkbody lsl-bkdone"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-formsuccess__ico"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "check"
  })), /*#__PURE__*/React.createElement("h3", {
    className: "lsl-h3"
  }, "Request received!"), /*#__PURE__*/React.createElement("p", {
    className: "lsl-body lsl-body--sm",
    style: {
      marginTop: 0
    }
  }, result.serviceName, " \xB7 ", result.players, " players \xB7 ", DOW[result.dow], "s around ", LSL.fmtTime(result.reqTime), ".", /*#__PURE__*/React.createElement("br", null), "Coach Gio will reach out to ", /*#__PURE__*/React.createElement("strong", null, result.email), " to confirm your class."), /*#__PURE__*/React.createElement("div", {
    className: "lsl-bkdone__row"
  }, /*#__PURE__*/React.createElement("button", {
    className: "lsl-btn lsl-btn--primary lsl-btn--sm",
    onClick: onClose
  }, "Done"))) : /*#__PURE__*/React.createElement("div", {
    className: "lsl-bkbody lsl-bkdone"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-formsuccess__ico"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "check"
  })), /*#__PURE__*/React.createElement("h3", {
    className: "lsl-h3"
  }, "Spot reserved \u2014 one last step"), /*#__PURE__*/React.createElement("p", {
    className: "lsl-body lsl-body--sm",
    style: {
      marginTop: 0
    }
  }, result.serviceName, " \xB7 ", LSL.fmtDateLong(result.date), " \xB7 ", LSL.fmtTime(result.time), " at ", LSL.locById(result.locId).name, ".", /*#__PURE__*/React.createElement("br", null), "Redirecting you to secure Stripe payment\u2026"), type.payLink ? /*#__PURE__*/React.createElement("a", {
    className: "lsl-btn lsl-btn--primary",
    href: type.payLink,
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "credit-card"
  }), " Complete Payment Now") : /*#__PURE__*/React.createElement("div", {
    className: "lsl-bknote"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "info"
  }), /*#__PURE__*/React.createElement("span", null, "Coach Gio will email a secure Stripe payment link to ", result.email, " shortly.")), /*#__PURE__*/React.createElement("div", {
    className: "lsl-bkdone__row"
  }, /*#__PURE__*/React.createElement("button", {
    className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
    onClick: function onClick() {
      return LSL.downloadICS(result);
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "calendar-plus"
  }), " Add to calendar")), /*#__PURE__*/React.createElement("p", {
    className: "lsl-body lsl-body--sm",
    style: {
      color: 'var(--fg3)',
      marginBottom: 0
    }
  }, "Your spot is held. It's confirmed once payment is complete."))));
}
Object.assign(window, {
  PrivateBooking: PrivateBooking,
  BookingForm: BookingForm,
  Calendar: Calendar
});
