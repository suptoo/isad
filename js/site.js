/**
 * System Analysis and Design MCQ — shared navigation & site chrome
 */
(function () {
  "use strict";

  const CHAPTERS = [
    {
      id: 1,
      file: "chapter1.html",
      title: "Information System Analysis and Design",
      topic: "Types of systems, elements, and characteristics",
      color: "#3568e0",
    },
    {
      id: 2,
      file: "chapter2.html",
      title: "System Analysis and System Design",
      topic: "SDLC, Logical vs Physical Design, Feasibility",
      color: "#f2a65a",
    },
    {
      id: 3,
      file: "chapter-3.html",
      title: "The System Analyst",
      topic: "Roles, responsibilities, and skills required",
      color: "#35c9b0",
    },
    {
      id: 4,
      file: "chapter-4.html",
      title: "System Planning & Investigation",
      topic: "Identifying problems and fact-finding techniques",
      color: "#ffb454",
    },
    {
      id: 5,
      file: "chapter-5.html",
      title: "Information Gathering",
      topic: "Interviews, Questionnaires, and Observations",
      color: "#3d8bff",
    },
    {
      id: 6,
      file: "chapter-6.html",
      title: "Tools of Structured Analysis",
      topic: "DFD, Data Dictionary, Decision Trees",
      color: "#8b5cf6",
    },
    {
      id: 7,
      file: "chapter-7.html",
      title: "Feasibility Study",
      topic: "Technical, Economic, and Operational Evaluation",
      color: "#ec4899",
    },
    {
      id: 8,
      file: "chapter-8.html",
      title: "Evaluation Methods",
      topic: "NPV, Cash Flow, Payback Period, Break-Even",
      color: "#f43f5e",
    },
    {
      id: 9,
      file: "chapter-9.html",
      title: "System Design",
      topic: "Logical vs Physical, Coupling, and Cohesion",
      color: "#10b981",
    },
  ];

  const STORAGE_KEY = "sad-mcq-last-chapter";

  function getCurrentChapterId() {
    const params = new URLSearchParams(window.location.search);
    if (params.has("ch")) return parseInt(params.get("ch"), 10);
    return null;
  }

  function chapterLink(ch) {
    return `quiz.html?ch=${ch.id}`;
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
      `<a href="index.html" class="site-brand" aria-label="SAD MCQ Lab home">` +
      `<span class="site-brand-text">` +
      `<span class="site-brand-title">SAD MCQ Lab</span>` +
      `<span class="site-brand-sub">System Analysis and Design</span>` +
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
      `<p class="site-drawer-label">${CHAPTERS.length} chapters loaded</p>` +
      `<ul class="site-chapter-links">${buildChapterLinks(currentId)}</ul>` +
      `<p class="site-drawer-label" style="margin-top:18px">Site</p>` +
      `<ul class="site-chapter-links">` +
      `<li><a href="index.html"${isHome ? ' class="active"' : ""}><span class="num">⌂</span><span class="info"><span class="title">Home</span><span class="meta">Chapter overview</span></span></a></li>` +
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
        `<a href="${chapterLink(ch)}" class="chapter-card" style="--ch-color: ${ch.color}" data-chapter="${ch.id}">` +
        `<div class="chapter-card-head">` +
        `<span class="chapter-card-num">${ch.id}</span>` +
        `<h2>${ch.title}</h2>` +
        `</div>` +
        `<p class="chapter-card-desc">${ch.topic}</p>` +
        `<div class="chapter-card-foot">` +
        resume +
        `<span class="chapter-card-cta">Start Quiz →</span>` +
        `</div>` +
        `</a>`
      );
    }).join("");
  }

  function init() {
    injectSiteChrome();
    renderHomeCards();

    const chEl = document.getElementById("homeTotalChapters");
    if (chEl) chEl.textContent = String(CHAPTERS.length);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.SAD_SITE = { CHAPTERS, getCurrentChapterId, rememberVisit };
})();
