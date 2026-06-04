/* global React, SectionHead, Star6 */

function CodesIntro() {
  const sections = [
    ['01', 'Organizational Standards'],
    ['02', 'Coaches & Volunteers'],
    ['03', 'Parents & Spectators'],
    ['04', 'Communication Policy'],
  ];
  return (
    <section className="lsl-section lsl-section--cream" style={{ paddingBottom: 48 }}>
      <div className="lsl-wrap">
        <p className="lsl-body" style={{ maxWidth: 720, margin: '0 auto 36px', textAlign: 'center', fontSize: 17, color: 'var(--fg2)' }}>
          LakeShore Legends Basketball is a development-driven program built on fundamentals, accountability, and the long game.<br /><br />
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
    <section className="lsl-section lsl-section--ink">
      <div className="lsl-wrap">
        <div className="lsl-codes-section-head">
          <span className="lsl-codes-eyebrow">Section 01 · Organizational Standards</span>
          <h2 className="lsl-h2 lsl-h2--light">Compete. Grow. Lead.</h2>
          <p className="lsl-body lsl-body--light" style={{ maxWidth: 680 }}>
            Everything we do is guided by a training-first mindset that prioritizes skill development, basketball IQ, accountability, and purposeful competition.
          </p>
          <p className="lsl-body lsl-body--light" style={{ maxWidth: 680, color: 'var(--fg-on-dark-2)' }}>
            Athlete development is a long-term process — not a weekend outcome. LakeShore Legends Basketball reserves the right to address behavior that does not align with these standards in order to protect the culture, mission, and integrity of the program.
          </p>
          <p className="lsl-body lsl-body--light" style={{ maxWidth: 680, color: 'var(--fg-on-dark-2)' }}>
            Participation signifies a commitment to the process, the standards, and the culture that make long-term athlete development possible. By signing up, every member of the LakeShore Legends community agrees to uphold the standards listed here — on the floor, in the stands, and in the parking lot afterward.
          </p>
        </div>
        <div className="lsl-codes-values">
          {values.map((v) => (
            <div className="lsl-codes-value" key={v.title}>
              <div className="lsl-codes-value__icon"><Star6 size={16} /></div>
              <div>
                <div className="lsl-codes-value__title">{v.title}</div>
                <div className="lsl-codes-value__body">{v.body}</div>
              </div>
            </div>
          ))}
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
    <section className="lsl-section lsl-section--cream">
      <div className="lsl-wrap">
        <div className="lsl-codes-section-head lsl-codes-section-head--light">
          <span className="lsl-codes-eyebrow lsl-codes-eyebrow--orange">02 · Leading By Example</span>
          <h2 className="lsl-h2">Coaches &amp; Volunteers.</h2>
          <p className="lsl-body" style={{ maxWidth: 680, color: 'var(--fg2)' }}>
            Coaches and volunteers are leaders within the LakeShore Legends organization — held to the highest standards of professionalism, preparation, and conduct. The floor starts with them.
          </p>
        </div>
        <div className="lsl-codes-cols">
          <div className="lsl-codes-col lsl-codes-col--will">
            <div className="lsl-codes-col__head"><i data-lucide="check-circle"></i> Coaches &amp; Volunteers Will</div>
            <ul className="lsl-codes-list">
              {will.map((item, i) => <li key={i}><Star6 size={13} />{item}</li>)}
            </ul>
          </div>
          <div className="lsl-codes-col lsl-codes-col--willnot">
            <div className="lsl-codes-col__head"><i data-lucide="x-circle"></i> Coaches &amp; Volunteers Will Not</div>
            <ul className="lsl-codes-list">
              {willNot.map((item, i) => <li key={i}><Star6 size={13} />{item}</li>)}
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
    'Create pressure around wins, exposure, or outcomes that contradict the program\'s developmental mission.',
    'Undermine athlete confidence through criticism, comparison, or unrealistic expectations.',
  ];
  return (
    <section className="lsl-section lsl-section--ink">
      <div className="lsl-wrap">
        <div className="lsl-codes-section-head">
          <span className="lsl-codes-eyebrow">03 · Partners In Development</span>
          <h2 className="lsl-h2 lsl-h2--light">Parents &amp; spectators.</h2>
          <p className="lsl-body lsl-body--light" style={{ maxWidth: 680 }}>
            LakeShore Legends views parents and families as partners in the long-term development process. Support, trust, and alignment are essential to athlete growth — and what makes our gyms feel like home.
          </p>
        </div>
        <div className="lsl-codes-cols">
          <div className="lsl-codes-col lsl-codes-col--will lsl-codes-col--dark">
            <div className="lsl-codes-col__head"><i data-lucide="check-circle"></i> Parents &amp; Spectators Are Expected To</div>
            <ul className="lsl-codes-list lsl-codes-list--dark">
              {expected.map((item, i) => <li key={i}><Star6 size={13} />{item}</li>)}
            </ul>
          </div>
          <div className="lsl-codes-col lsl-codes-col--willnot lsl-codes-col--dark">
            <div className="lsl-codes-col__head"><i data-lucide="x-circle"></i> Parents &amp; Spectators Will Not</div>
            <ul className="lsl-codes-list lsl-codes-list--dark">
              {willNot.map((item, i) => <li key={i}><Star6 size={13} />{item}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function CommPolicy() {
  return (
    <section className="lsl-section lsl-section--cream">
      <div className="lsl-wrap">
        <div className="lsl-codes-comm">
          <div className="lsl-codes-comm__hours">12–24<span>Hours</span></div>
          <div className="lsl-codes-comm__body">
            <span className="lsl-codes-eyebrow lsl-codes-eyebrow--orange">Section 04 · Communication Policy</span>
            <h2 className="lsl-h2" style={{ margin: '8px 0 16px' }}>Sleep on it.<br />Then let's talk.</h2>
            <p className="lsl-body" style={{ color: 'var(--fg2)', maxWidth: 560 }}>
              If a parent or guardian has a concern involving a member of the coaching staff immediately following a game, a 12–24 hour waiting period is required before any communication occurs. This policy exists to promote thoughtful, constructive dialogue and prevent emotionally driven interactions.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 24 }}>
              <a className="lsl-btn lsl-btn--primary lsl-btn--sm" href="contact.html">Contact Coaching Staff</a>
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
      <div className="lsl-wrap" style={{ maxWidth: 680 }}>
        <span className="lsl-eyebrow lsl-eyebrow--light">Know the standards.</span>
        <h2 className="lsl-h2 lsl-h2--light" style={{ margin: '10px 0 16px' }}>Live them.</h2>
        <p className="lsl-body lsl-body--light" style={{ color: 'var(--fg-on-dark-2)', marginBottom: 32 }}>
          These codes apply the moment you walk into the gym — for every athlete, coach, volunteer, parent, and spectator wearing or watching LakeShore Legends.
        </p>
        <a className="lsl-btn lsl-btn--primary" href="contact.html">Ask A Question</a>
      </div>
    </section>
  );
}

Object.assign(window, { CodesIntro, OrgStandards, CoachesCode, ParentsCode, CommPolicy, CodesClosing });
