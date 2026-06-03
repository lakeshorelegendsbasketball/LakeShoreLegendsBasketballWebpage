/* global React, SectionHead */
const TESTIMONIALS = [
  { quote: ["While many coaches are knowledgeable about basketball, most struggle to get their messages across and implement their ideas effectively. However, Coach Gio is able to share his basketball knowledge and analytical skill in a way that works well for his players on and off the court.", "What really makes him stand out, though, is his ability to establish strong connections with his players. He builds real relationships, and because of that, he understands us on a deeper level. That connection makes a huge difference in how he trains & coaches us, and it made me want to play harder for him.", "Overall, Coach Gio is a genuine guy who knows how to bring the best out of his players and his teams."], name: 'Keller McGovern', loc: 'IL · Athlete' },
  { quote: ["My son had the opportunity to play for Coach Gio last season as a 7th grader, and I was very impressed with his ability to instill such a strong work ethic and mature attitude in his boys. He runs a well-organized practice and always ensures his players are working hard.", "I've always been one to say \"you play how you practice,\" and my son surely grew as a player this past season. I'd recommend Coach Gio to anyone willing to work hard that's looking to develop their skills."], name: 'Jeremy Slater', loc: 'IN · Parent' },
  { quote: ["Over their last two seasons together, Coach Gio was a huge factor in my daughter's basketball development. Between coaching her school basketball team and private training in the off season, we saw tremendous growth in both her abilities and her love for the game.", "Gio brings a holistic approach to coaching with emphasis on relationship building, character development, basketball skill, and competitiveness. Our daughter has achieved goals we never dreamed possible with Gio playing a big part in her journey."], name: 'Vanessa Stoller', loc: 'IN · Parent' },
  { quote: ["No matter what drills we were doing, Coach Gio made every practice fun and engaging. Whether we were winning or losing, he always stayed positive and encouraging, which really helped keep me mentally strong on the court.", "Coach Gio helped me greatly improve my shooting ability, and more importantly, helped me gain confidence on the court during games. I always looked forward to game days when he was coaching.", "Not only was he a great all-around coach, he was also someone who truly cared about us as players."], name: 'Emily Bunger', loc: 'IN · Athlete' },
  { quote: ["Coach Gio gave Emma such a great start to her basketball career over the last two years! His personable and approachable nature helped the girls feel very comfortable with him in their training sessions, and they learned a LOT under his guidance!", "Seeing the girls come together and support each other both on and off the court has been so nice. Thank you for helping to develop Emma's self-confidence and for making her middle school basketball memories so fun!"], name: 'Kristin Bruce', loc: 'IN · Parent' },
  { quote: ["Before starting LakeShore Legends, Gio coached my program's 9th & 11th grade Legacy Force teams and did a wonderful job. His ability to connect with his players especially stood out, as they trusted him and bought into what he was teaching.", "Without that buy-in, there's no real influence to help elevate a player's game, but Gio achieved it consistently. He did a wonderful job leading and developing his teams all season long."], name: 'Donte Wilburn', loc: 'Program Director' },
  { quote: ["Coach Gio is great at teaching guard fundamentals and team play. He is extremely encouraging and helped me develop confidence in my own ability.", "Outside of team events, he often took the time to help me work on my jump shot and consistently gave me personalized drills to work on. Our private training sessions were always very intense and productive long-term."], name: 'Sofia Paniagua', loc: 'Athlete' },
];

function Testimonials() {
  const [i, setI] = React.useState(0);
  const t = TESTIMONIALS[i];
  React.useEffect(() => {
    const timer = setInterval(() => {
      setI(prev => (prev + 1) % TESTIMONIALS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);
  return (
    <section className="lsl-section lsl-section--cream">
      <div className="lsl-wrap">
        <SectionHead full eyebrow="What Our Community Says"
          title={<>Hear From The Families Who Have Experienced<br/>Our Development Model Firsthand</>} />
        <div className="lsl-testimonial-wrap">
          <button className="lsl-testimonial-arrow lsl-testimonial-arrow--prev"
            onClick={() => setI((i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
            aria-label="Previous testimonial">
            <i data-lucide="chevron-left"></i>
          </button>
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
          <button className="lsl-testimonial-arrow lsl-testimonial-arrow--next"
            onClick={() => setI((i + 1) % TESTIMONIALS.length)}
            aria-label="Next testimonial">
            <i data-lucide="chevron-right"></i>
          </button>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Testimonials });
