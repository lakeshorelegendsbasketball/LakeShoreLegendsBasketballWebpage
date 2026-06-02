/* global React, SectionHead */
const TESTIMONIALS = [
  { quote: ["While many coaches are knowledgeable about basketball, most struggle to get their messages across and implement their ideas effectively. However, Coach Gio is able to share his basketball knowledge and analytical skill in a way that works well for his players on and off the court.", "What really makes him stand out, though, is his ability to establish strong connections with his players. He builds real relationships, and because of that, he understands us on a deeper level. That connection makes a huge difference in how he trains & coaches us, and it made me want to play harder for him.", "Overall, Coach Gio is a genuine guy who knows how to bring the best out of his players and his teams."], name: 'Keller McGovern', loc: 'IL · Athlete' },
  { quote: "My son grew so much this past season. Coach Gio runs a well-organized practice and instills a strong work ethic. I'd recommend him to anyone willing to work hard.", name: 'Jeremy Slater', loc: 'IN · Parent' },
  { quote: "Gio brings a holistic approach — relationship building, character, skill, and competitiveness. Our daughter achieved goals we never dreamed possible.", name: 'Vanessa Stoller', loc: 'IN · Parent' },
  { quote: "No matter the drill, Coach Gio made every practice fun and engaging. He helped me gain real confidence on the court during games.", name: 'Emily Bunger', loc: 'IN · Athlete' },
  { quote: "His personable, approachable nature helped the girls feel comfortable — and they learned a LOT. Thank you for developing Emma's self-confidence.", name: 'Kristin Bruce', loc: 'IN · Parent' },
];

function Testimonials() {
  const [i, setI] = React.useState(0);
  const t = TESTIMONIALS[i];
  return (
    <section className="lsl-section lsl-section--cream">
      <div className="lsl-wrap">
        <SectionHead eyebrow="What Our Community Says"
          title="Hear From Our Families" />
        <div className="lsl-testimonial">
          <div className="lsl-quotemark">&ldquo;</div>
          <blockquote className="lsl-testimonial__quote">
            {Array.isArray(t.quote) ? t.quote.map((p, i) => <p key={i}>{p}</p>) : t.quote}
          </blockquote>
          <div className="lsl-testimonial__by">
            <div className="lsl-avatar">{t.name.split(' ').map(s => s[0]).join('')}</div>
            <div>
              <div className="lsl-testimonial__name">{t.name}</div>
              <div className="lsl-testimonial__loc">{t.loc}</div>
            </div>
          </div>
          <div className="lsl-dots">
            {TESTIMONIALS.map((_, k) => (
              <button key={k} className={'lsl-dot' + (k === i ? ' is-active' : '')} onClick={() => setI(k)} aria-label={'Testimonial ' + (k + 1)}></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Testimonials });
