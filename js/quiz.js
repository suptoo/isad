(function () {
  "use strict";

  // Elements
  const chapterTitle = document.getElementById("chapterTitle");
  const chapterStats = document.getElementById("chapterStats");
  const chapterReview = document.getElementById("chapterReview");
  const mcqList = document.getElementById("mcqList");
  
  // State
  let currentChapter = null;
  let mcqData = [];

  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  async function loadChapter() {
    const chId = getQueryParam("ch");
    if (!chId) {
      mcqList.innerHTML = `<div class="error-state">No chapter specified. <a href="index.html">Go Home</a></div>`;
      return;
    }

    const chapterConfig = window.SAD_SITE.CHAPTERS.find(c => c.id == chId);
    if (!chapterConfig) {
      mcqList.innerHTML = `<div class="error-state">Chapter not found. <a href="index.html">Go Home</a></div>`;
      return;
    }

    if (window.SAD_SITE && window.SAD_SITE.rememberVisit) {
      window.SAD_SITE.rememberVisit(chId);
    }

    chapterTitle.textContent = `Chapter ${chapterConfig.id}: ${chapterConfig.title}`;
    document.title = `SAD MCQ - Ch ${chapterConfig.id}`;
    
    // Set theme color variable
    document.documentElement.style.setProperty('--ch-color', chapterConfig.color);

    try {
      const response = await fetch(chapterConfig.file);
      if (!response.ok) throw new Error("Failed to fetch chapter file.");
      
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch(e) {
        throw new Error("Invalid JSON data in chapter file.");
      }

      parseAndRender(data, chapterConfig);
    } catch (error) {
      console.error(error);
      mcqList.innerHTML = `<div class="error-state">Error loading chapter data.</div>`;
    }
  }

  function parseAndRender(data, chapterConfig) {
    // Data normalization. Some files are arrays, some are objects containing 'mcqs' array.
    let mcqs = [];
    let overviewHTML = "";

    // Helper to extract mcqs from an object
    function extractFromObj(obj) {
      if (obj.mcqs && Array.isArray(obj.mcqs)) mcqs.push(...obj.mcqs);
      if (obj.quiz && Array.isArray(obj.quiz)) mcqs.push(...obj.quiz);
      if (obj.questions && Array.isArray(obj.questions)) mcqs.push(...obj.questions);
    }

    // If data is an array, we separate the overview object from mcq objects.
    if (Array.isArray(data)) {
      data.forEach(item => {
        if (item.question && item.options) {
          mcqs.push(item);
        } else {
          extractFromObj(item);
          if (item.chapter || item.review || item.overview || item.chapter_review) {
            // This is an overview object
            const html = buildOverviewHTML(item);
            if (html) overviewHTML += html;
          }
        }
      });
    } else if (typeof data === 'object') {
      // If it's an object, look for 'mcqs' or 'quiz'
      extractFromObj(data);
      overviewHTML = buildOverviewHTML(data);
    }

    if (overviewHTML) {
      chapterReview.innerHTML = overviewHTML;
      chapterReview.style.display = "block";
    }

    if (mcqs.length === 0) {
      mcqList.innerHTML = `<div class="empty-state">No MCQs found for this chapter.</div>`;
      return;
    }

    chapterStats.innerHTML = `<span class="stat-badge">${mcqs.length} Questions</span>`;

    renderMCQs(mcqs);
  }

  function buildOverviewHTML(item) {
    let html = "";
    
    const title = item.title || item.chapter || (item.chapter_review && item.chapter_review.chapter_name);
    if (title && typeof title === 'string') {
      html += `<h2>${title}</h2>`;
    }

    const review = item.review || item.overview || (item.chapter_review && item.chapter_review.overview);
    
    if (typeof review === 'string') {
      html += `<p>${review}</p>`;
    } else if (typeof review === 'object') {
      if (review.summary && typeof review.summary === 'string') html += `<p>${review.summary}</p>`;
      if (Array.isArray(review.summary)) {
        html += `<ul>${review.summary.map(s => `<li>${s}</li>`).join('')}</ul>`;
      }
      
      const topics = review.important_topics || review.keyTopics;
      if (Array.isArray(topics)) {
        html += `<h3>Important Topics</h3><ul>${topics.map(t => `<li>${t}</li>`).join('')}</ul>`;
      }
    }
    
    return html;
  }

  // Fisher-Yates Shuffle
  function shuffleArray(array) {
    let curId = array.length;
    // There remain elements to shuffle
    while (0 !== curId) {
      // Pick a remaining element
      let randId = Math.floor(Math.random() * curId);
      curId -= 1;
      // Swap it with the current element.
      let tmp = array[curId];
      array[curId] = array[randId];
      array[randId] = tmp;
    }
    return array;
  }

  function normalizeOptions(optionsData, answerData, correctOptionData) {
    let normalized = [];
    
    // Some JSON uses object { "A": "Opt1", "B": "Opt2" }
    // Others use array ["Opt1", "Opt2"]
    if (Array.isArray(optionsData)) {
      optionsData.forEach((optText, index) => {
        let isCorrect = false;
        // Answer could be 0-based index or 1-based index or string match
        if (typeof answerData === 'number') {
           // Check if it's 0-based or 1-based. If answer is matching the exact index:
           if (answerData === index || answerData === index + 1) {
              // Wait, strictly we must know. Let's assume if answer matches index exactly, it's correct (0-based).
              // If we see 1-based, we'd need a heuristic, but most are 0-based or use explicit correctOption string.
           }
           if (answerData === index) isCorrect = true;
           // Wait, some chapters might use 1-based. Let's check correctOptionData fallback.
        }
        
        if (correctOptionData && optText.trim() === correctOptionData.trim()) {
          isCorrect = true;
        }

        // Sometimes answer is a string but options is array (e.g., answer: "2")
        if (typeof answerData === 'string' && parseInt(answerData, 10) === index) {
          isCorrect = true;
        }
        // Fallback for 1-based if it's explicitly 1-based and 0-based didn't match anything?
        // Let's rely on correctOption if available, else 0-based index matching.
        
        normalized.push({ text: optText, isCorrect, originalKey: index });
      });
      
      // Heuristic: if none is marked correct but answerData is an integer, assume it's 1-based.
      if (!normalized.some(n => n.isCorrect) && typeof answerData === 'number' && answerData > 0 && answerData <= normalized.length) {
        normalized[answerData - 1].isCorrect = true;
      }
    } else if (typeof optionsData === 'object') {
      for (const [key, text] of Object.entries(optionsData)) {
        let isCorrect = false;
        if (answerData === key) isCorrect = true;
        if (correctOptionData && text.trim() === correctOptionData.trim()) isCorrect = true;
        
        normalized.push({ text, isCorrect, originalKey: key });
      }
    }

    return normalized;
  }

  function renderMCQs(mcqs) {
    mcqList.innerHTML = "";
    
    mcqs.forEach((mcq, i) => {
      const qContainer = document.createElement("div");
      qContainer.className = "mcq-card";
      
      const qHeader = document.createElement("div");
      qHeader.className = "mcq-header";
      qHeader.innerHTML = `<span class="mcq-num">Q${i + 1}</span>`;
      
      const qText = document.createElement("div");
      qText.className = "mcq-question";
      qText.textContent = mcq.question;
      
      const optsContainer = document.createElement("div");
      optsContainer.className = "mcq-options";
      
      let normalizedOptions = normalizeOptions(mcq.options, mcq.answer, mcq.correctOption || mcq.correctAnswer);
      
      // Shuffle options to randomize answers!
      normalizedOptions = shuffleArray(normalizedOptions);

      let explanationText = "";
      if (mcq.explanation) {
        if (typeof mcq.explanation === 'string') explanationText = mcq.explanation;
        else if (mcq.explanation.english) explanationText = mcq.explanation.english;
      } else if (mcq.explanation_bn) {
        explanationText = mcq.explanation_bn;
      }

      const expContainer = document.createElement("div");
      expContainer.className = "mcq-explanation";
      expContainer.innerHTML = `<strong>Explanation:</strong> ${explanationText || "No explanation provided."}`;
      
      let answered = false;

      normalizedOptions.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "mcq-option-btn";
        btn.innerHTML = `<span class="opt-text">${opt.text}</span>`;
        
        btn.addEventListener("click", () => {
          if (answered) return;
          answered = true;
          
          optsContainer.classList.add("answered");
          expContainer.classList.add("show");

          // Reveal all correct/incorrect
          Array.from(optsContainer.children).forEach(childBtn => {
             const isBtnCorrect = childBtn.dataset.correct === "true";
             if (isBtnCorrect) {
               childBtn.classList.add("correct");
             } else if (childBtn === btn) {
               childBtn.classList.add("incorrect");
             } else {
               childBtn.classList.add("faded");
             }
          });
        });
        
        btn.dataset.correct = opt.isCorrect;
        optsContainer.appendChild(btn);
      });

      qContainer.appendChild(qHeader);
      qContainer.appendChild(qText);
      qContainer.appendChild(optsContainer);
      qContainer.appendChild(expContainer);
      mcqList.appendChild(qContainer);
    });
  }

  document.addEventListener("DOMContentLoaded", loadChapter);
})();
