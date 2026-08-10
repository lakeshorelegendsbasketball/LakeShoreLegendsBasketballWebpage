/* global React, SectionHead, LSL */
const {
  useState: useStateBk,
  useEffect: useEffectBk,
  useReducer: useReducerBk
} = React;
const W3F_1ON1 = '57d5ddc7-7fef-4b25-b3c1-6d0ace6f4633';
const W3F_GROUP = '26db51db-43e4-4bf9-90d5-fa4c7a647de2';
const W3F_REQTRN = '0202f9d6-795d-4dd1-ae8e-6b5fe7391d92';
const PAY_1ON1 = 'https://buy.stripe.com/00w9AM0rxcFigGc4M10Jq01';
const PAY_GROUP = {
  '2': 'https://buy.stripe.com/28E9AMcaf48Mdu03HX0Jq00',
  '3': 'https://buy.stripe.com/8x2dR20rx9t64XuguJ0Jq02',
  '4+': 'https://buy.stripe.com/14AcMYdejaxa89GemB0Jq03'
};
const LSL_POLICY = ['Cancellations made within 48 hours of a session are subject to a 50% retainer.', 'Cancellations made more than 48 hours in advance receive a 100% refund.', 'Training session times and availability are subject to change.'];
const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const pad2 = n => String(n).padStart(2, '0');
const isoOf = dt => dt.getFullYear() + '-' + pad2(dt.getMonth() + 1) + '-' + pad2(dt.getDate());
async function notifyCoach(rec) {
  const isGroup = !!rec.players;
  const key = rec.mode === 'request' ? W3F_GROUP : isGroup ? W3F_GROUP : W3F_1ON1;
  const fromName = rec.mode === 'request' || isGroup ? 'LSL Small Group Booking Request' : 'LSL New 1-on-1 Booking';
  const loc = rec.mode !== 'request' ? LSL.locById(rec.locId) : {};
  let subject, message;
  if (rec.mode === 'request') {
    subject = 'New Group Request — ' + rec.athlete;
    message = ['Group Request: ' + rec.athlete, rec.serviceName + ' · ' + rec.players + ' players', DOW[rec.dow] + 's · ' + LSL.fmtTime(rec.reqTime), 'Parent: ' + rec.parent, rec.email + (rec.phone ? ' · ' + rec.phone : ''), rec.age ? 'Age/Grade: ' + rec.age : '', rec.focus ? 'Focus: ' + rec.focus : '', rec.notes ? 'Notes: ' + rec.notes : ''].filter(Boolean).join('\n');
  } else {
    subject = 'New Booking — ' + rec.athlete + ' · ' + LSL.fmtDate(rec.date);
    const memberLines = (rec.groupMembers || []).map((m, i) => 'Player ' + (i + 2) + ': ' + (m.name || '—') + (m.contact ? ' · ' + m.contact : ''));
    message = ['New Booking: ' + rec.athlete, rec.serviceName + (rec.players ? ' · ' + rec.players + ' players' : ''), LSL.fmtDate(rec.date) + ' · ' + LSL.fmtTime(rec.time), loc.name || '', 'Parent: ' + rec.parent, rec.email + (rec.phone ? ' · ' + rec.phone : ''), rec.age ? 'Age/Grade: ' + rec.age : '', rec.focus ? 'Focus: ' + rec.focus : '', rec.notes ? 'Notes: ' + rec.notes : '', memberLines.length ? '\n--- GROUP MEMBERS ---' : '', ...memberLines].filter(Boolean).join('\n');
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
        from_name: fromName,
        replyto: rec.email,
        cc: '2244259490@tmomail.net'
      })
    });
  } catch (e) {/* non-blocking */}
}
function PrivateBooking() {
  const [locFilter, setLocFilter] = useStateBk(null); // null = all
  const [dropOpen, setDropOpen] = useStateBk(false);
  const dropRef = React.useRef(null);
  const [offset, setOffset] = useStateBk(0);
  const [date, setDate] = useStateBk(null);
  const [slotId, setSlotId] = useStateBk(null);
  const [svcType, setSvcType] = useStateBk(null); // 'dated' | 'small'
  const [players, setPlayers] = useStateBk(null);
  const [formOpen, setFormOpen] = useStateBk(false);
  const [reqTrainOpen, setReqTrainOpen] = useStateBk(false);
  const [, forceSync] = useReducerBk(x => x + 1, 0);
  useEffectBk(() => {
    const onSync = () => forceSync();
    window.addEventListener('lsl-synced', onSync);
    return () => window.removeEventListener('lsl-synced', onSync);
  }, []);
  useEffectBk(() => {
    if (window.lucide) window.lucide.createIcons();
  });
  useEffectBk(() => {
    const handler = e => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const todayIso = isoOf(new Date());
  const locs = LSL.getLocs();
  const allSlots = LSL.getSlots();

  // Contingent slot: only visible when its anchor slot is booked
  const toMins = t => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const slotVisible = s => {
    if (!s.contingent || s.status === 'booked') return true;
    if (s.contingentOn) return allSlots.some(o => o.id === s.contingentOn && o.status === 'booked');
    // Legacy fallback: any adjacent booked slot within ±65 min
    return allSlots.some(o => o.locId === s.locId && o.date === s.date && o.status === 'booked' && Math.abs(toMins(o.time) - toMins(s.time)) <= 65);
  };

  // Open dates filtered by selected location + contingent visibility
  const openDates = new Set(allSlots.filter(s => s.status === 'open' && s.date >= todayIso && (!locFilter || s.locId === locFilter) && slotVisible(s)).map(s => s.date));

  // Slots for selected date, filtered by location + contingent visibility
  const daySlots = date ? allSlots.filter(s => s.date === date && (s.status === 'open' || s.status === 'booked') && (!locFilter || s.locId === locFilter) && (s.status === 'booked' || slotVisible(s))).sort((a, b) => a.time.localeCompare(b.time)) : [];

  // Group by location
  const byLoc = {};
  daySlots.forEach(s => {
    if (!byLoc[s.locId]) byLoc[s.locId] = [];
    byLoc[s.locId].push(s);
  });
  const pickLoc = id => {
    setLocFilter(id);
    setDate(null);
    setSlotId(null);
    setSvcType(null);
    setPlayers(null);
    setOffset(0);
  };
  const pickDate = iso => {
    setDate(iso);
    setSlotId(null);
    setSvcType(null);
    setPlayers(null);
  };
  const pickSlot = id => {
    setSlotId(id);
    setSvcType(null);
    setPlayers(null);
  };
  let desc = null;
  if (slotId && svcType === 'dated') {
    desc = {
      mode: 'dated',
      serviceName: '1-on-1 Private Training Session',
      typeId: 'p1',
      payLink: PAY_1ON1,
      slotId
    };
  } else if (slotId && svcType === 'small' && players) {
    desc = {
      mode: 'dated',
      serviceName: 'Small Group Training Session',
      typeId: 'sg' + players,
      payLink: PAY_GROUP[players],
      slotId,
      players
    };
  }
  const ReqFooter = () => /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20,
      paddingTop: 16,
      borderTop: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "lsl-body lsl-body--sm",
    style: {
      color: 'var(--fg2)',
      marginBottom: 12,
      textAlign: 'center',
      fontSize: '0.85em'
    }
  }, "Don\u2019t see a date, time, or location you like?", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '1.08em'
    }
  }, "Reach out \u2014 Coach Gio can often make it work.")), /*#__PURE__*/React.createElement("button", {
    className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
    style: {
      width: '100%'
    },
    onClick: () => setReqTrainOpen(true)
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "mail"
  }), " Request Training"));
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
    className: "lsl-sched__head",
    style: {
      textAlign: 'center'
    }
  }, "Select a Date"), locs.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "lsl-locdrop",
    ref: dropRef
  }, /*#__PURE__*/React.createElement("button", {
    className: "lsl-locdrop__trigger",
    onClick: () => setDropOpen(!dropOpen)
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "map-pin"
  }), /*#__PURE__*/React.createElement("span", null, locFilter ? (LSL.locById(locFilter) || {}).name : 'All Locations'), /*#__PURE__*/React.createElement("i", {
    "data-lucide": dropOpen ? 'chevron-up' : 'chevron-down',
    className: "lsl-locdrop__chev"
  })), dropOpen && /*#__PURE__*/React.createElement("div", {
    className: "lsl-locdrop__menu"
  }, /*#__PURE__*/React.createElement("button", {
    className: 'lsl-locdrop__opt' + (!locFilter ? ' is-sel' : ''),
    onClick: () => {
      pickLoc(null);
      setDropOpen(false);
    }
  }, "All Locations"), locs.map(loc => /*#__PURE__*/React.createElement("button", {
    key: loc.id,
    className: 'lsl-locdrop__opt' + (locFilter === loc.id ? ' is-sel' : ''),
    onClick: () => {
      pickLoc(loc.id);
      setDropOpen(false);
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "map-pin"
  }), loc.name)))), /*#__PURE__*/React.createElement(Calendar, {
    offset: offset,
    onOffset: setOffset,
    openDates: openDates,
    selected: date,
    onPick: pickDate,
    todayIso: todayIso
  })), /*#__PURE__*/React.createElement("div", {
    className: "lsl-sched__col lsl-sched__col--border"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-sched__head"
  }, "Available Times"), !date ? /*#__PURE__*/React.createElement("div", {
    className: "lsl-sched__ph"
  }, "Pick a highlighted date to see open times.") : daySlots.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "lsl-body lsl-body--sm",
    style: {
      color: 'var(--fg3)'
    }
  }, "No open times on this day.") : Object.keys(byLoc).map(lid => {
    const loc = LSL.locById(lid);
    return /*#__PURE__*/React.createElement("div", {
      key: lid,
      style: {
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-times__loc"
    }, loc ? loc.name : lid), /*#__PURE__*/React.createElement("div", {
      className: "lsl-times__row"
    }, byLoc[lid].map(s => /*#__PURE__*/React.createElement("button", {
      key: s.id,
      className: 'lsl-time' + (s.status === 'booked' ? ' is-booked' : '') + (slotId === s.id ? ' is-sel' : ''),
      disabled: s.status === 'booked',
      onClick: () => s.status === 'open' && pickSlot(s.id)
    }, LSL.fmtTime(s.time)))));
  })), /*#__PURE__*/React.createElement("div", {
    className: "lsl-sched__col lsl-sched__col--border"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-sched__head"
  }, "Type of Session"), !slotId ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "lsl-sched__ph"
  }, "Select a date and time to choose your session type."), /*#__PURE__*/React.createElement(ReqFooter, null)) : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "lsl-svclist"
  }, /*#__PURE__*/React.createElement("button", {
    className: 'lsl-svc' + (svcType === 'dated' ? ' is-sel' : ''),
    onClick: () => {
      setSvcType('dated');
      setPlayers(null);
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "lsl-svc__ico"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "user"
  })), /*#__PURE__*/React.createElement("span", {
    className: "lsl-svc__body"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lsl-svc__name"
  }, "1-on-1 Private Training"), /*#__PURE__*/React.createElement("span", {
    className: "lsl-svc__meta"
  }, "One athlete \xB7 60 min")), /*#__PURE__*/React.createElement("i", {
    "data-lucide": "chevron-right",
    className: "lsl-svc__chev"
  })), /*#__PURE__*/React.createElement("button", {
    className: 'lsl-svc' + (svcType === 'small' ? ' is-sel' : ''),
    onClick: () => {
      setSvcType('small');
      setPlayers(null);
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "lsl-svc__ico"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "users"
  })), /*#__PURE__*/React.createElement("span", {
    className: "lsl-svc__body"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lsl-svc__name"
  }, "Small Group Training"), /*#__PURE__*/React.createElement("span", {
    className: "lsl-svc__meta"
  }, "Bring your own group")), /*#__PURE__*/React.createElement("i", {
    "data-lucide": "chevron-right",
    className: "lsl-svc__chev"
  }))), svcType === 'small' && /*#__PURE__*/React.createElement("div", {
    className: "lsl-svcsub"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-svcsub__q"
  }, "How many players in your group?"), /*#__PURE__*/React.createElement("div", {
    className: "lsl-svcsub__opts"
  }, ['2', '3', '4+'].map(n => /*#__PURE__*/React.createElement("button", {
    key: n,
    className: 'lsl-countchip' + (players === n ? ' is-sel' : ''),
    onClick: () => setPlayers(n)
  }, n)))), desc && /*#__PURE__*/React.createElement("button", {
    className: "lsl-btn lsl-btn--primary lsl-times__req",
    onClick: () => setFormOpen(true)
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "calendar-check"
  }), " Book Session"), /*#__PURE__*/React.createElement(ReqFooter, null)))), /*#__PURE__*/React.createElement("p", {
    className: "lsl-bookpolicy"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "info"
  }), /*#__PURE__*/React.createElement("span", null, LSL_POLICY.map((line, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, line, i < LSL_POLICY.length - 1 && /*#__PURE__*/React.createElement("br", null)))))), formOpen && desc && /*#__PURE__*/React.createElement(BookingForm, {
    desc: desc,
    onClose: () => setFormOpen(false),
    onBooked: () => {
      setSlotId(null);
      setDate(null);
      setSvcType(null);
      setPlayers(null);
    }
  }), reqTrainOpen && /*#__PURE__*/React.createElement(TrainingRequestForm, {
    onClose: () => setReqTrainOpen(false)
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
  const extraCount = desc.players ? desc.players === '4+' ? 3 : parseInt(desc.players) - 1 : 0;
  const [groupMembers, setGroupMembers] = useStateBk(() => Array.from({
    length: extraCount
  }, () => ({
    name: '',
    contact: ''
  })));
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
  const setMember = (i, k) => e => {
    setGroupMembers(groupMembers.map((m, idx) => idx === i ? {
      ...m,
      [k]: e.target.value
    } : m));
  };
  function validate() {
    const e = {};
    if (!form.parent.trim()) e.parent = 'Required';
    if (!form.athlete.trim()) e.athlete = 'Required';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.phone.trim()) e.phone = 'Required';
    setErrs(e);
    return Object.keys(e).length === 0;
  }
  async function submit(e) {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    if (!isReq && payLink) window.open(payLink, '_blank');
    const members = groupMembers.filter(m => m.name.trim() || m.contact.trim());
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
        groupMembers: members,
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
        players: desc.players || null,
        groupMembers: members,
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
  }, "Book Session"), /*#__PURE__*/React.createElement("div", {
    className: "lsl-bksummary"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "dumbbell"
  }), desc.serviceName), isReq ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "users"
  }), desc.players, " players"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "calendar"
  }), DOW[desc.dow], "s"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "clock"
  }), LSL.fmtTime(desc.reqTime))) : /*#__PURE__*/React.createElement(React.Fragment, null, desc.players && /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "users"
  }), desc.players, " players"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
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
  }, errs.email)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Phone ", /*#__PURE__*/React.createElement("span", {
    className: "req"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: 'lsl-input' + (errs.phone ? ' is-error' : ''),
    value: form.phone,
    onChange: set('phone'),
    placeholder: "(555) 555-5555"
  }), errs.phone && /*#__PURE__*/React.createElement("span", {
    className: "lsl-err"
  }, errs.phone))), /*#__PURE__*/React.createElement("div", {
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
  })), extraCount > 0 && /*#__PURE__*/React.createElement("div", {
    className: "lsl-groupmembers"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-groupmembers__head"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "users"
  }), "Who else is coming to this session?"), /*#__PURE__*/React.createElement("p", {
    className: "lsl-body lsl-body--sm",
    style: {
      color: 'var(--fg3)',
      marginTop: 0,
      marginBottom: 14
    }
  }, "Add your group members below \u2014 a name and a way to reach them is all we need."), groupMembers.map((m, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "lsl-groupmembers__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lsl-groupmembers__num"
  }, i + 2), /*#__PURE__*/React.createElement("div", {
    className: "lsl-field lsl-field--row",
    style: {
      flex: 1,
      margin: 0
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Name"), /*#__PURE__*/React.createElement("input", {
    className: "lsl-input",
    value: m.name,
    onChange: setMember(i, 'name'),
    placeholder: 'Player ' + (i + 2) + ' name'
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Email or Phone Number"), /*#__PURE__*/React.createElement("input", {
    className: "lsl-input",
    value: m.contact,
    onChange: setMember(i, 'contact'),
    placeholder: "If you have it"
  })))))), /*#__PURE__*/React.createElement("div", {
    className: "lsl-bknote",
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": isReq ? 'mail' : 'shield-check'
  }), isReq ? /*#__PURE__*/React.createElement("span", null, "This sends a ", /*#__PURE__*/React.createElement("strong", null, "request"), " to Coach Gio. You'll get a confirmation email \u2014 no payment is taken now.") : /*#__PURE__*/React.createElement("span", null, "After you submit, you'll be taken to ", /*#__PURE__*/React.createElement("strong", null, "Stripe"), " to pay securely and lock in your spot. Stripe emails your receipt.")), /*#__PURE__*/React.createElement("p", {
    className: "lsl-bkpolicy--modal"
  }, LSL_POLICY.map((line, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, line, i < LSL_POLICY.length - 1 && /*#__PURE__*/React.createElement("br", null)))), errs.form && /*#__PURE__*/React.createElement("p", {
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
  }, result.serviceName, result.players ? ' · ' + result.players + ' players' : '', " \xB7 ", LSL.fmtDateLong(result.date), " \xB7 ", LSL.fmtTime(result.time), " at ", LSL.locById(result.locId).name, ".", /*#__PURE__*/React.createElement("br", null), payLink ? 'Stripe payment opened in a new tab.' : ''), payLink ? /*#__PURE__*/React.createElement("a", {
    className: "lsl-btn lsl-btn--primary",
    href: payLink,
    target: "_blank",
    rel: "noopener",
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
function TrainingRequestForm({
  onClose
}) {
  const [form, setForm] = useStateBk({
    parent: '',
    athlete: '',
    email: '',
    phone: '',
    reqLocation: '',
    reqTime: '',
    reqDate: '',
    age: '',
    focus: '',
    notes: ''
  });
  const [errs, setErrs] = useStateBk({});
  const [busy, setBusy] = useStateBk(false);
  const [done, setDone] = useStateBk(false);
  useEffectBk(() => {
    if (window.lucide) window.lucide.createIcons();
    const onKey = e => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [done]);
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
    const key = W3F_REQTRN;
    if (key) {
      const message = ['Training Request — ' + form.athlete, 'Parent/Guardian: ' + form.parent, form.email + (form.phone ? ' · ' + form.phone : ''), form.reqLocation ? 'Requested Location: ' + form.reqLocation : '', form.reqDate ? 'Requested Date: ' + form.reqDate : '', form.reqTime ? 'Requested Time: ' + form.reqTime : '', form.age ? 'Age/Grade: ' + form.age : '', form.focus ? 'Focus Areas: ' + form.focus : '', form.notes ? 'Notes: ' + form.notes : ''].filter(Boolean).join('\n');
      try {
        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            access_key: key,
            subject: 'Training Request — ' + form.athlete,
            message,
            from_name: 'LSL Request Training',
            replyto: form.email,
            cc: '2244259490@tmomail.net'
          })
        });
      } catch (_) {/* non-blocking */}
    }
    setBusy(false);
    setDone(true);
  }
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
  })), !done ? /*#__PURE__*/React.createElement("form", {
    className: "lsl-bkbody",
    onSubmit: submit
  }, /*#__PURE__*/React.createElement("h3", {
    className: "lsl-h3",
    style: {
      marginTop: 0,
      marginBottom: 4
    }
  }, "Request Training"), /*#__PURE__*/React.createElement("p", {
    className: "lsl-body lsl-body--sm",
    style: {
      color: 'var(--fg2)',
      marginTop: 0,
      marginBottom: 16
    }
  }, "Fill this out and Coach Gio will reach out to make it work."), /*#__PURE__*/React.createElement("div", {
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
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Requested Location"), /*#__PURE__*/React.createElement("input", {
    className: "lsl-input",
    value: form.reqLocation,
    onChange: set('reqLocation'),
    placeholder: "Park Ridge, Mundelein\u2026"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Requested Time"), /*#__PURE__*/React.createElement("input", {
    className: "lsl-input",
    value: form.reqTime,
    onChange: set('reqTime'),
    placeholder: "e.g. 4:00 PM"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "lsl-field lsl-field--row"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Requested Date"), /*#__PURE__*/React.createElement("input", {
    className: "lsl-input",
    value: form.reqDate,
    onChange: set('reqDate'),
    placeholder: "e.g. July 25"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Athlete Age / Grade"), /*#__PURE__*/React.createElement("input", {
    className: "lsl-input",
    value: form.age,
    onChange: set('age'),
    placeholder: "7th grade"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "lsl-field"
  }, /*#__PURE__*/React.createElement("label", null, "Focus Areas / Goals"), /*#__PURE__*/React.createElement("input", {
    className: "lsl-input",
    value: form.focus,
    onChange: set('focus'),
    placeholder: "Shooting, ball handling, defense\u2026"
  })), /*#__PURE__*/React.createElement("div", {
    className: "lsl-field"
  }, /*#__PURE__*/React.createElement("label", null, "Additional Notes"), /*#__PURE__*/React.createElement("textarea", {
    className: "lsl-textarea",
    value: form.notes,
    onChange: set('notes'),
    placeholder: "Anything Coach Gio should know",
    style: {
      minHeight: 76
    }
  })), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "lsl-btn lsl-btn--primary",
    disabled: busy,
    style: {
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "send"
  }), busy ? ' Sending…' : ' Request Booking')) : /*#__PURE__*/React.createElement("div", {
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
  }, "Thank you, ", /*#__PURE__*/React.createElement("strong", null, form.athlete), "! Coach Gio will reach out to ", /*#__PURE__*/React.createElement("strong", null, form.email), " to confirm your training session."), /*#__PURE__*/React.createElement("div", {
    className: "lsl-bkdone__row"
  }, /*#__PURE__*/React.createElement("button", {
    className: "lsl-btn lsl-btn--primary lsl-btn--sm",
    onClick: onClose
  }, "Done")))));
}
Object.assign(window, {
  PrivateBooking,
  BookingForm,
  Calendar,
  TrainingRequestForm
});
