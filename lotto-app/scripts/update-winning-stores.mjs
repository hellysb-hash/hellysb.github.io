import { readFile, writeFile } from "node:fs/promises";

const target = new URL("../winning-stores.js", import.meta.url);
const latestUrl = "https://raw.githubusercontent.com/smok95/lotto/main/results/latest.json";
const storeUrl = (round) => `https://raw.githubusercontent.com/smok95/lotto/main/winning-stores/${round}.json`;
const officialStoreUrl = (round) => `https://www.dhlottery.co.kr/store.do?method=topStore&drwNo=${round}&pageGubun=L645`;
const all = process.argv.includes("--all");
const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function parseCurrent(source) {
  const json = source.replace(/^window\.WINNING_STORES\s*=\s*/, "").replace(/;\s*$/, "");
  return JSON.parse(json);
}

async function getJson(url) {
  const response = await fetch(url, { headers: { "User-Agent": "Lucky645-GitHub-Update/1.0" } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

async function getText(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Lucky645-GitHub-Update/1.0 (weekly public result update)",
      "Accept-Language": "ko-KR,ko;q=0.9"
    }
  });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  const body = await response.arrayBuffer();
  const utf8 = new TextDecoder("utf-8").decode(body);
  // The legacy winning-store page is commonly served in EUC-KR.
  // Decode it again when the Korean heading could not be read as UTF-8.
  return /2\s*등|당첨\s*(?:판매점|배출점)/.test(utf8)
    ? utf8
    : new TextDecoder("euc-kr").decode(body);
}

function textOnly(value) {
  return value
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function extractSecondPrizeStores(html) {
  const heading = /2\s*등\s*(?:당첨\s*)?(?:배출\s*)?(?:판매점|점)/i.exec(html);
  if (!heading) return [];
  const section = html.slice(heading.index, heading.index + 180000);
  const rows = [...section.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)];
  const stores = [];

  for (const row of rows) {
    const cells = [...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map((cell) => textOnly(cell[1]));
    if (cells.length < 3 || !/^\d+$/.test(cells[0])) continue;
    const values = cells.slice(1).filter((cell) => cell && !/지도보기|상세보기|위치보기/.test(cell));
    const name = values[0];
    const combination = values.find((cell) => /자동|수동|반자동/.test(cell)) || "";
    const address = values.find((cell) => /(?:시|도|군|구|읍|면|동|로|길)/.test(cell) && cell !== name) || values.at(-1) || "";
    if (name && address && !/상호|판매점명/.test(name)) stores.push({ name, address, combination });
  }

  return [...new Map(stores.map((store) => [`${store.name}|${store.address}|${store.combination}`, store])).values()];
}

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function supabaseRequest(path, options = {}) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  if (!response.ok) throw new Error(`Supabase ${response.status}: ${await response.text()}`);
  return response;
}

async function syncLatestToSupabase(latest, firstStores) {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("GitHub Secrets에 SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 없습니다.");
  }

  const round = Number(latest.draw_no);
  const draw = {
    round,
    draw_date: String(latest.date).slice(0, 10),
    numbers: latest.numbers.map(Number),
    bonus: Number(latest.bonus_no),
    total_sales: latest.total_sales_amount ? Number(latest.total_sales_amount) : null,
    divisions: latest.divisions || []
  };

  await supabaseRequest("lotto_draws?on_conflict=round", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify(draw)
  });

  // 최신 1등 판매점은 매주 전체 교체해 중복 누적을 막습니다.
  await supabaseRequest(`winning_stores?round=eq.${round}&rank=eq.1`, { method: "DELETE" });
  if (firstStores.length) {
    const rows = firstStores.map((store) => ({
      round,
      rank: 1,
      name: store.name,
      address: store.address || null,
      combination: store.combination || null
    }));
    await supabaseRequest("winning_stores", { method: "POST", body: JSON.stringify(rows) });
  }
  console.log(`Synced ${round} to Supabase: 1 draw, ${firstStores.length} first-prize stores`);
}

async function main() {
  const current = parseCurrent(await readFile(target, "utf8"));
  current.rounds ||= {};
  const latest = await getJson(latestUrl);
  const latestRound = Number(latest.draw_no);
  const start = all || Object.keys(current.rounds).length === 0 ? 262 : Math.max(262, latestRound - 5);
  const rounds = Array.from({ length: latestRound - start + 1 }, (_, i) => start + i);
  const secondPrizeRounds = new Set(rounds.slice(-6));
  let latestFirstStores = null;

  for (const round of rounds) {
    try {
      const first = await getJson(storeUrl(round));
      const saved = current.rounds[String(round)] ||= { first: [], second: [] };
      saved.first = Array.isArray(first) ? first.map(({ name, address, combination, lat, lng }) => ({ name, address, combination, lat, lng })) : [];
      if (round === latestRound) latestFirstStores = saved.first;
      console.log(`Updated ${round}: ${saved.first.length} first-prize stores`);
    } catch (error) {
      console.warn(`Kept existing ${round}: ${error.message}`);
    }

    if (secondPrizeRounds.has(round)) {
      try {
        const officialHtml = await getText(officialStoreUrl(round));
        const second = extractSecondPrizeStores(officialHtml);
        if (second.length) {
          const saved = current.rounds[String(round)] ||= { first: [], second: [] };
          saved.second = second;
          console.log(`Updated ${round}: ${second.length} second-prize stores`);
        } else {
          console.warn(`No second-prize rows found for ${round}; kept existing data`);
        }
      } catch (error) {
        console.warn(`Kept existing second-prize data for ${round}: ${error.message}`);
      }

      await wait(1200);
    }
  }

  current.updatedAt = new Date().toISOString().slice(0, 10);
  current.source = "1등: smok95/lotto 공개 데이터. 2등: 동행복권 회차별 당첨판매점 공개 페이지를 주 1회 수집";
  const output = `window.WINNING_STORES = ${JSON.stringify(current, null, 2)};\n`;
  await writeFile(target, output, "utf8");

  if (latestFirstStores === null) {
    throw new Error(`${latestRound}회 1등 판매점 데이터를 받지 못해 Supabase 업데이트를 중단했습니다.`);
  }
  await syncLatestToSupabase(latest, latestFirstStores);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
