//gallery of paintings on the index page
//
//to add a painting:
//  1. run ./convert-painting.sh "path/to/original.png" short-name
//  2. paste the line it prints into the list below (in the order you want)
//
//file   = short name used by convert-painting.sh (no size, no .webp)
//title  = text used as the image description (alt text)
//width / height = size of the original, keeps the page from jumping while loading
//description = optional text shown beside this painting
const PAINTINGS = [
  { file: "patapouf",    title: "Patapouf",    width: 2405, height: 3152, description: "'Patapouf' (2026), acrylic & oil on canvas, 140 x 185cm" },
  { file: "right-wrong", title: "Right wrong", width: 2166, height: 2616, description: "'You're Right I'm Wrong, Im Right You're Wrong' (2026), acrylic & oil on canvas, 140 x 180 cm" },
  { file: "right2", title: "Wrong right", width: 1995, height: 2355, description: "'I'm Right, You're Wrong' (2026), acrylic & oil on canvas, 90 x 105 cm" },
  { file: "sticker", title: "sticker", width: 2458, height: 2031, description: "'Sticker #1' (2026), acrylic on canvas, 95 x 80 cm" },
  { file: "tigers", title: "tigers", width: 2256, height: 1802, description: "'Stickers #2' (2026), acrylic & oil on canvas, 100 x 80 cm" },
  { file: "swirls", title: "swirls", width: 2390, height: 1669, description: "'Small Twirls' (2026), acrylic & oil on canvas, 70 x 50 cm" },
  { file: "gyno", title: "gyno", width: 1516, height: 2237, description: "'Why did it remind me of all those -' (2025), acrylic & oil on canvas, 140 x 210 cm" },
  { file: "snake", title: "snake", width: 2452, height: 3264, description: "'Sleep by the lake in July, read your coffee grounds in August' (2026), oil on canvas, 90 x 120 cm" },
  { file: "pattern", title: "pattern", width: 2159, height: 2159, description: "'Wall-paper play' (2025), oil on canvas, 80 x 80 cm" },
  { file: "girl", title: "girl", width: 2080, height: 2514, description: "'Come to my pool' (2026), oil on canvas, 140 x 170 cm" },
  { file: "edo", title: "edo", width: 4051, height: 4807, description: "'Bring forth, sleep safe' (2026), acrylic & oil on canvas, 160 x 190 cm" },
  { file: "red", title: "red", width: 2221, height: 2905, description: "'Les Terres Rouges derrière la maison' (2026), acrylic & oil on canvas, 140 x 185 cm" },
  { file: "couches", title: "couches", width: 2380, height: 1170, description: "'Couches' (2026), oil on canvas, 100 x 50 cm" },
  { file: "youmake", title: "youmake", width: 1936, height: 2844, description: "I like how you feel' (2026) oil on canvas, 110 x 160 cm" },
  { file: "nape", title: "nape", width: 1893, height: 2650, description: "'Tablecloths' (2026), oil & acrylics on canvas, 110 x 170 cm"},
  
];

(function () {
  const gallery = document.getElementById("gallery");
  if (!gallery) return;

  PAINTINGS.forEach(function (p, i) {
    const base = "pictures/paintings/" + p.file;

    const row = document.createElement("div");
    row.className = "row painting-row";

    //alternate left / right like before
    const col = document.createElement("div");
    col.className = "col-md-12 painting-item " + (i % 2 === 0 ? "painting-even" : "painting-odd");

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

    if (p.description) {
      const caption = document.createElement("div");
      caption.className = "painting-caption";
      caption.textContent = p.description;

      if (i % 2 === 0) {
        col.appendChild(wrap);
        col.appendChild(caption);
      } else {
        col.appendChild(caption);
        col.appendChild(wrap);
      }
    } else {
      col.appendChild(wrap);
      col.classList.add("painting-image-only");
    }

    row.appendChild(col);
    gallery.appendChild(row);
  });
})();

//gallery 2

const PAINTINGS2 = [
   { file: "fromage", title: "fromage", width: 1832, height: 2303, description: "'Passes moi le Fromage' (2025), oil on canvas, 100 x 120 cm" },
   { file: "oui", title: "oui", width: 4032, height: 3024, description: "'La Maison du Oui' (2025), oil on canvas, 110 x 90 cm" },
   { file: "mirage", title: "mirage", width: 2473, height: 2081, description: "'Late night contemplations' (2025), oil on canvas, 100 x 90 cm" },
   { file: "sick", title: "sick", width: 2821, height: 1892, description: "'I get sick of it' (2025), oil on canvas, 170 x 110 cm" },
   { file: "maybe", title: "maybe", width: 3099, height: 2717, description: "'Maybe Lifetimes Came Down to This' (2024), oil on canvas, 90 x 70 cm" },
   { file: "love", title: "love", width: 2221, height: 2585, description: "'Venus in Leo' (2024), oil on canvas, 100 x 115 cm" },
   { file: "maybe2", title: "maybe2", width: 2277, height: 2827, description: "'Taking and giving gracefully #2' (2024), embroidery and oil on canvas, 43 x 52 cm" },
   { file: "dance", title: "dance", width: 2357, height: 3194, description: "'Taking and giving gracefully #1' (2024), embroidery and oil on canvas, 57 x 76 cm" },
   { file: "puss", title: "puss", width: 2824, height: 3721, description: "'Beautiful people are strong and soft' (2024), oil on canvas, 90 x 120 cm" },
   { file: "gene", title: "gene", width: 1947, height: 2618, description: "'I wish I did not have any genetelia' (2024), embroidery on canvas, 30 x 40 cm" },
   { file: "under", title: "under", width: 2602, height: 3381, description: "'Different contexts' (2024), oil on canvas, 100 x 120 cm" },
   { file: "egg", title: "egg", width: 2527, height: 3115, description: "'Sometimes straight men flirt with me, but I'm not even sure whether I'm a woman' (2024), oil on canvas, 100 x 120 cm" },
   { file: "egg2", title: "egg2", width: 3272, height: 2488, description: "'Grab the sparkling water from under the stairs' (2024), oil on canvas, 85 x 60 cm" },
   { file: "look", title: "look", width: 2333, height: 2902, description: "'Get your badge of honour' (2024), oil on canvas, 60 x 75 cm" },
   { file: "toilet2", title: "toilet2", width: 1881, height: 2308, description: "'Fall in love with 20% off' (2024), oil on canvas, 100 x 120 cm" },
   { file: "toilet", title: "toilet", width: 1878, height: 2253, description: "'New Life' (2025), oil on canvas, 100 x 140 cm" },
   { file: "babes", title: "babes", width: 2361, height: 1795, description: "'Babes in the cubicle' (2023), acrylic on canvas, 80 x 60 cm" },
   { file: "mouth", title: "mouth", width: 2667, height: 2655, description: "'Would I let you give me an STD?' (2023), acrylic on canvas, 19,5 x 19,5 cm" },
];

(function () {
  const gallery2 = document.getElementById("gallery2");
  if (!gallery2) return;

  PAINTINGS2.forEach(function (p, i) {
    const base = "pictures/paintings/" + p.file;

    const row = document.createElement("div");
    row.className = "row painting-row";

    //alternate left / right like before
    const col = document.createElement("div");
    col.className = "col-md-12 painting-item " + (i % 2 === 0 ? "painting-even" : "painting-odd");

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

    if (p.description) {
      const caption = document.createElement("div");
      caption.className = "painting-caption";
      caption.textContent = p.description;

      if (i % 2 === 0) {
        col.appendChild(wrap);
        col.appendChild(caption);
      } else {
        col.appendChild(caption);
        col.appendChild(wrap);
      }
    } else {
      col.appendChild(wrap);
      col.classList.add("painting-image-only");
    }

    row.appendChild(col);
    gallery2.appendChild(row);
  });
})();
