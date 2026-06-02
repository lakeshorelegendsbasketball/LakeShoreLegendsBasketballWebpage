"use strict";

function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
/* global React, SectionHead, Star6 */
function Hero() {
  return /*#__PURE__*/React.createElement("section", {
    className: "lsl-hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-hero__glow"
  }), /*#__PURE__*/React.createElement("img", {
    className: "lsl-hero__spire",
    src: "assets/mark-spire-stars.png",
    alt: "",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    className: "lsl-hero__grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-hero__copy"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lsl-eyebrow lsl-eyebrow--light"
  }, "A Training-First Basketball Program"), /*#__PURE__*/React.createElement("h1", {
    className: "lsl-display"
  }, "Chicago Roots,", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "lsl-display__accent"
  }, "National Reach")), /*#__PURE__*/React.createElement("p", {
    className: "lsl-lede"
  }, "LakeShore Legends is a development-driven basketball organization built on elite training standards and long-term athletic growth."), /*#__PURE__*/React.createElement("div", {
    className: "lsl-hero__actions"
  }, /*#__PURE__*/React.createElement("a", {
    className: "lsl-btn lsl-btn--primary",
    href: "contact.html"
  }, "Join the Program"), /*#__PURE__*/React.createElement("a", {
    className: "lsl-btn lsl-btn--ghost-light",
    href: "about.html"
  }, "Our Philosophy"))), /*#__PURE__*/React.createElement("div", {
    className: "lsl-hero__media"
  }, /*#__PURE__*/React.createElement("img", {
    className: "lsl-photo",
    src: "uploads/mundeleinvshp-30.jpg",
    alt: "Coach Gio leading a team huddle",
    style: {
      width: '100%',
      height: '420px',
      objectFit: 'cover',
      borderRadius: '20px',
      display: 'block'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "lsl-hero__badge"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lsl-hero__badge-num"
  }, "2\xD7"), /*#__PURE__*/React.createElement("span", {
    className: "lsl-hero__badge-lbl"
  }, "Practice", /*#__PURE__*/React.createElement("br", null), "vs. Play")))));
}
function CountUp(_ref) {
  var value = _ref.value;
  var m = String(value).match(/^(\d+)(.*)$/);
  var target = m ? parseInt(m[1], 10) : 0;
  var suffix = m ? m[2] : '';
  var _React$useState = React.useState(0),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    n = _React$useState2[0],
    setN = _React$useState2[1];
  var ref = React.useRef(null);
  React.useEffect(function () {
    var raf,
      started = false;
    var run = function run() {
      started = true;
      var dur = 1400,
        t0 = performance.now();
      var _tick = function tick(now) {
        var p = Math.min(1, (now - t0) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        setN(Math.round(eased * target));
        if (p < 1) raf = requestAnimationFrame(_tick);
      };
      raf = requestAnimationFrame(_tick);
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !started) run();
      });
    }, {
      threshold: 0.4
    });
    if (ref.current) io.observe(ref.current);
    return function () {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [target]);
  return /*#__PURE__*/React.createElement("div", {
    className: "lsl-stat__num",
    ref: ref
  }, n, suffix);
}
function StatsBand() {
  var stats = [['24', 'Travel Teams Coached'], ['250+', 'Dedicated Athletes Trained'], ['25+', 'Unique College Recruitment Offers'], ['7+', 'College Basketball Commitments']];
  return /*#__PURE__*/React.createElement("section", {
    className: "lsl-statsband"
  }, stats.map(function (_ref2) {
    var _ref3 = _slicedToArray(_ref2, 2),
      n = _ref3[0],
      l = _ref3[1];
    return /*#__PURE__*/React.createElement("div", {
      className: "lsl-stat",
      key: l
    }, /*#__PURE__*/React.createElement(CountUp, {
      value: n
    }), /*#__PURE__*/React.createElement("div", {
      className: "lsl-stat__lbl"
    }, l));
  }));
}
function Philosophy() {
  return /*#__PURE__*/React.createElement("section", {
    className: "lsl-section lsl-section--cream"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-wrap lsl-philosophy"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionHead, {
    eyebrow: "The Problem With Modern AAU",
    title: "Our Training-First Solution"
  }), /*#__PURE__*/React.createElement("p", {
    className: "lsl-body"
  }, "LakeShore Legends is a development-driven basketball organization built on elite training standards and long-term athletic growth. We exist to build fundamentally sound, intelligent, and competitive basketball players prepared for the next level and beyond."), /*#__PURE__*/React.createElement("p", {
    className: "lsl-body"
  }, "In today's competitive basketball landscape, many AAU programs focus heavily on playing numerous games, often at the expense of skill development and athlete well-being. This short-term mindset can hinder players' long-term potential and growth."), /*#__PURE__*/React.createElement("p", {
    className: "lsl-body"
  }, "Lake Shore Legends offers a refreshing alternative. Our training-first philosophy emphasizes skill mastery, strategic thinking, and purposeful competition. By prioritizing practice over excessive gameplay, we prepare our athletes for sustained success, equipping them with the tools needed for high school, college, and beyond."), /*#__PURE__*/React.createElement("p", {
    className: "lsl-body"
  }, "Training is the foundation of our program. While competition matters, development comes first. Long-term basketball growth requires a strong technical and mental base. Our practices are intentional, structured, and skill-focused, designed to build fundamentals before chasing outcomes. Better training creates better players, and better players naturally elevate teams."), /*#__PURE__*/React.createElement("div", {
    className: "lsl-rule"
  }), /*#__PURE__*/React.createElement("p", {
    className: "lsl-pullquote"
  }, "\"We don't just play the game. We study it.\"")), /*#__PURE__*/React.createElement("img", {
    className: "lsl-photo",
    src: "uploads/S4A6259-scaled.jpg",
    alt: "LakeShore Legends athlete defending on the ball",
    style: {
      width: '100%',
      height: '420px',
      objectFit: 'cover',
      borderRadius: '18px',
      display: 'block'
    }
  })));
}
function DevelopmentModel() {
  var cols = [{
    icon: 'calendar-x',
    tag: 'Typical AAU Model',
    title: null,
    body: ['Most AAU basketball programs only practice once or twice per week, prioritizing weekend tournaments over skill development and basketball IQ.', 'While we believe competition is important, over-competing without enough structured training often limits true improvement.'],
    muted: true
  }, {
    icon: 'repeat',
    tag: 'Our Approach',
    title: 'Skill Over Volume',
    body: 'A European-style model emphasizing repetition, fundamentals, decision-making, and long-term growth — building confident, capable players.'
  }, {
    icon: 'scale',
    tag: 'Our Standard',
    title: 'Practice 2× We Play',
    body: 'More time training between competition lets athletes learn from mistakes, build real skills, and develop habits that translate up.'
  }];
  return /*#__PURE__*/React.createElement("section", {
    className: "lsl-section lsl-section--cream",
    style: {
      paddingTop: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-wrap"
  }, /*#__PURE__*/React.createElement(SectionHead, {
    eyebrow: "Our Development Model",
    title: "Real Development Is Built In The Gym, Not On The Scoreboard",
    sub: "Our training structure is intentionally different from the typical AAU approach, because our goal is long-term player growth, not short-term program victories."
  }), /*#__PURE__*/React.createElement("div", {
    className: "lsl-cards3"
  }, cols.map(function (c) {
    return /*#__PURE__*/React.createElement("div", {
      className: 'lsl-fcard' + (c.muted ? ' lsl-fcard--muted' : ''),
      key: c.tag
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-fcard__ico"
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": c.icon
    })), /*#__PURE__*/React.createElement("span", {
      className: "lsl-label"
    }, c.tag), c.title && /*#__PURE__*/React.createElement("h3", {
      className: "lsl-h3"
    }, c.title), Array.isArray(c.body) ? c.body.map(function (p, i) {
      return /*#__PURE__*/React.createElement("p", {
        key: i,
        className: "lsl-body lsl-body--sm"
      }, p);
    }) : /*#__PURE__*/React.createElement("p", {
      className: "lsl-body lsl-body--sm"
    }, c.body));
  }))));
}
function SkillsGrid() {
  var skills = [['target', 'Shooting'], ['footprints', 'Footwork'], ['circle-dot', 'Ball Handling'], ['shield', 'Screening'], ['arrow-up-from-line', 'Rebounding'], ['send', 'Passing'], ['hand', 'Defending']];
  return /*#__PURE__*/React.createElement("section", {
    className: "lsl-section lsl-section--ink"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-wrap"
  }, /*#__PURE__*/React.createElement(SectionHead, {
    light: true,
    eyebrow: "Core Technical Skills",
    title: "What We Develop",
    sub: "Through structured training, intentional feedback, and game-realistic repetition."
  }), /*#__PURE__*/React.createElement("div", {
    className: "lsl-skills"
  }, skills.map(function (_ref4) {
    var _ref5 = _slicedToArray(_ref4, 2),
      ico = _ref5[0],
      name = _ref5[1];
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
function BasketballIQ() {
  return /*#__PURE__*/React.createElement("section", {
    className: "lsl-section lsl-section--cream"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-wrap lsl-philosophy"
  }, /*#__PURE__*/React.createElement("img", {
    className: "lsl-photo",
    src: "uploads/S4A6498-scaled.jpg",
    alt: "Coach Gio breaking down a game-time huddle",
    style: {
      width: '100%',
      height: '440px',
      objectFit: 'cover',
      borderRadius: '18px',
      display: 'block'
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionHead, {
    eyebrow: "Basketball IQ & Game Mastery",
    title: "We Don't Just Play The Game. We Study It."
  }), /*#__PURE__*/React.createElement("p", {
    className: "lsl-body"
  }, "Through purposeful film breakdown and competitive practice environments, players learn ", /*#__PURE__*/React.createElement("em", null, "why"), " plays work \u2014 not just how to run them. We teach athletes to read defenses, anticipate actions, and adapt in real time."), /*#__PURE__*/React.createElement("div", {
    className: "lsl-rule"
  }), /*#__PURE__*/React.createElement("p", {
    className: "lsl-pullquote"
  }, "\"Talent gets you noticed, but sound decision-making keeps you on the floor.\""))));
}
Object.assign(window, {
  Hero: Hero,
  StatsBand: StatsBand,
  Philosophy: Philosophy,
  DevelopmentModel: DevelopmentModel,
  SkillsGrid: SkillsGrid,
  BasketballIQ: BasketballIQ
});
