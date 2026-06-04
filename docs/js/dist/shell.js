function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* global React */
/* Shared site chrome: Header (multi-page nav), Footer, Crest, SectionHead.
   Each page is its own HTML file; nav uses real <a href> links. */
const RxShell = React;
const NAV = [{
  label: 'Home',
  href: 'home.html'
}, {
  label: 'About',
  href: 'about.html'
}, {
  label: 'Training',
  href: 'training.html'
}, {
  label: 'Alumni',
  href: 'alumni.html'
}, {
  label: 'Jr. Mustangs',
  href: 'https://mundyball.com/feeder-home',
  external: true
}, {
  label: 'Gallery',
  href: 'gallery.html'
}, {
  label: 'Contact',
  href: 'contact.html'
}];

/* Six-point Chicago-flag star — brand motif (never a 5-point ★). */
function Star6({
  size = 14,
  className = 'lsl-star6'
}) {
  return /*#__PURE__*/React.createElement("svg", {
    className: className,
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 1.6l2.0 6.0 6.3-.05-5.1 3.7 2.0 6.0-5.1-3.75-5.1 3.75 2.0-6.0-5.1-3.7 6.3.05z"
  }));
}

/* Inline brand glyphs (Lucide dropped brand icons). 24x24 viewBox. */
function SocialGlyph({
  name,
  size = 20
}) {
  const paths = {
    instagram: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "2.5",
      y: "2.5",
      width: "19",
      height: "19",
      rx: "5.5",
      ry: "5.5",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "4.2",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "17.4",
      cy: "6.6",
      r: "1.3",
      fill: "currentColor"
    })),
    x: /*#__PURE__*/React.createElement("path", {
      fill: "currentColor",
      d: "M17.3 3h2.9l-6.34 7.25L21.5 21h-5.84l-4.57-5.98L5.86 21H2.95l6.78-7.75L2.5 3h5.99l4.13 5.46L17.3 3zm-1.02 16.27h1.61L7.8 4.64H6.07l10.21 14.63z"
    }),
    linkedin: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "2.5",
      y: "2.5",
      width: "19",
      height: "19",
      rx: "2.5",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8"
    }), /*#__PURE__*/React.createElement("path", {
      fill: "currentColor",
      d: "M7 9.5v8M7 6.6v.02M11 17.5v-4.4c0-1.3 1-2.3 2.3-2.3s2.2 1 2.2 2.3v4.4",
      stroke: "currentColor",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      fill: "none"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "7",
      cy: "6.6",
      r: "1",
      fill: "currentColor"
    })),
    facebook: /*#__PURE__*/React.createElement("path", {
      fill: "currentColor",
      d: "M13.5 21v-7h2.4l.4-2.8h-2.8V9.4c0-.8.3-1.4 1.5-1.4h1.4V5.5C16.3 5.4 15.4 5.3 14.4 5.3c-2.2 0-3.7 1.3-3.7 3.8v2.1H8.2V14h2.5v7h2.8z"
    })
  };
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    "aria-hidden": "true"
  }, paths[name]);
}
function Crest({
  size = 46
}) {
  return /*#__PURE__*/React.createElement("img", {
    src: "assets/badge-crest.png",
    alt: "Lake Shore Legends",
    style: {
      height: size,
      width: 'auto',
      display: 'block'
    }
  });
}
function Header({
  page
}) {
  const [scrolled, setScrolled] = RxShell.useState(false);
  const [open, setOpen] = RxShell.useState(false);
  RxShell.useEffect(() => {
    const sc = document.querySelector('.lsl-scroll');
    const onScroll = () => setScrolled((sc?.scrollTop || window.scrollY) > 20);
    sc?.addEventListener('scroll', onScroll);
    window.addEventListener('scroll', onScroll);
    return () => {
      sc?.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);
  return /*#__PURE__*/React.createElement("header", {
    className: 'lsl-header' + (scrolled ? ' is-scrolled' : '')
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-header__inner"
  }, /*#__PURE__*/React.createElement("a", {
    className: "lsl-brand",
    href: "home.html"
  }, /*#__PURE__*/React.createElement(Crest, {
    size: 46
  }), /*#__PURE__*/React.createElement("span", {
    className: "lsl-brand__name"
  }, "Lake\xA0Shore", /*#__PURE__*/React.createElement("br", null), "Legends")), /*#__PURE__*/React.createElement("nav", {
    className: "lsl-nav"
  }, NAV.map(n => /*#__PURE__*/React.createElement("a", _extends({
    key: n.label,
    className: 'lsl-nav__link' + (page === n.label ? ' is-active' : ''),
    href: n.href
  }, n.external ? {
    target: '_blank',
    rel: 'noopener'
  } : {}), n.label))), /*#__PURE__*/React.createElement("a", {
    className: "lsl-btn lsl-btn--primary lsl-btn--sm lsl-header__cta",
    href: "contact.html"
  }, "Join the Program"), /*#__PURE__*/React.createElement("button", {
    className: "lsl-burger",
    onClick: () => setOpen(!open),
    "aria-label": "Menu"
  }, /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("span", null))), open && /*#__PURE__*/React.createElement("div", {
    className: "lsl-mobilenav"
  }, NAV.map(n => /*#__PURE__*/React.createElement("a", _extends({
    key: n.label,
    href: n.href
  }, n.external ? {
    target: '_blank',
    rel: 'noopener'
  } : {}), n.label))));
}
function SectionHead({
  eyebrow,
  title,
  sub,
  light,
  center,
  wide,
  full,
  smTitle
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: 'lsl-secthead' + (center ? ' lsl-secthead--center' : '') + (full ? ' lsl-secthead--full' : wide ? ' lsl-secthead--wide' : '')
  }, eyebrow && /*#__PURE__*/React.createElement("span", {
    className: 'lsl-eyebrow' + (light ? ' lsl-eyebrow--light' : '')
  }, eyebrow), title && /*#__PURE__*/React.createElement("h2", {
    className: 'lsl-h2' + (light ? ' lsl-h2--light' : ''),
    style: smTitle ? {
      fontSize: 'clamp(22px, 2.4vw, 32px)'
    } : undefined
  }, title), sub && /*#__PURE__*/React.createElement("p", {
    className: 'lsl-body' + (light ? ' lsl-body--light' : '')
  }, sub));
}
function PageHero({
  eyebrow,
  title,
  sub,
  accent
}) {
  return /*#__PURE__*/React.createElement("section", {
    className: "lsl-pagehero"
  }, /*#__PURE__*/React.createElement("div", {
    className: 'lsl-pagehero__glow' + (accent === 'orange' ? ' is-orange' : '')
  }), /*#__PURE__*/React.createElement("img", {
    className: "lsl-pagehero__spire",
    src: "assets/mark-spire-stars.png",
    alt: "",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    className: "lsl-pagehero__inner"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lsl-eyebrow lsl-eyebrow--light"
  }, eyebrow), /*#__PURE__*/React.createElement("h1", {
    className: "lsl-display lsl-display--md"
  }, title), sub && /*#__PURE__*/React.createElement("p", {
    className: "lsl-lede",
    style: {
      maxWidth: 780,
      color: 'var(--fg-on-dark-2)'
    }
  }, sub)));
}
function CTA({
  title = 'Turn Your Athlete Into a Legend',
  sub = 'Get in touch to learn about training, camps, and the Jr. Mustangs feeder program.',
  btn = 'Connect With Us',
  href = 'contact.html'
}) {
  return /*#__PURE__*/React.createElement("section", {
    className: "lsl-cta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-cta__inner"
  }, /*#__PURE__*/React.createElement("img", {
    className: "lsl-cta__mark",
    src: "assets/monogram-lsl.png",
    alt: "",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("h2", {
    className: "lsl-h2 lsl-h2--light"
  }, title), /*#__PURE__*/React.createElement("p", {
    className: "lsl-body lsl-body--light"
  }, sub), /*#__PURE__*/React.createElement("a", {
    className: "lsl-btn lsl-btn--primary",
    href: href
  }, btn)));
}
function Footer() {
  const cols = [['Connect With Us', [['Contact Us', 'contact.html'], ['Training Programs', 'training.html'], ['Meet Our Coaches', 'about.html']]], ['Quick Links', [['Upcoming Events', 'training.html'], ['Alumni Success Stories', 'alumni.html'], ['Jr. Mustangs Feeder', 'https://mundyball.com/feeder-home']]], ['Resources', [['Code of Conduct', '#'], ['Training Schedule', 'training.html'], ['FAQs', 'contact.html']]], ['Follow Us', [['Twitter / X', '#'], ['Instagram', '#'], ['LinkedIn', '#']]]];
  return /*#__PURE__*/React.createElement("footer", {
    className: "lsl-footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-footer__top"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-footer__brand"
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/badge-crest.png",
    alt: "Lake Shore Legends",
    style: {
      height: 86
    }
  }), /*#__PURE__*/React.createElement("p", {
    className: "lsl-footer__tag"
  }, "Trainers First.", /*#__PURE__*/React.createElement("br", null), "Coaches Always.")), /*#__PURE__*/React.createElement("div", {
    className: "lsl-footer__cols"
  }, cols.map(([h, links]) => /*#__PURE__*/React.createElement("div", {
    key: h,
    className: "lsl-footer__col"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "lsl-footer__h"
  }, h), links.map(([l, href]) => {
    const ext = href && href.startsWith('http');
    return /*#__PURE__*/React.createElement("a", _extends({
      key: l,
      className: "lsl-footer__link",
      href: href || '#'
    }, ext ? {
      target: '_blank',
      rel: 'noopener'
    } : {}), l);
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "lsl-footer__bar"
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 LakeShore Legends Basketball"), /*#__PURE__*/React.createElement("span", null, "Chicago, Illinois")));
}
Object.assign(window, {
  Star6,
  SocialGlyph,
  Crest,
  Header,
  SectionHead,
  PageHero,
  CTA,
  Footer,
  NAV
});
