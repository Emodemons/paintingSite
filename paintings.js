//gallery of paintings on the index page
//
//to add a painting:
//  1. run ./convert-painting.sh "path/to/original.png" short-name
//  2. paste the line it prints into the list below (in the order you want)
//
//file   = short name used by convert-painting.sh (no size, no .webp)
//title  = text used as the image description (alt text)
//width / height = size of the original, keeps the page from jumping while loading
const PAINTINGS = [
  { file: "patapouf",    title: "Patapouf",    width: 2405, height: 3152 },
  { file: "right-wrong", title: "Right wrong", width: 2166, height: 2616 },
  { file: "right2", title: "Wrong right", width: 2166, height: 2616 },
];

(function () {
  const gallery = document.getElementById("gallery");
  if (!gallery) return;

  PAINTINGS.forEach(function (p, i) {
    const base = "pictures/paintings/" + p.file;

    const row = document.createElement("div");
    row.className = "row";

    //alternate left / right like before
    const col = document.createElement("div");
    col.className = "col-md-12 " + (i % 2 === 0 ? "text-left" : "text-right");

    const wrap = document.createElement("div");
    wrap.className = "img";

    const img = document.createElement("img");
    img.src = base + "-800.webp";
    img.srcset = base + "-800.webp 800w, " + base + "-1600.webp 1600w";
    img.sizes = "(max-width: 540px) 100vw, 500px";
    img.width = p.width;
    img.height = p.height;
    img.alt = p.title;
    img.className = "responsive painting";
    img.decoding = "async";
    //first painting loads right away, the rest only when scrolled near
    if (i > 0) img.loading = "lazy";

    wrap.appendChild(img);
    col.appendChild(wrap);
    row.appendChild(col);
    gallery.appendChild(row);
  });
})();

//gallery 2

const PAINTINGS2 = [
  { file: "patapouf",    title: "Patapouf",    width: 2405, height: 3152 },
];

(function () {
  const gallery2 = document.getElementById("gallery2");
  if (!gallery2) return;

  PAINTINGS2.forEach(function (p, i) {
    const base = "pictures/paintings/" + p.file;

    const row = document.createElement("div");
    row.className = "row";

    //alternate left / right like before
    const col = document.createElement("div");
    col.className = "col-md-12 " + (i % 2 === 0 ? "text-left" : "text-right");

    const wrap = document.createElement("div");
    wrap.className = "img";

    const img = document.createElement("img");
    img.src = base + "-800.webp";
    img.srcset = base + "-800.webp 800w, " + base + "-1600.webp 1600w";
    img.sizes = "(max-width: 540px) 100vw, 500px";
    img.width = p.width;
    img.height = p.height;
    img.alt = p.title;
    img.className = "responsive painting";
    img.decoding = "async";
    //first painting loads right away, the rest only when scrolled near
    if (i > 0) img.loading = "lazy";

    wrap.appendChild(img);
    col.appendChild(wrap);
    row.appendChild(col);
    gallery2.appendChild(row);
  });
})();
