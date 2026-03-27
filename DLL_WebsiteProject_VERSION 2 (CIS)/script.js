const TOTAL_QUESTIONS = 56;

const mapping = {
  // Data (Q1–Q11)
  q1: "DETECT",
  q2: "GOVERN",
  q3: "IDENTIFY",
  q4: "PROTECT",
  q5: "PROTECT",
  q6: "PROTECT",
  q7: "PROTECT",
  q8: "PROTECT",
  q9: "PROTECT",
  q10: "RECOVER",
  q11: "RECOVER",

  // Documentation (Q12–Q22)
  q12: "GOVERN",
  q13: "GOVERN",
  q14: "GOVERN",
  q15: "GOVERN",
  q16: "GOVERN",
  q17: "GOVERN",
  q18: "GOVERN",
  q19: "GOVERN",
  q20: "GOVERN",
  q21: "GOVERN",
  q22: "GOVERN",

  // Users (Q23–Q39)
  q23: "IDENTIFY",
  q24: "IDENTIFY",
  q25: "PROTECT",
  q26: "PROTECT",
  q27: "PROTECT",
  q28: "PROTECT",
  q29: "PROTECT",
  q30: "PROTECT",
  q31: "PROTECT",
  q32: "PROTECT",
  q33: "PROTECT",
  q34: "PROTECT",
  q35: "PROTECT",
  q36: "PROTECT",
  q37: "PROTECT",
  q38: "PROTECT",
  q39: "RESPOND",

  // Technology (Q40–Q56)
  q40: "DETECT",
  q41: "IDENTIFY",
  q42: "PROTECT",
  q43: "PROTECT",
  q44: "PROTECT",
  q45: "PROTECT",
  q46: "PROTECT",
  q47: "PROTECT",
  q48: "PROTECT",
  q49: "RESPOND",
  q50: "PROTECT",
  q51: "IDENTIFY",
  q52: "IDENTIFY",
  q53: "PROTECT",
  q54: "PROTECT",
  q55: "PROTECT",
  q56: "RESPOND",
};

const categories = [
  "GOVERN",
  "IDENTIFY",
  "PROTECT",
  "DETECT",
  "RESPOND",
  "RECOVER",
];

const prettyLabels = [
  "Govern",
  "Identify",
  "Protect",
  "Detect",
  "Respond",
  "Recover",
];

let radarChart = null;

function getSelectedValue(name) {
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el ? Number(el.value) : null;
}

function findUnansweredQuestions() {
  const missing = [];

  for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
    if (getSelectedValue(`q${i}`) === null) {
      missing.push(`q${i}`);
    }
  }

  return missing;
}
function getFunctionComment(func, percent) {
  if (percent >= 70) {
    return `This area demonstrates strong cybersecurity maturity. Controls are well implemented and maintained. Continue regular monitoring and incremental improvements.`;
  }

  if (percent >= 40) {
    return `This area shows moderate cybersecurity maturity. Some controls are in place, but improvements are needed to strengthen consistency and coverage.`;
  }

  return `This area shows a low level of cybersecurity maturity. Key controls are either missing or not consistently applied, increasing risk exposure. Immediate improvement is recommended.`;
}

function getFunctionRecommendations(func, percent) {
  if (percent >= 70) return [];

  const recs = {
    GOVERN: [
      "Define and document security policies",
      "Assign clear security responsibilities",
    ],
    IDENTIFY: [
      "Maintain asset and user inventories",
      "Identify critical systems and data",
    ],
    PROTECT: [
      "Implement MFA and access controls",
      "Apply regular patching and updates",
    ],
    DETECT: [
      "Enable logging and monitoring",
      "Use antivirus and threat detection tools",
    ],
    RESPOND: [
      "Define incident response procedures",
      "Assign roles for incident handling",
    ],
    RECOVER: [
      "Implement secure backups",
      "Test recovery processes regularly",
    ],
  };

  return recs[func] || [];
}

function computeScores() {
  const sums = {};
  const counts = {};

  categories.forEach((c) => {
    sums[c] = 0;
    counts[c] = 0;
  });

  for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
    const q = `q${i}`;
    const val = getSelectedValue(q);
    const cat = mapping[q];

    if (cat && val !== null) {
      sums[cat] += val;
      counts[cat] += 1;
    }
  }

  const percent = categories.map((c) => {
    if (counts[c] === 0) return 0;
    return Math.round((sums[c] / (counts[c] * 4)) * 100);
  });

  return { sums, counts, percent };
}

function levelFromPercent(p) {
  if (p >= 70) return "high";
  if (p >= 40) return "medium";
  return "low";
}

function renderBadges(percent) {
  const wrap = document.getElementById("scoreBadges");
  if (!wrap) return;

  wrap.innerHTML = "";

  categories.forEach((c, idx) => {
    const p = percent[idx];
    const level = levelFromPercent(p);

    const cls =
      level === "high"
        ? "text-bg-success"
        : level === "medium"
        ? "text-bg-warning"
        : "text-bg-danger";

    const span = document.createElement("span");
    span.className = `badge ${cls} px-3 py-2`;
    span.textContent = `${prettyLabels[idx]}: ${p}%`;

    wrap.appendChild(span);
  });

}
function buildNextSteps(percent) {
  const steps = [];

  const pGovern = percent[0];
  const pIdentify = percent[1];
  const pProtect = percent[2];
  const pDetect = percent[3];
  const pRespond = percent[4];
  const pRecover = percent[5];

  if (pProtect < 40) {
    steps.push(
      "Strengthen protection measures such as MFA, access controls, secure configurations, and regular patching."
    );
    steps.push(
      "Review how devices, software, and sensitive data are protected in daily operations."
    );
  }

  if (pIdentify < 40) {
    steps.push(
      "Improve visibility over accounts, assets, software, and important data by maintaining accurate inventories."
    );
    steps.push(
      "Make sure critical systems and information are clearly identified and kept up to date."
    );
  }

  if (pDetect < 40) {
    steps.push(
      "Improve logging, monitoring, and anti-malware coverage so suspicious activity can be identified more quickly."
    );
    steps.push(
      "Ensure alerts and audit logs are enabled and reviewed consistently."
    );
  }

  if (pRespond < 40) {
    steps.push(
      "Define who is responsible for incident response and how unauthorized assets or software will be handled."
    );
    steps.push(
      "Create a simple incident response process with clear actions and responsibilities."
    );
  }

  if (pRecover < 40) {
    steps.push(
      "Strengthen backup and recovery arrangements, including secure backup storage and isolated recovery copies."
    );
    steps.push(
      "Test whether important data can actually be restored when needed."
    );
  }

  if (pGovern < 40) {
    steps.push(
      "Improve governance by documenting key processes such as data management, secure configuration, access control, and incident reporting."
    );
    steps.push(
      "Review whether security responsibilities, policies, and procedures are clearly defined and maintained."
    );
  }

  const avg = Math.round(percent.reduce((a, b) => a + b, 0) / percent.length);

  if (avg >= 70) {
    steps.push(
      "Continue reviewing documented processes regularly and update them when systems or risks change."
    );
    steps.push(
      "Periodically test response and recovery arrangements to maintain resilience."
    );
  } else if (steps.length === 0) {
    steps.push(
      "Focus first on the lowest-scoring area and address a few practical improvements there."
    );
    steps.push(
      "Document responsibilities, maintain inventories, and strengthen protective controls step by step."
    );
  }

  return steps;
}

function buildSummary(percent) {
  const lows = [];

  percent.forEach((p, idx) => {
    if (p < 40) lows.push(prettyLabels[idx]);
  });

  const avg = Math.round(percent.reduce((a, b) => a + b, 0) / percent.length);

  const pProtect = percent[2];
  const pRecover = percent[5];
  const pDetect = percent[3];
  const pRespond = percent[4];

  if (pProtect < 40 && pRecover < 40) {
    return `
      <p class="mb-2"><strong>Main risk:</strong> The organization may struggle both to prevent common attacks and to recover effectively if an incident occurs.</p>
      <p class="mb-0">Priority should be given to improving protection controls and ensuring backup and recovery arrangements are reliable.</p>
    `;
  }

  if (pDetect < 40 && pRespond < 40) {
    return `
      <p class="mb-2"><strong>Main risk:</strong> Security incidents may not be identified quickly, and the response may be unclear or delayed.</p>
      <p class="mb-0">Improving monitoring, logging, reporting, and response responsibilities would reduce this risk.</p>
    `;
  }

  if (avg >= 75) {
    return `
      <p class="mb-2"><strong>Overall:</strong> Strong baseline cybersecurity maturity for a small organization.</p>
      <p class="mb-0">The results suggest good coverage across the six security functions. Continued review and maintenance will help sustain this position.</p>
    `;
  }

  if (avg >= 50) {
    return `
      <p class="mb-2"><strong>Overall:</strong> A reasonable baseline with clear areas for improvement.</p>
      <p class="mb-0">Some important safeguards are in place, but weaker areas such as <strong>${
        lows.length ? lows.join(", ") : "selected security functions"
      }</strong> should be prioritized next.</p>
    `;
  }

  return `
    <p class="mb-2"><strong>Overall:</strong> Early-stage cybersecurity maturity.</p>
    <p class="mb-0">This suggests that several foundational controls are still developing. A practical next step is to strengthen governance, protection, and recovery measures first.</p>
  `;
}

function renderChart(percent) {
  const ctx = document.getElementById("radarChart");
  if (!ctx) return;

  const data = {
    labels: prettyLabels,
    datasets: [
      {
        label: "Maturity (0–100)",
        data: percent,
        fill: true,
        borderWidth: 2,
        pointRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: { stepSize: 20 },
        pointLabels: { font: { size: 14 } },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.parsed.r}%`,
        },
      },
    },
  };

  if (radarChart) radarChart.destroy();
  radarChart = new Chart(ctx, { type: "radar", data, options });
}

function scrollQuizToTop() {
  const quizCard = document.getElementById("quizCard");
  if (!quizCard) return;

  const offset = 90;
  const top = quizCard.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({
    top,
    behavior: "smooth",
  });
}

function getQuestionSlideIndex(questionName) {
  const input = document.querySelector(`input[name="${questionName}"]`);
  if (!input) return 0;

  const slide = input.closest(".carousel-item");
  if (!slide) return 0;

  const slides = [...document.querySelectorAll("#quizCarousel .carousel-item")];
  return slides.indexOf(slide);
}

function countAnsweredQuestions() {
  let answered = 0;

  for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
    if (getSelectedValue(`q${i}`) !== null) {
      answered += 1;
    }
  }

  return answered;
}

function updateQuestionProgress() {
  const answered = countAnsweredQuestions();
  const percent = Math.round((answered / TOTAL_QUESTIONS) * 100);

  const progressBar = document.getElementById("questionProgressBar");
  const progressText = document.getElementById("questionProgressText");

  if (progressBar) {
    progressBar.style.width = `${percent}%`;
    progressBar.setAttribute("aria-valuenow", answered);
  }

  if (progressText) {
    progressText.textContent = `${answered} of ${TOTAL_QUESTIONS} questions answered`;
  }
}

function showResults() {
  const error = document.getElementById("quizError");
  if (error) error.classList.add("d-none");

   const missing = findUnansweredQuestions();

   document
     .querySelectorAll(".question-block")
     .forEach((q) => q.classList.remove("border", "border-danger"));

   if (missing.length > 0) {
     const numbers = missing.map((q) => q.replace("q", ""));

     if (error) {
       error.textContent = `You missed question${numbers.length > 1 ? "s" : ""}: ${numbers.join(", ")}. Please answer before viewing results.`;
       error.classList.remove("d-none");
     }

     missing.forEach((qName) => {
       const input = document.querySelector(`input[name="${qName}"]`);
       if (!input) return;

      const block = input.closest(".question-block");
      if (block) {
        block.classList.add("border", "border-danger");
      }
    });

    const carouselEl = document.getElementById("quizCarousel");
    const carousel = bootstrap.Carousel.getOrCreateInstance(carouselEl);
    const firstMissingSlideIndex = getQuestionSlideIndex(missing[0]);

    carousel.to(firstMissingSlideIndex);

    setTimeout(() => {
      const firstInput = document.querySelector(`input[name="${missing[0]}"]`);
      if (firstInput) {
        firstInput.closest(".question-block").scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 500);

    return;
  }

  const { percent } = computeScores();
  const results = document.getElementById("results");
  if (results) results.classList.remove("d-none");

  renderChart(percent);
  renderBadges(percent);

  const summary = document.getElementById("summaryText");
  if (summary) {
    summary.innerHTML = buildSummary(percent);
  }

  const nextSteps = document.getElementById("nextSteps");
  if (nextSteps) {
    nextSteps.innerHTML = "";
    buildNextSteps(percent).forEach((s) => {
      const li = document.createElement("li");
      li.textContent = s;
      nextSteps.appendChild(li);
    });
  }

  if (results) {
    results.scrollIntoView({ behavior: "smooth" });
  }
}

function resetQuiz() {
  
  const results = document.getElementById("results");
  if (results) results.classList.add("d-none");

  document
    .querySelectorAll('input[type="radio"]')
    .forEach((r) => (r.checked = false));

  document
    .querySelectorAll(".question-block")
    .forEach((q) => q.classList.remove("border", "border-danger"));

  const scoreBadges = document.getElementById("scoreBadges");
  const summaryText = document.getElementById("summaryText");
  const nextSteps = document.getElementById("nextSteps");
  const quizError = document.getElementById("quizError");

  if (scoreBadges) scoreBadges.innerHTML = "";
  if (summaryText) summaryText.innerHTML = "";
  if (nextSteps) nextSteps.innerHTML = "";
  if (quizError) quizError.classList.add("d-none");

  if (radarChart) {
    radarChart.destroy();
    radarChart = null;
  }

  const carouselEl = document.getElementById("quizCarousel");
  const carousel = bootstrap.Carousel.getOrCreateInstance(carouselEl);
  carousel.to(0);

  updateButtonsAndProgress();
  updateQuestionProgress();
  scrollQuizToTop();
}

function updateButtonsAndProgress() {
  const carouselEl = document.getElementById("quizCarousel");
  if (!carouselEl) return;

  const slides = [...carouselEl.querySelectorAll(".carousel-item")];
  const activeIndex = slides.findIndex((item) => item.classList.contains("active"));
  const total = slides.length;

  const progressBadge = document.getElementById("progressBadge");
  if (progressBadge) {
    progressBadge.textContent = `Step ${activeIndex + 1} of ${total}`;
  }

  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const submitBtn = document.getElementById("submitBtn");

  if (prevBtn) {
    prevBtn.disabled = activeIndex === 0;
  }

  if (nextBtn && submitBtn) {
    if (activeIndex === total - 1) {
      nextBtn.classList.add("d-none");
      submitBtn.classList.remove("d-none");
    } else {
      nextBtn.classList.remove("d-none");
      submitBtn.classList.add("d-none");
    }
  }
}
function getLevelColor(level) {
  if (level === "High") return "#198754";   // green (Bootstrap success)
  if (level === "Medium") return "#ffc107"; // yellow (Bootstrap warning)
  return "#dc3545";                         // red (Bootstrap danger)
}

function getLevelTextColor(level) {
  if (level === "Medium") return "#000000"; // black text on yellow
  return "#ffffff"; // white text on green/red
}
function downloadPdfReport() {
  const { percent } = computeScores();

  const avg = Math.round(percent.reduce((a, b) => a + b, 0) / percent.length);

  const levels = percent.map(p => {
    if (p >= 70) return "High";
    if (p >= 40) return "Medium";
    return "Low";
  });

  

  const chartCanvas = document.getElementById("radarChart");
  const chartImage = chartCanvas ? chartCanvas.toDataURL("image/png") : null;

const docDefinition = {
  content: [
    {
      text: "Cybersecurity Assessment Report",
      style: "header",
      alignment: "center"
    },

    {
      text: "Generated Report",
      style: "subheader",
      alignment: "center",
      margin: [0, 0, 0, 20]
    },



    {
      text: "Overall Summary",
      style: "sectionHeader"
    },

    {
      text: `The organisation has an overall cybersecurity maturity score of ${avg}%.`,
      style: "body"
    },
...(chartImage ? [{
  image: chartImage,
  width: 300,
  alignment: "center",
  margin: [0, 10, 0, 20]
}] : []),
    {
      text: "Assessment Results by Function",
      style: "sectionHeader"
    },

    {
      table: {
        widths: ["*", "auto", "auto"],
      body: [
  ["Function", "Score", "Level"],

  [
    "Govern",
    `${percent[0]}%`,
    {
      text: levels[0],
      color: getLevelTextColor(levels[0]),
      fillColor: getLevelColor(levels[0]),
      bold: true,
      alignment: "center",
      margin: [4, 2, 4, 2]
    }
  ],
  [
    "Identify",
    `${percent[1]}%`,
    {
      text: levels[1],
      color: getLevelTextColor(levels[1]),
      fillColor: getLevelColor(levels[1]),
      bold: true,
      alignment: "center",
      margin: [4, 2, 4, 2]
    }
  ],
  [
    "Protect",
    `${percent[2]}%`,
    {
      text: levels[2],
      color: getLevelTextColor(levels[2]),
      fillColor: getLevelColor(levels[2]),
      bold: true,
      alignment: "center",
      margin: [4, 2, 4, 2]
    }
  ],
  [
    "Detect",
    `${percent[3]}%`,
    {
      text: levels[3],
      color: getLevelTextColor(levels[3]),
      fillColor: getLevelColor(levels[3]),
      bold: true,
      alignment: "center",
      margin: [4, 2, 4, 2]
    }
  ],
  [
    "Respond",
    `${percent[4]}%`,
    {
      text: levels[4],
      color: getLevelTextColor(levels[4]),
      fillColor: getLevelColor(levels[4]),
      bold: true,
      alignment: "center",
      margin: [4, 2, 4, 2]
    }
  ],
  [
    "Recover",
    `${percent[5]}%`,
    {
      text: levels[5],
      color: getLevelTextColor(levels[5]),
      fillColor: getLevelColor(levels[5]),
      bold: true,
      alignment: "center",
      margin: [4, 2, 4, 2]
    }
  ],
]
      },
      layout: "lightHorizontalLines",
      margin: [0, 10, 0, 20]
    },
        {
  text: "Detailed Analysis by Function",
  style: "sectionHeader",
  pageBreak: "before"
},

...categories.map((func, idx) => {
  const p = percent[idx];
  const comment = getFunctionComment(func, p);
  const recs = getFunctionRecommendations(func, p);

  return [
    {
      text: `${prettyLabels[idx]} — ${p}% (${levels[idx]})`,
      style: "subSectionHeader"
    },
    {
      text: comment,
      style: "body"
    },
    ...(recs.length > 0 ? [{
      ul: recs,
        margin: [0, 5, 0, 15]
}] : [{
  text: "",
  margin: [0, 0, 0, 10]
}])
  ];
}).flat(),

{
  text: "Methodology and Grouping Approach",
  style: "sectionHeader",
  pageBreak: "before"
},

{
  text: "This assessment was developed using selected safeguards from the CIS Critical Security Controls version 8.1.2, Implementation Group 1 (IG1). In this implementation, each safeguard was translated into one assessment question, resulting in a total of 56 questions.",
  style: "body"
},

{
  text: "Question Grouping Used in This Assessment",
  style: "subSectionHeader"
},

{
  ul: [
    "Users — 17 questions",
    "Data — 11 questions",
    "Documentation — 11 questions",
    "Technology — 17 questions (Software: 6, Devices: 10, Network: 1)"
  ],
  margin: [0, 5, 0, 15]
},

{
  text: "Why Software, Devices, and Network Were Combined into Technology",
  style: "subSectionHeader"
},

{
  text: "In small and medium-sized organisations, software, devices, and network infrastructure are typically managed together as part of the overall technology environment. Many cybersecurity practices across these areas overlap, including patching, secure configuration, access control, and system monitoring. For this reason, these asset classes were combined into a single “Technology” category to provide a clearer and more practical assessment structure.",
  style: "body"
},
  ],

  styles: {
    header: {
      fontSize: 22,
      bold: true,
      color: "#031325"
    },
    subheader: {
      fontSize: 12,
      color: "gray"
    },
    sectionHeader: {
      fontSize: 16,
      bold: true,
      color: "#235594",
      margin: [0, 15, 0, 5]
    },
    subSectionHeader: {
  fontSize: 13,
  bold: true,
  margin: [0, 10, 0, 3]
},
    body: {
      fontSize: 12,
      lineHeight: 1.3,
      margin: [0, 0, 0, 10]
    }
  }
};

  pdfMake.createPdf(docDefinition).download("cybersecurity-report.pdf");
}
document.addEventListener("DOMContentLoaded", () => {
  const carouselEl = document.getElementById("quizCarousel");
  if (!carouselEl) return;

  carouselEl.addEventListener("slid.bs.carousel", () => {
    updateButtonsAndProgress();
    scrollQuizToTop();
  });

  document.querySelectorAll('input[type="radio"]').forEach((input) => {
    input.addEventListener("change", updateQuestionProgress);
  });

  const submitBtn = document.getElementById("submitBtn");
  const resetBtn = document.getElementById("resetBtn");

  if (submitBtn) {
    submitBtn.addEventListener("click", showResults);
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", resetQuiz);
  }

  updateButtonsAndProgress();
  updateQuestionProgress();

  const downloadPdfBtn = document.getElementById("downloadPdfBtn");

if (downloadPdfBtn) {
  downloadPdfBtn.addEventListener("click", downloadPdfReport);
}
const skipToLastBtn = document.getElementById("skipToLastBtn");

if (skipToLastBtn) {
  skipToLastBtn.addEventListener("click", () => {
    const carouselEl = document.getElementById("quizCarousel");
    const carousel = bootstrap.Carousel.getOrCreateInstance(carouselEl);

    const slides = carouselEl.querySelectorAll(".carousel-item");
    const lastIndex = slides.length - 1;

    carousel.to(lastIndex);
  });
}

});

