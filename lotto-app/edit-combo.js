document.addEventListener("click", (event) => {
  const editCell = event.target.closest(".edit-cell");
  if (editCell) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const index = Number(editCell.closest(".editable-ticket").dataset.index);
    if (!editing || editing.index !== index) return;
    const number = Number(editCell.dataset.number);
    if (editing.numbers.includes(number)) {
      editing.numbers = editing.numbers.filter((value) => value !== number);
    } else if (editing.numbers.length < 6) {
      editing.numbers.push(number);
      editing.numbers.sort((a, b) => a - b);
    } else {
      toast("번호는 6개만 선택할 수 있어요.");
      return;
    }
    renderEditTicket(index);
    return;
  }

  const saveButton = event.target.closest(".edit-save");
  if (saveButton) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const index = Number(saveButton.dataset.index);
    if (!editing || editing.index !== index || editing.numbers.length !== 6) {
      toast("번호 6개를 선택해 주세요.");
      return;
    }
    saved[index].numbers = [...editing.numbers];
    localStorage.setItem("lucky645-saved", JSON.stringify(saved));
    editing = null;
    mine();
    toast("조합을 수정했어요.");
    return;
  }

  if (event.target.closest(".delete")) return;
  const row = event.target.closest(".saved-row");
  if (!row) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const index = Number(row.dataset.i);
  const detail = row.querySelector(".my-details");
  row.classList.toggle("open");
  if (!row.classList.contains("open")) {
    editing = null;
    return;
  }
  editing = { index, numbers: [...saved[index].numbers] };
  detail.innerHTML = `<div class="editable-ticket" data-index="${index}"></div>${table(matches(editing.numbers), "역대 회차 번호 일치 기록", `이 조합의 6개 번호를 역대 ${draws.length}회 당첨번호와 비교한 결과입니다.`, false)}`;
  renderEditTicket(index);
}, { capture: true });
