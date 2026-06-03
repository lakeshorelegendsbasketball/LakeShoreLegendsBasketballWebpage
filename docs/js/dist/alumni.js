/* global React, SectionHead, Star6 */
function CountUpAlumni({
  value
}) {
  const m = String(value).match(/^(\d+)(.*)$/);
  const target = m ? parseInt(m[1], 10) : 0;
  const suffix = m ? m[2] : '';
  const [n, setN] = React.useState(0);
  const ref = React.useRef(null);
  React.useEffect(() => {
    let raf,
      started = false;
    const run = () => {
      started = true;
      const dur = 2400,
        t0 = performance.now();
      const tick = now => {
        const p = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        setN(Math.round(eased * target));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !started) run();
      });
    }, {
      threshold: 0.4
    });
    if (ref.current) io.observe(ref.current);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [target]);
  return /*#__PURE__*/React.createElement("div", {
    className: "lsl-stat__num",
    ref: ref
  }, n, suffix);
}
function ImpactBand() {
  const stats = [['24', 'Travel Teams Coached'], ['250+', 'Dedicated Athletes Trained'], ['25+', 'Unique College Recruitment Offers'], ['7+', 'College Basketball Commitments']];
  return /*#__PURE__*/React.createElement("section", {
    className: "lsl-statsband"
  }, stats.map(([n, l]) => /*#__PURE__*/React.createElement("div", {
    className: "lsl-stat",
    key: l
  }, /*#__PURE__*/React.createElement(CountUpAlumni, {
    value: n
  }), /*#__PURE__*/React.createElement("div", {
    className: "lsl-stat__lbl"
  }, l))));
}

/* Graded trading cards — front/back PSA slabs cropped from the owner's art.
   Add a player by dropping front/back images in assets/cards/ and adding a row. */
const ALUMS = [{
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
function FlipCard({
  a
}) {
  const [flipped, setFlipped] = React.useState(false);
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
const OFFERS = [['platteville', 'UW–Platteville'], ['winona', 'Winona State'], ['asbury', 'Asbury University'], ['augustana', 'Augustana College'], ['aurora', 'Aurora University'], ['benedictine', 'Benedictine University'], ['carthage', 'Carthage College'], ['depauw', 'DePauw University'], ['dominican', 'Dominican University'], ['embry-riddle', 'Embry–Riddle'], ['hamline', 'Hamline University'], ['haverford', 'Haverford College'], ['lake-forest', 'Lake Forest College'], ['loras', 'Loras College'], ['north-central', 'North Central College'], ['olney-central', 'Olney Central College'], ['san-bernardino', 'San Bernardino Valley College'], ['st-norbert', 'St. Norbert College'], ['eau-claire', 'UW–Eau Claire']];
function Offers() {
  const loop = OFFERS.concat(OFFERS);
  return /*#__PURE__*/React.createElement("section", {
    className: "lsl-section lsl-section--ink"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-wrap"
  }, /*#__PURE__*/React.createElement(SectionHead, {
    light: true,
    center: true,
    wide: true,
    eyebrow: "Recruitment",
    title: "Offers Received From",
    sub: "A growing list of programs that have recruited LakeShore Legends athletes."
  })), /*#__PURE__*/React.createElement("div", {
    className: "lsl-marq",
    "aria-label": "Colleges that have recruited our athletes"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-marq__track"
  }, loop.map(([slug, name], i) => /*#__PURE__*/React.createElement("div", {
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
  }, name))))));
}
Object.assign(window, {
  ImpactBand,
  AlumniStories,
  Offers
});
