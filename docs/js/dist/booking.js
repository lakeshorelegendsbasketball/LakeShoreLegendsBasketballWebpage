/* global React, SectionHead, LSL */
const {
  useState: useStateBk,
  useEffect: useEffectBk
} = React;
const LSL_POLICY = 'Cancellations made within 48 hours of a session are subject to a 50% retainer. Cancellations made more than 48 hours in advance receive a 100% refund. Training session times and availability are subject to change.';
const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const pad2 = n => String(n).padStart(2, '0');
const isoOf = dt => dt.getFullYear() + '-' + pad2(dt.getMonth() + 1) + '-' + pad2(dt.getDate());

/* Three public services. "dated" services use the posted-opening calendar and
   forward to Stripe. The "request" service collects a day-of-week + time
   preference and emails the coach + family — no payment. */
const SERVICES = [{
  key: '1on1',
  name: '1-on-1 Private Training Session',
  icon: 'user',
  meta: 'One athlete · 60 min',
  mode: 'dated',
  typeId: 'p1',
  payLink: 'https://buy.stripe.com/fZu4gzeKn4f5c9ndiG9Zm02'
}, {
  key: 'small',
  name: 'Small Group Training Session',
  icon: 'users',
  meta: 'Bring your own group',
  mode: 'request'
}, {
  key: 'class',
  name: 'Group Basketball Classes',
  icon: 'graduation-cap',
  meta: 'Open enrollment',
  mode: 'soon'
}];
const REQ_TIMES = (() => {
  const out = [];
  for (let h = 8; h <= 20; h++) for (const m of ['00', '30']) out.push(pad2(h) + ':' + m);
  return out;
})();
async function notifyCoach(rec) {
  const key = LSL.getWeb3Key();
  if (!key) return;
  const loc = rec.mode !== 'request' ? LSL.locById(rec.locId) : {};
  let subject, message;
  if (rec.mode === 'request') {
    subject = 'New Group Request — ' + rec.athlete + ' (' + rec.serviceName + ')';
    message = ['=== NEW GROUP TRAINING REQUEST ===', '', 'SERVICE: ' + rec.serviceName, 'GROUP SIZE: ' + rec.players + ' players', 'PREFERRED DAY: ' + DOW[rec.dow] + 's', 'PREFERRED TIME: ' + LSL.fmtTime(rec.reqTime), '', '--- ATHLETE ---', 'Name: ' + rec.athlete, 'Age / Grade: ' + (rec.age || '—'), '', '--- PARENT / GUARDIAN ---', 'Name: ' + rec.parent, 'Email: ' + rec.email, 'Phone: ' + (rec.phone || '—'), '', '--- TRAINING DETAILS ---', 'Focus Areas / Goals: ' + (rec.focus || '—'), 'Additional Notes: ' + (rec.notes || '—')].join('\n');
  } else {
    subject = '🏀 New 1-on-1 Booking — ' + rec.athlete + ' · ' + LSL.fmtDate(rec.date);
    message = ['=== NEW PRIVATE TRAINING BOOKING ===', '', 'SERVICE: ' + rec.serviceName, 'DATE: ' + LSL.fmtDateLong(rec.date), 'TIME: ' + LSL.fmtTime(rec.time), 'LOCATION: ' + (loc.name || '—'), '', '--- ATHLETE ---', 'Name: ' + rec.athlete, 'Age / Grade: ' + (rec.age || '—'), '', '--- PARENT / GUARDIAN ---', 'Name: ' + rec.parent, 'Email: ' + rec.email, 'Phone: ' + (rec.phone || '—'), '', '--- TRAINING DETAILS ---', 'Focus Areas / Goals: ' + (rec.focus || '—'), 'Additional Notes: ' + (rec.notes || '—'), '', '⚠️  Status: Awaiting Stripe payment'].join('\n');
  }
  try {
    await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        access_key: key,
        subject,
        message,
        from_name: 'LakeShore Legends Booking',
        replyto: rec.email
      })
    });
  } catch (e) {/* non-blocking */}
}
function PrivateBooking() {
  const [service, setService] = useStateBk(null);
  const [players, setPlayers] = useStateBk(null);
  const [offset, setOffset] = useStateBk(0);
  const [date, setDate] = useStateBk(null);
  const [dow, setDow] = useStateBk(null);
  const [slotId, setSlotId] = useStateBk(null);
  const [reqTime, setReqTime] = useStateBk('');
  const [formOpen, setFormOpen] = useStateBk(false);
  useEffectBk(() => {
    if (window.lucide) window.lucide.createIcons();
  });
  const todayIso = isoOf(new Date());
  const openSlots = LSL.getSlots().filter(s => s.status === 'open' && s.date >= todayIso);
  const openDates = new Set(openSlots.map(s => s.date));
  const pickService = s => {
    setService(s);
    setPlayers(null);
    setDate(null);
    setDow(null);
    setSlotId(null);
    setReqTime('');
    setOffset(0);
  };
  const pickDate = iso => {
    setDate(iso);
    setSlotId(null);
  };
  const pickDow = d => {
    setDow(d);
    setReqTime('');
  };
  const daySlots = date ? openSlots.filter(s => s.date === date).sort((a, b) => a.time.localeCompare(b.time)) : [];
  const byLoc = {};
  daySlots.forEach(s => {
    (byLoc[s.locId] = byLoc[s.locId] || []).push(s);
  });
  const isReq = service && service.mode === 'request';
  const isSoon = service && service.mode === 'soon';
  const col2Head = isReq ? 'Select a Day' : 'Select a Date';
  const col3Head = isReq ? 'Request a Time' : 'Available Times';

  // build descriptor for the form
  let desc = null;
  if (isReq && dow != null && reqTime) desc = {
    mode: 'request',
    serviceName: service.name,
    players,
    dow,
    reqTime
  };else if (service && !isReq && slotId) desc = {
    mode: 'dated',
    serviceName: service.name,
    typeId: service.typeId,
    payLink: service.payLink,
    slotId
  };
  return /*#__PURE__*/React.createElement("section", {
    className: "lsl-section lsl-section--cream",
    id: "book",
    style: {
      paddingTop: '44px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-wrap"
  }, /*#__PURE__*/React.createElement(SectionHead, {
    center: true,
    wide: true,
    eyebrow: "Private Training",
    title: "Book a Session With Coach Gio",
    sub: "Check out our availability and book the date and time that works for you."
  }), /*#__PURE__*/React.createElement("div", {
    className: "lsl-sched"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-sched__col"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-sched__head"
  }, "Service Offerings"), /*#__PURE__*/React.createElement("div", {
    className: "lsl-svclist"
  }, SERVICES.map(s => /*#__PURE__*/React.createElement(React.Fragment, {
    key: s.key
  }, /*#__PURE__*/React.createElement("button", {
    className: 'lsl-svc' + (service && service.key === s.key ? ' is-sel' : ''),
    onClick: () => pickService(s)
  }, /*#__PURE__*/React.createElement("span", {
    className: "lsl-svc__ico"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": s.icon
  })), /*#__PURE__*/React.createElement("span", {
    className: "lsl-svc__body"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lsl-svc__name"
  }, s.name), /*#__PURE__*/React.createElement("span", {
    className: "lsl-svc__meta"
  }, s.meta)), /*#__PURE__*/React.createElement("i", {
    "data-lucide": "chevron-right",
    className: "lsl-svc__chev"
  })), s.key === 'small' && service && service.key === 'small' && /*#__PURE__*/React.createElement("div", {
    className: "lsl-svcsub"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-svcsub__q"
  }, "How many players do you have in your group?"), /*#__PURE__*/React.createElement("div", {
    className: "lsl-svcsub__opts"
  }, ['2', '3', '4', '5', '6+'].map(n => /*#__PURE__*/React.createElement("button", {
    key: n,
    className: 'lsl-countchip' + (players === n ? ' is-sel' : ''),
    onClick: () => {
      setPlayers(n);
      setDow(null);
      setReqTime('');
    }
  }, n)))))))), /*#__PURE__*/React.createElement("div", {
    className: "lsl-sched__col lsl-sched__col--border"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-sched__head"
  }, col2Head), !service && /*#__PURE__*/React.createElement("div", {
    className: "lsl-sched__ph"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "arrow-left"
  }), " Choose a service to begin."), isSoon && /*#__PURE__*/React.createElement("div", {
    className: "lsl-soon"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "clock"
  }), /*#__PURE__*/React.createElement("div", {
    className: "lsl-soon__title"
  }, "Coming Soon!"), /*#__PURE__*/React.createElement("p", {
    className: "lsl-soon__sub"
  }, "Group basketball classes are launching soon. Check back for dates and times.")), service && !isReq && !isSoon && /*#__PURE__*/React.createElement(Calendar, {
    offset: offset,
    onOffset: setOffset,
    openDates: openDates,
    selected: date,
    onPick: pickDate,
    todayIso: todayIso
  }), isReq && !players && /*#__PURE__*/React.createElement("div", {
    className: "lsl-sched__ph"
  }, "Select your group size first."), isReq && players && /*#__PURE__*/React.createElement("div", {
    className: "lsl-dows"
  }, DOW.map((d, i) => /*#__PURE__*/React.createElement("button", {
    key: d,
    className: 'lsl-dow' + (dow === i ? ' is-sel' : ''),
    onClick: () => pickDow(i)
  }, /*#__PURE__*/React.createElement("span", {
    className: "lsl-dow__d"
  }, d), /*#__PURE__*/React.createElement("i", {
    "data-lucide": "chevron-right"
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "lsl-sched__col lsl-sched__col--border"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-sched__head"
  }, col3Head), isSoon && /*#__PURE__*/React.createElement("div", {
    className: "lsl-sched__ph"
  }, "Stay tuned \u2014 enrollment opens soon."), service && !isReq && !isSoon && !date && /*#__PURE__*/React.createElement("div", {
    className: "lsl-sched__ph"
  }, "Pick a date with a dot to see open times."), service && !isReq && !isSoon && date && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "lsl-times__day"
  }, LSL.fmtDateLong(date)), daySlots.length === 0 && /*#__PURE__*/React.createElement("p", {
    className: "lsl-body lsl-body--sm",
    style: {
      color: 'var(--fg3)'
    }
  }, "No open times this day."), Object.keys(byLoc).map(lid => /*#__PURE__*/React.createElement("div", {
    className: "lsl-times__group",
    key: lid
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-times__loc"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "map-pin"
  }), LSL.locById(lid).name), /*#__PURE__*/React.createElement("div", {
    className: "lsl-times__row"
  }, byLoc[lid].map(s => /*#__PURE__*/React.createElement("button", {
    key: s.id,
    className: 'lsl-time' + (slotId === s.id ? ' is-sel' : ''),
    onClick: () => setSlotId(s.id)
  }, LSL.fmtTime(s.time))))))), isReq && dow == null && /*#__PURE__*/React.createElement("div", {
    className: "lsl-sched__ph"
  }, players ? 'Pick a day of the week first.' : 'Choose group size and a day.'), isReq && dow != null && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "lsl-times__day"
  }, DOW[dow], "s"), /*#__PURE__*/React.createElement("label", {
    className: "lsl-times__lbl"
  }, "What time works best?"), /*#__PURE__*/React.createElement("select", {
    className: "lsl-select",
    value: reqTime,
    onChange: e => setReqTime(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Select a preferred time\u2026"), REQ_TIMES.map(t => /*#__PURE__*/React.createElement("option", {
    key: t,
    value: t
  }, LSL.fmtTime(t)))), /*#__PURE__*/React.createElement("p", {
    className: "lsl-body lsl-body--sm",
    style: {
      color: 'var(--fg3)',
      marginTop: 10
    }
  }, "This is a request \u2014 Coach Gio will confirm the time by email.")), desc && /*#__PURE__*/React.createElement("button", {
    className: "lsl-btn lsl-btn--primary lsl-times__req",
    onClick: () => setFormOpen(true)
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "calendar-check"
  }), " Request Booking"))), /*#__PURE__*/React.createElement("p", {
    className: "lsl-bookpolicy"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "info"
  }), LSL_POLICY)), formOpen && desc && /*#__PURE__*/React.createElement(BookingForm, {
    desc: desc,
    onClose: () => setFormOpen(false),
    onBooked: () => {
      setSlotId(null);
      setDate(null);
      setReqTime('');
      setDow(null);
    }
  }));
}
function Calendar({
  offset,
  onOffset,
  openDates,
  selected,
  onPick,
  todayIso
}) {
  useEffectBk(() => {
    if (window.lucide) window.lucide.createIcons();
  });
  const today = new Date();
  const base = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const y = base.getFullYear(),
    m = base.getMonth();
  const firstDow = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  const monthName = base.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });
  const dows = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return /*#__PURE__*/React.createElement("div", {
    className: "lsl-cal"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-cal__nav"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => onOffset(Math.max(0, offset - 1)),
    disabled: offset <= 0,
    "aria-label": "Previous month"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "chevron-left"
  })), /*#__PURE__*/React.createElement("span", {
    className: "lsl-cal__month"
  }, monthName), /*#__PURE__*/React.createElement("button", {
    onClick: () => onOffset(offset + 1),
    "aria-label": "Next month"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "chevron-right"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "lsl-cal__dows"
  }, dows.map(d => /*#__PURE__*/React.createElement("span", {
    key: d
  }, d))), /*#__PURE__*/React.createElement("div", {
    className: "lsl-cal__grid"
  }, cells.map((d, i) => {
    if (d === null) return /*#__PURE__*/React.createElement("span", {
      key: 'b' + i,
      className: "lsl-cal__cell is-empty"
    });
    const iso = y + '-' + pad2(m + 1) + '-' + pad2(d);
    const hasOpen = openDates.has(iso);
    const isPast = iso < todayIso;
    const can = hasOpen && !isPast;
    return /*#__PURE__*/React.createElement("button", {
      key: iso,
      disabled: !can,
      className: 'lsl-cal__cell' + (can ? ' is-open' : '') + (selected === iso ? ' is-sel' : ''),
      onClick: () => can && onPick(iso)
    }, d, can && /*#__PURE__*/React.createElement("span", {
      className: "lsl-cal__dot"
    }));
  })));
}
function BookingForm({
  desc,
  onClose,
  onBooked
}) {
  const [form, setForm] = useStateBk({
    parent: '',
    athlete: '',
    age: '',
    email: '',
    phone: '',
    focus: '',
    notes: ''
  });
  const [errs, setErrs] = useStateBk({});
  const [busy, setBusy] = useStateBk(false);
  const [result, setResult] = useStateBk(null);
  useEffectBk(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [result]);
  useEffectBk(() => {
    const onKey = e => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const isReq = desc.mode === 'request';
  const payLink = desc.payLink || null;
  const slot = isReq ? {} : LSL.getSlots().find(s => s.id === desc.slotId) || {};
  const loc = isReq ? {} : LSL.locById(slot.locId);
  const set = k => e => setForm({
    ...form,
    [k]: e.target.value
  });
  function validate() {
    const e = {};
    if (!form.parent.trim()) e.parent = 'Required';
    if (!form.athlete.trim()) e.athlete = 'Required';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = 'Enter a valid email';
    setErrs(e);
    return Object.keys(e).length === 0;
  }
  async function submit(e) {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    let rec;
    if (isReq) {
      rec = {
        id: LSL.uid(),
        mode: 'request',
        serviceName: desc.serviceName,
        players: desc.players,
        dow: desc.dow,
        reqTime: desc.reqTime,
        parent: form.parent,
        athlete: form.athlete,
        age: form.age,
        email: form.email,
        phone: form.phone,
        focus: form.focus,
        notes: form.notes,
        created: new Date().toISOString(),
        status: 'requested'
      };
      LSL.setBooks([...LSL.getBooks(), rec]);
    } else {
      const slots = LSL.getSlots();
      const sIdx = slots.findIndex(s => s.id === desc.slotId);
      if (sIdx < 0 || slots[sIdx].status !== 'open') {
        setBusy(false);
        setErrs({
          form: 'Sorry — that opening was just taken. Please pick another time.'
        });
        return;
      }
      rec = {
        id: LSL.uid(),
        mode: 'dated',
        typeId: desc.typeId,
        serviceName: desc.serviceName,
        slotId: desc.slotId,
        date: slots[sIdx].date,
        time: slots[sIdx].time,
        locId: slots[sIdx].locId,
        parent: form.parent,
        athlete: form.athlete,
        age: form.age,
        email: form.email,
        phone: form.phone,
        focus: form.focus,
        notes: form.notes,
        created: new Date().toISOString(),
        status: 'awaiting_payment'
      };
      slots[sIdx] = {
        ...slots[sIdx],
        status: 'booked',
        bookingId: rec.id
      };
      LSL.setSlots(slots);
      LSL.setBooks([...LSL.getBooks(), rec]);
    }
    await notifyCoach(rec);
    setBusy(false);
    setResult(rec);
    if (onBooked) onBooked();
  }

  // dated bookings forward to Stripe after the confirmation screen
  useEffectBk(() => {
    if (result && result.mode === 'dated' && payLink) {
      const id = setTimeout(() => {
        window.location.href = payLink;
      }, 4000);
      return () => clearTimeout(id);
    }
  }, [result]);
  return /*#__PURE__*/React.createElement("div", {
    className: "lsl-lightbox",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-bkmodal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("button", {
    className: "lsl-lightbox__close",
    onClick: onClose,
    "aria-label": "Close",
    style: {
      position: 'absolute',
      top: 16,
      right: 16
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "x"
  })), !result ? /*#__PURE__*/React.createElement("form", {
    className: "lsl-bkbody",
    onSubmit: submit
  }, /*#__PURE__*/React.createElement("h3", {
    className: "lsl-h3",
    style: {
      marginTop: 0,
      marginBottom: 4
    }
  }, "Request Booking"), /*#__PURE__*/React.createElement("div", {
    className: "lsl-bksummary"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "dumbbell"
  }), desc.serviceName), isReq ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "users"
  }), desc.players, " players"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "calendar"
  }), DOW[desc.dow], "s"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "clock"
  }), LSL.fmtTime(desc.reqTime))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "calendar"
  }), LSL.fmtDateLong(slot.date)), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "clock"
  }), LSL.fmtTime(slot.time)), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "map-pin"
  }), loc.name))), /*#__PURE__*/React.createElement("div", {
    className: "lsl-field lsl-field--row"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Parent / Guardian Name ", /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: 'lsl-input' + (errs.parent ? ' is-error' : ''),
    value: form.parent,
    onChange: set('parent'),
    placeholder: "Jane Smith"
  }), errs.parent && /*#__PURE__*/React.createElement("span", {
    className: "lsl-err"
  }, errs.parent)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Athlete Name ", /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: 'lsl-input' + (errs.athlete ? ' is-error' : ''),
    value: form.athlete,
    onChange: set('athlete'),
    placeholder: "Alex Smith"
  }), errs.athlete && /*#__PURE__*/React.createElement("span", {
    className: "lsl-err"
  }, errs.athlete))), /*#__PURE__*/React.createElement("div", {
    className: "lsl-field lsl-field--row"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Email ", /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: 'lsl-input' + (errs.email ? ' is-error' : ''),
    type: "email",
    value: form.email,
    onChange: set('email'),
    placeholder: "you@email.com"
  }), errs.email && /*#__PURE__*/React.createElement("span", {
    className: "lsl-err"
  }, errs.email)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Phone"), /*#__PURE__*/React.createElement("input", {
    className: "lsl-input",
    value: form.phone,
    onChange: set('phone'),
    placeholder: "(555) 555-5555"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "lsl-field lsl-field--row"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Athlete Age / Grade"), /*#__PURE__*/React.createElement("input", {
    className: "lsl-input",
    value: form.age,
    onChange: set('age'),
    placeholder: "7th grade"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Focus Areas / Goals"), /*#__PURE__*/React.createElement("input", {
    className: "lsl-input",
    value: form.focus,
    onChange: set('focus'),
    placeholder: "Shooting, ball handling"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "lsl-field"
  }, /*#__PURE__*/React.createElement("label", null, "Additional Notes"), /*#__PURE__*/React.createElement("textarea", {
    className: "lsl-textarea",
    value: form.notes,
    onChange: set('notes'),
    placeholder: "Anything Coach Gio should know",
    style: {
      minHeight: 76
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "lsl-bknote",
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": isReq ? 'mail' : 'shield-check'
  }), isReq ? /*#__PURE__*/React.createElement("span", null, "This sends a ", /*#__PURE__*/React.createElement("strong", null, "class request"), " to Coach Gio. You'll get a confirmation email \u2014 no payment is taken now.") : /*#__PURE__*/React.createElement("span", null, "After you submit, you'll be taken to ", /*#__PURE__*/React.createElement("strong", null, "Stripe"), " to pay securely and lock in your spot. Stripe emails your receipt.")), /*#__PURE__*/React.createElement("p", {
    className: "lsl-bkpolicy--modal"
  }, LSL_POLICY), errs.form && /*#__PURE__*/React.createElement("p", {
    className: "lsl-err"
  }, errs.form), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "lsl-btn lsl-btn--primary",
    disabled: busy,
    style: {
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": isReq ? 'send' : 'arrow-right'
  }), busy ? ' Submitting…' : isReq ? ' Submit Request' : ' Reserve & Continue to Payment')) : result.mode === 'request' ? /*#__PURE__*/React.createElement("div", {
    className: "lsl-bkbody lsl-bkdone"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-formsuccess__ico"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "check"
  })), /*#__PURE__*/React.createElement("h3", {
    className: "lsl-h3"
  }, "Request received!"), /*#__PURE__*/React.createElement("p", {
    className: "lsl-body lsl-body--sm",
    style: {
      marginTop: 0
    }
  }, result.serviceName, " \xB7 ", result.players, " players \xB7 ", DOW[result.dow], "s around ", LSL.fmtTime(result.reqTime), ".", /*#__PURE__*/React.createElement("br", null), "Coach Gio will reach out to ", /*#__PURE__*/React.createElement("strong", null, result.email), " to confirm your class."), /*#__PURE__*/React.createElement("div", {
    className: "lsl-bkdone__row"
  }, /*#__PURE__*/React.createElement("button", {
    className: "lsl-btn lsl-btn--primary lsl-btn--sm",
    onClick: onClose
  }, "Done"))) : /*#__PURE__*/React.createElement("div", {
    className: "lsl-bkbody lsl-bkdone"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-formsuccess__ico"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "check"
  })), /*#__PURE__*/React.createElement("h3", {
    className: "lsl-h3"
  }, "Spot reserved \u2014 one last step"), /*#__PURE__*/React.createElement("p", {
    className: "lsl-body lsl-body--sm",
    style: {
      marginTop: 0
    }
  }, result.serviceName, " \xB7 ", LSL.fmtDateLong(result.date), " \xB7 ", LSL.fmtTime(result.time), " at ", LSL.locById(result.locId).name, ".", /*#__PURE__*/React.createElement("br", null), "Redirecting you to secure Stripe payment\u2026"), payLink ? /*#__PURE__*/React.createElement("a", {
    className: "lsl-btn lsl-btn--primary",
    href: payLink,
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "credit-card"
  }), " Complete Payment Now") : /*#__PURE__*/React.createElement("div", {
    className: "lsl-bknote"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "info"
  }), /*#__PURE__*/React.createElement("span", null, "Coach Gio will email a secure Stripe payment link to ", result.email, " shortly.")), /*#__PURE__*/React.createElement("div", {
    className: "lsl-bkdone__row"
  }, /*#__PURE__*/React.createElement("button", {
    className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
    onClick: () => LSL.downloadICS(result)
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "calendar-plus"
  }), " Add to calendar")), /*#__PURE__*/React.createElement("p", {
    className: "lsl-body lsl-body--sm",
    style: {
      color: 'var(--fg3)',
      marginBottom: 0
    }
  }, "Your spot is held. It's confirmed once payment is complete."))));
}
Object.assign(window, {
  PrivateBooking,
  BookingForm,
  Calendar
});
