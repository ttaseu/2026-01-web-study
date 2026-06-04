import json
import requests
import time

def fetch_owtics_data():
    url = "https://api.owtics.gg/graphql"
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    }

    # 1. 전장(Map) 고유 ID 및 슬러그 목록 조회
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

        # 🌍 오버워치 통계 사이트 전용 8대 티어 영문 코드 규격 목록
        tiers = ["ALL", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "MASTER", "GRANDMASTER"]
        
        # { 티어명: { 맵슬러그: [데이터] } } 구조로 빌드업
        all_tier_data = {t: {} for t in tiers}
        
        print(f"\n🚀 [전체 티어 파이프라인] 총 {len(maps_items)}개 맵 x {len(tiers)}개 티어 데이터 수집을 시작합니다...")

        for target_tier in tiers:
            print(f"\n📊 [{target_tier}] 티어 데이터 수집 중...")
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
                
                # 과도한 트래픽 요청 방지를 위한 미세한 디레이 매칭
                time.sleep(0.05)

        with open("owtics_raw_data.json", "w", encoding="utf-8") as f:
            json.dump({"GetMapHeroRatesMultiTier": all_tier_data}, f, ensure_ascii=False, indent=4)
            
        print("\n✅ [성공] 8개 모든 티어별 진짜 원본 데이터가 'owtics_raw_data.json'에 통합 완료되었습니다!")

    except Exception as e:
        print(f"❌ 스크래핑 가동 중 치명적 에러 발생: {e}")

if __name__ == "__main__":
    fetch_owtics_data()