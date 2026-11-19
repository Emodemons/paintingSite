Your index page now builds its paintings from a list in JavaScript and uses WebP images. The two paintings dropped from about **17 MB to about 290 KB** on a normal screen, or about 730 KB on a sharp (retina) screen. The script has no syntax errors, but I haven't opened the page in a browser, so please open `index.html` and check it looks the same as before.

## Files I changed

**Created:**
1. `convert-painting.sh` (in `paintingSite-main/`, outside the website folder) — converts a painting to WebP in 2 sizes
2. `Website/paintings.js` — the list of paintings, and the code that builds the gallery from it
3. `Website/pictures/paintings/patapouf-800.webp` (167 KB)
4. `Website/pictures/paintings/patapouf-1600.webp` (428 KB)
5. `Website/pictures/paintings/right-wrong-800.webp` (123 KB)
6. `Website/pictures/paintings/right-wrong-1600.webp` (301 KB)

**Modified:**
7. `Website/index.html` — replaced the two hand-written painting blocks with one empty `<div id="gallery">`, and added `<script src="paintings.js">`
8. `Website/main.css` — added a `.painting` style that keeps the 500px width the images had before

I didn't delete or change your original PNGs, `floaters.js`, `bio.html` or `video.html`.

## Adding a painting later

1. In Terminal, from the `paintingSite-main` folder, run:
   ```
   ./convert-painting.sh "path/to/new-painting.png" new-painting
   ```
2. It prints a line like `{ file: "new-painting", title: "new-painting", width: ..., height: ... },`. Paste it into the list at the top of [paintings.js](paintings.js#L10-L13) and change the `title` to the real name.

The gallery keeps alternating left and right automatically. Only the first painting loads straight away; the others load as the visitor scrolls down.

## Still open

- **Two floaters still don't show** (`IMG_0364` and `IMG_1355` in `floaters.js`). Tell me whether to convert them or remove them.
- Once you've checked the page looks right, you can move the old painting PNGs out of `Website/`: `Patapouf.png`, `right wrong.png`, `gyno.png`, `couches.png` and `right?.png`. The site no longer uses them. Keep them somewhere else as your originals.


____________________________________

**Where new paintings go:** put your full-quality original anywhere *outside* `Website/`. I'd make a folder called `originals` next to it:

```
paintingSite-main/
├── originals/              ← you put new paintings here (any size, PNG or JPG)
├── convert-painting.sh
└── Website/
    └── pictures/
        └── paintings/      ← the script creates the WebP files here (don't edit by hand)
```

Then run the script and paste the line it prints into `paintings.js`:
```
./convert-painting.sh "originals/my-painting.png" my-painting
```
The website folder only ever gets the small WebP files.

**What to delete from `Website/pictures/`:**

| File / folder | What to do |
|---|---|
| `Patapouf.png` | Move to `originals/` (it's your full-quality copy) |
| `right wrong.png` | Move to `originals/` |
| `gyno.png`, `couches.png`, `right?.png` | Move to `originals/`. The site doesn't use them now, but they look like paintings you may want to add later. |
| `organic_cutouts_pngs/` | Delete, or move to `originals/` if you want to keep a copy |
| **`emma website-2.png`** | **Keep. It's your logo**, used on all 3 pages |
| **`organic_cutouts_web/`** | **Keep.** These are the floaters |
| **`paintings/`** | **Keep.** These are the new WebP paintings |

Your `Website/` folder would go from 63 MB to about 2 MB.

I'd **move** rather than delete because those PNGs are your only full-quality copies, and the script needs them if you ever want to re-convert a painting at a different size.

Want me to create the `originals/` folder and move the files for you? Separately, should I still remove the 2 broken floater lines from `floaters.js`?

**Files modified this time: none.**