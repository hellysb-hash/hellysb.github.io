import { readFile, writeFile } from "node:fs/promises";

const target = new URL("../winning-stores.js", import.meta.url);
const latestUrl = "https://raw.githubusercontent.com/smok95/lotto/main/results/latest.json";
const storeUrl = (round) => `https://raw.githubusercontent.com/smok95/lotto/main/winning-stores/${round}.json`;
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

async function main() {
  const current = parseCurrent(await readFile(target, "utf8"));
  current.rounds ||= {};
  const latest = await getJson(latestUrl);
  const latestRound = Number(latest.draw_no);
  const start = all || Object.keys(current.rounds).length === 0 ? 262 : Math.max(262, latestRound - 5);
  const rounds = Array.from({ length: latestRound - start + 1 }, (_, i) => start + i);

  for (const round of rounds) {
    try {
      const first = await getJson(storeUrl(round));
      const saved = current.rounds[String(round)] ||= { first: [], second: [] };
      saved.first = Array.isArray(first) ? first.map(({ name, address, combination, lat, lng }) => ({ name, address, combination, lat, lng })) : [];
      saved.second ||= [];
      console.log(`Updated ${round}: ${saved.first.length} first-prize stores`);
    } catch (error) {
      console.warn(`Kept existing ${round}: ${error.message}`);
    }
  }

  current.updatedAt = new Date().toISOString().slice(0, 10);
  current.source = "1등: smok95/lotto 공개 데이터. 2등: 별도 검증 데이터 추가 필요";
  const output = `window.WINNING_STORES = ${JSON.stringify(current, null, 2)};\n`;
  await writeFile(target, output, "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
