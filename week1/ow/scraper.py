import json
import requests

def fetch_owtics_data():
    url = "https://api.owtics.gg/graphql"
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    }

    # 🗺️ 핵심 변경: 각 전장(Map)별 영웅들의 랭킹과 상세 지표(Win/Pick Rate)를 콕 집어 요청하는 쿼리입니다.
    payload = [
        {
            "operationName": "GetMapsTopPicks",
            "variables": {
                "input": {
                    "region": "ASIA",
                    "mode": "COMPETITIVE",
                    "limit": 10  # 넉넉하게 상위 10명씩 데이터 수집
                }
            },
            "extensions": {"clientLibrary": {"name": "@apollo/client", "version": "4.1.6"}},
            "query": """query GetMapsTopPicks($input: MapsTopPicksInput!) {
              mapsTopPicks(input: $input) {
                __typename
                ... on MapsTopPicksAvailable {
                  lastUpdatedAt
                  entries {
                    rank
                    map {
                      id
                      name
                      slug
                      mode
                    }
                    topByRole {
                      role
                      measurement {
                        pickRate
                        winRate
                        hero {
                          id
                          name
                          role
                        }
                      }
                    }
                  }
                }
                ... on MapsTopPicksUnavailable {
                  reason
                }
              }
            }"""
        }
    ]

    try:
        print("🚀 OWTICS.GG API에서 전장(Map)별 실제 메타 데이터를 요청하는 중...")
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()

        response_data = response.json()
        
        extracted_data = {
            "GetMapsTopPicks": response_data[0].get("data")
        }

        output_filename = "owtics_raw_data.json"
        with open(output_filename, "w", encoding="utf-8") as f:
            json.dump(extracted_data, f, ensure_ascii=False, indent=4)

        print(f"\n✅ [수집 완료] 진짜 맵별 데이터가 '{output_filename}'에 저장되었습니다!")

    except requests.exceptions.RequestException as re:
        print(f"❌ 네트워크 요청 에러 발생: {re}")

if __name__ == "__main__":
    fetch_owtics_data()