"use strict";

function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
/* global React, SectionHead */
var TESTIMONIALS = [{
  quote: ["While many coaches are knowledgeable about basketball, most struggle to get their messages across and implement their ideas effectively. However, Coach Gio is able to share his basketball knowledge and analytical skill in a way that works well for his players on and off the court.", "What really makes him stand out, though, is his ability to establish strong connections with his players. He builds real relationships, and because of that, he understands us on a deeper level. That connection makes a huge difference in how he trains & coaches us, and it made me want to play harder for him.", "Overall, Coach Gio is a genuine guy who knows how to bring the best out of his players and his teams."],
  name: 'Keller McGovern',
  loc: 'IL · Athlete'
}, {
  quote: ["My son had the opportunity to play for Coach Gio last season as a 7th grader, and I was very impressed with his ability to instill such a strong work ethic and mature attitude in his boys. He runs a well-organized practice and always ensures his players are working hard.", "I've always been one to say \"you play how you practice,\" and my son surely grew as a player this past season. I'd recommend Coach Gio to anyone willing to work hard that's looking to develop their skills."],
  name: 'Jeremy Slater',
  loc: 'IN · Parent'
}, {
  quote: ["Over their last two seasons together, Coach Gio was a huge factor in my daughter's basketball development. Between coaching her school basketball team and private training in the off season, we saw tremendous growth in both her abilities and her love for the game.", "Gio brings a holistic approach to coaching with emphasis on relationship building, character development, basketball skill, and competitiveness. Our daughter has achieved goals we never dreamed possible with Gio playing a big part in her journey."],
  name: 'Vanessa Stoller',
  loc: 'IN · Parent'
}, {
  quote: ["No matter what drills we were doing, Coach Gio made every practice fun and engaging. Whether we were winning or losing, he always stayed positive and encouraging, which really helped keep me mentally strong on the court.", "Coach Gio helped me greatly improve my shooting ability, and more importantly, helped me gain confidence on the court during games. I always looked forward to game days when he was coaching.", "Not only was he a great all-around coach, he was also someone who truly cared about us as players."],
  name: 'Emily Bunger',
  loc: 'IN · Athlete'
}, {
  quote: ["Coach Gio gave Emma such a great start to her basketball career over the last two years! His personable and approachable nature helped the girls feel very comfortable with him in their training sessions, and they learned a LOT under his guidance!", "Seeing the girls come together and support each other both on and off the court has been so nice. Thank you for helping to develop Emma's self-confidence and for making her middle school basketball memories so fun!"],
  name: 'Kristin Bruce',
  loc: 'IN · Parent'
}, {
  quote: ["Before starting LakeShore Legends, Gio coached my program's 9th & 11th grade Legacy Force teams and did a wonderful job. His ability to connect with his players especially stood out, as they trusted him and bought into what he was teaching.", "Without that buy-in, there's no real influence to help elevate a player's game, but Gio achieved it consistently. He did a wonderful job leading and developing his teams all season long."],
  name: 'Donte Wilburn',
  loc: 'Program Director'
}, {
  quote: ["Coach Gio is great at teaching guard fundamentals and team play. He is extremely encouraging and helped me develop confidence in my own ability.", "Outside of team events, he often took the time to help me work on my jump shot and consistently gave me personalized drills to work on. Our private training sessions were always very intense and productive long-term."],
  name: 'Sofia Paniagua',
  loc: 'Athlete'
}];
function Testimonials() {
  var _React$useState = React.useState(0),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    i = _React$useState2[0],
    setI = _React$useState2[1];
  var t = TESTIMONIALS[i];
  return /*#__PURE__*/React.createElement("section", {
    className: "lsl-section lsl-section--cream"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-wrap"
  }, /*#__PURE__*/React.createElement(SectionHead, {
    full: true,
    eyebrow: "What Our Community Says",
    title: "Hear From The Families Who Have Experienced Our Development Model Firsthand"
  }), /*#__PURE__*/React.createElement("div", {
    className: "lsl-testimonial"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-quotemark"
  }, "\u201C"), /*#__PURE__*/React.createElement("blockquote", {
    className: "lsl-testimonial__quote"
  }, Array.isArray(t.quote) ? t.quote.map(function (p, i) {
    return /*#__PURE__*/React.createElement("p", {
      key: i
    }, p);
  }) : t.quote), /*#__PURE__*/React.createElement("div", {
    className: "lsl-testimonial__by"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-avatar"
  }, t.name.split(' ').map(function (s) {
    return s[0];
  }).join('')), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "lsl-testimonial__name"
  }, t.name), /*#__PURE__*/React.createElement("div", {
    className: "lsl-testimonial__loc"
  }, t.loc))), /*#__PURE__*/React.createElement("div", {
    className: "lsl-dots"
  }, TESTIMONIALS.map(function (_, k) {
    return /*#__PURE__*/React.createElement("button", {
      key: k,
      className: 'lsl-dot' + (k === i ? ' is-active' : ''),
      onClick: function onClick() {
        return setI(k);
      },
      "aria-label": 'Testimonial ' + (k + 1)
    });
  })))));
}
Object.assign(window, {
  Testimonials: Testimonials
});
