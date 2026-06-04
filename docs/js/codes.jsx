/* global React, Star6 */

function CodesHero() {
  const sections = [
    ['01', 'Organizational Standards'],
    ['02', 'Coaches & Volunteers'],
    ['03', 'Parents & Spectators'],
    ['04', 'Communication Policy'],
  ];
  React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); }, []);
  return (
    <section className="lsl-codeshero">
      <div className="lsl-codeshero__inner">
        <span className="lsl-codeshero__eyebrow">Codes of Conduct</span>
        <h1 className="lsl-codeshero__title">
          The Standards<br /><span className="lsl-codeshero__orange">We Play By.</span>
        </h1>
        <p className="lsl-codeshero__body">
          LakeShore Legends Basketball is a development-driven program built on fundamentals, accountability, and the long game.
        </p>
        <p className="lsl-codeshero__bold">
          Participation by athletes, coaches, volunteers, parents, and spectators means alignment with what's on this page.
        </p>
        <div className="lsl-codes-nav">
          {sections.map(([num, label]) => (
            <div className="lsl-codes-nav__item" key={num}>
              <span className="lsl-codes-nav__num">{num}</span>
              <span className="lsl-codes-nav__label">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OrgStandards() {
  const values = [
    { title: 'Training-First Development', body: 'Support a model that emphasizes preparation, repetition, and learning over short-term results.' },
    { title: 'Our Core Values', body: 'Uphold accountability, effort, grit, determination, consistency, and discipline in every gym we walk into.' },
    { title: 'Respect The Game', body: 'Show respect toward coaches, officials, opponents, teammates, and the game of basketball itself.' },
    { title: 'Represent The Program', body: 'Carry LakeShore Legends Basketball with professionalism, integrity, and sportsmanship at all times.' },
    { title: 'Play The Long Game', body: 'Understand that athlete development is a multi-year process, not a single weekend, season, or scoreline.' },
  ];
  return (
    <section className="lsl-section lsl-section--cream">
      <div className="lsl-wrap">
        <span className="lsl-codes-eyebrow lsl-codes-eyebrow--orange">Section 01 · Organizational Standards</span>
        <h2 className="lsl-codes-sh">Compete. Grow. <span className="lsl-codes-orange">Lead.</span></h2>
        <p className="lsl-codes-intro">Everything we do is guided by a training-first mindset that prioritizes skill development, basketball IQ, accountability, and purposeful competition.</p>
        <div className="lsl-codes-org-grid">
          <div className="lsl-codes-featured">
            <p className="lsl-codes-featured__headline">
              Athlete development is a <span className="lsl-codes-orange">long-term process</span> — not a weekend outcome.
            </p>
            <p>LakeShore Legends Basketball reserves the right to address behavior that does not align with these standards in order to protect the culture, mission, and integrity of the program.</p>
            <p>Participation signifies a commitment to the process, the standards, and the culture that make long-term athlete development possible.</p>
            <hr className="lsl-codes-featured__divider" />
            <p className="lsl-codes-featured__bold">By signing up, every member of the LakeShore Legends community agrees to uphold the standards listed here — on the floor, in the stands, and in the parking lot afterward.</p>
          </div>
          <div className="lsl-codes-valuelist">
            {values.map((v) => (
              <div className="lsl-codes-valuerow" key={v.title}>
                <div className="lsl-codes-valuerow__check"><i data-lucide="check"></i></div>
                <div>
                  <div className="lsl-codes-valuerow__title">{v.title}</div>
                  <div className="lsl-codes-valuerow__body">{v.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CoachesCode() {
  const will = [
    'Lead with a training-first mindset — practices are structured, intentional, and development-focused.',
    'Teach the game with clarity, purpose, and consistency — emphasizing skill development and basketball IQ.',
    'Hold athletes accountable while fostering confidence, resilience, and growth through adversity.',
    'Model composure, respect, and professionalism in all training and competitive environments.',
    'Maintain open, respectful communication with athletes and families regarding development, expectations, and standards.',
    'Prioritize athlete safety, well-being, and long-term development over wins, exposure, or playing-time disputes.',
  ];
  const willNot = [
    'Coach or communicate emotionally, disrespectfully, or in a manner inconsistent with program values.',
    'Prioritize personal agendas, exposure chasing, or short-term success over athlete development.',
    'Engage in negative behavior toward officials, opponents, athletes, or families.',
    'Undermine the program philosophy or contradict organizational standards.',
  ];
  return (
    <section className="lsl-section lsl-section--ink">
      <div className="lsl-wrap">
        <span className="lsl-codes-eyebrow">Leading By Example</span>
        <div className="lsl-codes-numhead">
          <div className="lsl-codes-badge">02</div>
          <h2 className="lsl-codes-sh lsl-codes-sh--light">Coaches &amp; <span className="lsl-codes-orange">Volunteers.</span></h2>
        </div>
        <p className="lsl-codes-intro lsl-codes-intro--light">Coaches and volunteers are leaders within the LakeShore Legends organization — held to the highest standards of professionalism, preparation, and conduct. The floor starts with them.</p>
        <div className="lsl-codes-cols">
          <div className="lsl-codes-col lsl-codes-col--will-dark">
            <div className="lsl-codes-col__head"><i data-lucide="check-circle"></i><span>Coaches &amp; Volunteers<br/>Will</span></div>
            <ul className="lsl-codes-list lsl-codes-list--dark">
              {will.map((item, i) => <li key={i}><Star6 size={12} />{item}</li>)}
            </ul>
          </div>
          <div className="lsl-codes-col lsl-codes-col--willnot-dark">
            <div className="lsl-codes-col__head lsl-codes-col__head--neg"><i data-lucide="x-circle"></i><span>Coaches &amp; Volunteers<br/>Will Not</span></div>
            <ul className="lsl-codes-list lsl-codes-list--dark">
              {willNot.map((item, i) => <li key={i}><Star6 size={12} />{item}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function ParentsCode() {
  const expected = [
    'Support the training-first philosophy and understand that development may not always align with immediate results.',
    'Encourage athletes to embrace demanding practices, accountability, and growth through adversity.',
    'Allow coaches to coach — and athletes to learn — without interference during practices or games.',
    'Show respect toward coaches, officials, opponents, athletes, and fellow spectators.',
    'Communicate concerns respectfully and at appropriate times, following program communication guidelines.',
  ];
  const willNot = [
    'Coach from the sidelines or attempt to influence strategy, playing time, or athlete roles during games.',
    'Engage in negative, disruptive, or confrontational behavior toward officials, coaches, players, or opposing teams.',
    "Create pressure around wins, exposure, or outcomes that contradict the program's developmental mission.",
    'Undermine athlete confidence through criticism, comparison, or unrealistic expectations.',
  ];
  return (
    <section className="lsl-section lsl-section--cream">
      <div className="lsl-wrap">
        <span className="lsl-codes-eyebrow lsl-codes-eyebrow--orange">Partners In Development</span>
        <div className="lsl-codes-numhead">
          <div className="lsl-codes-badge lsl-codes-badge--orange">03</div>
          <h2 className="lsl-codes-sh">Parents &amp; <span className="lsl-codes-orange">Spectators.</span></h2>
        </div>
        <p className="lsl-codes-intro">LakeShore Legends views parents and families as partners in the long-term development process. Support, trust, and alignment are essential to athlete growth — and what makes our gyms feel like home.</p>
        <div className="lsl-codes-cols">
          <div className="lsl-codes-col lsl-codes-col--will">
            <div className="lsl-codes-col__head"><i data-lucide="check-circle"></i><span>Parents &amp; Spectators<br/>Are Expected To</span></div>
            <ul className="lsl-codes-list">
              {expected.map((item, i) => <li key={i}><Star6 size={12} />{item}</li>)}
            </ul>
          </div>
          <div className="lsl-codes-col lsl-codes-col--willnot">
            <div className="lsl-codes-col__head lsl-codes-col__head--neg"><i data-lucide="x-circle"></i><span>Parents &amp; Spectators<br/>Will Not</span></div>
            <ul className="lsl-codes-list">
              {willNot.map((item, i) => <li key={i}><Star6 size={12} />{item}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function CommPolicy() {
  return (
    <section className="lsl-codes-commsec">
      <div className="lsl-wrap">
        <div className="lsl-codes-comm">
          <div className="lsl-codes-comm__circle">
            <span className="lsl-codes-comm__num">12–24</span>
            <span className="lsl-codes-comm__unit">Hours</span>
          </div>
          <div className="lsl-codes-comm__body">
            <span className="lsl-codes-eyebrow" style={{ color: 'rgba(255,255,255,.55)' }}>Section 04 · Communication Policy</span>
            <h2 className="lsl-codes-sh lsl-codes-sh--light" style={{ margin: '8px 0 16px' }}>Sleep on it.<br /><span className="lsl-codes-orange">Then let's talk.</span></h2>
            <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 15, lineHeight: 1.65, maxWidth: 520, margin: '0 0 28px' }}>
              If a parent or guardian has a concern involving a member of the coaching staff immediately following a game, a 12–24 hour waiting period is required before any communication occurs. This policy exists to promote thoughtful, constructive dialogue and prevent emotionally driven interactions.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a className="lsl-btn lsl-btn--ghost lsl-btn--sm" href="contact.html" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.4)' }}>Contact Coaching Staff</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CodesClosing() {
  React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); }, []);
  return (
    <section className="lsl-section lsl-section--ink" style={{ textAlign: 'center' }}>
      <div className="lsl-wrap" style={{ maxWidth: 700 }}>
        <h2 className="lsl-codes-sh lsl-codes-sh--light lsl-codes-sh--xl">
          Know the standards.<br /><span className="lsl-codes-orange">Live them.</span>
        </h2>
        <p style={{ color: 'rgba(255,255,255,.65)', fontSize: 15, lineHeight: 1.65, margin: '20px auto 36px', maxWidth: 560 }}>
          These codes apply the moment you walk into the gym — for every athlete, coach, volunteer, parent, and spectator wearing or watching LakeShore Legends.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a className="lsl-btn lsl-btn--primary" href="contact.html">Ask A Question</a>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { CodesHero, OrgStandards, CoachesCode, ParentsCode, CommPolicy, CodesClosing });
