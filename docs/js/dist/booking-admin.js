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
var _React = React,
  useStateAd = _React.useState,
  useEffectAd = _React.useEffect,
  useReducerAd = _React.useReducer;
function CoachAdminPage() {
  var _useStateAd = useStateAd(false),
    _useStateAd2 = _slicedToArray(_useStateAd, 2),
    authed = _useStateAd2[0],
    setAuthed = _useStateAd2[1];
  var _useStateAd3 = useStateAd(''),
    _useStateAd4 = _slicedToArray(_useStateAd3, 2),
    pass = _useStateAd4[0],
    setPass = _useStateAd4[1];
  var _useStateAd5 = useStateAd(false),
    _useStateAd6 = _slicedToArray(_useStateAd5, 2),
    perr = _useStateAd6[0],
    setPerr = _useStateAd6[1];
  var _useStateAd7 = useStateAd('avail'),
    _useStateAd8 = _slicedToArray(_useStateAd7, 2),
    tab = _useStateAd8[0],
    setTab = _useStateAd8[1];
  var _useReducerAd = useReducerAd(x => x + 1, 0),
    _useReducerAd2 = _slicedToArray(_useReducerAd, 2),
    force = _useReducerAd2[1];
  useEffectAd(() => {
    if (window.lucide) window.lucide.createIcons();
  });
  var tryAuth = e => {
    e.preventDefault();
    if (pass === LSL.getPass()) {
      setAuthed(true);
      setPerr(false);
    } else setPerr(true);
  };
  if (!authed) {
    return /*#__PURE__*/React.createElement("div", {
      className: "lsl-adminpage"
    }, /*#__PURE__*/React.createElement("form", {
      className: "lsl-admin lsl-admin--login",
      onSubmit: tryAuth
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-admin__lock"
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "lock"
    })), /*#__PURE__*/React.createElement("h1", {
      className: "lsl-h3",
      style: {
        margin: '0 0 6px',
        textAlign: 'center'
      }
    }, "Coach Login"), /*#__PURE__*/React.createElement("p", {
      className: "lsl-body lsl-body--sm",
      style: {
        marginTop: 0,
        textAlign: 'center',
        color: 'var(--fg3)'
      }
    }, "LakeShore Legends \u2014 private booking dashboard."), /*#__PURE__*/React.createElement("input", {
      className: 'lsl-input' + (perr ? ' is-error' : ''),
      type: "password",
      value: pass,
      onChange: e => setPass(e.target.value),
      placeholder: "Passcode",
      autoFocus: true,
      style: {
        textAlign: 'center'
      }
    }), perr && /*#__PURE__*/React.createElement("span", {
      className: "lsl-err",
      style: {
        textAlign: 'center'
      }
    }, "Incorrect passcode"), /*#__PURE__*/React.createElement("button", {
      type: "submit",
      className: "lsl-btn lsl-btn--primary",
      style: {
        width: '100%',
        marginTop: 14
      }
    }, "Unlock")));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "lsl-adminpage"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-admin lsl-admin--page"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-admin__head"
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/badge-crest.png",
    alt: "",
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
  }, "Coach Gio"), /*#__PURE__*/React.createElement("a", {
    className: "lsl-admin__exit",
    href: "training.html"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "external-link"
  }), " View site")), /*#__PURE__*/React.createElement("div", {
    className: "lsl-admin__tabs"
  }, [['avail', 'Availability'], ['types', 'Sessions & Links'], ['locs', 'Locations'], ['books', 'Bookings'], ['set', 'Settings']].map(_ref => {
    var _ref2 = _slicedToArray(_ref, 2),
      k = _ref2[0],
      l = _ref2[1];
    return /*#__PURE__*/React.createElement("button", {
      key: k,
      className: tab === k ? 'is-active' : '',
      onClick: () => setTab(k)
    }, l);
  })), /*#__PURE__*/React.createElement("div", {
    className: "lsl-admin__body"
  }, tab === 'avail' && /*#__PURE__*/React.createElement(AvailTab, {
    force: force
  }), tab === 'types' && /*#__PURE__*/React.createElement(TypesTab, {
    force: force
  }), tab === 'locs' && /*#__PURE__*/React.createElement(LocsTab, {
    force: force
  }), tab === 'books' && /*#__PURE__*/React.createElement(BooksTab, {
    force: force
  }), tab === 'set' && /*#__PURE__*/React.createElement(SettingsTab, {
    force: force
  }))));
}

/* ---------- Availability ---------- */
function AvailTab(_ref3) {
  var force = _ref3.force;
  var locs = LSL.getLocs();
  var _useStateAd9 = useStateAd(''),
    _useStateAd0 = _slicedToArray(_useStateAd9, 2),
    date = _useStateAd0[0],
    setDate = _useStateAd0[1];
  var _useStateAd1 = useStateAd(''),
    _useStateAd10 = _slicedToArray(_useStateAd1, 2),
    time = _useStateAd10[0],
    setTime = _useStateAd10[1];
  var _useStateAd11 = useStateAd(locs[0] ? locs[0].id : ''),
    _useStateAd12 = _slicedToArray(_useStateAd11, 2),
    locId = _useStateAd12[0],
    setLocId = _useStateAd12[1];
  useEffectAd(() => {
    if (window.lucide) window.lucide.createIcons();
  });
  var add = () => {
    if (!date || !time || !locId) return;
    LSL.setSlots([...LSL.getSlots(), {
      id: LSL.uid(),
      date,
      time,
      locId,
      status: 'open'
    }]);
    setDate('');
    setTime('');
    force();
  };
  var del = id => {
    LSL.setSlots(LSL.getSlots().filter(s => s.id !== id));
    force();
  };
  var slots = LSL.getSlots().slice().sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "lsl-body lsl-body--sm",
    style: {
      marginTop: 0,
      color: 'var(--fg3)'
    }
  }, "Add openings as they come up. Booked times drop off the public list automatically."), /*#__PURE__*/React.createElement("div", {
    className: "lsl-admin__addrow"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Date"), /*#__PURE__*/React.createElement("input", {
    className: "lsl-input",
    type: "date",
    value: date,
    onChange: e => setDate(e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Time"), /*#__PURE__*/React.createElement("input", {
    className: "lsl-input",
    type: "time",
    value: time,
    onChange: e => setTime(e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Location"), /*#__PURE__*/React.createElement("select", {
    className: "lsl-select",
    value: locId,
    onChange: e => setLocId(e.target.value)
  }, locs.map(l => /*#__PURE__*/React.createElement("option", {
    key: l.id,
    value: l.id
  }, l.name)))), /*#__PURE__*/React.createElement("button", {
    className: "lsl-btn lsl-btn--primary lsl-btn--sm",
    onClick: add
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "plus"
  }), " Add opening")), /*#__PURE__*/React.createElement("div", {
    className: "lsl-admin__list"
  }, slots.length === 0 && /*#__PURE__*/React.createElement("p", {
    className: "lsl-body lsl-body--sm",
    style: {
      color: 'var(--fg3)'
    }
  }, "No openings yet. Add your first above."), slots.map(s => {
    var l = LSL.locById(s.locId);
    return /*#__PURE__*/React.createElement("div", {
      className: "lsl-admin__item",
      key: s.id
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-admin__itemmain"
    }, /*#__PURE__*/React.createElement("strong", null, LSL.fmtDate(s.date)), " \xB7 ", LSL.fmtTime(s.time), " \xB7 ", l.name), /*#__PURE__*/React.createElement("span", {
      className: 'lsl-pill ' + (s.status === 'booked' ? 'lsl-pill--orange' : 'lsl-pill--outline')
    }, s.status === 'booked' ? 'Booked' : 'Open'), /*#__PURE__*/React.createElement("button", {
      className: "lsl-admin__del",
      onClick: () => del(s.id),
      "aria-label": "Delete"
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "trash-2"
    })));
  })));
}

/* ---------- Sessions & Stripe links ---------- */
function TypesTab(_ref4) {
  var force = _ref4.force;
  var types = LSL.getTypes();
  useEffectAd(() => {
    if (window.lucide) window.lucide.createIcons();
  });
  var upd = (id, k, v) => {
    LSL.setTypes(LSL.getTypes().map(t => t.id === id ? _objectSpread(_objectSpread({}, t), {}, {
      [k]: v
    }) : t));
    force();
  };
  var del = id => {
    LSL.setTypes(LSL.getTypes().filter(t => t.id !== id));
    force();
  };
  var add = () => {
    LSL.setTypes([...LSL.getTypes(), {
      id: LSL.uid(),
      name: 'New Session',
      size: '1-on-1',
      group: false,
      duration: 60,
      price: null,
      payLink: ''
    }]);
    force();
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "lsl-body lsl-body--sm",
    style: {
      marginTop: 0,
      color: 'var(--fg3)'
    }
  }, "Each session forwards to its Stripe Payment Link after the family submits the form. Edit prices in Stripe \u2014 the checkout page always shows the live price."), types.map(t => /*#__PURE__*/React.createElement("div", {
    className: "lsl-admin__card",
    key: t.id
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-field lsl-field--row"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Name"), /*#__PURE__*/React.createElement("input", {
    className: "lsl-input",
    value: t.name,
    onChange: e => upd(t.id, 'name', e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 130
    }
  }, /*#__PURE__*/React.createElement("label", null, "Format"), /*#__PURE__*/React.createElement("input", {
    className: "lsl-input",
    value: t.size,
    onChange: e => upd(t.id, 'size', e.target.value),
    placeholder: "1-on-1"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 110
    }
  }, /*#__PURE__*/React.createElement("label", null, "Minutes"), /*#__PURE__*/React.createElement("input", {
    className: "lsl-input",
    type: "number",
    value: t.duration,
    onChange: e => upd(t.id, 'duration', +e.target.value)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "lsl-field",
    style: {
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("label", null, "Stripe Payment Link"), /*#__PURE__*/React.createElement("input", {
    className: "lsl-input",
    value: t.payLink,
    onChange: e => upd(t.id, 'payLink', e.target.value),
    placeholder: "https://buy.stripe.com/..."
  })), /*#__PURE__*/React.createElement("button", {
    className: "lsl-admin__del lsl-admin__del--text",
    onClick: () => del(t.id)
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "trash-2"
  }), " Remove"))), /*#__PURE__*/React.createElement("button", {
    className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
    onClick: add
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "plus"
  }), " Add session type"));
}

/* ---------- Locations ---------- */
function LocsTab(_ref5) {
  var force = _ref5.force;
  var locs = LSL.getLocs();
  useEffectAd(() => {
    if (window.lucide) window.lucide.createIcons();
  });
  var upd = (id, k, v) => {
    LSL.setLocs(LSL.getLocs().map(l => l.id === id ? _objectSpread(_objectSpread({}, l), {}, {
      [k]: v
    }) : l));
    force();
  };
  var del = id => {
    LSL.setLocs(LSL.getLocs().filter(l => l.id !== id));
    force();
  };
  var add = () => {
    LSL.setLocs([...LSL.getLocs(), {
      id: LSL.uid(),
      name: '',
      city: ''
    }]);
    force();
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "lsl-body lsl-body--sm",
    style: {
      marginTop: 0,
      color: 'var(--fg3)'
    }
  }, "Use general areas/towns. Exact address can be shared privately once a booking is confirmed."), locs.map(l => /*#__PURE__*/React.createElement("div", {
    className: "lsl-admin__card",
    key: l.id
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-field",
    style: {
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("label", null, "Area / Town"), /*#__PURE__*/React.createElement("input", {
    className: "lsl-input",
    value: l.name,
    onChange: e => upd(l.id, 'name', e.target.value),
    placeholder: "Park Ridge, IL"
  })), /*#__PURE__*/React.createElement("button", {
    className: "lsl-admin__del lsl-admin__del--text",
    onClick: () => del(l.id)
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "trash-2"
  }), " Remove"))), /*#__PURE__*/React.createElement("button", {
    className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
    onClick: add
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "plus"
  }), " Add location"));
}

/* ---------- Bookings ---------- */
function BooksTab(_ref6) {
  var force = _ref6.force;
  var books = LSL.getBooks().slice().sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  useEffectAd(() => {
    if (window.lucide) window.lucide.createIcons();
  });
  var cancel = bk => {
    LSL.setBooks(LSL.getBooks().filter(b => b.id !== bk.id));
    LSL.setSlots(LSL.getSlots().map(s => s.id === bk.slotId ? _objectSpread(_objectSpread({}, s), {}, {
      status: 'open',
      bookingId: undefined
    }) : s));
    force();
  };
  if (books.length === 0) return /*#__PURE__*/React.createElement("p", {
    className: "lsl-body lsl-body--sm",
    style: {
      color: 'var(--fg3)'
    }
  }, "No bookings yet. They'll appear here as families reserve openings.");
  var DOWN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return /*#__PURE__*/React.createElement("div", {
    className: "lsl-admin__list"
  }, books.map(bk => {
    var req = bk.mode === 'request';
    var t = LSL.typeById(bk.typeId);
    var l = LSL.locById(bk.locId);
    return /*#__PURE__*/React.createElement("div", {
      className: "lsl-admin__booking",
      key: bk.id
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-admin__bookhead"
    }, /*#__PURE__*/React.createElement("strong", null, bk.athlete), req ? /*#__PURE__*/React.createElement("span", {
      className: "lsl-pill lsl-pill--outline"
    }, "Request \xB7 ", DOWN[bk.dow], "s \xB7 ", LSL.fmtTime(bk.reqTime)) : /*#__PURE__*/React.createElement("span", {
      className: "lsl-pill lsl-pill--sky"
    }, LSL.fmtDate(bk.date), " \xB7 ", LSL.fmtTime(bk.time))), /*#__PURE__*/React.createElement("div", {
      className: "lsl-admin__bookmeta"
    }, req ? /*#__PURE__*/React.createElement(React.Fragment, null, bk.serviceName, " \xB7 ", bk.players, " players") : /*#__PURE__*/React.createElement(React.Fragment, null, bk.serviceName || t.name, " \xB7 ", l.name), /*#__PURE__*/React.createElement("br", null), "Parent: ", bk.parent, " \xB7 ", bk.email, bk.phone ? ' · ' + bk.phone : '', /*#__PURE__*/React.createElement("br", null), bk.age ? 'Age/Grade: ' + bk.age + ' · ' : '', bk.focus ? 'Focus: ' + bk.focus : '', bk.notes ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("br", null), "Notes: ", bk.notes) : null), /*#__PURE__*/React.createElement("div", {
      className: "lsl-admin__bookactions"
    }, !req && /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
      onClick: () => LSL.downloadICS(bk)
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "calendar-plus"
    }), " .ics"), /*#__PURE__*/React.createElement("button", {
      className: "lsl-admin__del lsl-admin__del--text",
      onClick: () => cancel(bk)
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "x"
    }), " ", req ? 'Remove request' : 'Cancel & reopen')));
  }));
}

/* ---------- Settings ---------- */
function SettingsTab(_ref7) {
  var force = _ref7.force;
  var _useStateAd13 = useStateAd(''),
    _useStateAd14 = _slicedToArray(_useStateAd13, 2),
    np = _useStateAd14[0],
    setNp = _useStateAd14[1];
  var _useStateAd15 = useStateAd(LSL.getWeb3Key()),
    _useStateAd16 = _slicedToArray(_useStateAd15, 2),
    w3 = _useStateAd16[0],
    setW3 = _useStateAd16[1];
  var _useStateAd17 = useStateAd(''),
    _useStateAd18 = _slicedToArray(_useStateAd17, 2),
    savedMsg = _useStateAd18[0],
    setSavedMsg = _useStateAd18[1];
  useEffectAd(() => {
    if (window.lucide) window.lucide.createIcons();
  });
  var flash = m => {
    setSavedMsg(m);
    setTimeout(() => setSavedMsg(''), 2200);
  };
  var savePass = () => {
    if (np.trim()) {
      LSL.setPass(np.trim());
      setNp('');
      flash('Passcode updated.');
    }
  };
  var saveW3 = () => {
    LSL.setWeb3Key(w3.trim());
    flash('Web3Forms key saved.');
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "lsl-admin__card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-field",
    style: {
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("label", null, "Web3Forms Access Key"), /*#__PURE__*/React.createElement("input", {
    className: "lsl-input",
    value: w3,
    onChange: e => setW3(e.target.value),
    placeholder: "paste your web3forms access key"
  })), /*#__PURE__*/React.createElement("p", {
    className: "lsl-body lsl-body--sm",
    style: {
      marginTop: 0,
      color: 'var(--fg3)'
    }
  }, "Get a free key at web3forms.com. With it set, every booking emails you the full player & parent details before the family is sent to Stripe."), /*#__PURE__*/React.createElement("button", {
    className: "lsl-btn lsl-btn--primary lsl-btn--sm",
    onClick: saveW3
  }, "Save key")), /*#__PURE__*/React.createElement("div", {
    className: "lsl-admin__card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-field",
    style: {
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("label", null, "Change passcode"), /*#__PURE__*/React.createElement("input", {
    className: "lsl-input",
    value: np,
    onChange: e => setNp(e.target.value),
    placeholder: "New passcode"
  })), /*#__PURE__*/React.createElement("button", {
    className: "lsl-btn lsl-btn--primary lsl-btn--sm",
    onClick: savePass
  }, "Save passcode")), savedMsg && /*#__PURE__*/React.createElement("p", {
    className: "lsl-err",
    style: {
      color: 'var(--success)'
    }
  }, savedMsg), /*#__PURE__*/React.createElement("div", {
    className: "lsl-bknote",
    style: {
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "info"
  }), /*#__PURE__*/React.createElement("span", null, "Availability, bookings, and settings save to ", /*#__PURE__*/React.createElement("strong", null, "this browser only"), ". For live multi-device booking and automatic calendar sync, this connects to a backend in a developer handoff.")));
}
Object.assign(window, {
  CoachAdminPage
});
