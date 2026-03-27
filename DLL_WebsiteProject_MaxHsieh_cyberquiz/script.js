const mapping = {
  q1: "GOVERN",
  q2: "GOVERN",
  q3: "IDENTIFY",
  q4: "IDENTIFY",
  q5: "PROTECT",
  q6: "PROTECT",
  q7: "DETECT",
  q8: "DETECT",
  q9: "RESPOND",
  q10: "RESPOND",
  q11: "RECOVER",
  q12: "RECOVER",
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

  for (let i = 1; i <= 12; i++) {
    if (getSelectedValue(`q${i}`) === null) {
      missing.push(`q${i}`);
    }
  }

  return missing;
}

function computeScores() {
  // Sum per category
  const sums = {};
  const counts = {};
  categories.forEach((c) => {
    sums[c] = 0;
    counts[c] = 0;
  });

  for (let i = 1; i <= 12; i++) {
    const q = `q${i}`;
    const val = getSelectedValue(q);
    const cat = mapping[q];
    sums[cat] += val;
    counts[cat] += 1;
  }

  // Convert to 0..100 (%), since max per question is 4 and count per category is 2 => max 8
  const percent = categories.map((c) =>
    Math.round((sums[c] / (counts[c] * 4)) * 100)
  );
  return { sums, counts, percent };
}

function levelFromPercent(p) {
  if (p >= 70) return "high";
  if (p >= 40) return "medium";
  return "low";
}

function renderBadges(percent) {
  const wrap = document.getElementById("scoreBadges");
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

  // Suggestions for improvement
  if (pProtect < 40) {
    steps.push(
      "Turn on MFA for email/cloud/admin accounts and enforce strong passwords."
    );
    steps.push(
      "Set a simple patching routine (e.g., weekly updates) for devices and key software."
    );
  }
  if (pIdentify < 40) {
    steps.push(
      "Create a simple inventory: devices, accounts, cloud services, and critical software."
    );
    steps.push(
      "List your most important data and where it lives (cloud drives, laptops, SaaS apps)."
    );
  }
  if (pDetect < 40) {
    steps.push(
      "Enable sign-in and security alerts in your email/cloud provider."
    );
    steps.push(
      "Create a clear way for staff to report suspicious messages (one mailbox or ticket)."
    );
  }
  if (pRespond < 40) {
    steps.push(
      "Write a 1-page incident checklist: who to call, what to shut down, what to document."
    );
    steps.push(
      "Decide who communicates with customers/partners if something serious happens."
    );
  }
  if (pRecover < 40) {
    steps.push(
      "Set regular backups for critical data and test restoring a file."
    );
    steps.push(
      "Protect backups from ransomware (offline/immutable options if possible)."
    );
  }
  if (pGovern < 40) {
    steps.push(
      "Assign a named person responsible for cybersecurity tasks (even part-time)."
    );
    steps.push(
      "Write and share 5–10 basic security rules (passwords, access, updates, data handling)."
    );
  }

  // If everything is medium/high, give “maturity” steps
  const avg = Math.round(percent.reduce((a, b) => a + b, 0) / percent.length);
  if (avg >= 70) {
    steps.push(
      "Keep improving: review policies yearly and after major IT changes."
    );
    steps.push(
      "Run a short incident exercise (tabletop) once a year to practice response."
    );
  } else if (steps.length === 0) {
    steps.push(
      "Pick one improvement this month (MFA or patching is often the best start)."
    );
    steps.push("Write down responsibilities and a simple incident checklist.");
  }

  return steps;
}

function buildSummary(percent) {
  const levels = percent.map(levelFromPercent);
  const lows = [];
  const highs = [];
  percent.forEach((p, idx) => {
    if (p < 40) lows.push(prettyLabels[idx]);
    if (p >= 70) highs.push(prettyLabels[idx]);
  });

  const avg = Math.round(percent.reduce((a, b) => a + b, 0) / percent.length);

  const pProtect = percent[2];
  const pRecover = percent[5];
  const pDetect = percent[3];
  const pRespond = percent[4];

  if (pProtect < 40 && pRecover < 40) {
    return `
      <p class="mb-2"><strong>Main risk:</strong> You may be exposed to common attacks (like phishing or ransomware) and also struggle to restore operations quickly.</p>
      <p class="mb-0">Start with protective basics (MFA + updates) and make sure backups can be restored. These are high-impact steps for small teams.</p>
    `;
  }

  if (pDetect < 40 && pRespond < 40) {
    return `
      <p class="mb-2"><strong>Main risk:</strong> Incidents could go unnoticed for too long, and when discovered the response may be improvised.</p>
      <p class="mb-0">Enable alerts and define a simple incident checklist so you can react quickly and reduce damage.</p>
    `;
  }

  if (avg >= 75) {
    return `
      <p class="mb-2"><strong>Overall:</strong> Strong baseline maturity for a small organization.</p>
      <p class="mb-0">You show good habits across most areas. Keep it sustainable: review key controls regularly and practice a simple incident scenario at least yearly.</p>
    `;
  }

  if (avg >= 50) {
    return `
      <p class="mb-2"><strong>Overall:</strong> A workable baseline with clear opportunities to strengthen.</p>
      <p class="mb-0">You have some good practices, but gaps could still lead to avoidable incidents. Focus first on your lowest areas: <strong>${
        lows.length ? lows.join(", ") : "one or two key controls"
      }</strong>.</p>
    `;
  }

  return `
    <p class="mb-2"><strong>Overall:</strong> Early-stage maturity.</p>
    <p class="mb-0">That’s common for small organizations. The fastest improvements usually come from basic protection (MFA + updates), clear responsibility, and reliable backups.</p>
  `;
}

function renderChart(percent) {
  const ctx = document.getElementById("radarChart");

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

function showResults() {
  const error = document.getElementById("quizError");
  error.classList.add("d-none");

  const missing = findUnansweredQuestions();

  // Remove previous highlights
  document
    .querySelectorAll(".question-block")
    .forEach((q) => q.classList.remove("border", "border-danger"));

if (missing.length > 0) {
  const numbers = missing.map(q => q.replace("q", ""));
  error.textContent =
    `You missed question${numbers.length > 1 ? "s" : ""}: ${numbers.join(", ")}. Please answer before viewing results.`;

  error.classList.remove("d-none");

    // Highlight missing questions
    missing.forEach((qName) => {
      const input = document.querySelector(`input[name="${qName}"]`);
      if (!input) return;
      const block = input.closest(".question-block");
      if (block) {
        block.classList.add("border", "border-danger");
      }
    });

    // Scroll to the first missing question
    const firstInput = document.querySelector(
      `input[name="${missing[0]}"]`
    );
    if (firstInput) {
      firstInput
        .closest(".question-block")
        .scrollIntoView({ behavior: "smooth", block: "center" });
    }

    return;
  }

  const { percent } = computeScores();
  document.getElementById("results").classList.remove("d-none");

  renderChart(percent);
  renderBadges(percent);

  const summary = document.getElementById("summaryText");
  summary.innerHTML = buildSummary(percent);

  const nextSteps = document.getElementById("nextSteps");
  nextSteps.innerHTML = "";
  buildNextSteps(percent).forEach((s) => {
    const li = document.createElement("li");
    li.textContent = s;
    nextSteps.appendChild(li);
  });

  document.getElementById("results").scrollIntoView({ behavior: "smooth" });
}

function resetQuiz() {
  document.getElementById("results").classList.add("d-none");

  // Clear radio buttons
  document
    .querySelectorAll('input[type="radio"]')
    .forEach((r) => (r.checked = false));

  // Clear results
  document.getElementById("scoreBadges").innerHTML = "";
  document.getElementById("summaryText").innerHTML = "";
  document.getElementById("nextSteps").innerHTML = "";

  if (radarChart) {
    radarChart.destroy();
    radarChart = null;
  }

  // Go back to first slide
  const carouselEl = document.getElementById("quizCarousel");
  const carousel = bootstrap.Carousel.getOrCreateInstance(carouselEl);
  carousel.to(0);

  updateButtonsAndProgress();
  document.getElementById("quiz").scrollIntoView({ behavior: "smooth" });
}

function updateButtonsAndProgress() {
  const carouselEl = document.getElementById("quizCarousel");
  const activeIndex = [
    ...carouselEl.querySelectorAll(".carousel-item"),
  ].findIndex((item) => item.classList.contains("active"));

  const total = carouselEl.querySelectorAll(".carousel-item").length;
  const progressBadge = document.getElementById("progressBadge");
  progressBadge.textContent = `Step ${activeIndex + 1} of ${total}`;

  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const submitBtn = document.getElementById("submitBtn");

  prevBtn.disabled = activeIndex === 0;

  // On last slide: hide Next and show Submit
  if (activeIndex === total - 1) {
    nextBtn.classList.add("d-none");
    submitBtn.classList.remove("d-none");
  } else {
    nextBtn.classList.remove("d-none");
    submitBtn.classList.add("d-none");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const carouselEl = document.getElementById("quizCarousel");
  if (!carouselEl) return;

  carouselEl.addEventListener("slid.bs.carousel", updateButtonsAndProgress);

  document.getElementById("submitBtn").addEventListener("click", showResults);
  document.getElementById("resetBtn").addEventListener("click", resetQuiz);

  updateButtonsAndProgress();
});
