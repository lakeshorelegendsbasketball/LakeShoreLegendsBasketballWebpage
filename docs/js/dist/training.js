"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
/* global React, SectionHead, Star6 */
var _React = React,
  useStateTr = _React.useState;
var EVENTS = [{
  mon: 'Jun',
  day: '15',
  yr: '2026',
  title: 'Summer Skills Camp — Week 1',
  type: 'Summer Camp',
  typeClass: 'lsl-pill--orange',
  when: 'Jun 15–19 · 9:00a–12:00p',
  where: 'Park Ridge, IL',
  ages: 'Rising 3rd–8th · Ages 8–14',
  spots: 'open'
}, {
  mon: 'Jun',
  day: '28',
  yr: '2026',
  title: 'Elite Shooting Clinic',
  type: 'Small Group',
  typeClass: 'lsl-pill--sky',
  when: 'Jun 28 · 1:00p–3:30p',
  where: 'Park Ridge, IL',
  ages: 'Rising 6th–12th',
  spots: 'low'
}, {
  mon: 'Jul',
  day: '13',
  yr: '2026',
  title: 'Summer Skills Camp — Week 2',
  type: 'Summer Camp',
  typeClass: 'lsl-pill--orange',
  when: 'Jul 13–17 · 9:00a–12:00p',
  where: 'Park Ridge, IL',
  ages: 'Rising 3rd–8th · Ages 8–14',
  spots: 'open'
}, {
  mon: 'Sep',
  day: '07',
  yr: '2026',
  title: 'Labor Day School-Off Camp',
  type: 'Day-Off Camp',
  typeClass: 'lsl-pill--navy',
  when: 'Sep 7 · 9:00a–2:00p',
  where: 'Park Ridge, IL',
  ages: 'Rising 4th–9th',
  spots: 'open'
}];
var SPOT_TEXT = {
  open: 'Spots Available',
  low: 'Almost Full',
  full: 'Waitlist Only'
};
function RegisterModal(_ref) {
  var event = _ref.event,
    onClose = _ref.onClose;
  var _useStateTr = useStateTr({
      parent: '',
      athlete: '',
      email: '',
      grade: ''
    }),
    _useStateTr2 = _slicedToArray(_useStateTr, 2),
    form = _useStateTr2[0],
    setForm = _useStateTr2[1];
  var _useStateTr3 = useStateTr(false),
    _useStateTr4 = _slicedToArray(_useStateTr3, 2),
    sent = _useStateTr4[0],
    setSent = _useStateTr4[1];
  var set = function set(k) {
    return function (e) {
      return setForm(_objectSpread(_objectSpread({}, form), {}, _defineProperty({}, k, e.target.value)));
    };
  };
  var submit = function submit(e) {
    e.preventDefault();
    setSent(true);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "lsl-lightbox",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-form",
    style: {
      maxWidth: 460,
      width: '100%'
    },
    onClick: function onClick(e) {
      return e.stopPropagation();
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "lsl-lightbox__close",
    onClick: onClose,
    "aria-label": "Close",
    style: {
      position: 'absolute',
      top: 18,
      right: 18
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "x"
  })), sent ? /*#__PURE__*/React.createElement("div", {
    className: "lsl-formsuccess"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-formsuccess__ico"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "check"
  })), /*#__PURE__*/React.createElement("h3", {
    className: "lsl-h3"
  }, "You're on the list!"), /*#__PURE__*/React.createElement("p", {
    className: "lsl-body lsl-body--sm",
    style: {
      margin: 0
    }
  }, "Thanks for registering for ", /*#__PURE__*/React.createElement("strong", null, event.title), ". We'll email confirmation and payment details to ", form.email || 'you', " shortly.")) : /*#__PURE__*/React.createElement("form", {
    onSubmit: submit
  }, /*#__PURE__*/React.createElement("span", {
    className: "lsl-eyebrow"
  }, "Reserve a Spot"), /*#__PURE__*/React.createElement("h3", {
    className: "lsl-h3",
    style: {
      marginTop: 4,
      marginBottom: 4
    }
  }, event.title), /*#__PURE__*/React.createElement("p", {
    className: "lsl-body lsl-body--sm",
    style: {
      color: 'var(--fg3)'
    }
  }, event.when, " \xB7 ", event.where), /*#__PURE__*/React.createElement("div", {
    className: "lsl-field"
  }, /*#__PURE__*/React.createElement("label", null, "Parent / Guardian Name"), /*#__PURE__*/React.createElement("input", {
    className: "lsl-input",
    value: form.parent,
    onChange: set('parent'),
    required: true,
    placeholder: "Jane Smith"
  })), /*#__PURE__*/React.createElement("div", {
    className: "lsl-field"
  }, /*#__PURE__*/React.createElement("label", null, "Athlete Name"), /*#__PURE__*/React.createElement("input", {
    className: "lsl-input",
    value: form.athlete,
    onChange: set('athlete'),
    required: true,
    placeholder: "Alex Smith"
  })), /*#__PURE__*/React.createElement("div", {
    className: "lsl-field lsl-field--row"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Email"), /*#__PURE__*/React.createElement("input", {
    className: "lsl-input",
    type: "email",
    value: form.email,
    onChange: set('email'),
    required: true,
    placeholder: "you@email.com"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Athlete Grade"), /*#__PURE__*/React.createElement("input", {
    className: "lsl-input",
    value: form.grade,
    onChange: set('grade'),
    required: true,
    placeholder: "7th"
  }))), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "lsl-btn lsl-btn--primary lsl-form__submit"
  }, "Confirm Registration"))));
}
function UpcomingEvents() {
  var _useStateTr5 = useStateTr(null),
    _useStateTr6 = _slicedToArray(_useStateTr5, 2),
    active = _useStateTr6[0],
    setActive = _useStateTr6[1];
  React.useEffect(function () {
    if (window.lucide) window.lucide.createIcons();
  }, [active]);
  return /*#__PURE__*/React.createElement("section", {
    className: "lsl-section lsl-section--cream"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-wrap"
  }, /*#__PURE__*/React.createElement(SectionHead, {
    eyebrow: "Upcoming Events",
    title: "Camps & Clinics \u2014 Reserve Your Spot",
    sub: "New sessions are added throughout the season. Registration takes under a minute \u2014 pick a date and we'll handle the rest."
  }), /*#__PURE__*/React.createElement("div", {
    className: "lsl-events"
  }, EVENTS.map(function (ev) {
    return /*#__PURE__*/React.createElement("div", {
      className: "lsl-event",
      key: ev.title
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-event__date"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-event__mon"
    }, ev.mon), /*#__PURE__*/React.createElement("div", {
      className: "lsl-event__day"
    }, ev.day), /*#__PURE__*/React.createElement("div", {
      className: "lsl-event__yr"
    }, ev.yr)), /*#__PURE__*/React.createElement("div", {
      className: "lsl-event__body"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-event__tags"
    }, /*#__PURE__*/React.createElement("span", {
      className: 'lsl-pill ' + ev.typeClass
    }, ev.type)), /*#__PURE__*/React.createElement("h3", {
      className: "lsl-event__title"
    }, ev.title), /*#__PURE__*/React.createElement("div", {
      className: "lsl-event__meta"
    }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "clock"
    }), ev.when), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "map-pin"
    }), ev.where), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "users"
    }), ev.ages))), /*#__PURE__*/React.createElement("div", {
      className: "lsl-event__cta"
    }, /*#__PURE__*/React.createElement("span", {
      className: 'lsl-event__spots' + (ev.spots === 'low' ? ' is-low' : ev.spots === 'full' ? ' is-full' : '')
    }, SPOT_TEXT[ev.spots]), /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--primary lsl-btn--sm",
      onClick: function onClick() {
        return setActive(ev);
      }
    }, "Register")));
  }))), active && /*#__PURE__*/React.createElement(RegisterModal, {
    event: active,
    onClose: function onClose() {
      return setActive(null);
    }
  }));
}
function Programs() {
  var progs = [{
    slot: 'prog-private',
    tag: '1-on-1',
    tagClass: 'lsl-pill--sky',
    title: 'Private & Small Group Training',
    age: 'All Ages & Skill Levels',
    points: ['Individual skill-development plans', 'Position-specific training and reads', 'Direct feedback, accountability & consistency'],
    btn: 'Inquire Now',
    href: 'contact.html',
    external: false
  }, {
    slot: 'prog-summer',
    tag: 'Summer',
    tagClass: 'lsl-pill--orange',
    title: 'Jr. Mustangs Feeder Basketball Summer Camp',
    age: 'Rising 3rd–8th · Ages 8–14',
    points: ['Core skills: shooting, footwork, ball handling & more', 'Guided instruction, competitive games & interactive drills', 'Builds positive habits, effort, and love for the game'],
    btn: 'Sign Up Now',
    href: 'https://mundyball.com/camps',
    external: true
  }, {
    slot: 'prog-dayoff',
    tag: 'Holidays',
    tagClass: 'lsl-pill--navy',
    title: 'School Day-Off Camps',
    age: 'MLK Day · Labor Day & More',
    points: ['High-intensity training on scheduled school closures', 'Focused skill work and competitive drills', 'Centered on basketball IQ and game transfer'],
    btn: 'Inquire Now',
    href: 'contact.html',
    external: false
  }];
  return /*#__PURE__*/React.createElement("section", {
    className: "lsl-section lsl-section--cream",
    style: {
      paddingTop: 'var(--sp-7)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-wrap"
  }, /*#__PURE__*/React.createElement(SectionHead, {
    center: true,
    wide: true,
    eyebrow: "Training & Camp Offerings",
    title: "Built Around Intentional Development",
    sub: "Every offering meets athletes where they are while setting clear standards for effort, accountability, and long-term growth."
  }), /*#__PURE__*/React.createElement("div", {
    className: "lsl-programs"
  }, progs.map(function (p) {
    return /*#__PURE__*/React.createElement("div", {
      className: "lsl-program",
      key: p.title
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-program__media"
    }, /*#__PURE__*/React.createElement("image-slot", {
      id: p.slot,
      shape: "rect",
      placeholder: 'Drop a ' + p.title + ' photo'
    }), /*#__PURE__*/React.createElement("span", {
      className: 'lsl-program__tag lsl-pill ' + p.tagClass
    }, p.tag)), /*#__PURE__*/React.createElement("div", {
      className: "lsl-program__body"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "lsl-program__title"
    }, p.title), /*#__PURE__*/React.createElement("div", {
      className: "lsl-program__age"
    }, p.age), /*#__PURE__*/React.createElement("ul", {
      className: "lsl-program__list"
    }, p.points.map(function (pt) {
      return /*#__PURE__*/React.createElement("li", {
        key: pt
      }, /*#__PURE__*/React.createElement(Star6, {
        size: 13
      }), pt);
    })), /*#__PURE__*/React.createElement("div", {
      className: "lsl-program__foot"
    }, /*#__PURE__*/React.createElement("a", _extends({
      className: "lsl-btn lsl-btn--primary lsl-btn--sm",
      href: p.href
    }, p.external ? {
      target: '_blank',
      rel: 'noopener'
    } : {}), p.btn))));
  }))));
}
function SkillsFocus() {
  var skills = [['target', 'Shooting'], ['footprints', 'Footwork'], ['circle-dot', 'Ball Handling'], ['shield', 'Screening'], ['arrow-up-from-line', 'Rebounding'], ['send', 'Passing'], ['hand', 'Defending']];
  return /*#__PURE__*/React.createElement("section", {
    className: "lsl-section lsl-section--ink"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-wrap"
  }, /*#__PURE__*/React.createElement(SectionHead, {
    light: true,
    center: true,
    wide: true,
    eyebrow: "Every Session Covers",
    title: "The Fundamentals That Translate"
  }), /*#__PURE__*/React.createElement("div", {
    className: "lsl-skills"
  }, skills.map(function (_ref2) {
    var _ref3 = _slicedToArray(_ref2, 2),
      ico = _ref3[0],
      name = _ref3[1];
    return /*#__PURE__*/React.createElement("div", {
      className: "lsl-skill",
      key: name
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-skill__ico"
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": ico
    })), /*#__PURE__*/React.createElement("span", {
      className: "lsl-skill__name"
    }, name));
  }))));
}
Object.assign(window, {
  UpcomingEvents: UpcomingEvents,
  Programs: Programs,
  SkillsFocus: SkillsFocus
});
