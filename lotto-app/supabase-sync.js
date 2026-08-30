/* 시작 화면은 가볍게, 큰 데이터는 필요한 탭에서만 불러옵니다. */
(async function () {
  const config = window.LUCKY645_SUPABASE;
  if (!config?.url || !config?.publishableKey) return;

  const headers = { apikey: config.publishableKey, Authorization: `Bearer ${config.publishableKey}` };
  const cachePrefix = "lucky645-supabase-";
  const cacheRead = (name, maxAge) => {
    try {
      const saved = JSON.parse(localStorage.getItem(cachePrefix + name));
      return saved && Date.now() - saved.savedAt < maxAge ? saved.value : null;
    } catch (_) { return null; }
  };
  const cacheWrite = (name, value) => {
    try { localStorage.setItem(cachePrefix + name, JSON.stringify({ savedAt: Date.now(), value })); } catch (_) {}
  };

  async function getRows(table, select, order, offset = 0, limit = 1000, count = false) {
    const response = await fetch(
      `${config.url}/rest/v1/${table}?select=${encodeURIComponent(select)}&order=${encodeURIComponent(order)}&limit=${limit}&offset=${offset}`,
      { headers: count ? { ...headers, Prefer: "count=exact" } : headers, cache: "no-store" }
    );
    if (!response.ok) throw new Error(`${table}: ${response.status}`);
    return { rows: await response.json(), contentRange: response.headers.get("content-range") };
  }

  async function getAllRows(table, select, order) {
    const pageSize = 1000;
    const first = await getRows(table, select, order, 0, pageSize, true);
    const total = Number(first.contentRange?.match(/\/(\d+)$/)?.[1] || first.rows.length);
    if (total <= pageSize) return first.rows;
    const offsets = [];
    for (let offset = pageSize; offset < total; offset += pageSize) offsets.push(offset);
    const pages = [];
    for (let index = 0; index < offsets.length; index += 6) {
      const batch = await Promise.all(offsets.slice(index, index + 6).map(async (offset) => (await getRows(table, select, order, offset, pageSize)).rows));
      pages.push(...batch.flat());
    }
    return [...first.rows, ...pages];
  }

  function drawFromRow(row) {
    const result = { 회차: String(row.round), 추첨일: String(row.draw_date || "").slice(0, 10), 보너스: String(row.bonus), 총판매액: String(row.total_sales || "") };
    (row.numbers || []).forEach((number, index) => { result[`번호${index + 1}`] = String(number); });
    (row.divisions || []).forEach((division, index) => {
      const rank = index + 1;
      result[`${rank}등당첨자수`] = String(division.winners || "");
      result[`${rank}등1인당당첨금`] = String(division.prize || "");
    });
    return result;
  }

  function applyDraws(rows) {
    if (!rows?.length) return;
    const merged = new Map(draws.map((draw) => [String(draw.회차), draw]));
    rows.forEach((row) => merged.set(String(row.round), drawFromRow(row)));
    draws = [...merged.values()].sort((a, b) => Number(a.회차) - Number(b.회차));
    /* 보이지 않는 화면까지 한꺼번에 다시 만들면 휴대폰 터치가 끊길 수 있습니다. */
    const activeView = document.querySelector('.view.active')?.id;
    if (activeView === "history") history();
    else if (activeView === "manual") manual();
    else if (activeView === "mine") mine();
    else if (activeView === "stores") stores();
    else home();
  }

  function applyWinningStores(rows) {
    if (!rows?.length) return;
    const rounds = {};
    rows.forEach((row) => {
      const round = String(row.round);
      const tier = Number(row.rank) === 2 ? "second" : "first";
      if (!rounds[round]) rounds[round] = { first: [], second: [] };
      rounds[round][tier].push({ name: row.name, address: row.address || "", combination: row.combination || "구분 없음" });
    });
    window.WINNING_STORES = { updatedAt: new Date().toLocaleDateString("ko-KR"), source: "Supabase", rounds };
    stores();
  }

  let winningStoresLoading = null;
  window.loadWinningStores = async function () {
    if (winningStoresLoading) return winningStoresLoading;
    winningStoresLoading = (async () => {
      const cached = cacheRead("winning-stores-v1", 24 * 60 * 60 * 1000);
      if (cached) applyWinningStores(cached);
      try {
        const rows = await getAllRows("winning_stores", "round,rank,name,address,combination", "round.asc");
        applyWinningStores(rows);
        cacheWrite("winning-stores-v1", rows);
      } catch (_) { console.info("Supabase 당첨판매점 데이터를 아직 불러오지 못했습니다."); }
    })();
    return winningStoresLoading;
  };

  let retailersLoading = null;
  window.loadNearbyRetailers = async function () {
    if (window.NEARBY_RETAILERS?.length) return window.NEARBY_RETAILERS;
    if (retailersLoading) return retailersLoading;
    retailersLoading = (async () => {
      try {
        const retailers = await getAllRows("lotto_retailers", "name,address,latitude,longitude", "source_no.asc");
        const normalizeName = (value) => String(value || "").toLowerCase().replace(/[\s·ㆍ()\-]/g, "");
        const baseAddress = (value) => {
          const parts = String(value || "").replace(/\([^)]*\)/g, " ").trim().split(/\s+/);
          const building = parts.findIndex((part) => /^\d+(?:-\d+)?$/.test(part));
          return parts.slice(0, building >= 0 ? building + 1 : Math.min(parts.length, 5)).join("").toLowerCase();
        };
        const known = new Set();
        window.NEARBY_RETAILERS = retailers.filter((retailer) => {
          const key = `${normalizeName(retailer.name)}|${baseAddress(retailer.address)}`;
          if (known.has(key)) return false;
          known.add(key);
          return true;
        });
        if (typeof showNearby === "function" && nearbyPosition) showNearby();
        return window.NEARBY_RETAILERS;
      } catch (_) {
        console.info("Supabase 전국 판매점 위치 데이터를 아직 불러오지 못했습니다.");
        return [];
      }
    })();
    return retailersLoading;
  };

  /* 첫 화면을 먼저 조작할 수 있게 한 뒤 최신 회차를 가볍게 반영합니다. */
  setTimeout(async () => {
    try {
      const latest = await getRows("lotto_draws", "round,draw_date,numbers,bonus,total_sales,divisions", "round.desc", 0, 12);
      applyDraws(latest.rows);
    } catch (_) { console.info("Supabase 최신 당첨번호를 아직 불러오지 못했습니다."); }
  }, 1200);

  /* 무거운 데이터는 사용자가 해당 화면을 열었을 때 시작합니다. */
  document.addEventListener("click", (event) => {
    if (event.target.closest('.nav[data-view="stores"]')) window.loadWinningStores();
    if (event.target.closest("#nearbyOpen, #nearbyLocate, #nearbyRefresh")) window.loadNearbyRetailers();
  }, true);
})();
