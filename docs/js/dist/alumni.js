function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
/* global React, SectionHead, Star6 */
function ImpactBand() {
  var stats = [['28', 'Travel Teams Coached'], ['300+', 'Athletes Trained'], ['45', 'Recruitment Offers'], ['12', 'College Commitments']];
  return /*#__PURE__*/React.createElement("section", {
    className: "lsl-statsband"
  }, stats.map(_ref => {
    var _ref2 = _slicedToArray(_ref, 2),
      n = _ref2[0],
      l = _ref2[1];
    return /*#__PURE__*/React.createElement("div", {
      className: "lsl-stat",
      key: l
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-stat__num"
    }, n), /*#__PURE__*/React.createElement("div", {
      className: "lsl-stat__lbl"
    }, l));
  }));
}

/* Graded trading cards — front/back PSA slabs cropped from the owner's art.
   Add a player by dropping front/back images in assets/cards/ and adding a row. */
var ALUMS = [{
  name: 'Jenna Roth',
  commit: 'Olney Central College',
  detail: 'Guard · Blue Knights · Class of 2029',
  ar: '512 / 932',
  front: 'assets/cards/jenna-front.png',
  back: 'assets/cards/jenna-back.png'
}, {
  name: 'Kaylie Conklin',
  commit: 'North Central College',
  detail: 'Cardinals · Class of 2029',
  ar: '512 / 932',
  front: 'assets/cards/kaylie-front.png',
  back: 'assets/cards/kaylie-back.png'
}];
function FlipCard(_ref3) {
  var a = _ref3.a;
  var _React$useState = React.useState(false),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    flipped = _React$useState2[0],
    setFlipped = _React$useState2[1];
  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    className: "lsl-cardunit"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: 'lsl-cardflip' + (flipped ? ' is-flipped' : ''),
    style: {
      aspectRatio: a.ar
    },
    "aria-pressed": flipped,
    "aria-label": (flipped ? 'Show front of ' : 'Show stats for ') + a.name + ' trading card',
    onClick: () => setFlipped(f => !f)
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-cardflip__inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-cardflip__face lsl-cardflip__face--front"
  }, /*#__PURE__*/React.createElement("img", {
    src: a.front,
    alt: a.name + ' — graded trading card, front'
  })), /*#__PURE__*/React.createElement("div", {
    className: "lsl-cardflip__face lsl-cardflip__face--back"
  }, /*#__PURE__*/React.createElement("img", {
    src: a.back,
    alt: a.name + ' — graded trading card, back'
  })))), /*#__PURE__*/React.createElement("div", {
    className: "lsl-cardunit__meta"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "lsl-cardunit__name"
  }, a.name), /*#__PURE__*/React.createElement("div", {
    className: "lsl-cardunit__commit"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), /*#__PURE__*/React.createElement("span", null, "Committed \xB7 ", a.commit)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "lsl-cardunit__hint"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "repeat"
  }), "Tap card to flip"))));
}
function AlumniStories() {
  return /*#__PURE__*/React.createElement("section", {
    className: "lsl-section lsl-section--cream"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-wrap"
  }, /*#__PURE__*/React.createElement(SectionHead, {
    center: true,
    eyebrow: "Alumni Success Stories",
    title: "Where Our Players Are Now",
    sub: "Former Legends who carried the foundation \u2014 skill, IQ, and discipline \u2014 to the next level. Flip each graded card for the full story."
  }), /*#__PURE__*/React.createElement("div", {
    className: "lsl-cards"
  }, ALUMS.map(a => /*#__PURE__*/React.createElement(FlipCard, {
    a: a,
    key: a.name
  })))));
}
var OFFERS = [['platteville', 'UW–Platteville'], ['winona', 'Winona State'], ['asbury', 'Asbury University'], ['augustana', 'Augustana College'], ['aurora', 'Aurora University'], ['benedictine', 'Benedictine University'], ['carthage', 'Carthage College'], ['depauw', 'DePauw University'], ['dominican', 'Dominican University'], ['embry-riddle', 'Embry–Riddle'], ['hamline', 'Hamline University'], ['haverford', 'Haverford College'], ['lake-forest', 'Lake Forest College'], ['loras', 'Loras College'], ['north-central', 'North Central College'], ['olney-central', 'Olney Central College'], ['san-bernardino', 'San Bernardino Valley College'], ['st-norbert', 'St. Norbert College'], ['eau-claire', 'UW–Eau Claire']];
function Offers() {
  var loop = OFFERS.concat(OFFERS);
  return /*#__PURE__*/React.createElement("section", {
    className: "lsl-section lsl-section--ink"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-wrap"
  }, /*#__PURE__*/React.createElement(SectionHead, {
    light: true,
    center: true,
    eyebrow: "Recruitment",
    title: "Offers Received From",
    sub: "A growing list of programs that have recruited LakeShore Legends athletes."
  })), /*#__PURE__*/React.createElement("div", {
    className: "lsl-marq",
    "aria-label": "Colleges that have recruited our athletes"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-marq__track"
  }, loop.map((_ref4, i) => {
    var _ref5 = _slicedToArray(_ref4, 2),
      slug = _ref5[0],
      name = _ref5[1];
    return /*#__PURE__*/React.createElement("div", {
      className: "lsl-marqitem",
      key: slug + i,
      "aria-hidden": i >= OFFERS.length ? 'true' : undefined
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-marqitem__tile"
    }, /*#__PURE__*/React.createElement("img", {
      src: 'assets/logos/' + slug + '.png',
      alt: name + ' logo',
      loading: "lazy"
    })), /*#__PURE__*/React.createElement("span", {
      className: "lsl-marqitem__name"
    }, name));
  }))));
}
Object.assign(window, {
  ImpactBand,
  AlumniStories,
  Offers
});
