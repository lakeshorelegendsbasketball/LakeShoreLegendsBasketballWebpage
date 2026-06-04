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
function AvailTab({
  force
}) {
  const locs = LSL.getLocs();
  const [date, setDate] = useStateAd('');
  const [time, setTime] = useStateAd('');
  const [locId, setLocId] = useStateAd(locs[0] ? locs[0].id : '');
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
  const slots = LSL.getSlots().slice().sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "lsl-body lsl-body--sm",
    style: {
      marginTop: 0,
      color: 'var(--fg3)'
    }
  }, "Add openings as they come up. Booked times drop off the public list automatically."), /*#__PURE__*/React.createElement("div", {
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
    className: "lsl-admin__list"
  }, slots.length === 0 && /*#__PURE__*/React.createElement("p", {
    className: "lsl-body lsl-body--sm",
    style: {
      color: 'var(--fg3)'
    }
  }, "No openings yet. Add your first above."), slots.map(s => {
    const l = LSL.locById(s.locId);
    return /*#__PURE__*/React.createElement("div", {
      className: "lsl-admin__item",
      key: s.id
    }, /*#__PURE__*/React.createElement("div", {
      className: "lsl-admin__itemmain"
    }, /*#__PURE__*/React.createElement("strong", null, LSL.fmtDate(s.date)), " \xB7 ", LSL.fmtTime(s.time), " \xB7 ", l.name), /*#__PURE__*/React.createElement("span", {
      className: 'lsl-pill ' + (s.status === 'booked' ? 'lsl-pill--orange' : 'lsl-pill--outline')
    }, s.status === 'booked' ? 'Booked' : 'Open'), /*#__PURE__*/React.createElement("button", {
      className: "lsl-admin__del",
      onClick: () => del(s.id),
      "aria-label": "Delete"
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "trash-2"
    })));
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
    }, req ? /*#__PURE__*/React.createElement(React.Fragment, null, bk.serviceName, " \xB7 ", bk.players, " players") : /*#__PURE__*/React.createElement(React.Fragment, null, bk.serviceName || t.name, " \xB7 ", l.name), /*#__PURE__*/React.createElement("br", null), "Parent: ", bk.parent, " \xB7 ", bk.email, bk.phone ? ' · ' + bk.phone : '', /*#__PURE__*/React.createElement("br", null), bk.age ? 'Age/Grade: ' + bk.age + ' · ' : '', bk.focus ? 'Focus: ' + bk.focus : '', bk.notes ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("br", null), "Notes: ", bk.notes) : null), /*#__PURE__*/React.createElement("div", {
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
  const [savedMsg, setSavedMsg] = useStateAd('');
  useEffectAd(() => {
    if (window.lucide) window.lucide.createIcons();
  });
  const flash = m => {
    setSavedMsg(m);
    setTimeout(() => setSavedMsg(''), 2200);
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
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
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
  }, savedMsg), /*#__PURE__*/React.createElement("div", {
    className: "lsl-bknote",
    style: {
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "info"
  }), /*#__PURE__*/React.createElement("span", null, "Availability, bookings, and settings save to ", /*#__PURE__*/React.createElement("strong", null, "this browser only"), ". For live multi-device booking and automatic calendar sync, this connects to a backend in a developer handoff.")));
}
Object.assign(window, {
  CoachAdminPage
});
