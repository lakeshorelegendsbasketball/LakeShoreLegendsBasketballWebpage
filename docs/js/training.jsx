/* global React, SectionHead, Star6 */
const { useState: useStateTr } = React;

const EVENTS = [
  { mon: 'Jun', day: '15', yr: '2026', title: 'Summer Skills Camp — Week 1', type: 'Summer Camp', typeClass: 'lsl-pill--orange',
    when: 'Jun 15–19 · 9:00a–12:00p', where: 'Park Ridge, IL', ages: 'Rising 3rd–8th · Ages 8–14', spots: 'open' },
  { mon: 'Jun', day: '28', yr: '2026', title: 'Elite Shooting Clinic', type: 'Small Group', typeClass: 'lsl-pill--sky',
    when: 'Jun 28 · 1:00p–3:30p', where: 'Park Ridge, IL', ages: 'Rising 6th–12th', spots: 'low' },
  { mon: 'Jul', day: '13', yr: '2026', title: 'Summer Skills Camp — Week 2', type: 'Summer Camp', typeClass: 'lsl-pill--orange',
    when: 'Jul 13–17 · 9:00a–12:00p', where: 'Park Ridge, IL', ages: 'Rising 3rd–8th · Ages 8–14', spots: 'open' },
  { mon: 'Sep', day: '07', yr: '2026', title: 'Labor Day School-Off Camp', type: 'Day-Off Camp', typeClass: 'lsl-pill--navy',
    when: 'Sep 7 · 9:00a–2:00p', where: 'Park Ridge, IL', ages: 'Rising 4th–9th', spots: 'open' },
];

const SPOT_TEXT = { open: 'Spots Available', low: 'Almost Full', full: 'Waitlist Only' };

function RegisterModal({ event, onClose }) {
  const [form, setForm] = useStateTr({ parent: '', athlete: '', email: '', grade: '' });
  const [sent, setSent] = useStateTr(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const submit = (e) => { e.preventDefault(); setSent(true); };
  return (
    <div className="lsl-lightbox" onClick={onClose}>
      <div className="lsl-form" style={{ maxWidth: 460, width: '100%' }} onClick={(e) => e.stopPropagation()}>
        <button className="lsl-lightbox__close" onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: 18, right: 18 }}>
          <i data-lucide="x"></i>
        </button>
        {sent ? (
          <div className="lsl-formsuccess">
            <div className="lsl-formsuccess__ico"><i data-lucide="check"></i></div>
            <h3 className="lsl-h3">You're on the list!</h3>
            <p className="lsl-body lsl-body--sm" style={{ margin: 0 }}>Thanks for registering for <strong>{event.title}</strong>. We'll email confirmation and payment details to {form.email || 'you'} shortly.</p>
          </div>
        ) : (
          <form onSubmit={submit}>
            <span className="lsl-eyebrow">Reserve a Spot</span>
            <h3 className="lsl-h3" style={{ marginTop: 4, marginBottom: 4 }}>{event.title}</h3>
            <p className="lsl-body lsl-body--sm" style={{ color: 'var(--fg3)' }}>{event.when} · {event.where}</p>
            <div className="lsl-field"><label>Parent / Guardian Name</label>
              <input className="lsl-input" value={form.parent} onChange={set('parent')} required placeholder="Jane Smith" /></div>
            <div className="lsl-field"><label>Athlete Name</label>
              <input className="lsl-input" value={form.athlete} onChange={set('athlete')} required placeholder="Alex Smith" /></div>
            <div className="lsl-field lsl-field--row">
              <div><label>Email</label>
                <input className="lsl-input" type="email" value={form.email} onChange={set('email')} required placeholder="you@email.com" /></div>
              <div><label>Athlete Grade</label>
                <input className="lsl-input" value={form.grade} onChange={set('grade')} required placeholder="7th" /></div>
            </div>
            <button type="submit" className="lsl-btn lsl-btn--primary lsl-form__submit">Confirm Registration</button>
          </form>
        )}
      </div>
    </div>
  );
}

function UpcomingEvents() {
  const [active, setActive] = useStateTr(null);
  React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); }, [active]);
  return (
    <section className="lsl-section lsl-section--cream">
      <div className="lsl-wrap">
        <SectionHead eyebrow="Upcoming Events"
          title="Camps & Clinics — Reserve Your Spot"
          sub="New sessions are added throughout the season. Registration takes under a minute — pick a date and we'll handle the rest." />
        <div className="lsl-events">
          {EVENTS.map((ev) => (
            <div className="lsl-event" key={ev.title}>
              <div className="lsl-event__date">
                <div className="lsl-event__mon">{ev.mon}</div>
                <div className="lsl-event__day">{ev.day}</div>
                <div className="lsl-event__yr">{ev.yr}</div>
              </div>
              <div className="lsl-event__body">
                <div className="lsl-event__tags">
                  <span className={'lsl-pill ' + ev.typeClass}>{ev.type}</span>
                </div>
                <h3 className="lsl-event__title">{ev.title}</h3>
                <div className="lsl-event__meta">
                  <span><i data-lucide="clock"></i>{ev.when}</span>
                  <span><i data-lucide="map-pin"></i>{ev.where}</span>
                  <span><i data-lucide="users"></i>{ev.ages}</span>
                </div>
              </div>
              <div className="lsl-event__cta">
                <span className={'lsl-event__spots' + (ev.spots === 'low' ? ' is-low' : ev.spots === 'full' ? ' is-full' : '')}>
                  {SPOT_TEXT[ev.spots]}
                </span>
                <button className="lsl-btn lsl-btn--primary lsl-btn--sm" onClick={() => setActive(ev)}>Register</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {active && <RegisterModal event={active} onClose={() => setActive(null)} />}
    </section>
  );
}

function Programs() {
  const progs = [
    { slot: 'prog-private', img: 'uploads/gio-highfive-23.jpg', mediaH: 240, tag: '1-on-1', tagClass: 'lsl-pill--sky', title: 'Private & Small Group Training', age: 'All Ages & Skill Levels',
      points: ['Individual skill-development plans', 'Position-specific training and reads', 'Direct feedback, accountability & consistency'], btn: 'Inquire Now', href: 'contact.html', external: false },
    { slot: 'prog-summer', img: 'uploads/gio-group-cafeteria.jpg', mediaH: 240, tag: 'Summer', tagClass: 'lsl-pill--orange', title: 'Jr. Mustangs Feeder Basketball Summer Camp', age: 'Rising 3rd–8th · Ages 8–14',
      points: ['Core skills: shooting, footwork, ball handling & more', 'Guided instruction, competitive games & interactive drills', 'Builds positive habits, effort, and love for the game'], btn: 'Sign Up Now', href: 'https://mundyball.com/camps', external: true },
    { slot: 'prog-dayoff', mediaH: 240, tag: 'Holidays', tagClass: 'lsl-pill--navy', title: 'School Day-Off Camps', age: 'MLK Day · Labor Day & More',
      points: ['High-intensity training on scheduled school closures', 'Focused skill work and competitive drills', 'Centered on basketball IQ and game transfer'], btn: 'Inquire Now', href: 'contact.html', external: false },
  ];
  return (
    <section className="lsl-section lsl-section--cream" style={{ paddingTop: 'var(--sp-7)' }}>
      <div className="lsl-wrap">
        <SectionHead center wide eyebrow="Training & Camp Offerings"
          title="Built Around Intentional Development"
          sub={<>Every offering meets athletes where they are while setting clear standards for<br/>effort, accountability, and long-term growth.</>} />
        <div className="lsl-programs">
          {progs.map((p) => (
            <div className="lsl-program" key={p.title}>
              <div className="lsl-program__media" style={p.mediaH ? { height: p.mediaH } : undefined}>
                {p.img
                  ? <img src={p.img} alt={p.title} />
                  : <image-slot id={p.slot} shape="rect" placeholder={'Drop a ' + p.title + ' photo'}></image-slot>}
                <span className={'lsl-program__tag lsl-pill ' + p.tagClass}>{p.tag}</span>
              </div>
              <div className="lsl-program__body">
                <h3 className="lsl-program__title">{p.title}</h3>
                <div className="lsl-program__age">{p.age}</div>
                <ul className="lsl-program__list">
                  {p.points.map((pt) => (
                    <li key={pt}><Star6 size={13} />{pt}</li>
                  ))}
                </ul>
                <div className="lsl-program__foot">
                  <a className="lsl-btn lsl-btn--primary lsl-btn--sm" href={p.href} {...(p.external ? { target: '_blank', rel: 'noopener' } : {})}>{p.btn}</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SkillsFocus() {
  const skills = [
    ['target', 'Shooting'], ['footprints', 'Footwork'], ['circle-dot', 'Ball Handling'],
    ['shield', 'Screening'], ['arrow-up-from-line', 'Rebounding'], ['send', 'Passing'],
    ['hand', 'Defending'],
  ];
  return (
    <section className="lsl-section lsl-section--ink">
      <div className="lsl-wrap">
        <SectionHead light center wide eyebrow="Every Session Covers"
          title="The Fundamentals That Translate" />
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

Object.assign(window, { UpcomingEvents, Programs, SkillsFocus });
