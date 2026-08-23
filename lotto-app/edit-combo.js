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
    tab.click();
    const enter = main.animate([
      { transform: `translateX(${-distance}px)`, opacity: 0.08 },
      { transform: "translateX(0)", opacity: 1 }
    ], { duration: 180, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" });
    enter.onfinish = () => {
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
