function scopedDrawMatches(round, range) {
  const target = new Set([1, 2, 3, 4, 5, 6].map((i) => Number(round[`번호${i}`])));
  const prior = draws.filter((row) => Number(row.회차) < Number(round.회차));
  const source = range === "all" ? prior : prior.slice(-Number(range));
  return source.map((row) => {
    const hits = [1, 2, 3, 4, 5, 6].filter((i) => target.has(Number(row[`번호${i}`]))).length;
    const bonus = target.has(Number(row.보너스));
    const rank = hits === 6 ? "1등" : hits === 5 && bonus ? "2등" : hits === 5 ? "3등" : hits === 4 ? "4등" : hits === 3 ? "5등" : "";
    return rank ? { r: row, rank } : null;
  }).filter(Boolean);
}

function historyRangePanel(round, range = "all") {
  const matchesInRange = scopedDrawMatches(round, range);
  const counts = [1, 2, 3, 4, 5].map((rank) => matchesInRange.filter((match) => match.rank === `${rank}등`).length);
  const label = range === "all" ? "전체 과거회차" : `최근 ${range}회차`;
  return `<div class="range-tabs"><button onclick="setHistoryRange(50)" class="${range === 50 ? 'active' : ''}">최근 50회차</button><button onclick="setHistoryRange(100)" class="${range === 100 ? 'active' : ''}">최근 100회차</button><button onclick="setHistoryRange('all')" class="${range === 'all' ? 'active' : ''}">전체회차</button></div><p class="compare-title">과거 회차 번호 일치 기록</p><p class="note">${label} 범위에서 제 ${round.회차}회 번호와 비교한 결과입니다.</p><table class="compare"><tr><th>등수</th><th>일치 조건</th><th>나온 횟수</th></tr>${[['1등','6개'],['2등','5개 + 보너스'],['3등','5개'],['4등','4개'],['5등','3개']].map((row,index) => `<tr><td>${row[0]}</td><td>${row[1]}</td><td>${counts[index]}회</td></tr>`).join('')}<tr><td>전체</td><td>3개 이상 일치</td><td>${matchesInRange.length}회</td></tr></table><div class="matches"><p class="compare-title">일치 당첨회차 · 당첨번호</p>${matchesInRange.length ? matchesInRange.slice().reverse().map((match) => `<div class="match"><div class="match-head"><span><b class="match-rank">${match.rank}</b> · 제 ${match.r.회차}회</span><span>${match.r.추첨일}</span></div>${balls(match.r)}</div>`).join('') : '<p class="note">이 범위에서 3개 이상 일치한 회차가 없습니다.</p>'}</div>`;
}

function setHistoryRange(range) {
  const content = document.getElementById("drawDetailContent");
  const round = draws.find((row) => String(row.회차) === content.dataset.round);
  document.querySelector(".detail-compare").innerHTML = historyRangePanel(round, range);
}

function openDrawDetail(round) {
  document.getElementById("drawDetailContent").dataset.round = round.회차;
  document.getElementById("drawDetailContent").innerHTML = `${drawNavigator(round)}<h1>제 ${round.회차}회 당첨결과</h1><p class="subtitle">${round.추첨일} 추첨</p><div class="detail-hero"><div class="label">당첨번호</div><div class="detail-date">보너스 번호를 포함한 추첨 결과입니다.</div>${balls(round)}</div><h2>등수별 당첨 결과</h2><div class="prizes">${[1, 2, 3, 4, 5].map((rank) => `<div class="prize"><span class="rank">${rank}등</span><div><div class="label">${['6개 일치','5개 + 보너스','5개 일치','4개 일치','3개 일치'][rank - 1]}</div><b>${Number(round[`${rank}등당첨자수`]).toLocaleString()}명</b></div><div class="amount"><div class="label">1인당 당첨금</div>${money(round[`${rank}등1인당당첨금`])}</div></div>`).join('')}</div><div class="detail-compare">${historyRangePanel(round)}</div>`;
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("active", view.id === "drawDetail"));
  document.querySelectorAll(".nav").forEach((nav) => nav.classList.toggle("active", nav.dataset.view === "history"));
  window.scrollTo(0, 0);
}

function scopedManualMatches(numbers, range) {
  const target = new Set(numbers.map(Number));
  const source = range === "all" ? draws : draws.slice(-Number(range));
  return source.map((row) => {
    const hits = [1, 2, 3, 4, 5, 6].filter((i) => target.has(Number(row[`번호${i}`]))).length;
    const bonus = target.has(Number(row.보너스));
    const rank = hits === 6 ? "1등" : hits === 5 && bonus ? "2등" : hits === 5 ? "3등" : hits === 4 ? "4등" : hits === 3 ? "5등" : "";
    return rank ? { row, rank } : null;
  }).filter(Boolean);
}

function myRangePanel(range = "all") {
  const matchesInRange = scopedManualMatches(editing.numbers, range);
  const counts = [1, 2, 3, 4, 5].map((rank) => matchesInRange.filter((match) => match.rank === `${rank}등`).length);
  const label = range === "all" ? "전체회차" : `최근 ${range}회차`;
  return `<div class="range-tabs"><button onclick="setMyRange(50)" class="${range === 50 ? 'active' : ''}">최근 50회차</button><button onclick="setMyRange(100)" class="${range === 100 ? 'active' : ''}">최근 100회차</button><button onclick="setMyRange('all')" class="${range === 'all' ? 'active' : ''}">전체회차</button></div><p class="compare-title">역대 회차 번호 일치 기록</p><p class="note">${label} 범위에서 이 조합의 6개 번호와 비교한 결과입니다.</p><table class="compare"><tr><th>등수</th><th>일치 조건</th><th>나온 횟수</th></tr>${[['1등','6개'],['2등','5개 + 보너스'],['3등','5개'],['4등','4개'],['5등','3개']].map((row,index) => `<tr><td>${row[0]}</td><td>${row[1]}</td><td>${counts[index]}회</td></tr>`).join('')}<tr><td>전체</td><td>3개 이상 일치</td><td>${matchesInRange.length}회</td></tr></table>`;
}

function refreshMyAnalysis(range = "all") {
  const box = document.getElementById("myDetailAnalysis");
  if (box && editing) box.innerHTML = myRangePanel(range);
}

function setMyRange(range) {
  refreshMyAnalysis(range);
}
