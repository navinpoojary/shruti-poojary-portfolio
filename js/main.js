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

  /* ---- Scroll reveal (position-based; robust where IntersectionObserver stalls) ---- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  function revealInView() {
    if (!reveals.length) return;
    var vh = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0);
    if (!vh) { /* degenerate viewport: show everything rather than hide content */
      reveals.forEach(function (el) { el.classList.add("in"); });
      reveals = [];
      return;
    }
    var limit = vh * 0.94;
    reveals = reveals.filter(function (el) {
      if (el.getBoundingClientRect().top < limit) { el.classList.add("in"); return false; }
      return true;
    });
  }
  window.addEventListener("scroll", revealInView, { passive: true });
  window.addEventListener("resize", revealInView, { passive: true });
  window.addEventListener("load", revealInView);
  revealInView();
  /* Safety net: never leave content hidden */
  setTimeout(revealInView, 600);

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

  /* ---- Contact form (FormSubmit AJAX → shruti@shrutipoojary.com, mailto fallback) ---- */
  var form = document.querySelector(".form");
  if (form) {
    var DEST_EMAIL = "shruti@shrutipoojary.com";

    /* Build a pre-filled mailto so a message is never lost if the API is
       blocked, unverified, or silently dropping mail. */
    function mailtoFallback(name, email, subject, message) {
      var body =
        "Name: " + name + "\n" +
        "Email: " + email + "\n\n" +
        message;
      return "mailto:" + DEST_EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      /* Honeypot: real users leave this empty; bots fill it. */
      var trap = form.querySelector("[name=botcheck]");
      if (trap && trap.checked) return;

      var btn = form.querySelector("button[type=submit]");
      var original = btn.textContent;
      btn.textContent = "Sending…";
      btn.disabled = true;

      var name = form.querySelector("#name").value.trim();
      var email = form.querySelector("#email").value.trim();
      var subject = "Portfolio contact: " + (form.querySelector("#subject").value.trim() || "New message");
      var message = form.querySelector("#message").value.trim();

      function fallback() {
        btn.textContent = "Opening your email app…";
        window.location.href = mailtoFallback(name, email, subject, message);
        setTimeout(function () { btn.textContent = original; btn.disabled = false; }, 4000);
      }

      /* FormSubmit delivers to the address baked into the endpoint URL, so
         mail can only ever go to shruti@shrutipoojary.com. */
      var payload = {
        name: name,
        email: email,
        _replyto: email,
        _subject: subject,
        message: message,
        _template: "table",
        _captcha: "false",
        botcheck: ""
      };

      fetch("https://formsubmit.co/ajax/" + DEST_EMAIL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.success === "true" || data.success === true) {
            btn.textContent = "Message sent ✓";
            form.reset();
            setTimeout(function () { btn.textContent = original; btn.disabled = false; }, 4000);
          } else {
            fallback();
          }
        })
        .catch(function () {
          /* Network/API blocked — hand off to the visitor's email client. */
          fallback();
        });
    });
  }

  /* ---- Footer year ---- */
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();
