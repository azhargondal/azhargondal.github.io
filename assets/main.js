(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var coarse = window.matchMedia("(pointer: coarse)").matches;

  /* ---------- loader ---------- */
  window.addEventListener("load", function () {
    setTimeout(function () {
      var l = document.getElementById("loader");
      if (l) l.classList.add("done");
      document.body.classList.add("loaded");
    }, 1700);
  });

  /* ---------- custom cursor ---------- */
  var dot = document.querySelector(".cursor-dot");
  var ring = document.querySelector(".cursor-ring");
  var glow = document.getElementById("mouse-glow");
  if (!coarse && dot && ring) {
    var mx = innerWidth / 2, my = innerHeight / 2;
    var rx = mx, ry = my, gx = mx, gy = my;
    addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + "px"; dot.style.top = my + "px";
    });
    function loop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      gx += (mx - gx) * 0.08; gy += (my - gy) * 0.08;
      ring.style.left = rx + "px"; ring.style.top = ry + "px";
      if (glow) { glow.style.left = gx + "px"; glow.style.top = gy + "px"; }
      requestAnimationFrame(loop);
    }
    loop();
    var hoverables = "a, button, .btn, input, textarea, .chip, .project, .value, .skill-cat, .c-row, .footer-socials a";
    document.querySelectorAll(hoverables).forEach(function (el) {
      el.addEventListener("mouseenter", function () { ring.classList.add("hover"); });
      el.addEventListener("mouseleave", function () { ring.classList.remove("hover"); });
    });
  }

  /* ---------- magnetic buttons ---------- */
  if (!coarse && !reduce) {
    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      var strength = parseFloat(el.dataset.magnetic) || 0.3;
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        el.style.transform = "translate(" + (x * strength) + "px, " + (y * strength) + "px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* ---------- smooth scroll navigation ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href").slice(1);
    if (!id) { e.preventDefault(); return; }
    var target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth" });
    var menu = document.querySelector(".mobile-menu");
    if (menu) menu.classList.remove("open");
  });

  /* ---------- nav active state on scroll ---------- */
  var sections = Array.from(document.querySelectorAll("section[data-view]"));
  var navLinks = document.querySelectorAll(".nav-links a");

  function updateActiveNav() {
    var scrollPos = window.scrollY + 150;
    var current = "";
    sections.forEach(function (section) {
      if (section.offsetTop <= scrollPos) {
        current = section.getAttribute("id");
      }
    });
    navLinks.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href") === "#" + current);
    });
  }
  window.addEventListener("scroll", updateActiveNav);
  updateActiveNav();

  /* ---------- nav shrink on scroll ---------- */
  var nav = document.querySelector("nav");
  window.addEventListener("scroll", function () {
    if (nav) nav.classList.toggle("shrink", window.scrollY > 60);
  });

  /* ---------- mobile menu toggle ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.querySelector(".mobile-menu");
  if (toggle && menu) toggle.addEventListener("click", function () { menu.classList.toggle("open"); });

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(function (el) { revealObserver.observe(el); });

  /* ---------- counters ---------- */
  var countersDone = {};
  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !countersDone[entry.target.id]) {
        countersDone[entry.target.id] = true;
        entry.target.querySelectorAll("[data-count]").forEach(function (el) {
          var target = parseFloat(el.dataset.count);
          var dur = 1500, start = performance.now();
          (function tick(now) {
            var p = Math.min((now - start) / dur, 1);
            var val = target * (1 - Math.pow(1 - p, 3));
            el.textContent = Number.isInteger(target) ? Math.round(val) : val.toFixed(1);
            if (p < 1) requestAnimationFrame(tick); else el.textContent = target;
          })(performance.now());
        });
      }
    });
  }, { threshold: 0.2 });
  sections.forEach(function (s) { if (s.id) counterObserver.observe(s); });

  /* ---------- scroll progress bar ---------- */
  var progress = document.getElementById("progress");
  if (progress) {
    window.addEventListener("scroll", function () {
      var h = document.documentElement.scrollHeight - innerHeight;
      progress.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%";
    });
  }

  /* ---------- project tilt ---------- */
  if (!coarse && !reduce) {
    document.querySelectorAll(".project[data-tilt]").forEach(function (card) {
      var glowEl = card.querySelector(".project-glow");
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        card.style.transform = "perspective(1200px) rotateY(" + ((px - 0.5) * 5) + "deg) rotateX(" + ((0.5 - py) * 5) + "deg) translateY(-4px)";
        if (glowEl) { glowEl.style.left = (e.clientX - r.left - 190) + "px"; glowEl.style.top = (e.clientY - r.top - 190) + "px"; }
      });
      card.addEventListener("mouseleave", function () { card.style.transform = ""; });
    });
  }

  /* ---------- back to top ---------- */
  var toTop = document.querySelector(".to-top");
  if (toTop) toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- contact form ---------- */
  var form = document.querySelector(".contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = form.querySelector(".form-msg");
      var btn = form.querySelector("button[type=submit]");
      if (btn) { btn.textContent = "Sending…"; }
      setTimeout(function () {
        if (msg) msg.textContent = "// message queued — I'll reply within 24h.";
        if (btn) btn.innerHTML = 'Send message <span class="arrow">→</span>';
        form.reset();
      }, 900);
    });
  }

  /* ---------- terminal ---------- */
  var fab = document.querySelector(".term-fab");
  var term = document.querySelector(".terminal");
  var tbody = document.querySelector(".term-body");
  var tinput = document.querySelector(".term-input input");
  if (fab && term && tbody && tinput) {
    function print(html, cls) {
      var div = document.createElement("div");
      div.className = cls || "out";
      div.innerHTML = html;
      tbody.appendChild(div);
      tbody.scrollTop = tbody.scrollHeight;
    }
    var commands = {
      help: "available: help, about, skills, projects, contact, ai, clear, sudo, social, theme",
      about: "Azhar Mehmood — AI Engineer building intelligent, automated systems\non a foundation of QA, automation & cloud (~5 yrs).",
      skills: "AI/ML · Azure OpenAI · FastAPI · Python · Selenium · Appium\n.NET 8 · React · Docker · Azure · CI/CD · TDD",
      projects: "1. AI Marketing Bot — Azure OpenAI lead-gen pipeline\n   type 'open marketing' or scroll to Projects ↑",
      contact: "email: azhar.gondal19@gmail.com\nlinkedin: /in/azhar-gondal19\nphone: +92 345 8190067",
      ai: "currently: LLM agents, RAG pipelines, prompt orchestration,\nautomated QA + cloud-native deployment on Azure.",
      social: "github.com/azhargondal · linkedin.com/in/azhar-gondal19",
      sudo: "nice try 😏 — you don't have root here.",
      theme: "dark mode is the only mode. (neon stays on)"
    };
    function run(raw) {
      var cmd = raw.trim().toLowerCase();
      print('<span class="cmd">visitor@azhar:~$</span> ' + raw, "out");
      if (!cmd) return;
      if (cmd === "clear") { tbody.innerHTML = ""; return; }
      if (cmd.startsWith("open")) {
        var el = document.getElementById("projects");
        if (el) el.scrollIntoView({ behavior: "smooth" });
        print("opening projects…");
        return;
      }
      if (commands[cmd]) print(commands[cmd]);
      else print("command not found: " + cmd + " — type 'help'");
    }
    fab.addEventListener("click", function () {
      term.classList.toggle("open");
      if (term.classList.contains("open")) setTimeout(function () { tinput.focus(); }, 200);
    });
    tinput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { run(tinput.value); tinput.value = ""; }
    });
    print('<span class="ok">●</span> connection established. type <span class="cmd">help</span> to start.');
  }

  /* ---------- konami code easter egg ---------- */
  var seq = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  var pos = 0;
  addEventListener("keydown", function (e) {
    pos = e.key.toLowerCase() === seq[pos].toLowerCase() ? pos + 1 : 0;
    if (pos === seq.length) {
      pos = 0;
      document.body.style.transition = "filter 1s";
      document.body.style.filter = "hue-rotate(120deg) saturate(1.3)";
      setTimeout(function () { document.body.style.filter = ""; }, 4000);
    }
  });
})();
