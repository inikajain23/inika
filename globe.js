
(function(){
  var SVGNS = "http://www.w3.org/2000/svg";
  var R = 250, CX = 960, CY = 600;
  var CUES = { Ink: 0, Spin: 2.6, Wave: 5.6, Dissolve: 9.2 };
  var DURATION = 10.8;
  var WOB = 4.2;

  var clamp = function(v, a, b){ return Math.max(a, Math.min(b, v)); };
  var Easing = {
    easeInOutSine: function(t){ return -(Math.cos(Math.PI * t) - 1) / 2; },
    easeOutCubic: function(t){ t = t - 1; return t * t * t + 1; }
  };
  function animate(opts){
    var from = opts.from, to = opts.to, start = opts.start, end = opts.end, ease = opts.ease;
    return function(t){
      if (t <= start) return from;
      if (t >= end) return to;
      var local = (t - start) / (end - start);
      return from + (to - from) * ease(local);
    };
  }
  function drawFn(start, end, from, to){
    return animate({ from: from === undefined ? 0 : from, to: to === undefined ? 1 : to, start: start, end: end, ease: Easing.easeInOutSine });
  }
  function enterFn(start, end, from, to){
    return animate({ from: from, to: to, start: start, end: end, ease: Easing.easeOutCubic });
  }

  var LANDS = [
    // Africa
    [[9,37],[20,33],[32,31],[36,22],[43,13],[51,11],[45,2],[40,-11],[35,-24],[27,-33],[19,-34],[16,-29],[13,-18],[9,-6],[8,4],[3,12],[-6,13],[-17,15],[-16,21],[-6,32]],
    // Europe
    [[-9,43],[-9,36],[3,37],[13,38],[16,40],[19,42],[23,40],[28,41],[30,46],[24,50],[18,54],[11,55],[5,51],[-1,49],[-5,48]],
    // South America
    [[-60,10],[-50,5],[-35,-8],[-38,-16],[-42,-23],[-48,-28],[-58,-35],[-65,-42],[-68,-52],[-72,-50],[-71,-33],[-70,-18],[-75,-5],[-79,2],[-77,8],[-70,11]],
    // North America
    [[-155,68],[-130,70],[-95,68],[-75,62],[-65,50],[-60,46],[-66,44],[-70,41],[-75,35],[-81,25],[-97,26],[-105,22],[-115,30],[-124,40],[-124,48],[-130,55],[-140,60]],
    // Australia
    [[113,-22],[122,-18],[131,-12],[136,-12],[142,-11],[145,-16],[153,-28],[150,-37],[140,-38],[130,-32],[120,-34],[114,-30]],
    // India
    [[68,24],[73,22],[78,20],[80,13],[77,8],[73,10],[70,16]],
    // East Asia
    [[98,42],[110,48],[122,50],[130,44],[126,38],[121,31],[113,28],[104,30],[98,36]]
  ];

  function smoothClosed(pts){
    if (pts.length < 3) return "";
    var d = "M " + pts[0].x.toFixed(1) + " " + pts[0].y.toFixed(1);
    for (var i = 0; i < pts.length; i++){
      var cur = pts[i], next = pts[(i + 1) % pts.length];
      var mid = { x: (cur.x + next.x) / 2, y: (cur.y + next.y) / 2 };
      d += " Q " + cur.x.toFixed(1) + " " + cur.y.toFixed(1) + " " + mid.x.toFixed(1) + " " + mid.y.toFixed(1);
    }
    return d + " Z";
  }

  function projectLand(pts, spin){
    var proj = [], cd = 0;
    for (var i = 0; i < pts.length; i++){
      var lo = pts[i][0], la = pts[i][1];
      var l = (lo * Math.PI) / 180 + spin;
      var b = (la * Math.PI) / 180;
      var depth = Math.cos(b) * Math.cos(l);
      cd += depth;
      var x = R * Math.cos(b) * Math.sin(l);
      var y = -R * Math.sin(b);
      if (depth < 0){
        var m = Math.hypot(x, y) || 1;
        x = (x / m) * R * 0.995;
        y = (y / m) * R * 0.995;
      }
      proj.push({ x: x, y: y });
    }
    var vis = clamp((cd / pts.length) / 0.14, 0, 1);
    return { proj: proj, vis: vis };
  }

  function svgEl(tag, attrs){
    var el = document.createElementNS(SVGNS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }
  function penEl(tag, attrs, w){
    var base = { fill: "none", stroke: "currentColor", "stroke-linecap": "round", "stroke-linejoin": "round", "pathLength": "1", "stroke-dasharray": "1 1.02", "stroke-width": w };
    for (var k in attrs) base[k] = attrs[k];
    return svgEl(tag, base);
  }

  function buildGlobePiece(root){
    var defs = svgEl("defs", {});
    var filter = svgEl("filter", { id: "sketch", x: "-15%", y: "-15%", width: "130%", height: "130%" });
    var turb = svgEl("feTurbulence", { type: "fractalNoise", baseFrequency: "0.018", numOctaves: "3", seed: "1", result: "n" });
    var disp = svgEl("feDisplacementMap", { "in": "SourceGraphic", in2: "n", scale: String(WOB), xChannelSelector: "R", yChannelSelector: "G" });
    filter.appendChild(turb); filter.appendChild(disp); defs.appendChild(filter);
    root.appendChild(defs);

    var scene = svgEl("g", { filter: "url(#sketch)" });
    root.appendChild(scene);

    // marks
    var marksG = svgEl("g", {});
    var mark1 = svgEl("g", {});
    var star1 = penEl("path", { d: "M 0 -26 L 5 -6 L 26 0 L 5 6 L 0 26 L -5 6 L -26 0 L -5 -6 Z" }, 2.4);
    mark1.appendChild(star1);
    var mark2 = svgEl("g", {});
    var star2 = penEl("path", { d: "M 0 -16 L 3 -4 L 16 0 L 3 4 L 0 16 L -3 4 L -16 0 L -3 -4 Z" }, 2.2);
    mark2.appendChild(star2);
    var squiggle1 = penEl("path", { d: "M 1420 720 C 1470 706 1520 706 1560 716", opacity: "0.5" }, 2.2);
    var squiggle2 = penEl("path", { d: "M 360 760 C 410 746 460 746 500 756", opacity: "0.5" }, 2.2);
    marksG.appendChild(mark1); marksG.appendChild(mark2); marksG.appendChild(squiggle1); marksG.appendChild(squiggle2);
    scene.appendChild(marksG);

    // world
    var world = svgEl("g", { transform: "translate(" + CX + " " + CY + ")" });
    scene.appendChild(world);
    var globe = svgEl("g", {});
    world.appendChild(globe);

    var outline = penEl("circle", { cx: "0", cy: "0", r: String(R) }, 3.6);
    globe.appendChild(outline);

    var meridianEls = [];
    for (var k = 0; k < 6; k++){
      var m = penEl("path", {}, 2.2);
      globe.appendChild(m);
      meridianEls.push(m);
    }

    var latEls = [];
    [30, -30].forEach(function(la){
      var b = (la * Math.PI) / 180;
      var r = R * Math.cos(b);
      var y = -R * Math.sin(b);
      var ry = R * Math.sin(Math.abs(b)) * 0.42;
      var d = "M " + (-r) + " " + y + " A " + r + " " + ry + " 0 0 0 " + r + " " + y;
      var lat = penEl("path", { d: d, opacity: "0.6" }, 2);
      globe.appendChild(lat);
      latEls.push(lat);
    });

    var landEls = LANDS.map(function(){
      var l = penEl("path", {}, 2.6);
      globe.appendChild(l);
      return l;
    });

    // girl
    var girlAnchor = svgEl("g", {}); // translate(0, -R+4)
    girlAnchor.setAttribute("transform", "translate(0 " + (-R + 4) + ")");
    world.appendChild(girlAnchor);
    var girlScale = svgEl("g", { transform: "scale(1.12)" });
    girlAnchor.appendChild(girlScale);
    var girl = svgEl("g", {});
    girlScale.appendChild(girl);

    var girlDefaultEls = [];
    var girlAllEls = [];
    function gp(tag, attrs, w, extra){
      var e = penEl(tag, attrs, w);
      if (extra && extra.opacity != null) e.setAttribute("opacity", String(extra.opacity));
      if (extra && extra.fill) e.setAttribute("fill", extra.fill);
      girl.appendChild(e);
      girlAllEls.push(e);
      if (!extra || extra.opacity == null) girlDefaultEls.push(e);
      return e;
    }

    gp("path", { d: "M -3 -82 C -6 -55 -8 -28 -10 -1" }, 3);
    gp("path", { d: "M 6 -82 C 9 -55 11 -28 12 -1" }, 3);
    gp("path", { d: "M -17 -1 C -14 -6 -7 -6 -4 -1" }, 3);
    gp("path", { d: "M 6 -1 C 9 -6 15 -6 18 -1" }, 3);
    gp("path", { d: "M -16 -141 C -21 -120 -23 -100 -25 -80 C -12 -74 12 -74 26 -81 C 23 -101 20 -121 15 -141 C 7 -145 -8 -145 -16 -141 Z" }, 3.4);
    gp("path", { d: "M -25 -80 C -14 -86 12 -86 26 -81" }, 2.2, { opacity: 0.55 });
    gp("path", { d: "M -17 -138 C -25 -120 -28 -105 -27 -92" }, 3);
    gp("path", { d: "M -27 -92 C -31 -87 -29 -82 -25 -85" }, 2.6);

    var armGroup = svgEl("g", {});
    girl.appendChild(armGroup);
    var arm1 = penEl("path", { d: "M 16 -138 C 27 -150 34 -164 36 -176" }, 3);
    var arm2 = penEl("path", { d: "M 36 -176 C 42 -181 45 -174 41 -170 C 39 -168 37 -170 36 -173" }, 2.6);
    armGroup.appendChild(arm1); armGroup.appendChild(arm2);
    girlAllEls.push(arm1, arm2); girlDefaultEls.push(arm1, arm2);

    gp("path", { d: "M -3 -142 L -3 -149 M 3 -142 L 3 -149" }, 2.4);
    gp("path", { d: "M 0 -149 C -9 -149 -11 -156 -11 -163 C -11 -172 -6 -177 0 -177 C 6 -177 11 -172 11 -163 C 11 -156 9 -149 0 -149 Z" }, 3.2);
    gp("path", { d: "M -7 -166 C -5.5 -167.5 -4 -167.5 -2.5 -166" }, 2);
    gp("path", { d: "M 2.5 -166 C 4 -167.5 5.5 -167.5 7 -166" }, 2);
    gp("path", { d: "M -3 -157 C -1 -155 2 -155 4 -157" }, 2);
    gp("circle", { cx: "0", cy: "-172", r: "1.6" }, 2, { fill: "currentColor" });
    gp("path", { d: "M -11 -165 C -10 -175 -4 -180 0 -177 C 4 -180 11 -175 11 -165" }, 3);
    gp("path", { d: "M 0 -177 L 0 -171" }, 1.8, { opacity: 0.6 });
    var braid1 = gp("path", {}, 3);
    var braid2 = gp("path", {}, 2.2);
    var dupattaPath = gp("path", {}, 2.4, { opacity: 0.8 });

    root.querySelector && null;

    return {
      scene: scene, turb: turb, world: world, girlAnchor: girlAnchor,
      outline: outline, meridianEls: meridianEls, landEls: landEls,
      girlAllEls: girlAllEls, girlDefaultEls: girlDefaultEls,
      armGroup: armGroup, girl: girl, braid1: braid1, braid2: braid2, dupattaPath: dupattaPath,
      mark1: mark1, mark2: mark2, squiggle1: squiggle1, squiggle2: squiggle2, star1: star1, star2: star2
    };
  }

  function renderFrame(P, T){
    var pOutline = drawFn(CUES.Ink + 0.15, CUES.Ink + 1.25)(T) * drawFn(CUES.Dissolve + 1.05, CUES.Dissolve + 1.5, 1, 0)(T);
    var pGrid = drawFn(CUES.Ink + 0.85, CUES.Ink + 1.9)(T) * drawFn(CUES.Dissolve + 0.75, CUES.Dissolve + 1.25, 1, 0)(T);
    var pGirl = drawFn(CUES.Ink + 1.55, CUES.Ink + 2.6)(T) * drawFn(CUES.Dissolve + 0.15, CUES.Dissolve + 0.85, 1, 0)(T);
    var pLand = drawFn(CUES.Spin - 0.4, CUES.Spin + 0.9)(T) * drawFn(CUES.Dissolve + 0.6, CUES.Dissolve + 1.15, 1, 0)(T);
    var pMarks = drawFn(CUES.Spin + 0.5, CUES.Spin + 1.4)(T) * drawFn(CUES.Dissolve, CUES.Dissolve + 0.6, 1, 0)(T);

    var u = Math.max(0, T - (CUES.Spin - 0.5));
    var spin = 0.62 * ((u * u) / (u + 0.9));

    var waveOn = enterFn(CUES.Wave - 0.3, CUES.Wave + 0.5, 0, 1)(T) * enterFn(CUES.Dissolve - 0.4, CUES.Dissolve + 0.1, 1, 0)(T);
    var wave = waveOn * Math.sin((T - CUES.Wave + 0.3) * 7.4);
    var bob = -1.6 * Math.sin(T * 2.1) * clamp(pGirl, 0, 1);
    var braid = Math.sin(T * 2.6 + 0.6) * clamp(pGirl, 0, 1);
    var twinkle = 0.5 + 0.5 * Math.sin(T * 2.4);

    var zoom = enterFn(CUES.Ink, CUES.Wave, 1, 1.06)(T) * enterFn(CUES.Wave - 0.2, CUES.Wave + 2.2, 1, 1.14)(T) * enterFn(CUES.Dissolve + 0.2, CUES.Dissolve + 1.5, 1, 1 / 1.2084)(T);
    var panY = enterFn(CUES.Wave - 0.2, CUES.Wave + 2.2, 0, 70)(T) * enterFn(CUES.Dissolve + 0.2, CUES.Dissolve + 1.5, 1, 0)(T);
    var seed = Math.floor(T * 7) % 90;

    P.scene.setAttribute("transform", "translate(960 540) scale(" + zoom.toFixed(4) + ") translate(-960 " + (-540 + panY).toFixed(2) + ")");
    if (P._lastSeed !== seed){ P.turb.setAttribute("seed", String(seed)); P._lastSeed = seed; }

    P.outline.setAttribute("stroke-dashoffset", String(1 - clamp(pOutline, 0, 1)));
    P.outline.setAttribute("opacity", pOutline <= 0 ? "0" : "1");

    for (var k = 0; k < 6; k++){
      var th = spin + (k * Math.PI) / 6;
      var c = Math.cos(th);
      var rx = Math.abs(c) * R;
      var el = P.meridianEls[k];
      if (rx < 1.5){ el.setAttribute("opacity", "0"); continue; }
      var sweep = c > 0 ? 1 : 0;
      el.setAttribute("d", "M 0 " + (-R) + " A " + rx.toFixed(1) + " " + R + " 0 0 " + sweep + " 0 " + R);
      el.setAttribute("stroke-dashoffset", String(1 - clamp(pGrid, 0, 1)));
      el.setAttribute("opacity", String(0.85 * clamp(rx / 26, 0, 1)));
    }

    P.landEls.forEach(function(el, i){
      var res = projectLand(LANDS[i], spin);
      el.setAttribute("d", smoothClosed(res.proj));
      if (res.vis <= 0.01 || pLand <= 0){ el.setAttribute("opacity", "0"); }
      else {
        el.setAttribute("opacity", String(res.vis));
        el.setAttribute("stroke-dashoffset", String(1 - clamp(pLand, 0, 1)));
      }
    });

    var girlOpacity = pGirl <= 0 ? "0" : "1";
    var girlDash = String(1 - clamp(pGirl, 0, 1));
    P.girlAllEls.forEach(function(el){ el.setAttribute("stroke-dashoffset", girlDash); });
    P.girlDefaultEls.forEach(function(el){ el.setAttribute("opacity", girlOpacity); });

    var armA = 16 * wave;
    P.armGroup.setAttribute("transform", "rotate(" + armA.toFixed(2) + " 16 -138)");
    P.girl.parentNode.parentNode.setAttribute("transform", "translate(0 " + (-R + 4) + ")");
    P.girl.setAttribute("transform", "translate(0 " + bob.toFixed(2) + ")");

    var dupatta = 6 * braid;
    P.braid1.setAttribute("d", "M -11 -162 C -21 -148 " + (-23 - dupatta).toFixed(1) + " -128 " + (-19 - dupatta * 1.4).toFixed(1) + " -108");
    P.braid2.setAttribute("d", "M " + (-19 - dupatta * 1.4).toFixed(1) + " -108 C " + (-17 - dupatta * 1.6).toFixed(1) + " -101 " + (-23 - dupatta * 1.8).toFixed(1) + " -98 " + (-21 - dupatta * 1.6).toFixed(1) + " -104");
    P.dupattaPath.setAttribute("d", "M 14 -139 C " + (30 + dupatta * 2).toFixed(1) + " -131 " + (38 + dupatta * 3).toFixed(1) + " -116 " + (29 + dupatta * 2).toFixed(1) + " -100");

    var s = 0.9 + 0.12 * twinkle;
    P.mark1.setAttribute("transform", "translate(430 300) scale(" + s.toFixed(3) + ")");
    P.mark2.setAttribute("transform", "translate(1500 380) scale(" + (1.9 - s).toFixed(3) + ")");
    [P.star1, P.star2].forEach(function(el){
      el.setAttribute("stroke-dashoffset", String(1 - clamp(pMarks, 0, 1)));
      el.setAttribute("opacity", pMarks <= 0 ? "0" : "1");
    });
    [P.squiggle1, P.squiggle2].forEach(function(el){
      el.setAttribute("stroke-dashoffset", String(1 - clamp(pMarks, 0, 1)));
    });
  }

  function initGlobePiece(){
    var svg = document.getElementById("globe-piece");
    if (!svg) return;
    var P = buildGlobePiece(svg);
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion){
      renderFrame(P, CUES.Wave + 1.0);
      return;
    }
    var start = null;
    function tick(ts){
      if (start === null) start = ts;
      var T = ((ts - start) / 1000) % DURATION;
      renderFrame(P, T);
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  initGlobePiece();
})();
