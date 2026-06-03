/* global React, SectionHead, Star6 */
function Hero() {
  return (
    <section className="lsl-hero">
      <div className="lsl-hero__glow"></div>
      <img className="lsl-hero__spire" src="assets/mark-spire-stars.png" alt="" aria-hidden="true" />
      <div className="lsl-hero__grid">
        <div className="lsl-hero__copy">
          <span className="lsl-eyebrow lsl-eyebrow--light">A Training-First Basketball Program</span>
          <h1 className="lsl-display">Chicago Roots,<br/><span className="lsl-display__accent">National Reach</span></h1>
          <p className="lsl-lede">LakeShore Legends is a development-driven basketball organization built on elite training standards and long-term athletic growth.</p>
          <div className="lsl-hero__actions">
            <a className="lsl-btn lsl-btn--primary" href="contact.html">Join the Program</a>
            <a className="lsl-btn lsl-btn--ghost-light" href="about.html">Our Philosophy</a>
          </div>
        </div>
        <div className="lsl-hero__media">
          <img className="lsl-photo" src="uploads/mundeleinvshp-30.jpg" alt="Coach Gio leading a team huddle"
            style={{ width: '100%', height: '360px', objectFit: 'cover', borderRadius: '20px', display: 'block' }} />
        </div>
      </div>
    </section>
  );
}

function CountUp({ value }) {
  const m = String(value).match(/^(\d+)(.*)$/);
  const target = m ? parseInt(m[1], 10) : 0;
  const suffix = m ? m[2] : '';
  const [n, setN] = React.useState(0);
  const ref = React.useRef(null);
  React.useEffect(() => {
    let raf, started = false;
    const run = () => {
      started = true;
      const dur = 2400, t0 = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        setN(Math.round(eased * target));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting && !started) run(); });
    }, { threshold: 0.4 });
    if (ref.current) io.observe(ref.current);
    return () => { io.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }, [target]);
  return <div className="lsl-stat__num" ref={ref}>{n}{suffix}</div>;
}

function StatsBand() {
  const stats = [
    ['24', 'Travel Teams Coached'],
    ['250+', 'Dedicated Athletes Trained'],
    ['25+', 'Unique College Recruitment Offers'],
    ['7+', 'College Basketball Commitments'],
  ];
  return (
    <section className="lsl-statsband">
      {stats.map(([n, l]) => (
        <div className="lsl-stat" key={l}>
          <CountUp value={n} />
          <div className="lsl-stat__lbl">{l}</div>
        </div>
      ))}
    </section>
  );
}

function Philosophy() {
  return (
    <section className="lsl-section lsl-section--cream">
      <div className="lsl-wrap lsl-philosophy">
        <div>
          <SectionHead eyebrow="The Problem With Modern AAU"
            title="Our Training-First Solution" />
          <p className="lsl-body">LakeShore Legends is a development-driven basketball organization built on elite training standards and long-term athletic growth. We exist to build fundamentally sound, intelligent, and competitive basketball players prepared for the next level and beyond.</p>
          <p className="lsl-body">In today's competitive basketball landscape, many AAU programs focus heavily on playing numerous games, often at the expense of skill development and athlete well-being. This short-term mindset can hinder players' long-term potential and growth.</p>
          <p className="lsl-body">Lake Shore Legends offers a refreshing alternative. Our training-first philosophy emphasizes skill mastery, strategic thinking, and purposeful competition. By prioritizing practice over excessive gameplay, we prepare our athletes for sustained success, equipping them with the tools needed for high school, college, and beyond.</p>
          <p className="lsl-body">Training is the foundation of our program. While competition matters, development comes first. Long-term basketball growth requires a strong technical and mental base. Our practices are intentional, structured, and skill-focused, designed to build fundamentals before chasing outcomes. Better training creates better players, and better players naturally elevate teams.</p>
        </div>
        <div>
          <img className="lsl-photo" src="uploads/S4A6259-scaled.jpg" alt="LakeShore Legends athlete defending on the ball"
            style={{ width: '100%', height: '420px', objectFit: 'cover', borderRadius: '18px', display: 'block' }} />
          <p className="lsl-pullquote" style={{ marginTop: '20px', textAlign: 'center', whiteSpace: 'nowrap' }}>&ldquo;We don&rsquo;t just play the game. We study it.&rdquo;</p>
        </div>
      </div>
    </section>
  );
}

function DevelopmentModel() {
  const cols = [
    { icon: 'calendar-x', tag: 'Typical AAU Model', title: null,
      body: ['Most AAU basketball programs only practice once or twice per week, prioritizing weekend tournaments over skill development and basketball IQ.', 'While we believe competition is important, over-competing without enough structured training often limits true improvement.'], muted: true },
    { icon: 'repeat', tag: 'Our Approach', title: null,
      body: ['We follow a more European-style basketball model that emphasizes repetition, fundamentals, decision-making, and long-term growth.', 'Our practices are designed to build technically sound, confident, and capable players long-term.'] },
    { icon: 'scale', tag: 'Our Standard Ratio', title: null,
      body: ['Our goal is simple: Practice twice as much as we play.', 'Allowing more time for training between competition gives our athletes the opportunity to learn from their mistakes, build real skills, and develop habits that directly translate to higher levels of competition.'] },
  ];
  return (
    <section className="lsl-section lsl-section--cream">
      <div className="lsl-wrap">
        <SectionHead center wide eyebrow="Our Development Model"
          title={<>Real Development Is Built In The Gym,<br/>Not On The Scoreboard</>}
          sub="Our training structure is intentionally different from the typical AAU approach, because our goal is long-term player growth, not short-term program victories." />
        <div className="lsl-cards3">
          {cols.map((c) => (
            <div className={'lsl-fcard' + (c.muted ? ' lsl-fcard--muted' : '')} key={c.tag}>
              <div className="lsl-fcard__ico"><i data-lucide={c.icon}></i></div>
              <span className="lsl-label">{c.tag}</span>
              {c.title && <h3 className="lsl-h3">{c.title}</h3>}
              {Array.isArray(c.body)
                ? c.body.map((p, i) => <p key={i} className="lsl-body lsl-body--sm">{p}</p>)
                : <p className="lsl-body lsl-body--sm">{c.body}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlayerGrowth() {
  return (
    <section className="lsl-section lsl-section--cream">
      <div className="lsl-wrap lsl-philosophy">
        <div>
          <SectionHead wide title={<>Player Growth<br/>In A Team Structure</>} />
          <p className="lsl-body">We emphasize individual development while teaching athletes how to contribute within a team system. Players learn how to compete with purpose, make sound decisions, and understand the game beyond just playing it.</p>
          <p className="lsl-body">By offering players game-realistic repetitions &amp; real, intentional feedback, our athletes develop the skills, confidence, and basketball abilities needed to succeed at the next level. We emphasize the development of strong fundamentals, disciplined habits, and the ability to adapt to different roles &amp; systems.</p>
        </div>
        <img className="lsl-photo" src="uploads/S4A6561-scaled.jpg" alt="Coach drawing up a play with the full team"
          style={{ width: '100%', height: '420px', objectFit: 'cover', borderRadius: '18px', display: 'block' }} />
      </div>
    </section>
  );
}

function SkillsGrid() {
  const skills = [
    ['target', 'Shooting'], ['footprints', 'Footwork'], ['circle-dot', 'Ball Handling'],
    ['shield', 'Screening'], ['arrow-up-from-line', 'Rebounding'], ['send', 'Passing'],
    ['hand', 'Defending'],
  ];
  return (
    <section className="lsl-section lsl-section--ink">
      <div className="lsl-wrap">
        <SectionHead center wide light eyebrow="Core Technical Skills"
          title="What We Develop"
          sub="Through structured training, intentional feedback, and game-realistic repetition." />
        <div className="lsl-skills">
          {skills.map(([ico, name]) => (
            <div className="lsl-skill" key={name}>
              <div className="lsl-skill__ico"><i data-lucide={ico}></i></div>
              <span className="lsl-skill__name">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BasketballIQ() {
  return (
    <section className="lsl-section lsl-section--cream">
      <div className="lsl-wrap lsl-philosophy">
        <div>
          <img className="lsl-photo" src="uploads/S4A6498-scaled.jpg" alt="Coach Gio breaking down a game-time huddle"
            style={{ width: '100%', height: '440px', objectFit: 'cover', borderRadius: '18px', display: 'block' }} />
        </div>
        <div>
          <SectionHead wide title="Basketball IQ & Game Mastery" />
          <p className="lsl-body">Our athletes develop strong decision-making habits, situational awareness, and a deeper understanding of basketball concepts that translate to higher levels of play.</p>
          <p className="lsl-body">Through structured training, purposeful film breakdown, and competitive practice environments, players learn why plays work, not just how to run them. We teach athletes how to read defenses, anticipate actions, communicate effectively, and adapt in real time. This approach builds players who are confident under pressure, trusted by coaches, and prepared for the speed and complexity of the high school and college game. Talent gets you noticed, but sound decision-making and basketball IQ will keep you on the floor.</p>
        </div>
      </div>
    </section>
  );
}

function WhyItMatters() {
  return (
    <section className="lsl-section lsl-section--cream">
      <div className="lsl-wrap lsl-philosophy">
        <div>
          <SectionHead title="Why This Matters" />
          <p className="lsl-body">By emphasizing training, repetition, and true game mastery, LakeShore Legends prepares athletes to succeed at every level of competition.</p>
          <p className="lsl-body">From high school and prep school programs to collegiate athletics and professional basketball, our development model is designed to translate as the game becomes faster, more physical, and more demanding.</p>
          <p className="lsl-body">Rather than prioritizing short-term results, we focus on building strong technical foundations, advanced basketball IQ, and consistent habits that support long-term performance and growth.</p>
          <p className="lsl-body">At LakeShore Legends, we are committed to developing disciplined, well-rounded athletes equipped to compete and thrive in today's game and beyond.</p>
        </div>
        <img className="lsl-photo" src="uploads/S4A6326-scaled.jpg" alt="LakeShore Legends team and coaches on the bench"
          style={{ width: '100%', height: '420px', objectFit: 'cover', borderRadius: '18px', display: 'block' }} />
      </div>
    </section>
  );
}

Object.assign(window, { Hero, StatsBand, Philosophy, DevelopmentModel, PlayerGrowth, SkillsGrid, BasketballIQ, WhyItMatters });
