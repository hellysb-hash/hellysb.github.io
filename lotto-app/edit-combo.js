function comboTypeLabel(set) {
  return set.type === "ai" ? "AI 자동조합" : "수동조합";
}

function comboRoundLabel(set) {
  return set.round ? `제 ${set.round}회 예상` : "";
}

const myDetailNavigationStyle = document.createElement("style");
myDetailNavigationStyle.textContent = `
  #myDetail .round-nav {
    position: fixed;
    top: env(safe-area-inset-top);
    left: 50%;
    z-index: 40;
    width: min(100%, 560px);
    transform: translateX(-50%);
    margin: 0;
    backdrop-filter: blur(10px);
  }
  #drawDetailContent,
  #myDetailContent { padding-top: 28px; }
  #drawDetail h1,
  #myDetail h1 { margin-top: 8px; }
`;
document.head.appendChild(myDetailNavigationStyle);

const premiumAppStyle = document.createElement("style");
premiumAppStyle.textContent = `
  :root { --ink:#202334; --muted:#818391; --purple:#6f61d9; --line:#e8e6ee; --gold:#c99a28; }
  body { background:#efedf1; color:var(--ink); }
  .app { background:#faf9f7; }
  header { padding:24px 22px 18px; }
  .brand { color:#202334; font-size:22px; letter-spacing:.2px; }
  .brand b { color:#7568d9; }
  main { padding:0 18px; }
  h1 { font-size:25px; letter-spacing:-1.25px; margin:5px 0 7px; }
  h2 { font-size:17px; letter-spacing:-.5px; margin:28px 0 12px; }
  .subtitle { color:#8a8994; }
  .recent-line { margin-top:3px; }
  .refresh { border:1px solid #e4e0fa; border-radius:12px; background:#f5f2ff; color:#6557cf; box-shadow:none; padding:8px 10px; }
  .hero { position:relative; overflow:hidden; margin-top:18px; padding:21px; border:1px solid #e8e5dc; border-radius:23px; color:var(--ink); background:linear-gradient(135deg,#fffefd 0%,#faf8f2 100%); box-shadow:0 10px 26px rgba(42,35,65,.07); }
  .hero:after { content:""; position:absolute; width:150px; height:150px; right:-62px; top:-74px; border:1px solid #e9dfc1; border-radius:50%; box-shadow:0 0 0 17px #f7f2e8,0 0 0 18px #eee4cb; opacity:.55; }
  .hero .round { position:relative; z-index:1; display:inline-block; padding:5px 9px; border-radius:8px; background:#f0edff; color:#6256c7; font-weight:900; }
  .hero .date { position:relative; z-index:1; color:#8b8993; margin:8px 0 20px; }
  .hero .balls { position:relative; z-index:1; flex-wrap:nowrap; gap:clamp(3px,1.1vw,7px); }
  .hero .ball { flex:none; width:clamp(27px,8.25vw,39px); height:clamp(27px,8.25vw,39px); border:2px solid rgba(255,255,255,.8); box-shadow:0 4px 8px rgba(25,25,35,.12); font-size:clamp(11px,3vw,13px); }
  .hero .plus { flex:none; color:#777585; font-size:12px; }
  .prizes { border:1px solid #e7e5ec; border-radius:18px; box-shadow:0 7px 18px rgba(35,31,51,.045); }
  .prize { grid-template-columns:41px 1fr 1fr; padding:14px 13px; border-color:#eeecf1; }
  .prize:first-child { background:linear-gradient(90deg,#fffdf7,#fff); }
  .rank { width:31px; height:31px; border-radius:50%; background:#757584; }
  .prize:first-child .rank { background:linear-gradient(135deg,#e6bd53,#b98a20); }
  .amount { color:#363643; }
  .label { color:#93919b; }
  .history-list,.saved,.store-list { gap:10px; }
  .history,.saved-row,.store-card { border:1px solid #e8e6ed; border-radius:16px; box-shadow:0 5px 14px rgba(38,32,59,.035); }
  .history { padding:14px; }
  .history:active,.saved-row:active { transform:scale(.99); }
  .history-head { margin-bottom:11px; }
  .history .ball,.match .ball,.saved .ball { width:28px; height:28px; box-shadow:none; }
  .search,.store-select { border-color:#e2e0e8; border-radius:13px; background:#fff; box-shadow:0 4px 10px rgba(35,30,52,.025); }
  .count { margin-bottom:11px; }
  .saved-row { padding:14px; }
  .saved-meta { color:#8b8993; }
  .combo-type { border-radius:7px; padding:3px 6px; }
  .detail-hero { border-color:#e7e4ec; border-radius:19px; background:#fff; box-shadow:0 7px 18px rgba(35,31,51,.04); }
  .round-nav { background:rgba(250,249,247,.92); border-color:#e7e4eb; }
  #drawDetail .round-nav,#myDetail .round-nav { background:rgba(250,249,247,.94); }
  .round-nav button { border-color:#e2def8; background:#f5f3ff; color:#6558ca; }
  .ticket-heading { margin-top:29px; }
  .ticket-toggle { border-radius:9px; }
  .mini-ticket,.manual-slip { border-color:#e7b9ba; background:#fffaf8; box-shadow:0 5px 13px rgba(96,45,49,.035); }
  .editable-ticket .ticket-cell { background:#fffdfc; }
  .edit-save,.save { border-radius:11px; background:#6f61d9; }
  .auto { border-color:#ddd7fb; border-radius:11px; color:#6657c9; background:#f8f6ff; }
  .range-tabs button { border-radius:10px; }
  .range-tabs button.active { border-color:#7568d9; background:#f1effd; color:#6256c7; }
  .compare { border:1px solid #ebe9ef; border-radius:13px; overflow:hidden; }
  .compare th { background:#faf9fc; }
  .match { border:1px solid #eceaf0; background:#fff; border-radius:12px; }
  .store-tabs button { border-radius:10px; }
  .store-card { padding:14px; }
  nav { border:1px solid rgba(226,223,232,.94); border-bottom:0; border-radius:20px 20px 0 0; background:rgba(255,255,255,.88); box-shadow:0 -6px 22px rgba(38,31,62,.055); backdrop-filter:blur(15px); }
  .nav { position:relative; border-radius:11px; padding:6px 2px; color:#9695a0; }
  .nav i { font-size:19px; }
  .nav.active { color:#6558cf; }
  .nav.active:before { content:""; position:absolute; top:0; left:50%; width:24px; height:3px; transform:translateX(-50%); border-radius:0 0 4px 4px; background:#7568d9; }
  .toast { border-radius:13px; box-shadow:0 8px 20px rgba(30,27,42,.2); }
  .ai-recommendation { position:fixed; inset:0; z-index:100; overflow-y:auto; padding:calc(18px + env(safe-area-inset-top)) 18px calc(28px + env(safe-area-inset-bottom)); background:#faf9f7; }
  .ai-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
  .ai-close { border:0; background:transparent; color:#6558cf; padding:6px 0; font-size:14px; font-weight:900; }
  .ai-top h1 { margin:0; font-size:23px; }
  .ai-intro { margin:-11px 0 22px; color:#85838e; font-size:13px; line-height:1.55; }
  .ai-section-title { margin:22px 0 10px; color:#4a4855; font-size:13px; font-weight:900; }
  .ai-mode-grid { display:grid; grid-template-columns:1fr 1fr; gap:9px; }
  .ai-mode { min-height:102px; border:1px solid #e7e4ec; border-radius:15px; padding:13px; background:#fff; text-align:left; color:#4b4a55; }
  .ai-mode.active { border-color:#7669d8; background:#f4f2ff; box-shadow:0 6px 14px rgba(100,83,205,.1); }
  .ai-mode b { display:block; margin-bottom:6px; color:#2a2935; font-size:14px; }
  .ai-mode.active b { color:#6256c7; }
  .ai-mode span { color:#8b8994; font-size:11px; line-height:1.4; }
  .ai-range { display:grid; grid-template-columns:repeat(3,1fr); gap:7px; }
  .ai-range button { border:1px solid #e4e1e9; border-radius:10px; padding:10px 3px; background:#fff; color:#84828e; font-weight:800; font-size:12px; }
  .ai-range button.active { border-color:#7669d8; background:#f1effd; color:#6256c7; }
  .ai-filters { margin-top:17px; border:1px solid #e7e4ec; border-radius:14px; background:#fff; overflow:hidden; }
  .ai-filters summary { padding:13px; color:#555360; font-size:13px; font-weight:900; cursor:pointer; }
  .ai-filter-list { display:grid; gap:0; border-top:1px solid #efedf2; }
  .ai-filter-list label { display:flex; align-items:center; justify-content:space-between; padding:12px 13px; color:#66646e; font-size:12px; border-bottom:1px solid #f0eef3; }
  .ai-filter-list label:last-child { border-bottom:0; }
  .ai-filter-list input { accent-color:#6f61d9; width:17px; height:17px; }
  .ai-generate { width:100%; margin-top:20px; border:0; border-radius:13px; padding:15px; background:#6f61d9; color:#fff; font-size:15px; font-weight:900; box-shadow:0 9px 18px rgba(94,78,193,.2); }
  .ai-results { margin-top:23px; }
  .ai-result { width:100%; margin-top:9px; border:1px solid #e5e2eb; border-radius:15px; padding:14px; background:#fff; text-align:left; color:#34333e; box-shadow:0 5px 12px rgba(37,30,56,.035); }
  .ai-result:first-of-type { border-color:#d9d3fa; background:#faf9ff; }
  .ai-result-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; font-size:12px; }
  .ai-result-head b { color:#6357c8; font-size:14px; }
  .ai-result small { color:#97949e; }
  .ai-result .balls { gap:6px; }
  .ai-result .ball { width:31px; height:31px; font-size:11px; }
`;
document.head.appendChild(premiumAppStyle);

function myNavigator(index) {
  const previous = index + 1 < saved.length ? index + 1 : null;
  const next = index > 0 ? index - 1 : null;
  return `<div class="round-nav"><button class="my-jump" data-index="${previous ?? ''}" ${previous === null ? 'disabled' : ''} aria-label="이전 조합">‹</button><span>내 조합 ${saved.length - index}</span><button class="my-jump" data-index="${next ?? ''}" ${next === null ? 'disabled' : ''} aria-label="다음 조합">›</button></div>`;
}

function refreshMyAnalysis() {
  const box = document.getElementById("myDetailAnalysis");
  if (!box || !editing) return;
  box.innerHTML = table(matches(editing.numbers), "역대 회차 번호 일치 기록", `이 조합의 6개 번호를 역대 ${draws.length}회 당첨번호와 비교한 결과입니다.`, false);
}

function openMyDetail(index, scrollPosition = null) {
  if (!saved[index]) return;
  const restorePosition = Number.isFinite(scrollPosition) ? Math.max(0, scrollPosition) : null;
  editing = { index, numbers: [...saved[index].numbers] };
  document.getElementById("myDetailContent").innerHTML = `${myNavigator(index)}<h1>내 조합 ${saved.length - index}</h1><p class="subtitle">${comboRoundLabel(saved[index]) ? `${comboRoundLabel(saved[index])} · ` : ""}<span class="combo-type ${saved[index].type === 'ai' ? 'ai' : ''}">${comboTypeLabel(saved[index])}</span> · 번호를 눌러 조합을 수정할 수 있습니다.</p><div class="editable-ticket" data-index="${index}"></div><div id="myDetailAnalysis"></div>`;
  renderEditTicket(index);
  refreshMyAnalysis();
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("active", view.id === "myDetail"));
  document.querySelectorAll(".nav").forEach((nav) => nav.classList.toggle("active", nav.dataset.view === "mine"));
  if (restorePosition !== null) {
    window.scrollTo(0, restorePosition);
    requestAnimationFrame(() => {
      window.scrollTo(0, restorePosition);
      requestAnimationFrame(() => window.scrollTo(0, restorePosition));
    });
  } else {
    window.scrollTo(0, 0);
  }
}

let aiRecommendationSettings = { mode: "balanced", range: 100 };

function aiWeightedPick(candidates, weights) {
  let cursor = Math.random() * weights.reduce((total, weight) => total + weight, 0);
  for (let index = 0; index < candidates.length; index += 1) {
    cursor -= weights[index];
    if (cursor <= 0) return candidates[index];
  }
  return candidates[candidates.length - 1];
}

function isBalancedAiSet(numbers, filters) {
  const oddCount = numbers.filter((number) => number % 2).length;
  const lowCount = numbers.filter((number) => number <= 22).length;
  const sorted = [...numbers].sort((a, b) => a - b);
  const longestRun = sorted.reduce((run, number, index) => index && number === sorted[index - 1] + 1 ? run + 1 : 1, 1);
  const latestNumbers = draws.at(-1) ? [1,2,3,4,5,6].map((index) => Number(draws.at(-1)[`번호${index}`])) : [];
  const repeats = numbers.filter((number) => latestNumbers.includes(number)).length;
  if (filters.oddEven && (oddCount < 2 || oddCount > 4)) return false;
  if (filters.highLow && (lowCount < 2 || lowCount > 4)) return false;
  if (filters.consecutive && longestRun > 2) return false;
  if (filters.previous && repeats > 2) return false;
  return true;
}

function makeAiSet() {
  const source = aiRecommendationSettings.range === "all" ? draws : draws.slice(-aiRecommendationSettings.range);
  const frequency = Array(46).fill(0);
  const lastSeen = Array(46).fill(-1);
  source.forEach((row, index) => [1,2,3,4,5,6].forEach((key) => {
    const number = Number(row[`번호${key}`]);
    frequency[number] += 1;
    lastSeen[number] = index;
  }));
  const maxFrequency = Math.max(...frequency, 1);
  const filters = {
    oddEven: document.getElementById("aiOddEven")?.checked,
    highLow: document.getElementById("aiHighLow")?.checked,
    consecutive: document.getElementById("aiConsecutive")?.checked,
    previous: document.getElementById("aiPrevious")?.checked
  };
  for (let attempt = 0; attempt < 180; attempt += 1) {
    const numbers = [];
    while (numbers.length < 6) {
      const candidates = Array.from({ length:45 }, (_, index) => index + 1).filter((number) => !numbers.includes(number));
      const weights = candidates.map((number) => {
        const hot = frequency[number] / maxFrequency;
        const overdue = lastSeen[number] < 0 ? 1 : (source.length - 1 - lastSeen[number]) / Math.max(source.length, 1);
        if (aiRecommendationSettings.mode === "hot") return .25 + hot * 1.65 + Math.random() * .35;
        if (aiRecommendationSettings.mode === "cold") return .25 + overdue * 1.65 + Math.random() * .35;
        if (aiRecommendationSettings.mode === "pattern") return .8 + Math.random() * .5;
        return .35 + hot * .75 + overdue * .55 + Math.random() * .4;
      });
      numbers.push(aiWeightedPick(candidates, weights));
    }
    numbers.sort((a, b) => a - b);
    if (isBalancedAiSet(numbers, filters)) return numbers;
  }
  return Array.from({ length:45 }, (_, index) => index + 1).sort(() => Math.random() - .5).slice(0, 6).sort((a, b) => a - b);
}

function aiModeLabel() {
  return { balanced:"AI 균형 추천", hot:"자주 나온 번호", cold:"오래 안 나온 번호", pattern:"패턴 균형 추천" }[aiRecommendationSettings.mode];
}

function showAiRecommendations() {
  document.getElementById("aiRecommendation")?.remove();
  const overlay = document.createElement("section");
  overlay.className = "ai-recommendation";
  overlay.id = "aiRecommendation";
  overlay.innerHTML = `<div class="ai-top"><button class="ai-close" type="button" data-ai-close>‹ 수동조합</button><h1>AI 번호 추천</h1><span></span></div><p class="ai-intro">원하는 통계 기준을 고르면 조건에 맞는 번호 3개를 추천해 드려요.</p><p class="ai-section-title">추천 방식</p><div class="ai-mode-grid">${[["balanced","AI 균형 추천","빈도·미출현·구간을 고르게 반영"],["hot","자주 나온 번호","최근 출현 빈도 중심"],["cold","오래 안 나온 번호","최근 미출현 번호 중심"],["pattern","패턴 균형 추천","홀짝·고저·연속번호를 분산"]].map(([mode,title,description]) => `<button class="ai-mode ${aiRecommendationSettings.mode === mode ? "active" : ""}" type="button" data-ai-mode="${mode}"><b>${title}</b><span>${description}</span></button>`).join("")}</div><p class="ai-section-title">분석 범위</p><div class="ai-range">${[[50,"최근 50회"],[100,"최근 100회"],["all","전체 회차"]].map(([range,label]) => `<button type="button" class="${aiRecommendationSettings.range === range ? "active" : ""}" data-ai-range="${range}">${label}</button>`).join("")}</div><details class="ai-filters"><summary>세부 조건 설정</summary><div class="ai-filter-list"><label>홀짝 균형 <input id="aiOddEven" type="checkbox" checked></label><label>고저 구간 분산 <input id="aiHighLow" type="checkbox" checked></label><label>연속번호 1쌍 이하 <input id="aiConsecutive" type="checkbox" checked></label><label>직전 회차 번호 2개 이하 <input id="aiPrevious" type="checkbox" checked></label></div></details><button class="ai-generate" type="button" data-ai-generate>추천 번호 3개 만들기</button><div class="ai-results" id="aiResults"></div>`;
  document.body.appendChild(overlay);
}

function renderAiResults() {
  const results = [makeAiSet(), makeAiSet(), makeAiSet()];
  document.getElementById("aiResults").innerHTML = `<p class="ai-section-title">${aiModeLabel()} 결과</p>${results.map((numbers, index) => `<button class="ai-result" type="button" data-ai-result="${numbers.join(",")}"><div class="ai-result-head"><b>추천 ${"ABC"[index]}</b><small>이 번호로 마킹하기 ›</small></div><div class="balls">${numbers.map((number) => `<span class="ball ${cls(number)}">${number}</span>`).join("")}</div></button>`).join("")}`;
}

document.addEventListener("click", (event) => {
  const autoRecommendation = event.target.closest("#auto");
  if (autoRecommendation) {
    event.preventDefault();
    event.stopImmediatePropagation();
    showAiRecommendations();
    return;
  }

  if (event.target.closest("[data-ai-close]")) {
    event.preventDefault();
    document.getElementById("aiRecommendation")?.remove();
    return;
  }

  const aiMode = event.target.closest("[data-ai-mode]");
  if (aiMode) {
    aiRecommendationSettings.mode = aiMode.dataset.aiMode;
    showAiRecommendations();
    return;
  }

  const aiRange = event.target.closest("[data-ai-range]");
  if (aiRange) {
    aiRecommendationSettings.range = aiRange.dataset.aiRange === "all" ? "all" : Number(aiRange.dataset.aiRange);
    showAiRecommendations();
    return;
  }

  if (event.target.closest("[data-ai-generate]")) {
    event.preventDefault();
    renderAiResults();
    return;
  }

  const aiResult = event.target.closest("[data-ai-result]");
  if (aiResult) {
    selected = aiResult.dataset.aiResult.split(",").map(Number).sort((a, b) => a - b);
    selectionMode = "ai";
    document.getElementById("aiRecommendation")?.remove();
    manual();
    toast("추천 번호를 용지에 마킹했어요.");
    return;
  }

  const manualPick = event.target.closest(".pick[data-no]");
  if (manualPick) selectionMode = "manual";

  const manualSave = event.target.closest("#save");
  if (manualSave) {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (selected.length !== 6) return;
    saved.unshift({
      numbers: [...selected],
      created: new Date().toLocaleDateString("ko-KR"),
      type: selectionMode,
      round: draws.length ? Number(draws[draws.length - 1].회차) + 1 : null
    });
    localStorage.setItem("lucky645-saved", JSON.stringify(saved));
    selected = [];
    selectionMode = "manual";
    manual();
    mine();
    toast("내 조합에 저장했어요!");
    return;
  }

  const jump = event.target.closest(".my-jump");
  if (jump && jump.dataset.index !== "") {
    event.preventDefault();
    event.stopImmediatePropagation();
    openMyDetail(Number(jump.dataset.index), window.scrollY);
    return;
  }

  const editCell = event.target.closest(".edit-cell");
  if (editCell) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const index = Number(editCell.closest(".editable-ticket").dataset.index);
    if (!editing || editing.index !== index) return;
    const number = Number(editCell.dataset.number);
    if (editing.numbers.includes(number)) editing.numbers = editing.numbers.filter((value) => value !== number);
    else if (editing.numbers.length < 6) editing.numbers.push(number);
    else { toast("번호는 6개만 선택할 수 있어요."); return; }
    editing.numbers.sort((a, b) => a - b);
    renderEditTicket(index);
    refreshMyAnalysis();
    return;
  }

  const saveButton = event.target.closest(".edit-save");
  if (saveButton) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const index = Number(saveButton.dataset.index);
    if (!editing || editing.index !== index || editing.numbers.length !== 6) { toast("번호 6개를 선택해 주세요."); return; }
    saved[index].numbers = [...editing.numbers];
    localStorage.setItem("lucky645-saved", JSON.stringify(saved));
    mine();
    openMyDetail(index);
    toast("조합을 수정했어요.");
    return;
  }

  if (event.target.closest(".delete")) return;
  const row = event.target.closest(".saved-row");
  if (!row) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  openMyDetail(Number(row.dataset.i));
}, { capture: true });

document.getElementById("myBack").addEventListener("click", () => {
  editing = null;
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("active", view.id === "mine"));
  document.querySelectorAll(".nav").forEach((nav) => nav.classList.toggle("active", nav.dataset.view === "mine"));
  window.scrollTo(0, 0);
});

let swipeStart = null;
let isTabTransitioning = false;
const tabViews = ["home", "history", "manual", "mine", "stores"];

function smoothlySwitchTab(viewId, direction) {
  if (isTabTransitioning) return;
  const tab = document.querySelector(`.nav[data-view="${viewId}"]`);
  const main = document.querySelector("main");
  if (!tab || !main) return;
  isTabTransitioning = true;
  const distance = direction * 20;
  const leave = main.animate([
    { transform: "translateX(0)", opacity: 1 },
    { transform: `translateX(${distance}px)`, opacity: 0.08 }
  ], { duration: 130, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" });

  leave.onfinish = () => {
    leave.cancel();
    tab.click();
    const enter = main.animate([
      { transform: `translateX(${-distance}px)`, opacity: 0.08 },
      { transform: "translateX(0)", opacity: 1 }
    ], { duration: 180, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" });
    enter.onfinish = () => {
      enter.cancel();
      main.style.transform = "";
      main.style.opacity = "";
      isTabTransitioning = false;
    };
  };
}

document.addEventListener("touchstart", (event) => {
  if (event.touches.length !== 1) return;
  const target = event.target;
  if (target.closest("button, input, select, textarea, a, .selector, .editable-ticket")) {
    swipeStart = null;
    return;
  }
  swipeStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
}, { passive: true });

document.addEventListener("touchend", (event) => {
  if (!swipeStart || event.changedTouches.length !== 1) return;
  const end = event.changedTouches[0];
  const deltaX = end.clientX - swipeStart.x;
  const deltaY = end.clientY - swipeStart.y;
  swipeStart = null;

  if (Math.abs(deltaX) < 70 || Math.abs(deltaX) < Math.abs(deltaY) * 1.4) return;
  const active = document.querySelector(".view.active");
  const currentIndex = tabViews.indexOf(active?.id);
  if (currentIndex < 0) return;
  const nextIndex = currentIndex + (deltaX < 0 ? 1 : -1);
  if (nextIndex < 0 || nextIndex >= tabViews.length) return;
  smoothlySwitchTab(tabViews[nextIndex], deltaX < 0 ? -1 : 1);
}, { passive: true });
