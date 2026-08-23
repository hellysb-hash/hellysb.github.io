function comboTypeLabel(set) {
  return set.type === "ai" ? "AI 자동조합" : "수동조합";
}

function comboRoundLabel(set) {
  return set.round ? `제 ${set.round}회 예상` : "";
}

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

function openMyDetail(index) {
  if (!saved[index]) return;
  editing = { index, numbers: [...saved[index].numbers] };
  document.getElementById("myDetailContent").innerHTML = `${myNavigator(index)}<h1>내 조합 ${saved.length - index}</h1><p class="subtitle">${comboRoundLabel(saved[index]) ? `${comboRoundLabel(saved[index])} · ` : ""}<span class="combo-type ${saved[index].type === 'ai' ? 'ai' : ''}">${comboTypeLabel(saved[index])}</span> · 번호를 눌러 조합을 수정할 수 있습니다.</p><div class="editable-ticket" data-index="${index}"></div><div id="myDetailAnalysis"></div>`;
  renderEditTicket(index);
  refreshMyAnalysis();
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("active", view.id === "myDetail"));
  document.querySelectorAll(".nav").forEach((nav) => nav.classList.toggle("active", nav.dataset.view === "mine"));
  window.scrollTo(0, 0);
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
    openMyDetail(Number(jump.dataset.index));
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
