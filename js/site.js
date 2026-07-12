/**
 * DIP MCQ Lab — shared navigation & site chrome
 * NOTE: This file controls navigation/layout only.
 * MCQ text, explanations, and chapter content in HTML files must never be edited.
 */
(function () {
  "use strict";

  const CHAPTERS = [
    {
      id: 1,
      file: "chapter1.html",
      title: "OpenCV Basics",
      topic: "Image I/O, display, color channels & transforms",
      questions: 100,
      concepts: 10,
      color: "#3568e0",
    },
    {
      id: 2,
      file: "chapter2.html",
      title: "Point Processing",
      topic: "Intensity transforms, histograms & bit-planes",
      questions: 100,
      concepts: 10,
      color: "#f2a65a",
    },
    {
      id: 3,
      file: "chapter-3.html",
      title: "Convolution & Filtering",
      topic: "Kernels, smoothing, sharpening & Sobel",
      questions: 100,
      concepts: 12,
      color: "#35c9b0",
    },
    {
      id: 4,
      file: "chapter-4.html",
      title: "Edge Detection",
      topic: "Laplacian, Sobel, Prewitt & Canny",
      questions: 60,
      concepts: 6,
      color: "#ffb454",
    },
    {
      id: 5,
      file: "chapter-5.html",
      title: "Morphological Processing",
      topic: "Erosion, dilation, opening & closing",
      questions: 40,
      concepts: 7,
      color: "#3d8bff",
    },
    {
      id: 6,
      file: "chapter-6.html",
      title: "Convolution & Filtering — Overview",
      topic: "Full chapter overview — kernel size effects & general review",
      questions: 100,
      concepts: 12,
      color: "#4c8bf5",
    },
  ];

  const STORAGE_KEY = "dip-mcq-last-chapter";

  function getCurrentChapterId() {
    const body = document.body;
    const fromAttr = body.getAttribute("data-chapter");
    if (fromAttr) return parseInt(fromAttr, 10);

    const path = (window.location.pathname || "").split("/").pop() || "";
    const match = CHAPTERS.find((c) => c.file === path);
    return match ? match.id : null;
  }

  function chapterLink(ch) {
    return ch.file;
  }

  function rememberVisit(id) {
    try {
      localStorage.setItem(STORAGE_KEY, String(id));
    } catch (_) {
      /* ignore */
    }
  }

  function buildChapterLinks(currentId) {
    return CHAPTERS.map((ch) => {
      const active = ch.id === currentId ? " active" : "";
      return (
        `<li>` +
        `<a href="${chapterLink(ch)}" class="chapter-link${active}" data-chapter-id="${ch.id}">` +
        `<span class="num">${ch.id}</span>` +
        `<span class="info">` +
        `<span class="title">${ch.title}</span>` +
        `<span class="meta">${ch.questions} Q · ${ch.concepts} concepts</span>` +
        `</span>` +
        `</a>` +
        `</li>`
      );
    }).join("");
  }

  function buildDesktopNav(currentId) {
    return CHAPTERS.map((ch) => {
      const active = ch.id === currentId ? " active" : "";
      const label = `Ch ${ch.id}`;
      return `<a href="${chapterLink(ch)}" class="desktop-ch-link${active}" title="${ch.title}">${label}</a>`;
    }).join("");
  }

  function injectSiteChrome() {
    const currentId = getCurrentChapterId();
    const isHome = document.body.classList.contains("site-home");
    const current = currentId ? CHAPTERS.find((c) => c.id === currentId) : null;

    if (currentId) rememberVisit(currentId);

    const header = document.createElement("header");
    header.className = "site-header";
    header.setAttribute("role", "banner");
    header.innerHTML =
      `<a href="home.html" class="site-brand" aria-label="DIP MCQ Lab home">` +
      `<span class="site-brand-mark" aria-hidden="true"></span>` +
      `<span class="site-brand-text">` +
      `<span class="site-brand-title">DIP MCQ Lab</span>` +
      `<span class="site-brand-sub">CSE 4106 · Digital Image Processing</span>` +
      `</span>` +
      `</a>` +
      (current
        ? `<span class="site-chapter-pill">Ch ${current.id}</span>`
        : "") +
      `<nav class="site-desktop-nav" aria-label="Chapters">${buildDesktopNav(currentId)}</nav>` +
      `<button type="button" class="site-menu-btn" id="siteMenuBtn" aria-label="Open chapter menu" aria-expanded="false" aria-controls="siteDrawer">` +
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">` +
      `<path d="M4 7h16M4 12h16M4 17h16"/>` +
      `</svg>` +
      `</button>`;

    const backdrop = document.createElement("div");
    backdrop.className = "site-drawer-backdrop";
    backdrop.id = "siteDrawerBackdrop";
    backdrop.setAttribute("aria-hidden", "true");

    const drawer = document.createElement("aside");
    drawer.className = "site-drawer";
    drawer.id = "siteDrawer";
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-label", "Chapter navigation");
    drawer.innerHTML =
      `<div class="site-drawer-head">` +
      `<h2>${isHome ? "All Chapters" : "Jump to chapter"}</h2>` +
      `<button type="button" class="site-drawer-close" id="siteDrawerClose" aria-label="Close menu">×</button>` +
      `</div>` +
      `<p class="site-drawer-label">6 chapters · 500 questions</p>` +
      `<ul class="site-chapter-links">${buildChapterLinks(currentId)}</ul>` +
      `<p class="site-drawer-label" style="margin-top:18px">Site</p>` +
      `<ul class="site-chapter-links">` +
      `<li><a href="home.html"${isHome ? ' class="active"' : ""}><span class="num">⌂</span><span class="info"><span class="title">Home</span><span class="meta">Chapter overview</span></span></a></li>` +
      `</ul>`;

    document.body.insertBefore(header, document.body.firstChild);
    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);

    if (!isHome) {
      document.body.classList.add("has-chrome");
    }

    bindDrawer();
  }

  function bindDrawer() {
    const btn = document.getElementById("siteMenuBtn");
    const backdrop = document.getElementById("siteDrawerBackdrop");
    const drawer = document.getElementById("siteDrawer");
    const closeBtn = document.getElementById("siteDrawerClose");

    if (!btn || !backdrop || !drawer) return;

    function open() {
      backdrop.classList.add("open");
      drawer.classList.add("open");
      btn.setAttribute("aria-expanded", "true");
      backdrop.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function close() {
      backdrop.classList.remove("open");
      drawer.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
      backdrop.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    btn.addEventListener("click", open);
    closeBtn.addEventListener("click", close);
    backdrop.addEventListener("click", close);

    drawer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", close);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  function renderHomeCards() {
    const grid = document.getElementById("chapterGrid");
    if (!grid) return;

    let lastId = null;
    try {
      lastId = parseInt(localStorage.getItem(STORAGE_KEY), 10);
    } catch (_) {
      /* ignore */
    }

    grid.innerHTML = CHAPTERS.map((ch) => {
      const resume =
        lastId === ch.id
          ? `<span class="chapter-tag accent">Continue where you left off</span>`
          : "";
      return (
        `<a href="${chapterLink(ch)}" class="chapter-card" data-chapter="${ch.id}">` +
        `<div class="chapter-card-head">` +
        `<span class="chapter-card-num">${ch.id}</span>` +
        `<h2>${ch.title}</h2>` +
        `</div>` +
        `<p class="chapter-card-desc">${ch.topic}</p>` +
        `<div class="chapter-card-foot">` +
        `<span class="chapter-tag">${ch.questions} questions</span>` +
        `<span class="chapter-tag">${ch.concepts} concepts</span>` +
        resume +
        `<span class="chapter-card-cta">Start →</span>` +
        `</div>` +
        `</a>`
      );
    }).join("");
  }

  function init() {
    injectSiteChrome();
    renderHomeCards();

    const totalQ = CHAPTERS.reduce((s, c) => s + c.questions, 0);
    const totalC = CHAPTERS.reduce((s, c) => s + c.concepts, 0);

    const qEl = document.getElementById("homeTotalQuestions");
    const cEl = document.getElementById("homeTotalConcepts");
    const chEl = document.getElementById("homeTotalChapters");

    if (qEl) qEl.textContent = String(totalQ);
    if (cEl) cEl.textContent = String(totalC);
    if (chEl) chEl.textContent = String(CHAPTERS.length);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.DIP_SITE = { CHAPTERS, getCurrentChapterId, rememberVisit };
})();
