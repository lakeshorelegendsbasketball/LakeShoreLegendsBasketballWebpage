function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
/* global React */
/* LakeShore Legends — private-lesson booking store.
   Data persists in localStorage (browser-local). Real multi-device booking,
   email, and calendar sync require a backend handoff. Exposes window.LSL. */
(function () {
  var SEEDV = '3';
  var K = {
    types: 'lsl_lessonTypes',
    locs: 'lsl_locations',
    slots: 'lsl_slots',
    books: 'lsl_bookings',
    pass: 'lsl_adminPass',
    web3: 'lsl_web3key',
    ver: 'lsl_seedv'
  };
  var LS = {
    get(k, def) {
      try {
        var v = localStorage.getItem(k);
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
  var uid = () => Math.random().toString(36).slice(2, 9);
  var DEFAULT_TYPES = [{
    id: 'p1',
    name: '60 Minute Private Training',
    size: '1-on-1',
    group: false,
    duration: 60,
    price: null,
    payLink: 'https://buy.stripe.com/fZu4gzeKn4f5c9ndiG9Zm02'
  }, {
    id: 'p2',
    name: '60 Minute 2-on-1 Training',
    size: '2-on-1',
    group: true,
    duration: 60,
    price: null,
    payLink: 'https://buy.stripe.com/14AfZh45J12Tddr5Qe9Zm03'
  }, {
    id: 'p3',
    name: '60 Minute 3-on-1 Training',
    size: '3-on-1',
    group: true,
    duration: 60,
    price: null,
    payLink: 'https://buy.stripe.com/9B6fZh9q312Ta1f2E29Zm04'
  }, {
    id: 'p4',
    name: '60 Minute 4+ Player Training',
    size: '4+ players',
    group: true,
    duration: 60,
    price: null,
    payLink: 'https://buy.stripe.com/4gM3cv6dR26Xa1fa6u9Zm05'
  }];
  var DEFAULT_LOCS = [{
    id: 'pr',
    name: 'Park Ridge, IL',
    city: ''
  }, {
    id: 'mun',
    name: 'Mundelein, IL',
    city: ''
  }];
  function sampleSlots() {
    var out = [];
    var now = new Date();
    var plan = [[2, '16:00', 'pr'], [2, '17:00', 'pr'], [4, '15:30', 'mun'], [5, '16:30', 'pr'], [7, '10:00', 'mun'], [9, '17:30', 'pr']];
    for (var _ref3 of plan) {
      var _ref2 = _slicedToArray(_ref3, 3);
      var d = _ref2[0];
      var t = _ref2[1];
      var loc = _ref2[2];
      var dt = new Date(now);
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
    var fresh = LS.get(K.ver) !== SEEDV;
    // Lesson types & locations are reset on version bump so real Stripe links land.
    if (fresh || !LS.get(K.types)) LS.set(K.types, DEFAULT_TYPES);
    if (fresh || !LS.get(K.locs)) LS.set(K.locs, DEFAULT_LOCS);
    if (!LS.get(K.slots)) LS.set(K.slots, sampleSlots());
    if (!LS.get(K.books)) LS.set(K.books, []);
    if (!LS.get(K.pass)) LS.set(K.pass, 'legends');
    if (!LS.get(K.web3)) LS.set(K.web3, '');
    LS.set(K.ver, SEEDV);
  }
  seed();
  var fmtDate = iso => {
    var _iso$split$map = iso.split('-').map(Number),
      _iso$split$map2 = _slicedToArray(_iso$split$map, 3),
      y = _iso$split$map2[0],
      m = _iso$split$map2[1],
      d = _iso$split$map2[2];
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };
  var fmtDateLong = iso => {
    var _iso$split$map3 = iso.split('-').map(Number),
      _iso$split$map4 = _slicedToArray(_iso$split$map3, 3),
      y = _iso$split$map4[0],
      m = _iso$split$map4[1],
      d = _iso$split$map4[2];
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };
  var fmtTime = t => {
    var _t$split$map = t.split(':').map(Number),
      _t$split$map2 = _slicedToArray(_t$split$map, 2),
      h = _t$split$map2[0],
      mn = _t$split$map2[1];
    var ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + String(mn).padStart(2, '0') + ' ' + ap;
  };
  var priceLabel = ty => ty && ty.price != null && ty.price !== '' ? '$' + ty.price + (ty.unit || '') : '';
  function endTime(t, mins) {
    var _t$split$map3 = t.split(':').map(Number),
      _t$split$map4 = _slicedToArray(_t$split$map3, 2),
      h = _t$split$map4[0],
      mn = _t$split$map4[1];
    var tot = h * 60 + mn + mins;
    return String(Math.floor(tot / 60) % 24).padStart(2, '0') + ':' + String(tot % 60).padStart(2, '0');
  }
  function makeICS(bk) {
    var ty = LSL.typeById(bk.typeId);
    var loc = LSL.locById(bk.locId);
    var dur = ty.duration || 60;
    var dstart = bk.date.replace(/-/g, '') + 'T' + bk.time.replace(':', '') + '00';
    var dend = bk.date.replace(/-/g, '') + 'T' + endTime(bk.time, dur).replace(':', '') + '00';
    var stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//LakeShore Legends//Booking//EN', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', 'UID:' + bk.id + '@lakeshorelegends', 'DTSTAMP:' + stamp, 'DTSTART:' + dstart, 'DTEND:' + dend, 'SUMMARY:' + (ty.name || 'Private Lesson') + ' — LakeShore Legends', 'LOCATION:' + (loc.name || ''), 'DESCRIPTION:Athlete: ' + (bk.athlete || '') + ' with Coach Gio Paganis.', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  }
  function downloadICS(bk) {
    var blob = new Blob([makeICS(bk)], {
      type: 'text/calendar'
    });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'lakeshore-lesson.ics';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
  var LSL = {
    uid,
    getTypes: () => LS.get(K.types, []),
    setTypes: v => LS.set(K.types, v),
    getLocs: () => LS.get(K.locs, []),
    setLocs: v => LS.set(K.locs, v),
    getSlots: () => LS.get(K.slots, []),
    setSlots: v => LS.set(K.slots, v),
    getBooks: () => LS.get(K.books, []),
    setBooks: v => LS.set(K.books, v),
    getPass: () => LS.get(K.pass, 'legends'),
    setPass: v => LS.set(K.pass, v),
    getWeb3Key: () => LS.get(K.web3, ''),
    setWeb3Key: v => LS.set(K.web3, v),
    locById: id => LSL.getLocs().find(l => l.id === id) || {},
    typeById: id => LSL.getTypes().find(t => t.id === id) || {},
    fmtDate,
    fmtDateLong,
    fmtTime,
    priceLabel,
    makeICS,
    downloadICS
  };
  window.LSL = LSL;
})();
