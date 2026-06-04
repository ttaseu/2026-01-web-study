import json
import requests

def fetch_owtics_data():
    url = "https://api.owtics.gg/graphql"
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    }

    # 🌍 서버가 무조건 꽉 찬 데이터를 내려주는 검증된 아시아 서버 경쟁전 표준 쿼리입니다.
    payload = [
        {
            "operationName": "GetHeroesStatistics",
            "variables": {"heroesRatesOverviewInput": {"region": "ASIA", "mode": "COMPETITIVE", "tier": "ALL", "season": None}},
            "extensions": {"clientLibrary": {"name": "@apollo/client", "version": "4.1.6"}},
            "query": """query GetHeroesStatistics($heroesRatesOverviewInput: HeroesRatesOverviewInput!) {
              heroesRatesOverview(input: $heroesRatesOverviewInput) {
                result {
                  ... on HeroesRatesOverviewAvailable {
                    measurements {
                      hero {
                        name
                        role
                      }
                      winRate
                      pickRate
                    }
                  }
                }
              }
            }"""
        }
    ]

    try:
        print("🚀 [수집 가동] OWTICS.GG 표준 API 데이터 요청 시작...")
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()

        response_data = response.json()
        extracted_data = {
            "GetHeroesStatistics": response_data[0].get("data")
        }

        with open("owtics_raw_data.json", "w", encoding="utf-8") as f:
            json.dump(extracted_data, f, ensure_ascii=False, indent=4)

        print("\n✅ [수집 완료] 진짜 서버 스탯 데이터가 'owtics_raw_data.json'에 저장되었습니다!")

    except Exception as e:
        print(f"❌ 데이터 수집 중 에러 발생: {e}")

if __name__ == "__main__":
    fetch_owtics_data()