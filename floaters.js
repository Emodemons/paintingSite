// Slowly drifting transparent cutouts in the page background.
// They are spread over the whole page (not just the window). A longer page
// shows more of the images (a shorter page fewer), so the cutouts stay
// roughly the same size. Every image is used once before any repeats; on
// long pages an image can come back as a clearly smaller or bigger copy,
// placed well away from its twin.
// They never overlap: each one is treated as a circle that fully contains
// its visible shape (at any rotation), and a move that would bring two
// circles closer than GAP is refused and the cutout turns away instead.
(function () {
  // radius = distance from the image centre to its furthest visible pixel,
  // as a fraction of the image width (measured from the images)
  const ALL_IMAGES = [
    { src: "pictures/organic_cutouts_web/IMG_2061.webp", radius: 0.5240 },
    { src: "pictures/organic_cutouts_web/IMG_2374.webp", radius: 0.5550 },
    { src: "pictures/organic_cutouts_web/IMG_2453.webp", radius: 0.5168 },
    { src: "pictures/organic_cutouts_web/IMG_pink.webp", radius: 0.5362 },
    { src: "pictures/organic_cutouts_web/BEANS2.webp", radius: 0.6 },
    { src: "pictures/organic_cutouts_web/BEAN1.webp", radius: 0.6 },
  ];

  // Tweak these to change the feel
  const MIN_SPEED = 8;        // pixels per second
  const MAX_SPEED = 18;
  const WANDER = 0.35;        // how quickly direction changes (radians per second)
  const SWAY = 6;             // cutouts gently rock back and forth by up to this many
                              // degrees each way, instead of spinning all the way round
  const SWAY_TIME = 40;       // seconds for one slow rock back and forth (roughly)
  const MAX_TILT = 8;         // extra degrees a push or throw can tip them (eases back)
  // Each cutout gets an equal share of the page ("its room"). Sizes and
  // spacing are fractions of that room, so a longer page = bigger cutouts
  // spread further apart.
  const MIN_SIZE = 0.85;      // image width as a fraction of its room
  const MAX_SIZE = 1.15;
  const MAX_PAGE_WIDTH = 0.8; // never wider than this fraction of the page width
  const MAX_SCREEN_SIZE = 0.5; // EASIEST WAY TO MAKE THEM SMALLER: cutouts are never wider
                               // than this fraction of the window width (0.3 = 30%),
                               // however long the page is. Lower = smaller cutouts.
  const SMALL_SCREEN_SIZE = 0.65; // the same limit on small screens (520px wide or less),
                               // a bit roomier so they don't look tiny on phones
  const MAX_SIZE_PX = 1200;  // the image files are 1200px, so bigger would look blurry
  const SMALL_IMAGE_PX = 800; // width of the lighter copies in organic_cutouts_web/small/
  // How many cutouts: grows with the length of the page
  const PER_SCREEN = 1.5;     // cutouts per window-height of page (raise for more, smaller ones)
  const MIN_COUNT = 3;        // never fewer than this, even on a short page
  // Repeats (only used when the page wants more cutouts than there are images)
  const MAX_COPIES = 2;       // how many times one image may appear at most (1 = never repeat)
  const REPEAT_SIZES = [0.6, 1.3]; // sizes used for repeats, taken in turn, so some
                              // repeats are smaller and some bigger than normal
                              // (0.6 = 60% of normal size, 1.3 = 130%)
  const TWIN_DISTANCE = 1;    // copies of the same image start at least this many
                              // window-heights apart
  const GAP_SIZE = 0.4;       // minimum space between two cutouts, as a fraction
  const MIN_GAP = 4;          // of its room (never below MIN_GAP px)
  const MAX_FILL = 0.8;       // THE MAIN SIZE LIMIT: how tightly the cutouts may pack.
                              // All of them shrink until they fit with GAP between
                              // them, so raise this to make them bigger (they'll
                              // have less room to move).
  const EDGE_OUT = 0.35;      // how far (fraction of radius) a cutout may drift past the page edges
  const RETURN_MARGIN = 0.3;  // a cutout whose centre is closer than this fraction of its
                              // radius to a page edge gets pulled back onto the page
  const RETURN_PULL = 2.5;    // how strongly it's pulled back (higher = snappier bounce)
  const YIELD = 10;           // how readily a cutout makes way when another presses on it

  // Mouse pushing
  const CLICK_PUSH = 220;     // how hard a click shoves nearby cutouts (pixels per second)
  const CLICK_REACH = 120;    // how far beyond a cutout's edge a click still reaches (px)
  const DRAG_PUSH = 6;        // how strongly dragging sweeps cutouts along
  const DRAG_REACH = 20;      // how close the drag must pass to a cutout (px)
  const MAX_PUSH = 320;       // top speed a push can give (pixels per second)
  const PUSH_FADE = 1.2;      // how quickly a push slows down (higher = sooner)

  // Click-and-drag
  const GRAB_AREA = 0.75;     // how much of a cutout counts as grabbable (fraction of its radius)
  const HOLD_FOLLOW = 18;     // how tightly a dragged cutout follows the mouse (higher = tighter)
  const MAX_THROW = 600;      // top speed when letting go mid-drag (pixels per second)

  // A different random selection of `count` cutouts on each page load.
  // All images are used once (in random order, normal size) before any image
  // is used again; repeats take their sizes from REPEAT_SIZES in turn.
  function pickImages(count) {
    const picked = [];
    let repeats = 0;
    for (let copy = 0; copy < MAX_COPIES && picked.length < count; copy++) {
      const round = ALL_IMAGES.map(function (img, k) { return { img: img, key: k }; })
        .sort(function () { return Math.random() - 0.5; });
      round.forEach(function (item) {
        if (picked.length >= count) return;
        let size = 1;
        if (copy > 0) {
          size = REPEAT_SIZES[repeats % REPEAT_SIZES.length];
          repeats++;
        }
        picked.push({
          src: item.img.src,
          radius: item.img.radius,
          key: item.key,                       // same key = same image
          copySize: size
        });
      });
    }
    return picked;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  // On small screens the cutouts are mostly in the way of scrolling, so
  // there a finger on a cutout scrolls the page instead of dragging it
  // (taps still push them around)
  const smallScreen = window.matchMedia("(max-width: 520px)");

  // Wait until the paintings have loaded so the page has its full length
  if (document.readyState === "complete") {
    start();
  } else {
    window.addEventListener("load", start);
  }

  function start() {
  const layer = document.createElement("div");
  layer.className = "floaters";
  layer.setAttribute("aria-hidden", "true");
  document.body.prepend(layer);

  let W = 0;
  let H = 0;

  // The size of the whole page (not just the window). The page's length is
  // taken from the body, so the layer doesn't need to be collapsed first;
  // that used to force a full re-layout on every resize, and phones fire
  // resizes constantly while scrolling (the address bar shows and hides).
  let lastViewW = -1;
  let lastPageH = -1;
  function measurePage() {
    const viewW = document.documentElement.clientWidth;
    const pageH = document.body.scrollHeight;
    if (viewW === lastViewW && pageH === lastPageH) return; // nothing really changed
    lastViewW = viewW;
    lastPageH = pageH;
    W = viewW;
    H = Math.max(pageH, window.innerHeight);
    layer.style.height = H + "px";
  }
  measurePage();

  // More cutouts on longer pages, fewer on shorter ones, so each one keeps
  // a similar size (limited by how many images and copies there are)
  const screens = H / Math.max(window.innerHeight, 1);
  const wanted = Math.max(MIN_COUNT, Math.round(screens * PER_SCREEN));
  const count = Math.min(wanted, ALL_IMAGES.length * MAX_COPIES);
  const IMAGES = pickImages(count);

  // The biggest copy size actually used, so even big copies stay within
  // the size limits (and still look clearly bigger than the normal ones)
  const biggestCopy = IMAGES.reduce(function (m, img) { return Math.max(m, img.copySize); }, 1);

  // Pick sizes, then shrink them all if together they would crowd the page
  const roomSize = Math.sqrt((W * H) / IMAGES.length);
  const GAP = Math.max(MIN_GAP, Math.min(roomSize, W) * GAP_SIZE);
  // (the limits are applied before the random variation, so the cutouts
  // still differ in size even when they're at the limit)
  const sizeLimit = MAX_SIZE * biggestCopy;
  const baseWidth = Math.min(roomSize, W * MAX_PAGE_WIDTH / sizeLimit, MAX_SIZE_PX / sizeLimit,
                             W * (smallScreen.matches ? SMALL_SCREEN_SIZE : MAX_SCREEN_SIZE) / sizeLimit);
  const widths = IMAGES.map(function (img) {
    return baseWidth * rand(MIN_SIZE, MAX_SIZE) * img.copySize;
  });
  let covered = 0, avgR = 0;
  IMAGES.forEach(function (img, i) {
    const r = widths[i] * img.radius + GAP / 2;
    covered += Math.PI * r * r;
    avgR += r / IMAGES.length;
  });
  const room = W * H; // they live on the page, so only count the page itself
  let scale = Math.min(1, Math.sqrt((MAX_FILL * room) / covered));

  // Place them without overlaps; if it can't be done, shrink a bit and retry.
  // The first tries also keep copies of the same image far apart; if that
  // can't be done the page is simply too crowded, so later tries drop it.
  let floaters;
  for (let attempt = 0; attempt < 30; attempt++) {
    floaters = place(scale, attempt < 15 ? TWIN_DISTANCE * window.innerHeight : 0);
    if (floaters) break;
    scale *= 0.92;
  }

  // Scatter them randomly, then nudge overlapping ones apart until
  // every pair has at least GAP between them (and twins at least twinGap)
  function place(s, twinGap) {
    const placed = IMAGES.map(function (img, i) {
      const width = widths[i] * s;
      const r = width * img.radius;
      return { i: i, width: width, r: r, x: rand(0, W), y: rand(0, H) };
    });

    for (let round = 0; round < 600; round++) {
      let clear = true;
      for (let a = 0; a < placed.length; a++) {
        for (let b = a + 1; b < placed.length; b++) {
          const p = placed[a];
          const q = placed[b];
          let dx = q.x - p.x;
          let dy = q.y - p.y;
          let d = Math.hypot(dx, dy);
          let need = p.r + q.r + GAP + 1;
          if (IMAGES[p.i].key === IMAGES[q.i].key) need = Math.max(need, twinGap);
          if (d >= need) continue;
          clear = false;
          if (d < 0.01) { dx = rand(-1, 1); dy = rand(-1, 1); d = Math.hypot(dx, dy); }
          const shift = (need - d) / 2 + 0.5;
          p.x -= (dx / d) * shift; p.y -= (dy / d) * shift;
          q.x += (dx / d) * shift; q.y += (dy / d) * shift;
        }
      }
      // Keep them within the area they're allowed to roam
      placed.forEach(function (f) {
        const out = -f.r * RETURN_MARGIN; // start fully settled on the page
        f.x = Math.max(-out, Math.min(W + out, f.x));
        f.y = Math.max(-out, Math.min(H + out, f.y));
      });
      if (clear) return placed;
    }
    return null;
  }

  if (!floaters) return; // screen far too small; show nothing rather than overlap

  floaters.forEach(function (f) {
    const img = document.createElement("img");
    // Use the 600px copy (in small/) when it's sharp enough at this size on
    // this screen: much less for phones to download, decode and move around
    const needPx = f.width * (window.devicePixelRatio || 1);
    img.src = needPx <= SMALL_IMAGE_PX
      ? IMAGES[f.i].src.replace(/([^/]+)$/, "small/$1")
      : IMAGES[f.i].src;
    img.decoding = "async";
    img.alt = "";
    img.className = "floater";
    img.style.width = f.width + "px";
    layer.appendChild(img);

    f.el = img;
    f.heading = rand(0, Math.PI * 2);
    f.speed = rand(MIN_SPEED, MAX_SPEED);
    f.baseAngle = rand(-15, 15);   // resting angle
    f.swayPhase = rand(0, Math.PI * 2);
    f.swayRate = (2 * Math.PI / SWAY_TIME) * rand(0.7, 1.3);
    f.tilt = 0;                    // extra lean from pushes, eases back to 0
    f.angle = f.baseAngle;
    f.wanderPhase = rand(0, 1000);
    f.vx = 0; // extra velocity from mouse pushes
    f.vy = 0;
  });

  // Gentle rocking instead of spinning; push tilt eases back to nothing
  function updateAngle(f, dt) {
    f.swayPhase += f.swayRate * dt;
    f.tilt *= Math.exp(-0.8 * dt);
    f.angle = f.baseAngle + Math.sin(f.swayPhase) * SWAY + f.tilt;
  }

  function addTilt(f, amount) {
    f.tilt = Math.max(-MAX_TILT, Math.min(MAX_TILT, f.tilt + amount));
  }

  function draw(f) {
    f.el.style.transform =
      "translate3d(" + f.x + "px," + f.y + "px,0) translate(-50%,-50%) rotate(" + f.angle + "deg)";
  }

  function turnToward(f, target, amount) {
    let diff = target - f.heading;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    f.heading += diff * amount;
  }

  function step(f, dt, t) {
    updateAngle(f, dt);

    // Smooth random wandering
    f.heading += Math.sin(t * 0.0003 + f.wanderPhase) * WANDER * dt
               + (Math.random() - 0.5) * WANDER * dt;

    // Gently steer away from neighbours before getting close
    floaters.forEach(function (o) {
      if (o === f) return;
      const d = Math.hypot(f.x - o.x, f.y - o.y);
      const near = f.r + o.r + GAP;
      if (d < near * 1.4) {
        turnToward(f, Math.atan2(f.y - o.y, f.x - o.x), 0.6 * dt);
      }
    });

    // Gently steer back when drifting toward the edges
    const out = f.r * EDGE_OUT;
    if (f.x < out || f.x > W - out || f.y < out || f.y > H - out) {
      turnToward(f, Math.atan2(H / 2 - f.y, W / 2 - f.x), 0.8 * dt);
    }

    // Pushes from the mouse fade out over time
    const fade = Math.exp(-PUSH_FADE * dt);
    f.vx *= fade;
    f.vy *= fade;

    // Spring back onto the page: the further a cutout hangs over an edge,
    // the harder it's pulled back in, so it bounces softly back into view
    const inside = f.r * RETURN_MARGIN;
    let overhang = false;
    if (f.x < inside) { f.vx += (inside - f.x) * RETURN_PULL * dt; overhang = true; }
    if (f.x > W - inside) { f.vx -= (f.x - (W - inside)) * RETURN_PULL * dt; overhang = true; }
    if (f.y < inside) { f.vy += (inside - f.y) * RETURN_PULL * dt; overhang = true; }
    if (f.y > H - inside) { f.vy -= (f.y - (H - inside)) * RETURN_PULL * dt; overhang = true; }
    // ...and stop drifting outward while it's hanging over the edge
    if (overhang) turnToward(f, Math.atan2(H / 2 - f.y, W / 2 - f.x), 3 * dt);
    const pushSpeed = Math.hypot(f.vx, f.vy);
    if (pushSpeed > MAX_PUSH) {
      f.vx *= MAX_PUSH / pushSpeed;
      f.vy *= MAX_PUSH / pushSpeed;
    }

    let nx = f.x + (Math.cos(f.heading) * f.speed + f.vx) * dt;
    let ny = f.y + (Math.sin(f.heading) * f.speed + f.vy) * dt;

    // Hard rule: never move into another cutout. A move that would get too
    // close slides around the other one instead, and nudges it aside so a
    // cutout coming back onto the page can always find its way in.
    for (let round = 0; round < 4; round++) {
      for (let k = 0; k < floaters.length; k++) {
        const o = floaters[k];
        if (o === f) continue;
        const minD = f.r + o.r + GAP;
        const d = Math.hypot(nx - o.x, ny - o.y);
        if (d >= minD) continue;
        const ux = d > 0.01 ? (nx - o.x) / d : Math.cos(f.heading + Math.PI);
        const uy = d > 0.01 ? (ny - o.y) / d : Math.sin(f.heading + Math.PI);
        // How hard it was pressing into the other one
        const pressing = Math.max(0, -((nx - f.x) * ux + (ny - f.y) * uy)) / dt;
        nx = o.x + ux * (minD + 0.01);
        ny = o.y + uy * (minD + 0.01);
        // Turn away, soften any push into the other one, and nudge it aside
        turnToward(f, Math.atan2(uy, ux), 3 * dt);
        const into = f.vx * ux + f.vy * uy;
        if (into < 0) {
          f.vx -= into * ux * 1.4;
          f.vy -= into * uy * 1.4;
        }
        if (o !== held) {
          o.vx -= ux * Math.min(pressing, 120) * YIELD * dt;
          o.vy -= uy * Math.min(pressing, 120) * YIELD * dt;
        }
      }
    }
    const clear = floaters.every(function (o) {
      return o === f || Math.hypot(nx - o.x, ny - o.y) >= f.r + o.r + GAP;
    });
    if (!clear) {
      // Boxed in: stay put this frame and pick a new direction
      f.heading += rand(-1.5, 1.5);
      return;
    }

    // Keep them from wandering far off-screen
    const limit = -f.r * EDGE_OUT;
    const outX = (nx < limit && nx < f.x) || (nx > W - limit && nx > f.x);
    const outY = (ny < limit && ny < f.y) || (ny > H - limit && ny > f.y);
    if (outX || outY) {
      f.heading = Math.atan2(H / 2 - f.y, W / 2 - f.x) + rand(-0.6, 0.6);
      if (outX) f.vx *= -0.4;
      if (outY) f.vy *= -0.4;
      return;
    }

    f.x = nx;
    f.y = ny;
  }

  // ----- Mouse / touch pushing -----
  // Click (or tap) near a cutout to shove it away; hold and drag through
  // the cutouts to sweep them along.
  // True when the cutouts are hidden (mobile-width window, see main.css)
  function layerHidden() {
    return window.getComputedStyle(layer).display === "none";
  }

  function push(x, y, reach, strength, dirX, dirY) {
    if (layerHidden()) return;
    floaters.forEach(function (f) {
      const dx = f.x - x;
      const dy = f.y - y;
      const d = Math.hypot(dx, dy) || 1;
      const range = f.r + reach;
      if (d > range) return;
      const power = strength * (1 - d / range);
      // Away from the pointer, or along the drag direction if given
      const ux = dirX !== undefined ? dirX : dx / d;
      const uy = dirY !== undefined ? dirY : dy / d;
      f.vx += ux * power;
      f.vy += uy * power;
      addTilt(f, ux * power * 0.02);
      const s = Math.hypot(f.vx, f.vy);
      if (s > MAX_PUSH) {
        f.vx *= MAX_PUSH / s;
        f.vy *= MAX_PUSH / s;
      }
    });
  }

  let pressed = false;
  let lastX = 0;
  let lastY = 0;

  // ----- Grabbing and dragging a cutout -----
  let held = null;            // the cutout being dragged, if any
  let grabDX = 0;             // where on the cutout it was grabbed
  let grabDY = 0;
  let pointerX = 0;
  let pointerY = 0;
  let flingX = 0;             // recent pointer velocity, used to throw on release
  let flingY = 0;
  let lastMoveTime = 0;

  // Don't steal clicks meant for links, buttons, paintings or text fields
  function isPageContent(target) {
    return target && target.closest &&
      target.closest("a, button, input, textarea, select, label, video, iframe, img");
  }

  // The cutout under the pointer (topmost first), if any
  function cutoutAt(x, y) {
    if (layerHidden()) return null;
    for (let k = floaters.length - 1; k >= 0; k--) {
      const f = floaters[k];
      if (Math.hypot(x - f.x, y - f.y) < f.r * GRAB_AREA) return f;
    }
    return null;
  }

  // Move the held cutout toward (tx, ty), sliding around the others
  // and never coming closer than GAP to any of them
  function moveHeld(tx, ty) {
    const f = held;
    let cx = tx;
    let cy = ty;
    for (let round = 0; round < 6; round++) {
      floaters.forEach(function (o) {
        if (o === f) return;
        const minD = f.r + o.r + GAP;
        const d = Math.hypot(cx - o.x, cy - o.y);
        if (d < minD) {
          const ux = d > 0.01 ? (cx - o.x) / d : 1;
          const uy = d > 0.01 ? (cy - o.y) / d : 0;
          cx = o.x + ux * (minD + 0.5);
          cy = o.y + uy * (minD + 0.5);
        }
      });
      const out = f.r * EDGE_OUT;
      cx = Math.max(-out, Math.min(W + out, cx));
      cy = Math.max(-out, Math.min(H + out, cy));
    }
    const ok = floaters.every(function (o) {
      return o === f || Math.hypot(cx - o.x, cy - o.y) >= f.r + o.r + GAP;
    });
    if (ok) {
      f.x = cx;
      f.y = cy;
    }
  }

  function startGrab(f, x, y) {
    held = f;
    grabDX = f.x - x;
    grabDY = f.y - y;
    pointerX = x;
    pointerY = y;
    flingX = 0;
    flingY = 0;
    lastMoveTime = performance.now();
    f.vx = 0;
    f.vy = 0;
    f.el.classList.add("floater-held");
    document.documentElement.classList.add("floaters-grabbing");
  }

  function release() {
    if (!held) return;
    // Throw it in the direction the mouse was moving
    const fresh = performance.now() - lastMoveTime < 100;
    let vx = fresh ? flingX : 0;
    let vy = fresh ? flingY : 0;
    const s = Math.hypot(vx, vy);
    if (s > MAX_THROW) {
      vx *= MAX_THROW / s;
      vy *= MAX_THROW / s;
    }
    held.vx = vx;
    held.vy = vy;
    addTilt(held, vx * 0.01);
    if (s > 1) held.heading = Math.atan2(vy, vx);
    held.el.classList.remove("floater-held");
    document.documentElement.classList.remove("floaters-grabbing");
    held = null;
  }

  // Pointer positions are measured on the page (pageX/pageY), since the
  // cutouts live on the page and scroll with it
  window.addEventListener("pointerdown", function (e) {
    if (e.button !== undefined && e.button !== 0) return;
    pressed = true;
    lastX = e.pageX;
    lastY = e.pageY;
    const touchOnSmall = e.pointerType === "touch" && smallScreen.matches;
    const f = !touchOnSmall && !isPageContent(e.target) && cutoutAt(e.pageX, e.pageY);
    if (f) {
      e.preventDefault(); // stop text from being selected while dragging
      startGrab(f, e.pageX, e.pageY);
    } else {
      push(e.pageX, e.pageY, CLICK_REACH, CLICK_PUSH);
    }
  });

  // On touch screens, stop the page from scrolling while dragging a cutout
  window.addEventListener("touchstart", function (e) {
    const t = e.touches[0];
    if (smallScreen.matches) return;
    if (t && !isPageContent(e.target) && cutoutAt(t.pageX, t.pageY)) {
      e.preventDefault();
    }
  }, { passive: false });

  window.addEventListener("pointermove", function (e) {
    const mx = e.pageX - lastX;
    const my = e.pageY - lastY;
    const moved = Math.hypot(mx, my);

    if (held) {
      const now = performance.now();
      const dt = Math.max((now - lastMoveTime) / 1000, 0.001);
      // Smoothed pointer speed for the throw
      flingX = flingX * 0.6 + (mx / dt) * 0.4;
      flingY = flingY * 0.6 + (my / dt) * 0.4;
      lastMoveTime = now;
      pointerX = e.pageX;
      pointerY = e.pageY;
      lastX = e.pageX;
      lastY = e.pageY;
      return;
    }

    // Show a grab hand when hovering a cutout
    const over = !isPageContent(e.target) && cutoutAt(e.pageX, e.pageY);
    document.documentElement.classList.toggle("floaters-can-grab", !!over);

    if (!pressed) return;
    lastX = e.pageX;
    lastY = e.pageY;
    if (moved < 1) return;
    push(e.pageX, e.pageY, DRAG_REACH, Math.min(moved * DRAG_PUSH, MAX_PUSH),
         mx / moved, my / moved);
  });

  ["pointerup", "pointercancel", "blur"].forEach(function (type) {
    window.addEventListener(type, function () {
      pressed = false;
      release();
    });
  });

  floaters.forEach(draw);

  if (reduceMotion) return;

  let last = performance.now();
  function frame(now) {
    // Cap the time step so nothing jumps after switching tabs
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    floaters.forEach(function (f) {
      if (f === held) {
        // Follow the pointer with a little softness
        const ease = 1 - Math.exp(-HOLD_FOLLOW * dt);
        moveHeld(
          f.x + (pointerX + grabDX - f.x) * ease,
          f.y + (pointerY + grabDY - f.y) * ease
        );
        updateAngle(f, dt);
      } else {
        step(f, dt, now);
      }
      draw(f);
    });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // Keep the roaming area in step with the page if it's resized or its
  // content changes length (sizes stay the same until the next page load)
  window.addEventListener("resize", measurePage);
  if (window.ResizeObserver) {
    let pending = false;
    new ResizeObserver(function () {
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        measurePage();
      });
    }).observe(document.body);
  }
  } // end start()
})();
