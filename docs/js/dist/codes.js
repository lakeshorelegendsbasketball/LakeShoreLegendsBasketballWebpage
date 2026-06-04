/* global React, Star6 */

function CodesHero() {
  const sections = [['01', 'Organizational Standards'], ['02', 'Coaches & Volunteers'], ['03', 'Parents & Spectators'], ['04', 'Communication Policy']];
  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, []);
  return /*#__PURE__*/React.createElement("section", {
    className: "lsl-codeshero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-codeshero__inner"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lsl-codeshero__eyebrow"
  }, "Codes of Conduct"), /*#__PURE__*/React.createElement("h1", {
    className: "lsl-codeshero__title"
  }, "The Standards", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "lsl-codeshero__orange"
  }, "We Play By.")), /*#__PURE__*/React.createElement("p", {
    className: "lsl-codeshero__body"
  }, "LakeShore Legends Basketball is a development-driven program built on fundamentals, accountability, and the long game."), /*#__PURE__*/React.createElement("p", {
    className: "lsl-codeshero__bold"
  }, "Participation by athletes, coaches, volunteers, parents, and spectators means alignment with what's on this page."), /*#__PURE__*/React.createElement("div", {
    className: "lsl-codes-nav"
  }, sections.map(([num, label]) => /*#__PURE__*/React.createElement("div", {
    className: "lsl-codes-nav__item",
    key: num
  }, /*#__PURE__*/React.createElement("span", {
    className: "lsl-codes-nav__num"
  }, num), /*#__PURE__*/React.createElement("span", {
    className: "lsl-codes-nav__label"
  }, label))))));
}
function OrgStandards() {
  const values = [{
    title: 'Training-First Development',
    body: 'Support a model that emphasizes preparation, repetition, and learning over short-term results.'
  }, {
    title: 'Our Core Values',
    body: 'Uphold accountability, effort, grit, determination, consistency, and discipline in every gym we walk into.'
  }, {
    title: 'Respect The Game',
    body: 'Show respect toward coaches, officials, opponents, teammates, and the game of basketball itself.'
  }, {
    title: 'Represent The Program',
    body: 'Carry LakeShore Legends Basketball with professionalism, integrity, and sportsmanship at all times.'
  }, {
    title: 'Play The Long Game',
    body: 'Understand that athlete development is a multi-year process, not a single weekend, season, or scoreline.'
  }];
  return /*#__PURE__*/React.createElement("section", {
    className: "lsl-section lsl-section--cream"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-wrap"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lsl-codes-eyebrow lsl-codes-eyebrow--orange"
  }, "Section 01 \xB7 Organizational Standards"), /*#__PURE__*/React.createElement("h2", {
    className: "lsl-codes-sh"
  }, "Compete. Grow. ", /*#__PURE__*/React.createElement("span", {
    className: "lsl-codes-orange"
  }, "Lead.")), /*#__PURE__*/React.createElement("p", {
    className: "lsl-codes-intro"
  }, "Everything we do is guided by a training-first mindset that prioritizes skill development, basketball IQ, accountability, and purposeful competition."), /*#__PURE__*/React.createElement("div", {
    className: "lsl-codes-org-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-codes-featured"
  }, /*#__PURE__*/React.createElement("p", {
    className: "lsl-codes-featured__headline"
  }, "Athlete development is a ", /*#__PURE__*/React.createElement("span", {
    className: "lsl-codes-orange"
  }, "long-term process"), " \u2014 not a weekend outcome."), /*#__PURE__*/React.createElement("p", null, "LakeShore Legends Basketball reserves the right to address behavior that does not align with these standards in order to protect the culture, mission, and integrity of the program."), /*#__PURE__*/React.createElement("p", null, "Participation signifies a commitment to the process, the standards, and the culture that make long-term athlete development possible."), /*#__PURE__*/React.createElement("hr", {
    className: "lsl-codes-featured__divider"
  }), /*#__PURE__*/React.createElement("p", {
    className: "lsl-codes-featured__bold"
  }, "By signing up, every member of the LakeShore Legends community agrees to uphold the standards listed here \u2014 on the floor, in the stands, and in the parking lot afterward.")), /*#__PURE__*/React.createElement("div", {
    className: "lsl-codes-valuelist"
  }, values.map(v => /*#__PURE__*/React.createElement("div", {
    className: "lsl-codes-valuerow",
    key: v.title
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-codes-valuerow__check"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "check"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "lsl-codes-valuerow__title"
  }, v.title), /*#__PURE__*/React.createElement("div", {
    className: "lsl-codes-valuerow__body"
  }, v.body))))))));
}
function CoachesCode() {
  const will = ['Lead with a training-first mindset — practices are structured, intentional, and development-focused.', 'Teach the game with clarity, purpose, and consistency — emphasizing skill development and basketball IQ.', 'Hold athletes accountable while fostering confidence, resilience, and growth through adversity.', 'Model composure, respect, and professionalism in all training and competitive environments.', 'Maintain open, respectful communication with athletes and families regarding development, expectations, and standards.', 'Prioritize athlete safety, well-being, and long-term development over wins, exposure, or playing-time disputes.'];
  const willNot = ['Coach or communicate emotionally, disrespectfully, or in a manner inconsistent with program values.', 'Prioritize personal agendas, exposure chasing, or short-term success over athlete development.', 'Engage in negative behavior toward officials, opponents, athletes, or families.', 'Undermine the program philosophy or contradict organizational standards.'];
  return /*#__PURE__*/React.createElement("section", {
    className: "lsl-section lsl-section--ink"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-wrap"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lsl-codes-eyebrow"
  }, "Leading By Example"), /*#__PURE__*/React.createElement("div", {
    className: "lsl-codes-numhead"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-codes-badge"
  }, "02"), /*#__PURE__*/React.createElement("h2", {
    className: "lsl-codes-sh lsl-codes-sh--light"
  }, "Coaches & ", /*#__PURE__*/React.createElement("span", {
    className: "lsl-codes-orange"
  }, "Volunteers."))), /*#__PURE__*/React.createElement("p", {
    className: "lsl-codes-intro lsl-codes-intro--light lsl-codes-intro--wide"
  }, "Coaches and volunteers are leaders within the LakeShore Legends organization \u2014", /*#__PURE__*/React.createElement("br", null), "Held to the highest standards of professionalism, preparation, and conduct. The floor starts with them."), /*#__PURE__*/React.createElement("div", {
    className: "lsl-codes-cols"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-codes-col lsl-codes-col--will-dark"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-codes-col__head"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "check-circle"
  }), /*#__PURE__*/React.createElement("span", null, "Coaches & Volunteers", /*#__PURE__*/React.createElement("br", null), "Will")), /*#__PURE__*/React.createElement("ul", {
    className: "lsl-codes-list lsl-codes-list--dark"
  }, will.map((item, i) => /*#__PURE__*/React.createElement("li", {
    key: i
  }, /*#__PURE__*/React.createElement(Star6, {
    size: 12
  }), item)))), /*#__PURE__*/React.createElement("div", {
    className: "lsl-codes-col lsl-codes-col--willnot-dark"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-codes-col__head lsl-codes-col__head--neg"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "x-circle"
  }), /*#__PURE__*/React.createElement("span", null, "Coaches & Volunteers", /*#__PURE__*/React.createElement("br", null), "Will Not")), /*#__PURE__*/React.createElement("ul", {
    className: "lsl-codes-list lsl-codes-list--dark"
  }, willNot.map((item, i) => /*#__PURE__*/React.createElement("li", {
    key: i
  }, /*#__PURE__*/React.createElement(Star6, {
    size: 12
  }), item)))))));
}
function ParentsCode() {
  const expected = ['Support the training-first philosophy and understand that development may not always align with immediate results.', 'Encourage athletes to embrace demanding practices, accountability, and growth through adversity.', 'Allow coaches to coach — and athletes to learn — without interference during practices or games.', 'Show respect toward coaches, officials, opponents, athletes, and fellow spectators.', 'Communicate concerns respectfully and at appropriate times, following program communication guidelines.'];
  const willNot = ['Coach from the sidelines or attempt to influence strategy, playing time, or athlete roles during games.', 'Engage in negative, disruptive, or confrontational behavior toward officials, coaches, players, or opposing teams.', "Create pressure around wins, exposure, or outcomes that contradict the program's developmental mission.", 'Undermine athlete confidence through criticism, comparison, or unrealistic expectations.'];
  return /*#__PURE__*/React.createElement("section", {
    className: "lsl-section lsl-section--cream"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-wrap"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lsl-codes-eyebrow lsl-codes-eyebrow--orange"
  }, "Partners In Development"), /*#__PURE__*/React.createElement("div", {
    className: "lsl-codes-numhead"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-codes-badge lsl-codes-badge--orange"
  }, "03"), /*#__PURE__*/React.createElement("h2", {
    className: "lsl-codes-sh"
  }, "Parents & ", /*#__PURE__*/React.createElement("span", {
    className: "lsl-codes-orange"
  }, "Spectators."))), /*#__PURE__*/React.createElement("p", {
    className: "lsl-codes-intro lsl-codes-intro--wide"
  }, "LakeShore Legends views parents and families as partners in the long-term youth development process.", /*#__PURE__*/React.createElement("br", null), "Support, trust, and alignment are essential to athlete growth, and what makes our gyms feel like home."), /*#__PURE__*/React.createElement("div", {
    className: "lsl-codes-cols"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-codes-col lsl-codes-col--will"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-codes-col__head"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "check-circle"
  }), /*#__PURE__*/React.createElement("span", null, "Parents & Spectators", /*#__PURE__*/React.createElement("br", null), "Are Expected To")), /*#__PURE__*/React.createElement("ul", {
    className: "lsl-codes-list"
  }, expected.map((item, i) => /*#__PURE__*/React.createElement("li", {
    key: i
  }, /*#__PURE__*/React.createElement(Star6, {
    size: 12
  }), item)))), /*#__PURE__*/React.createElement("div", {
    className: "lsl-codes-col lsl-codes-col--willnot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-codes-col__head lsl-codes-col__head--neg"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "x-circle"
  }), /*#__PURE__*/React.createElement("span", null, "Parents & Spectators", /*#__PURE__*/React.createElement("br", null), "Will Not")), /*#__PURE__*/React.createElement("ul", {
    className: "lsl-codes-list"
  }, willNot.map((item, i) => /*#__PURE__*/React.createElement("li", {
    key: i
  }, /*#__PURE__*/React.createElement(Star6, {
    size: 12
  }), item)))))));
}
function CommPolicy() {
  return /*#__PURE__*/React.createElement("section", {
    className: "lsl-codes-commsec"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-codes-comm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-codes-comm__circle"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lsl-codes-comm__num"
  }, "12\u201324"), /*#__PURE__*/React.createElement("span", {
    className: "lsl-codes-comm__unit"
  }, "Hours")), /*#__PURE__*/React.createElement("div", {
    className: "lsl-codes-comm__body"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lsl-codes-eyebrow",
    style: {
      color: 'rgba(255,255,255,.55)'
    }
  }, "Section 04 \xB7 Communication Policy"), /*#__PURE__*/React.createElement("h2", {
    className: "lsl-codes-sh lsl-codes-sh--light",
    style: {
      margin: '8px 0 16px'
    }
  }, "Sleep on it.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "lsl-codes-orange"
  }, "Then let's talk.")), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'rgba(255,255,255,.75)',
      fontSize: 15,
      lineHeight: 1.65,
      maxWidth: 520,
      margin: '0 0 28px'
    }
  }, "If a parent or guardian has a concern involving a member of the coaching staff immediately following a game, a 12\u201324 hour waiting period is required before any communication occurs. This policy exists to promote thoughtful, constructive dialogue and prevent emotionally driven interactions."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("a", {
    className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
    href: "contact.html",
    style: {
      color: '#fff',
      borderColor: 'rgba(255,255,255,.4)'
    }
  }, "Contact Coaching Staff"))))));
}
function CodesClosing() {
  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, []);
  return /*#__PURE__*/React.createElement("section", {
    className: "lsl-section lsl-section--ink",
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-wrap",
    style: {
      maxWidth: 700
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "lsl-codes-sh lsl-codes-sh--light lsl-codes-sh--xl"
  }, "Know the standards.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "lsl-codes-orange"
  }, "Live them.")), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'rgba(255,255,255,.65)',
      fontSize: 15,
      lineHeight: 1.65,
      margin: '20px auto 36px',
      maxWidth: 560
    }
  }, "These codes apply the moment you walk into the gym \u2014 for every athlete, coach, volunteer, parent, and spectator wearing or watching LakeShore Legends."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      justifyContent: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("a", {
    className: "lsl-btn lsl-btn--primary",
    href: "contact.html"
  }, "Ask A Question"))));
}
Object.assign(window, {
  CodesHero,
  OrgStandards,
  CoachesCode,
  ParentsCode,
  CommPolicy,
  CodesClosing
});
