function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
/* global React */
var _React = React,
  useStateG = _React.useState;

/* All program photos, in the same order as the live site gallery.
   Photos by Eleni With A Camera. The live gallery is an uncaptioned grid. */
var SHOTS = ['uploads/IMG_2979.JPG', 'uploads/S4A6259-scaled.jpg', 'uploads/IMG_7642_Original.jpg', 'uploads/IMG_2972.jpeg', 'uploads/IMG_2975.JPG', 'uploads/IMG_2980.JPG', 'uploads/S4A6504-scaled.jpg', 'uploads/IMG_2983.JPG', 'uploads/IMG_2966.jpg', 'uploads/IMG_2981.JPG', 'uploads/giowebpic-1.jpg', 'uploads/Coach_Paganis-e1768944691510.jpg', 'uploads/giowebpic-4.jpg', 'uploads/giowebpic-2-scaled.jpg', 'uploads/S4A6561-scaled.jpg', 'uploads/mundeleinvshp-30.jpg', 'uploads/IMG_2974.JPG', 'uploads/IMG_2989.JPG', 'uploads/S4A6498-scaled.jpg', 'uploads/IMG_2971.jpeg', 'uploads/IMG_2978.JPG', 'uploads/IMG_2986.jpg', 'uploads/IMG_2982.JPG', 'uploads/IMG_2970.JPG', 'uploads/giowebpic.jpg', 'uploads/IMG_2977.JPG', 'uploads/giowebpic-3-scaled.jpg', 'uploads/IMG_2985.JPG', 'uploads/IMG_2984.JPG', 'uploads/S4A6326-scaled.jpg', 'uploads/IMG_2969.jpg'];
function Gallery() {
  var _useStateG = useStateG(null),
    _useStateG2 = _slicedToArray(_useStateG, 2),
    box = _useStateG2[0],
    setBox = _useStateG2[1];
  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [box]);
  return /*#__PURE__*/React.createElement("section", {
    className: "lsl-section lsl-section--cream"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lsl-gallery"
  }, SHOTS.map((src, i) => /*#__PURE__*/React.createElement("div", {
    className: "lsl-gallery__item",
    key: src + i,
    onClick: () => setBox(src)
  }, /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: "LakeShore Legends basketball",
    loading: "lazy"
  }))))), box && /*#__PURE__*/React.createElement("div", {
    className: "lsl-lightbox",
    onClick: () => setBox(null)
  }, /*#__PURE__*/React.createElement("button", {
    className: "lsl-lightbox__close",
    "aria-label": "Close"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "x"
  })), /*#__PURE__*/React.createElement("img", {
    src: box,
    alt: "",
    onClick: e => e.stopPropagation()
  })));
}
Object.assign(window, {
  Gallery
});
