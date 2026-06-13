/* Shruti Poojary — Portfolio interactions */
(function () {
  "use strict";

  /* ---- Sticky header state ---- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile nav ---- */
  var toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      document.body.classList.toggle("nav-open");
      var open = document.body.classList.contains("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    a.addEventListener("click", function () { document.body.classList.remove("nav-open"); });
  });

  /* ---- Scroll reveal ---- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Lightbox gallery ---- */
  var figures = Array.prototype.slice.call(document.querySelectorAll(".gallery figure"));
  if (figures.length) {
    var items = figures.map(function (f) {
      var img = f.querySelector("img");
      var cap = f.querySelector("figcaption");
      return { src: img.getAttribute("data-full") || img.src, alt: img.alt, cap: cap ? cap.textContent : "" };
    });

    var lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML =
      '<button class="lb-close" aria-label="Close">✕</button>' +
      '<button class="lb-nav lb-prev" aria-label="Previous">‹</button>' +
      '<img alt="">' +
      '<button class="lb-nav lb-next" aria-label="Next">›</button>' +
      '<div class="lb-count"></div>';
    document.body.appendChild(lb);

    var lbImg = lb.querySelector("img");
    var lbCount = lb.querySelector(".lb-count");
    var idx = 0;

    function show(i) {
      idx = (i + items.length) % items.length;
      lbImg.src = items[idx].src;
      lbImg.alt = items[idx].alt;
      lbCount.textContent = (idx + 1) + " / " + items.length + (items[idx].cap ? "  ·  " + items[idx].cap : "");
    }
    function open(i) { show(i); lb.classList.add("open"); document.body.style.overflow = "hidden"; }
    function close() { lb.classList.remove("open"); document.body.style.overflow = ""; }

    figures.forEach(function (f, i) {
      f.addEventListener("click", function () { open(i); });
    });
    lb.querySelector(".lb-close").addEventListener("click", close);
    lb.querySelector(".lb-prev").addEventListener("click", function (e) { e.stopPropagation(); show(idx - 1); });
    lb.querySelector(".lb-next").addEventListener("click", function (e) { e.stopPropagation(); show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(idx - 1);
      else if (e.key === "ArrowRight") show(idx + 1);
    });
  }

  /* ---- Contact form (front-end only) ---- */
  var form = document.querySelector(".form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector("button[type=submit]");
      var original = btn.textContent;
      btn.textContent = "Message sent ✓";
      btn.disabled = true;
      form.reset();
      setTimeout(function () { btn.textContent = original; btn.disabled = false; }, 3200);
    });
  }

  /* ---- Footer year ---- */
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();
