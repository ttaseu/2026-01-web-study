import json
import requests
import time

def fetch_owtics_data():
    url = "https://api.owtics.gg/graphql"
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    }

    map_list_payload = [{
        "operationName": "GetMapsList",
        "variables": {},
        "query": """query GetMapsList {
          maps {
            items {
              id
              slug
            }
          }
        }"""
    }]

    try:
        print("🗺️ OWTICS 서버에서 전장 고유 ID 목록을 조회하는 중...")
        res = requests.post(url, headers=headers, json=map_list_payload)
        res.raise_for_status()
        maps_items = res.json()[0].get("data", {}).get("maps", {}).get("items", [])
        
        if not maps_items:
            print("❌ 전장 ID 목록을 가져오지 못했습니다.")
            return

        # 🌍 오피셜 서버 실시간 수집 지역 (ALL 제거, 미국 규격 코드인 'NA' 바인딩)
        regions = ["ASIA", "NA", "EU"]
        tiers = ["ALL", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "MASTER", "CHAMPION"]
        
        all_matrix_data = {r: {t: {} for t in tiers} for r in regions}
        
        print(f"\n🚀 [3대 서버 파이프라인] {len(regions)}개 지역 x {len(tiers)}개 티어 데이터 수집 시작...")

        for reg in regions:
            print(f"\n🌍 [서버 지역: {reg}] 데이터 스캔 가동...")
            for target_tier in tiers:
                for idx, m_item in enumerate(maps_items):
                    m_id = m_item.get("id")
                    m_slug = m_item.get("slug")
                    if not m_id or not m_slug: continue
                    
                    map_hero_payload = [{
                        "operationName": "GetMapHeroRates",
                        "variables": {
                            "mapId": m_id,
                            "filter": {
                                "region": reg,
                                "mode": "COMPETITIVE",
                                "tier": target_tier
                            }
                        },
                        "query": """query GetMapHeroRates($mapId: ID!, $filter: MapHeroRatesFilterInput) {
                          node(id: $mapId) {
                            ... on Map {
                              heroRates(filter: $filter) {
                                result {
                                  ... on MapHeroRatesAvailable {
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
                            }
                          }
                        }"""
                    }]

                    map_res = requests.post(url, headers=headers, json=map_hero_payload)
                    if map_res.ok:
                        measurements = map_res.json()[0].get("data", {}).get("node", {}).get("heroRates", {}).get("result", {}).get("measurements", [])
                        all_matrix_data[reg][target_tier][m_slug] = measurements
                    time.sleep(0.04)

        with open("owtics_raw_data.json", "w", encoding="utf-8") as f:
            json.dump({"GetMapHeroRatesGlobalMatrix": all_matrix_data}, f, ensure_ascii=False, indent=4)
            
        print("\n✅ [수집 완료] 3대 서버 지역별 지표가 'owtics_raw_data.json'에 무사히 저장되었습니다!")

    except Exception as e:
        print(f"❌ 스크래핑 엔진 가동 중 에러 발생: {e}")

if __name__ == "__main__":
    fetch_owtics_data()