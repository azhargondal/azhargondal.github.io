/* Animated background: grid + particles + connection lines, mouse-reactive. */
(function () {
  var canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var W, H, dpr;
  var mouse = { x: -9999, y: -9999, active: false };
  var particles = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.width = innerWidth * dpr;
    H = canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    initParticles();
  }

  function initParticles() {
    var count = Math.min(90, Math.floor((innerWidth * innerHeight) / 22000));
    particles = [];
    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.18 * dpr,
        vy: (Math.random() - 0.5) * 0.18 * dpr,
        r: (Math.random() * 1.4 + 0.4) * dpr,
        hue: Math.random() < 0.5 ? 200 : Math.random() < 0.5 ? 258 : 300
      });
    }
  }

  function drawGrid(t) {
    var gap = 46 * dpr;
    ctx.strokeStyle = "rgba(255,255,255,0.022)";
    ctx.lineWidth = 1;
    var off = (t * 0.004 * dpr) % gap;
    ctx.beginPath();
    for (var x = -off; x < W; x += gap) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (var y = -off; y < H; y += gap) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();
  }

  function color(hue, a) {
    var map = { 200: [34, 211, 238], 258: [99, 132, 246], 300: [167, 110, 240] };
    var c = map[hue] || map[258];
    return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")";
  }

  var raf;
  function frame(t) {
    ctx.clearRect(0, 0, W, H);
    drawGrid(t);

    var linkDist = 130 * dpr;
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

      if (mouse.active) {
        var dx = p.x - mouse.x * dpr, dy = p.y - mouse.y * dpr;
        var d = Math.hypot(dx, dy);
        if (d < 170 * dpr && d > 0.1) {
          var f = (170 * dpr - d) / (170 * dpr) * 0.5;
          p.x += (dx / d) * f; p.y += (dy / d) * f;
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = color(p.hue, 0.7);
      ctx.fill();

      for (var j = i + 1; j < particles.length; j++) {
        var q = particles[j];
        var ddx = p.x - q.x, ddy = p.y - q.y;
        var dd = Math.hypot(ddx, ddy);
        if (dd < linkDist) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = color(p.hue, (1 - dd / linkDist) * 0.12);
          ctx.lineWidth = dpr * 0.6;
          ctx.stroke();
        }
      }
    }
    raf = requestAnimationFrame(frame);
  }

  addEventListener("resize", resize);
  addEventListener("mousemove", function (e) { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; });
  addEventListener("mouseout", function () { mouse.active = false; });

  resize();
  if (reduce) {
    ctx.clearRect(0, 0, W, H);
    drawGrid(0);
    particles.forEach(function (p) { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = color(p.hue, 0.6); ctx.fill(); });
  } else {
    raf = requestAnimationFrame(frame);
  }
})();
