"use strict";

function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
/* global React, SectionHead */
function AboutHero() {
  return /*#__PURE__*/React.createElement("section", {
    className: "lsl-pagehero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-pagehero__glow is-orange"
  }), /*#__PURE__*/React.createElement("img", {
    className: "lsl-pagehero__spire",
    src: "assets/mark-spire-stars.png",
    alt: "",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    className: "lsl-pagehero__inner"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lsl-eyebrow lsl-eyebrow--light"
  }, "Who We Are"), /*#__PURE__*/React.createElement("h1", {
    className: "lsl-display lsl-display--md"
  }, "About LakeShore Legends Basketball"), /*#__PURE__*/React.createElement("p", {
    className: "lsl-lede",
    style: {
      maxWidth: '100%',
      color: 'var(--fg-on-dark-2)'
    }
  }, "A development-driven basketball organization built on elite training standards, intentional teaching,", /*#__PURE__*/React.createElement("br", null), "and long-term athlete growth \u2014 developing complete basketball players both on and off the court.")));
}
function MissionVision() {
  var items = [['Mission', 'To develop complete basketball players through elite training, intentional teaching, and purposeful competition.'], ['Vision', 'To become a nationally respected development program known for skilled, intelligent, and disciplined athletes prepared to succeed at every level.'], ['Engagement', 'We set a new standard for youth basketball with a training-first mindset. Practices are demanding by design so that games feel simple.']];
  return /*#__PURE__*/React.createElement("section", {
    className: "lsl-section lsl-section--cream"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-wrap lsl-mvgrid"
  }, items.map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
      h = _ref2[0],
      b = _ref2[1];
    return /*#__PURE__*/React.createElement("div", {
      className: "lsl-mvcard",
      key: h
    }, /*#__PURE__*/React.createElement("span", {
      className: "lsl-label"
    }, h, " Statement"), /*#__PURE__*/React.createElement("p", {
      className: "lsl-body"
    }, b));
  })));
}
function CorePrinciples() {
  var vals = [['Leadership', 'Taking ownership of preparation, effort, and growth — both on and off the court.'], ['Effort', 'Competing with intention and purpose in every rep, drill, and game.'], ['Grit', 'Embracing adversity, staying resilient, working through challenges.'], ['Energy', 'Showing up committed and ready, day after day, regardless of circumstances.'], ['No Excuses', 'Focus, drive, and resolve in the relentless pursuit of development.'], ['Discipline', 'Habits and decisions that support structure, growth, and team success.'], ['Sportsmanship', 'Respect and a willingness to learn in everything we do.']];
  return /*#__PURE__*/React.createElement("section", {
    className: "lsl-section lsl-section--ink"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-wrap"
  }, /*#__PURE__*/React.createElement(SectionHead, {
    center: true,
    wide: true,
    light: true,
    eyebrow: "Core Principles",
    title: "What Turns Players Into Legends",
    sub: "Foundational expectations within our program \u2014 for every athlete, every day."
  }), /*#__PURE__*/React.createElement("div", {
    className: "lsl-principles"
  }, vals.map(function (_ref3, idx) {
    var _ref4 = _slicedToArray(_ref3, 2),
      h = _ref4[0],
      b = _ref4[1];
    return /*#__PURE__*/React.createElement("div", {
      className: "lsl-principle",
      key: h
    }, /*#__PURE__*/React.createElement("span", {
      className: "lsl-principle__num"
    }, String(idx + 1).padStart(2, '0')), /*#__PURE__*/React.createElement("h3", {
      className: "lsl-h4 lsl-h4--light"
    }, h), /*#__PURE__*/React.createElement("p", {
      className: "lsl-body lsl-body--sm lsl-body--light"
    }, b));
  }))));
}
function CoachCard() {
  return /*#__PURE__*/React.createElement("section", {
    className: "lsl-section lsl-section--cream"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-wrap"
  }, /*#__PURE__*/React.createElement(SectionHead, {
    eyebrow: "Meet Our Coaches",
    title: "Coaching Staff"
  }), /*#__PURE__*/React.createElement("div", {
    className: "lsl-coach"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-coach__media"
  }, /*#__PURE__*/React.createElement("img", {
    className: "lsl-photo",
    src: "uploads/Coach_Paganis-e1768944691510.jpg",
    alt: "Coach Gio Paganis",
    style: {
      width: '100%',
      height: '500px',
      objectFit: 'cover',
      objectPosition: '50% 25%',
      borderRadius: '16px',
      display: 'block'
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "lsl-coach__body"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "lsl-h2"
  }, "Coach Gio Paganis"), /*#__PURE__*/React.createElement("div", {
    className: "lsl-coach__roles"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lsl-pill lsl-pill--orange"
  }, "Founder & Owner"), /*#__PURE__*/React.createElement("span", {
    className: "lsl-pill lsl-pill--sky"
  }, "Jr. Mustangs Director"), /*#__PURE__*/React.createElement("span", {
    className: "lsl-pill lsl-pill--outline"
  }, "Shooting Specialist")), /*#__PURE__*/React.createElement("p", {
    className: "lsl-body"
  }, "Gio Paganis is a passionate basketball coach from Park Ridge, Illinois and the proud Owner of LakeShore Legends Basketball. A former student-athlete and Purdue M.S. graduate, Coach Gio has spent over a decade refining his craft, coaching and training athletes of all ages and skill levels since age 14."), /*#__PURE__*/React.createElement("p", {
    className: "lsl-body"
  }, "Gio has coached top 17U AAU teams on the Adidas 3SSB Gold and NY2LA circuits with ALL IN Athletics, and held head coaching roles with Legacy Force AAU, Klondike Middle School, and Harrison High School feeder programs. He is currently the head Junior Varsity basketball coach at Mundelein High School and the director of the Jr. Mustangs Feeder Basketball program."), /*#__PURE__*/React.createElement("p", {
    className: "lsl-body"
  }, "As a skills trainer, he serves as a shooting specialist known for his attention to detail, player-first mentality, and commitment to maximizing player potential both on and off the court."), /*#__PURE__*/React.createElement("div", {
    className: "lsl-coach__creds"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Purdue University"), /*#__PURE__*/React.createElement("span", null, "M.S. Human Resource Mgmt")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "10+ Years"), /*#__PURE__*/React.createElement("span", null, "Coaching & Training")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "Former"), /*#__PURE__*/React.createElement("span", null, "Collegiate Athlete")))))));
}
Object.assign(window, {
  AboutHero: AboutHero,
  MissionVision: MissionVision,
  CorePrinciples: CorePrinciples,
  CoachCard: CoachCard
});
