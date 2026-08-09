#!/usr/bin/env python3
"""로또6/45 이력 CSV를 내려받고, 이후 최신 회차만 갱신한다.

데이터 소스: https://smok95.github.io/lotto/
당첨 여부 확인에는 반드시 동행복권 공식 결과를 사용하세요.
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from datetime import datetime
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

SOURCE_BASE = "https://smok95.github.io/lotto/results"
FIELDS = [
    "회차", "추첨일", "번호1", "번호2", "번호3", "번호4", "번호5", "번호6", "보너스",
    "총판매액",
    "1등당첨자수", "1등1인당당첨금", "2등당첨자수", "2등1인당당첨금",
    "3등당첨자수", "3등1인당당첨금", "4등당첨자수", "4등1인당당첨금",
    "5등당첨자수", "5등1인당당첨금",
]


def fetch_json(url: str) -> object:
    request = Request(url, headers={"User-Agent": "lotto-history-personal-use/1.0"})
    try:
        with urlopen(request, timeout=20) as response:
            return json.load(response)
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise RuntimeError(f"데이터를 가져오지 못했습니다: {url} ({exc})") from exc


def normalize(item: dict) -> dict:
    numbers = item.get("numbers")
    if not isinstance(numbers, list) or len(numbers) != 6:
        raise ValueError(f"{item.get('draw_no')}회: 번호가 6개가 아닙니다.")
    if len(set(numbers)) != 6 or any(not isinstance(n, int) or not 1 <= n <= 45 for n in numbers):
        raise ValueError(f"{item.get('draw_no')}회: 당첨번호 범위 또는 중복 오류")
    bonus = item.get("bonus_no")
    if not isinstance(bonus, int) or not 1 <= bonus <= 45 or bonus in numbers:
        raise ValueError(f"{item.get('draw_no')}회: 보너스번호 오류")
    draw_no = item.get("draw_no")
    if not isinstance(draw_no, int) or draw_no < 1:
        raise ValueError("유효하지 않은 회차입니다.")

    divisions = item.get("divisions") or []
    if len(divisions) != 5:
        raise ValueError(f"{draw_no}회: 등수별 당첨 데이터가 5개가 아닙니다.")
    date = str(item.get("date", ""))[:10]
    datetime.strptime(date, "%Y-%m-%d")
    return {
        "회차": draw_no,
        "추첨일": date,
        **{f"번호{i}": numbers[i - 1] for i in range(1, 7)},
        "보너스": bonus,
        "총판매액": item.get("total_sales_amount", ""),
        **{
            f"{rank}등{key}": divisions[rank - 1].get(source_key, "")
            for rank in range(1, 6)
            for key, source_key in (("당첨자수", "winners"), ("1인당당첨금", "prize"))
        },
    }


def read_csv(path: Path) -> dict[int, dict]:
    if not path.exists():
        return {}
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        if reader.fieldnames != FIELDS:
            raise ValueError(f"CSV 헤더가 예상과 다릅니다: {path}")
        return {int(row["회차"]): row for row in reader}


def write_csv(path: Path, rows: dict[int, dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(rows[no] for no in sorted(rows))


def main() -> None:
    parser = argparse.ArgumentParser(description="로또6/45 이력 CSV 초기화·갱신")
    parser.add_argument("--file", default="lotto645_history.csv", help="저장할 CSV 경로")
    parser.add_argument("--bootstrap", action="store_true", help="전체 이력을 다시 내려받아 병합")
    args = parser.parse_args()
    output = Path(args.file)
    # 전체 재수집에서는 과거 CSV의 열 구성이 달라도 새 스키마로 안전하게 다시 만듭니다.
    existing = {} if args.bootstrap else read_csv(output)

    if args.bootstrap or not existing:
        data = fetch_json(f"{SOURCE_BASE}/all.json")
        if not isinstance(data, list):
            raise RuntimeError("전체 데이터 형식이 올바르지 않습니다.")
        incoming = {row["회차"]: row for row in map(normalize, data)}
        action = "초기화"
    else:
        data = fetch_json(f"{SOURCE_BASE}/latest.json")
        if not isinstance(data, dict):
            raise RuntimeError("최신 데이터 형식이 올바르지 않습니다.")
        row = normalize(data)
        incoming = {row["회차"]: row}
        action = "갱신"

    changed = 0
    for draw_no, row in incoming.items():
        previous = existing.get(draw_no)
        same = previous is not None and all(str(previous[field]) == str(row[field]) for field in FIELDS)
        if not same:
            existing[draw_no] = row
            changed += 1
    if not existing:
        raise RuntimeError("저장할 데이터가 없습니다.")
    rounds = sorted(existing)
    missing = [n for n in range(rounds[0], rounds[-1] + 1) if n not in existing]
    if missing:
        raise RuntimeError(f"회차가 비어 있습니다: {missing[:10]}")
    write_csv(output, existing)
    print(f"{action} 완료: {output} | 총 {len(existing)}회 | 변경 {changed}건 | 최신 {rounds[-1]}회")


if __name__ == "__main__":
    try:
        main()
    except (RuntimeError, ValueError) as exc:
        print(f"오류: {exc}", file=sys.stderr)
        raise SystemExit(1)
