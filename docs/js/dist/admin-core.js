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
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
/* global React, ReactDOM, LSL */
/* Coach dashboard — shared pieces: API client, auth shell, UI primitives.
   Each admin file is wrapped in an IIFE and publishes to window.LSLA. */
(function () {
  var _React = React,
    useState = _React.useState,
    useEffect = _React.useEffect,
    useRef = _React.useRef,
    useCallback = _React.useCallback,
    useContext = _React.useContext,
    createContext = _React.createContext,
    useMemo = _React.useMemo;
  var A = window.LSLA = window.LSLA || {};

  /* ---------------- API + session ---------------- */
  var TOKEN_KEY = 'lsl_admin_token';
  var store = {
    get() {
      try {
        return localStorage.getItem(TOKEN_KEY) || '';
      } catch (e) {
        return '';
      }
    },
    set(v) {
      try {
        if (v) localStorage.setItem(TOKEN_KEY, v);else localStorage.removeItem(TOKEN_KEY);
      } catch (e) {/* private mode */}
    }
  };
  var token = store.get();
  A.setToken = t => {
    token = t || '';
    store.set(token);
  };
  A.api = /*#__PURE__*/function () {
    var _ref = _asyncToGenerator(function* (method, path, body) {
      try {
        return yield LSL.api(method, path, body, token);
      } catch (e) {
        if (e.status === 401 && token) {
          A.setToken('');
          window.dispatchEvent(new CustomEvent('lsl-auth-expired'));
        }
        throw e;
      }
    });
    return function (_x, _x2, _x3) {
      return _ref.apply(this, arguments);
    };
  }();

  /* ---------------- Icons (rendered by React, not DOM-swapped) ---------------- */
  var pascal = n => n.replace(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase());
  function Icon(_ref2) {
    var name = _ref2.name,
      _ref2$size = _ref2.size,
      size = _ref2$size === void 0 ? 16 : _ref2$size,
      className = _ref2.className,
      label = _ref2.label,
      style = _ref2.style;
    var node = window.lucide && window.lucide.icons && window.lucide.icons[pascal(name)];
    if (!node) return null;
    return /*#__PURE__*/React.createElement("svg", {
      className: 'lsl-a-ico' + (className ? ' ' + className : ''),
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      style: style,
      "aria-hidden": label ? undefined : 'true',
      role: label ? 'img' : undefined,
      "aria-label": label
    }, node.map((_ref3, i) => {
      var _ref4 = _slicedToArray(_ref3, 2),
        tag = _ref4[0],
        attrs = _ref4[1];
      return React.createElement(tag, _objectSpread({
        key: i
      }, attrs));
    }));
  }
  A.Icon = Icon;

  /* ---------------- Status vocabularies ---------------- */
  A.BOOKING = {
    requested: {
      label: 'Requested',
      tone: 'outline',
      icon: 'inbox'
    },
    awaiting_payment: {
      label: 'Awaiting payment',
      tone: 'warn',
      icon: 'hourglass'
    },
    confirmed: {
      label: 'Confirmed',
      tone: 'sky',
      icon: 'circle-check'
    },
    completed: {
      label: 'Completed',
      tone: 'green',
      icon: 'flag'
    },
    canceled: {
      label: 'Canceled',
      tone: 'muted',
      icon: 'circle-x'
    },
    declined: {
      label: 'Declined',
      tone: 'muted',
      icon: 'ban'
    },
    expired: {
      label: 'Hold expired',
      tone: 'muted',
      icon: 'timer-off'
    }
  };
  A.ATTENDANCE = {
    not_recorded: {
      label: 'Not recorded',
      tone: 'outline',
      icon: 'circle-dashed'
    },
    present: {
      label: 'Present',
      tone: 'green',
      icon: 'user-check'
    },
    late: {
      label: 'Late',
      tone: 'warn',
      icon: 'clock-alert'
    },
    no_show: {
      label: 'No-show',
      tone: 'danger',
      icon: 'user-x'
    }
  };
  A.PAYMENT = {
    unknown: {
      label: 'Unknown',
      tone: 'outline',
      icon: 'circle-help'
    },
    unpaid: {
      label: 'Unpaid',
      tone: 'warn',
      icon: 'circle-dollar-sign'
    },
    pending: {
      label: 'Pending',
      tone: 'warn',
      icon: 'loader'
    },
    paid: {
      label: 'Paid',
      tone: 'green',
      icon: 'badge-check'
    },
    partially_refunded: {
      label: 'Partially refunded',
      tone: 'orange',
      icon: 'undo-2'
    },
    refunded: {
      label: 'Refunded',
      tone: 'muted',
      icon: 'undo-2'
    },
    package_credit: {
      label: 'Package credit',
      tone: 'sky',
      icon: 'ticket'
    },
    complimentary: {
      label: 'Complimentary',
      tone: 'sky',
      icon: 'gift'
    }
  };
  function Badge(_ref5) {
    var _ref5$tone = _ref5.tone,
      tone = _ref5$tone === void 0 ? 'muted' : _ref5$tone,
      icon = _ref5.icon,
      children = _ref5.children,
      title = _ref5.title;
    return /*#__PURE__*/React.createElement("span", {
      className: 'lsl-a-badge lsl-a-badge--' + tone,
      title: title
    }, icon && /*#__PURE__*/React.createElement(Icon, {
      name: icon
    }), children);
  }
  function StatusBadge(_ref6) {
    var kind = _ref6.kind,
      value = _ref6.value;
    var map = kind === 'payment' ? A.PAYMENT : kind === 'attendance' ? A.ATTENDANCE : A.BOOKING;
    var m = map[value] || {
      label: value,
      tone: 'muted'
    };
    var prefix = kind === 'payment' ? 'Payment: ' : kind === 'attendance' ? 'Attendance: ' : 'Booking: ';
    return /*#__PURE__*/React.createElement(Badge, {
      tone: m.tone,
      icon: m.icon,
      title: prefix + m.label
    }, /*#__PURE__*/React.createElement("span", {
      className: "lsl-a-sr"
    }, prefix), m.label);
  }
  A.Badge = Badge;
  A.StatusBadge = StatusBadge;

  /* ---------------- Toasts ---------------- */
  var ToastCtx = createContext(() => {});
  function ToastHost(_ref7) {
    var children = _ref7.children;
    var _useState = useState([]),
      _useState2 = _slicedToArray(_useState, 2),
      items = _useState2[0],
      setItems = _useState2[1];
    var push = useCallback(function (msg) {
      var tone = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'ok';
      var id = Math.random().toString(36).slice(2);
      setItems(x => [...x, {
        id,
        msg,
        tone
      }]);
      setTimeout(() => setItems(x => x.filter(t => t.id !== id)), tone === 'err' ? 7000 : 3500);
    }, []);
    return /*#__PURE__*/React.createElement(ToastCtx.Provider, {
      value: push
    }, children, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-toasts",
      role: "status",
      "aria-live": "polite"
    }, items.map(t => /*#__PURE__*/React.createElement("div", {
      key: t.id,
      className: 'lsl-a-toast is-' + t.tone
    }, /*#__PURE__*/React.createElement(Icon, {
      name: t.tone === 'err' ? 'circle-alert' : 'circle-check'
    }), t.msg))));
  }
  A.useToast = () => useContext(ToastCtx);

  /* ---------------- Dialog / Drawer with focus trap ---------------- */
  var openLayers = 0;
  function Dialog(_ref8) {
    var title = _ref8.title,
      onClose = _ref8.onClose,
      children = _ref8.children,
      footer = _ref8.footer,
      wide = _ref8.wide,
      drawer = _ref8.drawer,
      busy = _ref8.busy;
    var ref = useRef(null);
    var idRef = useRef('dlg-' + Math.random().toString(36).slice(2));
    var closeRef = useRef(onClose);
    closeRef.current = onClose;
    useEffect(() => {
      var prev = document.activeElement;
      var el = ref.current;
      var focusables = () => [...el.querySelectorAll('button, [href], input, select, textarea, summary, [tabindex]:not([tabindex="-1"])')].filter(x => !x.disabled && x.offsetParent !== null);
      var auto = el.querySelector('[data-autofocus]');
      (auto || focusables()[1] || el).focus();
      var onKey = e => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          if (!busy) closeRef.current();
        }
        if (e.key === 'Tab') {
          var list = focusables();
          if (!list.length) return;
          var first = list[0],
            last = list[list.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };
      el.addEventListener('keydown', onKey);
      openLayers++;
      document.body.style.overflow = 'hidden';
      return () => {
        el.removeEventListener('keydown', onKey);
        openLayers--;
        if (!openLayers) document.body.style.overflow = '';
        if (prev && prev.focus) prev.focus();
      };
    }, []);
    return ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
      className: 'lsl-a-overlay' + (drawer ? ' lsl-a-overlay--drawer' : ''),
      onMouseDown: e => {
        if (e.target === e.currentTarget && !busy) onClose();
      }
    }, /*#__PURE__*/React.createElement("div", {
      ref: ref,
      className: 'lsl-a-dialog' + (wide ? ' is-wide' : ''),
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": idRef.current,
      tabIndex: -1
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-dialog__head"
    }, /*#__PURE__*/React.createElement("h2", {
      id: idRef.current
    }, title), /*#__PURE__*/React.createElement("button", {
      className: "lsl-a-iconbtn",
      onClick: onClose,
      "aria-label": "Close",
      disabled: busy
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "x",
      size: 18
    }))), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-dialog__body"
    }, children), footer && /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-dialog__foot"
    }, footer))), document.body);
  }
  A.Dialog = Dialog;

  /** const [confirmUi, confirm] = useConfirm(); await confirm({title, body, confirmLabel, danger}) */
  A.useConfirm = function () {
    var _useState3 = useState(null),
      _useState4 = _slicedToArray(_useState3, 2),
      state = _useState4[0],
      setState = _useState4[1];
    var ask = useCallback(opts => new Promise(resolve => setState(_objectSpread(_objectSpread({}, opts), {}, {
      resolve
    }))), []);
    var close = v => {
      state && state.resolve(v);
      setState(null);
    };
    var ui = state && /*#__PURE__*/React.createElement(Dialog, {
      title: state.title || 'Are you sure?',
      onClose: () => close(false),
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
        className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
        onClick: () => close(false)
      }, state.cancelLabel || 'Keep it'), /*#__PURE__*/React.createElement("button", {
        className: 'lsl-btn lsl-btn--sm ' + (state.danger ? 'lsl-btn--danger' : 'lsl-btn--primary'),
        onClick: () => close(true),
        "data-autofocus": true
      }, state.confirmLabel || 'Confirm'))
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-body lsl-body--sm"
    }, state.body));
    return [ui, ask];
  };

  /* ---------------- Form bits ---------------- */
  var fid = 0;
  function Field(_ref9) {
    var label = _ref9.label,
      error = _ref9.error,
      hint = _ref9.hint,
      required = _ref9.required,
      children = _ref9.children,
      id = _ref9.id,
      className = _ref9.className;
    var auto = useRef('f' + ++fid).current;
    var fieldId = id || auto;
    var child = React.Children.only(children);
    var input = React.cloneElement(child, {
      id: fieldId,
      'aria-invalid': error ? true : undefined,
      'aria-describedby': error || hint ? fieldId + '-d' : undefined,
      className: (child.props.className || '') + (error ? ' is-error' : '')
    });
    return /*#__PURE__*/React.createElement("div", {
      className: 'lsl-field' + (className ? ' ' + className : '')
    }, label && /*#__PURE__*/React.createElement("label", {
      htmlFor: fieldId
    }, label, required && /*#__PURE__*/React.createElement("span", {
      className: "req"
    }, " *")), input, error ? /*#__PURE__*/React.createElement("span", {
      className: "lsl-err",
      id: fieldId + '-d'
    }, error) : hint ? /*#__PURE__*/React.createElement("span", {
      className: "lsl-a-hint",
      id: fieldId + '-d'
    }, hint) : null);
  }
  A.Field = Field;
  function Expand(_ref0) {
    var title = _ref0.title,
      icon = _ref0.icon,
      children = _ref0.children,
      defaultOpen = _ref0.defaultOpen,
      className = _ref0.className,
      badge = _ref0.badge;
    return /*#__PURE__*/React.createElement("details", {
      className: 'lsl-a-expand' + (className ? ' ' + className : ''),
      open: defaultOpen
    }, /*#__PURE__*/React.createElement("summary", null, /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      className: "lsl-a-chev"
    }), icon && /*#__PURE__*/React.createElement(Icon, {
      name: icon
    }), title, badge), /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-expand__body"
    }, children));
  }
  A.Expand = Expand;
  function Seg(_ref1) {
    var value = _ref1.value,
      options = _ref1.options,
      onChange = _ref1.onChange,
      label = _ref1.label;
    return /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-seg",
      role: "group",
      "aria-label": label
    }, options.map(_ref10 => {
      var _ref11 = _slicedToArray(_ref10, 2),
        v = _ref11[0],
        l = _ref11[1];
      return /*#__PURE__*/React.createElement("button", {
        type: "button",
        key: v,
        "aria-pressed": value === v,
        onClick: () => onChange(v)
      }, l);
    }));
  }
  A.Seg = Seg;
  A.Loading = _ref12 => {
    var text = _ref12.text;
    return /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-loading",
      role: "status"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "loader-circle",
      className: "lsl-a-spin",
      size: 18
    }), text || 'Loading…');
  };
  A.Empty = _ref13 => {
    var _ref13$icon = _ref13.icon,
      icon = _ref13$icon === void 0 ? 'inbox' : _ref13$icon,
      children = _ref13.children;
    return /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-empty"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: icon
    }), children);
  };
  A.Banner = _ref14 => {
    var _ref14$tone = _ref14.tone,
      tone = _ref14$tone === void 0 ? 'info' : _ref14$tone,
      icon = _ref14.icon,
      children = _ref14.children;
    return /*#__PURE__*/React.createElement("div", {
      className: 'lsl-a-banner lsl-a-banner--' + tone,
      role: tone === 'danger' ? 'alert' : undefined
    }, /*#__PURE__*/React.createElement(Icon, {
      name: icon || {
        info: 'info',
        warn: 'triangle-alert',
        danger: 'circle-alert',
        ok: 'circle-check'
      }[tone]
    }), /*#__PURE__*/React.createElement("div", null, children));
  };
  A.ErrorState = _ref15 => {
    var error = _ref15.error,
      onRetry = _ref15.onRetry;
    return /*#__PURE__*/React.createElement(A.Banner, {
      tone: "danger"
    }, error && error.message || 'Something went wrong.', " ", onRetry && /*#__PURE__*/React.createElement("button", {
      className: "lsl-a-linkbtn",
      onClick: onRetry
    }, "Try again"));
  };

  /** Save bar that appears when a form has unsaved changes. */
  A.SaveBar = function (_ref16) {
    var dirty = _ref16.dirty,
      saving = _ref16.saving,
      onSave = _ref16.onSave,
      onDiscard = _ref16.onDiscard,
      label = _ref16.label;
    if (!dirty && !saving) return null;
    return /*#__PURE__*/React.createElement("div", {
      className: "lsl-a-savebar",
      role: "region",
      "aria-label": "Unsaved changes"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "pencil"
    }), " ", saving ? 'Saving…' : label || 'You have unsaved changes', /*#__PURE__*/React.createElement("span", {
      className: "lsl-a-spacer"
    }), /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--xs",
      onClick: onDiscard,
      disabled: saving
    }, "Discard"), /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--primary lsl-btn--xs",
      onClick: onSave,
      disabled: saving
    }, saving ? 'Saving…' : 'Save changes'));
  };

  /** Fetch helper with loading / error / reload. */
  A.useFetch = function (path) {
    var deps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var _useState5 = useState({
        loading: true,
        data: null,
        error: null
      }),
      _useState6 = _slicedToArray(_useState5, 2),
      state = _useState6[0],
      setState = _useState6[1];
    var _useState7 = useState(0),
      _useState8 = _slicedToArray(_useState7, 2),
      n = _useState8[0],
      setN = _useState8[1];
    useEffect(() => {
      var live = true;
      if (!path) {
        setState({
          loading: false,
          data: null,
          error: null
        });
        return;
      }
      setState(s => _objectSpread(_objectSpread({}, s), {}, {
        loading: true,
        error: null
      }));
      A.api('GET', path).then(d => live && setState({
        loading: false,
        data: d,
        error: null
      })).catch(e => live && setState(s => ({
        loading: false,
        data: s.data,
        error: e
      })));
      return () => {
        live = false;
      };
    }, [path, n, ...deps]);
    return _objectSpread(_objectSpread({}, state), {}, {
      reload: () => setN(x => x + 1)
    });
  };

  /** Run an action with busy state and toast feedback. */
  A.useAction = function () {
    var toast = A.useToast();
    var _useState9 = useState(false),
      _useState0 = _slicedToArray(_useState9, 2),
      busy = _useState0[0],
      setBusy = _useState0[1];
    var run = useCallback(/*#__PURE__*/function () {
      var _ref17 = _asyncToGenerator(function* (fn, okMsg) {
        setBusy(true);
        try {
          var r = yield fn();
          if (okMsg) toast(typeof okMsg === 'function' ? okMsg(r) : okMsg);
          return r;
        } catch (e) {
          toast(e.message || 'Something went wrong.', 'err');
          throw e;
        } finally {
          setBusy(false);
        }
      });
      return function (_x4, _x5) {
        return _ref17.apply(this, arguments);
      };
    }(), [toast]);
    return [busy, run];
  };

  /* ---------------- Formatting ---------------- */
  A.money = c => c == null ? '—' : '$' + (c / 100).toFixed(c % 100 === 0 ? 0 : 2);
  A.parseMoney = s => {
    var n = Number(String(s).replace(/[$,\s]/g, ''));
    return Number.isFinite(n) ? Math.round(n * 100) : NaN;
  };
  A.when = b => b.date ? LSL.fmtDate(b.date) + ' · ' + LSL.fmtTime(b.time) : '';
  A.stamp = iso => iso ? new Date(iso).toLocaleString('en-US', {
    timeZone: LSL.tz(),
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }) : '';
  A.endTime = (t, mins) => {
    var _t$split$map = t.split(':').map(Number),
      _t$split$map2 = _slicedToArray(_t$split$map, 2),
      h = _t$split$map2[0],
      m = _t$split$map2[1];
    var x = h * 60 + m + (mins || 60);
    return String(Math.floor(x / 60) % 24).padStart(2, '0') + ':' + String(x % 60).padStart(2, '0');
  };
  A.plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');
  A.copy = /*#__PURE__*/function () {
    var _ref18 = _asyncToGenerator(function* (text, toast) {
      try {
        yield navigator.clipboard.writeText(text);
        toast && toast('Copied to clipboard');
      } catch (e) {
        window.prompt('Copy this:', text);
      }
    });
    return function (_x6, _x7) {
      return _ref18.apply(this, arguments);
    };
  }();
  A.downloadCsv = (name, rows) => {
    var esc = v => {
      var s = v == null ? '' : String(v);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    var csv = rows.map(r => r.map(esc).join(',')).join('\r\n');
    var blob = new Blob(['﻿' + csv], {
      type: 'text/csv'
    });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  /* ---------------- App context ---------------- */
  var AppCtx = createContext(null);
  A.useApp = () => useContext(AppCtx);
  var TABS = [['avail', 'Availability'], ['types', 'Sessions & Links'], ['locs', 'Locations'], ['books', 'Bookings'], ['set', 'Settings']];
  function Login(_ref19) {
    var onAuthed = _ref19.onAuthed;
    var _useState1 = useState('checking'),
      _useState10 = _slicedToArray(_useState1, 2),
      mode = _useState10[0],
      setMode = _useState10[1];
    var _useState11 = useState({
        email: '',
        password: '',
        name: '',
        setupToken: ''
      }),
      _useState12 = _slicedToArray(_useState11, 2),
      form = _useState12[0],
      setForm = _useState12[1];
    var _useState13 = useState(''),
      _useState14 = _slicedToArray(_useState13, 2),
      err = _useState14[0],
      setErr = _useState14[1];
    var _useState15 = useState(false),
      _useState16 = _slicedToArray(_useState15, 2),
      busy = _useState16[0],
      setBusy = _useState16[1];
    useEffect(() => {
      LSL.api('GET', '/api/auth/setup').then(d => setMode(d.needsSetup ? 'setup' : 'login')).catch(e => {
        setMode('login');
        setErr(e.message);
      });
    }, []);
    var set = k => e => setForm(_objectSpread(_objectSpread({}, form), {}, {
      [k]: e.target.value
    }));
    var submit = /*#__PURE__*/function () {
      var _ref20 = _asyncToGenerator(function* (e) {
        e.preventDefault();
        setErr('');
        setBusy(true);
        try {
          var d = mode === 'setup' ? yield LSL.api('POST', '/api/auth/setup', form) : yield LSL.api('POST', '/api/auth/login', {
            email: form.email,
            password: form.password
          });
          A.setToken(d.token);
          onAuthed();
        } catch (ex) {
          setErr(ex.message);
        } finally {
          setBusy(false);
        }
      });
      return function submit(_x8) {
        return _ref20.apply(this, arguments);
      };
    }();
    return /*#__PURE__*/React.createElement("div", {
      className: "lsl-adminpage"
    }, /*#__PURE__*/React.createElement("form", {
      className: "lsl-admin lsl-admin--login",
      onSubmit: submit,
      noValidate: true
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-admin__lock"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "lock",
      size: 28
    })), /*#__PURE__*/React.createElement("h1", {
      className: "lsl-h3",
      style: {
        margin: '0 0 6px',
        textAlign: 'center'
      }
    }, mode === 'setup' ? 'Create Director Account' : 'Coach Login'), /*#__PURE__*/React.createElement("p", {
      className: "lsl-body lsl-body--sm",
      style: {
        marginTop: 0,
        textAlign: 'center',
        color: 'var(--fg3)'
      }
    }, mode === 'setup' ? 'First-time setup. You need the setup token from the deployment.' : 'LakeShore Legends — private booking dashboard.'), mode === 'checking' ? /*#__PURE__*/React.createElement(A.Loading, {
      text: "Connecting\u2026"
    }) : /*#__PURE__*/React.createElement(React.Fragment, null, mode === 'setup' && /*#__PURE__*/React.createElement(Field, {
      label: "Your name"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      value: form.name,
      onChange: set('name'),
      autoComplete: "name"
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Email"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      type: "email",
      value: form.email,
      onChange: set('email'),
      autoComplete: "username",
      autoFocus: true
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Password",
      hint: mode === 'setup' ? 'At least 10 characters.' : null
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      type: "password",
      value: form.password,
      onChange: set('password'),
      autoComplete: mode === 'setup' ? 'new-password' : 'current-password'
    })), mode === 'setup' && /*#__PURE__*/React.createElement(Field, {
      label: "Setup token"
    }, /*#__PURE__*/React.createElement("input", {
      className: "lsl-input",
      value: form.setupToken,
      onChange: set('setupToken'),
      autoComplete: "off"
    })), err && /*#__PURE__*/React.createElement("span", {
      className: "lsl-err",
      role: "alert",
      style: {
        textAlign: 'center'
      }
    }, err), /*#__PURE__*/React.createElement("button", {
      type: "submit",
      className: "lsl-btn lsl-btn--primary",
      disabled: busy,
      style: {
        width: '100%',
        marginTop: 14
      }
    }, busy ? 'Please wait…' : mode === 'setup' ? 'Create account' : 'Sign in'))));
  }
  function Shell() {
    var _useState17 = useState(null),
      _useState18 = _slicedToArray(_useState17, 2),
      boot = _useState18[0],
      setBoot = _useState18[1];
    var _useState19 = useState(null),
      _useState20 = _slicedToArray(_useState19, 2),
      bootErr = _useState20[0],
      setBootErr = _useState20[1];
    var _useState21 = useState(!!token),
      _useState22 = _slicedToArray(_useState21, 2),
      authed = _useState22[0],
      setAuthed = _useState22[1];
    var initialTab = (() => {
      var h = (location.hash || '').slice(1);
      return TABS.some(_ref21 => {
        var _ref22 = _slicedToArray(_ref21, 1),
          k = _ref22[0];
        return k === h;
      }) ? h : 'avail';
    })();
    var _useState23 = useState(initialTab),
      _useState24 = _slicedToArray(_useState23, 2),
      tab = _useState24[0],
      setTabState = _useState24[1];
    var _useState25 = useState(null),
      _useState26 = _slicedToArray(_useState25, 2),
      bookingId = _useState26[0],
      setBookingId = _useState26[1];
    var _useState27 = useState(null),
      _useState28 = _slicedToArray(_useState27, 2),
      familyId = _useState28[0],
      setFamilyId = _useState28[1];
    var _useState29 = useState(0),
      _useState30 = _slicedToArray(_useState29, 2),
      version = _useState30[0],
      setVersion = _useState30[1]; // bump to make tabs refetch
    var tabRefs = useRef({});
    var loadBoot = useCallback(() => {
      setBootErr(null);
      return A.api('GET', '/api/admin/bootstrap').then(d => {
        setBoot(d);
        window.LSL_TZ = d.settings.timezone;
      }).catch(e => setBootErr(e));
    }, []);
    useEffect(() => {
      if (authed) loadBoot();
    }, [authed]);
    useEffect(() => {
      var el = tabRefs.current[tab];
      if (el && el.parentElement && el.parentElement.scrollWidth > el.parentElement.clientWidth) el.scrollIntoView({
        block: 'nearest',
        inline: 'center'
      });
    }, [tab, !!boot]);
    useEffect(() => {
      var onExpired = () => {
        setAuthed(false);
        setBoot(null);
      };
      window.addEventListener('lsl-auth-expired', onExpired);
      return () => window.removeEventListener('lsl-auth-expired', onExpired);
    }, []);
    var setTab = k => {
      setTabState(k);
      try {
        history.replaceState(null, '', '#' + k);
      } catch (e) {/* ignore */}
    };
    var onTabKey = (e, i) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var n = (i + (e.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length;
      setTab(TABS[n][0]);
      tabRefs.current[TABS[n][0]].focus();
    };
    var ctx = useMemo(() => boot && _objectSpread(_objectSpread({}, boot), {}, {
      isDirector: boot.me.role === 'director',
      reload: loadBoot,
      version,
      changed: () => setVersion(v => v + 1),
      openBooking: setBookingId,
      openFamily: setFamilyId,
      locName: id => (boot.locations.find(l => l.id === id) || {}).name || id,
      typeById: id => boot.types.find(t => t.id === id) || {},
      coachName: id => (boot.coaches.find(c => c.id === id) || {}).name
    }), [boot, version, loadBoot]);
    if (!authed) return /*#__PURE__*/React.createElement(Login, {
      onAuthed: () => setAuthed(true)
    });
    if (!boot) {
      return /*#__PURE__*/React.createElement("div", {
        className: "lsl-adminpage"
      }, /*#__PURE__*/React.createElement("div", {
        className: "lsl-admin lsl-admin--page"
      }, bootErr ? /*#__PURE__*/React.createElement(A.ErrorState, {
        error: bootErr,
        onRetry: loadBoot
      }) : /*#__PURE__*/React.createElement(A.Loading, {
        text: "Loading your dashboard\u2026"
      })));
    }
    var signOut = /*#__PURE__*/function () {
      var _ref23 = _asyncToGenerator(function* () {
        try {
          yield A.api('POST', '/api/auth/logout');
        } catch (e) {/* ignore */}
        A.setToken('');
        setAuthed(false);
        setBoot(null);
      });
      return function signOut() {
        return _ref23.apply(this, arguments);
      };
    }();
    var T = A.tabs || {};
    var Current = {
      avail: T.AvailTab,
      types: T.TypesTab,
      locs: T.LocsTab,
      books: T.BooksTab,
      set: T.SettingsTab
    }[tab];
    var tzShort = LSL.tzLabel(null, null, boot.settings.timezone);
    return /*#__PURE__*/React.createElement(AppCtx.Provider, {
      value: ctx
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-adminpage"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-admin lsl-admin--page"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-admin__head"
    }, /*#__PURE__*/React.createElement("img", {
      src: "assets/badge-crest.png",
      alt: "LakeShore Legends",
      style: {
        height: 40
      }
    }), /*#__PURE__*/React.createElement("h1", {
      className: "lsl-h3",
      style: {
        margin: 0
      }
    }, "Coach Dashboard"), /*#__PURE__*/React.createElement("span", {
      className: "lsl-pill lsl-pill--sky"
    }, boot.me.name), window.LSL_API_NAME === 'staging' && /*#__PURE__*/React.createElement(Badge, {
      tone: "warn",
      icon: "flask-conical",
      title: "Connected to the test server \u2014 not live data"
    }, "Test server"), /*#__PURE__*/React.createElement("span", {
      className: "lsl-a-tz",
      title: "All times are shown in this time zone"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "globe",
      size: 13
    }), boot.settings.timezone.replace('_', ' '), " (", tzShort, ")"), /*#__PURE__*/React.createElement("a", {
      className: "lsl-admin__exit",
      href: "training.html"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "external-link",
      size: 14
    }), " View site"), /*#__PURE__*/React.createElement("button", {
      className: "lsl-a-signout",
      onClick: signOut
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "log-out",
      size: 14
    }), " Sign out")), /*#__PURE__*/React.createElement("div", {
      className: "lsl-admin__tabs",
      role: "tablist",
      "aria-label": "Dashboard sections"
    }, TABS.map((_ref24, i) => {
      var _ref25 = _slicedToArray(_ref24, 2),
        k = _ref25[0],
        l = _ref25[1];
      return /*#__PURE__*/React.createElement("button", {
        key: k,
        ref: el => tabRefs.current[k] = el,
        role: "tab",
        id: 'tab-' + k,
        "aria-selected": tab === k,
        "aria-controls": 'panel-' + k,
        tabIndex: tab === k ? 0 : -1,
        className: tab === k ? 'is-active' : '',
        onClick: () => setTab(k),
        onKeyDown: e => onTabKey(e, i)
      }, l);
    })), /*#__PURE__*/React.createElement("div", {
      className: "lsl-admin__body",
      role: "tabpanel",
      id: 'panel-' + tab,
      "aria-labelledby": 'tab-' + tab
    }, Current ? /*#__PURE__*/React.createElement(Current, {
      key: tab
    }) : /*#__PURE__*/React.createElement(A.Loading, null)))), bookingId && A.BookingDialog && /*#__PURE__*/React.createElement(A.BookingDialog, {
      id: bookingId,
      onClose: () => setBookingId(null)
    }), familyId && A.FamilyDrawer && /*#__PURE__*/React.createElement(A.FamilyDrawer, {
      id: familyId,
      onClose: () => setFamilyId(null)
    }));
  }
  A.App = function () {
    return /*#__PURE__*/React.createElement(ToastHost, null, /*#__PURE__*/React.createElement(Shell, null));
  };
})();