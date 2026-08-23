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
  .hero .balls { position:relative; z-index:1; gap:8px; }
  .hero .ball { width:39px; height:39px; border:2px solid rgba(255,255,255,.8); box-shadow:0 4px 8px rgba(25,25,35,.12); font-size:13px; }
  .hero .plus { color:#777585; }
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

document.addEventListener("click", (event) => {
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
