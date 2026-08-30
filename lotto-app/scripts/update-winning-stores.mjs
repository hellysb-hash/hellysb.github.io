import { readFile, writeFile } from "node:fs/promises";

const target = new URL("../winning-stores.js", import.meta.url);
const latestUrl = "https://raw.githubusercontent.com/smok95/lotto/main/results/latest.json";
const storeUrl = (round) => `https://raw.githubusercontent.com/smok95/lotto/main/winning-stores/${round}.json`;
const officialStoreUrl = (round) => `https://www.dhlottery.co.kr/store.do?method=topStore&drwNo=${round}&pageGubun=L645`;
const all = process.argv.includes("--all");

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
  return response.text();
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

async function main() {
  const current = parseCurrent(await readFile(target, "utf8"));
  current.rounds ||= {};
  const latest = await getJson(latestUrl);
  const latestRound = Number(latest.draw_no);
  const start = all || Object.keys(current.rounds).length === 0 ? 262 : Math.max(262, latestRound - 5);
  const rounds = Array.from({ length: latestRound - start + 1 }, (_, i) => start + i);
  const secondPrizeRounds = new Set(rounds.slice(-6));

  for (const round of rounds) {
    try {
      const first = await getJson(storeUrl(round));
      const saved = current.rounds[String(round)] ||= { first: [], second: [] };
      saved.first = Array.isArray(first) ? first.map(({ name, address, combination, lat, lng }) => ({ name, address, combination, lat, lng })) : [];
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
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
