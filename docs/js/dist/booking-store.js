/* global React */
/* LakeShore Legends — booking store.
   Reads/writes localStorage for instant sync and pushes to JSONbin
   so all devices (coach admin, coach mobile, client browsers) share
   the same availability data. Exposes window.LSL. */
(function () {
  const SEEDV = '6';
  const K = {
    types: 'lsl_lessonTypes',
    locs: 'lsl_locations',
    slots: 'lsl_slots',
    books: 'lsl_bookings',
    pass: 'lsl_adminPass',
    web3: 'lsl_web3key',
    ver: 'lsl_seedv',
    jbKey: 'lsl_jb_key',
    jbBin: 'lsl_jb_bin'
  };
  const LS = {
    get(k, def) {
      try {
        const v = localStorage.getItem(k);
        return v ? JSON.parse(v) : def;
      } catch (e) {
        return def;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem(k, JSON.stringify(v));
      } catch (e) {}
    }
  };
  const uid = () => Math.random().toString(36).slice(2, 9);
  const DEFAULT_TYPES = [{
    id: 'p1',
    name: '60 Minute Private Training',
    size: '1-on-1',
    group: false,
    duration: 60,
    price: null,
    payLink: 'https://buy.stripe.com/00w9AM0rxcFigGc4M10Jq01'
  }, {
    id: 'p2',
    name: '60 Minute 2-on-1 Training',
    size: '2-on-1',
    group: true,
    duration: 60,
    price: null,
    payLink: 'https://buy.stripe.com/28E9AMcaf48Mdu03HX0Jq00'
  }, {
    id: 'p3',
    name: '60 Minute 3-on-1 Training',
    size: '3-on-1',
    group: true,
    duration: 60,
    price: null,
    payLink: 'https://buy.stripe.com/8x2dR20rx9t64XuguJ0Jq02'
  }, {
    id: 'p4',
    name: '60 Minute 4+ Player Training',
    size: '4+ players',
    group: true,
    duration: 60,
    price: null,
    payLink: 'https://buy.stripe.com/14AcMYdejaxa89GemB0Jq03'
  }];
  const DEFAULT_LOCS = [{
    id: 'pr',
    name: 'Park Ridge, IL',
    city: ''
  }, {
    id: 'mun',
    name: 'Mundelein, IL',
    city: ''
  }];
  function sampleSlots() {
    const out = [];
    const now = new Date();
    const plan = [[2, '16:00', 'pr'], [2, '17:00', 'pr'], [4, '15:30', 'mun'], [5, '16:30', 'pr'], [7, '10:00', 'mun'], [9, '17:30', 'pr']];
    for (const [d, t, loc] of plan) {
      const dt = new Date(now);
      dt.setDate(now.getDate() + d);
      out.push({
        id: uid(),
        date: dt.toISOString().slice(0, 10),
        time: t,
        locId: loc,
        status: 'open'
      });
    }
    return out;
  }
  function seed() {
    const fresh = LS.get(K.ver) !== SEEDV;
    if (fresh || !LS.get(K.types)) LS.set(K.types, DEFAULT_TYPES);
    if (fresh || !LS.get(K.locs)) LS.set(K.locs, DEFAULT_LOCS);
    if (!LS.get(K.slots)) LS.set(K.slots, sampleSlots());
    if (!LS.get(K.books)) LS.set(K.books, []);
    if (!LS.get(K.pass)) LS.set(K.pass, 'legends');
    if (!LS.get(K.web3)) LS.set(K.web3, '');
    LS.set(K.ver, SEEDV);
  }
  seed();

  /* ---- JSONbin cloud sync ---- */
  const JB_BASE = 'https://api.jsonbin.io/v3';
  const JB_KEY_DEFAULT = '$2a$10$RyTLgQsFbQELsa2bB62F4efI1Hdy7A1mY6P5U4qM5Qg0lV1CEQHyC';
  const JB_BIN_DEFAULT = '6a2799d5da38895dfe9dfaa8';
  function getJBKey() {
    return LS.get(K.jbKey, '') || JB_KEY_DEFAULT;
  }
  function getJBBin() {
    return LS.get(K.jbBin, '') || JB_BIN_DEFAULT;
  }
  async function jbFetch(method, path, body) {
    const key = getJBKey();
    if (!key) return null;
    try {
      const res = await fetch(JB_BASE + path, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': key
        },
        ...(body !== undefined ? {
          body: JSON.stringify(body)
        } : {})
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  }
  function cloudSnapshot() {
    return {
      slots: LS.get(K.slots, []),
      types: LS.get(K.types, []),
      locs: LS.get(K.locs, []),
      books: LS.get(K.books, []),
      pass: LS.get(K.pass, 'legends'),
      web3Key: LS.get(K.web3, '')
    };
  }
  async function createBin() {
    const data = await jbFetch('POST', '/b', cloudSnapshot());
    if (data && data.metadata && data.metadata.id) {
      LS.set(K.jbBin, data.metadata.id);
      return data.metadata.id;
    }
    return null;
  }
  async function syncFromCloud() {
    const binId = getJBBin();
    if (!binId) return false;
    const data = await jbFetch('GET', '/b/' + binId + '/latest');
    if (!data || !data.record) return false;
    const r = data.record;
    if (Array.isArray(r.slots)) LS.set(K.slots, r.slots);
    if (Array.isArray(r.types)) LS.set(K.types, r.types);
    if (Array.isArray(r.locs)) LS.set(K.locs, r.locs);
    if (Array.isArray(r.books)) LS.set(K.books, r.books);
    if (r.pass) LS.set(K.pass, r.pass);
    if (r.web3Key !== undefined) LS.set(K.web3, r.web3Key);
    window.dispatchEvent(new CustomEvent('lsl-synced'));
    return true;
  }
  let pushTimer = null;
  function pushToCloud() {
    clearTimeout(pushTimer);
    pushTimer = setTimeout(async () => {
      const binId = getJBBin();
      if (!binId) return;
      await jbFetch('PUT', '/b/' + binId, cloudSnapshot());
    }, 800);
  }

  /* ---- formatters ---- */
  const fmtDate = iso => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };
  const fmtDateLong = iso => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };
  const fmtTime = t => {
    let [h, mn] = t.split(':').map(Number);
    const ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + String(mn).padStart(2, '0') + ' ' + ap;
  };
  const priceLabel = ty => ty && ty.price != null && ty.price !== '' ? '$' + ty.price + (ty.unit || '') : '';
  function endTime(t, mins) {
    let [h, mn] = t.split(':').map(Number);
    const tot = h * 60 + mn + mins;
    return String(Math.floor(tot / 60) % 24).padStart(2, '0') + ':' + String(tot % 60).padStart(2, '0');
  }
  function makeICS(bk) {
    const ty = LSL.typeById(bk.typeId);
    const loc = LSL.locById(bk.locId);
    const dur = ty.duration || 60;
    const dstart = bk.date.replace(/-/g, '') + 'T' + bk.time.replace(':', '') + '00';
    const dend = bk.date.replace(/-/g, '') + 'T' + endTime(bk.time, dur).replace(':', '') + '00';
    const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//LakeShore Legends//Booking//EN', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', 'UID:' + bk.id + '@lakeshorelegends', 'DTSTAMP:' + stamp, 'DTSTART:' + dstart, 'DTEND:' + dend, 'SUMMARY:' + (ty.name || 'Private Lesson') + ' — LakeShore Legends', 'LOCATION:' + (loc.name || ''), 'DESCRIPTION:Athlete: ' + (bk.athlete || '') + ' with Coach Gio Paganis.', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  }
  function downloadICS(bk) {
    const blob = new Blob([makeICS(bk)], {
      type: 'text/calendar'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lakeshore-lesson.ics';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
  const LSL = {
    uid,
    getTypes: () => LS.get(K.types, []),
    setTypes: v => {
      LS.set(K.types, v);
      pushToCloud();
    },
    getLocs: () => LS.get(K.locs, []),
    setLocs: v => {
      LS.set(K.locs, v);
      pushToCloud();
    },
    getSlots: () => LS.get(K.slots, []),
    setSlots: v => {
      LS.set(K.slots, v);
      pushToCloud();
    },
    getBooks: () => LS.get(K.books, []),
    setBooks: v => {
      LS.set(K.books, v);
      pushToCloud();
    },
    getPass: () => LS.get(K.pass, 'legends'),
    setPass: v => {
      LS.set(K.pass, v);
      pushToCloud();
    },
    getWeb3Key: () => LS.get(K.web3, ''),
    setWeb3Key: v => {
      LS.set(K.web3, v);
      pushToCloud();
    },
    getJBKey: () => LS.get(K.jbKey, ''),
    setJBKey: v => LS.set(K.jbKey, v),
    getJBBin: () => LS.get(K.jbBin, ''),
    setJBBin: v => LS.set(K.jbBin, v),
    locById: id => LSL.getLocs().find(l => l.id === id) || {},
    typeById: id => LSL.getTypes().find(t => t.id === id) || {},
    createBin,
    syncFromCloud,
    pushToCloud,
    fmtDate,
    fmtDateLong,
    fmtTime,
    priceLabel,
    makeICS,
    downloadICS
  };
  window.LSL = LSL;

  /* Auto-sync on every page load once cloud is configured */
  syncFromCloud().then(() => {
    const today = new Date().toISOString().slice(0, 10);
    const slots = LS.get(K.slots, []);
    const cleaned = slots.filter(s => s.status !== 'open' || s.date >= today);
    if (cleaned.length < slots.length) {
      LS.set(K.slots, cleaned);
      pushToCloud();
      window.dispatchEvent(new CustomEvent('lsl-synced'));
    }
  });
})();
