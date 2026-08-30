/* Supabase 데이터가 있으면 정적 파일보다 우선합니다. DB가 비어 있거나 연결이 실패하면 기존 앱 데이터를 유지합니다. */
(async function () {
  const config = window.LUCKY645_SUPABASE;
  if (!config?.url || !config?.publishableKey) return;

  const headers = {
    apikey: config.publishableKey,
    Authorization: `Bearer ${config.publishableKey}`
  };

  async function readAll(table, select, order = "round.asc") {
    const pageSize = 1000;
    const getPage = async (offset, count = false) => {
      const response = await fetch(
        `${config.url}/rest/v1/${table}?select=${encodeURIComponent(select)}&order=${encodeURIComponent(order)}&limit=${pageSize}&offset=${offset}`,
        { headers: count ? { ...headers, Prefer: "count=exact" } : headers, cache: "no-store" }
      );
      if (!response.ok) throw new Error(`${table}: ${response.status}`);
      return { rows: await response.json(), total: response.headers.get("content-range") };
    };
    const first = await getPage(0, true);
    const match = first.total?.match(/\/(\d+)$/);
    const total = match ? Number(match[1]) : first.rows.length;
    if (total <= pageSize) return first.rows;

    const pages = [];
    for (let offset = pageSize; offset < total; offset += pageSize) pages.push(offset);
    const remaining = [];
    for (let index = 0; index < pages.length; index += 6) {
      const batch = await Promise.all(pages.slice(index, index + 6).map(async (offset) => (await getPage(offset)).rows));
      remaining.push(...batch.flat());
    }
    return [...first.rows, ...remaining];
  }

  function drawFromRow(row) {
    const result = {
      회차: String(row.round),
      추첨일: String(row.draw_date || "").slice(0, 10),
      보너스: String(row.bonus),
      총판매액: String(row.total_sales || "")
    };
    (row.numbers || []).forEach((number, index) => { result[`번호${index + 1}`] = String(number); });
    (row.divisions || []).forEach((division, index) => {
      const rank = index + 1;
      result[`${rank}등당첨자수`] = String(division.winners || "");
      result[`${rank}등1인당당첨금`] = String(division.prize || "");
    });
    return result;
  }

  try {
    const rows = await readAll("lotto_draws", "round,draw_date,numbers,bonus,total_sales,divisions");
    if (rows.length) {
      const merged = new Map(draws.map((draw) => [String(draw.회차), draw]));
      rows.forEach((row) => merged.set(String(row.round), drawFromRow(row)));
      draws = [...merged.values()].sort((a, b) => Number(a.회차) - Number(b.회차));
      home(); history(); manual(); mine(); stores();
    }
  } catch (error) {
    console.info("Supabase 당첨번호를 아직 불러오지 못했습니다. 기존 데이터를 사용합니다.");
  }

  try {
    const rows = await readAll("winning_stores", "round,rank,name,address,combination");
    if (!rows.length) return;
    const rounds = {};
    rows.forEach((row) => {
      const round = String(row.round);
      const tier = Number(row.rank) === 2 ? "second" : "first";
      if (!rounds[round]) rounds[round] = { first: [], second: [] };
      rounds[round][tier].push({
        name: row.name,
        address: row.address || "",
        combination: row.combination || "구분 없음"
      });
    });
    window.WINNING_STORES = { updatedAt: new Date().toLocaleDateString("ko-KR"), source: "Supabase", rounds };
    stores();
  } catch (error) {
    console.info("Supabase 판매점 데이터를 아직 불러오지 못했습니다. 기존 데이터를 사용합니다.");
  }

  try {
    const retailers = await readAll("lotto_retailers", "name,address,latitude,longitude", "source_no.asc");
    window.NEARBY_RETAILERS = retailers;
    if (typeof showNearby === "function" && nearbyPosition) showNearby();
  } catch (error) {
    console.info("Supabase 전국 판매점 위치 데이터를 아직 불러오지 못했습니다.");
  }
})();
