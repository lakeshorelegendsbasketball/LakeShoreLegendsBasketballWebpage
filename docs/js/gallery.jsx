/* global React */
const { useState: useStateG } = React;

/* All program photos, in the same order as the live site gallery.
   Photos by Eleni With A Camera. The live gallery is an uncaptioned grid. */
const SHOTS = [
  'uploads/IMG_2979.JPG',
  'uploads/S4A6259-scaled.jpg',
  'uploads/IMG_7642_Original.jpg',
  'uploads/IMG_2972.jpeg',
  'uploads/IMG_2975.JPG',
  'uploads/IMG_2980.JPG',
  'uploads/S4A6504-scaled.jpg',
  'uploads/IMG_2983.JPG',
  'uploads/IMG_2966.jpg',
  'uploads/IMG_2981.JPG',
  'uploads/giowebpic-1.jpg',
  'uploads/Coach_Paganis-e1768944691510.jpg',
  'uploads/S4A6561-scaled.jpg',
  'uploads/mundeleinvshp-30.jpg',
  'uploads/IMG_2974.JPG',
  'uploads/IMG_2989.JPG',
  'uploads/S4A6498-scaled.jpg',
  'uploads/IMG_2971.jpeg',
  'uploads/IMG_2986.jpg',
  'uploads/IMG_2982.JPG',
  'uploads/IMG_2970.JPG',
  'uploads/giowebpic.jpg',
  'uploads/giowebpic-3-scaled.jpg',
  'uploads/IMG_2985.JPG',
  'uploads/IMG_2984.JPG',
  'uploads/S4A6326-scaled.jpg',
  'uploads/IMG_2969.jpg',
  'uploads/gio-group-cafeteria.jpg',
];

function Gallery() {
  const [box, setBox] = useStateG(null);
  React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); }, [box]);
  return (
    <section className="lsl-section lsl-section--cream">
      <div className="lsl-wrap">
        <div className="lsl-gallery">
          {SHOTS.map((src, i) => (
            <div className="lsl-gallery__item" key={src + i} onClick={() => setBox(src)}>
              <img src={src} alt="LakeShore Legends basketball" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
      {box && (
        <div className="lsl-lightbox" onClick={() => setBox(null)}>
          <button className="lsl-lightbox__close" aria-label="Close"><i data-lucide="x"></i></button>
          <img src={box} alt="" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </section>
  );
}

Object.assign(window, { Gallery });
