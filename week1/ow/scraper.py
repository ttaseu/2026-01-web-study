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

        # 🌍 오피셜 서버 실시간 수집 티어 세트 (그마챔 빈 통 방지를 위해 CHAMPION 규격 바인딩)
        tiers = ["ALL", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "MASTER", "CHAMPION"]
        all_tier_data = {t: {} for t in tiers}
        
        print(f"\n🚀 [다중 티어 파이프ライン] 총 {len(maps_items)}개 맵 데이터 수집 가동...")

        for target_tier in tiers:
            print(f"\n📊 [{target_tier}] 티어 데이터 요청 중...")
            for idx, m_item in enumerate(maps_items):
                m_id = m_item.get("id")
                m_slug = m_item.get("slug")
                if not m_id or not m_slug: continue
                
                map_hero_payload = [{
                    "operationName": "GetMapHeroRates",
                    "variables": {
                        "mapId": m_id,
                        "filter": {
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
                    all_tier_data[target_tier][m_slug] = measurements
                    print(f" -> {m_slug} ({idx+1}/{len(maps_items)}) 완료 - 데이터 {len(measurements)}개")
                else:
                    print(f" -> ❌ {m_slug} 수집 실패")
                
                time.sleep(0.06)

        with open("owtics_raw_data.json", "w", encoding="utf-8") as f:
            json.dump({"GetMapHeroRatesMultiTier": all_tier_data}, f, ensure_ascii=False, indent=4)
            
        print("\n✅ [수집 완료] 모든 티어별 최신 지표 원본이 'owtics_raw_data.json'에 저장되었습니다!")

    except Exception as e:
        print(f"❌ 스크래핑 엔진 가동 중 에러 발생: {e}")

if __name__ == "__main__":
    fetch_owtics_data()