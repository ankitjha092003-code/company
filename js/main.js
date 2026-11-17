/* ═══════════════════════════════════════════════════════════════
   MedEquip Equipment Rental Gurgaon — lightweight page scripts
   Slider · Mobile nav · FAQ · Reveal on scroll · Header shadow
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── Sticky header shadow ─────────────────────────────────── */
  var header = document.querySelector(".site-header");
  var navLinks = document.querySelectorAll(".main-nav a[href^='#']");
  function onScrollHeader() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
    if (window.scrollY < 120) {
      navLinks.forEach(function (l) { l.classList.remove("active"); });
    }
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ── Mobile navigation ────────────────────────────────────── */
  var navToggle = document.getElementById("nav-toggle");
  var mainNav = document.getElementById("main-nav");

  function closeNav() {
    if (!mainNav) return;
    mainNav.classList.remove("open");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "false");
      var label = navToggle.querySelector(".visually-hidden");
      if (label) label.textContent = "Open menu";
    }
  }

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      var label = navToggle.querySelector(".visually-hidden");
      if (label) label.textContent = isOpen ? "Close menu" : "Open menu";
    });

    mainNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav();
    });

    document.addEventListener("click", function (e) {
      if (
        mainNav.classList.contains("open") &&
        !mainNav.contains(e.target) &&
        !navToggle.contains(e.target)
      ) {
        closeNav();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mainNav.classList.contains("open")) {
        closeNav();
        navToggle.focus();
      }
    });
  }

  /* ── Hero slider ──────────────────────────────────────────── */
  var slider = document.getElementById("hero-slider");
  if (slider) {
    var track = document.getElementById("slider-track");
    var slides = track ? track.children : [];
    var total = slides.length;
    var dotsWrap = document.getElementById("slide-dots");
    var prevBtn = document.getElementById("slide-prev");
    var nextBtn = document.getElementById("slide-next");
    var index = 0;
    var timer = null;
    var AUTOPLAY_MS = 5000;

    if (track && total > 0) {
      // Build pagination dots
      if (dotsWrap) {
        for (var i = 0; i < total; i++) {
          var dot = document.createElement("button");
          dot.type = "button";
          dot.className = "slide-dot";
          dot.setAttribute("aria-label", "Go to slide " + (i + 1));
          dot.dataset.index = String(i);
          dotsWrap.appendChild(dot);
        }
        dotsWrap.addEventListener("click", function (e) {
          var d = e.target.closest(".slide-dot");
          if (d) goTo(parseInt(d.dataset.index, 10));
        });
      }

      function render() {
        track.style.transform = "translateX(-" + index * 100 + "%)";
        if (dotsWrap) {
          var dots = dotsWrap.children;
          for (var j = 0; j < dots.length; j++) {
            dots[j].classList.toggle("active", j === index);
            dots[j].setAttribute("aria-current", j === index ? "true" : "false");
          }
        }
      }

      function goTo(n) {
        index = (n + total) % total;
        render();
        restart();
      }

      function next() { goTo(index + 1); }
      function prev() { goTo(index - 1); }

      function restart() {
        if (timer) clearInterval(timer);
        timer = setInterval(next, AUTOPLAY_MS);
      }

      if (nextBtn) nextBtn.addEventListener("click", function () { goTo(index + 1); });
      if (prevBtn) prevBtn.addEventListener("click", function () { goTo(index - 1); });

      // Pause on hover / focus
      slider.addEventListener("mouseenter", function () { if (timer) clearInterval(timer); });
      slider.addEventListener("mouseleave", restart);
      slider.addEventListener("focusin", function () { if (timer) clearInterval(timer); });
      slider.addEventListener("focusout", restart);

      // Touch / swipe support
      var startX = 0;
      var deltaX = 0;
      var dragging = false;

      slider.addEventListener("touchstart", function (e) {
        startX = e.touches[0].clientX;
        deltaX = 0;
        dragging = true;
        if (timer) clearInterval(timer);
      }, { passive: true });

      slider.addEventListener("touchmove", function (e) {
        if (!dragging) return;
        deltaX = e.touches[0].clientX - startX;
        var offset = (deltaX / slider.offsetWidth) * 100;
        track.classList.add("no-anim");
        track.style.transform =
          "translateX(calc(-" + index * 100 + "% + " + offset + "%))";
      }, { passive: true });

      function endTouch() {
        if (!dragging) return;
        dragging = false;
        track.classList.remove("no-anim");
        if (Math.abs(deltaX) > 48) {
          if (deltaX < 0) { index = (index + 1) % total; } else { index = (index - 1 + total) % total; }
        }
        render();
        restart();
      }
      slider.addEventListener("touchend", endTouch);
      slider.addEventListener("touchcancel", endTouch);

      // Keyboard support when slider is focused
      slider.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { e.preventDefault(); next(); }
        if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      });

      // Start autoplay
      render();
      restart();
    }
  }

  /* ── FAQ accordion (exclusive open, graceful without name attr) ── */
  var faqList = document.getElementById("faq-list");
  if (faqList) {
    var items = faqList.querySelectorAll("details.faq-item");
    items.forEach(function (item) {
      item.addEventListener("toggle", function () {
        if (item.open) {
          items.forEach(function (other) {
            if (other !== item) other.open = false;
          });
        }
      });
    });
  }

  /* ── Reveal on scroll ─────────────────────────────────────── */
  var revealEls = document.querySelectorAll(".reveal");
  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ── Active nav link highlight ────────────────────────────── */
  var sections = [];
  navLinks.forEach(function (link) {
    var id = link.getAttribute("href").slice(1);
    var sec = document.getElementById(id);
    if (sec) sections.push({ link: link, section: sec });
  });

  if (sections.length && "IntersectionObserver" in window) {
    var navIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) { l.classList.remove("active"); });
            var match = sections.filter(function (s) { return s.section === entry.target; })[0];
            if (match) match.link.classList.add("active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (s) { navIo.observe(s.section); });
  }
})();
