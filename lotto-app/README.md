# 로또6/45 데이터 수집기

동행복권 API를 직접 호출하지 않습니다. 공개 GitHub Pages 데이터의 전체 이력을 CSV로 저장하고, 이후 실행에서는 최신 회차 한 건만 가져옵니다.

## 실행

```bash
python3 lotto_history.py --file lotto645_history.csv --bootstrap
python3 lotto_history.py --file lotto645_history.csv
```

- 첫 명령: 전체 이력을 받아 CSV를 만듭니다.
- 두 번째 명령: 매주 추첨 이후 실행하면 최신 회차만 추가 또는 보정합니다.
- `--bootstrap`: 전체 데이터를 다시 받아 기존 파일과 병합합니다.

생성되는 CSV는 UTF-8 BOM 형식이라 Excel에서 한글 열 이름을 바로 열 수 있습니다.

## 검증 규칙

스크립트는 각 회차에서 번호 6개, 1~45 범위, 중복 여부, 보너스번호, 날짜 및 회차 연속성을 검사합니다. 데이터 제공처도 오류 가능성을 알리고 있으므로, 당첨 확인 또는 외부 공개 전에는 최근 회차를 [동행복권 로또6/45 결과](https://www.dhlottery.co.kr/lt645/result)와 대조하세요.

## 소스

[smok95/lotto](https://github.com/smok95/lotto)의 `all.json` 및 `latest.json`을 사용합니다. 해당 저장소는 1회부터 최신 회차까지의 JSON을 제공하지만 공식 데이터 제공처는 아닙니다.
