/* global React, SectionHead */
function AboutHero() {
  return (
    <section className="lsl-pagehero">
      <div className="lsl-pagehero__glow is-orange"></div>
      <img className="lsl-pagehero__spire" src="assets/mark-spire-stars.png" alt="" aria-hidden="true" />
      <div className="lsl-pagehero__inner">
        <span className="lsl-eyebrow lsl-eyebrow--light">Who We Are</span>
        <h1 className="lsl-display lsl-display--md">About LakeShore Legends Basketball</h1>
        <p className="lsl-lede" style={{ maxWidth: '100%', color: 'var(--fg-on-dark-2)' }}>A development-driven basketball organization built on elite training standards, intentional teaching,<br/>and long-term athlete growth — developing complete players, on and off the court.</p>
      </div>
    </section>
  );
}

function MissionVision() {
  const items = [
    ['Mission', 'To develop complete basketball players through elite training, intentional teaching, and purposeful competition.'],
    ['Vision', 'To become a nationally respected development program known for skilled, intelligent, and disciplined athletes prepared to succeed at every level.'],
    ['Engagement', 'We set a new standard for youth basketball with a training-first mindset. Practices are demanding by design so that games feel simple.'],
  ];
  return (
    <section className="lsl-section lsl-section--cream">
      <div className="lsl-wrap lsl-mvgrid">
        {items.map(([h, b]) => (
          <div className="lsl-mvcard" key={h}>
            <span className="lsl-label">{h} Statement</span>
            <p className="lsl-body">{b}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CorePrinciples() {
  const vals = [
    ['Leadership', 'Taking ownership of preparation, effort, and growth — both on and off the court.'],
    ['Effort', 'Competing with intention and purpose in every rep, drill, and game.'],
    ['Grit', 'Embracing adversity, staying resilient, working through challenges.'],
    ['Energy', 'Showing up committed and ready, day after day, regardless of circumstances.'],
    ['No Excuses', 'Focus, drive, and resolve in the relentless pursuit of development.'],
    ['Discipline', 'Habits and decisions that support structure, growth, and team success.'],
    ['Sportsmanship', 'Respect and a willingness to learn in everything we do.'],
  ];
  return (
    <section className="lsl-section lsl-section--ink">
      <div className="lsl-wrap">
        <SectionHead center wide light eyebrow="Core Principles"
          title="What Turns Players Into Legends"
          sub="Foundational expectations within our program — for every athlete, every day." />
        <div className="lsl-principles">
          {vals.map(([h, b], idx) => (
            <div className="lsl-principle" key={h}>
              <span className="lsl-principle__num">{String(idx + 1).padStart(2, '0')}</span>
              <h3 className="lsl-h4 lsl-h4--light">{h}</h3>
              <p className="lsl-body lsl-body--sm lsl-body--light">{b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CoachCard() {
  return (
    <section className="lsl-section lsl-section--cream">
      <div className="lsl-wrap">
        <SectionHead eyebrow="Meet Our Coaches" title="Coaching Staff" />
        <div className="lsl-coach">
          <div className="lsl-coach__media">
            <img className="lsl-photo" src="uploads/Coach_Paganis-e1768944691510.jpg" alt="Coach Gio Paganis"
              style={{ width: '100%', height: '500px', objectFit: 'cover', objectPosition: '50% 25%', borderRadius: '16px', display: 'block' }} />
          </div>
          <div className="lsl-coach__body">
            <h3 className="lsl-h2">Coach Gio Paganis</h3>
            <div className="lsl-coach__roles">
              <span className="lsl-pill lsl-pill--orange">Founder &amp; Owner</span>
              <span className="lsl-pill lsl-pill--sky">Jr. Mustangs Director</span>
              <span className="lsl-pill lsl-pill--outline">Shooting Specialist</span>
            </div>
            <p className="lsl-body">Gio Paganis is a passionate basketball coach from Park Ridge, Illinois and the proud Owner of LakeShore Legends Basketball. A former student-athlete and Purdue M.S. graduate, Coach Gio has spent over a decade refining his craft, coaching and training athletes of all ages and skill levels since age 14.</p>
            <p className="lsl-body">Gio has coached top 17U AAU teams on the Adidas 3SSB Gold and NY2LA circuits with ALL IN Athletics, and held head coaching roles with Legacy Force AAU, Klondike Middle School, and Harrison High School feeder programs. He is currently the head Junior Varsity basketball coach at Mundelein High School and the director of the Jr. Mustangs Feeder Basketball program.</p>
            <p className="lsl-body">As a skills trainer, he serves as a shooting specialist known for his attention to detail, player-first mentality, and commitment to maximizing player potential both on and off the court.</p>
            <div className="lsl-coach__creds">
              <div><strong>Purdue University</strong><span>M.S. Human Resource Mgmt</span></div>
              <div><strong>10+ Years</strong><span>Coaching &amp; Training</span></div>
              <div><strong>Former</strong><span>Collegiate Athlete</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { AboutHero, MissionVision, CorePrinciples, CoachCard });
