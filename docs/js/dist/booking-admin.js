/* global React, LSL */
const {
  useState: useStateAd,
  useEffect: useEffectAd,
  useReducer: useReducerAd
} = React;
function CoachAdminPage() {
  const [authed, setAuthed] = useStateAd(false);
  const [pass, setPass] = useStateAd('');
  const [perr, setPerr] = useStateAd(false);
  const [tab, setTab] = useStateAd('avail');
  const [, force] = useReducerAd(x => x + 1, 0);
  useEffectAd(() => {
    if (window.lucide) window.lucide.createIcons();
  });
  useEffectAd(() => {
    const onSync = () => force();
    window.addEventListener('lsl-synced', onSync);
    return () => window.removeEventListener('lsl-synced', onSync);
  }, []);
  const tryAuth = e => {
    e.preventDefault();
    if (pass === LSL.getPass()) {
      setAuthed(true);
      setPerr(false);
    } else setPerr(true);
  };
  if (!authed) {
    return /*#__PURE__*/React.createElement("div", {
      className: "lsl-adminpage"
    }, /*#__PURE__*/React.createElement("form", {
      className: "lsl-admin lsl-admin--login",
      onSubmit: tryAuth
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-admin__lock"
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "lock"
    })), /*#__PURE__*/React.createElement("h1", {
      className: "lsl-h3",
      style: {
        margin: '0 0 6px',
        textAlign: 'center'
      }
    }, "Coach Login"), /*#__PURE__*/React.createElement("p", {
      className: "lsl-body lsl-body--sm",
      style: {
        marginTop: 0,
        textAlign: 'center',
        color: 'var(--fg3)'
      }
    }, "LakeShore Legends \u2014 private booking dashboard."), /*#__PURE__*/React.createElement("input", {
      className: 'lsl-input' + (perr ? ' is-error' : ''),
      type: "password",
      value: pass,
      onChange: e => setPass(e.target.value),
      placeholder: "Passcode",
      autoFocus: true,
      style: {
        textAlign: 'center'
      }
    }), perr && /*#__PURE__*/React.createElement("span", {
      className: "lsl-err",
      style: {
        textAlign: 'center'
      }
    }, "Incorrect passcode"), /*#__PURE__*/React.createElement("button", {
      type: "submit",
      className: "lsl-btn lsl-btn--primary",
      style: {
        width: '100%',
        marginTop: 14
      }
    }, "Unlock")));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "lsl-adminpage"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-admin lsl-admin--page"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-admin__head"
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/badge-crest.png",
    alt: "",
    style: {
      height: 40
    }
  }), /*#__PURE__*/React.createElement("h1", {
    className: "lsl-h3",
    style: {
      margin: 0
    }
  }, "Coach Dashboard"), /*#__PURE__*/React.createElement("span", {
    className: "lsl-pill lsl-pill--sky"
  }, "Coach Gio"), /*#__PURE__*/React.createElement("a", {
    className: "lsl-admin__exit",
    href: "training.html"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "external-link"
  }), " View site")), /*#__PURE__*/React.createElement("div", {
    className: "lsl-admin__tabs"
  }, [['avail', 'Availability'], ['types', 'Sessions & Links'], ['locs', 'Locations'], ['books', 'Bookings'], ['set', 'Settings']].map(([k, l]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    className: tab === k ? 'is-active' : '',
    onClick: () => setTab(k)
  }, l))), /*#__PURE__*/React.createElement("div", {
    className: "lsl-admin__body"
  }, tab === 'avail' && /*#__PURE__*/React.createElement(AvailTab, {
    force: force
  }), tab === 'types' && /*#__PURE__*/React.createElement(TypesTab, {
    force: force
  }), tab === 'locs' && /*#__PURE__*/React.createElement(LocsTab, {
    force: force
  }), tab === 'books' && /*#__PURE__*/React.createElement(BooksTab, {
    force: force
  }), tab === 'set' && /*#__PURE__*/React.createElement(SettingsTab, {
    force: force
  }))));
}

/* ---------- Availability ---------- */
const adPad2 = n => String(n).padStart(2, '0');
const adShiftTime = (time, mins) => {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  if (total < 0 || total >= 1440) return null;
  return adPad2(Math.floor(total / 60)) + ':' + adPad2(total % 60);
};
function AvailTab({
  force
}) {
  const locs = LSL.getLocs();
  const [date, setDate] = useStateAd('');
  const [time, setTime] = useStateAd('');
  const [locId, setLocId] = useStateAd(locs[0] ? locs[0].id : '');
  const [b2bPicking, setB2bPicking] = useStateAd(null); // slotId currently showing picker
  useEffectAd(() => {
    if (window.lucide) window.lucide.createIcons();
  });
  const add = () => {
    if (!date || !time || !locId) return;
    LSL.setSlots([...LSL.getSlots(), {
      id: LSL.uid(),
      date,
      time,
      locId,
      status: 'open'
    }]);
    setDate('');
    setTime('');
    force();
  };
  const del = id => {
    LSL.setSlots(LSL.getSlots().filter(s => s.id !== id));
    force();
  };
  const toggleBooked = id => {
    LSL.setSlots(LSL.getSlots().map(s => s.id === id ? {
      ...s,
      status: s.status === 'booked' ? 'open' : 'booked'
    } : s));
    force();
  };
  const addB2B = (slot, dir) => {
    const newTime = adShiftTime(slot.time, dir === 'after' ? 60 : -60);
    if (!newTime) return;
    LSL.setSlots([...LSL.getSlots(), {
      id: LSL.uid(),
      date: slot.date,
      time: newTime,
      locId: slot.locId,
      status: 'open',
      contingent: true,
      contingentOn: slot.id
    }]);
    setB2bPicking(null);
    force();
  };
  const slots = LSL.getSlots().slice().sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "lsl-body lsl-body--sm",
    style: {
      marginTop: 0,
      color: 'var(--fg3)'
    }
  }, "Add openings as they come up. Use ", /*#__PURE__*/React.createElement("strong", null, "Add Back to Back"), " on any slot to create a hidden session that only appears once that slot is booked."), /*#__PURE__*/React.createElement("div", {
    className: "lsl-admin__addrow"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Date"), /*#__PURE__*/React.createElement("input", {
    className: "lsl-input",
    type: "date",
    value: date,
    onChange: e => setDate(e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Time"), /*#__PURE__*/React.createElement("input", {
    className: "lsl-input",
    type: "time",
    value: time,
    onChange: e => setTime(e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Location"), /*#__PURE__*/React.createElement("select", {
    className: "lsl-select",
    value: locId,
    onChange: e => setLocId(e.target.value)
  }, locs.map(l => /*#__PURE__*/React.createElement("option", {
    key: l.id,
    value: l.id
  }, l.name)))), /*#__PURE__*/React.createElement("button", {
    className: "lsl-btn lsl-btn--primary lsl-btn--sm",
    onClick: add
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "plus"
  }), " Add opening")), /*#__PURE__*/React.createElement("div", {
    className: "lsl-admin__list",
    style: {
      marginTop: 8
    }
  }, slots.length === 0 && /*#__PURE__*/React.createElement("p", {
    className: "lsl-body lsl-body--sm",
    style: {
      color: 'var(--fg3)'
    }
  }, "No openings yet. Add your first above."), slots.map(s => {
    const l = LSL.locById(s.locId);
    const beforeTime = adShiftTime(s.time, -60);
    const afterTime = adShiftTime(s.time, 60);
    const anchorSlot = s.contingentOn ? slots.find(x => x.id === s.contingentOn) : null;
    return /*#__PURE__*/React.createElement("div", {
      className: "lsl-admin__item lsl-admin__item--wrap",
      key: s.id
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-admin__itemmain"
    }, /*#__PURE__*/React.createElement("strong", null, LSL.fmtDate(s.date)), " \xB7 ", LSL.fmtTime(s.time), " \xB7 ", l && l.name, s.contingent && anchorSlot && /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--fg3)',
        fontWeight: 400
      }
    }, " \u2014 unlocks when ", LSL.fmtTime(anchorSlot.time), " is booked")), /*#__PURE__*/React.createElement("div", {
      className: "lsl-admin__itemactions"
    }, /*#__PURE__*/React.createElement("span", {
      className: 'lsl-pill ' + (s.status === 'booked' ? 'lsl-pill--orange' : 'lsl-pill--outline')
    }, s.status === 'booked' ? 'Booked' : 'Open'), s.contingent && /*#__PURE__*/React.createElement("span", {
      className: "lsl-pill lsl-pill--sky"
    }, "B2B"), /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
      style: {
        padding: '3px 10px',
        fontSize: 12
      },
      onClick: () => toggleBooked(s.id)
    }, s.status === 'booked' ? 'Mark Open' : 'Mark Booked'), b2bPicking === s.id ? /*#__PURE__*/React.createElement("div", {
      className: "lsl-admin__b2bpick"
    }, beforeTime && /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
      onClick: () => addB2B(s, 'before')
    }, "\u2190 ", LSL.fmtTime(beforeTime)), afterTime && /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
      onClick: () => addB2B(s, 'after')
    }, LSL.fmtTime(afterTime), " \u2192"), /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
      style: {
        opacity: 0.5
      },
      onClick: () => setB2bPicking(null)
    }, "Cancel")) : !s.contingent && /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
      style: {
        padding: '3px 10px',
        fontSize: 12
      },
      onClick: () => setB2bPicking(s.id)
    }, "Add Back to Back"), /*#__PURE__*/React.createElement("button", {
      className: "lsl-admin__del",
      onClick: () => del(s.id),
      "aria-label": "Delete"
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "trash-2"
    }))));
  })));
}

/* ---------- Sessions & Stripe links ---------- */
function TypesTab({
  force
}) {
  const types = LSL.getTypes();
  useEffectAd(() => {
    if (window.lucide) window.lucide.createIcons();
  });
  const upd = (id, k, v) => {
    LSL.setTypes(LSL.getTypes().map(t => t.id === id ? {
      ...t,
      [k]: v
    } : t));
    force();
  };
  const del = id => {
    LSL.setTypes(LSL.getTypes().filter(t => t.id !== id));
    force();
  };
  const add = () => {
    LSL.setTypes([...LSL.getTypes(), {
      id: LSL.uid(),
      name: 'New Session',
      size: '1-on-1',
      group: false,
      duration: 60,
      price: null,
      payLink: ''
    }]);
    force();
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "lsl-body lsl-body--sm",
    style: {
      marginTop: 0,
      color: 'var(--fg3)'
    }
  }, "Each session forwards to its Stripe Payment Link after the family submits the form. Edit prices in Stripe \u2014 the checkout page always shows the live price."), types.map(t => /*#__PURE__*/React.createElement("div", {
    className: "lsl-admin__card",
    key: t.id
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-field lsl-field--row"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Name"), /*#__PURE__*/React.createElement("input", {
    className: "lsl-input",
    value: t.name,
    onChange: e => upd(t.id, 'name', e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 130
    }
  }, /*#__PURE__*/React.createElement("label", null, "Format"), /*#__PURE__*/React.createElement("input", {
    className: "lsl-input",
    value: t.size,
    onChange: e => upd(t.id, 'size', e.target.value),
    placeholder: "1-on-1"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 110
    }
  }, /*#__PURE__*/React.createElement("label", null, "Minutes"), /*#__PURE__*/React.createElement("input", {
    className: "lsl-input",
    type: "number",
    value: t.duration,
    onChange: e => upd(t.id, 'duration', +e.target.value)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "lsl-field",
    style: {
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("label", null, "Stripe Payment Link"), /*#__PURE__*/React.createElement("input", {
    className: "lsl-input",
    value: t.payLink,
    onChange: e => upd(t.id, 'payLink', e.target.value),
    placeholder: "https://buy.stripe.com/..."
  })), /*#__PURE__*/React.createElement("button", {
    className: "lsl-admin__del lsl-admin__del--text",
    onClick: () => del(t.id)
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "trash-2"
  }), " Remove"))), /*#__PURE__*/React.createElement("button", {
    className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
    onClick: add
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "plus"
  }), " Add session type"));
}

/* ---------- Locations ---------- */
function LocsTab({
  force
}) {
  const locs = LSL.getLocs();
  useEffectAd(() => {
    if (window.lucide) window.lucide.createIcons();
  });
  const upd = (id, k, v) => {
    LSL.setLocs(LSL.getLocs().map(l => l.id === id ? {
      ...l,
      [k]: v
    } : l));
    force();
  };
  const del = id => {
    LSL.setLocs(LSL.getLocs().filter(l => l.id !== id));
    force();
  };
  const add = () => {
    LSL.setLocs([...LSL.getLocs(), {
      id: LSL.uid(),
      name: '',
      city: ''
    }]);
    force();
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "lsl-body lsl-body--sm",
    style: {
      marginTop: 0,
      color: 'var(--fg3)'
    }
  }, "Use general areas/towns. Exact address can be shared privately once a booking is confirmed."), locs.map(l => /*#__PURE__*/React.createElement("div", {
    className: "lsl-admin__card",
    key: l.id
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-field",
    style: {
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("label", null, "Area / Town"), /*#__PURE__*/React.createElement("input", {
    className: "lsl-input",
    value: l.name,
    onChange: e => upd(l.id, 'name', e.target.value),
    placeholder: "Park Ridge, IL"
  })), /*#__PURE__*/React.createElement("button", {
    className: "lsl-admin__del lsl-admin__del--text",
    onClick: () => del(l.id)
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "trash-2"
  }), " Remove"))), /*#__PURE__*/React.createElement("button", {
    className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
    onClick: add
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "plus"
  }), " Add location"));
}

/* ---------- Bookings ---------- */
function BooksTab({
  force
}) {
  const books = LSL.getBooks().slice().sort((a, b) => {
    const aKey = a.date ? a.date + a.time : a.created || '';
    const bKey = b.date ? b.date + b.time : b.created || '';
    return bKey.localeCompare(aKey);
  });
  useEffectAd(() => {
    if (window.lucide) window.lucide.createIcons();
  });
  const cancel = bk => {
    LSL.setBooks(LSL.getBooks().filter(b => b.id !== bk.id));
    LSL.setSlots(LSL.getSlots().map(s => s.id === bk.slotId ? {
      ...s,
      status: 'open',
      bookingId: undefined
    } : s));
    force();
  };
  if (books.length === 0) return /*#__PURE__*/React.createElement("p", {
    className: "lsl-body lsl-body--sm",
    style: {
      color: 'var(--fg3)'
    }
  }, "No bookings yet. They'll appear here as families reserve openings.");
  const DOWN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return /*#__PURE__*/React.createElement("div", {
    className: "lsl-admin__list"
  }, books.map(bk => {
    const req = bk.mode === 'request';
    const t = LSL.typeById(bk.typeId);
    const l = LSL.locById(bk.locId);
    return /*#__PURE__*/React.createElement("div", {
      className: "lsl-admin__booking",
      key: bk.id
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-admin__bookhead"
    }, /*#__PURE__*/React.createElement("strong", null, bk.athlete), req ? /*#__PURE__*/React.createElement("span", {
      className: "lsl-pill lsl-pill--outline"
    }, "Request \xB7 ", DOWN[bk.dow], "s \xB7 ", LSL.fmtTime(bk.reqTime)) : /*#__PURE__*/React.createElement("span", {
      className: "lsl-pill lsl-pill--sky"
    }, LSL.fmtDate(bk.date), " \xB7 ", LSL.fmtTime(bk.time))), /*#__PURE__*/React.createElement("div", {
      className: "lsl-admin__bookmeta"
    }, req ? /*#__PURE__*/React.createElement(React.Fragment, null, bk.serviceName, " \xB7 ", bk.players, " players") : /*#__PURE__*/React.createElement(React.Fragment, null, bk.serviceName || t && t.name, bk.players ? ' · ' + bk.players + ' players' : '', " \xB7 ", l && l.name), /*#__PURE__*/React.createElement("br", null), "Parent: ", bk.parent, " \xB7 ", bk.email, bk.phone ? ' · ' + bk.phone : '', /*#__PURE__*/React.createElement("br", null), bk.age ? 'Age/Grade: ' + bk.age + ' · ' : '', bk.focus ? 'Focus: ' + bk.focus : '', bk.notes ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("br", null), "Notes: ", bk.notes) : null), /*#__PURE__*/React.createElement("div", {
      className: "lsl-admin__bookactions"
    }, !req && /*#__PURE__*/React.createElement("button", {
      className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
      onClick: () => LSL.downloadICS(bk)
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "calendar-plus"
    }), " .ics"), /*#__PURE__*/React.createElement("button", {
      className: "lsl-admin__del lsl-admin__del--text",
      onClick: () => cancel(bk)
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "x"
    }), " ", req ? 'Remove request' : 'Cancel & reopen')));
  }));
}

/* ---------- Settings ---------- */
function SettingsTab({
  force
}) {
  const [np, setNp] = useStateAd('');
  const [w3, setW3] = useStateAd(LSL.getWeb3Key());
  const [jbKey, setJbKey] = useStateAd(LSL.getJBKey());
  const [jbBin, setJbBin] = useStateAd(LSL.getJBBin());
  const [savedMsg, setSavedMsg] = useStateAd('');
  const [jbMsg, setJbMsg] = useStateAd('');
  const [jbBusy, setJbBusy] = useStateAd(false);
  useEffectAd(() => {
    if (window.lucide) window.lucide.createIcons();
  });
  const flash = m => {
    setSavedMsg(m);
    setTimeout(() => setSavedMsg(''), 2200);
  };
  const flashJb = m => {
    setJbMsg(m);
    setTimeout(() => setJbMsg(''), 3500);
  };
  const savePass = () => {
    if (np.trim()) {
      LSL.setPass(np.trim());
      setNp('');
      flash('Passcode updated.');
    }
  };
  const saveW3 = () => {
    LSL.setWeb3Key(w3.trim());
    flash('Web3Forms key saved.');
  };
  const setupCloud = async () => {
    if (!jbKey.trim()) {
      flashJb('Enter your JSONbin master key first.');
      return;
    }
    setJbBusy(true);
    LSL.setJBKey(jbKey.trim());
    let binId = jbBin.trim();
    if (!binId) {
      binId = await LSL.createBin();
      if (!binId) {
        flashJb('Could not create bin — check your master key.');
        setJbBusy(false);
        return;
      }
      setJbBin(binId);
    } else {
      LSL.setJBBin(binId);
      const ok = await LSL.syncFromCloud();
      if (!ok) {
        flashJb('Could not reach that bin — check the Bin ID.');
        setJbBusy(false);
        return;
      }
    }
    force();
    flashJb('✓ Cloud sync active! Availability now syncs across all devices.');
    setJbBusy(false);
  };
  const syncNow = async () => {
    setJbBusy(true);
    const ok = await LSL.syncFromCloud();
    flashJb(ok ? '✓ Synced from cloud.' : 'Sync failed — check your connection.');
    force();
    setJbBusy(false);
  };
  const isCloudActive = !!(LSL.getJBKey() && LSL.getJBBin());
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "lsl-admin__card"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-cond)',
      textTransform: 'uppercase',
      letterSpacing: '.06em',
      fontSize: 13
    }
  }, "Cloud Sync"), isCloudActive ? /*#__PURE__*/React.createElement("span", {
    className: "lsl-pill lsl-pill--sky",
    style: {
      fontSize: 11
    }
  }, "\u25CF Active") : /*#__PURE__*/React.createElement("span", {
    className: "lsl-pill lsl-pill--outline",
    style: {
      fontSize: 11
    }
  }, "Not configured")), /*#__PURE__*/React.createElement("div", {
    className: "lsl-field",
    style: {
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("label", null, "JSONbin Master Key"), /*#__PURE__*/React.createElement("input", {
    className: "lsl-input",
    value: jbKey,
    onChange: e => setJbKey(e.target.value),
    placeholder: "$2a$10$...",
    style: {
      fontFamily: 'monospace',
      fontSize: 13
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "lsl-field",
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("label", null, "Bin ID ", isCloudActive && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--fg3)',
      fontWeight: 400
    }
  }, "\u2014 copy this to other devices")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "lsl-input",
    value: jbBin,
    onChange: e => setJbBin(e.target.value),
    placeholder: isCloudActive ? '' : 'Leave empty to create new, or paste existing',
    style: {
      fontFamily: 'monospace',
      fontSize: 13
    }
  }), jbBin && /*#__PURE__*/React.createElement("button", {
    className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
    onClick: () => {
      navigator.clipboard.writeText(jbBin);
      flashJb('Copied!');
    }
  }, "Copy"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "lsl-btn lsl-btn--primary lsl-btn--sm",
    onClick: setupCloud,
    disabled: jbBusy
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": jbBusy ? 'loader' : 'cloud'
  }), jbBusy ? 'Working…' : isCloudActive ? 'Save & Reconnect' : 'Set Up Cloud Sync'), isCloudActive && /*#__PURE__*/React.createElement("button", {
    className: "lsl-btn lsl-btn--ghost lsl-btn--sm",
    onClick: syncNow,
    disabled: jbBusy
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "refresh-cw"
  }), " Sync Now")), jbMsg && /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 10,
      marginBottom: 0,
      fontSize: 14,
      color: jbMsg.startsWith('✓') || jbMsg === 'Copied!' ? 'var(--success)' : 'var(--error, #c0392b)'
    }
  }, jbMsg), /*#__PURE__*/React.createElement("p", {
    className: "lsl-body lsl-body--sm",
    style: {
      marginTop: 10,
      marginBottom: 0,
      color: 'var(--fg3)'
    }
  }, isCloudActive ? 'Availability and bookings sync across all devices automatically. On a new device, enter the same master key and Bin ID above.' : 'Enter your JSONbin master key and click "Set Up Cloud Sync." On other devices, enter the same key plus the Bin ID shown after setup.')), /*#__PURE__*/React.createElement("div", {
    className: "lsl-admin__card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-field",
    style: {
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("label", null, "Web3Forms Access Key"), /*#__PURE__*/React.createElement("input", {
    className: "lsl-input",
    value: w3,
    onChange: e => setW3(e.target.value),
    placeholder: "paste your web3forms access key"
  })), /*#__PURE__*/React.createElement("p", {
    className: "lsl-body lsl-body--sm",
    style: {
      marginTop: 0,
      color: 'var(--fg3)'
    }
  }, "Get a free key at web3forms.com. With it set, every booking emails you the full player & parent details before the family is sent to Stripe."), /*#__PURE__*/React.createElement("button", {
    className: "lsl-btn lsl-btn--primary lsl-btn--sm",
    onClick: saveW3
  }, "Save key")), /*#__PURE__*/React.createElement("div", {
    className: "lsl-admin__card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-field",
    style: {
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("label", null, "Change passcode"), /*#__PURE__*/React.createElement("input", {
    className: "lsl-input",
    value: np,
    onChange: e => setNp(e.target.value),
    placeholder: "New passcode"
  })), /*#__PURE__*/React.createElement("button", {
    className: "lsl-btn lsl-btn--primary lsl-btn--sm",
    onClick: savePass
  }, "Save passcode")), savedMsg && /*#__PURE__*/React.createElement("p", {
    className: "lsl-err",
    style: {
      color: 'var(--success)'
    }
  }, savedMsg));
}
Object.assign(window, {
  CoachAdminPage
});
